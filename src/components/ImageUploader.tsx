import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, FolderUp } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../data/sampleImages';

interface ImageUploaderProps {
  onImageSelect: (imageElement: HTMLImageElement, name: string) => void;
  currentImageName?: string;
  onOpenProjectModal?: (tab: 'export' | 'import') => void;
  onImportFile?: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  currentImageName,
  onOpenProjectModal,
  onImportFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Check if user uploaded a saved .brickmosaic, .legomosaic, or .json project file
    if (
      file.name.endsWith('.brickmosaic') ||
      file.name.endsWith('.legomosaic') ||
      file.name.endsWith('.json') ||
      file.type === 'application/json'
    ) {
      if (onImportFile) {
        onImportFile(file);
        return;
      }
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP) or a .brickmosaic project file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageSelect(img, file.name.replace(/\.[^/.]+$/, ''));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: SampleImage) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      onImageSelect(img, sample.name);
    };
    img.src = sample.thumbnailUrl;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            Choose Picture
          </h3>
          {currentImageName && (
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium truncate max-w-[180px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{currentImageName}</span>
            </span>
          )}
        </div>

        {onOpenProjectModal && (
          <button
            id="open-project-import-btn"
            type="button"
            onClick={() => onOpenProjectModal('import')}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold transition"
            title="Import an existing .brickmosaic file to continue editing"
          >
            <FolderUp className="w-3.5 h-3.5" />
            <span>Load Saved Project</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Box */}
      <div
        id="image-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          id="image-file-input"
          type="file"
          accept="image/*,.brickmosaic,.legomosaic,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-amber-400 transition-all">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Click to upload photo or drag & drop here
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PNG, JPG, WEBP • or drop a <span className="text-amber-400 font-mono">.brickmosaic</span> project file
            </p>
          </div>
        </div>
      </div>

      {/* Instant Sample Masterpieces */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Or try a sample artwork
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-btn-${sample.id}`}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="group flex flex-col items-center p-1.5 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-950/40 hover:bg-slate-800/60 transition text-center"
              title={sample.name}
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-700/60 group-hover:scale-105 transition-transform bg-slate-900">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 truncate w-full mt-1.5">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
