import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Hash, Grid, Sparkles } from 'lucide-react';
import { DotShape, LegoColor, MosaicData, MosaicSettings } from '../types';

interface MosaicCanvasProps {
  mosaic: MosaicData | null;
  settings: MosaicSettings;
  highlightedColorId: string | null;
  onHighlightColor: (colorId: string | null) => void;
  onSelectColorFromPixel?: (color: LegoColor) => void;
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({
  mosaic,
  settings,
  highlightedColorId,
  onHighlightColor,
  onSelectColorFromPixel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; color: LegoColor; plateNum: number } | null>(null);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset view when mosaic changes
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [mosaic?.width, mosaic?.height]);

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
  }, [mosaic, settings, highlightedColorId]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle canvas mouse move for hover inspection
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

    const px = Math.floor(clientX * scaleX);
    const py = Math.floor(clientY * scaleY);

    if (px >= 0 && px < mosaic.width && py >= 0 && py < mosaic.height) {
      const color = mosaic.pixels[py][px];
      const subSize = 16;
      const subPlatesX = Math.ceil(mosaic.width / subSize);
      const plateX = Math.floor(px / subSize);
      const plateY = Math.floor(py / subSize);
      const plateNum = plateY * subPlatesX + plateX + 1;

      setHoverPixel({ x: px, y: py, color, plateNum });
    } else {
      setHoverPixel(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.altKey) {
      // Alt + Click to pan
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = () => {
    if (hoverPixel) {
      if (onSelectColorFromPixel) {
        onSelectColorFromPixel(hoverPixel.color);
      }
      // Toggle highlight of clicked color
      if (highlightedColorId === hoverPixel.color.id) {
        onHighlightColor(null);
      } else {
        onHighlightColor(hoverPixel.color.id);
      }
    }
  };

  if (!mosaic) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl min-h-[440px] text-center text-slate-400 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
          <Grid className="w-8 h-8 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No Mosaic Generated Yet</p>
        <p className="text-xs text-slate-400 max-w-sm">
          Select or upload a picture from the left panel to begin creating your Lego 1×1 dot mosaic.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Canvas Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">Interactive Canvas</span>
          <span className="text-slate-400">
            ({mosaic.width}×{mosaic.height} studs)
          </span>
          {highlightedColorId && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Highlighting color
              <button
                onClick={() => onHighlightColor(null)}
                className="ml-1 hover:text-white"
                title="Clear highlight"
              >
                ×
              </button>
            </span>
          )}
        </div>

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
            className="block"
          />
        </div>

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
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>💡 Click any stud to highlight all matching pieces</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Alt + Drag to pan</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Dimensions: {(mosaic.width * 0.8).toFixed(1)}cm × {(mosaic.height * 0.8).toFixed(1)}cm</span>
        </div>
      </div>
    </div>
  );
};
