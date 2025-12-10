"use client";

export type EditorMode = "single" | "batch";

interface ModeToggleProps {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <div
      className={`
        inline-flex rounded-xl p-1
        bg-stone-800/50 border border-stone-700/50
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <button
        onClick={() => onChange("single")}
        disabled={disabled}
        className={`
          px-4 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${mode === "single"
            ? "bg-amber-500 text-stone-900 shadow-md"
            : "text-stone-400 hover:text-stone-200"
          }
        `}
      >
        Single
      </button>
      <button
        onClick={() => onChange("batch")}
        disabled={disabled}
        className={`
          px-4 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${mode === "batch"
            ? "bg-amber-500 text-stone-900 shadow-md"
            : "text-stone-400 hover:text-stone-200"
          }
        `}
      >
        Batch
      </button>
    </div>
  );
}
