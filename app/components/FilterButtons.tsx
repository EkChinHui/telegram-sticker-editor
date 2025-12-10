"use client";

import { type FilterType, FILTER_LABELS } from "../lib/imageFilters";

interface FilterButtonsProps {
  activeFilter: FilterType | null;
  blurRadius: number;
  onFilterSelect: (filter: FilterType | null) => void;
  onBlurRadiusChange: (radius: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

const FILTERS: FilterType[] = [
  "sharpen",
  "blur",
  "edge_enhance",
  "emboss",
  "contour",
  "detail",
  "find_edges",
];

const SHORT_LABELS: Record<FilterType, string> = {
  sharpen: "Sharp",
  blur: "Blur",
  edge_enhance: "Edge",
  emboss: "Emboss",
  contour: "Contour",
  detail: "Detail",
  find_edges: "Edges",
};

export function FilterButtons({
  activeFilter,
  blurRadius,
  onFilterSelect,
  onBlurRadiusChange,
  disabled,
  compact = false,
}: FilterButtonsProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterSelect(filter)}
                disabled={disabled}
                className={`
                  px-2.5 py-1 rounded-md text-[11px] font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-amber-500 text-stone-900"
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-300"
                  }
                `}
              >
                {SHORT_LABELS[filter]}
              </button>
            );
          })}
        </div>

        {activeFilter === "blur" && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-stone-500">Radius</span>
            <div className="relative flex-1 h-5 flex items-center">
              <div className="absolute inset-x-0 h-1 rounded-full bg-stone-800">
                <div
                  className="h-full rounded-full bg-stone-500 transition-all duration-100"
                  style={{ width: `${(blurRadius / 10) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={blurRadius}
                onChange={(e) => onBlurRadiusChange(parseFloat(e.target.value))}
                disabled={disabled}
                className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>
            <span className="text-[10px] font-mono text-stone-600 w-6 text-right">{blurRadius}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => onFilterSelect(filter)}
              disabled={disabled}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-150
                ${isActive
                  ? "bg-amber-500 text-stone-900 shadow-md shadow-amber-500/20"
                  : "bg-stone-800/70 text-stone-400 hover:bg-stone-700 hover:text-stone-300 border border-stone-700/50"
                }
              `}
            >
              {FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>

      {activeFilter === "blur" && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-stone-500">Blur Radius</span>
          <div className="relative flex-1 h-6 flex items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-stone-800">
              <div
                className="h-full rounded-full bg-stone-500 transition-all duration-100"
                style={{ width: `${(blurRadius / 10) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={blurRadius}
              onChange={(e) => onBlurRadiusChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
            />
          </div>
          <span className="text-xs font-mono text-stone-500 w-8 text-right">{blurRadius}px</span>
        </div>
      )}
    </div>
  );
}
