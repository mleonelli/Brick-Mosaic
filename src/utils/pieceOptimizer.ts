import {
  LegoColor,
  MosaicData,
  OptimizationPieceTypeCount,
  OptimizationSummary,
  PieceFamily,
  PieceSizePreference,
  PlacedPiece,
} from '../types';

export interface BrickFootprint {
  width: number;
  height: number;
  studDims: string; // e.g. "2x4", "2x3", "2x2"
  tilePartId: string;
  tilePartName: string;
  platePartId: string;
  platePartName: string;
  area: number;
}

// Master list of standard official LEGO tiles and plates
export const STANDARD_BRICK_CATALOG: BrickFootprint[] = [
  {
    width: 2,
    height: 4,
    studDims: '2x4',
    tilePartId: '87079',
    tilePartName: 'Tile 2 x 4',
    platePartId: '3020',
    platePartName: 'Plate 2 x 4',
    area: 8,
  },
  {
    width: 2,
    height: 3,
    studDims: '2x3',
    tilePartId: '26603',
    tilePartName: 'Tile 2 x 3',
    platePartId: '3021',
    platePartName: 'Plate 2 x 3',
    area: 6,
  },
  {
    width: 2,
    height: 2,
    studDims: '2x2',
    tilePartId: '3068b',
    tilePartName: 'Tile 2 x 2 with Groove',
    platePartId: '3022',
    platePartName: 'Plate 2 x 2',
    area: 4,
  },
  {
    width: 1,
    height: 4,
    studDims: '1x4',
    tilePartId: '2431',
    tilePartName: 'Tile 1 x 4',
    platePartId: '3710',
    platePartName: 'Plate 1 x 4',
    area: 4,
  },
  {
    width: 1,
    height: 3,
    studDims: '1x3',
    tilePartId: '63864',
    tilePartName: 'Tile 1 x 3',
    platePartId: '3623',
    platePartName: 'Plate 1 x 3',
    area: 3,
  },
  {
    width: 1,
    height: 2,
    studDims: '1x2',
    tilePartId: '3069b',
    tilePartName: 'Tile 1 x 2 with Groove',
    platePartId: '3023',
    platePartName: 'Plate 1 x 2',
    area: 2,
  },
  {
    width: 1,
    height: 1,
    studDims: '1x1',
    tilePartId: '3070b',
    tilePartName: 'Tile 1 x 1 with Groove',
    platePartId: '3024',
    platePartName: 'Plate 1 x 1',
    area: 1,
  },
];

interface CandidateOrientation {
  w: number; // width in grid columns
  h: number; // height in grid rows
  spec: BrickFootprint;
}

/**
 * Returns candidate piece sizes and orientations filtered by the user's size strategy.
 */
export function getCandidateOrientations(preference: PieceSizePreference): CandidateOrientation[] {
  let allowedDims: string[] = [];

  switch (preference) {
    case 'bigger':
      // Allows maximum consolidation: 2x4, 2x3, 2x2, 1x4, 1x3, 1x2, 1x1
      allowedDims = ['2x4', '2x3', '2x2', '1x4', '1x3', '1x2', '1x1'];
      break;
    case 'medium':
      // Capped at 2x3, 2x2, 1x3, 1x2, 1x1
      allowedDims = ['2x3', '2x2', '1x3', '1x2', '1x1'];
      break;
    case 'smaller':
      // Finer granularity: 2x2, 1x2, 1x1
      allowedDims = ['2x2', '1x2', '1x1'];
      break;
    default:
      allowedDims = ['2x4', '2x3', '2x2', '1x4', '1x3', '1x2', '1x1'];
  }

  const filteredSpecs = STANDARD_BRICK_CATALOG.filter((spec) => allowedDims.includes(spec.studDims));

  const candidates: CandidateOrientation[] = [];

  for (const spec of filteredSpecs) {
    if (spec.width === spec.height) {
      candidates.push({ w: spec.width, h: spec.height, spec });
    } else {
      // For rectangular pieces, horizontal layout is prioritized for standard Lego masonry bond
      candidates.push({ w: Math.max(spec.width, spec.height), h: Math.min(spec.width, spec.height), spec });
      candidates.push({ w: Math.min(spec.width, spec.height), h: Math.max(spec.width, spec.height), spec });
    }
  }

  // Sort candidates by area descending; for equal areas, prefer square/wider horizontal orientations
  candidates.sort((a, b) => {
    if (b.spec.area !== a.spec.area) {
      return b.spec.area - a.spec.area;
    }
    return b.w - a.w;
  });

  return candidates;
}

/**
 * Calculates which other tile or plate squares/rectangles can be used to cover bigger areas.
 * Strict Constraint: Do not mix tiles with plates in a single mosaic calculation.
 */
export function calculatePieceOptimization(
  mosaic: MosaicData,
  family: PieceFamily,
  preference: PieceSizePreference
): OptimizationSummary {
  const { width, height, pixels } = mosaic;
  const candidates = getCandidateOrientations(preference);

  // 2D tracking matrix of covered cells
  const covered: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
  const pieceGrid: (PlacedPiece | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
  const pieces: PlacedPiece[] = [];

  let pieceIdCounter = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (covered[y][x]) continue;

      const targetColor = pixels[y][x];
      const targetColorId = targetColor.id;

      // Find the best fitting piece from our candidate orientations
      let chosenCandidate: CandidateOrientation | null = null;

      for (let i = 0; i < candidates.length; i++) {
        const { w, h, spec } = candidates[i];

        // Boundary check
        if (x + w > width || y + h > height) continue;

        // Check if all cells in this rectangle match target color and are uncovered
        let matches = true;
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            const cy = y + dy;
            const cx = x + dx;
            if (covered[cy][cx] || pixels[cy][cx].id !== targetColorId) {
              matches = false;
              break;
            }
          }
          if (!matches) break;
        }

        if (matches) {
          chosenCandidate = { w, h, spec };
          break;
        }
      }

      // Fallback: 1x1 piece if no larger shape fit
      if (!chosenCandidate) {
        const spec1x1 = STANDARD_BRICK_CATALOG.find((s) => s.studDims === '1x1')!;
        chosenCandidate = { w: 1, h: 1, spec: spec1x1 };
      }

      const { w, h, spec } = chosenCandidate;
      pieceIdCounter++;

      const partId = family === 'tile' ? spec.tilePartId : spec.platePartId;
      const partName = family === 'tile' ? spec.tilePartName : spec.platePartName;

      const placed: PlacedPiece = {
        id: `p_${pieceIdCounter}_${x}_${y}`,
        x,
        y,
        width: w,
        height: h,
        color: targetColor,
        family,
        partId,
        partName,
        studDims: spec.studDims,
        area: w * h,
      };

      pieces.push(placed);

      // Mark cells as covered and populate grid reference
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          covered[y + dy][x + dx] = true;
          pieceGrid[y + dy][x + dx] = placed;
        }
      }
    }
  }

  // Group counts by piece type (e.g. 2x4, 2x3, 2x2, etc.)
  const typeMap = new Map<
    string,
    {
      studDims: string;
      partId: string;
      partName: string;
      family: PieceFamily;
      count: number;
      area: number;
      colors: Map<string, { color: LegoColor; count: number }>;
    }
  >();

  // Group counts by unique (piece + color) combination for BOM & BrickLink lists
  const pieceAndColorMap = new Map<
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
  >();

  for (const piece of pieces) {
    // Type map entry
    if (!typeMap.has(piece.studDims)) {
      typeMap.set(piece.studDims, {
        studDims: piece.studDims,
        partId: piece.partId,
        partName: piece.partName,
        family: piece.family,
        count: 0,
        area: piece.area,
        colors: new Map(),
      });
    }
    const typeEntry = typeMap.get(piece.studDims)!;
    typeEntry.count++;

    if (!typeEntry.colors.has(piece.color.id)) {
      typeEntry.colors.set(piece.color.id, { color: piece.color, count: 0 });
    }
    typeEntry.colors.get(piece.color.id)!.count++;

    // Piece + Color entry
    const comboKey = `${piece.partId}_${piece.color.id}`;
    if (!pieceAndColorMap.has(comboKey)) {
      pieceAndColorMap.set(comboKey, {
        key: comboKey,
        partId: piece.partId,
        partName: piece.partName,
        studDims: piece.studDims,
        family: piece.family,
        color: piece.color,
        count: 0,
      });
    }
    pieceAndColorMap.get(comboKey)!.count++;
  }

  const countsByPieceType: OptimizationPieceTypeCount[] = Array.from(typeMap.values())
    .map((entry) => ({
      studDims: entry.studDims,
      partId: entry.partId,
      partName: entry.partName,
      family: entry.family,
      count: entry.count,
      area: entry.area,
      colorBreakdown: Array.from(entry.colors.values()).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.area - a.area || b.count - a.count);

  const originalDots = width * height;
  const totalPieces = pieces.length;
  const reductionPercent = Math.round(((originalDots - totalPieces) / originalDots) * 100);

  return {
    pieces,
    pieceGrid,
    totalPieces,
    originalDots,
    reductionPercent,
    family,
    sizePreference: preference,
    countsByPieceType,
    countsByPieceAndColor: pieceAndColorMap,
  };
}
