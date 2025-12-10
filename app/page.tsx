"use client";

import { useState } from "react";
import { useImageEditor } from "./hooks/useImageEditor";
import { useBatchImageEditor } from "./hooks/useBatchImageEditor";
import { ImageDropzone } from "./components/ImageDropzone";
import { ImagePreview } from "./components/ImagePreview";
import { AdjustmentSliders } from "./components/AdjustmentSliders";
import { FilterButtons } from "./components/FilterButtons";
import { ModeToggle, type EditorMode } from "./components/ModeToggle";
import { BatchDropzone } from "./components/BatchDropzone";
import { BatchGallery } from "./components/BatchGallery";
import { BatchPreview } from "./components/BatchPreview";
import { BatchProgress } from "./components/BatchProgress";

export default function Home() {
  const [mode, setMode] = useState<EditorMode>("single");

  const singleEditor = useImageEditor();
  const batchEditor = useBatchImageEditor();

  const isAnyProcessing =
    singleEditor.state.isProcessing || batchEditor.state.processing.isProcessing;

  const hasSingleContent = singleEditor.state.displayImageData !== null;
  const hasBatchContent = batchEditor.state.items.length > 0;
  const canSwitchMode = !isAnyProcessing && !hasSingleContent && !hasBatchContent;

  const hasModifications =
    singleEditor.state.adjustments.brightness !== 1.0 ||
    singleEditor.state.adjustments.contrast !== 1.0 ||
    singleEditor.state.adjustments.saturation !== 1.0 ||
    singleEditor.state.adjustments.sharpness !== 1.0 ||
    singleEditor.state.activeFilter !== null;

  const batchHasModifications =
    batchEditor.state.adjustments.brightness !== 1.0 ||
    batchEditor.state.adjustments.contrast !== 1.0 ||
    batchEditor.state.adjustments.saturation !== 1.0 ||
    batchEditor.state.adjustments.sharpness !== 1.0 ||
    batchEditor.state.activeFilter !== null;

  const readyCount = batchEditor.state.items.filter((it) => it.status === "ready").length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-stone-950 to-stone-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <BatchProgress
        current={batchEditor.state.processing.current}
        total={batchEditor.state.processing.total}
        phase={batchEditor.state.processing.phase}
        isVisible={batchEditor.state.processing.isProcessing}
      />

      <div className="relative z-10 container mx-auto px-4 py-4 max-w-6xl">
        {/* Compact Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-stone-100">Sticker</span>
              <span className="text-amber-400">Maker</span>
            </h1>
          </div>

          <ModeToggle mode={mode} onChange={setMode} disabled={!canSwitchMode} />
        </header>

        <main>
          {mode === "single" ? (
            !hasSingleContent ? (
              /* Empty state - single mode */
              <div className="flex flex-col items-center py-12">
                <ImageDropzone onFileSelect={singleEditor.loadFile} isProcessing={singleEditor.state.isProcessing} />
                {singleEditor.state.error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {singleEditor.state.error}
                  </div>
                )}
                <p className="mt-4 text-xs text-stone-600">PNG only • Auto-crops transparent borders • Resizes to 512px</p>
              </div>
            ) : (
              /* Editor - single mode */
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
                {/* Left: Preview */}
                <div className="order-1">
                  <ImagePreview
                    originalImageData={singleEditor.state.originalImageData}
                    displayImageData={singleEditor.state.displayImageData}
                    showOriginal={singleEditor.state.showOriginal}
                    onToggle={singleEditor.toggleOriginal}
                    onClear={singleEditor.clear}
                  />
                </div>

                {/* Right: Controls */}
                <div className="order-2 space-y-4">
                  <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/50">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Adjustments</h3>
                    <AdjustmentSliders values={singleEditor.state.adjustments} onChange={singleEditor.setAdjustment} />
                  </div>

                  <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/50">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Filters</h3>
                    <FilterButtons
                      activeFilter={singleEditor.state.activeFilter}
                      blurRadius={singleEditor.state.blurRadius}
                      onFilterSelect={singleEditor.setFilter}
                      onBlurRadiusChange={singleEditor.setBlurRadius}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={singleEditor.reset}
                      disabled={!hasModifications}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-stone-800/50 border border-stone-700/50 text-stone-400 text-sm
                        hover:bg-stone-700/50 hover:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={singleEditor.download}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 text-sm font-semibold
                        hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            !hasBatchContent ? (
              /* Empty state - batch mode */
              <div className="flex flex-col items-center py-12">
                <BatchDropzone onFilesSelect={batchEditor.loadFiles} isProcessing={batchEditor.state.processing.isProcessing} existingCount={0} />
                <p className="mt-4 text-xs text-stone-600">Drop multiple PNGs • Same settings for all • ZIP download</p>
              </div>
            ) : (
              /* Editor - batch mode */
              <div className="space-y-4">
                {/* Gallery row */}
                <div className="flex flex-wrap items-start gap-2">
                  <BatchGallery
                    items={batchEditor.state.items}
                    selectedId={batchEditor.state.selectedItemId}
                    onSelect={batchEditor.setSelectedItem}
                    onRemove={batchEditor.removeItem}
                  />
                  <BatchDropzone
                    onFilesSelect={batchEditor.loadFiles}
                    isProcessing={batchEditor.state.processing.isProcessing}
                    existingCount={batchEditor.state.items.length}
                  />
                </div>

                {/* Main editor area */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
                  {/* Left: Preview */}
                  <div className="order-1">
                    <BatchPreview
                      imageData={batchEditor.getDisplayImageData()}
                      currentIndex={batchEditor.getSelectedIndex()}
                      totalCount={batchEditor.state.items.length}
                      onNavigate={batchEditor.navigateSelection}
                    />
                  </div>

                  {/* Right: Controls */}
                  <div className="order-2 space-y-4">
                    <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/50">
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Adjustments</h3>
                      <AdjustmentSliders values={batchEditor.state.adjustments} onChange={batchEditor.setAdjustment} />
                    </div>

                    <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/50">
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Filters</h3>
                      <FilterButtons
                        activeFilter={batchEditor.state.activeFilter}
                        blurRadius={batchEditor.state.blurRadius}
                        onFilterSelect={batchEditor.setFilter}
                        onBlurRadiusChange={batchEditor.setBlurRadius}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={batchEditor.clearAll}
                        className="px-3 py-2.5 rounded-lg bg-stone-800/50 border border-stone-700/50 text-stone-400 text-sm
                          hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                      >
                        Clear
                      </button>
                      <button
                        onClick={batchEditor.reset}
                        disabled={!batchHasModifications}
                        className="px-3 py-2.5 rounded-lg bg-stone-800/50 border border-stone-700/50 text-stone-400 text-sm
                          hover:bg-stone-700/50 hover:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Reset
                      </button>
                      <button
                        onClick={batchEditor.processAndDownloadZip}
                        disabled={readyCount === 0}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 text-sm font-semibold
                          hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        ZIP ({readyCount})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
