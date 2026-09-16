import React, { useState } from 'react';
import {
  Sliders,
  Palette,
  Maximize2,
  Grid,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Hash,
  Wand2,
  ShieldCheck,
  Box,
  RefreshCw,
  Minus,
  Plus,
  Link2,
  Link2Off,
  Ratio,
  SlidersHorizontal,
  Info,
  Move,
} from 'lucide-react';
import {
  DotShape,
  DitherMode,
  LegoColor,
  MosaicSettings,
  PalettePresetKey,
  PieceFamily,
  PieceSizePreference,
  OptimizationSummary,
} from '../types';
import { OFFICIAL_BASEPLATES } from '../data/baseplates';
import { OFFICIAL_LEGO_COLORS, PALETTE_PRESETS } from '../data/legoColors';

interface ControlsPanelProps {
  settings: MosaicSettings;
  onUpdateSettings: (newSettings: Partial<MosaicSettings>) => void;
  highlightedColorId: string | null;
  onHighlightColor: (colorId: string | null) => void;
  uniqueColorsInMosaic: LegoColor[];
  optimization?: OptimizationSummary | null;
  onRelaunchOptimization?: () => void;
  imageDimensions?: { width: number; height: number } | null;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onUpdateSettings,
  highlightedColorId,
  onHighlightColor,
  uniqueColorsInMosaic,
  optimization,
  onRelaunchOptimization,
  imageDimensions,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'palette' | 'style'>('base');
  const [isRelaunching, setIsRelaunching] = useState(false);

  // Custom rows and columns controls on the baseplate
  const [gridSizingMode, setGridSizingMode] = useState<'studs' | 'plates'>('studs');
  const [isAspectLocked, setIsAspectLocked] = useState(false);
  const [allowExpand, setAllowExpand] = useState(false);

  const currentPreset = OFFICIAL_BASEPLATES.find((p) => p.id === settings.baseplatePresetId) || OFFICIAL_BASEPLATES[0];
  const baseWidth = currentPreset.width;
  const baseHeight = currentPreset.height;
  const maxAllowedWidth = allowExpand ? 96 : baseWidth;
  const maxAllowedHeight = allowExpand ? 96 : baseHeight;

  const isFullBase = settings.width === baseWidth && settings.height === baseHeight;
  const usedStuds = settings.width * settings.height;
  const utilizationPct = Math.min(100, Math.round((usedStuds / currentPreset.totalStuds) * 100));

  const subPlatesX = Math.ceil(settings.width / 16);
  const subPlatesY = Math.ceil(settings.height / 16);
  const totalSubPlates = subPlatesX * subPlatesY;
  const physicalW = (settings.width * 0.8).toFixed(1);
  const physicalH = (settings.height * 0.8).toFixed(1);

  const emptyCols = Math.max(0, baseWidth - settings.width);
  const emptyRows = Math.max(0, baseHeight - settings.height);

  const calculatedActiveStartX = Math.floor(emptyCols / 2);
  const calculatedActiveStartY = Math.floor(emptyRows / 2);

  const handlePresetSelect = (presetId: string) => {
    const preset = OFFICIAL_BASEPLATES.find((p) => p.id === presetId);
    if (preset) {
      // By default all the base is used
      onUpdateSettings({
        baseplatePresetId: preset.id,
        width: preset.width,
        height: preset.height,
      });
    }
  };

  const handleSetWidth = (newWidth: number) => {
    const clampedW = Math.max(4, Math.min(maxAllowedWidth, Math.round(newWidth)));
    if (isAspectLocked && settings.width > 0) {
      const ratio = settings.height / settings.width;
      const newH = Math.max(4, Math.min(maxAllowedHeight, Math.round(clampedW * ratio)));
      onUpdateSettings({ width: clampedW, height: newH });
    } else {
      onUpdateSettings({ width: clampedW });
    }
  };

  const handleSetHeight = (newHeight: number) => {
    const clampedH = Math.max(4, Math.min(maxAllowedHeight, Math.round(newHeight)));
    if (isAspectLocked && settings.height > 0) {
      const ratio = settings.width / settings.height;
      const newW = Math.max(4, Math.min(maxAllowedWidth, Math.round(clampedH * ratio)));
      onUpdateSettings({ width: newW, height: clampedH });
    } else {
      onUpdateSettings({ height: clampedH });
    }
  };

  const handleResetToFullBase = () => {
    onUpdateSettings({
      width: baseWidth,
      height: baseHeight,
    });
  };

  const handleMatchPhotoRatio = () => {
    if (!imageDimensions || imageDimensions.width <= 0 || imageDimensions.height <= 0) return;
    const aspect = imageDimensions.width / imageDimensions.height;
    let targetW = baseWidth;
    let targetH = Math.round(baseWidth / aspect);
    if (targetH > baseHeight) {
      targetH = baseHeight;
      targetW = Math.round(baseHeight * aspect);
    }
    targetW = Math.max(4, Math.min(baseWidth, targetW));
    targetH = Math.max(4, Math.min(baseHeight, targetH));
    onUpdateSettings({ width: targetW, height: targetH });
  };

  const handleSetSquare = () => {
    const maxSide = Math.min(baseWidth, baseHeight);
    const side = Math.min(settings.width, settings.height, maxSide);
    onUpdateSettings({ width: side, height: side });
  };

  const handlePlateStep = (axis: 'cols' | 'rows', delta: number) => {
    if (axis === 'cols') {
      const currentPlates = Math.max(1, Math.round(settings.width / 16));
      const maxPlates = Math.max(1, Math.floor(maxAllowedWidth / 16));
      const newPlates = Math.min(maxPlates, Math.max(1, currentPlates + delta));
      const newWidth = newPlates * 16;
      if (isAspectLocked && settings.width > 0) {
        const ratio = settings.height / settings.width;
        const newH = Math.max(16, Math.min(maxAllowedHeight, Math.round((newWidth * ratio) / 16) * 16));
        onUpdateSettings({ width: newWidth, height: newH });
      } else {
        onUpdateSettings({ width: newWidth });
      }
    } else {
      const currentPlates = Math.max(1, Math.round(settings.height / 16));
      const maxPlates = Math.max(1, Math.floor(maxAllowedHeight / 16));
      const newPlates = Math.min(maxPlates, Math.max(1, currentPlates + delta));
      const newHeight = newPlates * 16;
      if (isAspectLocked && settings.height > 0) {
        const ratio = settings.width / settings.height;
        const newW = Math.max(16, Math.min(maxAllowedWidth, Math.round((newHeight * ratio) / 16) * 16));
        onUpdateSettings({ width: newW, height: newHeight });
      } else {
        onUpdateSettings({ height: newHeight });
      }
    }
  };

  const handlePalettePresetSelect = (presetKey: PalettePresetKey) => {
    const preset = PALETTE_PRESETS.find((p) => p.id === presetKey);
    if (preset) {
      onUpdateSettings({
        palettePreset: presetKey,
        selectedColorIds: preset.colorIds,
        maxColors: preset.colorIds.length <= 16 ? preset.colorIds.length : Math.min(settings.maxColors, preset.colorIds.length),
      });
    }
  };

  const toggleColor = (colorId: string) => {
    const current = [...settings.selectedColorIds];
    const index = current.indexOf(colorId);
    let updated: string[];

    if (index >= 0) {
      // Don't allow deselecting everything
      if (current.length <= 2) {
        alert('A minimum of 2 colors is required.');
        return;
      }
      updated = current.filter((id) => id !== colorId);
    } else {
      updated = [...current, colorId];
    }

    onUpdateSettings({
      selectedColorIds: updated,
      palettePreset: 'custom',
    });
  };

  const selectAllColors = () => {
    onUpdateSettings({
      selectedColorIds: OFFICIAL_LEGO_COLORS.map((c) => c.id),
      palettePreset: 'all',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 bg-slate-950/80 border-b border-slate-800 p-1.5 gap-1">
        <button
          id="tab-base-btn"
          onClick={() => setActiveTab('base')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'base'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Base & Size</span>
        </button>

        <button
          id="tab-palette-btn"
          onClick={() => setActiveTab('palette')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'palette'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Colors ({settings.maxColors})</span>
        </button>

        <button
          id="tab-style-btn"
          onClick={() => setActiveTab('style')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'style'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Style & Optics</span>
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* ================= TAB 1: BASE & SIZE ================= */}
        {activeTab === 'base' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Official LEGO® Baseplate Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OFFICIAL_BASEPLATES.map((preset) => {
                  const isSelected = settings.baseplatePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`baseplate-preset-${preset.id}`}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{preset.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400/90 font-mono">
                        <span>{preset.totalStuds.toLocaleString()} studs</span>
                        <span>{preset.physicalSizeCm.split(' ')[0]} cm</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= SMART ROWS & COLUMNS SECTION ================= */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Plate Rows & Columns to Use
                  </label>
                </div>
                {isFullBase ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Full Base (100%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {utilizationPct}% Base Used
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Define how many stud columns and rows to fill on the baseplate. By default, the entire baseplate is used.
              </p>

              {/* Visual Plate Schematic & Utilization Mini-Map */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono text-slate-300">
                    <span className="text-amber-400 font-bold">{settings.width} cols</span>
                    <span className="text-slate-500">×</span>
                    <span className="text-amber-400 font-bold">{settings.height} rows</span>
                    <span className="text-slate-500">({usedStuds.toLocaleString()} studs)</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    {physicalW} × {physicalH} cm
                  </div>
                </div>

                {/* Interactive visual representation of plate */}
                <div className="relative w-full h-24 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-hidden p-2">
                  {/* Subtle LEGO stud background pattern for physical plate */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                      backgroundSize: '8px 8px',
                    }}
                  />

                  {/* Outer baseplate reference bounds */}
                  <div
                    className="relative border border-dashed border-slate-700 rounded transition-all duration-300"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: `${Math.min(100, (baseWidth / Math.max(baseWidth, baseHeight)) * 100)}%`,
                      maxHeight: `${Math.min(100, (baseHeight / Math.max(baseWidth, baseHeight)) * 100)}%`,
                    }}
                  >
                    {/* Active used studs area */}
                    <div
                      className="bg-amber-500/25 border-2 border-amber-400 rounded transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-500/10 absolute"
                      style={{
                        width: `${Math.min(100, Math.max(12, (settings.width / baseWidth) * 100))}%`,
                        height: `${Math.min(100, Math.max(12, (settings.height / baseHeight) * 100))}%`,
                        left: `${(calculatedActiveStartX / baseWidth) * 100}%`,
                        top: `${(calculatedActiveStartY / baseHeight) * 100}%`,
                      }}
                    >
                      <span className="text-[10px] font-mono font-bold text-amber-300 leading-tight">
                        {settings.width}×{settings.height}
                      </span>
                      <span className="text-[8px] text-amber-200/80 font-mono hidden sm:inline">
                        {subPlatesX}×{subPlatesY} plates
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subplate & physical summary */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <div>
                    <span className="text-slate-500">Subplates: </span>
                    <span className="text-slate-300 font-semibold">{totalSubPlates}× (16×16)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Base capacity: </span>
                    <span className="text-slate-300">{baseWidth}×{baseHeight} ({currentPreset.totalStuds})</span>
                  </div>
                </div>
              </div>

              {/* Smart Quick Action Chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  id="btn-full-base"
                  type="button"
                  onClick={handleResetToFullBase}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isFullBase
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Reset to use the entire baseplate"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Full Base ({baseWidth}×{baseHeight})</span>
                </button>

                {imageDimensions && (
                  <button
                    id="btn-match-photo-ratio"
                    type="button"
                    onClick={handleMatchPhotoRatio}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-slate-800 transition flex items-center gap-1.5"
                    title="Calculate best rows and columns to fit your uploaded photo without cropping"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Match Photo Ratio</span>
                  </button>
                )}

                <button
                  id="btn-set-square"
                  type="button"
                  onClick={handleSetSquare}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
                  title="Set equal rows and columns (1:1 square)"
                >
                  <Ratio className="w-3 h-3 text-sky-400" />
                  <span>Square (1:1)</span>
                </button>

                <button
                  id="btn-lock-aspect"
                  type="button"
                  onClick={() => setIsAspectLocked(!isAspectLocked)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                    isAspectLocked
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                  title={isAspectLocked ? 'Aspect ratio locked' : 'Lock aspect ratio when adjusting dimensions'}
                >
                  {isAspectLocked ? (
                    <>
                      <Link2 className="w-3 h-3 text-amber-400" />
                      <span>Ratio Locked</span>
                    </>
                  ) : (
                    <>
                      <Link2Off className="w-3 h-3 text-slate-500" />
                      <span>Lock Ratio</span>
                    </>
                  )}
                </button>
              </div>

              {/* Baseplate Balanced Centering Info */}
              {!isFullBase && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-slate-300">
                      <strong className="text-amber-300 font-mono">{settings.width}×{settings.height}</strong> artwork centered on <strong className="text-slate-100 font-mono">{baseWidth}×{baseHeight}</strong> plate
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {emptyCols} empty cols • {emptyRows} empty rows
                  </span>
                </div>
              )}

              {/* Mode Switcher: By Studs vs By 16x16 Plates */}
              <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  id="mode-by-studs-btn"
                  type="button"
                  onClick={() => setGridSizingMode('studs')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    gridSizingMode === 'studs'
                      ? 'bg-slate-800 text-amber-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>By Studs (Exact)</span>
                </button>
                <button
                  id="mode-by-plates-btn"
                  type="button"
                  onClick={() => setGridSizingMode('plates')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    gridSizingMode === 'plates'
                      ? 'bg-slate-800 text-amber-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>By 16×16 Plates</span>
                </button>
              </div>

              {/* MODE A: BY STUDS */}
              {gridSizingMode === 'studs' && (
                <div className="space-y-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  {/* Columns (Width) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Columns (Width)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {(settings.width * 0.8).toFixed(1)} cm
                        </span>
                        <span className="text-amber-400 font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {settings.width} studs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width - 16)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="-16 studs"
                      >
                        -16
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width - 4)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="-4 studs"
                      >
                        -4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width - 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="-1 stud"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        id="slider-width-studs"
                        type="range"
                        min="8"
                        max={maxAllowedWidth}
                        step="1"
                        value={settings.width}
                        onChange={(e) => handleSetWidth(parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width + 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="+1 stud"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width + 4)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="+4 studs"
                      >
                        +4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetWidth(settings.width + 16)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="+16 studs"
                      >
                        +16
                      </button>
                    </div>
                  </div>

                  {/* Rows (Height) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Rows (Height)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {(settings.height * 0.8).toFixed(1)} cm
                        </span>
                        <span className="text-amber-400 font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {settings.height} studs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height - 16)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="-16 studs"
                      >
                        -16
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height - 4)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="-4 studs"
                      >
                        -4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height - 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="-1 stud"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        id="slider-height-studs"
                        type="range"
                        min="8"
                        max={maxAllowedHeight}
                        step="1"
                        value={settings.height}
                        onChange={(e) => handleSetHeight(parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height + 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="+1 stud"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height + 4)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="+4 studs"
                      >
                        +4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetHeight(settings.height + 16)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-semibold"
                        title="+16 studs"
                      >
                        +16
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE B: BY 16x16 PLATES */}
              {gridSizingMode === 'plates' && (
                <div className="space-y-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Modular 16×16 plates (each plate is 16 studs = 12.8 cm)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Plate Columns */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] text-slate-300 font-semibold flex justify-between">
                        <span>Plate Columns</span>
                        <span className="text-amber-400 font-mono font-bold">{settings.width} studs</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlateStep('cols', -1)}
                          disabled={subPlatesX <= 1}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white">
                          {subPlatesX} {subPlatesX === 1 ? 'plate' : 'plates'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlateStep('cols', 1)}
                          disabled={subPlatesX >= Math.floor(maxAllowedWidth / 16)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Plate Rows */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] text-slate-300 font-semibold flex justify-between">
                        <span>Plate Rows</span>
                        <span className="text-amber-400 font-mono font-bold">{settings.height} studs</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlateStep('rows', -1)}
                          disabled={subPlatesY <= 1}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white">
                          {subPlatesY} {subPlatesY === 1 ? 'plate' : 'plates'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlateStep('rows', 1)}
                          disabled={subPlatesY >= Math.floor(maxAllowedHeight / 16)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expansion option */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowExpand}
                    onChange={(e) => setAllowExpand(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Allow custom expansion beyond preset (up to 96 studs)</span>
                </label>
                {!isFullBase && (
                  <button
                    type="button"
                    onClick={handleResetToFullBase}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to full base</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resize, Framing & Crop controls */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Picture Framing & Position
              </label>

              {/* Scale Mode */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="scale-cover-btn"
                  onClick={() => onUpdateSettings({ scaleMode: 'cover' })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    settings.scaleMode === 'cover'
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fill Entire Base (Cover)
                </button>
                <button
                  id="scale-contain-btn"
                  onClick={() => onUpdateSettings({ scaleMode: 'contain' })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    settings.scaleMode === 'contain'
                      ? 'border-amber-500 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fit Entire Photo (Contain)
                </button>
              </div>

              {/* Zoom slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Photo Zoom</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {Math.round(settings.zoom * 100)}%
                  </span>
                </div>
                <input
                  id="zoom-slider"
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={settings.zoom}
                  onChange={(e) => onUpdateSettings({ zoom: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Picture Crop & Panning Controls */}
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Use zoom and shift to pan across the picture and crop on the desired focal area.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Horizontal Shift */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">Horizontal Pan</span>
                      <span className="text-slate-200 font-mono font-semibold">
                        {settings.offsetX === 0 ? 'Center (0%)' : `${settings.offsetX > 0 ? '+' : ''}${settings.offsetX}%`}
                      </span>
                    </div>
                    <input
                      id="offset-x-slider"
                      type="range"
                      min="-50"
                      max="50"
                      value={settings.offsetX}
                      onChange={(e) => onUpdateSettings({ offsetX: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Left (-50%)</span>
                      <span className={settings.offsetX === 0 ? 'text-amber-400 font-bold' : ''}>0%</span>
                      <span>Right (+50%)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetX: -50 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetX === -50
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Pan crop to the left side of the picture"
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetX: 0 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetX === 0
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Center picture horizontally"
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetX: 50 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetX === 50
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Pan crop to the right side of the picture"
                      >
                        Right
                      </button>
                    </div>
                  </div>

                  {/* Vertical Shift */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-400">Vertical Pan</span>
                      <span className="text-slate-200 font-mono font-semibold">
                        {settings.offsetY === 0 ? 'Center (0%)' : `${settings.offsetY > 0 ? '+' : ''}${settings.offsetY}%`}
                      </span>
                    </div>
                    <input
                      id="offset-y-slider"
                      type="range"
                      min="-50"
                      max="50"
                      value={settings.offsetY}
                      onChange={(e) => onUpdateSettings({ offsetY: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Top (-50%)</span>
                      <span className={settings.offsetY === 0 ? 'text-amber-400 font-bold' : ''}>0%</span>
                      <span>Bottom (+50%)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetY: -50 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetY === -50
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Pan crop to the top side of the picture"
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetY: 0 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetY === 0
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Center picture vertically"
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ offsetY: 50 })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition ${
                          settings.offsetY === 50
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                        title="Pan crop to the bottom side of the picture"
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {(settings.zoom !== 1 || settings.offsetX !== 0 || settings.offsetY !== 0) && (
                <button
                  onClick={() => onUpdateSettings({ zoom: 1, offsetX: 0, offsetY: 0 })}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold pt-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset photo zoom & framing
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PALETTE & COLORS ================= */}
        {activeTab === 'palette' && (
          <div className="space-y-5">
            {/* Number of Colors Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Number of Colors to Use
                </label>
                <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {settings.maxColors} Colors
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Fewer colors yield clean graphic LEGO® poster style; more colors give high photographic realism.
              </p>
              <input
                id="max-colors-slider"
                type="range"
                min="2"
                max={Math.min(36, settings.selectedColorIds.length)}
                value={settings.maxColors}
                onChange={(e) => onUpdateSettings({ maxColors: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>2 (Minimalist)</span>
                <span>8 (Standard Art)</span>
                <span>16 (Rich)</span>
                <span>{Math.min(36, settings.selectedColorIds.length)} (Max)</span>
              </div>
            </div>

            {/* Color Palette Presets */}
            <div className="border-t border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Official Color Palette Presets
              </label>
              <div className="space-y-2">
                {PALETTE_PRESETS.map((preset) => {
                  const isSelected = settings.palettePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`palette-preset-${preset.id}`}
                      onClick={() => handlePalettePresetSelect(preset.id as PalettePresetKey)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="pr-3">
                        <span className="text-xs font-bold block">{preset.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {preset.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Preview dot swatches */}
                        <div className="flex -space-x-1">
                          {preset.colorIds.slice(0, 5).map((cid) => {
                            const c = OFFICIAL_LEGO_COLORS.find((x) => x.id === cid);
                            return c ? (
                              <div
                                key={cid}
                                className="w-3.5 h-3.5 rounded-full border border-slate-900 shadow-sm"
                                style={{ backgroundColor: c.hex }}
                              />
                            ) : null;
                          })}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 ml-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Official Color Toggles */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available Official LEGO® Colors ({settings.selectedColorIds.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllColors}
                    className="text-[11px] font-semibold text-amber-400 hover:underline"
                  >
                    Select All
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Click any color to enable or disable it from the mosaic engine.
              </p>

              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {OFFICIAL_LEGO_COLORS.map((color) => {
                  const isChecked = settings.selectedColorIds.includes(color.id);
                  const isHighlighted = highlightedColorId === color.id;
                  return (
                    <div
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`flex items-center justify-between p-1.5 rounded-lg border text-left cursor-pointer transition select-none ${
                        isChecked
                          ? 'border-slate-700/80 bg-slate-800/40 text-slate-200'
                          : 'border-slate-800/40 bg-slate-950/30 opacity-40 text-slate-500'
                      } ${isHighlighted ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="min-w-4 h-4 px-0.5 rounded-full border border-white/20 shrink-0 shadow-sm flex items-center justify-center text-[7px] font-bold"
                          style={{ backgroundColor: color.hex, color: color.textColor }}
                        >
                          {color.symbol}
                        </div>
                        <span className="text-[11px] font-medium truncate">{color.legoName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono ml-1 shrink-0">
                        #{color.bricklinkId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: STYLE & OPTICS ================= */}
        {activeTab === 'style' && (
          <div className="space-y-5">
            {/* Multi-Piece Area Coverage (Tiles & Plates Consolidation) - Placed ON TOP of Dot Shape */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Multi-Piece Area Coverage
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-400 text-slate-950 uppercase">
                      New
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Calculates which larger square and rectangular pieces (2×2, 2×3, 2×4, etc.) cover contiguous color areas to reduce piece count and speed up assembly.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    id="enable-optimization-toggle"
                    type="checkbox"
                    checked={settings.enableOptimization ?? false}
                    onChange={(e) => onUpdateSettings({ enableOptimization: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {settings.enableOptimization && (
                <div className="space-y-3.5 pt-1 border-t border-slate-800/80">
                  {/* Family Selection: Tiles vs Plates (Strict constraint: do not mix tiles with plates) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        Piece Part Type
                      </span>
                      <span className="text-[10px] text-amber-400/90 font-mono">
                        Do not mix tiles with plates
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="opt-family-tile-btn"
                        type="button"
                        onClick={() => onUpdateSettings({ optimizationFamily: 'tile' })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          settings.optimizationFamily === 'tile'
                            ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">Smooth Tiles</span>
                          {settings.optimizationFamily === 'tile' && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          2×4, 2×3, 2×2, 1×4, 1×3, 1×2 & 1×1 flat tiles with grooved border
                        </p>
                      </button>

                      <button
                        id="opt-family-plate-btn"
                        type="button"
                        onClick={() => onUpdateSettings({ optimizationFamily: 'plate' })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          settings.optimizationFamily === 'plate'
                            ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400/50'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">Studded Plates</span>
                          {settings.optimizationFamily === 'plate' && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          2×4, 2×3, 2×2, 1×4, 1×3, 1×2 & 1×1 classic plates with LEGO® studs
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Size Preference Setting: Bigger vs Smaller Pieces */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        Piece Size Preference
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Relaunches calculation
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        {
                          id: 'bigger',
                          label: 'Bigger Pieces',
                          sub: 'Max 2×4, 2×3, 2×2',
                          desc: 'Fewest total parts',
                        },
                        {
                          id: 'medium',
                          label: 'Medium Mix',
                          sub: 'Up to 2×3, 2×2',
                          desc: 'Balanced masonry',
                        },
                        {
                          id: 'smaller',
                          label: 'Smaller Pieces',
                          sub: 'Max 2×2 squares',
                          desc: 'Modular detail',
                        },
                      ].map((item) => {
                        const isSelected = (settings.pieceSizePreference ?? 'bigger') === item.id;
                        return (
                          <button
                            key={item.id}
                            id={`opt-size-${item.id}-btn`}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({ pieceSizePreference: item.id as PieceSizePreference });
                              if (onRelaunchOptimization) onRelaunchOptimization();
                            }}
                            className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400/40'
                                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold block">{item.label}</span>
                            <span className="text-[9px] text-amber-300 font-mono mt-0.5">{item.sub}</span>
                            <span className="text-[9px] text-slate-500">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Relaunch Calculation Action Button */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      id="relaunch-optimization-btn"
                      type="button"
                      onClick={() => {
                        setIsRelaunching(true);
                        if (onRelaunchOptimization) {
                          onRelaunchOptimization();
                        } else {
                          // Trigger re-render with updated timestamp or state
                          onUpdateSettings({
                            pieceSizePreference: settings.pieceSizePreference || 'bigger',
                          });
                        }
                        setTimeout(() => setIsRelaunching(false), 600);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-[0.99]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRelaunching ? 'animate-spin' : ''}`} />
                      <span>{isRelaunching ? 'Recalculating Coverage...' : 'Relaunch Piece Calculation'}</span>
                    </button>
                  </div>

                  {/* Optimization Results Live Metric */}
                  {optimization && (
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Parts:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="line-through text-slate-500 text-[10px]">
                            {optimization.originalDots.toLocaleString()} studs
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {optimization.totalPieces.toLocaleString()} pieces
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            -{optimization.reductionPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Top piece shapes breakdown chips */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                        {optimization.countsByPieceType.slice(0, 5).map((t) => (
                          <span
                            key={t.studDims}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
                          >
                            {t.studDims}: <strong className="text-amber-300">×{t.count}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 1x1 Dot Shape */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1×1 Dot Shape & Part Type {settings.enableOptimization && <span className="text-slate-500 font-normal lowercase">(for single studs)</span>}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'round_tile',
                    name: '1×1 Round Tile',
                    desc: 'Smooth top (Part #98138, Official LEGO® Art)',
                  },
                  {
                    id: 'round_plate',
                    name: '1×1 Round Plate',
                    desc: 'Classic stud with "LEGO®" logo (Part #4073)',
                  },
                  {
                    id: 'square_tile',
                    name: '1×1 Square Tile',
                    desc: 'Smooth flat tile with groove (Part #3070b)',
                  },
                  {
                    id: 'square_plate',
                    name: '1×1 Square Plate',
                    desc: 'Standard square plate (Part #3024)',
                  },
                ].map((item) => {
                  const isSelected = settings.dotShape === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`dot-shape-${item.id}`}
                      onClick={() => onUpdateSettings({ dotShape: item.id as DotShape })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dithering Mode */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Mosaic Dithering Engine
                </label>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Wand2 className="w-3 h-3" />
                  LEGO® Studio Grade
                </span>
              </div>

              {/* Primary Dithering Algorithm Selection */}
              <div className="space-y-2">
                {[
                  {
                    id: 'lego_mosaic',
                    name: 'LEGO® Mosaic Maker (Official Store Algorithm)',
                    desc: 'Serpentine scanning with edge-aware contour preservation & clamped error diffusion. Eliminates diagonal worm artifacts and keeps eyes/facial features crisp.',
                    badge: 'Recommended',
                  },
                  {
                    id: 'ordered_bayer',
                    name: 'Ordered Halftone Matrix (Bayer 8×8)',
                    desc: 'Structured retro pop-art dot grid. Perfectly rhythmic studio shading without random noisy specks or isolated orphan studs.',
                    badge: 'Clean Pop Art',
                  },
                  {
                    id: 'none',
                    name: 'Clean Posterized (No Dithering)',
                    desc: 'Flat solid color regions without any color mixing.',
                    badge: 'Minimalist',
                  },
                  {
                    id: 'floyd_steinberg',
                    name: 'Floyd-Steinberg (Classic)',
                    desc: 'Standard error diffusion across 4 neighboring pixels.',
                    badge: 'Standard',
                  },
                  {
                    id: 'atkinson',
                    name: 'Atkinson Halftone (Classic Mac)',
                    desc: 'Vintage Apple 3/4 error diffusion with high contrast.',
                    badge: 'Retro',
                  },
                ].map((item) => {
                  const isSelected = settings.ditherMode === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`dither-mode-${item.id}`}
                      onClick={() => onUpdateSettings({ ditherMode: item.id as DitherMode })}
                      className={`w-full p-2.5 rounded-xl border text-left transition relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          {item.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Dithering Strength Slider (when active) */}
              {settings.ditherMode !== 'none' && (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      Diffusion Strength
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      {settings.ditherStrength ?? 65}%
                    </span>
                  </div>
                  <input
                    id="dither-strength-slider"
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={settings.ditherStrength ?? 65}
                    onChange={(e) =>
                      onUpdateSettings({ ditherStrength: parseInt(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Subtle shading (smoother)</span>
                    <span>High diffusion</span>
                  </div>
                </div>
              )}

              {/* Facial & Contour Sharpening (Unsharp Mask) */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">
                    Contour & Eye Sharpening (Unsharp Mask)
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    {settings.sharpness ?? 35}%
                  </span>
                </div>
                <input
                  id="sharpness-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.sharpness ?? 35}
                  onChange={(e) => onUpdateSettings({ sharpness: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Prevents key facial features (eyes, nose, eyebrows, hair) from turning into blurry noise when downscaled to stud resolution.
                </p>
              </div>

              {/* Smart Despeckle / Orphan Studs Filter */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Clean Stray Orphan Studs (Despeckle)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Removes isolated single dots that make mosaics look noisy or dirty, merging them with the natural background.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    id="clean-orphans-toggle"
                    type="checkbox"
                    checked={settings.cleanOrphans ?? true}
                    onChange={(e) => onUpdateSettings({ cleanOrphans: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Image Tuning: Brightness, Contrast, Saturation */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Photographic Tuning
              </label>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Contrast</span>
                  <span className="text-slate-200 font-mono">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}%</span>
                </div>
                <input
                  id="contrast-slider"
                  type="range"
                  min="-40"
                  max="40"
                  value={settings.contrast}
                  onChange={(e) => onUpdateSettings({ contrast: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Brightness</span>
                  <span className="text-slate-200 font-mono">{settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}%</span>
                </div>
                <input
                  id="brightness-slider"
                  type="range"
                  min="-40"
                  max="40"
                  value={settings.brightness}
                  onChange={(e) => onUpdateSettings({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Color Saturation</span>
                  <span className="text-slate-200 font-mono">{settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}%</span>
                </div>
                <input
                  id="saturation-slider"
                  type="range"
                  min="-40"
                  max="40"
                  value={settings.saturation}
                  onChange={(e) => onUpdateSettings({ saturation: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Viewport Display Overlays */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Display Overlays
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-300 font-medium">
                  16×16 Subplate Boundaries (LEGO® Art Guide)
                </span>
                <input
                  type="checkbox"
                  checked={settings.showSubplates}
                  onChange={(e) => onUpdateSettings({ showSubplates: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-300 font-medium">1×1 Stud Grid Lines</span>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <span className="text-xs text-slate-300 font-medium">
                  Dot Key Symbols/Numbers on Canvas
                </span>
                <input
                  type="checkbox"
                  checked={settings.showSymbols}
                  onChange={(e) => onUpdateSettings({ showSymbols: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
