"use client";

import type { BatchImageItem } from "../hooks/useBatchImageEditor";

interface BatchGalleryProps {
  items: BatchImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function BatchGallery({
  items,
  selectedId,
  onSelect,
  onRemove,
}: BatchGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isLoading = item.status === "loading" || item.status === "pending";
        const isError = item.status === "error";

        return (
          <div
            key={item.id}
            onClick={() => item.status === "ready" && onSelect(item.id)}
            className={`
              relative group
              w-20 h-20 sm:w-24 sm:h-24
              rounded-xl overflow-hidden
              transition-all duration-200
              ${isSelected
                ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-950 scale-105"
                : "hover:scale-105"
              }
              ${item.status === "ready" ? "cursor-pointer" : "cursor-default"}
              ${isError ? "opacity-60" : ""}
            `}
          >
            <div
              className="
                absolute inset-0
                bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#0f0f0f_0%_50%)]
                bg-[length:12px_12px]
              "
            />

            {item.thumbnailDataUrl && (
              <img
                src={item.thumbnailDataUrl}
                alt={item.file.name}
                className="relative w-full h-full object-contain"
              />
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900/70">
                <div className="w-6 h-6 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-stone-600" />
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              </div>
            )}

            {isError && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900/70">
                <div className="text-red-400">
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            {item.status === "ready" && (
              <div
                className="
                  absolute bottom-1 right-1
                  w-4 h-4 rounded-full
                  bg-emerald-500 border border-emerald-400
                  flex items-center justify-center
                "
              >
                <svg
                  className="w-2.5 h-2.5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="
                absolute top-1 right-1
                w-5 h-5 rounded-full
                bg-stone-900/80 border border-stone-700/50
                text-stone-400 hover:text-red-400 hover:border-red-500/50
                opacity-0 group-hover:opacity-100
                transition-all duration-200
                flex items-center justify-center
              "
            >
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              className="
                absolute bottom-0 left-0 right-0
                px-1 py-0.5
                bg-gradient-to-t from-black/70 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              <p className="text-[9px] text-stone-300 truncate">
                {item.file.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
