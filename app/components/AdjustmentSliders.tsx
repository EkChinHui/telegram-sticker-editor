"use client";

import { useCallback } from "react";
import type { AdjustmentValues } from "../lib/imageAdjustments";

interface AdjustmentSlidersProps {
  values: AdjustmentValues;
  onChange: (key: keyof AdjustmentValues, value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

interface SliderConfig {
  key: keyof AdjustmentValues;
  label: string;
  shortLabel: string;
  color: string;
}

const SLIDERS: SliderConfig[] = [
  { key: "brightness", label: "Brightness", shortLabel: "Bright", color: "amber" },
  { key: "contrast", label: "Contrast", shortLabel: "Contrast", color: "orange" },
  { key: "saturation", label: "Saturation", shortLabel: "Satur", color: "rose" },
  { key: "sharpness", label: "Sharpness", shortLabel: "Sharp", color: "cyan" },
];

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
};

export function AdjustmentSliders({
  values,
  onChange,
  disabled,
  compact = false,
}: AdjustmentSlidersProps) {
  const handleChange = useCallback(
    (key: keyof AdjustmentValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(key, parseFloat(e.target.value));
    },
    [onChange]
  );

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {SLIDERS.map((slider) => {
          const value = values[slider.key];
          const percentage = (value / 2) * 100;
          const trackColor = COLOR_MAP[slider.color];

          return (
            <div key={slider.key} className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 w-12 shrink-0">
                {slider.shortLabel}
              </span>
              <div className="relative flex-1 h-5 flex items-center">
                <div className="absolute inset-x-0 h-1 rounded-full bg-stone-800">
                  <div
                    className={`h-full rounded-full ${trackColor} transition-all duration-100`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="absolute h-1 w-px bg-stone-600" style={{ left: "50%" }} />
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.02"
                  value={value}
                  onChange={handleChange(slider.key)}
                  disabled={disabled}
                  className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                />
              </div>
              <span className="text-[10px] font-mono text-stone-600 w-7 text-right tabular-nums">
                {value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {SLIDERS.map((slider) => {
        const value = values[slider.key];
        const percentage = (value / 2) * 100;
        const trackColor = COLOR_MAP[slider.color];
        const isModified = value !== 1.0;

        return (
          <div key={slider.key}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isModified ? "text-stone-300" : "text-stone-500"}`}>
                {slider.label}
              </span>
              <span className={`text-[10px] font-mono tabular-nums ${isModified ? "text-stone-400" : "text-stone-600"}`}>
                {value.toFixed(2)}
              </span>
            </div>
            <div className="relative h-6 flex items-center">
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-stone-800">
                <div
                  className={`h-full rounded-full ${trackColor} transition-all duration-100`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="absolute h-1.5 w-px bg-stone-600" style={{ left: "50%" }} />
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={value}
                onChange={handleChange(slider.key)}
                disabled={disabled}
                className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
