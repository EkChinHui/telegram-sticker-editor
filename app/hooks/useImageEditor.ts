"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  loadImage,
  getImageData,
  processImage,
  imageDataToCanvas,
  exportToPNG,
  downloadBlob,
} from "../lib/imageProcessing";
import {
  applyAllAdjustments,
  cloneImageData,
  type AdjustmentValues,
} from "../lib/imageAdjustments";
import { applyFilter, type FilterType } from "../lib/imageFilters";

export interface EditorState {
  originalFile: File | null;
  originalImageData: ImageData | null;
  processedImageData: ImageData | null;
  displayImageData: ImageData | null;
  isProcessing: boolean;
  error: string | null;
  adjustments: AdjustmentValues;
  activeFilter: FilterType | null;
  blurRadius: number;
  showOriginal: boolean;
}

const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  sharpness: 1.0,
};

export function useImageEditor() {
  const [state, setState] = useState<EditorState>({
    originalFile: null,
    originalImageData: null,
    processedImageData: null,
    displayImageData: null,
    isProcessing: false,
    error: null,
    adjustments: DEFAULT_ADJUSTMENTS,
    activeFilter: null,
    blurRadius: 3,
    showOriginal: false,
  });

  const processingRef = useRef(false);

  const updateDisplay = useCallback((
    processed: ImageData,
    adjustments: AdjustmentValues,
    filter: FilterType | null,
    blurRadius: number
  ) => {
    let result = cloneImageData(processed);

    result = applyAllAdjustments(result, adjustments);

    if (filter) {
      result = applyFilter(result, filter, { blurRadius });
    }

    return result;
  }, []);

  const loadFile = useCallback(async (file: File) => {
    if (processingRef.current) return;
    processingRef.current = true;

    setState((s) => ({
      ...s,
      isProcessing: true,
      error: null,
    }));

    try {
      const img = await loadImage(file);
      const imageData = getImageData(img);
      const processed = processImage(imageData);
      const display = cloneImageData(processed);

      setState({
        originalFile: file,
        originalImageData: imageData,
        processedImageData: processed,
        displayImageData: display,
        isProcessing: false,
        error: null,
        adjustments: DEFAULT_ADJUSTMENTS,
        activeFilter: null,
        blurRadius: 3,
        showOriginal: false,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isProcessing: false,
        error: err instanceof Error ? err.message : "Failed to load image",
      }));
    } finally {
      processingRef.current = false;
    }
  }, []);

  const setAdjustment = useCallback(
    (key: keyof AdjustmentValues, value: number) => {
      setState((s) => {
        const newAdjustments = { ...s.adjustments, [key]: value };

        if (!s.processedImageData) return s;

        const display = updateDisplay(
          s.processedImageData,
          newAdjustments,
          s.activeFilter,
          s.blurRadius
        );

        return {
          ...s,
          adjustments: newAdjustments,
          displayImageData: display,
        };
      });
    },
    [updateDisplay]
  );

  const setFilter = useCallback(
    (filter: FilterType | null) => {
      setState((s) => {
        if (!s.processedImageData) return s;

        const newFilter = s.activeFilter === filter ? null : filter;
        const display = updateDisplay(
          s.processedImageData,
          s.adjustments,
          newFilter,
          s.blurRadius
        );

        return {
          ...s,
          activeFilter: newFilter,
          displayImageData: display,
        };
      });
    },
    [updateDisplay]
  );

  const setBlurRadius = useCallback(
    (radius: number) => {
      setState((s) => {
        if (!s.processedImageData) return s;

        const display = updateDisplay(
          s.processedImageData,
          s.adjustments,
          s.activeFilter,
          radius
        );

        return {
          ...s,
          blurRadius: radius,
          displayImageData: display,
        };
      });
    },
    [updateDisplay]
  );

  const toggleOriginal = useCallback(() => {
    setState((s) => ({
      ...s,
      showOriginal: !s.showOriginal,
    }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => {
      if (!s.processedImageData) return s;

      return {
        ...s,
        adjustments: DEFAULT_ADJUSTMENTS,
        activeFilter: null,
        blurRadius: 3,
        displayImageData: cloneImageData(s.processedImageData),
      };
    });
  }, []);

  const download = useCallback(async () => {
    if (!state.displayImageData || !state.originalFile) return;

    const canvas = imageDataToCanvas(state.displayImageData);
    const blob = await exportToPNG(canvas);

    const originalName = state.originalFile.name;
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const filename = `${baseName}_sticker.png`;

    downloadBlob(blob, filename);
  }, [state.displayImageData, state.originalFile]);

  const clear = useCallback(() => {
    setState({
      originalFile: null,
      originalImageData: null,
      processedImageData: null,
      displayImageData: null,
      isProcessing: false,
      error: null,
      adjustments: DEFAULT_ADJUSTMENTS,
      activeFilter: null,
      blurRadius: 3,
      showOriginal: false,
    });
  }, []);

  return {
    state,
    loadFile,
    setAdjustment,
    setFilter,
    setBlurRadius,
    toggleOriginal,
    reset,
    download,
    clear,
  };
}
