"use client";

import { useState, useCallback, useRef } from "react";
import {
  loadImage,
  getImageData,
  processImage,
  imageDataToCanvas,
  exportToPNG,
  generateThumbnail,
} from "../lib/imageProcessing";
import {
  applyAllAdjustments,
  cloneImageData,
  type AdjustmentValues,
} from "../lib/imageAdjustments";
import { applyFilter, type FilterType } from "../lib/imageFilters";
import {
  createAndDownloadZip,
  generateZipFilename,
  generateStickerFilename,
  type ZipItem,
} from "../lib/zipExport";

export interface BatchImageItem {
  id: string;
  file: File;
  processedImageData: ImageData | null;
  thumbnailDataUrl: string | null;
  status: "pending" | "loading" | "ready" | "error";
  error?: string;
}

export interface BatchProcessingState {
  isProcessing: boolean;
  current: number;
  total: number;
  phase: "idle" | "loading" | "applying" | "compressing";
}

export interface BatchEditorState {
  items: BatchImageItem[];
  adjustments: AdjustmentValues;
  activeFilter: FilterType | null;
  blurRadius: number;
  processing: BatchProcessingState;
  selectedItemId: string | null;
}

const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  sharpness: 1.0,
};

const DEFAULT_PROCESSING: BatchProcessingState = {
  isProcessing: false,
  current: 0,
  total: 0,
  phase: "idle",
};

function generateId(): string {
  return crypto.randomUUID();
}

export function useBatchImageEditor() {
  const [state, setState] = useState<BatchEditorState>({
    items: [],
    adjustments: DEFAULT_ADJUSTMENTS,
    activeFilter: null,
    blurRadius: 3,
    processing: DEFAULT_PROCESSING,
    selectedItemId: null,
  });

  const processingRef = useRef(false);

  const loadFiles = useCallback(async (files: File[]) => {
    if (processingRef.current || files.length === 0) return;
    processingRef.current = true;

    const pngFiles = files.filter((f) => f.type === "image/png");
    if (pngFiles.length === 0) {
      processingRef.current = false;
      return;
    }

    const newItems: BatchImageItem[] = pngFiles.map((file) => ({
      id: generateId(),
      file,
      processedImageData: null,
      thumbnailDataUrl: null,
      status: "pending" as const,
    }));

    setState((s) => ({
      ...s,
      items: [...s.items, ...newItems],
      processing: {
        ...s.processing,
        isProcessing: true,
        current: 0,
        total: newItems.length,
        phase: "loading",
      },
    }));

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];

      setState((s) => ({
        ...s,
        items: s.items.map((it) =>
          it.id === item.id ? { ...it, status: "loading" as const } : it
        ),
        processing: { ...s.processing, current: i + 1 },
      }));

      try {
        const img = await loadImage(item.file);
        const imageData = getImageData(img);
        const processed = processImage(imageData);
        const thumbnail = generateThumbnail(processed);

        setState((s) => ({
          ...s,
          items: s.items.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  processedImageData: processed,
                  thumbnailDataUrl: thumbnail,
                  status: "ready" as const,
                }
              : it
          ),
          selectedItemId: s.selectedItemId ?? item.id,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Failed to load",
                }
              : it
          ),
        }));
      }

      // Yield to UI
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    setState((s) => ({
      ...s,
      processing: DEFAULT_PROCESSING,
    }));

    processingRef.current = false;
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((s) => {
      const newItems = s.items.filter((it) => it.id !== id);
      let newSelectedId = s.selectedItemId;

      if (s.selectedItemId === id) {
        newSelectedId = newItems.length > 0 ? newItems[0].id : null;
      }

      return {
        ...s,
        items: newItems,
        selectedItemId: newSelectedId,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState((s) => ({
      ...s,
      items: [],
      selectedItemId: null,
      adjustments: DEFAULT_ADJUSTMENTS,
      activeFilter: null,
      blurRadius: 3,
    }));
  }, []);

  const setAdjustment = useCallback(
    (key: keyof AdjustmentValues, value: number) => {
      setState((s) => ({
        ...s,
        adjustments: { ...s.adjustments, [key]: value },
      }));
    },
    []
  );

  const setFilter = useCallback((filter: FilterType | null) => {
    setState((s) => ({
      ...s,
      activeFilter: s.activeFilter === filter ? null : filter,
    }));
  }, []);

  const setBlurRadius = useCallback((radius: number) => {
    setState((s) => ({
      ...s,
      blurRadius: radius,
    }));
  }, []);

  const setSelectedItem = useCallback((id: string | null) => {
    setState((s) => ({
      ...s,
      selectedItemId: id,
    }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      adjustments: DEFAULT_ADJUSTMENTS,
      activeFilter: null,
      blurRadius: 3,
    }));
  }, []);

  const processAndDownloadZip = useCallback(async () => {
    const readyItems = state.items.filter(
      (it) => it.status === "ready" && it.processedImageData
    );

    if (readyItems.length === 0 || processingRef.current) return;
    processingRef.current = true;

    setState((s) => ({
      ...s,
      processing: {
        isProcessing: true,
        current: 0,
        total: readyItems.length,
        phase: "applying",
      },
    }));

    const zipItems: ZipItem[] = [];

    for (let i = 0; i < readyItems.length; i++) {
      const item = readyItems[i];

      setState((s) => ({
        ...s,
        processing: { ...s.processing, current: i + 1 },
      }));

      if (!item.processedImageData) continue;

      // Apply adjustments and filter
      let finalData = cloneImageData(item.processedImageData);
      finalData = applyAllAdjustments(finalData, state.adjustments);

      if (state.activeFilter) {
        finalData = applyFilter(finalData, state.activeFilter, {
          blurRadius: state.blurRadius,
        });
      }

      zipItems.push({
        filename: generateStickerFilename(item.file.name),
        imageData: finalData,
      });

      // Yield to UI
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    setState((s) => ({
      ...s,
      processing: { ...s.processing, phase: "compressing" },
    }));

    await createAndDownloadZip(zipItems, generateZipFilename());

    setState((s) => ({
      ...s,
      processing: DEFAULT_PROCESSING,
    }));

    processingRef.current = false;
  }, [state.items, state.adjustments, state.activeFilter, state.blurRadius]);

  const getSelectedItem = useCallback((): BatchImageItem | null => {
    return state.items.find((it) => it.id === state.selectedItemId) ?? null;
  }, [state.items, state.selectedItemId]);

  const getSelectedIndex = useCallback((): number => {
    return state.items.findIndex((it) => it.id === state.selectedItemId);
  }, [state.items, state.selectedItemId]);

  const navigateSelection = useCallback(
    (direction: "prev" | "next") => {
      const currentIndex = getSelectedIndex();
      if (currentIndex === -1 || state.items.length <= 1) return;

      let newIndex: number;
      if (direction === "prev") {
        newIndex = currentIndex === 0 ? state.items.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === state.items.length - 1 ? 0 : currentIndex + 1;
      }

      setState((s) => ({
        ...s,
        selectedItemId: s.items[newIndex].id,
      }));
    },
    [getSelectedIndex, state.items.length]
  );

  const getDisplayImageData = useCallback((): ImageData | null => {
    const selectedItem = getSelectedItem();
    if (!selectedItem?.processedImageData) return null;

    let result = cloneImageData(selectedItem.processedImageData);
    result = applyAllAdjustments(result, state.adjustments);

    if (state.activeFilter) {
      result = applyFilter(result, state.activeFilter, {
        blurRadius: state.blurRadius,
      });
    }

    return result;
  }, [
    getSelectedItem,
    state.adjustments,
    state.activeFilter,
    state.blurRadius,
  ]);

  return {
    state,
    loadFiles,
    removeItem,
    clearAll,
    setAdjustment,
    setFilter,
    setBlurRadius,
    setSelectedItem,
    reset,
    processAndDownloadZip,
    getSelectedItem,
    getSelectedIndex,
    navigateSelection,
    getDisplayImageData,
  };
}
