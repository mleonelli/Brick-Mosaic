import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShoppingBag,
  Info,
  ShieldCheck,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DotShape, LegoColor, MosaicData, OptimizationSummary } from '../types';
import {
  downloadFile,
  generateBrickLinkCsv,
  generateBrickLinkXml,
  getBaseplatePart,
  getLegoPartNumber,
} from '../utils/bricklinkExport';
import { Box, Grid } from 'lucide-react';

interface PartListModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosaic: MosaicData | null;
  dotShape: DotShape;
  optimization?: OptimizationSummary | null;
  enableOptimization?: boolean;
}

export const PartListModal: React.FC<PartListModalProps> = ({
  isOpen,
  onClose,
  mosaic,
  dotShape,
  optimization,
  enableOptimization = false,
}) => {
  const [includeBuffer, setIncludeBuffer] = useState(true);
  const [bufferPercent, setBufferPercent] = useState(5);
  const [includeBaseplates, setIncludeBaseplates] = useState(true);
  const [copiedXml, setCopiedXml] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [partsViewMode, setPartsViewMode] = useState<'pieces' | 'dots'>(
    enableOptimization && optimization ? 'pieces' : 'dots'
  );

  if (!isOpen || !mosaic) return null;

  const isUsingOptimization = partsViewMode === 'pieces' && !!optimization;
  const activeOptimization = isUsingOptimization ? optimization : null;

  const { partId, partName } = getLegoPartNumber(dotShape);
  const baseplate = getBaseplatePart(mosaic.width, mosaic.height);

  // Generate Bricklink XML
  const xmlContent = generateBrickLinkXml(
    mosaic,
    dotShape,
    includeBuffer,
    bufferPercent,
    includeBaseplates,
    activeOptimization
  );

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopiedXml(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setCopiedXml(false), 2500);
    } catch (err) {
      console.error('Failed to copy XML', err);
    }
  };

  const handleDownloadXml = () => {
    const prefix = isUsingOptimization ? 'pieces' : 'dots';
    downloadFile(xmlContent, `bricklink_${prefix}_list_${mosaic.width}x${mosaic.height}.xml`, 'application/xml');
  };

  const handleDownloadCsv = () => {
    const prefix = isUsingOptimization ? 'pieces' : 'dots';
    const csv = generateBrickLinkCsv(mosaic, dotShape, includeBuffer, bufferPercent, activeOptimization);
    downloadFile(csv, `bricklink_${prefix}_list_${mosaic.width}x${mosaic.height}.csv`, 'text/csv');
  };

  // Calculate totals
  let totalPartsCount = 0;
  let totalBufferPartsCount = 0;
  let estimatedTotalCost = 0;

  if (isUsingOptimization && optimization) {
    for (const [, item] of optimization.countsByPieceAndColor.entries()) {
      totalPartsCount += item.count;
      const bufQty = includeBuffer ? Math.ceil(item.count * (1 + bufferPercent / 100)) : item.count;
      totalBufferPartsCount += bufQty;
      const [wStr, hStr] = item.studDims.split('x');
      const pieceArea = (parseInt(wStr, 10) || 1) * (parseInt(hStr, 10) || 1);
      const unitPrice = Math.max(0.03, pieceArea * 0.025);
      estimatedTotalCost += bufQty * unitPrice;
    }
  } else {
    for (const [, { count }] of mosaic.colorCounts.entries()) {
      totalPartsCount += count;
      const bufQty = includeBuffer ? Math.ceil(count * (1 + bufferPercent / 100)) : count;
      totalBufferPartsCount += bufQty;
      estimatedTotalCost += bufQty * 0.035; // Average $0.035 per 1x1 dot on Bricklink
    }
  }

  if (includeBaseplates && baseplate) {
    estimatedTotalCost += baseplate.count * 3.50; // ~$3.50 per 16x16 technic brick
  }

  // Filtered colors/pieces for table
  const dotItems = Array.from<{ color: LegoColor; count: number }>(mosaic.colorCounts.values())
    .filter(
      ({ color }) =>
        color.legoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.bricklinkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.bricklinkId.toString().includes(searchTerm)
    )
    .sort((a, b) => b.count - a.count);

  interface PieceCountEntry {
    key: string;
    color: LegoColor;
    studDims: string;
    partId: string;
    partName: string;
    count: number;
  }

  const pieceItems: PieceCountEntry[] = optimization
    ? (Array.from(optimization.countsByPieceAndColor.values()) as PieceCountEntry[])
        .filter(
          (item) =>
            item.color.legoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.color.bricklinkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.color.bricklinkId.toString().includes(searchTerm) ||
            item.studDims.includes(searchTerm) ||
            item.partId.includes(searchTerm) ||
            item.partName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                BrickLink Parts List & Ordering
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Order
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official BrickLink Wanted List XML format for instant part purchase
              </p>
            </div>
          </div>
          <button
            id="close-parts-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* Quick Action & Ordering Guide Banner */}
          <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/60 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-sky-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Order All Pieces on BrickLink in 3 Easy Steps
                </h3>
                <ol className="mt-2 space-y-1 text-slate-300 list-decimal list-inside text-xs">
                  <li>
                    Click <strong className="text-white">Copy BrickLink XML</strong> below.
                  </li>
                  <li>
                    Click <strong className="text-sky-300">Open BrickLink Upload</strong> (or go to Wanted List &gt; Upload).
                  </li>
                  <li>
                    Paste into the <strong className="text-white">Upload BrickLink XML Format</strong> box, create your wanted list, and hit <strong className="text-emerald-300">Easy Buy</strong>!
                  </li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="copy-xml-btn"
                  onClick={handleCopyXml}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                    copiedXml
                      ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
                  }`}
                >
                  {copiedXml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedXml ? 'XML Copied to Clipboard!' : 'Copy BrickLink XML'}</span>
                </button>

                <a
                  href="https://www.bricklink.com/v2/wanted/upload.page"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <span>Open BrickLink Upload</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* View Mode Toggle (Pieces vs 1x1 Dots) */}
          {optimization && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Part Consolidation Mode:
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  {optimization.reductionPercent}% fewer pieces with multi-stud {optimization.family === 'tile' ? 'tiles' : 'plates'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                <button
                  id="part-mode-pieces-btn"
                  onClick={() => setPartsViewMode('pieces')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                    partsViewMode === 'pieces'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Consolidated Pieces ({optimization.totalPieces.toLocaleString()})</span>
                </button>
                <button
                  id="part-mode-dots-btn"
                  onClick={() => setPartsViewMode('dots')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                    partsViewMode === 'dots'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>1×1 Dots ({mosaic.totalDots.toLocaleString()})</span>
                </button>
              </div>
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {/* Spares Buffer */}
            <div>
              <span className="font-bold text-slate-300 block mb-1">Spare Parts Buffer</span>
              <p className="text-[11px] text-slate-400 mb-2">
                Adds extra pieces for accidental drops during assembly.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIncludeBuffer(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    !includeBuffer
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Exact ({totalPartsCount})
                </button>
                <button
                  onClick={() => {
                    setIncludeBuffer(true);
                    setBufferPercent(5);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    includeBuffer && bufferPercent === 5
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  +5% Spares ({Math.ceil(totalPartsCount * 1.05)})
                </button>
                <button
                  onClick={() => {
                    setIncludeBuffer(true);
                    setBufferPercent(10);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    includeBuffer && bufferPercent === 10
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  +10%
                </button>
              </div>
            </div>

            {/* Baseplate inclusion */}
            <div>
              <span className="font-bold text-slate-300 block mb-1">Baseplates & Canvas</span>
              <p className="text-[11px] text-slate-400 mb-2">
                Include {baseplate ? `${baseplate.count}× ${baseplate.partName}` : 'baseplates'} in Wanted List.
              </p>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={includeBaseplates}
                  onChange={(e) => setIncludeBaseplates(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                <span className="text-slate-200 font-medium">Include Baseplates</span>
              </label>
            </div>

            {/* Estimated Total */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">Estimated Market Price</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  ~${estimatedTotalCost.toFixed(2)} USD
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {isUsingOptimization
                  ? `Based on market prices for multi-stud ${optimization?.family}s`
                  : 'Based on avg $0.035/dot'} + baseplates across global BrickLink sellers
              </span>
            </div>
          </div>

          {/* Parts Table Search & Export Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-parts-input"
                type="text"
                placeholder="Search color or BrickLink ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                id="download-xml-btn"
                onClick={handleDownloadXml}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .XML</span>
              </button>
              <button
                id="download-csv-btn"
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .CSV</span>
              </button>
            </div>
          </div>

          {/* Interactive Parts Inventory Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Color</th>
                    <th className="p-3">Official LEGO® Name</th>
                    <th className="p-3">BrickLink Color ID</th>
                    <th className="p-3">Part Type & ID</th>
                    <th className="p-3 text-right">Exact Qty</th>
                    <th className="p-3 text-right">Order Qty</th>
                    <th className="p-3 text-right">Est. Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs font-medium text-slate-300">
                  {isUsingOptimization ? (
                    pieceItems.map((item) => {
                      const bufQty = includeBuffer
                        ? Math.ceil(item.count * (1 + bufferPercent / 100))
                        : item.count;
                      const [wStr, hStr] = item.studDims.split('x');
                      const pieceArea = (parseInt(wStr, 10) || 1) * (parseInt(hStr, 10) || 1);
                      const unitPrice = Math.max(0.03, pieceArea * 0.025);
                      const cost = (bufQty * unitPrice).toFixed(2);
                      return (
                        <tr key={item.key} className="hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded border border-white/20 shadow-sm flex items-center justify-center text-[9px] font-bold"
                                style={{ backgroundColor: item.color.hex, color: item.color.textColor }}
                              >
                                {item.color.symbol}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-white">{item.color.legoName}</td>
                          <td className="p-3 font-mono text-slate-400">
                            #{item.color.bricklinkId} ({item.color.bricklinkName})
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                                {item.studDims}
                              </span>
                              <span className="font-mono text-slate-300">
                                #{item.partId}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {item.partName}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">{item.count}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-300">
                            {bufQty}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400">${cost}</td>
                        </tr>
                      );
                    })
                  ) : (
                    dotItems.map(({ color, count }) => {
                      const bufQty = includeBuffer
                        ? Math.ceil(count * (1 + bufferPercent / 100))
                        : count;
                      const cost = (bufQty * 0.035).toFixed(2);
                      return (
                        <tr key={color.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex items-center justify-center text-[9px] font-bold"
                                style={{ backgroundColor: color.hex, color: color.textColor }}
                              >
                                {color.symbol}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-white">{color.legoName}</td>
                          <td className="p-3 font-mono text-slate-400">
                            #{color.bricklinkId} ({color.bricklinkName})
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {partId} ({partName})
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">{count}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-300">
                            {bufQty}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-400">${cost}</td>
                        </tr>
                      );
                    })
                  )}

                  {includeBaseplates && baseplate && (
                    <tr className="bg-sky-950/20 font-semibold">
                      <td className="p-3">
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-white">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                      </td>
                      <td className="p-3 text-white">{baseplate.partName}</td>
                      <td className="p-3 font-mono text-slate-400">#11 (Black)</td>
                      <td className="p-3 font-mono text-slate-400">{baseplate.partId}</td>
                      <td className="p-3 text-right font-mono text-slate-400">{baseplate.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-300">
                        {baseplate.count}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400">
                        ${(baseplate.count * 3.50).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Total Parts to Order:{' '}
            <strong className="text-white">
              {totalBufferPartsCount + (includeBaseplates && baseplate ? baseplate.count : 0)} pieces
            </strong>
            {isUsingOptimization && optimization && (
              <span className="ml-2 text-emerald-400 font-mono">
                ({optimization.originalDots - totalPartsCount} fewer parts than 1×1 dots)
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
