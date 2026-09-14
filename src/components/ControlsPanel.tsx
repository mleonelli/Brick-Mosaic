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
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onUpdateSettings,
  highlightedColorId,
  onHighlightColor,
  uniqueColorsInMosaic,
  optimization,
  onRelaunchOptimization,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'palette' | 'style'>('base');
  const [isRelaunching, setIsRelaunching] = useState(false);

  const currentPreset = OFFICIAL_BASEPLATES.find((p) => p.id === settings.baseplatePresetId);

  const handlePresetSelect = (presetId: string) => {
    const preset = OFFICIAL_BASEPLATES.find((p) => p.id === presetId);
    if (preset) {
      onUpdateSettings({
        baseplatePresetId: preset.id,
        width: preset.width,
        height: preset.height,
      });
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
                Official Lego Baseplate Preset
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

              {/* Offset Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Horizontal Shift</span>
                    <span className="text-slate-200 font-mono">{settings.offsetX}%</span>
                  </div>
                  <input
                    id="offset-x-slider"
                    type="range"
                    min="-40"
                    max="40"
                    value={settings.offsetX}
                    onChange={(e) => onUpdateSettings({ offsetX: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Vertical Shift</span>
                    <span className="text-slate-200 font-mono">{settings.offsetY}%</span>
                  </div>
                  <input
                    id="offset-y-slider"
                    type="range"
                    min="-40"
                    max="40"
                    value={settings.offsetY}
                    onChange={(e) => onUpdateSettings({ offsetY: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {(settings.zoom !== 1 || settings.offsetX !== 0 || settings.offsetY !== 0) && (
                <button
                  onClick={() => onUpdateSettings({ zoom: 1, offsetX: 0, offsetY: 0 })}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset framing & zoom
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
                Fewer colors yield clean graphic Lego poster style; more colors give high photographic realism.
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
                  Available Official Lego Colors ({settings.selectedColorIds.length})
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
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm flex items-center justify-center text-[8px] font-bold"
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
                          2×4, 2×3, 2×2, 1×4, 1×3, 1×2 & 1×1 classic plates with Lego studs
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
                    desc: 'Smooth top (Part #98138, Official Lego Art)',
                  },
                  {
                    id: 'round_plate',
                    name: '1×1 Round Plate',
                    desc: 'Classic stud with "LEGO" logo (Part #4073)',
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
                  16×16 Subplate Boundaries (Lego Art Guide)
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
