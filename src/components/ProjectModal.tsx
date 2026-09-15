import React, { useState, useRef } from 'react';
import {
  X,
  FolderDown,
  FolderUp,
  FileCheck,
  UploadCloud,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { MosaicData, MosaicSettings } from '../types';
import { exportProject, importProject } from '../utils/projectManager';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MosaicSettings;
  imageElement: HTMLImageElement | null;
  imageName: string;
  mosaic: MosaicData | null;
  onImportSuccess: (restored: {
    settings: MosaicSettings;
    imageElement: HTMLImageElement | null;
    imageName: string;
  }) => void;
  initialTab?: 'export' | 'import';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  settings,
  imageElement,
  imageName,
  mosaic,
  onImportSuccess,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [exportName, setExportName] = useState(imageName || 'My LEGO® Mosaic');
  const [embedImage, setEmbedImage] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync export name when modal opens or imageName changes
  React.useEffect(() => {
    if (imageName) {
      setExportName(imageName);
    }
  }, [imageName, isOpen]);

  // Sync tab if prop changes
  React.useEffect(() => {
    setActiveTab(initialTab);
    setImportError(null);
    setSuccessNotice(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportProject(exportName.trim() || 'LEGO® Mosaic', settings, imageElement, embedImage);
      setSuccessNotice('Project file downloaded successfully!');
      setTimeout(() => {
        setSuccessNotice(null);
      }, 3500);
    } catch (err: any) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileProcess = async (file: File) => {
    setImportError(null);
    setSuccessNotice(null);
    setIsImporting(true);

    try {
      const restored = await importProject(file);
      onImportSuccess(restored);
      setSuccessNotice(`Project "${restored.imageName}" loaded successfully!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportError(err?.message || 'Could not parse project file. Please ensure it is a valid .brickmosaic file.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Project File Manager
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  .brickmosaic
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Save your progress or load a previously exported LEGO® mosaic project
              </p>
            </div>
          </div>
          <button
            id="close-project-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold">
          <button
            id="tab-export-project"
            onClick={() => {
              setActiveTab('export');
              setImportError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
              activeTab === 'export'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>Export Project</span>
          </button>
          <button
            id="tab-import-project"
            onClick={() => {
              setActiveTab('import');
              setImportError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl transition ${
              activeTab === 'import'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderUp className="w-4 h-4" />
            <span>Import Project</span>
          </button>
        </div>

        {/* Notifications */}
        {successNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {importError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{importError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'export' ? (
            /* ================= EXPORT TAB ================= */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Project Title
                </label>
                <input
                  id="project-name-input"
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="e.g. Mona Lisa 48x48"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Current Configuration Summary */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Project Specifications
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {settings.width * settings.height} total studs
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Baseplate Size</span>
                    <span className="font-semibold text-slate-200">
                      {settings.width} × {settings.height} studs
                    </span>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Dithering Mode</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {settings.ditherMode.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Colors in Palette</span>
                    <span className="font-semibold text-slate-200">
                      {mosaic?.uniqueColors.length || settings.selectedColorIds.length} active colors
                    </span>
                  </div>
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Stud Shape</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {settings.dotShape.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Embed Original Image Checkbox */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3">
                <input
                  id="embed-image-checkbox"
                  type="checkbox"
                  checked={embedImage}
                  onChange={(e) => setEmbedImage(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 text-amber-500 accent-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="embed-image-checkbox" className="text-xs space-y-0.5 cursor-pointer">
                  <span className="font-bold text-slate-200 block flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Embed original picture directly in the project file
                  </span>
                  <span className="text-slate-400 block leading-relaxed text-[11px]">
                    Stores the full picture inside the <code>.brickmosaic</code> file so you or anyone can open and re-adjust crop, zoom, and filters later on any device without missing files.
                  </span>
                </label>
              </div>

              {/* Download Action Button */}
              <button
                id="confirm-export-project-btn"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Preparing Project File...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Project (.brickmosaic)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ================= IMPORT TAB ================= */
            <div className="space-y-4">
              <div
                id="project-dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="project-file-input"
                  type="file"
                  accept=".brickmosaic,.legomosaic,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isImporting ? (
                      <Clock className="w-7 h-7 animate-spin" />
                    ) : (
                      <UploadCloud className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      {isImporting
                        ? 'Reading and restoring project...'
                        : 'Drag and drop your .brickmosaic file here'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      or click to browse your computer
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Accepts .brickmosaic, .legomosaic, or .json files
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  What gets restored:
                </span>
                <p className="text-[11px] leading-relaxed">
                  • Embedded original photo with exact crop, zoom, and pan alignment
                </p>
                <p className="text-[11px] leading-relaxed">
                  • Baseplate grid dimensions and stud shape
                </p>
                <p className="text-[11px] leading-relaxed">
                  • Dithering engine, sharpness filters, brightness, and contrast settings
                </p>
                <p className="text-[11px] leading-relaxed">
                  • Selected LEGO® color palette and custom enabled/disabled studs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
