import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid, Sparkles, Box, Palette, Undo2, Layers, X, HelpCircle } from 'lucide-react';
import { DotShape, LegoColor, MosaicData, MosaicSettings, OptimizationSummary, PlacedPiece, SelectedPieceInfo } from '../types';
import { ColorPickerModal } from './ColorPickerModal';

interface MosaicCanvasProps {
  mosaic: MosaicData | null;
  settings: MosaicSettings;
  highlightedColorId: string | null;
  onHighlightColor: (colorId: string | null) => void;
  onSelectColorFromPixel?: (color: LegoColor) => void;
  optimization?: OptimizationSummary | null;
  onUpdatePiecesColor?: (pieces: SelectedPieceInfo[], newColor: LegoColor) => void;
  onUpdateAllColorPieces?: (targetColorId: string, newColor: LegoColor) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onOpenGuide?: () => void;
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({
  mosaic,
  settings,
  highlightedColorId,
  onHighlightColor,
  onSelectColorFromPixel,
  optimization,
  onUpdatePiecesColor,
  onUpdateAllColorPieces,
  onUndo,
  canUndo = false,
  onOpenGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'pieces' | 'dots'>('pieces');
  const [hoverPixel, setHoverPixel] = useState<{
    x: number;
    y: number;
    color: LegoColor;
    plateNum: number;
    piece: PlacedPiece | null;
  } | null>(null);

  // Selection & Color Editing state
  const [selectedPieces, setSelectedPieces] = useState<Map<string, SelectedPieceInfo>>(new Map());
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<'selected_pieces' | 'highlighted_color'>('selected_pieces');

  // Drag Marquee Box Selection state
  const [marqueeBox, setMarqueeBox] = useState<{
    startPx: number;
    startPy: number;
    currentPx: number;
    currentPy: number;
  } | null>(null);
  const mouseDownPosRef = useRef<{ clientX: number; clientY: number; px: number; py: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset view and selection when mosaic dimensions change
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedPieces(new Map());
  }, [mosaic?.width, mosaic?.height]);

  // Keyboard shortcut to clear selection (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPieces(new Map());
        setMarqueeBox(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showOptimizedPieces = settings.enableOptimization && !!optimization && viewMode === 'pieces';

  // Highlighted color details
  const highlightedColorObj = useMemo(() => {
    if (!highlightedColorId || !mosaic) return null;
    return mosaic.uniqueColors.find((c) => c.id === highlightedColorId) || null;
  }, [highlightedColorId, mosaic]);

  const highlightedColorCount = useMemo(() => {
    if (!highlightedColorId || !mosaic) return 0;
    return mosaic.colorCounts.get(highlightedColorId)?.count || 0;
  }, [highlightedColorId, mosaic]);

  // Single piece selection helper
  const singleSelectedPiece = useMemo(() => {
    if (selectedPieces.size === 1) {
      return Array.from(selectedPieces.values())[0];
    }
    return null;
  }, [selectedPieces]);

  // Total studs across all selected pieces
  const totalSelectedStuds = useMemo(() => {
    let sum = 0;
    for (const p of selectedPieces.values()) {
      sum += p.width * p.height;
    }
    return sum;
  }, [selectedPieces]);

  // Quick palette swatches from currently active mosaic colors
  const quickPaletteSwatches = useMemo(() => {
    if (!mosaic) return [];
    return mosaic.uniqueColors.slice(0, 8);
  }, [mosaic]);

  // Main draw loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mosaic) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, pixels } = mosaic;
    const { dotShape, showGrid, showSubplates, showSymbols } = settings;

    // Determine stud size in pixels based on base width
    // Base rendering size around 800px max
    const baseCanvasWidth = 768;
    const dotSize = Math.max(8, Math.floor(baseCanvasWidth / width));
    const fullW = width * dotSize;
    const fullH = height * dotSize;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = fullW * dpr;
    canvas.height = fullH * dpr;
    canvas.style.width = `${fullW}px`;
    canvas.style.height = `${fullH}px`;

    ctx.scale(dpr, dpr);

    // 1. Draw Lego Baseplate Background (dark charcoal/black with subtle textured stud sockets)
    ctx.fillStyle = '#11141A';
    ctx.fillRect(0, 0, fullW, fullH);

    if (showOptimizedPieces && optimization) {
      // ================= MULTI-STUD CONSOLIDATED PIECES RENDERING =================
      const pad = Math.max(0.6, dotSize * 0.04);

      for (const piece of optimization.pieces) {
        const px = piece.x * dotSize;
        const py = piece.y * dotSize;
        const pw = piece.width * dotSize;
        const ph = piece.height * dotSize;
        const color = piece.color;

        const isHighlighted = highlightedColorId === null || color.id === highlightedColorId;
        ctx.globalAlpha = isHighlighted ? 1 : 0.18;

        const innerX = px + pad;
        const innerY = py + pad;
        const innerW = pw - pad * 2;
        const innerH = ph - pad * 2;

        // Drop shadow under piece edge
        ctx.fillStyle = '#06080c';
        ctx.fillRect(innerX + 0.6, innerY + 0.8, innerW, innerH);

        // Piece solid body
        ctx.fillStyle = color.hex;
        ctx.fillRect(innerX, innerY, innerW, innerH);

        if (piece.family === 'tile') {
          // ----- SMOOTH TILE (No studs, polished surface & clean bevel) -----
          // Top-Left Bevel Highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
          ctx.lineWidth = Math.max(0.8, dotSize * 0.08);
          ctx.beginPath();
          ctx.moveTo(innerX, innerY + innerH);
          ctx.lineTo(innerX, innerY);
          ctx.lineTo(innerX + innerW, innerY);
          ctx.stroke();

          // Bottom-Right Bevel Shadow
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.42)';
          ctx.lineWidth = Math.max(0.8, dotSize * 0.08);
          ctx.beginPath();
          ctx.moveTo(innerX + innerW, innerY);
          ctx.lineTo(innerX + innerW, innerY + innerH);
          ctx.lineTo(innerX, innerY + innerH);
          ctx.stroke();

          // Central sheen gloss
          const glossGrad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
          glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
          glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
          ctx.fillStyle = glossGrad;
          ctx.fillRect(innerX + 1, innerY + 1, innerW - 2, innerH - 2);

          // Dimension indicator for multi-stud tiles or when symbols are active
          if ((piece.area > 1 || showSymbols) && dotSize >= 10) {
            const label = showSymbols ? color.symbol : (piece.area > 1 ? piece.studDims : '');
            if (label) {
              const fontSize = Math.max(8, Math.min(piece.width, piece.height) * dotSize * 0.28);
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = color.textColor;
              ctx.globalAlpha = isHighlighted ? (showSymbols ? 0.85 : 0.65) : 0.15;
              ctx.fillText(label, innerX + innerW / 2, innerY + innerH / 2);
            }
          }
        } else {
          // ----- STUDDED PLATE (With authentic raised studs on each coordinate) -----
          // Plate Outer Perimeter Bevel
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
          ctx.lineWidth = Math.max(0.8, dotSize * 0.07);
          ctx.beginPath();
          ctx.moveTo(innerX, innerY + innerH);
          ctx.lineTo(innerX, innerY);
          ctx.lineTo(innerX + innerW, innerY);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.38)';
          ctx.lineWidth = Math.max(0.8, dotSize * 0.07);
          ctx.beginPath();
          ctx.moveTo(innerX + innerW, innerY);
          ctx.lineTo(innerX + innerW, innerY + innerH);
          ctx.lineTo(innerX, innerY + innerH);
          ctx.stroke();

          // Raised studs for each 1x1 position in the plate
          const studRadius = dotSize * 0.24;
          for (let dy = 0; dy < piece.height; dy++) {
            for (let dx = 0; dx < piece.width; dx++) {
              const cx = (piece.x + dx) * dotSize + dotSize / 2;
              const cy = (piece.y + dy) * dotSize + dotSize / 2;

              // Stud body
              ctx.beginPath();
              ctx.arc(cx, cy, studRadius, 0, Math.PI * 2);
              ctx.fillStyle = color.hex;
              ctx.fill();

              // Stud rim outline
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
              ctx.lineWidth = Math.max(0.5, dotSize * 0.04);
              ctx.stroke();

              // Stud top highlight arc
              ctx.beginPath();
              ctx.arc(cx, cy, studRadius - 0.4, Math.PI * 0.75, Math.PI * 1.75);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.lineWidth = Math.max(0.6, dotSize * 0.07);
              ctx.stroke();

              // Stud bottom shadow arc
              ctx.beginPath();
              ctx.arc(cx, cy, studRadius - 0.4, -Math.PI * 0.25, Math.PI * 0.75);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
              ctx.lineWidth = Math.max(0.6, dotSize * 0.07);
              ctx.stroke();

              // Symbols if enabled
              if (showSymbols && dotSize >= 12) {
                const fontSize = Math.max(7, Math.floor(dotSize * 0.3));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = color.textColor;
                ctx.globalAlpha = isHighlighted ? 0.9 : 0.2;
                ctx.fillText(color.symbol, cx, cy);
                ctx.globalAlpha = isHighlighted ? 1 : 0.18;
              }
            }
          }

          // Subtle piece boundary indicator for plates larger than 1x1
          if (piece.area > 1 && dotSize >= 12 && !showSymbols) {
            const fontSize = Math.max(8, Math.min(piece.width, piece.height) * dotSize * 0.22);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color.textColor;
            ctx.globalAlpha = isHighlighted ? 0.45 : 0.1;
            ctx.fillText(piece.studDims, innerX + innerW / 2, innerY + innerH / 2);
          }
        }

        // Highlight ring if currently active color
        if (highlightedColorId === color.id) {
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 2;
          ctx.strokeRect(innerX - 1, innerY - 1, innerW + 2, innerH + 2);
        }
      }
    } else {
      const radius = dotSize * 0.45;
      const innerStudRadius = dotSize * 0.22;

      // 2. Draw each 1x1 dot
      for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pixels[y][x];
        const cx = x * dotSize + dotSize / 2;
        const cy = y * dotSize + dotSize / 2;

        const isHighlighted = highlightedColorId === null || color.id === highlightedColorId;
        const opacity = isHighlighted ? 1 : 0.18;

        ctx.globalAlpha = opacity;

        if (dotShape === 'round_tile') {
          // ================= 1x1 Round Tile (Lego Art Style 98138) =================
          // Drop shadow under the tile
          ctx.beginPath();
          ctx.arc(cx + 0.6, cy + 0.8, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#05070a';
          ctx.fill();

          // Main body color
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = color.hex;
          ctx.fill();

          // Smooth bevel highlight on top-left edge
          ctx.beginPath();
          ctx.arc(cx, cy, radius - 0.4, Math.PI * 0.8, Math.PI * 1.8);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = Math.max(0.7, dotSize * 0.08);
          ctx.stroke();

          // Smooth shadow on bottom-right edge
          ctx.beginPath();
          ctx.arc(cx, cy, radius - 0.4, -Math.PI * 0.2, Math.PI * 0.8);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = Math.max(0.7, dotSize * 0.08);
          ctx.stroke();

        } else if (dotShape === 'round_plate') {
          // ================= 1x1 Round Plate with Stud (4073) =================
          // Base circle
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = color.hex;
          ctx.fill();

          // Rim shadow
          ctx.beginPath();
          ctx.arc(cx, cy, radius - 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Raised Center Stud
          ctx.beginPath();
          ctx.arc(cx, cy, innerStudRadius, 0, Math.PI * 2);
          ctx.fillStyle = color.hex;
          ctx.fill();

          // Stud top highlight
          ctx.beginPath();
          ctx.arc(cx - 0.3, cy - 0.3, innerStudRadius - 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Tiny stud shadow
          ctx.beginPath();
          ctx.arc(cx + 0.4, cy + 0.5, innerStudRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.lineWidth = 0.6;
          ctx.stroke();

        } else if (dotShape === 'square_tile') {
          // ================= 1x1 Square Tile (3070b) =================
          const pad = dotSize * 0.06;
          const tileSize = dotSize - pad * 2;
          const tx = x * dotSize + pad;
          const ty = y * dotSize + pad;

          ctx.fillStyle = color.hex;
          ctx.fillRect(tx, ty, tileSize, tileSize);

          // Bevels
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(tx, ty + tileSize);
          ctx.lineTo(tx, ty);
          ctx.lineTo(tx + tileSize, ty);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.moveTo(tx + tileSize, ty);
          ctx.lineTo(tx + tileSize, ty + tileSize);
          ctx.lineTo(tx, ty + tileSize);
          ctx.stroke();

        } else {
          // ================= 1x1 Square Plate (3024) =================
          const pad = dotSize * 0.06;
          const tileSize = dotSize - pad * 2;
          const tx = x * dotSize + pad;
          const ty = y * dotSize + pad;

          ctx.fillStyle = color.hex;
          ctx.fillRect(tx, ty, tileSize, tileSize);

          // Center stud
          ctx.beginPath();
          ctx.arc(cx, cy, innerStudRadius, 0, Math.PI * 2);
          ctx.fillStyle = color.hex;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // 3. Optional Symbols / Numbers printed on dots (builder mode)
        if (showSymbols && dotSize >= 12 && isHighlighted) {
          ctx.font = `bold ${Math.max(8, Math.floor(dotSize * 0.45))}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = color.textColor;
          ctx.fillText(color.symbol, cx, cy + 0.5);
        }

        // Highlight ring if currently active color
        if (highlightedColorId === color.id) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#FACC15'; // Amber gold
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  }

    ctx.globalAlpha = 1;

    // 4. Draw optional fine 1x1 stud grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x++) {
        ctx.moveTo(x * dotSize, 0);
        ctx.lineTo(x * dotSize, fullH);
      }
      for (let y = 0; y <= height; y++) {
        ctx.moveTo(0, y * dotSize);
        ctx.lineTo(fullW, y * dotSize);
      }
      ctx.stroke();
    }

    // ================= DRAW SELECTED PIECES OVERLAYS =================
    if (selectedPieces.size > 0) {
      ctx.save();
      for (const sp of selectedPieces.values()) {
        const spx = sp.x * dotSize;
        const spy = sp.y * dotSize;
        const spw = sp.width * dotSize;
        const sph = sp.height * dotSize;

        if (showOptimizedPieces && optimization) {
          const pad = Math.max(0.6, dotSize * 0.04);
          const innerX = spx + pad;
          const innerY = spy + pad;
          const innerW = spw - pad * 2;
          const innerH = sph - pad * 2;

          // Glowing cyan border
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = Math.max(2, dotSize * 0.12);
          ctx.strokeRect(innerX - 0.5, innerY - 0.5, innerW + 1, innerH + 1);

          // Translucent fill
          ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.fillRect(innerX, innerY, innerW, innerH);

          // High-precision corner brackets
          const cornerLen = Math.max(3, Math.min(innerW, innerH) * 0.25);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(1.5, dotSize * 0.09);
          // Top-left
          ctx.beginPath();
          ctx.moveTo(innerX - 0.5, innerY - 0.5 + cornerLen);
          ctx.lineTo(innerX - 0.5, innerY - 0.5);
          ctx.lineTo(innerX - 0.5 + cornerLen, innerY - 0.5);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(innerX + innerW + 0.5 - cornerLen, innerY - 0.5);
          ctx.lineTo(innerX + innerW + 0.5, innerY - 0.5);
          ctx.lineTo(innerX + innerW + 0.5, innerY - 0.5 + cornerLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(innerX - 0.5, innerY + innerH + 0.5 - cornerLen);
          ctx.lineTo(innerX - 0.5, innerY + innerH + 0.5);
          ctx.lineTo(innerX - 0.5 + cornerLen, innerY + innerH + 0.5);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(innerX + innerW + 0.5 - cornerLen, innerY + innerH + 0.5);
          ctx.lineTo(innerX + innerW + 0.5, innerY + innerH + 0.5);
          ctx.lineTo(innerX + innerW + 0.5, innerY + innerH + 0.5 - cornerLen);
          ctx.stroke();
        } else {
          // 1x1 Dots mode
          const cx = spx + dotSize / 2;
          const cy = spy + dotSize / 2;
          const rad = dotSize * 0.46;

          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 6;
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = Math.max(2, dotSize * 0.14);

          if (settings.dotShape === 'round_tile' || settings.dotShape === 'round_plate') {
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
            ctx.fill();
          } else {
            ctx.strokeRect(spx + 0.5, spy + 0.5, dotSize - 1, dotSize - 1);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
            ctx.fillRect(spx + 0.5, spy + 0.5, dotSize - 1, dotSize - 1);
          }
        }
      }
      ctx.restore();
    }

    // ================= DRAW MARQUEE SELECTION BOX =================
    if (marqueeBox) {
      const minPx = Math.min(marqueeBox.startPx, marqueeBox.currentPx);
      const maxPx = Math.max(marqueeBox.startPx, marqueeBox.currentPx);
      const minPy = Math.min(marqueeBox.startPy, marqueeBox.currentPy);
      const maxPy = Math.max(marqueeBox.startPy, marqueeBox.currentPy);

      const mx = minPx * dotSize;
      const my = minPy * dotSize;
      const mw = (maxPx - minPx + 1) * dotSize;
      const mh = (maxPy - minPy + 1) * dotSize;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.16)';
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(mx, my, mw, mh);
      ctx.restore();
    }

    // 5. Draw 16x16 Sub-Plate Boundaries (like official Lego Art manuals!)
    if (showSubplates) {
      const subSize = 16;
      ctx.strokeStyle = '#F59E0B'; // Bright Amber
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = subSize; x < width; x += subSize) {
        ctx.moveTo(x * dotSize, 0);
        ctx.lineTo(x * dotSize, fullH);
      }
      for (let y = subSize; y < height; y += subSize) {
        ctx.moveTo(0, y * dotSize);
        ctx.lineTo(fullW, y * dotSize);
      }
      ctx.stroke();

      // Outer border frame
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, fullW, fullH);
    }
  }, [mosaic, settings, highlightedColorId, showOptimizedPieces, optimization, selectedPieces, marqueeBox]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle canvas mouse move for hover inspection and marquee dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!mosaic || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = mosaic.width / rect.width;
    const scaleY = mosaic.height / rect.height;

    const px = Math.min(mosaic.width - 1, Math.max(0, Math.floor(clientX * scaleX)));
    const py = Math.min(mosaic.height - 1, Math.max(0, Math.floor(clientY * scaleY)));

    const color = mosaic.pixels[py][px];
    const subSize = 16;
    const subPlatesX = Math.ceil(mosaic.width / subSize);
    const plateX = Math.floor(px / subSize);
    const plateY = Math.floor(py / subSize);
    const plateNum = plateY * subPlatesX + plateX + 1;
    const piece = (showOptimizedPieces && optimization) ? optimization.pieceGrid[py]?.[px] || null : null;

    setHoverPixel({ x: px, y: py, color, plateNum, piece });

    // Handle marquee box drag
    if (mouseDownPosRef.current) {
      const dist = Math.hypot(
        e.clientX - mouseDownPosRef.current.clientX,
        e.clientY - mouseDownPosRef.current.clientY
      );
      if (dist > 5) {
        hasDraggedRef.current = true;
        setMarqueeBox({
          startPx: mouseDownPosRef.current.px,
          startPy: mouseDownPosRef.current.py,
          currentPx: px,
          currentPy: py,
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Alt + Click or Middle Click to pan
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
      return;
    }

    if (e.button === 0 && hoverPixel) {
      mouseDownPosRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        px: hoverPixel.x,
        py: hoverPixel.y,
      };
      hasDraggedRef.current = false;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (hasDraggedRef.current && marqueeBox && mosaic) {
      // Finalize marquee box selection
      const minX = Math.min(marqueeBox.startPx, marqueeBox.currentPx);
      const maxX = Math.max(marqueeBox.startPx, marqueeBox.currentPx);
      const minY = Math.min(marqueeBox.startPy, marqueeBox.currentPy);
      const maxY = Math.max(marqueeBox.startPy, marqueeBox.currentPy);

      const newlySelected = new Map<string, SelectedPieceInfo>();

      if (showOptimizedPieces && optimization) {
        for (const p of optimization.pieces) {
          const pRight = p.x + p.width - 1;
          const pBottom = p.y + p.height - 1;
          if (p.x <= maxX && pRight >= minX && p.y <= maxY && pBottom >= minY) {
            newlySelected.set(p.id, {
              id: p.id,
              x: p.x,
              y: p.y,
              width: p.width,
              height: p.height,
              color: p.color,
              studDims: p.studDims,
              partName: p.partName,
              partId: p.partId,
            });
          }
        }
      } else {
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const c = mosaic.pixels[y][x];
            const id = `dot_${x}_${y}`;
            newlySelected.set(id, {
              id,
              x,
              y,
              width: 1,
              height: 1,
              color: c,
              studDims: '1x1',
              partName: settings.dotShape === 'round_tile' ? '1x1 Round Tile' : '1x1 Round Plate',
            });
          }
        }
      }

      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        setSelectedPieces((prev) => {
          const merged = new Map(prev);
          newlySelected.forEach((val, key) => merged.set(key, val));
          return merged;
        });
      } else {
        setSelectedPieces(newlySelected);
      }

      setMarqueeBox(null);
      hasDraggedRef.current = false;
      mouseDownPosRef.current = null;
      return;
    }

    mouseDownPosRef.current = null;
    hasDraggedRef.current = false;
    setMarqueeBox(null);
  };

  // Canvas click handler for single-piece or Shift multi-select
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (!hoverPixel || !mosaic) return;
    const { x: px, y: py, color, piece } = hoverPixel;

    let targetPiece: SelectedPieceInfo;
    if (showOptimizedPieces && optimization && piece) {
      targetPiece = {
        id: piece.id,
        x: piece.x,
        y: piece.y,
        width: piece.width,
        height: piece.height,
        color: piece.color,
        studDims: piece.studDims,
        partName: piece.partName,
        partId: piece.partId,
      };
    } else {
      targetPiece = {
        id: `dot_${px}_${py}`,
        x: px,
        y: py,
        width: 1,
        height: 1,
        color,
        studDims: '1x1',
        partName: settings.dotShape === 'round_tile' ? '1x1 Round Tile' : '1x1 Round Plate',
      };
    }

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Multi-select toggle: Add or remove from current selection
      setSelectedPieces((prev) => {
        const next = new Map(prev);
        if (next.has(targetPiece.id)) {
          next.delete(targetPiece.id);
        } else {
          next.set(targetPiece.id, targetPiece);
        }
        return next;
      });
    } else {
      // Single piece selection: select ONLY that piece
      setSelectedPieces(new Map([[targetPiece.id, targetPiece]]));
    }

    if (onSelectColorFromPixel) {
      onSelectColorFromPixel(targetPiece.color);
    }
  };

  // Double click opens color picker on selected piece
  const handleDoubleClick = () => {
    if (selectedPieces.size > 0) {
      setColorPickerTarget('selected_pieces');
      setIsColorPickerOpen(true);
    }
  };

  // Apply color to all currently selected piece(s)
  const handleApplyColorToSelected = (newColor: LegoColor) => {
    if (!mosaic || selectedPieces.size === 0) return;
    const piecesArray = Array.from(selectedPieces.values());
    if (onUpdatePiecesColor) {
      onUpdatePiecesColor(piecesArray, newColor);
    }
    // Update local state color of selected pieces
    setSelectedPieces((prev) => {
      const updated = new Map<string, SelectedPieceInfo>();
      for (const [key, p] of prev.entries()) {
        updated.set(key, { ...p, color: newColor });
      }
      return updated;
    });
  };

  // Apply color to all highlighted pieces (by highlightedColorId)
  const handleApplyColorToHighlighted = (newColor: LegoColor) => {
    if (!highlightedColorId) return;
    if (onUpdateAllColorPieces) {
      onUpdateAllColorPieces(highlightedColorId, newColor);
    }
    onHighlightColor(newColor.id);
  };

  // Select all pieces across the mosaic that share the current piece's color
  const handleSelectAllOfSameColor = () => {
    if (!singleSelectedPiece || !mosaic) return;
    const targetColorId = singleSelectedPiece.color.id;
    const matched = new Map<string, SelectedPieceInfo>();

    if (showOptimizedPieces && optimization) {
      for (const p of optimization.pieces) {
        if (p.color.id === targetColorId) {
          matched.set(p.id, {
            id: p.id,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            color: p.color,
            studDims: p.studDims,
            partName: p.partName,
            partId: p.partId,
          });
        }
      }
    } else {
      for (let y = 0; y < mosaic.height; y++) {
        for (let x = 0; x < mosaic.width; x++) {
          const c = mosaic.pixels[y][x];
          if (c.id === targetColorId) {
            const id = `dot_${x}_${y}`;
            matched.set(id, {
              id,
              x,
              y,
              width: 1,
              height: 1,
              color: c,
              studDims: '1x1',
              partName: settings.dotShape === 'round_tile' ? '1x1 Round Tile' : '1x1 Round Plate',
            });
          }
        }
      }
    }

    setSelectedPieces(matched);
  };

  if (!mosaic) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl min-h-[440px] text-center text-slate-400 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
          <Grid className="w-8 h-8 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No Mosaic Generated Yet</p>
        <p className="text-xs text-slate-400 max-w-sm">
          Select or upload a picture from the left panel to begin creating your LEGO® 1×1 dot mosaic.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Canvas Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-200">Interactive Canvas</span>
          <span className="text-slate-400 font-mono">
            ({mosaic.width}×{mosaic.height} studs)
          </span>

          {/* Highlighted Color Action Pill */}
          {highlightedColorId && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full pl-2.5 pr-1 py-0.5">
              <span className="text-amber-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  Highlight: <strong className="text-amber-200">{highlightedColorObj?.legoName || 'Color'}</strong> ({highlightedColorCount} pcs)
                </span>
              </span>
              <button
                id="change-highlighted-color-toolbar-btn"
                onClick={() => {
                  setColorPickerTarget('highlighted_color');
                  setIsColorPickerOpen(true);
                }}
                className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 transition shadow-sm"
                title="Change color of all highlighted pieces via full LEGO® color picker"
              >
                <Palette className="w-3 h-3" />
                <span>Change Color...</span>
              </button>
              <button
                onClick={() => onHighlightColor(null)}
                className="w-5 h-5 rounded-full hover:bg-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center font-bold text-xs transition"
                title="Clear highlight"
              >
                ×
              </button>
            </div>
          )}

          {/* Undo Button */}
          {onUndo && (
            <button
              id="canvas-undo-btn"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                canUndo
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white shadow-sm'
                  : 'opacity-40 text-slate-500 border-slate-800/80 cursor-not-allowed'
              }`}
              title="Undo last color change (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pieces vs Studs View Mode Switcher */}
          {settings.enableOptimization && optimization && (
            <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/70 text-[11px]">
              <button
                id="view-mode-pieces-btn"
                onClick={() => setViewMode('pieces')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  viewMode === 'pieces'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Show consolidated multi-stud LEGO® parts layout"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Pieces ({optimization.totalPieces})</span>
              </button>
              <button
                id="view-mode-dots-btn"
                onClick={() => setViewMode('dots')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  viewMode === 'dots'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Show raw 1×1 stud dots grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>1×1 Studs ({mosaic.totalDots})</span>
              </button>
            </div>
          )}

          {/* Quick Zoom & Reset */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            <button
              id="zoom-out-btn"
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              id="zoom-in-btn"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="zoom-reset-btn"
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[440px] max-h-[640px] bg-slate-950 flex items-center justify-center p-6 overflow-hidden cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoverPixel(null);
          setIsPanning(false);
        }}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-sm border-4 border-slate-800"
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            onDoubleClick={handleDoubleClick}
            className="block"
          />
        </div>

        {/* Floating Piece Selection & Color Editing Dock */}
        {selectedPieces.size > 0 && (
          <div
            id="piece-selection-dock"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[95%] sm:max-w-none"
          >
            {/* Selection info */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-white flex items-center gap-1.5">
                  {selectedPieces.size === 1 ? (
                    <>
                      <span>1 Piece Selected</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        ({singleSelectedPiece?.studDims} {singleSelectedPiece?.partName || 'Piece'})
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{selectedPieces.size} Pieces Selected</span>
                      <span className="text-cyan-300 font-mono">({totalSelectedStuds} studs)</span>
                    </>
                  )}
                </span>
                {singleSelectedPiece && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    Current:{' '}
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: singleSelectedPiece.color.hex }}
                    />{' '}
                    <span className="text-slate-200 font-medium">{singleSelectedPiece.color.legoName}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Swatches from active mosaic palette */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 hidden sm:inline">
                Quick:
              </span>
              {quickPaletteSwatches.map((qc) => (
                <button
                  key={qc.id}
                  onClick={() => handleApplyColorToSelected(qc)}
                  className="w-6 h-6 rounded-full border border-white/25 hover:scale-115 hover:border-amber-400 transition shadow-sm relative group flex items-center justify-center text-[8px] font-bold"
                  style={{ backgroundColor: qc.hex, color: qc.textColor }}
                  title={`Apply ${qc.legoName} (#${qc.bricklinkId})`}
                >
                  <span className="opacity-0 group-hover:opacity-100">✓</span>
                </button>
              ))}
            </div>

            {/* Full Color Palette button */}
            <button
              id="open-piece-color-picker-btn"
              onClick={() => {
                setColorPickerTarget('selected_pieces');
                setIsColorPickerOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 transition active:scale-95"
              title="Open full official LEGO® color picker list"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Full Color Palette...</span>
            </button>

            {/* Select All of this Color button */}
            {singleSelectedPiece && (
              <button
                id="select-all-same-color-btn"
                onClick={handleSelectAllOfSameColor}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1 transition"
                title={`Select all pieces with color ${singleSelectedPiece.color.legoName} across mosaic`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Select All</span> {singleSelectedPiece.color.legoName}
              </button>
            )}

            {/* Deselect button */}
            <button
              id="clear-piece-selection-btn"
              onClick={() => setSelectedPieces(new Map())}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="Deselect pieces (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hover Inspector Tooltip Overlay */}
        {hoverPixel && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs pointer-events-none z-10 animate-fade-in">
            {/* Swatch */}
            <div
              className="w-7 h-7 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center text-[10px] font-bold"
              style={{
                backgroundColor: hoverPixel.color.hex,
                color: hoverPixel.color.textColor,
              }}
            >
              {hoverPixel.color.symbol}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{hoverPixel.color.legoName}</span>
                <span className="text-[10px] text-slate-400">
                  BL ID: {hoverPixel.color.bricklinkId} ({hoverPixel.color.bricklinkName})
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-amber-400">
                  X:{hoverPixel.x + 1}, Y:{hoverPixel.y + 1}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-300 font-medium">Plate {hoverPixel.plateNum}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-slate-400">{hoverPixel.color.hex}</span>
              </div>
              {hoverPixel.piece && (
                <div className="mt-1 pt-1 border-t border-slate-700/60 flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    {hoverPixel.piece.family.toUpperCase()} {hoverPixel.piece.studDims}
                  </span>
                  <span className="text-slate-300 font-mono">Part #{hoverPixel.piece.partId}</span>
                  <span className="text-slate-400">({hoverPixel.piece.area} {hoverPixel.piece.area === 1 ? 'stud' : 'studs'})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-300 font-medium">💡 Click piece to select • Shift+Click or Drag to multi-select • Double-click for full color picker</span>
          {onOpenGuide && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <button
                id="canvas-guide-link-btn"
                onClick={onOpenGuide}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline inline-flex items-center gap-1"
                title="Open comprehensive how-to guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How-To Guide</span>
              </button>
            </>
          )}
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Alt+Drag to pan</span>
          {showOptimizedPieces && optimization && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-amber-400 font-medium">
                Consolidated: {optimization.totalPieces} parts ({optimization.reductionPercent}% fewer parts than 1×1)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Dimensions: {(mosaic.width * 0.8).toFixed(1)}cm × {(mosaic.height * 0.8).toFixed(1)}cm</span>
        </div>
      </div>

      {/* Full LEGO® Official Color Picker Modal */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onSelectColor={(chosenColor) => {
          if (colorPickerTarget === 'selected_pieces') {
            handleApplyColorToSelected(chosenColor);
          } else {
            handleApplyColorToHighlighted(chosenColor);
          }
        }}
        targetDescription={
          colorPickerTarget === 'selected_pieces'
            ? selectedPieces.size === 1
              ? `1 piece (${singleSelectedPiece?.studDims} ${singleSelectedPiece?.partName || 'Piece'})`
              : `${selectedPieces.size} selected pieces (${totalSelectedStuds} studs)`
            : `all ${highlightedColorCount} ${highlightedColorObj?.legoName || ''} pieces`
        }
        currentColor={
          colorPickerTarget === 'selected_pieces'
            ? singleSelectedPiece?.color
            : highlightedColorObj
        }
        mosaicColors={mosaic?.uniqueColors}
        colorCounts={mosaic?.colorCounts}
      />
    </div>
  );
};
