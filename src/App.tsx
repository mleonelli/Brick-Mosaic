import React, { useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MosaicCanvas } from './components/MosaicCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { PartListModal } from './components/PartListModal';
import { PdfModal } from './components/PdfModal';
import { ProjectModal } from './components/ProjectModal';
import { LegoColor, MosaicData, MosaicSettings } from './types';
import { OFFICIAL_BASEPLATES } from './data/baseplates';
import { OFFICIAL_LEGO_COLORS } from './data/legoColors';
import { SAMPLE_IMAGES } from './data/sampleImages';
import { DEFAULT_SETTINGS } from './data/defaultSettings';
import { generateMosaicFromImage } from './utils/colorMatcher';
import { getLegoPartNumber } from './utils/bricklinkExport';
import { importProject } from './utils/projectManager';
import { calculatePieceOptimization } from './utils/pieceOptimizer';
import { Sparkles, ShoppingBag, BookOpen, Layers, Check, FolderDown, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<MosaicSettings>(DEFAULT_SETTINGS);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('Mona Lisa');
  const [mosaicData, setMosaicData] = useState<MosaicData | null>(null);
  const [highlightedColorId, setHighlightedColorId] = useState<string | null>(null);
  const [optimizationNonce, setOptimizationNonce] = useState(0);

  // Modals
  const [isBrickLinkOpen, setIsBrickLinkOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState<'export' | 'import'>('export');
  const [projectToast, setProjectToast] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // Multi-piece optimization calculation (tiles/plates covering bigger areas like 2x2, 2x3, 2x4)
  const optimizationSummary = useMemo(() => {
    if (!mosaicData) return null;
    return calculatePieceOptimization(
      mosaicData,
      settings.optimizationFamily || 'tile',
      settings.pieceSizePreference || 'bigger'
    );
  }, [mosaicData, settings.optimizationFamily, settings.pieceSizePreference, optimizationNonce]);

  const handleRelaunchOptimization = useCallback(() => {
    setOptimizationNonce((n) => n + 1);
  }, []);

  // Load initial sample image on mount so user sees a working Lego mosaic immediately!
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      setImageName(initialSample.name);
    };
    img.src = initialSample.thumbnailUrl;
  }, []);

  // Recalculate mosaic when image or settings change
  useEffect(() => {
    if (!imageElement) return;

    try {
      const generated = generateMosaicFromImage(imageElement, settings, OFFICIAL_LEGO_COLORS);
      setMosaicData(generated);
    } catch (err) {
      console.error('Failed to generate mosaic', err);
    }
  }, [imageElement, settings]);

  const handleUpdateSettings = useCallback((newSettings: Partial<MosaicSettings>) => {
    startTransition(() => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    });
  }, []);

  const handleImageSelect = useCallback((img: HTMLImageElement, name: string) => {
    setImageElement(img);
    setImageName(name);
  }, []);

  const handleExportPng = () => {
    if (!mosaicData) return;
    const { width, height, pixels } = mosaicData;
    const exportCanvas = document.createElement('canvas');
    const dotSize = 16; // 16px per stud for high-res PNG export
    exportCanvas.width = width * dotSize;
    exportCanvas.height = height * dotSize;
    const ctx = exportCanvas.getContext('2d')!;

    ctx.fillStyle = '#11141A';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const radius = dotSize * 0.45;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pixels[y][x];
        const cx = x * dotSize + dotSize / 2;
        const cy = y * dotSize + dotSize / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color.hex;
        ctx.fill();

        // Highlight ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 0.5, Math.PI * 0.8, Math.PI * 1.8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const link = document.createElement('a');
    link.download = `${imageName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lego_mosaic_${width}x${height}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleOpenProjectModal = useCallback((tab: 'export' | 'import' = 'export') => {
    setProjectModalTab(tab);
    setIsProjectModalOpen(true);
  }, []);

  const handleImportSuccess = useCallback((restored: {
    settings: MosaicSettings;
    imageElement: HTMLImageElement | null;
    imageName: string;
  }) => {
    setSettings(restored.settings);
    setImageName(restored.imageName);
    if (restored.imageElement) {
      setImageElement(restored.imageElement);
    }
    setProjectToast(`Project "${restored.imageName}" loaded successfully!`);
    setTimeout(() => {
      setProjectToast(null);
    }, 4500);
  }, []);

  const handleDirectFileImport = useCallback(async (file: File) => {
    try {
      const restored = await importProject(file);
      handleImportSuccess(restored);
    } catch (err: any) {
      alert(err?.message || 'Could not load project file.');
    }
  }, [handleImportSuccess]);

  const currentPreset = OFFICIAL_BASEPLATES.find((p) => p.id === settings.baseplatePresetId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        mosaic={mosaicData}
        currentPreset={currentPreset}
        onOpenPdf={() => setIsPdfOpen(true)}
        onOpenBricklink={() => setIsBrickLinkOpen(true)}
        onOpenProjectModal={handleOpenProjectModal}
        onExportPng={handleExportPng}
        onResetSettings={handleResetSettings}
      />

      {/* Floating Project Toast Notification */}
      {projectToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{projectToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Picker & Mosaic Canvas (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Image Uploader & Samples */}
            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImageName={imageName}
              onOpenProjectModal={handleOpenProjectModal}
              onImportFile={handleDirectFileImport}
            />

            {/* Interactive Mosaic Canvas */}
            <MosaicCanvas
              mosaic={mosaicData}
              settings={settings}
              highlightedColorId={highlightedColorId}
              onHighlightColor={setHighlightedColorId}
              optimization={optimizationSummary}
            />

            {/* Active Color Palette Bar (clickable to isolate colors) */}
            {mosaicData && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Active Colors in Mosaic ({mosaicData.uniqueColors.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • Click any color to highlight pieces
                    </span>
                  </div>
                  {highlightedColorId && (
                    <button
                      onClick={() => setHighlightedColorId(null)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Clear isolation
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {mosaicData.uniqueColors.map((color) => {
                    const isSelected = highlightedColorId === color.id;
                    const count = mosaicData.colorCounts.get(color.id)?.count || 0;
                    return (
                      <button
                        key={color.id}
                        id={`palette-dot-${color.id}`}
                        onClick={() =>
                          setHighlightedColorId(isSelected ? null : color.id)
                        }
                        className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs transition ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                        }`}
                        title={`${color.legoName} (BrickLink #${color.bricklinkId}): ${count} pieces`}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0 flex items-center justify-center text-[7px] font-bold"
                          style={{
                            backgroundColor: color.hex,
                            color: color.textColor,
                          }}
                        >
                          {color.symbol}
                        </div>
                        <span className="text-[11px] font-medium truncate max-w-[80px]">
                          {color.legoName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          ×{count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Controls Panel & Export (5 cols on desktop, sticky alongside mosaic) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4">
              <ControlsPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                highlightedColorId={highlightedColorId}
                onHighlightColor={setHighlightedColorId}
                uniqueColorsInMosaic={mosaicData?.uniqueColors || []}
                optimization={optimizationSummary}
                onRelaunchOptimization={handleRelaunchOptimization}
              />

              {/* Quick Export Summary Card */}
              {mosaicData && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Ready to Build?
                      </h4>
                    </div>
                    {settings.enableOptimization && optimizationSummary ? (
                      <div className="text-right">
                        <span className="text-xs font-mono text-emerald-400 font-bold block">
                          {optimizationSummary.totalPieces.toLocaleString()} Pieces
                        </span>
                        <span className="text-[10px] text-emerald-500/90 font-mono">
                          -{optimizationSummary.reductionPercent}% fewer parts
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {mosaicData.totalDots.toLocaleString()} Total Dots
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="quick-pdf-btn"
                      onClick={() => setIsPdfOpen(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition text-center group"
                    >
                      <BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                      <span>PDF Building Manual</span>
                      <span className="text-[10px] text-red-100 font-normal mt-0.5">
                        Printable step-by-step
                      </span>
                    </button>

                    <button
                      id="quick-bricklink-btn"
                      onClick={() => setIsBrickLinkOpen(true)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-slate-600 transition text-center group"
                    >
                      <ShoppingBag className="w-5 h-5 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span>BrickLink Parts List</span>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {settings.enableOptimization ? 'Consolidated pieces' : 'Instant 1-click order'}
                      </span>
                    </button>
                  </div>

                  <button
                    id="quick-save-project-btn"
                    onClick={() => handleOpenProjectModal('export')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700/80 hover:border-amber-500/50 transition shadow-sm"
                    title="Export your project (.brickmosaic) with embedded original picture to continue editing anytime"
                  >
                    <FolderDown className="w-4 h-4 text-amber-400" />
                    <span>Save Project File (.brickmosaic)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Project Export/Import File Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        settings={settings}
        imageElement={imageElement}
        imageName={imageName}
        mosaic={mosaicData}
        initialTab={projectModalTab}
        onImportSuccess={handleImportSuccess}
      />

      {/* BrickLink Parts List & Ordering Modal */}
      <PartListModal
        isOpen={isBrickLinkOpen}
        onClose={() => setIsBrickLinkOpen(false)}
        mosaic={mosaicData}
        dotShape={settings.dotShape}
        optimization={optimizationSummary}
        enableOptimization={settings.enableOptimization}
      />

      {/* Printable PDF Instruction Manual Modal */}
      <PdfModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        mosaic={mosaicData}
        settings={settings}
        defaultProjectName={imageName}
      />
    </div>
  );
}
