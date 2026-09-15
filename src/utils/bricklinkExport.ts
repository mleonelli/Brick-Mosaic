import { DotShape, LegoColor, MosaicData, OptimizationSummary } from '../types';

export function getLegoPartNumber(shape: DotShape): { partId: string; partName: string } {
  switch (shape) {
    case 'round_tile':
      return { partId: '98138', partName: 'Tile, Round 1 x 1' };
    case 'round_plate':
      return { partId: '4073', partName: 'Plate, Round 1 x 1 Straight Side' };
    case 'square_tile':
      return { partId: '3070b', partName: 'Tile 1 x 1 with Groove' };
    case 'square_plate':
      return { partId: '3024', partName: 'Plate 1 x 1' };
    default:
      return { partId: '98138', partName: 'Tile, Round 1 x 1' };
  }
}

export function getBaseplatePart(width: number, height: number): { partId: string; partName: string; count: number; colorId: number } | null {
  // Classic single 32x32 standard baseplate
  if (width === 32 && height === 32) {
    return {
      partId: '3811',
      partName: 'Baseplate 32 x 32',
      count: 1,
      colorId: 11, // Black
    };
  }

  // LEGO® Art 16x16 modular Technic plates (#65803)
  const subPlateSize = 16;
  const plateCols = Math.max(1, Math.ceil(width / subPlateSize));
  const plateRows = Math.max(1, Math.ceil(height / subPlateSize));
  const count = plateCols * plateRows;

  return {
    partId: '65803',
    partName: `Brick, Modified 16 x 16 x 1 1/3 with Pin Holes (${plateCols}×${plateRows} baseplate grid)`,
    count,
    colorId: 11, // Black
  };
}

export function generateBrickLinkXml(
  mosaic: MosaicData,
  dotShape: DotShape,
  includeBuffer: boolean = true,
  bufferPercentage: number = 5,
  includeBaseplates: boolean = true,
  optimization?: OptimizationSummary | null
): string {
  const items: string[] = [];

  if (optimization && optimization.countsByPieceAndColor.size > 0) {
    // Multi-stud consolidated pieces export
    for (const [, pieceItem] of optimization.countsByPieceAndColor.entries()) {
      const finalQty = includeBuffer
        ? Math.ceil(pieceItem.count * (1 + bufferPercentage / 100))
        : pieceItem.count;

      items.push(`  <ITEM>
    <ITEMTYPE>P</ITEMTYPE>
    <ITEMID>${pieceItem.partId}</ITEMID>
    <COLOR>${pieceItem.color.bricklinkId}</COLOR>
    <MINQTY>${finalQty}</MINQTY>
  </ITEM>`);
    }
  } else {
    // Standard 1x1 Dots
    const { partId } = getLegoPartNumber(dotShape);
    for (const [, { color, count }] of mosaic.colorCounts.entries()) {
      const finalQty = includeBuffer
        ? Math.ceil(count * (1 + bufferPercentage / 100))
        : count;

      items.push(`  <ITEM>
    <ITEMTYPE>P</ITEMTYPE>
    <ITEMID>${partId}</ITEMID>
    <COLOR>${color.bricklinkId}</COLOR>
    <MINQTY>${finalQty}</MINQTY>
  </ITEM>`);
    }
  }

  // Baseplates
  if (includeBaseplates) {
    const baseplate = getBaseplatePart(mosaic.width, mosaic.height);
    if (baseplate) {
      items.push(`  <ITEM>
    <ITEMTYPE>P</ITEMTYPE>
    <ITEMID>${baseplate.partId}</ITEMID>
    <COLOR>${baseplate.colorId}</COLOR>
    <MINQTY>${baseplate.count}</MINQTY>
  </ITEM>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<INVENTORY>
${items.join('\n')}
</INVENTORY>`;
}

export function generateBrickLinkCsv(
  mosaic: MosaicData,
  dotShape: DotShape,
  includeBuffer: boolean = true,
  bufferPercentage: number = 5,
  optimization?: OptimizationSummary | null
): string {
  const lines: string[] = [
    'Item Type,Part ID,Part Name,BrickLink Color ID,Color Name,LEGO® Color ID,Hex,Quantity,Buffer Qty,Est Cost (USD)'
  ];

  if (optimization && optimization.countsByPieceAndColor.size > 0) {
    for (const [, pieceItem] of optimization.countsByPieceAndColor.entries()) {
      const bufferQty = includeBuffer ? Math.ceil(pieceItem.count * (1 + bufferPercentage / 100)) : pieceItem.count;
      // Estimate cost per piece by approximate size
      const [wStr, hStr] = pieceItem.studDims.split('x');
      const pieceArea = (parseInt(wStr, 10) || 1) * (parseInt(hStr, 10) || 1);
      const estUnitPrice = Math.max(0.03, pieceArea * 0.025);
      const estCost = (bufferQty * estUnitPrice).toFixed(2);
      lines.push(
        `"P","${pieceItem.partId}","${pieceItem.partName}",${pieceItem.color.bricklinkId},"${pieceItem.color.bricklinkName}",${pieceItem.color.legoId},"${pieceItem.color.hex}",${pieceItem.count},${bufferQty},$${estCost}`
      );
    }
  } else {
    const { partId, partName } = getLegoPartNumber(dotShape);
    for (const [, { color, count }] of mosaic.colorCounts.entries()) {
      const bufferQty = includeBuffer ? Math.ceil(count * (1 + bufferPercentage / 100)) : count;
      const estCost = (bufferQty * 0.035).toFixed(2);
      lines.push(
        `"P","${partId}","${partName}",${color.bricklinkId},"${color.bricklinkName}",${color.legoId},"${color.hex}",${count},${bufferQty},$${estCost}`
      );
    }
  }

  const baseplate = getBaseplatePart(mosaic.width, mosaic.height);
  if (baseplate) {
    const estPlateCost = (baseplate.count * 3.50).toFixed(2);
    lines.push(
      `"P","${baseplate.partId}","${baseplate.partName}",${baseplate.colorId},"Black",26,"#1B2A34",${baseplate.count},${baseplate.count},$${estPlateCost}`
    );
  }

  return lines.join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
