import React from 'react';
import { X, Download, ExternalLink, Camera } from 'lucide-react';

export interface PhotoViewerModalData {
  url: string;
  title: string;
  subtitle?: string;
  caption?: string;
  technicianName?: string;
  benchStation?: string;
  date?: string;
}

interface PhotoViewerModalProps {
  photoData: PhotoViewerModalData | null;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photoData,
  onClose,
}) => {
  if (!photoData) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoData.url;
    link.download = `TradeTech_ShiftPhoto_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
      <div className="w-full max-w-4xl bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {photoData.title || 'Shift Work Proof Photo'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {photoData.technicianName && (
                  <span className="text-cyan-400 font-semibold">{photoData.technicianName}</span>
                )}
                {photoData.benchStation && <span> · {photoData.benchStation}</span>}
                {photoData.date && <span> · {photoData.date}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161b22] hover:bg-red-950/60 hover:text-red-400 text-gray-400 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 sm:p-4 min-h-[300px]">
          <img
            src={photoData.url}
            alt={photoData.title}
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Footer with Accomplishment Notes / Caption */}
        {photoData.caption && (
          <div className="p-3.5 bg-[#0d1117] border-t border-[#30363d] text-xs text-gray-300">
            <span className="text-gray-400 text-[10px] block mb-0.5 uppercase tracking-wider font-semibold">
              Work Performed:
            </span>
            <p className="text-gray-200 leading-relaxed">
              {photoData.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
