"use client";

import { useCallback, useState } from "react";

interface BatchDropzoneProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
  existingCount: number;
}

export function BatchDropzone({
  onFilesSelect,
  isProcessing,
  existingCount,
}: BatchDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCount, setDragCount] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (e.dataTransfer.items) {
      setDragCount(e.dataTransfer.items.length);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCount(0);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setDragCount(0);

      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === "image/png"
      );
      if (files.length > 0) {
        onFilesSelect(files);
      }
    },
    [onFilesSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesSelect(files);
      }
      e.target.value = "";
    },
    [onFilesSelect]
  );

  const isCompact = existingCount > 0;

  if (isCompact) {
    return (
      <label
        className={`
          relative cursor-pointer
          flex items-center justify-center
          w-24 h-24
          rounded-xl
          transition-all duration-300
          ${isDragOver
            ? "scale-105 bg-amber-500/20 border-amber-400"
            : "bg-stone-800/50 border-stone-700/50 hover:border-amber-500/50 hover:bg-stone-700/50"
          }
          border-2 border-dashed
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/png"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <div className="flex flex-col items-center text-stone-500">
          <svg className="w-6 h-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">Add</span>
        </div>
      </label>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        w-full aspect-video max-w-lg mx-auto
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
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {isProcessing ? (
          <>
            <div className="w-12 h-12 mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-stone-700" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-base font-medium text-stone-300">Loading...</p>
          </>
        ) : (
          <>
            <div
              className={`
                w-16 h-16 mb-4
                transition-transform duration-500
                ${isDragOver ? "scale-110" : "group-hover:scale-105"}
              `}
            >
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                <rect
                  x="4"
                  y="12"
                  width="24"
                  height="24"
                  rx="4"
                  className={`
                    transition-all duration-300
                    ${isDragOver ? "fill-amber-400/30 stroke-amber-400" : "fill-stone-800 stroke-stone-600"}
                  `}
                  strokeWidth="2"
                />
                <rect
                  x="20"
                  y="20"
                  width="24"
                  height="24"
                  rx="4"
                  className={`
                    transition-all duration-300
                    ${isDragOver ? "fill-amber-400/40 stroke-amber-400" : "fill-stone-700 stroke-stone-500"}
                  `}
                  strokeWidth="2"
                />
                <rect
                  x="36"
                  y="28"
                  width="24"
                  height="24"
                  rx="4"
                  className={`
                    transition-all duration-300
                    ${isDragOver ? "fill-amber-400/50 stroke-amber-400" : "fill-stone-600 stroke-stone-400"}
                  `}
                  strokeWidth="2"
                />
              </svg>
            </div>

            <p className="text-lg font-medium text-stone-200 mb-2">
              {isDragOver
                ? dragCount > 0
                  ? `Drop ${dragCount} file${dragCount > 1 ? "s" : ""}`
                  : "Drop files here"
                : "Drop multiple stickers here"}
            </p>
            <p className="text-sm text-stone-500">
              or click to browse • PNG only
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-stone-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/60" />
              Process all with same settings
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
