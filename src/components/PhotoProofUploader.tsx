import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Eye } from 'lucide-react';

interface PhotoProofUploaderProps {
  photoUrls: string[];
  onPhotosChange: (urls: string[]) => void;
  onPreviewPhoto?: (url: string) => void;
  title?: string;
  subtitle?: string;
  maxPhotos?: number;
  compact?: boolean;
}

export const PhotoProofUploader: React.FC<PhotoProofUploaderProps> = ({
  photoUrls,
  onPhotosChange,
  onPreviewPhoto,
  title = 'Shift Work Photos & Proof',
  subtitle = 'Take pictures or upload images of what you repaired or built today',
  maxPhotos = 6,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = maxPhotos - photoUrls.length;
    if (availableSlots <= 0) return;

    const selectedFiles = Array.from(files).slice(0, availableSlots);
    const compressedList = await Promise.all(selectedFiles.map(compressAndReadImage));

    onPhotosChange([...photoUrls, ...compressedList]);
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photoUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3 space-y-2.5 font-mono">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Camera className="w-3 h-3" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {title}
            </span>
            {subtitle && !compact && (
              <span className="text-[10px] text-gray-400 block">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <span className="text-[10px] text-gray-400 font-bold px-1.5 py-0.5 rounded bg-[#161b22] border border-[#30363d]">
          {photoUrls.length} / {maxPhotos} photos
        </span>
      </div>

      {/* Hidden File Inputs */}
      {/* Standard file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {/* Mobile camera trigger */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        className="hidden"
      />

      {/* Upload Action Buttons */}
      {photoUrls.length < maxPhotos && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snap Camera Photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload From Files</span>
          </button>
        </div>
      )}

      {/* Thumbnail Strip */}
      {photoUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
          {photoUrls.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-lg overflow-hidden border border-[#30363d] bg-black/60 shadow-inner"
            >
              <img
                src={url}
                alt={`Shift work proof ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                onClick={() => onPreviewPhoto && onPreviewPhoto(url)}
              />

              {/* View Overlay */}
              <div
                onClick={() => onPreviewPhoto && onPreviewPhoto(url)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                <Eye className="w-4 h-4 text-white drop-shadow" />
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto(idx);
                }}
                title="Remove photo"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow"
              >
                <X className="w-3 h-3" />
              </button>

              <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/75 text-[9px] text-gray-300">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
