/**
 * ZIP export utilities for batch processing
 */

import JSZip from "jszip";
import { imageDataToCanvas, exportToPNG, downloadBlob } from "./imageProcessing";

export interface ZipItem {
  filename: string;
  imageData: ImageData;
}

export interface ZipProgress {
  current: number;
  total: number;
  phase: "processing" | "compressing";
}

/**
 * Create a ZIP file from multiple processed images and trigger download
 */
export async function createAndDownloadZip(
  items: ZipItem[],
  zipFilename: string,
  onProgress?: (progress: ZipProgress) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const { filename, imageData } = items[i];

    onProgress?.({
      current: i + 1,
      total: items.length,
      phase: "processing",
    });

    const canvas = imageDataToCanvas(imageData);
    const blob = await exportToPNG(canvas);
    zip.file(filename, blob);

    // Yield to UI thread to keep it responsive
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  onProgress?.({
    current: items.length,
    total: items.length,
    phase: "compressing",
  });

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  downloadBlob(zipBlob, zipFilename);
}

/**
 * Generate a unique filename for batch export
 */
export function generateZipFilename(): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `stickers_${timestamp}.zip`;
}

/**
 * Generate output filename for a processed sticker
 */
export function generateStickerFilename(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}_sticker.png`;
}
