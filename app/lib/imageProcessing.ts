/**
 * Core image processing utilities for Telegram sticker editor
 * Handles loading, cropping transparent borders, and resizing
 */

export interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Load an image file and return it as an HTMLImageElement
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Get ImageData from an HTMLImageElement
 */
export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Detect the bounding box of non-transparent pixels
 */
export function detectBoundingBox(imageData: ImageData): BoundingBox {
  const { data, width, height } = imageData;
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;

  const alphaThreshold = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];

      if (alpha > alphaThreshold) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (left > right || top > bottom) {
    return { left: 0, top: 0, right: width - 1, bottom: height - 1, width, height };
  }

  return {
    left,
    top,
    right,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

/**
 * Crop image to the given bounding box
 */
export function cropImage(imageData: ImageData, box: BoundingBox): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.putImageData(imageData, 0, 0);

  return ctx.getImageData(box.left, box.top, box.width, box.height);
}

/**
 * Resize image to fit within maxSize while maintaining aspect ratio
 */
export function resizeImage(imageData: ImageData, maxSize: number = 512): ImageData {
  const { width, height } = imageData;

  let newWidth: number;
  let newHeight: number;

  if (width >= height) {
    newWidth = Math.min(width, maxSize);
    newHeight = Math.round((height / width) * newWidth);
  } else {
    newHeight = Math.min(height, maxSize);
    newWidth = Math.round((width / height) * newHeight);
  }

  if (newWidth === width && newHeight === height) {
    return imageData;
  }

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
  if (!srcCtx) throw new Error("Failed to get canvas context");
  srcCtx.putImageData(imageData, 0, 0);

  if (width > newWidth * 2 || height > newHeight * 2) {
    return stepDownResize(srcCanvas, newWidth, newHeight);
  }

  const dstCanvas = document.createElement("canvas");
  dstCanvas.width = newWidth;
  dstCanvas.height = newHeight;
  const dstCtx = dstCanvas.getContext("2d", { willReadFrequently: true });
  if (!dstCtx) throw new Error("Failed to get canvas context");

  dstCtx.imageSmoothingEnabled = true;
  dstCtx.imageSmoothingQuality = "high";
  dstCtx.drawImage(srcCanvas, 0, 0, newWidth, newHeight);

  return dstCtx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Step-down resize for better quality when significantly reducing size
 */
function stepDownResize(srcCanvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): ImageData {
  let currentCanvas = srcCanvas;
  let currentWidth = srcCanvas.width;
  let currentHeight = srcCanvas.height;

  while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
    const nextWidth = Math.max(Math.round(currentWidth / 2), targetWidth);
    const nextHeight = Math.max(Math.round(currentHeight / 2), targetHeight);

    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = nextWidth;
    nextCanvas.height = nextHeight;
    const nextCtx = nextCanvas.getContext("2d", { willReadFrequently: true });
    if (!nextCtx) throw new Error("Failed to get canvas context");

    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = "high";
    nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

    currentCanvas = nextCanvas;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
  if (!finalCtx) throw new Error("Failed to get canvas context");

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

  return finalCtx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Convert ImageData to a canvas element
 */
export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Export canvas to PNG blob
 */
export function exportToPNG(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to export image"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Process image: crop transparent borders and resize to 512px
 */
export function processImage(imageData: ImageData): ImageData {
  const boundingBox = detectBoundingBox(imageData);
  const cropped = cropImage(imageData, boundingBox);
  const resized = resizeImage(cropped, 512);
  return resized;
}

/**
 * Generate a small thumbnail data URL from ImageData
 */
export function generateThumbnail(imageData: ImageData, maxSize: number = 128): string {
  const { width, height } = imageData;

  let newWidth: number;
  let newHeight: number;

  if (width >= height) {
    newWidth = Math.min(width, maxSize);
    newHeight = Math.round((height / width) * newWidth);
  } else {
    newHeight = Math.min(height, maxSize);
    newWidth = Math.round((width / height) * newHeight);
  }

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) throw new Error("Failed to get canvas context");
  srcCtx.putImageData(imageData, 0, 0);

  const dstCanvas = document.createElement("canvas");
  dstCanvas.width = newWidth;
  dstCanvas.height = newHeight;
  const dstCtx = dstCanvas.getContext("2d");
  if (!dstCtx) throw new Error("Failed to get canvas context");

  dstCtx.imageSmoothingEnabled = true;
  dstCtx.imageSmoothingQuality = "high";
  dstCtx.drawImage(srcCanvas, 0, 0, newWidth, newHeight);

  return dstCanvas.toDataURL("image/png");
}
