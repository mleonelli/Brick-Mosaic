export interface LegoColor {
  id: string;              // Internal unique id, e.g. 'black'
  legoId: number;          // Official LEGO Color / Element ID
  bricklinkId: number;     // Official BrickLink Color ID
  legoName: string;        // Official LEGO name (e.g. 'Black', 'Bright Red')
  bricklinkName: string;   // BrickLink name (e.g. 'Black', 'Red')
  hex: string;             // RGB hex code
  rgb: [number, number, number];
  lab: [number, number, number]; // L*, a*, b* in D65 CIELAB
  symbol: string;          // Symbol or number used in instruction manual (1, 2, 3, A, B, etc.)
  textColor: string;       // Contrast text color for symbols ('#FFFFFF' or '#000000')
  category: 'monochrome' | 'warm' | 'cool' | 'nature' | 'vibrant' | 'pastel';
}

export type DotShape = 'round_tile' | 'round_plate' | 'square_tile' | 'square_plate';

export type DitherMode =
  | 'none'
  | 'lego_mosaic'
  | 'ordered_bayer'
  | 'floyd_steinberg'
  | 'atkinson';

export interface BaseplatePreset {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  subPlateSize: number; // usually 16 for Lego Art (16x16 grid panels)
  totalStuds: number;
  physicalSizeCm: string;
}

export type PalettePresetKey = 'all' | 'mosaic_maker' | 'grayscale' | 'vintage' | 'vibrant' | 'nature' | 'custom';

export type PieceFamily = 'tile' | 'plate';
export type PieceSizePreference = 'bigger' | 'medium' | 'smaller';

export interface PlacedPiece {
  id: string;
  x: number; // grid col (0 to width-1)
  y: number; // grid row (0 to height-1)
  width: number; // in studs
  height: number; // in studs
  color: LegoColor;
  family: PieceFamily;
  partId: string;
  partName: string;
  studDims: string; // e.g. "2x2", "2x3", "2x4"
  area: number; // width * height
}

export interface OptimizationPieceTypeCount {
  studDims: string;
  partId: string;
  partName: string;
  family: PieceFamily;
  count: number;
  area: number;
  colorBreakdown: { color: LegoColor; count: number }[];
}

export interface OptimizationSummary {
  pieces: PlacedPiece[];
  pieceGrid: (PlacedPiece | null)[][];
  totalPieces: number;
  originalDots: number;
  reductionPercent: number;
  family: PieceFamily;
  sizePreference: PieceSizePreference;
  countsByPieceType: OptimizationPieceTypeCount[];
  countsByPieceAndColor: Map<
    string,
    {
      key: string;
      partId: string;
      partName: string;
      studDims: string;
      family: PieceFamily;
      color: LegoColor;
      count: number;
    }
  >;
}

export interface MosaicSettings {
  baseplatePresetId: string;
  width: number;
  height: number;
  dotShape: DotShape;
  ditherMode: DitherMode;
  ditherStrength: number; // 0 to 100 (%)
  sharpness: number;      // 0 to 100 (%)
  cleanOrphans: boolean;  // Smart despeckle filter to remove isolated noise studs
  maxColors: number;
  palettePreset: PalettePresetKey;
  selectedColorIds: string[];
  brightness: number;  // -50 to 50
  contrast: number;    // -50 to 50
  saturation: number;  // -50 to 50
  showGrid: boolean;
  showSubplates: boolean;
  showSymbols: boolean;
  scaleMode: 'cover' | 'contain';
  offsetX: number;     // -50% to +50%
  offsetY: number;     // -50% to +50%
  zoom: number;        // 1 to 3
  // Multi-stud piece coverage settings
  enableOptimization: boolean;
  optimizationFamily: PieceFamily;
  pieceSizePreference: PieceSizePreference;
}

export interface MosaicPixel {
  x: number;
  y: number;
  color: LegoColor;
}

export interface MosaicData {
  width: number;
  height: number;
  pixels: LegoColor[][]; // row (y), col (x)
  colorCounts: Map<string, { color: LegoColor; count: number }>;
  uniqueColors: LegoColor[];
  totalDots: number;
}

export interface BrickLinkPartItem {
  partNumber: string;
  partName: string;
  color: LegoColor;
  quantity: number;
  quantityWithBuffer: number;
  estimatedCost: number;
}

export interface SelectedPieceInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: LegoColor;
  studDims: string;
  partName?: string;
  partId?: string;
}

export interface LegoMosaicProject {
  format: 'lego-mosaic-studio';
  version: number;
  name: string;
  createdAt: string;
  settings: MosaicSettings;
  image: {
    name: string;
    dataUrl?: string;
    width?: number;
    height?: number;
  };
  metadata?: {
    totalDots?: number;
    dimensions?: { width: number; height: number };
  };
}

