import { MosaicSettings } from '../types';
import { OFFICIAL_LEGO_COLORS } from './legoColors';

export const DEFAULT_SETTINGS: MosaicSettings = {
  baseplatePresetId: '48x48',
  width: 48,
  height: 48,
  dotShape: 'round_tile',
  ditherMode: 'lego_mosaic',
  ditherStrength: 65,
  sharpness: 35,
  cleanOrphans: true,
  maxColors: 16,
  palettePreset: 'all',
  selectedColorIds: OFFICIAL_LEGO_COLORS.map((c) => c.id),
  brightness: 0,
  contrast: 5,
  saturation: 10,
  showGrid: false,
  showSubplates: true,
  showSymbols: false,
  scaleMode: 'cover',
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  enableOptimization: false,
  optimizationFamily: 'tile',
  pieceSizePreference: 'bigger',
};
