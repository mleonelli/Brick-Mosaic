import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Image as ImageIcon,
  Sliders,
  Palette,
  MousePointer,
  Box,
  ShoppingBag,
  FileText,
  Keyboard,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle2,
  Undo2,
  Maximize2,
  ExternalLink,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdf?: () => void;
  onOpenBricklink?: () => void;
}

type GuideSectionId =
  | 'quickstart'
  | 'image_sizing'
  | 'color_palettes'
  | 'canvas_editing'
  | 'optimization'
  | 'bricklink'
  | 'pdf_manual'
  | 'shortcuts';

interface GuideSection {
  id: GuideSectionId;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: GuideSection[] = [
  {
    id: 'quickstart',
    title: 'Quick Start Guide',
    shortDesc: 'From photo to physical LEGO® mosaic in 5 simple steps',
    icon: Sparkles,
  },
  {
    id: 'image_sizing',
    title: 'Images & Baseplates',
    shortDesc: 'Uploading photos, baseplate presets & stud resolutions',
    icon: ImageIcon,
  },
  {
    id: 'color_palettes',
    title: 'Palettes & Dithering',
    shortDesc: 'Official LEGO® colors, dithering modes & tone controls',
    icon: Palette,
  },
  {
    id: 'canvas_editing',
    title: 'Piece & Color Editing',
    shortDesc: 'Click-to-select, Shift multi-select, marquee drag & color pickers',
    icon: MousePointer,
  },
  {
    id: 'optimization',
    title: 'Multi-Stud Parts Consolidation',
    shortDesc: 'Merging 1×1 studs into larger tiles & plates (2×2, 2×4)',
    icon: Box,
  },
  {
    id: 'bricklink',
    title: 'BrickLink Wanted Lists',
    shortDesc: 'Official LEGO® part numbers, XML export & ordering parts',
    icon: ShoppingBag,
  },
  {
    id: 'pdf_manual',
    title: 'PDF Building Manual',
    shortDesc: 'Numbered 16×16 plates and official LEGO® Art style instructions',
    icon: FileText,
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts & Pro Tips',
    shortDesc: 'Keyboard controls, panning, zooming & builder advice',
    icon: Keyboard,
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPdf,
  onOpenBricklink,
}) => {
  const [activeSection, setActiveSection] = useState<GuideSectionId>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Brick Mosaic Studio Guide</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  User Manual
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete walkthrough for creating, customizing, optimizing, and building official LEGO® mosaics
              </p>
            </div>
          </div>

          <button
            id="close-guide-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Close Guide (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Sidebar Navigation + Content Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Sidebar Menu */}
          <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-3 overflow-y-auto shrink-0 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Guide Topics
            </div>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  id={`guide-tab-${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center gap-3 transition ${
                    isActive
                      ? 'bg-amber-500/20 text-white font-semibold border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{section.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {section.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60 space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* 1. Quick Start */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Quick Start: 5 Steps from Picture to Physical LEGO® Art
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Follow this simple workflow to transform any digital photograph into a finished LEGO® masterpiece.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Upload or Select Your Image</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Drag and drop your own photo into the top uploader, or click one of the preloaded classic artworks (Mona Lisa, Girl with a Pearl Earring, Van Gogh, etc.) to get started immediately.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Choose Baseplate & Define Active Rows / Columns</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Select a standard official LEGO® Art size (such as <strong>48×48 studs</strong> for classic 3×3 square portraits, <strong>32×32 studs</strong>, or multi-plate layouts). By default, the entire baseplate is used (100%), or customize the active rows and columns using free stud counts or modular 16×16 plates, with one-click photo aspect ratio matching!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Tune Official Colors & Dithering</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Choose your official palette (Full Official Colors, Grayscale, Warm Earth, Pop Art) and adjust the maximum color budget. Switch between <strong>Floyd-Steinberg</strong> error diffusion for smooth gradients or <strong>No Dithering</strong> for sharp, graphic pop art.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Fine-Tune Pieces on the Interactive Canvas</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Click on any individual piece or use <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-amber-300 font-mono text-[10px]">Shift+Click</kbd> / drag a marquee box to select multiple pieces. Re-color them directly with quick palette swatches or the <strong>Full Color Palette</strong>!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      5
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Order Parts via BrickLink & Print PDF Manual</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Click <strong>BrickLink List</strong> to export an XML Wanted List file with real LEGO® element IDs for fast purchasing. Then click <strong>PDF Manual</strong> to download a printable, official-style building instruction booklet divided into 16×16 plates!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-200">
                      Want to save your work to resume later? Use the <strong>Project</strong> button to export a self-contained <code className="text-white font-mono font-bold">.brickmosaic</code> file with embedded photos and settings.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Images & Baseplates */}
            {activeSection === 'image_sizing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    Images & Baseplate Sizing
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Understanding stud resolution, plate ratios, and image preparation.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Image Uploading & Formats</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Brick Mosaic Studio supports <strong>JPEG, PNG, WebP, SVG, and GIF</strong> files up to 25MB. High contrast portraits, bold subjects, and clean backgrounds yield the most striking LEGO® mosaic results. When uploading, your photo is processed securely in your browser—no external upload servers are involved.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Official LEGO® Art Baseplates Presets</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-semibold text-amber-400">48×48 Studs (38.4 × 38.4 cm)</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Standard official LEGO® Art set size (uses 9× 16×16 Technic brick baseplates). Total: 2,304 studs.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-semibold text-sky-400">32×32 Studs (25.6 × 25.6 cm)</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Compact square size (uses 4× 16×16 baseplates). Ideal for icons and desk art. Total: 1,024 studs.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-semibold text-emerald-400">48×96 Studs (38.4 × 76.8 cm)</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Triple-wide panoramic layout (combining 3 official LEGO® sets). Total: 4,608 studs.
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-semibold text-purple-400">64×64 Large Masterpiece</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          High detail gallery mosaic (uses 16× 16×16 baseplates). Total: 4,096 studs.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Maximize2 className="w-4 h-4 text-amber-400" />
                        Custom Plate Rows & Columns (Active Area)
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                        Smart Feature
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      You are never locked into filling the entire baseplate! In the <strong>Base & Size</strong> tab, the <strong>Plate Rows & Columns to Use</strong> tool gives you granular control over the active area on your baseplate:
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <span>✓ Default: Full Base Used (100%)</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Whenever you pick an official baseplate preset, all rows and columns are enabled by default (e.g. 48 cols × 48 rows on a 48×48 plate). You can return to full plate coverage at any time with a single click on <strong>Full Base</strong>.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                          <span>By Studs (Exact) vs. By 16×16 Plates (Modular)</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Switch between two smart sizing modes:
                          <br />
                          • <strong>By Studs (Exact)</strong>: Fine-tune width and height stud-by-stud with continuous sliders or quick step buttons (<code>-16</code>, <code>-4</code>, <code>-1</code>, <code>+1</code>, <code>+4</code>, <code>+16</code>).
                          <br />
                          • <strong>By 16×16 Plates (Modular)</strong>: Adjust in physical LEGO® Art 16×16 Technic plate units (#65803) for easy framing and modular mounting (e.g. 2×3 plates = 32×48 studs).
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span>✨ Smart Quick Actions</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          • <strong>Match Photo Ratio</strong>: Automatically calculates the optimal rows and columns inside the baseplate that best matches the natural proportions of your uploaded picture, eliminating awkward cropping or letterboxing.
                          <br />
                          • <strong>Square (1:1)</strong>: Snaps columns and rows to an even square.
                          <br />
                          • <strong>Lock Ratio (⛓️)</strong>: Keep proportions locked while resizing width or height.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="font-semibold text-purple-400 flex items-center gap-1.5">
                          <span>Live Plate Schematic & Margins</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          The live plate visualizer illustrates your active stud area inside the physical baseplate boundary, displaying active studs, utilization percentage, outer margins, physical size in centimeters, and BrickLink plate requirements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Physical Dimensions Calculation</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every official LEGO® stud measures exactly <strong>0.8 cm (8 mm)</strong> in width and height. A 48-stud mosaic equals 38.4 cm. You can inspect the real-world physical size in centimeters in the interactive canvas footer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Palettes & Dithering */}
            {activeSection === 'color_palettes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-400" />
                    Official LEGO® Palettes & Dithering
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Authentic color matching using LAB Euclidean distance and optical blending algorithms.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">100% Genuine LEGO® Colors</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Every color in the studio matches genuine LEGO® catalog plastics with verified <strong>BrickLink IDs, official LEGO® design names, and hexadecimal values</strong>. You will never get an unproducible color.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Color Tone & Image Adjustments</h4>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Brightness & Contrast</strong>: Boost contrast to give faces and edges sharper definition in brick form.
                      </li>
                      <li>
                        <strong>Saturation</strong>: Increase to 120-140% to make vibrant LEGO® colors pop, or decrease to 0% for classic monochrome black & white.
                      </li>
                      <li>
                        <strong>Maximum Color Budget</strong>: Restrict the total unique colors used (e.g. 8, 12, 16, or 24) to reduce the number of separate part lots you need to buy.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Dithering Algorithms Compared</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-amber-400">Floyd-Steinberg (Default)</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Diffuses quantization error across neighbor studs. Creates natural skin tones, smooth skies, and rich photographic gradients.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-emerald-400">Atkinson Dithering</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Classic retro Apple Mac dithering with 75% error diffusion. Preserves high-frequency details and punchy mid-tones.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-sky-400">Bayer Ordered 4×4</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Creates a stylized, rhythmic cross-hatch pattern reminiscent of comic book pop art printing.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-purple-400">No Dithering (Nearest Color)</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Maps each pixel directly to the closest LEGO® color without diffusion. Best for logos, flat graphic art, and pixel characters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Canvas & Piece Editing */}
            {activeSection === 'canvas_editing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-cyan-400" />
                    Interactive Piece Selection & Color Editing
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly click and manipulate individual studs or multi-stud pieces on the canvas.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Selection Methods</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="px-2 py-1 rounded bg-slate-700 text-amber-300 font-mono text-[11px] shrink-0 font-bold">
                          Single Click
                        </div>
                        <div className="text-slate-300">
                          Click any stud or consolidated piece to select exclusively that piece. A cyan glowing outline and precision corner brackets appear around the piece.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="px-2 py-1 rounded bg-slate-700 text-amber-300 font-mono text-[11px] shrink-0 font-bold">
                          Shift + Click
                        </div>
                        <div className="text-slate-300">
                          Hold <kbd className="px-1 rounded bg-slate-800 text-white font-mono">Shift</kbd> (or <kbd className="px-1 rounded bg-slate-800 text-white font-mono">Ctrl/Cmd</kbd>) while clicking to toggle pieces in and out of your selection for multi-piece editing.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="px-2 py-1 rounded bg-slate-700 text-amber-300 font-mono text-[11px] shrink-0 font-bold">
                          Drag Marquee Box
                        </div>
                        <div className="text-slate-300">
                          Click and drag a box over any area of the canvas to batch-select all pieces within that rectangular region at once.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">The Floating Piece Dock</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Whenever pieces are selected, a floating dock appears at the bottom of the canvas:
                    </p>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Piece Information</strong>: Displays part dimensions (e.g. <em>2×4 Tile</em>, <em>1×2 Plate</em>), total selected studs, and current LEGO® color.
                      </li>
                      <li>
                        <strong>Quick Swatches</strong>: 1-click apply top colors already present in your mosaic.
                      </li>
                      <li>
                        <strong>Full Color Palette...</strong>: Opens the searchable LEGO® color picker with all 45+ official shades categorized into Solids, Neutrals, Earth, and Blues.
                      </li>
                      <li>
                        <strong>Select All [Color]</strong>: Instantly selects all other pieces sharing that color across the entire mosaic!
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Highlighting & Changing Entire Colors</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click any color in the <strong>Active Colors in Mosaic</strong> strip below the canvas. All matching pieces will be highlighted across the mosaic. Click the prominent <strong>"Change Color..."</strong> button to replace that color everywhere in one single action!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Undo History & Keyboard Shortcuts</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Made a mistake? Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-mono text-[10px]">Ctrl+Z</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-mono text-[10px]">Cmd+Z</kbd> on Mac) or click the <strong>Undo</strong> button in the canvas header. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-mono text-[10px]">Esc</kbd> anytime to deselect.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Parts Consolidation */}
            {activeSection === 'optimization' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Box className="w-5 h-5 text-amber-400" />
                    Multi-Stud Parts Consolidation (Optimization)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cut your physical piece count by 40% to 70% and build your mosaic much faster!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Why Consolidate Parts?</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Standard LEGO® mosaics use thousands of separate 1×1 round or square studs. By enabling <strong>Multi-Stud Parts Consolidation</strong> in the right-hand panel, large solid color areas (like skies, dark backgrounds, and clothing) are merged into larger authentic LEGO® parts such as <strong>2×4, 2×2, 1×4, and 1×2 tiles or plates</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Key Benefits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-amber-400">50%+ Fewer Parts</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          A 48×48 mosaic of 2,304 dots can often be built with under 950 consolidated pieces.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-emerald-400">3× Faster Assembly</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Placing a single 2×4 tile covers 8 studs in one satisfying click instead of 8 tiny dots.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="font-bold text-sky-400">Lower Ordering Cost</div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Common 2×2 and 2×4 bricks and tiles are widely available in bulk at lower average per-stud prices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Switching Views on the Canvas</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Use the <strong>Pieces</strong> vs <strong>1×1 Studs</strong> toggle at the top of the canvas to seamlessly compare the raw 1×1 pixel grid with the consolidated multi-part physical layout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. BrickLink & Ordering */}
            {activeSection === 'bricklink' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-sky-400" />
                    BrickLink Wanted Lists & Ordering Parts
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Export ready-to-upload XML Wanted Lists for the world&apos;s largest online LEGO® marketplace.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">How BrickLink Integration Works</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click the <strong>BrickLink List</strong> button in the top navigation. The studio compiles every required tile, plate, and baseplate into an official BrickLink XML document containing exact part IDs (e.g. <code>98138</code> for 1×1 Round Tile, <code>4073</code> for 1×1 Round Plate, <code>3068b</code> for 2×2 Tile, <code>65803</code> for 16×16 Art baseplates).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Step-by-Step BrickLink Upload Instructions</h4>
                    <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside">
                      <li>
                        In the BrickLink Modal, click <strong>&quot;Download BrickLink XML&quot;</strong> (or <strong>&quot;Copy XML Code&quot;</strong>).
                      </li>
                      <li>
                        Go to <a href="https://www.bricklink.com/v2/wanted/upload.page" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold">BrickLink Wanted List Upload <ExternalLink className="w-3 h-3" /></a> and sign in.
                      </li>
                      <li>
                        Select <strong>&quot;Upload BrickLink XML format&quot;</strong>, paste the code, and click <strong>&quot;Verify Items&quot;</strong>.
                      </li>
                      <li>
                        Click <strong>&quot;Add to Wanted List&quot;</strong>.
                      </li>
                      <li>
                        Click <strong>&quot;Buy All&quot;</strong> — BrickLink&apos;s Auto-Select engine automatically finds the best combination of stores with the lowest shipping costs to fulfill your order!
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">+5% Spare Parts Buffer</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tiny 1×1 tiles can easily bounce off desks or get vacuumed up! We recommend keeping the <strong>+5% extra spare buffer</strong> enabled in the BrickLink modal so you never run short by one piece mid-build.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. PDF Manual */}
            {activeSection === 'pdf_manual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-400" />
                    Printable PDF Building Instructions
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Assemble your mosaic comfortably away from the computer screen with step-by-step 16×16 plates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Official LEGO® Art Set Format</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Just like official LEGO® Art sets (such as The Beatles, Star Wars Sith, or World Map), your mosaic is automatically divided into standard <strong>16×16 stud sub-plates</strong> numbered row by row (Plate 1, Plate 2, Plate 3, etc.).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">What Is Included in the PDF:</h4>
                    <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Full-Color Cover Page</strong>: Shows the completed artwork render, project title, dimensions, and total part count.
                      </li>
                      <li>
                        <strong>Parts Inventory Page</strong>: Complete Bill of Materials with official LEGO® color names, BrickLink IDs, and exact quantities.
                      </li>
                      <li>
                        <strong>Sub-Plate Step Pages</strong>: One large 16×16 grid per page with stud row & column coordinate guides.
                      </li>
                      <li>
                        <strong>Colorblind-Friendly Numbered Studs</strong>: Every color is assigned a unique alphanumeric symbol printed directly on the stud diagram, matching physical sorted cups!
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-white text-sm">Generating Your Manual</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click the gradient <strong>PDF Manual</strong> button in the header. You can preview individual plates inside the interactive viewer or click <strong>Print / Save as PDF</strong> to produce a vector-sharp document ready for printing or opening on a tablet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Shortcuts & Pro Tips */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-amber-400" />
                    Keyboard Shortcuts & Pro Tips
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Master the studio like a pro builder with speed shortcuts and workflow recommendations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Canvas Controls & Hotkeys</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Undo Color Change</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Ctrl+Z / ⌘Z
                        </kbd>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Deselect Pieces</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Esc
                        </kbd>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Multi-Select Pieces</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Shift + Click
                        </kbd>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Open Color Picker</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Double-Click Piece
                        </kbd>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Pan Canvas</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Alt + Drag / Middle Click
                        </kbd>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300">Batch Marquee Select</span>
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          Click & Drag Area
                        </kbd>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <h4 className="font-bold text-white text-sm">Builder Advice from AFOLs (Adult Fans of LEGO®)</h4>
                    <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside">
                      <li>
                        <strong>Cup Sorting Before Building</strong>: When your physical parts arrive, sort them into small muffin tins or plastic cups by symbol/color number. It speeds up physical assembly by over 200%.
                      </li>
                      <li>
                        <strong>Brick Separator Flat Edge</strong>: Use the flat chiseled edge of an official LEGO® brick separator tool if you need to pop off misaligned tiles without scratching them.
                      </li>
                      <li>
                        <strong>Inspect at a Distance</strong>: Mosaics look best when viewed from 1.5 to 2 meters away. Use the zoom slider to zoom out to 60% on canvas to preview how your eyes will optically blend the studs in person!
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Esc
            </kbd>
            <span>to exit guide</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBricklink && (
              <button
                id="guide-to-bricklink-btn"
                onClick={() => {
                  onClose();
                  onOpenBricklink();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 font-medium"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                <span>Open BrickLink List</span>
              </button>
            )}

            {onOpenPdf && (
              <button
                id="guide-to-pdf-btn"
                onClick={() => {
                  onClose();
                  onOpenPdf();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Open PDF Manual</span>
              </button>
            )}

            <button
              id="guide-got-it-btn"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
            >
              Got it, let&apos;s build!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
