"use client";

import { useEffect, useRef } from "react";

interface BatchPreviewProps {
  imageData: ImageData | null;
  currentIndex: number;
  totalCount: number;
  onNavigate: (direction: "prev" | "next") => void;
}

export function BatchPreview({
  imageData,
  currentIndex,
  totalCount,
  onNavigate,
}: BatchPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(imageData, 0, 0);
  }, [imageData]);

  if (!imageData) {
    return (
      <div className="w-full aspect-square max-h-[50vh] rounded-xl bg-stone-900/50 border border-stone-800/50 flex items-center justify-center text-stone-600 text-sm">
        Select an image
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative group">
        <div className="relative rounded-xl overflow-hidden bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#0f0f0f_0%_50%)] bg-[length:16px_16px] border border-stone-800">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[50vh] object-contain"
            style={{ imageRendering: "pixelated" }}
          />

          {totalCount > 1 && (
            <>
              <button
                onClick={() => onNavigate("prev")}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-900/80 text-stone-400 hover:text-stone-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onNavigate("next")}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-900/80 text-stone-400 hover:text-stone-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-stone-900/80 text-[10px] font-mono text-stone-400">
            {currentIndex + 1}/{totalCount}
          </div>
        </div>

        <div className="mt-1 text-center text-[10px] text-stone-600 font-mono">
          {imageData.width}×{imageData.height}
        </div>
      </div>
    </div>
  );
}
