import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Palette, Check, Sparkles, Layers } from 'lucide-react';
import { LegoColor } from '../types';
import { OFFICIAL_LEGO_COLORS } from '../data/legoColors';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: LegoColor) => void;
  targetDescription: string;
  currentColor?: LegoColor | null;
  mosaicColors?: LegoColor[];
  colorCounts?: Map<string, { color: LegoColor; count: number }>;
}

type CategoryTab = 'all' | 'in_mosaic' | 'monochrome' | 'warm' | 'earth' | 'nature' | 'cool' | 'vibrant';

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  targetDescription,
  currentColor,
  mosaicColors = [],
  colorCounts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveTab('all');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const inMosaicIds = useMemo(() => {
    return new Set(mosaicColors.map((c) => c.id));
  }, [mosaicColors]);

  const filteredColors = useMemo(() => {
    return OFFICIAL_LEGO_COLORS.filter((color) => {
      // Search filter
      const matchesSearch =
        searchTerm.trim() === '' ||
        color.legoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.bricklinkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.bricklinkId.toString().includes(searchTerm) ||
        color.hex.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category tab filter
      if (activeTab === 'all') return true;
      if (activeTab === 'in_mosaic') return inMosaicIds.has(color.id);
      if (activeTab === 'monochrome') return color.category === 'monochrome';
      if (activeTab === 'warm') return color.category === 'warm' || color.id.includes('red') || color.id.includes('yellow') || color.id.includes('orange');
      if (activeTab === 'earth') return color.category === 'warm' && (color.id.includes('brown') || color.id.includes('nougat') || color.id.includes('sand'));
      if (activeTab === 'nature') return color.category === 'nature' || color.id.includes('green');
      if (activeTab === 'cool') return color.category === 'cool' || color.id.includes('blue') || color.id.includes('azure') || color.id.includes('aqua');
      if (activeTab === 'vibrant') return color.category === 'vibrant' || color.category === 'pastel' || color.id.includes('purple') || color.id.includes('lavender') || color.id.includes('violet');

      return true;
    });
  }, [searchTerm, activeTab, inMosaicIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="color-picker-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Official LEGO® Color Picker</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {OFFICIAL_LEGO_COLORS.length} Colors
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Target:</span>
                <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                  {targetDescription}
                </span>
                {currentColor && (
                  <span className="flex items-center gap-1.5 ml-1 text-slate-400 text-[11px]">
                    (Current:{' '}
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: currentColor.hex }}
                    />
                    <strong className="text-white">{currentColor.legoName}</strong>)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="close-color-picker-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Category Filters */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="color-picker-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by LEGO® name (e.g. Red, Stone Grey, Azure), BrickLink ID, or hex..."
              autoFocus
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {[
              { id: 'all', label: `All (${OFFICIAL_LEGO_COLORS.length})` },
              { id: 'in_mosaic', label: `In Mosaic (${inMosaicIds.size})`, icon: Layers },
              { id: 'monochrome', label: 'Monochrome (5)' },
              { id: 'warm', label: 'Warm & Red (8)' },
              { id: 'earth', label: 'Earth & Tan (7)' },
              { id: 'nature', label: 'Green (6)' },
              { id: 'cool', label: 'Blue (9)' },
              { id: 'vibrant', label: 'Purple & Pink (5)' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`color-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as CategoryTab)}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.icon && <tab.icon className="w-3 h-3" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 max-h-[55vh]">
          {filteredColors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium">No LEGO® colors found</p>
              <p className="text-xs text-slate-500">Try changing your search query or active filter tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredColors.map((color) => {
                const isCurrent = currentColor?.id === color.id;
                const inUseCount = colorCounts?.get(color.id)?.count || 0;

                return (
                  <button
                    key={color.id}
                    id={`color-picker-item-${color.id}`}
                    onClick={() => {
                      onSelectColor(color);
                      onClose();
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border text-left transition relative overflow-hidden ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Realistic 3D Stud Swatch */}
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center text-[10px] font-black shrink-0 relative transition group-hover:scale-105"
                        style={{ backgroundColor: color.hex, color: color.textColor }}
                      >
                        <div className="absolute inset-0.5 rounded-full border border-white/30 pointer-events-none" />
                        <span>{color.symbol}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition">
                            {color.legoName}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          BL: {color.bricklinkName} (#{color.bricklinkId})
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200">
                        {color.hex}
                      </span>
                      {inUseCount > 0 ? (
                        <span className="text-[9px] text-amber-400 font-medium mt-0.5">
                          ×{inUseCount} in mosaic
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-600 mt-0.5">Unused</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Click any color above to apply instantly to {targetDescription}.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
