import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { InventoryItem, KanbanTicket } from '../data/shopManagementDatabase';
import {
  Camera,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  X,
  RefreshCw,
  Zap,
  Package,
  Wrench,
  Volume2,
  VolumeX,
  Upload,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  kanbanTickets: KanbanTicket[];
  onUpdateStock: (itemId: string, newStock: number, workOrderId?: string) => void;
  onTriggerLowStockAlert?: (item: InventoryItem) => void;
}

export const InventoryBarcodeScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  inventory,
  kanbanTickets,
  onUpdateStock,
  onTriggerLowStockAlert,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanned item state
  const [scannedSku, setScannedSku] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [quantityDelta, setQuantityDelta] = useState<number>(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('NONE');
  const [scanHistory, setScanHistory] = useState<{
    time: string;
    sku: string;
    name: string;
    action: string;
    workOrder?: string;
  }[]>([]);

  // Camera & Canvas DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play audio beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Web Audio beep error', e);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(err.message || 'Unable to access camera device.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Real-time frame loop
  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleBarcodeDetected(code.data);
            return; // Pause loop briefly on detection
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Handle detection from camera or manual
  const handleBarcodeDetected = (rawCode: string) => {
    const trimmed = rawCode.trim();
    setScannedSku(trimmed);

    // Look for exact SKU match or name match
    const found = inventory.find(
      (i) =>
        i.sku.toLowerCase() === trimmed.toLowerCase() ||
        i.id.toLowerCase() === trimmed.toLowerCase() ||
        i.name.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (found) {
      setMatchedItem(found);
      playBeep();
    } else {
      // Create fallback item match if not found
      setMatchedItem(null);
    }
  };

  // Handle static file image scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleBarcodeDetected(code.data);
          } else {
            alert('No QR or Barcode detected in the uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Execute Stock Adjustment (Receive or Issue)
  const handleConfirmAdjustment = (isIssue: boolean) => {
    if (!matchedItem) return;

    const delta = isIssue ? -Math.abs(quantityDelta) : Math.abs(quantityDelta);
    const newStock = Math.max(0, matchedItem.stock + delta);

    onUpdateStock(matchedItem.id, newStock, selectedTicketId !== 'NONE' ? selectedTicketId : undefined);

    // Add to local audit history
    const log = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sku: matchedItem.sku,
      name: matchedItem.name,
      action: isIssue ? `Issued ${quantityDelta} unit(s)` : `Restocked +${quantityDelta} unit(s)`,
      workOrder: selectedTicketId !== 'NONE' ? selectedTicketId : undefined,
    };
    setScanHistory((prev) => [log, ...prev].slice(0, 10));

    // Check low stock trigger
    if (newStock <= matchedItem.minThreshold && onTriggerLowStockAlert) {
      onTriggerLowStockAlert(matchedItem);
    }

    // Refresh matched item stock
    setMatchedItem({ ...matchedItem, stock: newStock });
  };

  // Cleanup on mount/unmount
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Real-Time Barcode & QR Inventory Scanner
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Camera API Ready
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Point camera at 1D/2D barcodes to issue components to work orders or receive shipments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400'
                  : 'bg-gray-900 border-gray-800 text-gray-500'
              }`}
              title="Toggle Audio Beep"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder & Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Camera Viewfinder */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-gray-800 aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-cyan-400/80 rounded-lg relative animate-pulse">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-300"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-300"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-300"></div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/50"></div>
              </div>
            </div>

            {/* Camera Control Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment')}
                className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-gray-700 text-[10px] text-gray-200 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Flip Lens
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-gray-700 text-[10px] text-gray-200 hover:text-white flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Right: Quick Simulation & Manual Search */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="block text-gray-400 text-[11px]">Manual SKU / Barcode Lookup</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Enter SKU (e.g. CPU-AMD-7800X3D)..."
                  value={scannedSku}
                  onChange={(e) => handleBarcodeDetected(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => handleBarcodeDetected('CPU-AMD-7800X3D')}
                  className="px-2 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px]"
                  title="Test Scan Simulation"
                >
                  Simulate
                </button>
              </div>

              {/* Preset Test Buttons */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-gray-500 uppercase">Quick Barcode Presets:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleBarcodeDetected('GPU-NV-RTX4090')}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-cyan-400 hover:bg-gray-800"
                  >
                    RTX 4090
                  </button>
                  <button
                    onClick={() => handleBarcodeDetected('RAM-GSK-64G5-6000')}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-purple-400 hover:bg-gray-800"
                  >
                    DDR5 64GB
                  </button>
                  <button
                    onClick={() => handleBarcodeDetected('SSD-SAM-990P-2T')}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-emerald-400 hover:bg-gray-800"
                  >
                    990 Pro 2TB
                  </button>
                  <button
                    onClick={() => handleBarcodeDetected('THM-MX6-04G')}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-amber-400 hover:bg-gray-800"
                  >
                    MX-6 Paste
                  </button>
                </div>
              </div>
            </div>

            {/* Scanned Match Banner */}
            {matchedItem ? (
              <div className="p-3.5 rounded-xl bg-gray-950 border border-cyan-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {matchedItem.sku}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Current Stock: {matchedItem.stock} units
                  </span>
                </div>
                <div className="font-sans font-semibold text-white text-sm line-clamp-1">
                  {matchedItem.name}
                </div>
                <div className="text-[11px] text-gray-400 flex justify-between">
                  <span>📍 {matchedItem.location}</span>
                  <span className="text-cyan-300 font-bold">${matchedItem.unitCost.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-center text-gray-500 space-y-1">
                <QrCode className="w-6 h-6 mx-auto text-gray-600" />
                <p>Scan a barcode or enter a SKU above to execute stock actions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls when item is matched */}
        {matchedItem && (
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity Stepper */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 text-[11px]">Quantity to Transact</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantityDelta(Math.max(1, quantityDelta - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantityDelta}
                    onChange={(e) => setQuantityDelta(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-gray-900 border border-gray-700 rounded-lg py-1.5 text-white font-bold text-sm"
                  />
                  <button
                    onClick={() => setQuantityDelta(quantityDelta + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center text-base"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setQuantityDelta(5)}
                    className="px-2 py-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-[10px]"
                  >
                    Set 5
                  </button>
                </div>
              </div>

              {/* Work Order Link */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 text-[11px]">Link to Student Work Order (Optional)</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => setSelectedTicketId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none text-[11px]"
                >
                  <option value="NONE">-- General Inventory Operation (No Work Order) --</option>
                  {kanbanTickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}: {t.title} ({t.assignedStudent})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
              <button
                onClick={() => handleConfirmAdjustment(true)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Minus className="w-4 h-4" />
                <span>Issue to Bench (-{quantityDelta})</span>
              </button>

              <button
                onClick={() => handleConfirmAdjustment(false)}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Receive Restock (+{quantityDelta})</span>
              </button>
            </div>
          </div>
        )}

        {/* Scan Audit Log */}
        {scanHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
              Recent Barcode Audit Trail
            </div>
            <div className="space-y-1.5">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{item.time}</span>
                    <span className="text-cyan-400 font-bold">{item.sku}</span>
                    <span className="text-gray-200 truncate max-w-[200px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{item.action}</span>
                    {item.workOrder && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {item.workOrder}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
