"use client";

import { useCallback, useState } from "react";

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function ImageDropzone({ onFileSelect, isProcessing }: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "image/png") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      e.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        w-full aspect-square max-w-md mx-auto
        rounded-3xl
        transition-all duration-500 ease-out
        ${isDragOver
          ? "scale-105 bg-amber-500/20 border-amber-400"
          : "bg-stone-900/50 border-stone-700/50 hover:border-amber-500/50 hover:bg-stone-800/50"
        }
        border-2 border-dashed
        backdrop-blur-sm
        overflow-hidden
      `}
    >
      <input
        type="file"
        accept="image/png"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {isProcessing ? (
          <>
            <div className="w-16 h-16 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-stone-700" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-lg font-medium text-stone-300 tracking-wide">
              Processing...
            </p>
          </>
        ) : (
          <>
            <div
              className={`
                w-20 h-20 mb-6
                transition-transform duration-500
                ${isDragOver ? "scale-110 rotate-12" : "group-hover:scale-105"}
              `}
            >
              <svg
                viewBox="0 0 80 80"
                fill="none"
                className="w-full h-full"
              >
                <rect
                  x="8"
                  y="16"
                  width="48"
                  height="48"
                  rx="8"
                  className={`
                    transition-all duration-300
                    ${isDragOver ? "fill-amber-400/30 stroke-amber-400" : "fill-stone-800 stroke-stone-600 group-hover:stroke-amber-500/70"}
                  `}
                  strokeWidth="2"
                />
                <rect
                  x="24"
                  y="8"
                  width="48"
                  height="48"
                  rx="8"
                  className={`
                    transition-all duration-300
                    ${isDragOver ? "fill-amber-400/50 stroke-amber-400" : "fill-stone-700 stroke-stone-500 group-hover:stroke-amber-400"}
                  `}
                  strokeWidth="2"
                />
                <path
                  d="M48 24v16m-8-8h16"
                  className={`
                    transition-colors duration-300
                    ${isDragOver ? "stroke-amber-300" : "stroke-stone-400 group-hover:stroke-amber-300"}
                  `}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-lg font-medium text-stone-200 mb-2 tracking-wide">
              {isDragOver ? "Drop it!" : "Drop your sticker here"}
            </p>
            <p className="text-sm text-stone-500">
              or click to browse • PNG only
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-stone-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/60" />
              Auto-crops transparent borders
            </div>
          </>
        )}
      </div>

      <div
        className={`
          absolute inset-0 pointer-events-none
          bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5
          transition-opacity duration-500
          ${isDragOver ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      />
    </div>
  );
}
