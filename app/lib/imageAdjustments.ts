/**
 * Image adjustment utilities for brightness, contrast, saturation, and sharpness
 */

/**
 * Clamp a value between 0 and 255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Clone ImageData
 */
export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}

/**
 * Adjust brightness (0.0 - 2.0, 1.0 = no change)
 */
export function adjustBrightness(imageData: ImageData, value: number): ImageData {
  const result = cloneImageData(imageData);
  const data = result.data;
  const factor = value;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * factor);
    data[i + 1] = clamp(data[i + 1] * factor);
    data[i + 2] = clamp(data[i + 2] * factor);
  }

  return result;
}

/**
 * Adjust contrast (0.0 - 2.0, 1.0 = no change)
 */
export function adjustContrast(imageData: ImageData, value: number): ImageData {
  const result = cloneImageData(imageData);
  const data = result.data;
  const factor = (259 * (value * 255 + 255)) / (255 * (259 - value * 255));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }

  return result;
}

/**
 * Adjust saturation (0.0 - 2.0, 1.0 = no change)
 */
export function adjustSaturation(imageData: ImageData, value: number): ImageData {
  const result = cloneImageData(imageData);
  const data = result.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    data[i] = clamp(gray + (r - gray) * value);
    data[i + 1] = clamp(gray + (g - gray) * value);
    data[i + 2] = clamp(gray + (b - gray) * value);
  }

  return result;
}

/**
 * Apply convolution kernel to image
 */
export function applyConvolution(imageData: ImageData, kernel: number[], divisor?: number): ImageData {
  const result = cloneImageData(imageData);
  const { data, width, height } = imageData;
  const resultData = result.data;

  const kernelSize = Math.sqrt(kernel.length);
  const half = Math.floor(kernelSize / 2);

  const div = divisor ?? (kernel.reduce((a, b) => a + b, 0) || 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const kVal = kernel[ky * kernelSize + kx];

          r += data[idx] * kVal;
          g += data[idx + 1] * kVal;
          b += data[idx + 2] * kVal;
        }
      }

      const outIdx = (y * width + x) * 4;
      resultData[outIdx] = clamp(r / div);
      resultData[outIdx + 1] = clamp(g / div);
      resultData[outIdx + 2] = clamp(b / div);
    }
  }

  return result;
}

/**
 * Adjust sharpness (0.0 - 2.0, 1.0 = no change)
 * Uses unsharp mask technique
 */
export function adjustSharpness(imageData: ImageData, value: number): ImageData {
  if (value === 1.0) return cloneImageData(imageData);

  const blurKernel = [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ];
  const blurred = applyConvolution(imageData, blurKernel, 16);

  const result = cloneImageData(imageData);
  const data = imageData.data;
  const blurData = blurred.data;
  const resultData = result.data;

  const amount = (value - 1.0) * 2;

  for (let i = 0; i < data.length; i += 4) {
    resultData[i] = clamp(data[i] + amount * (data[i] - blurData[i]));
    resultData[i + 1] = clamp(data[i + 1] + amount * (data[i + 1] - blurData[i + 1]));
    resultData[i + 2] = clamp(data[i + 2] + amount * (data[i + 2] - blurData[i + 2]));
  }

  return result;
}

export interface AdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
}

/**
 * Apply all adjustments in sequence
 */
export function applyAllAdjustments(imageData: ImageData, values: AdjustmentValues): ImageData {
  let result = imageData;

  if (values.brightness !== 1.0) {
    result = adjustBrightness(result, values.brightness);
  }
  if (values.contrast !== 1.0) {
    result = adjustContrast(result, values.contrast);
  }
  if (values.saturation !== 1.0) {
    result = adjustSaturation(result, values.saturation);
  }
  if (values.sharpness !== 1.0) {
    result = adjustSharpness(result, values.sharpness);
  }

  return result;
}
