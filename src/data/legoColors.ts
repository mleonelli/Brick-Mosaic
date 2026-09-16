import { LegoColor } from '../types';

// Helper to calculate CIELAB from RGB (D65 standard illuminant)
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB to sRGB
  let rLin = r / 255;
  let gLin = g / 255;
  let bLin = b / 255;

  rLin = rLin > 0.04045 ? Math.pow((rLin + 0.055) / 1.055, 2.4) : rLin / 12.92;
  gLin = gLin > 0.04045 ? Math.pow((gLin + 0.055) / 1.055, 2.4) : gLin / 12.92;
  bLin = bLin > 0.04045 ? Math.pow((bLin + 0.055) / 1.055, 2.4) : bLin / 12.92;

  // Convert to XYZ
  let x = (rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805) / 0.95047;
  let y = (rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722) / 1.0;
  let z = (rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505) / 1.08883;

  const fx = x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116;
  const fy = y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116;
  const fz = z > 0.008856 ? Math.cbrt(z) : 7.787 * z + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return [L, a, bVal];
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

interface RawLegoColor {
  id: string;
  legoId: number;
  bricklinkId: number;
  legoName: string;
  bricklinkName: string;
  hex: string;
  symbol: string;
  textColor: string;
  category: LegoColor['category'];
}

const RAW_LEGO_COLORS: RawLegoColor[] = [
  // Monochrome / Grayscale (Essential for Lego Art sets)
  {
    id: 'black',
    legoId: 26,
    bricklinkId: 11,
    legoName: 'Black',
    bricklinkName: 'Black',
    hex: '#1B2A34',
    symbol: '1',
    textColor: '#FFFFFF',
    category: 'monochrome',
  },
  {
    id: 'dark_bluish_gray',
    legoId: 199,
    bricklinkId: 85,
    legoName: 'Dark Stone Grey',
    bricklinkName: 'Dark Bluish Gray',
    hex: '#595D60',
    symbol: '2',
    textColor: '#FFFFFF',
    category: 'monochrome',
  },
  {
    id: 'light_bluish_gray',
    legoId: 194,
    bricklinkId: 86,
    legoName: 'Medium Stone Grey',
    bricklinkName: 'Light Bluish Gray',
    hex: '#9DA3A8',
    symbol: '3',
    textColor: '#000000',
    category: 'monochrome',
  },
  {
    id: 'white',
    legoId: 1,
    bricklinkId: 1,
    legoName: 'White',
    bricklinkName: 'White',
    hex: '#FFFFFF',
    symbol: '4',
    textColor: '#000000',
    category: 'monochrome',
  },
  {
    id: 'flat_silver',
    legoId: 315,
    bricklinkId: 95,
    legoName: 'Silver Metallic',
    bricklinkName: 'Flat Silver',
    hex: '#8A928D',
    symbol: '5',
    textColor: '#FFFFFF',
    category: 'monochrome',
  },

  // Warm Tones / Browns / Skin
  {
    id: 'dark_brown',
    legoId: 308,
    bricklinkId: 120,
    legoName: 'Dark Brown',
    bricklinkName: 'Dark Brown',
    hex: '#372100',
    symbol: '6',
    textColor: '#FFFFFF',
    category: 'warm',
  },
  {
    id: 'reddish_brown',
    legoId: 192,
    bricklinkId: 88,
    legoName: 'Reddish Brown',
    bricklinkName: 'Reddish Brown',
    hex: '#582A12',
    symbol: '7',
    textColor: '#FFFFFF',
    category: 'warm',
  },
  {
    id: 'dark_orange',
    legoId: 38,
    bricklinkId: 68,
    legoName: 'Dark Orange',
    bricklinkName: 'Dark Orange',
    hex: '#A95500',
    symbol: '8',
    textColor: '#FFFFFF',
    category: 'warm',
  },
  {
    id: 'medium_nougat',
    legoId: 312,
    bricklinkId: 150,
    legoName: 'Medium Nougat',
    bricklinkName: 'Medium Nougat',
    hex: '#AA7D55',
    symbol: '9',
    textColor: '#FFFFFF',
    category: 'warm',
  },
  {
    id: 'dark_tan',
    legoId: 138,
    bricklinkId: 69,
    legoName: 'Sand Yellow',
    bricklinkName: 'Dark Tan',
    hex: '#958A73',
    symbol: 'A',
    textColor: '#FFFFFF',
    category: 'warm',
  },
  {
    id: 'tan',
    legoId: 19,
    bricklinkId: 2,
    legoName: 'Brick Yellow',
    bricklinkName: 'Tan',
    hex: '#E4CD9E',
    symbol: 'B',
    textColor: '#000000',
    category: 'warm',
  },
  {
    id: 'light_nougat',
    legoId: 283,
    bricklinkId: 90,
    legoName: 'Light Nougat',
    bricklinkName: 'Light Nougat',
    hex: '#F6D7B3',
    symbol: 'C',
    textColor: '#000000',
    category: 'warm',
  },

  // Vibrant Reds & Oranges & Yellows
  {
    id: 'dark_red',
    legoId: 154,
    bricklinkId: 59,
    legoName: 'Dark Red',
    bricklinkName: 'Dark Red',
    hex: '#720E0F',
    symbol: 'D',
    textColor: '#FFFFFF',
    category: 'vibrant',
  },
  {
    id: 'red',
    legoId: 21,
    bricklinkId: 5,
    legoName: 'Bright Red',
    bricklinkName: 'Red',
    hex: '#C91A09',
    symbol: 'E',
    textColor: '#FFFFFF',
    category: 'vibrant',
  },
  {
    id: 'coral',
    legoId: 353,
    bricklinkId: 220,
    legoName: 'Coral',
    bricklinkName: 'Coral',
    hex: '#FF698F',
    symbol: 'F',
    textColor: '#000000',
    category: 'vibrant',
  },
  {
    id: 'orange',
    legoId: 106,
    bricklinkId: 4,
    legoName: 'Bright Orange',
    bricklinkName: 'Orange',
    hex: '#FE8A18',
    symbol: 'G',
    textColor: '#000000',
    category: 'vibrant',
  },
  {
    id: 'bright_light_orange',
    legoId: 105,
    bricklinkId: 31,
    legoName: 'Flame Yellowish Orange',
    bricklinkName: 'Bright Light Orange',
    hex: '#F8BB3D',
    symbol: 'H',
    textColor: '#000000',
    category: 'vibrant',
  },
  {
    id: 'yellow',
    legoId: 24,
    bricklinkId: 3,
    legoName: 'Bright Yellow',
    bricklinkName: 'Yellow',
    hex: '#F2CD37',
    symbol: 'J',
    textColor: '#000000',
    category: 'vibrant',
  },
  {
    id: 'bright_light_yellow',
    legoId: 226,
    bricklinkId: 103,
    legoName: 'Cool Yellow',
    bricklinkName: 'Bright Light Yellow',
    hex: '#FFF03A',
    symbol: 'K',
    textColor: '#000000',
    category: 'vibrant',
  },
  {
    id: 'pearl_gold',
    legoId: 297,
    bricklinkId: 115,
    legoName: 'Warm Gold',
    bricklinkName: 'Pearl Gold',
    hex: '#AA7F2E',
    symbol: 'L',
    textColor: '#FFFFFF',
    category: 'warm',
  },

  // Greens & Olives
  {
    id: 'dark_green',
    legoId: 141,
    bricklinkId: 80,
    legoName: 'Earth Green',
    bricklinkName: 'Dark Green',
    hex: '#184632',
    symbol: 'M',
    textColor: '#FFFFFF',
    category: 'nature',
  },
  {
    id: 'green',
    legoId: 28,
    bricklinkId: 6,
    legoName: 'Dark Green',
    bricklinkName: 'Green',
    hex: '#237841',
    symbol: 'N',
    textColor: '#FFFFFF',
    category: 'nature',
  },
  {
    id: 'bright_green',
    legoId: 37,
    bricklinkId: 36,
    legoName: 'Bright Green',
    bricklinkName: 'Bright Green',
    hex: '#4B9F4A',
    symbol: 'P',
    textColor: '#000000',
    category: 'nature',
  },
  {
    id: 'lime',
    legoId: 119,
    bricklinkId: 34,
    legoName: 'Bright Yellowish Green',
    bricklinkName: 'Lime',
    hex: '#BBE90B',
    symbol: 'R',
    textColor: '#000000',
    category: 'nature',
  },
  {
    id: 'olive_green',
    legoId: 326,
    bricklinkId: 155,
    legoName: 'Olive Green',
    bricklinkName: 'Olive Green',
    hex: '#9B9A5A',
    symbol: 'S',
    textColor: '#000000',
    category: 'nature',
  },
  {
    id: 'sand_green',
    legoId: 151,
    bricklinkId: 48,
    legoName: 'Sand Green',
    bricklinkName: 'Sand Green',
    hex: '#A0BCAC',
    symbol: 'T',
    textColor: '#000000',
    category: 'nature',
  },

  // Blues & Teals
  {
    id: 'dark_blue',
    legoId: 140,
    bricklinkId: 63,
    legoName: 'Earth Blue',
    bricklinkName: 'Dark Blue',
    hex: '#0A3463',
    symbol: 'U',
    textColor: '#FFFFFF',
    category: 'cool',
  },
  {
    id: 'blue',
    legoId: 23,
    bricklinkId: 7,
    legoName: 'Bright Blue',
    bricklinkName: 'Blue',
    hex: '#0055BF',
    symbol: 'V',
    textColor: '#FFFFFF',
    category: 'cool',
  },
  {
    id: 'dark_azure',
    legoId: 321,
    bricklinkId: 153,
    legoName: 'Dark Azure',
    bricklinkName: 'Dark Azure',
    hex: '#078BC9',
    symbol: 'W',
    textColor: '#FFFFFF',
    category: 'cool',
  },
  {
    id: 'medium_blue',
    legoId: 102,
    bricklinkId: 42,
    legoName: 'Medium Blue',
    bricklinkName: 'Medium Blue',
    hex: '#5A93DB',
    symbol: 'X',
    textColor: '#000000',
    category: 'cool',
  },
  {
    id: 'medium_azure',
    legoId: 322,
    bricklinkId: 156,
    legoName: 'Medium Azure',
    bricklinkName: 'Medium Azure',
    hex: '#36AEBF',
    symbol: 'Y',
    textColor: '#000000',
    category: 'cool',
  },
  {
    id: 'bright_light_blue',
    legoId: 212,
    bricklinkId: 105,
    legoName: 'Light Royal Blue',
    bricklinkName: 'Bright Light Blue',
    hex: '#86C1E1',
    symbol: 'Z',
    textColor: '#000000',
    category: 'cool',
  },
  {
    id: 'dark_turquoise',
    legoId: 107,
    bricklinkId: 39,
    legoName: 'Bright Bluish Green',
    bricklinkName: 'Dark Turquoise',
    hex: '#008F9B',
    symbol: '0',
    textColor: '#FFFFFF',
    category: 'cool',
  },
  {
    id: 'light_aqua',
    legoId: 242,
    bricklinkId: 152,
    legoName: 'Light Aqua',
    bricklinkName: 'Light Aqua',
    hex: '#ADC3C0',
    symbol: 'AQ',
    textColor: '#000000',
    category: 'cool',
  },
  {
    id: 'sand_blue',
    legoId: 135,
    bricklinkId: 55,
    legoName: 'Sand Blue',
    bricklinkName: 'Sand Blue',
    hex: '#6074A1',
    symbol: 'SB',
    textColor: '#FFFFFF',
    category: 'cool',
  },

  // Purples & Pinks
  {
    id: 'dark_purple',
    legoId: 268,
    bricklinkId: 89,
    legoName: 'Dark Purple',
    bricklinkName: 'Dark Purple',
    hex: '#3F3691',
    symbol: 'DP',
    textColor: '#FFFFFF',
    category: 'vibrant',
  },
  {
    id: 'magenta',
    legoId: 124,
    bricklinkId: 71,
    legoName: 'Bright Reddish Violet',
    bricklinkName: 'Magenta',
    hex: '#92397D',
    symbol: 'MG',
    textColor: '#FFFFFF',
    category: 'vibrant',
  },
  {
    id: 'medium_lavender',
    legoId: 324,
    bricklinkId: 157,
    legoName: 'Medium Lavender',
    bricklinkName: 'Medium Lavender',
    hex: '#AC78BA',
    symbol: 'ML',
    textColor: '#000000',
    category: 'pastel',
  },
  {
    id: 'lavender',
    legoId: 325,
    bricklinkId: 154,
    legoName: 'Lavender',
    bricklinkName: 'Lavender',
    hex: '#E1D5ED',
    symbol: 'LV',
    textColor: '#000000',
    category: 'pastel',
  },
  {
    id: 'dark_pink',
    legoId: 221,
    bricklinkId: 47,
    legoName: 'Bright Purple',
    bricklinkName: 'Dark Pink',
    hex: '#C870A0',
    symbol: 'PK',
    textColor: '#000000',
    category: 'pastel',
  },
  {
    id: 'bright_pink',
    legoId: 222,
    bricklinkId: 104,
    legoName: 'Light Purple',
    bricklinkName: 'Bright Pink',
    hex: '#E4ADC8',
    symbol: 'BP',
    textColor: '#000000',
    category: 'pastel',
  },
];

export const OFFICIAL_LEGO_COLORS: LegoColor[] = RAW_LEGO_COLORS.map(c => {
  const rgb = hexToRgb(c.hex);
  const lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
  return {
    ...c,
    rgb,
    lab,
  };
});

export const LEGO_COLOR_MAP = new Map<string, LegoColor>(
  OFFICIAL_LEGO_COLORS.map(c => [c.id, c])
);

// Palette Presets
export const PALETTE_PRESETS: {
  id: string;
  name: string;
  description: string;
  colorIds: string[];
}[] = [
  {
    id: 'all',
    name: 'Full LEGO® Spectrum',
    description: 'All 40 official LEGO® dot colors for maximum photorealism',
    colorIds: OFFICIAL_LEGO_COLORS.map(c => c.id),
  },
  {
    id: 'mosaic_maker',
    name: 'Mosaic Maker',
    description: 'White, Light Grey, Dark Grey, Black & Yellow (official 5-color set 40179 palette)',
    colorIds: ['white', 'light_bluish_gray', 'dark_bluish_gray', 'black', 'yellow'],
  },
  {
    id: 'grayscale',
    name: 'Official LEGO® Art Monochrome',
    description: 'Black, Dark Stone Grey, Medium Stone Grey & White (classic film noir)',
    colorIds: ['black', 'dark_bluish_gray', 'light_bluish_gray', 'white'],
  },
  {
    id: 'vintage',
    name: 'Warm Portrait & Sepia',
    description: 'Rich earthy tones, nougats, tans, and browns ideal for skin and vintage art',
    colorIds: ['black', 'dark_brown', 'reddish_brown', 'medium_nougat', 'dark_tan', 'tan', 'light_nougat', 'white'],
  },
  {
    id: 'vibrant',
    name: 'Pop Art & Comic',
    description: 'Bright saturated colors inspired by Andy Warhol & classic pop comics',
    colorIds: ['black', 'white', 'red', 'yellow', 'blue', 'orange', 'bright_green', 'magenta', 'dark_azure'],
  },
  {
    id: 'nature',
    name: 'Nature & Landscape',
    description: 'Earthy greens, foliage, ocean blues, sand and sunshine tones',
    colorIds: ['black', 'dark_green', 'green', 'bright_green', 'lime', 'olive_green', 'sand_green', 'blue', 'medium_blue', 'sand_blue', 'white', 'tan'],
  },
];
