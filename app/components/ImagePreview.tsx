"use client";

import { useEffect, useRef } from "react";

interface ImagePreviewProps {
  originalImageData: ImageData | null;
  displayImageData: ImageData | null;
  showOriginal: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export function ImagePreview({
  originalImageData,
  displayImageData,
  showOriginal,
  onToggle,
  onClear,
}: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageData = showOriginal ? originalImageData : displayImageData;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  if (!imageData) return null;

  const dimensions = displayImageData
    ? `${displayImageData.width}×${displayImageData.height}`
    : "";

  return (
    <div className="w-full">
      <div className="relative group">
        <div
          className="
            relative rounded-2xl overflow-hidden
            bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#0f0f0f_0%_50%)]
            bg-[length:16px_16px]
            border border-stone-800
          "
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[65vh] object-contain"
            style={{ imageRendering: "pixelated" }}
          />

          {/* Close button */}
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-stone-900/80 text-stone-400 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Size badge */}
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono ${showOriginal ? "bg-stone-700/90 text-stone-300" : "bg-amber-500/90 text-stone-900"}`}>
            {showOriginal ? "ORIG" : dimensions}
          </div>
        </div>

        {/* Toggle bar */}
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-stone-500 hover:text-stone-300 transition-colors"
          >
            <div className="relative w-7 h-3.5">
              <div className="absolute inset-0 rounded-full bg-stone-700" />
              <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-200 ${showOriginal ? "left-0.5 bg-stone-500" : "left-3.5 bg-amber-400"}`} />
            </div>
            <span>{showOriginal ? "Original" : "Processed"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
