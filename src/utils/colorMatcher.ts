import { LegoColor, MosaicData, MosaicSettings } from '../types';
import { rgbToLab } from '../data/legoColors';

// Calculate perceptual color distance in CIELAB space (CIE76 Delta E)
export function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Find closest Lego color from a given palette
export function findClosestLegoColor(
  r: number,
  g: number,
  b: number,
  palette: LegoColor[]
): LegoColor {
  const targetLab = rgbToLab(
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b))
  );

  let closestColor = palette[0];
  let minDistance = Infinity;

  for (let i = 0; i < palette.length; i++) {
    const dist = deltaE(targetLab, palette[i].lab);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = palette[i];
    }
  }

  return closestColor;
}

// Adjust pixel RGB with brightness, contrast, and saturation
function adjustPixel(
  r: number,
  g: number,
  b: number,
  brightness: number,
  contrast: number,
  saturation: number
): [number, number, number] {
  // Brightness: -50 to 50 -> -128 to 128
  let adjR = r + (brightness / 50) * 80;
  let adjG = g + (brightness / 50) * 80;
  let adjB = b + (brightness / 50) * 80;

  // Contrast: -50 to 50 -> factor from 0.4 to 2.2
  const contrastFactor = (259 * (contrast + 100)) / (100 * (259 - contrast));
  adjR = contrastFactor * (adjR - 128) + 128;
  adjG = contrastFactor * (adjG - 128) + 128;
  adjB = contrastFactor * (adjB - 128) + 128;

  // Saturation: -50 to 50 -> multiplier 0 to 2
  const gray = 0.2989 * adjR + 0.587 * adjG + 0.114 * adjB;
  const satFactor = 1 + saturation / 50;
  adjR = gray + (adjR - gray) * satFactor;
  adjG = gray + (adjG - gray) * satFactor;
  adjB = gray + (adjB - gray) * satFactor;

  return [
    Math.max(0, Math.min(255, Math.round(adjR))),
    Math.max(0, Math.min(255, Math.round(adjG))),
    Math.max(0, Math.min(255, Math.round(adjB))),
  ];
}

// 8x8 Bayer threshold matrix for clean, structured halftoning (zero noisy worms)
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// Unsharp mask pre-filter to preserve key facial and silhouette details
function applyUnsharpMask(
  bufferR: number[][],
  bufferG: number[][],
  bufferB: number[][],
  width: number,
  height: number,
  sharpnessPct: number
) {
  if (sharpnessPct <= 0) return;
  const factor = (sharpnessPct / 100) * 1.2;

  // 3x3 box blur
  const blurredR: number[][] = [];
  const blurredG: number[][] = [];
  const blurredB: number[][] = [];

  for (let y = 0; y < height; y++) {
    blurredR[y] = [];
    blurredG[y] = [];
    blurredB[y] = [];
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          sumR += bufferR[ny][nx];
          sumG += bufferG[ny][nx];
          sumB += bufferB[ny][nx];
          count++;
        }
      }
      blurredR[y][x] = sumR / count;
      blurredG[y][x] = sumG / count;
      blurredB[y][x] = sumB / count;
    }
  }

  // Boost high frequency: sharp = orig + factor * (orig - blurred)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = bufferR[y][x] + factor * (bufferR[y][x] - blurredR[y][x]);
      const g = bufferG[y][x] + factor * (bufferG[y][x] - blurredG[y][x]);
      const b = bufferB[y][x] + factor * (bufferB[y][x] - blurredB[y][x]);
      bufferR[y][x] = Math.max(0, Math.min(255, r));
      bufferG[y][x] = Math.max(0, Math.min(255, g));
      bufferB[y][x] = Math.max(0, Math.min(255, b));
    }
  }
}

// Compute luminance edge map to prevent dithering error from bleeding across sharp facial contours
function computeEdgeMap(
  bufferR: number[][],
  bufferG: number[][],
  bufferB: number[][],
  width: number,
  height: number
): number[][] {
  const edgeMap: number[][] = [];
  for (let y = 0; y < height; y++) {
    edgeMap[y] = [];
    for (let x = 0; x < width; x++) {
      const l = 0.299 * bufferR[y][x] + 0.587 * bufferG[y][x] + 0.114 * bufferB[y][x];
      const left = x > 0 ? (0.299 * bufferR[y][x - 1] + 0.587 * bufferG[y][x - 1] + 0.114 * bufferB[y][x - 1]) : l;
      const right = x + 1 < width ? (0.299 * bufferR[y][x + 1] + 0.587 * bufferG[y][x + 1] + 0.114 * bufferB[y][x + 1]) : l;
      const top = y > 0 ? (0.299 * bufferR[y - 1][x] + 0.587 * bufferG[y - 1][x] + 0.114 * bufferB[y - 1][x]) : l;
      const bottom = y + 1 < height ? (0.299 * bufferR[y + 1][x] + 0.587 * bufferG[y + 1][x] + 0.114 * bufferB[y + 1][x]) : l;

      const dx = Math.abs(right - left);
      const dy = Math.abs(bottom - top);
      edgeMap[y][x] = Math.sqrt(dx * dx + dy * dy);
    }
  }
  return edgeMap;
}

// Smart despeckle filter to clean up single isolated "orphan" studs that look like noise
function despeckleMosaic(pixels: LegoColor[][], width: number, height: number): LegoColor[][] {
  const result: LegoColor[][] = [];
  for (let y = 0; y < height; y++) {
    result[y] = [...pixels[y]];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerColor = pixels[y][x];
      let sameCount = 0;
      const neighborFreq = new Map<string, { color: LegoColor; count: number }>();

      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          if (dx === 0 && dy === 0) continue;

          const nColor = pixels[ny][nx];
          if (nColor.id === centerColor.id) {
            sameCount++;
          } else {
            const cur = neighborFreq.get(nColor.id);
            if (cur) cur.count++;
            else neighborFreq.set(nColor.id, { color: nColor, count: 1 });
          }
        }
      }

      // If isolated (0 or 1 matching neighbor out of up to 8) and clear dominant neighbor exists
      if (sameCount <= 1) {
        let maxCount = 0;
        let dominantColor: LegoColor | null = null;
        for (const entry of neighborFreq.values()) {
          if (entry.count > maxCount) {
            maxCount = entry.count;
            dominantColor = entry.color;
          }
        }
        if (dominantColor && maxCount >= 5) {
          result[y][x] = dominantColor;
        }
      }
    }
  }

  return result;
}

export function generateMosaicFromImage(
  img: HTMLImageElement,
  settings: MosaicSettings,
  availableColors: LegoColor[]
): MosaicData {
  const {
    width,
    height,
    ditherMode,
    ditherStrength = 65,
    sharpness = 35,
    cleanOrphans = true,
    maxColors,
    brightness,
    contrast,
    saturation,
    scaleMode,
    offsetX,
    offsetY,
    zoom,
  } = settings;

  // Filter available colors to only allowed ones
  const allowedColors = availableColors.filter(c =>
    settings.selectedColorIds.includes(c.id)
  );

  const activePalette = allowedColors.length > 0 ? allowedColors : availableColors;

  // Render to offscreen canvas with crop, offset, zoom
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not create offscreen canvas context');
  }

  // Draw background (black or white)
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, width, height);

  // Compute source crop and dest dimensions based on scaleMode, zoom, offsets
  const imgAspect = img.width / img.height;
  const targetAspect = width / height;

  let renderW = width;
  let renderH = height;
  let drawX = 0;
  let drawY = 0;

  if (scaleMode === 'cover') {
    if (imgAspect > targetAspect) {
      // Image is wider than target
      renderH = height;
      renderW = height * imgAspect;
    } else {
      // Image is taller than target
      renderW = width;
      renderH = width / imgAspect;
    }
  } else {
    // contain
    if (imgAspect > targetAspect) {
      renderW = width;
      renderH = width / imgAspect;
    } else {
      renderH = height;
      renderW = height * imgAspect;
    }
  }

  // Apply zoom
  renderW *= zoom;
  renderH *= zoom;

  // Center + user offset (-50% to +50% of dimension)
  drawX = (width - renderW) / 2 + (offsetX / 100) * width;
  drawY = (height - renderH) / 2 + (offsetY / 100) * height;

  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, drawX, drawY, renderW, renderH);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Build working floating-point RGB grid
  const bufferR: number[][] = [];
  const bufferG: number[][] = [];
  const bufferB: number[][] = [];

  for (let y = 0; y < height; y++) {
    bufferR[y] = [];
    bufferG[y] = [];
    bufferB[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b] = adjustPixel(
        data[idx],
        data[idx + 1],
        data[idx + 2],
        brightness,
        contrast,
        saturation
      );
      bufferR[y][x] = r;
      bufferG[y][x] = g;
      bufferB[y][x] = b;
    }
  }

  // Apply unsharp mask pre-filtering to preserve essential eye, facial, and silhouette lines
  if (sharpness > 0) {
    applyUnsharpMask(bufferR, bufferG, bufferB, width, height, sharpness);
  }

  // Precompute luminance edge map for edge-aware dithering
  const edgeMap = computeEdgeMap(bufferR, bufferG, bufferB, width, height);

  // If maxColors is less than activePalette length, find the optimal subset of K colors
  let effectivePalette = activePalette;
  if (maxColors > 0 && maxColors < activePalette.length) {
    // 1st pass: test frequency distribution using entire activePalette
    const colorUsage = new Map<string, number>();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = findClosestLegoColor(bufferR[y][x], bufferG[y][x], bufferB[y][x], activePalette);
        colorUsage.set(c.id, (colorUsage.get(c.id) || 0) + 1);
      }
    }

    // Sort active colors by highest frequency
    const sortedActiveColors = [...activePalette].sort((a, b) => {
      const countA = colorUsage.get(a.id) || 0;
      const countB = colorUsage.get(b.id) || 0;
      return countB - countA;
    });

    // Select top K colors
    effectivePalette = sortedActiveColors.slice(0, Math.max(2, maxColors));
  }

  // 2nd pass: apply quantization and dithering to produce raw grid
  const rawPixels: LegoColor[][] = [];
  for (let y = 0; y < height; y++) {
    rawPixels[y] = new Array(width);
  }

  if (ditherMode === 'none') {
    // Clean block color: direct perceptual matching without diffusion
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        rawPixels[y][x] = findClosestLegoColor(
          bufferR[y][x],
          bufferG[y][x],
          bufferB[y][x],
          effectivePalette
        );
      }
    }
  } else if (ditherMode === 'ordered_bayer') {
    // Ordered 8x8 Bayer matrix halftoning: clean, structured, zero worm noise
    const spread = (ditherStrength / 100) * 36;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const bayerVal = BAYER_8X8[y % 8][x % 8] / 64 - 0.5; // -0.5 to +0.5
        const offset = bayerVal * spread;
        const r = Math.max(0, Math.min(255, bufferR[y][x] + offset));
        const g = Math.max(0, Math.min(255, bufferG[y][x] + offset));
        const b = Math.max(0, Math.min(255, bufferB[y][x] + offset));
        rawPixels[y][x] = findClosestLegoColor(r, g, b, effectivePalette);
      }
    }
  } else if (ditherMode === 'lego_mosaic') {
    // Official Lego Mosaic Maker algorithm:
    // 1. Serpentine scanning to eliminate diagonal worm artifacts
    // 2. Edge-aware attenuation to keep facial contours crisp
    // 3. Error damping and clamping to prevent runaway noise
    const baseDiffusion = (ditherStrength / 100) * 0.72;

    for (let y = 0; y < height; y++) {
      const isLTR = y % 2 === 0;
      const startX = isLTR ? 0 : width - 1;
      const endX = isLTR ? width : -1;
      const stepX = isLTR ? 1 : -1;

      for (let x = startX; x !== endX; x += stepX) {
        const currentR = bufferR[y][x];
        const currentG = bufferG[y][x];
        const currentB = bufferB[y][x];

        const closest = findClosestLegoColor(currentR, currentG, currentB, effectivePalette);
        rawPixels[y][x] = closest;

        // Attenuate error if on a sharp edge to prevent smudging contours
        const isEdge = edgeMap[y][x] > 26;
        const edgeAtten = isEdge ? 0.35 : 1.0;
        const diffRate = baseDiffusion * edgeAtten;

        // Clamp individual error to prevent extreme pixel blowout
        const errR = Math.max(-46, Math.min(46, (currentR - closest.rgb[0]) * diffRate));
        const errG = Math.max(-46, Math.min(46, (currentG - closest.rgb[1]) * diffRate));
        const errB = Math.max(-46, Math.min(46, (currentB - closest.rgb[2]) * diffRate));

        if (isLTR) {
          // Even row (scanning left-to-right)
          if (x + 1 < width) {
            bufferR[y][x + 1] += (errR * 7) / 16;
            bufferG[y][x + 1] += (errG * 7) / 16;
            bufferB[y][x + 1] += (errB * 7) / 16;
          }
          if (y + 1 < height) {
            if (x - 1 >= 0) {
              bufferR[y + 1][x - 1] += (errR * 3) / 16;
              bufferG[y + 1][x - 1] += (errG * 3) / 16;
              bufferB[y + 1][x - 1] += (errB * 3) / 16;
            }
            bufferR[y + 1][x] += (errR * 5) / 16;
            bufferG[y + 1][x] += (errG * 5) / 16;
            bufferB[y + 1][x] += (errB * 5) / 16;
            if (x + 1 < width) {
              bufferR[y + 1][x + 1] += (errR * 1) / 16;
              bufferG[y + 1][x + 1] += (errG * 1) / 16;
              bufferB[y + 1][x + 1] += (errB * 1) / 16;
            }
          }
        } else {
          // Odd row (scanning right-to-left)
          if (x - 1 >= 0) {
            bufferR[y][x - 1] += (errR * 7) / 16;
            bufferG[y][x - 1] += (errG * 7) / 16;
            bufferB[y][x - 1] += (errB * 7) / 16;
          }
          if (y + 1 < height) {
            if (x + 1 < width) {
              bufferR[y + 1][x + 1] += (errR * 3) / 16;
              bufferG[y + 1][x + 1] += (errG * 3) / 16;
              bufferB[y + 1][x + 1] += (errB * 3) / 16;
            }
            bufferR[y + 1][x] += (errR * 5) / 16;
            bufferG[y + 1][x] += (errG * 5) / 16;
            bufferB[y + 1][x] += (errB * 5) / 16;
            if (x - 1 >= 0) {
              bufferR[y + 1][x - 1] += (errR * 1) / 16;
              bufferG[y + 1][x - 1] += (errG * 1) / 16;
              bufferB[y + 1][x - 1] += (errB * 1) / 16;
            }
          }
        }
      }
    }
  } else if (ditherMode === 'floyd_steinberg') {
    // Classic Floyd-Steinberg error diffusion scaled by ditherStrength
    const diffFactor = ditherStrength / 100;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentR = bufferR[y][x];
        const currentG = bufferG[y][x];
        const currentB = bufferB[y][x];

        const closest = findClosestLegoColor(currentR, currentG, currentB, effectivePalette);
        rawPixels[y][x] = closest;

        const errR = (currentR - closest.rgb[0]) * diffFactor;
        const errG = (currentG - closest.rgb[1]) * diffFactor;
        const errB = (currentB - closest.rgb[2]) * diffFactor;

        if (x + 1 < width) {
          bufferR[y][x + 1] += (errR * 7) / 16;
          bufferG[y][x + 1] += (errG * 7) / 16;
          bufferB[y][x + 1] += (errB * 7) / 16;
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            bufferR[y + 1][x - 1] += (errR * 3) / 16;
            bufferG[y + 1][x - 1] += (errG * 3) / 16;
            bufferB[y + 1][x - 1] += (errB * 3) / 16;
          }
          bufferR[y + 1][x] += (errR * 5) / 16;
          bufferG[y + 1][x] += (errG * 5) / 16;
          bufferB[y + 1][x] += (errB * 5) / 16;
          if (x + 1 < width) {
            bufferR[y + 1][x + 1] += (errR * 1) / 16;
            bufferG[y + 1][x + 1] += (errG * 1) / 16;
            bufferB[y + 1][x + 1] += (errB * 1) / 16;
          }
        }
      }
    }
  } else if (ditherMode === 'atkinson') {
    // Classic Atkinson dithering scaled by ditherStrength
    const diffFactor = (ditherStrength / 100) / 8;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentR = bufferR[y][x];
        const currentG = bufferG[y][x];
        const currentB = bufferB[y][x];

        const closest = findClosestLegoColor(currentR, currentG, currentB, effectivePalette);
        rawPixels[y][x] = closest;

        const diffR = (currentR - closest.rgb[0]) * diffFactor;
        const diffG = (currentG - closest.rgb[1]) * diffFactor;
        const diffB = (currentB - closest.rgb[2]) * diffFactor;

        if (x + 1 < width) {
          bufferR[y][x + 1] += diffR;
          bufferG[y][x + 1] += diffG;
          bufferB[y][x + 1] += diffB;
        }
        if (x + 2 < width) {
          bufferR[y][x + 2] += diffR;
          bufferG[y][x + 2] += diffG;
          bufferB[y][x + 2] += diffB;
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            bufferR[y + 1][x - 1] += diffR;
            bufferG[y + 1][x - 1] += diffG;
            bufferB[y + 1][x - 1] += diffB;
          }
          bufferR[y + 1][x] += diffR;
          bufferG[y + 1][x] += diffG;
          bufferB[y + 1][x] += diffB;
          if (x + 1 < width) {
            bufferR[y + 1][x + 1] += diffR;
            bufferG[y + 1][x + 1] += diffG;
            bufferB[y + 1][x + 1] += diffB;
          }
        }
        if (y + 2 < height) {
          bufferR[y + 2][x] += diffR;
          bufferG[y + 2][x] += diffG;
          bufferB[y + 2][x] += diffB;
        }
      }
    }
  }

  // 3rd pass: Smart Despeckle filter to eliminate isolated orphan studs
  const finalPixels = cleanOrphans ? despeckleMosaic(rawPixels, width, height) : rawPixels;

  // 4th pass: Accurately recount colors from final refined pixel array
  const colorCounts = new Map<string, { color: LegoColor; count: number }>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = finalPixels[y][x];
      const existing = colorCounts.get(c.id);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(c.id, { color: c, count: 1 });
      }
    }
  }

  // Sort unique colors by count descending
  const uniqueColors = Array.from<{ color: LegoColor; count: number }>(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.color);

  return {
    width,
    height,
    pixels: finalPixels,
    colorCounts,
    uniqueColors,
    totalDots: width * height,
  };
}
