import { jsPDF } from 'jspdf';
import { DotShape, LegoColor, MosaicData, MosaicSettings } from '../types';
import { getLegoPartNumber } from './bricklinkExport';

export type PdfSymbolMode = 'palette' | 'sequential';

export interface GeneratePdfOptions {
  mosaic: MosaicData;
  settings: MosaicSettings;
  projectName?: string;
  symbolMode?: PdfSymbolMode;
  onProgress?: (progress: number, status: string) => void;
}

export async function generateInstructionManualPdf({
  mosaic,
  settings,
  projectName = 'LEGO® Art Mosaic',
  symbolMode = 'palette',
  onProgress,
}: GeneratePdfOptions): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const { width, height } = mosaic;
  const subSize = 16; // 16x16 subplate standard for Lego Art

  const subPlatesX = Math.ceil(width / subSize);
  const subPlatesY = Math.ceil(height / subSize);
  const totalPlates = subPlatesX * subPlatesY;

  // Build clean alphanumeric symbol mapping for colors used in this mosaic
  const colorSymbolMap = new Map<string, string>();
  if (symbolMode === 'sequential') {
    // Sequential 1..N order based on part count (most common pieces are #1, etc. - Official LEGO Art style)
    const sortedByCount = [...mosaic.uniqueColors].sort((a, b) => {
      const ca = mosaic.colorCounts.get(a.id)?.count || 0;
      const cb = mosaic.colorCounts.get(b.id)?.count || 0;
      return cb - ca;
    });
    sortedByCount.forEach((color, idx) => {
      colorSymbolMap.set(color.id, String(idx + 1));
    });
  } else {
    // Palette mode: use color.symbol, sanitized to uppercase ASCII alphanumeric only
    mosaic.uniqueColors.forEach((color, idx) => {
      const clean = (color.symbol || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
      colorSymbolMap.set(color.id, clean || String(idx + 1));
    });
  }

  const getSymbol = (color: LegoColor): string => {
    return colorSymbolMap.get(color.id) || (color.symbol || '').replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase() || '1';
  };

  // 1. Render thumbnail image of full mosaic for cover page
  onProgress?.(5, 'Rendering cover artwork...');
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = width * 8;
  thumbCanvas.height = height * 8;
  const thumbCtx = thumbCanvas.getContext('2d')!;
  thumbCtx.fillStyle = '#111827';
  thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);

  const dotRadius = 3.6;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = mosaic.pixels[y][x];
      const cx = x * 8 + 4;
      const cy = y * 8 + 4;
      if (color) {
        thumbCtx.fillStyle = color.hex;
        thumbCtx.beginPath();
        thumbCtx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        thumbCtx.fill();
      } else {
        thumbCtx.fillStyle = '#1e2430';
        thumbCtx.beginPath();
        thumbCtx.arc(cx, cy, dotRadius * 0.6, 0, Math.PI * 2);
        thumbCtx.fill();
      }
    }
  }
  const fullMosaicImgData = thumbCanvas.toDataURL('image/jpeg', 0.9);

  // ================= PAGE 1: COVER PAGE =================
  onProgress?.(15, 'Building cover page...');
  // Dark luxury Lego Art booklet cover
  doc.setFillColor(17, 24, 39); // Dark slate (#111827)
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Lego Art yellow accent bar
  doc.setFillColor(254, 205, 27); // Lego Yellow
  doc.rect(15, 18, 4, 32, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(projectName.toUpperCase(), 24, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(156, 163, 175);
  doc.text('OFFICIAL 1×1 DOT BUILDING INSTRUCTION MANUAL', 24, 36);
  doc.text(`Designed for LEGO® Baseplate System • ${width} × ${height} Studs (${mosaic.totalDots.toLocaleString()} Dots)`, 24, 43);

  // Full Mosaic Preview Image in Center/Right
  const maxImgW = 100;
  const maxImgH = 100;
  let imgW = maxImgW;
  let imgH = maxImgH;
  if (width > height) {
    imgH = (height / width) * maxImgW;
  } else {
    imgW = (width / height) * maxImgH;
  }
  const imgX = pageWidth - imgW - 24;
  const imgY = 60;

  // Frame around preview
  doc.setDrawColor(55, 65, 81);
  doc.setLineWidth(0.8);
  doc.rect(imgX - 3, imgY - 3, imgW + 6, imgH + 6);
  doc.addImage(fullMosaicImgData, 'JPEG', imgX, imgY, imgW, imgH);

  // Left Specifications Card
  doc.setFillColor(31, 41, 55);
  doc.rect(24, 60, 130, 115, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('MODEL SPECIFICATIONS', 32, 73);

  const specs = [
    ['Canvas Dimensions', `${width} × ${height} studs (${(width * 0.8).toFixed(1)} × ${(height * 0.8).toFixed(1)} cm)`],
    ['Total 1×1 Dots', `${mosaic.totalDots.toLocaleString()} pieces`],
    ['Dot Element', `${getLegoPartNumber(settings.dotShape).partName} (Part #${getLegoPartNumber(settings.dotShape).partId})`],
    ['Active Palette', `${mosaic.uniqueColors.length} official LEGO® colors`],
    ['Subplate Assembly', `${totalPlates} section plates (${subPlatesX} wide × ${subPlatesY} tall)`],
    ['Standard Baseplate', `${subSize} × ${subSize} LEGO® Art Technic Bricks (Part #65803)`],
  ];

  doc.setFontSize(9.5);
  let specY = 86;
  specs.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(label, 32, specY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(243, 244, 246);
    doc.text(value, 32, specY + 5.5);
    specY += 14;
  });

  // Footer bar on cover
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Generated with Brick Mosaic Studio • Compatible with official LEGO® baseplates & BrickLink parts ordering', 24, 198);

  // ================= PAGE 2: COLOR INVENTORY & KEY =================
  onProgress?.(30, 'Generating parts inventory & color key...');
  doc.addPage('a4', 'landscape');

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('COLOR PALETTE & PARTS INVENTORY', 18, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(209, 213, 219);
  doc.text(`Total Dots: ${mosaic.totalDots.toLocaleString()}  •  ${mosaic.uniqueColors.length} Unique Colors`, pageWidth - 80, 14);

  // Color Key Grid (columns of color keys)
  const colors = mosaic.uniqueColors;
  const cols = 2;
  const itemsPerCol = Math.ceil(colors.length / cols);
  const colWidth = 125;
  const startX = 18;
  const startY = 32;
  const rowHeight = 9.5;

  for (let i = 0; i < colors.length; i++) {
    const colIdx = Math.floor(i / itemsPerCol);
    const rowIdx = i % itemsPerCol;
    const x = startX + colIdx * (colWidth + 14);
    const y = startY + rowIdx * rowHeight;

    const color = colors[i];
    const count = mosaic.colorCounts.get(color.id)?.count || 0;
    const pct = ((count / mosaic.totalDots) * 100).toFixed(1);

    const symbol = getSymbol(color);

    // Color circle swatch with border
    doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2]);
    doc.circle(x + 5, y + 4, 3.8, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.circle(x + 5, y + 4, 3.8, 'S');

    // Symbol badge box (sized for 1-char or 2-char alphanumeric codes)
    const boxW = symbol.length > 1 ? 7.5 : 6.2;
    doc.setFillColor(243, 244, 246);
    doc.rect(x + 12.5, y + 0.5, boxW, 6.8, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.2);
    doc.rect(x + 12.5, y + 0.5, boxW, 6.8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(symbol.length > 2 ? 7 : symbol.length > 1 ? 7.5 : 8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(symbol, x + 12.5 + boxW / 2, y + 3.9, { align: 'center', baseline: 'middle' });

    // Official Lego Name & BrickLink ID
    const labelX = x + 12.5 + boxW + 2.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(31, 41, 55);
    doc.text(color.legoName, labelX, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text(`BL ID: ${color.bricklinkId} (${color.bricklinkName})`, labelX, y + 7.2);

    // Quantity count & percentage
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(`${count.toLocaleString()} pcs`, x + colWidth - 14, y + 4, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`${pct}%`, x + colWidth - 14, y + 7.5, { align: 'right' });

    // Divider line
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(x, y + rowHeight - 0.5, x + colWidth, y + rowHeight - 0.5);
  }

  // Footer note on parts
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Tip: When purchasing on BrickLink, add 5% spare dots to account for small dropped pieces during assembly.', 18, 198);

  // ================= PAGES 3+: SUBPLATE INSTRUCTIONS =================
  let plateIndex = 0;
  for (let py = 0; py < subPlatesY; py++) {
    for (let px = 0; px < subPlatesX; px++) {
      plateIndex++;
      const progressPct = 35 + Math.round((plateIndex / totalPlates) * 60);
      onProgress?.(progressPct, `Building Plate ${plateIndex} of ${totalPlates}...`);

      doc.addPage('a4', 'landscape');

      // Header Bar
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, pageWidth, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`PLATE ${plateIndex} OF ${totalPlates}`, 18, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(209, 213, 219);
      const startCol = px * subSize + 1;
      const endCol = Math.min((px + 1) * subSize, width);
      const startRow = py * subSize + 1;
      const endRow = Math.min((py + 1) * subSize, height);
      doc.text(`Coordinates: Cols ${startCol}–${endCol}  •  Rows ${startRow}–${endRow}`, 80, 13);

      // Plate locator thumbnail in top-right header
      const miniW = 28;
      const miniH = 14;
      const miniX = pageWidth - miniW - 18;
      const miniY = 3;
      doc.setFillColor(31, 41, 55);
      doc.rect(miniX, miniY, miniW, miniH, 'F');

      const cellW = miniW / subPlatesX;
      const cellH = miniH / subPlatesY;
      for (let sy = 0; sy < subPlatesY; sy++) {
        for (let sx = 0; sx < subPlatesX; sx++) {
          const isCurrent = sx === px && sy === py;
          if (isCurrent) {
            doc.setFillColor(254, 205, 27); // Highlight yellow
          } else {
            doc.setFillColor(55, 65, 81);
          }
          doc.rect(miniX + sx * cellW + 0.3, miniY + sy * cellH + 0.3, cellW - 0.6, cellH - 0.6, 'F');
        }
      }

      // Large 16x16 Grid Drawing on Left/Center
      const gridStartX = 28;
      const gridStartY = 28;
      const gridSize = 160; // 160mm total
      const cellSize = gridSize / subSize; // 10mm per stud! Very readable!
      const dotR = cellSize * 0.42;

      // Dark plate base background (simulates 16x16 black technic plate)
      doc.setFillColor(28, 34, 46);
      doc.rect(gridStartX, gridStartY, gridSize, gridSize, 'F');

      // Grid Coordinate labels (top 1-16, left 1-16)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      for (let c = 0; c < subSize; c++) {
        const colNum = (startCol + c).toString();
        doc.text(colNum, gridStartX + c * cellSize + cellSize / 2, gridStartY - 2.5, { align: 'center' });
      }

      for (let r = 0; r < subSize; r++) {
        const rowNum = (startRow + r).toString();
        doc.text(rowNum, gridStartX - 3.5, gridStartY + r * cellSize + cellSize / 2 + 2, { align: 'right' });
      }

      // Count colors required for this specific plate
      const plateColorCounts = new Map<string, { color: LegoColor; count: number }>();

      // Draw each dot inside this 16x16 plate
      for (let ry = 0; ry < subSize; ry++) {
        const globalY = py * subSize + ry;
        for (let cx = 0; cx < subSize; cx++) {
          const globalX = px * subSize + cx;

          const cellX = gridStartX + cx * cellSize;
          const cellY = gridStartY + ry * cellSize;

          // Inner grid line
          doc.setDrawColor(45, 55, 72);
          doc.setLineWidth(0.15);
          doc.rect(cellX, cellY, cellSize, cellSize, 'S');

          if (globalY < height && globalX < width) {
            const color = mosaic.pixels[globalY][globalX];

            if (color) {
              // Update plate color count
              const curr = plateColorCounts.get(color.id);
              if (curr) {
                curr.count++;
              } else {
                plateColorCounts.set(color.id, { color, count: 1 });
              }

              const centerX = cellX + cellSize / 2;
              const centerY = cellY + cellSize / 2;

              // Dot fill
              doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2]);
              doc.circle(centerX, centerY, dotR, 'F');

              // Subtle outer ring
              doc.setDrawColor(
                Math.max(0, color.rgb[0] - 30),
                Math.max(0, color.rgb[1] - 30),
                Math.max(0, color.rgb[2] - 30)
              );
              doc.setLineWidth(0.2);
              doc.circle(centerX, centerY, dotR, 'S');

              // Symbol/Number inside the dot for error-free assembly
              const symbol = getSymbol(color);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(symbol.length > 2 ? 6 : symbol.length > 1 ? 7 : 8);
              if (color.textColor === '#FFFFFF') {
                doc.setTextColor(255, 255, 255);
              } else {
                doc.setTextColor(0, 0, 0);
              }
              doc.text(symbol, centerX, centerY, { align: 'center', baseline: 'middle' });
            } else {
              // Empty baseplate stud on this plate position
              const centerX = cellX + cellSize / 2;
              const centerY = cellY + cellSize / 2;
              doc.setFillColor(220, 226, 235);
              doc.circle(centerX, centerY, dotR * 0.45, 'F');
              doc.setDrawColor(180, 190, 205);
              doc.setLineWidth(0.2);
              doc.circle(centerX, centerY, dotR * 0.45, 'S');
            }
          }
        }
      }

      // Right Column: Color Key for THIS specific plate
      const rightColX = gridStartX + gridSize + 10;
      const rightColW = pageWidth - rightColX - 16;

      doc.setFillColor(248, 250, 252);
      doc.rect(rightColX, gridStartY, rightColW, gridSize, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(rightColX, gridStartY, rightColW, gridSize, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text('PARTS FOR THIS PLATE', rightColX + 6, gridStartY + 9);

      const plateColorsSorted = Array.from<{ color: LegoColor; count: number }>(plateColorCounts.values()).sort((a, b) => b.count - a.count);

      let pColorY = gridStartY + 17;
      const pRowH = 8.5;

      for (let i = 0; i < plateColorsSorted.length && pColorY < gridStartY + gridSize - 10; i++) {
        const { color, count } = plateColorsSorted[i];
        const pSymbol = getSymbol(color);

        // Color circle
        doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2]);
        doc.circle(rightColX + 9, pColorY + 3.5, 3.2, 'F');
        doc.setDrawColor(180, 180, 180);
        doc.circle(rightColX + 9, pColorY + 3.5, 3.2, 'S');

        // Symbol badge
        const badgeW = pSymbol.length > 1 ? 7.2 : 5.8;
        doc.setFillColor(230, 230, 230);
        doc.rect(rightColX + 15, pColorY + 0.5, badgeW, 6, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(rightColX + 15, pColorY + 0.5, badgeW, 6, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(pSymbol.length > 2 ? 6.5 : pSymbol.length > 1 ? 7 : 8);
        doc.setTextColor(17, 24, 39);
        doc.text(pSymbol, rightColX + 15 + badgeW / 2, pColorY + 3.5, { align: 'center', baseline: 'middle' });

        // Color name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(31, 41, 55);
        const textX = rightColX + 15 + badgeW + 2.5;
        const maxLen = pSymbol.length > 1 ? 11 : 13;
        const displayName = color.legoName.length > maxLen ? color.legoName.slice(0, maxLen - 1) + '…' : color.legoName;
        doc.text(displayName, textX, pColorY + 4.8);

        // Count
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(17, 24, 39);
        doc.text(`× ${count}`, rightColX + rightColW - 6, pColorY + 4.8, { align: 'right' });

        pColorY += pRowH;
      }

      // Plate page footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Plate ${plateIndex} of ${totalPlates}  •  ${projectName}`, gridStartX, 198);
    }
  }

  // ================= FINAL PAGE: ASSEMBLY DIAGRAM =================
  onProgress?.(98, 'Creating final assembly overview...');
  doc.addPage('a4', 'landscape');

  // Header
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FINAL ASSEMBLY & CONNECTING PLATES', 18, 13);

  // Assembly Grid Diagram in Center
  const diagW = 120;
  const diagH = (subPlatesY / subPlatesX) * diagW;
  const diagX = (pageWidth - diagW) / 2;
  const diagY = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('Subplate Grid Layout', pageWidth / 2, 34, { align: 'center' });

  const pW = diagW / subPlatesX;
  const pH = diagH / subPlatesY;
  let num = 1;

  for (let sy = 0; sy < subPlatesY; sy++) {
    for (let sx = 0; sx < subPlatesX; sx++) {
      const bx = diagX + sx * pW;
      const by = diagY + sy * pH;

      doc.setFillColor(243, 244, 246);
      doc.rect(bx + 1, by + 1, pW - 2, pH - 2, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.4);
      doc.rect(bx + 1, by + 1, pW - 2, pH - 2, 'S');

      // Plate number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.text(`Plate ${num}`, bx + pW / 2, by + pH / 2 + 3, { align: 'center' });
      num++;
    }
  }

  // Assembly tips at bottom
  const tipY = diagY + diagH + 16;
  doc.setFillColor(239, 246, 255);
  doc.rect(30, tipY, pageWidth - 60, 36, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.rect(30, tipY, pageWidth - 60, 36, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text('Official LEGO® Art Assembly Steps:', 36, tipY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(31, 41, 55);
  doc.text('1. Complete each 16×16 plate individually on a flat surface using the step-by-step guides.', 36, tipY + 16);
  doc.text('2. Connect the plates row by row using 4 Technic connector pins (Part #2780) between each adjacent plate.', 36, tipY + 23);
  doc.text('3. Build a 1-stud or 2-stud perimeter border with standard black bricks and plates for a polished gallery frame.', 36, tipY + 30);

  onProgress?.(100, 'Instruction manual ready!');
  return doc;
}
