import React, { useState } from 'react';
import { X, BookOpen, Download, FileText, CheckCircle2, Sparkles, Loader2, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { MosaicData, MosaicSettings } from '../types';
import { generateInstructionManualPdf } from '../utils/pdfGenerator';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosaic: MosaicData | null;
  settings: MosaicSettings;
  defaultProjectName: string;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  mosaic,
  settings,
  defaultProjectName,
}) => {
  const [projectName, setProjectName] = useState(defaultProjectName || 'LEGO® Art Mosaic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [generatedPdf, setGeneratedPdf] = useState<jsPDF | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  if (!isOpen || !mosaic) return null;

  const subSize = 16;
  const subPlatesX = Math.ceil(mosaic.width / subSize);
  const subPlatesY = Math.ceil(mosaic.height / subSize);
  const totalSubPlates = subPlatesX * subPlatesY;
  const totalBookletPages = 2 + totalSubPlates + 1; // Cover + Inventory + Plates + Assembly

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgressPct(0);
    setStatusMsg('Starting instruction manual generator...');

    try {
      // Allow UI to update
      await new Promise((r) => setTimeout(r, 60));

      const doc = await generateInstructionManualPdf({
        mosaic,
        settings,
        projectName,
        onProgress: (pct, msg) => {
          setProgressPct(pct);
          setStatusMsg(msg);
        },
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setGeneratedPdf(doc);
      setPdfBlobUrl(url);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('An error occurred while generating the PDF manual.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedPdf) {
      const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_instruction_manual.pdf`;
      generatedPdf.save(filename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Printable PDF Instruction Manual
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LEGO® Art Booklet
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official {totalBookletPages}-page landscape building booklet with numbered plate guides
              </p>
            </div>
          </div>
          <button
            id="close-pdf-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300">
          {/* Project Name Customizer */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Booklet Title / Project Name
            </label>
            <input
              id="pdf-project-name-input"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Mona Lisa Masterpiece"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Booklet Features Overview */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
              Included in this Official Building Manual:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Page 1: Official Cover</strong>
                  <span className="text-[11px] text-slate-400">
                    High-res preview, dimensions, part count, element specs.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Page 2: Inventory & Legend</strong>
                  <span className="text-[11px] text-slate-400">
                    Full swatch table, symbols, BrickLink IDs, part counts.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">
                    Pages 3–{totalBookletPages - 1}: {totalSubPlates} Plate Guides
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    Step-by-step 16×16 grids with printed symbols & coordinates.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <Printer className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Page {totalBookletPages}: Assembly</strong>
                  <span className="text-[11px] text-slate-400">
                    Pin layout map for locking baseplates & perimeter framing.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar while generating */}
          {isGenerating && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {statusMsg}
                </span>
                <span className="font-mono font-bold text-white">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Download & Preview ready */}
          {generatedPdf && !isGenerating && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white text-xs block">
                    PDF Manual Generated Successfully!
                  </span>
                  <span className="text-[11px] text-emerald-300">
                    {totalBookletPages} Pages ready to print on A4 / US Letter
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pdfBlobUrl && (
                  <a
                    href={pdfBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    View in Tab
                  </a>
                )}
                <button
                  id="download-pdf-manual-btn"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>

          {!generatedPdf && (
            <button
              id="generate-pdf-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building Manual...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Generate Printable PDF Booklet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
