import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-[#161b22]/95 border-[#2ea043]/50 text-white'
                : isError
                ? 'bg-red-950/90 border-red-800 text-white'
                : isWarning
                ? 'bg-amber-950/90 border-amber-800 text-white'
                : 'bg-[#161b22]/95 border-[#38bdf8]/50 text-white'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#2ea043]" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#f85149]" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 text-[#ffd166]" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#38bdf8]" />}
            </div>

            <div className="flex-1 text-xs">
              <h5 className="font-bold font-mono tracking-tight">{toast.title}</h5>
              <p className="text-gray-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white shrink-0 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
