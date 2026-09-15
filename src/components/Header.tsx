import React from 'react';
import { BookOpen, ShoppingBag, Download, Sparkles, RefreshCw, ZoomIn, ZoomOut, Layers, FolderDown, HelpCircle } from 'lucide-react';
import { BaseplatePreset, MosaicData } from '../types';

interface HeaderProps {
  mosaic: MosaicData | null;
  currentPreset: BaseplatePreset | undefined;
  onOpenGuide: () => void;
  onOpenPdf: () => void;
  onOpenBricklink: () => void;
  onOpenProjectModal: (tab: 'export' | 'import') => void;
  onExportPng: () => void;
  onResetSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mosaic,
  currentPreset,
  onOpenGuide,
  onOpenPdf,
  onOpenBricklink,
  onOpenProjectModal,
  onExportPng,
  onResetSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-red-500 to-yellow-400 p-0.5 shadow-lg shadow-red-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              {/* Lego stud visual */}
              <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-red-400 shadow-inner flex items-center justify-center">
                <span className="text-[6.5px] font-black tracking-tighter text-white select-none">LEGO®</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Brick Mosaic Studio</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                1×1 Dots
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Official LEGO® palettes • Baseplates • Printable PDF Instructions • BrickLink Orders
            </p>
          </div>
        </div>

        {/* Current Info & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {mosaic && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-200">
                  {mosaic.width}×{mosaic.height}
                </span>
                <span className="text-slate-400">({mosaic.totalDots.toLocaleString()} dots)</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">{mosaic.uniqueColors.length} colors</span>
              </div>
            </div>
          )}

          {/* How-To Guide Button */}
          <button
            id="open-guide-btn"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
            title="Read comprehensive how-to guide for Brick Mosaic Studio"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Guide</span>
          </button>

          {/* Project Export/Import Button */}
          <button
            id="open-project-btn"
            onClick={() => onOpenProjectModal('export')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
            title="Save or load project (.brickmosaic) to continue working anytime"
          >
            <FolderDown className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">Project</span>
          </button>

          {/* BrickLink List Button */}
          <button
            id="open-bricklink-btn"
            onClick={onOpenBricklink}
            disabled={!mosaic}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Create BrickLink parts list for immediate purchase"
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span className="hidden xs:inline">BrickLink List</span>
          </button>

          {/* PDF Instruction Manual Button */}
          <button
            id="open-pdf-btn"
            onClick={onOpenPdf}
            disabled={!mosaic}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export printable official LEGO® Art instruction booklet"
          >
            <BookOpen className="w-4 h-4" />
            <span>PDF Manual</span>
          </button>

          {/* PNG Export Button */}
          <button
            id="export-png-btn"
            onClick={onExportPng}
            disabled={!mosaic}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Mosaic Image (PNG)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
