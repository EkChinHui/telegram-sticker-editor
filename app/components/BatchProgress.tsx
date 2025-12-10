"use client";

interface BatchProgressProps {
  current: number;
  total: number;
  phase: string;
  isVisible: boolean;
}

export function BatchProgress({
  current,
  total,
  phase,
  isVisible,
}: BatchProgressProps) {
  if (!isVisible) return null;

  const percentage = total > 0 ? (current / total) * 100 : 0;

  const phaseLabel =
    phase === "loading"
      ? "Loading images"
      : phase === "applying"
      ? "Applying effects"
      : phase === "compressing"
      ? "Creating ZIP"
      : "Processing";

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-stone-950/80 backdrop-blur-sm
        flex items-center justify-center
        animate-in fade-in duration-200
      "
    >
      <div
        className="
          w-full max-w-sm mx-4
          p-6 rounded-2xl
          bg-stone-900 border border-stone-800
          shadow-2xl
        "
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 rounded-full border-3 border-stone-700" />
            <div className="absolute inset-0 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-200">{phaseLabel}</p>
            <p className="text-xs text-stone-500">
              {phase === "compressing"
                ? "Almost done..."
                : `${current} of ${total} images`}
            </p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
          <div
            className="
              h-full rounded-full
              bg-gradient-to-r from-amber-500 to-orange-500
              transition-all duration-300 ease-out
            "
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-3 text-center text-xs text-stone-600">
          Please wait while processing...
        </p>
      </div>
    </div>
  );
}
