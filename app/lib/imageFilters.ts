/**
 * Image filter effects using convolution kernels
 */

import { applyConvolution, cloneImageData } from "./imageAdjustments";

export type FilterType =
  | "sharpen"
  | "blur"
  | "edge_enhance"
  | "emboss"
  | "contour"
  | "detail"
  | "find_edges";

/**
 * Sharpen filter - enhances edges
 */
export function applySharpen(imageData: ImageData): ImageData {
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  return applyConvolution(imageData, kernel, 1);
}

/**
 * Gaussian blur with configurable radius (0-10)
 */
export function applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return cloneImageData(imageData);

  const sigma = radius / 2;
  const size = Math.ceil(radius) * 2 + 1;
  const kernel: number[] = [];

  let sum = 0;
  const center = Math.floor(size / 2);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel.push(value);
      sum += value;
    }
  }

  return applyConvolution(imageData, kernel, sum);
}

/**
 * Simple box blur (faster than Gaussian)
 */
export function applyBoxBlur(imageData: ImageData): ImageData {
  const kernel = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ];
  return applyConvolution(imageData, kernel, 9);
}

/**
 * Edge enhance filter
 */
export function applyEdgeEnhance(imageData: ImageData): ImageData {
  const kernel = [
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
  ];
  return applyConvolution(imageData, kernel, 1);
}

/**
 * Emboss filter - creates 3D relief effect
 */
export function applyEmboss(imageData: ImageData): ImageData {
  const kernel = [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ];
  const result = applyConvolution(imageData, kernel, 1);

  const data = result.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + 128);
    data[i + 1] = Math.min(255, data[i + 1] + 128);
    data[i + 2] = Math.min(255, data[i + 2] + 128);
  }

  return result;
}

/**
 * Contour filter - highlights edges as dark lines
 */
export function applyContour(imageData: ImageData): ImageData {
  const kernel = [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ];
  const result = applyConvolution(imageData, kernel, 1);

  const data = result.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  return result;
}

/**
 * Detail enhancement filter
 */
export function applyDetail(imageData: ImageData): ImageData {
  const kernel = [
    0, -1, 0,
    -1, 10, -1,
    0, -1, 0
  ];
  return applyConvolution(imageData, kernel, 6);
}

/**
 * Find edges using Sobel operator
 */
export function applyFindEdges(imageData: ImageData): ImageData {
  const sobelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];

  const sobelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ];

  const gx = applyConvolution(imageData, sobelX, 1);
  const gy = applyConvolution(imageData, sobelY, 1);

  const result = cloneImageData(imageData);
  const data = result.data;
  const gxData = gx.data;
  const gyData = gy.data;

  for (let i = 0; i < data.length; i += 4) {
    const magnitude = Math.sqrt(
      Math.pow(gxData[i], 2) + Math.pow(gyData[i], 2) +
      Math.pow(gxData[i + 1], 2) + Math.pow(gyData[i + 1], 2) +
      Math.pow(gxData[i + 2], 2) + Math.pow(gyData[i + 2], 2)
    ) / Math.sqrt(3);

    const value = Math.min(255, magnitude);
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  return result;
}

/**
 * Apply a named filter
 */
export function applyFilter(
  imageData: ImageData,
  filter: FilterType,
  options?: { blurRadius?: number }
): ImageData {
  switch (filter) {
    case "sharpen":
      return applySharpen(imageData);
    case "blur":
      return applyGaussianBlur(imageData, options?.blurRadius ?? 3);
    case "edge_enhance":
      return applyEdgeEnhance(imageData);
    case "emboss":
      return applyEmboss(imageData);
    case "contour":
      return applyContour(imageData);
    case "detail":
      return applyDetail(imageData);
    case "find_edges":
      return applyFindEdges(imageData);
    default:
      return cloneImageData(imageData);
  }
}

export const FILTER_LABELS: Record<FilterType, string> = {
  sharpen: "Sharpen",
  blur: "Blur",
  edge_enhance: "Edge Enhance",
  emboss: "Emboss",
  contour: "Contour",
  detail: "Detail",
  find_edges: "Find Edges",
};
