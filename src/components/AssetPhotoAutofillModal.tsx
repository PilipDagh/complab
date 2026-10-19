import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HardwareAsset, AssetProblemLabel } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Cpu,
  HardDrive,
  Laptop,
  Layers,
  Wrench,
  Maximize2,
  Trash2,
  Plus,
  ShieldAlert,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

interface AssetPhotoAutofillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSaved?: (asset: HardwareAsset) => void;
}

const PROBLEM_PRESETS = [
  { label: 'No Power / Won’t Turn On', severity: 'Critical' as const, desc: 'Device completely unresponsive; power LED dead or flickering' },
  { label: 'Cracked Display / Damaged Screen', severity: 'Critical' as const, desc: 'LCD panel broken, vertical colored lines, or broken hinge' },
  { label: 'RAM / BSOD Memory Freeze', severity: 'Major' as const, desc: 'Random blue screens, memory training failure, or cyclic reboot' },
  { label: 'Storage / SMART Drive Failure', severity: 'Major' as const, desc: 'OS not found, clicking drive, or bad sectors detected' },
  { label: 'Liquid Damage / Board Corrosion', severity: 'Critical' as const, desc: 'Sticky keys, visible corrosion near charging port or motherboard' },
  { label: 'Thermal Throttling / Fan Grinding', severity: 'Major' as const, desc: 'Loud fan noise, shuts down under light load, excessive heat' },
  { label: 'Broken Port / Missing Screws', severity: 'Minor' as const, desc: 'USB-C loose or charging pin bent; physical casing wear' },
  { label: 'Battery Degraded / Won’t Hold Charge', severity: 'Major' as const, desc: 'Shuts off immediately when AC adapter is unplugged' },
];

const LOCATION_OPTIONS = [
  'Blank (Unassigned)',
  'Bench #1',
  'Bench #2',
  'Bench #3',
  'Bench #4',
  'Bench #5',
  'Bench #6',
  'Bench #7',
  'Bench #8',
  'Bench #9',
  'Bench #10',
  'Bench #11',
  'Bench #12',
  'Bench #13',
  'Bench #14',
  'Bench #15',
  'Bench #16',
  'Storage Shelf A (Ready Stock)',
  'Storage Shelf B (Triage Queue)',
  'Storage Shelf C (Spare Parts)',
  'Server Rack 01',
  'Repair Staging Cage',
];

export const AssetPhotoAutofillModal: React.FC<AssetPhotoAutofillModalProps> = ({
  isOpen,
  onClose,
  onAssetSaved,
}) => {
  const { saveHardwareAsset, currentUser, addToast } = useApp();

  // Mode: 'camera' vs 'upload'
  const [captureTab, setCaptureTab] = useState<'camera' | 'upload'>('camera');

  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Staged Photos (Base64)
  const [stagedPhotos, setStagedPhotos] = useState<Array<{ id: string; dataUrl: string; label: string }>>([]);

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionSuccess, setExtractionSuccess] = useState<boolean>(false);
  const [aiDetectedFields, setAiDetectedFields] = useState<Record<string, boolean>>({});

  // Form Fields
  const [assetTag, setAssetTag] = useState<string>(`AST-LAP-${Math.floor(100 + Math.random() * 900)}`);
  const [model, setModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [deviceType, setDeviceType] = useState<HardwareAsset['deviceType']>('Laptop');
  const [assignedBench, setAssignedBench] = useState<string>('Blank (Unassigned)');
  const [department, setDepartment] = useState<string>('Vocational IT Lab');
  const [status, setStatus] = useState<HardwareAsset['status']>('In Service');
  const [isCurrentlyOnHand, setIsCurrentlyOnHand] = useState<boolean>(true);
  const [nonTechNotes, setNonTechNotes] = useState<string>('');

  // Specs
  const [cpu, setCpu] = useState<string>('');
  const [ram, setRam] = useState<string>('');
  const [storage, setStorage] = useState<string>('');
  const [gpu, setGpu] = useState<string>('');
  const [os, setOs] = useState<string>('Windows 11 Pro 64-bit');
  const [macAddress, setMacAddress] = useState<string>('');

  // Problem Marker
  const [hasProblem, setHasProblem] = useState<boolean>(false);
  const [problemTitle, setProblemTitle] = useState<string>('');
  const [problemSeverity, setProblemSeverity] = useState<AssetProblemLabel['problemSeverity']>('Major');
  const [problemDescription, setProblemDescription] = useState<string>('');

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this browser. Please use photo upload.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload photos instead.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Switch Camera
  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture Photo from Camera
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const labels = ['Bottom Serial Sticker', 'QR / Barcode Label', 'Top Chassis / Model', 'Screen / Specs'];
    const label = labels[stagedPhotos.length % labels.length] || `Photo #${stagedPhotos.length + 1}`;

    setStagedPhotos((prev) => [...prev, { id: `photo_${Date.now()}_${Math.random()}`, dataUrl, label }]);

    addToast({
      type: 'info',
      title: 'Photo Captured',
      message: `Snapped ${label}. You can take more or click Analyze.`,
    });
  };

  // Handle File Upload (multi-file)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: Array<{ id: string; dataUrl: string; label: string }> = [];
    const readers: Promise<void>[] = [];

    Array.from(files).forEach((file, index) => {
      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newItems.push({
              id: `upload_${Date.now()}_${index}`,
              dataUrl: event.target.result as string,
              label: file.name.slice(0, 24),
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
      readers.push(p);
    });

    Promise.all(readers).then(() => {
      setStagedPhotos((prev) => [...prev, ...newItems].slice(0, 6));
      addToast({
        type: 'info',
        title: 'Photos Uploaded',
        message: `${newItems.length} photos ready for AI analysis.`,
      });
    });

    // Reset input
    e.target.value = '';
  };

  // Remove Photo
  const handleRemovePhoto = (id: string) => {
    setStagedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Trigger Gemini AI Vision Extraction
  const handleAnalyzePhotos = async () => {
    if (stagedPhotos.length === 0) {
      addToast({
        type: 'error',
        title: 'No Photos Staged',
        message: 'Please take or upload at least one photo of the device or serial sticker.',
      });
      return;
    }

    setIsExtracting(true);
    setExtractionSuccess(false);

    try {
      const payload = {
        images: stagedPhotos.map((p) => ({
          data: p.dataUrl,
          mimeType: 'image/jpeg',
        })),
        hints: nonTechNotes || 'Vocational laptop intake',
      };

      const response = await fetch('/api/gemini/extract-asset-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      const extracted = resData.extracted || {};

      const detectedMap: Record<string, boolean> = {};

      if (extracted.model) {
        setModel(extracted.model);
        detectedMap.model = true;
      }
      if (extracted.serialNumber) {
        setSerialNumber(extracted.serialNumber);
        detectedMap.serialNumber = true;
      }
      if (extracted.assetTagSuggestion) {
        setAssetTag(extracted.assetTagSuggestion);
        detectedMap.assetTag = true;
      }
      if (extracted.deviceType) {
        setDeviceType(extracted.deviceType);
        detectedMap.deviceType = true;
      }
      if (extracted.cpu) {
        setCpu(extracted.cpu);
        detectedMap.cpu = true;
      }
      if (extracted.ram) {
        setRam(extracted.ram);
        detectedMap.ram = true;
      }
      if (extracted.storage) {
        setStorage(extracted.storage);
        detectedMap.storage = true;
      }
      if (extracted.gpu) {
        setGpu(extracted.gpu);
        detectedMap.gpu = true;
      }
      if (extracted.os) {
        setOs(extracted.os);
        detectedMap.os = true;
      }
      if (extracted.macAddress) {
        setMacAddress(extracted.macAddress);
        detectedMap.macAddress = true;
      }
      if (extracted.detectedConditionNotes && !nonTechNotes) {
        setNonTechNotes(extracted.detectedConditionNotes);
      }

      setAiDetectedFields(detectedMap);
      setExtractionSuccess(true);

      addToast({
        type: 'success',
        title: 'Autofill Complete!',
        message: `Extracted ${extracted.model || 'specs'} & Serial [${extracted.serialNumber || 'detected'}]. Review & mark any problem below.`,
      });
    } catch (err: any) {
      console.error('Vision Autofill Error:', err);
      addToast({
        type: 'error',
        title: 'Extraction Error',
        message: 'Could not connect to AI Vision. You can manually enter specs.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply Problem Preset
  const handleApplyPreset = (preset: (typeof PROBLEM_PRESETS)[0]) => {
    setHasProblem(true);
    setProblemTitle(preset.label);
    setProblemSeverity(preset.severity);
    setProblemDescription(preset.desc);
    setStatus('Under Repair');
  };

  // Submit / Save Asset
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() && !serialNumber.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Info',
        message: 'Please provide at least a Model Name or Serial Number.',
      });
      return;
    }

    const cleanLocation =
      assignedBench === 'Blank (Unassigned)' || assignedBench === 'Blank' ? 'Unassigned' : assignedBench;

    const newAsset: HardwareAsset = {
      id: assetTag.trim() || `AST-${Date.now()}`,
      assetTag: assetTag.trim() || `AST-${Date.now()}`,
      serialNumber: serialNumber.trim() || 'UNKNOWN-SN',
      model: model.trim() || 'Vocational Asset',
      deviceType,
      assignedBench: cleanLocation,
      department: department.trim() || 'Vocational IT Lab',
      status: hasProblem ? 'Under Repair' : status,
      isCurrentlyOnHand,
      specs: {
        cpu: cpu.trim() || undefined,
        ram: ram.trim() || undefined,
        storage: storage.trim() || undefined,
        gpu: gpu.trim() || undefined,
        os: os.trim() || undefined,
        macAddress: macAddress.trim() || undefined,
      },
      notes: nonTechNotes.trim() || undefined,
      problemLabel: hasProblem
        ? {
            hasProblem: true,
            problemTitle: problemTitle.trim() || 'Hardware Defect Noted',
            problemSeverity,
            problemDescription: problemDescription.trim() || undefined,
            reportedDate: new Date().toISOString().split('T')[0],
            reportedBy: currentUser?.displayName || 'Technician',
          }
        : undefined,
      repairHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorUid: currentUser?.id,
    };

    try {
      await saveHardwareAsset(newAsset);
      addToast({
        type: 'success',
        title: 'Asset Registered',
        message: `Asset [${newAsset.assetTag}] saved to ${cleanLocation}.`,
      });
      if (onAssetSaved) {
        onAssetSaved(newAsset);
      }
      stopCamera();
      onClose();
    } catch (err: any) {
      console.error('Save asset error:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save asset to database.',
      });
    }
  };

  // Lifecycle for camera toggle
  useEffect(() => {
    if (isOpen && captureTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, captureTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen-Fitting Modal Container */}
      <div className="bg-[#111620] border border-[#232d3f] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl font-mono text-xs overflow-hidden">
        {/* Pinned Header */}
        <div className="p-4 sm:px-6 py-3.5 bg-[#161d2b] border-b border-[#232d3f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Photo & QR Asset Autofill</h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Gemini Vision Powered
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Snap photos of the serial sticker or QR tag, let AI autofill the tech specs, then mark any problem.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-[#0d121c] hover:bg-[#20293a] border border-[#232d3f] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Top Section: Capture Mode Tabs + Live Viewfinder / Uploader */}
          <div className="bg-[#0b0e14] border border-[#232d3f] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-[#161d2b] rounded-xl border border-[#232d3f]">
                <button
                  type="button"
                  onClick={() => setCaptureTab('camera')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    captureTab === 'camera'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    captureTab === 'upload'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos ({stagedPhotos.length})</span>
                </button>
              </div>

              {captureTab === 'camera' && cameraActive && (
                <button
                  type="button"
                  onClick={handleToggleFacing}
                  className="px-2.5 py-1.5 rounded-lg bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-gray-300 hover:text-white flex items-center gap-1 text-[11px]"
                  title="Switch between front and back camera"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Flip: {cameraFacing === 'environment' ? 'Back' : 'Front'}</span>
                </button>
              )}
            </div>

            {/* Viewfinder or Upload Dropzone */}
            {captureTab === 'camera' ? (
              <div className="space-y-3">
                <div className="relative aspect-video max-h-64 sm:max-h-72 w-full bg-black rounded-xl overflow-hidden border border-[#232d3f] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />

                  {/* Target Crosshairs for Serial Stickers & Barcodes */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-3/4 max-w-sm h-32 border-2 border-dashed border-cyan-400/70 rounded-xl flex items-center justify-center bg-cyan-500/5">
                        <span className="text-[11px] text-cyan-300 font-mono bg-black/60 px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                          Align Bottom Serial Sticker or QR Tag
                        </span>
                      </div>
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="w-8 h-8 text-gray-500 mx-auto" />
                      <p className="text-gray-400 text-xs">
                        {cameraError || 'Camera currently stopped'}
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>

                {/* Shutter Capture Button */}
                {cameraActive && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo ({stagedPhotos.length} staged)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Multi-Photo Upload Dropzone */
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#232d3f] hover:border-cyan-500/50 rounded-xl bg-[#111620] cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-bold text-white">Click or drag photos here</span>
                <span className="text-[10px] text-gray-400 mt-1">
                  Upload multiple photos: bottom sticker, QR tag, top cover, or spec screen
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Staged Photos Gallery Shelf */}
            {stagedPhotos.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#232d3f]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-semibold">
                    Staged Photos ({stagedPhotos.length}/6):
                  </span>
                  <button
                    type="button"
                    onClick={() => setStagedPhotos([])}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {stagedPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="relative w-20 h-20 rounded-xl border border-[#232d3f] overflow-hidden bg-black shrink-0 group"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={`Staged ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 p-0.5 rounded-md bg-black/70 text-red-400 hover:text-red-300 opacity-90 group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[8px] text-gray-300 truncate text-center">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Big Action: Run AI Vision Extraction */}
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleAnalyzePhotos}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all ${
                    isExtracting
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 cursor-wait'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-950/50'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                  <span>
                    {isExtracting
                      ? 'Analyzing Photos & Decoding QR / Barcodes...'
                      : `Analyze ${stagedPhotos.length} Photo${stagedPhotos.length > 1 ? 's' : ''} & Autofill Specs`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Section: Form with Highlighted Extracted Fields */}
          <form onSubmit={handleSaveAsset} className="space-y-4">
            {extractionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">
                    Specs autofilled from photo! Review details and mark any problem below.
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  Ready
                </span>
              </div>
            )}

            {/* Core Identification Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Asset Tag */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Asset Tag</label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 rounded-xl bg-[#0b0e14] border text-white font-bold focus:outline-none ${
                    aiDetectedFields.assetTag
                      ? 'border-emerald-500/70 ring-1 ring-emerald-500/40 bg-emerald-950/20'
                      : 'border-[#232d3f] focus:border-cyan-500'
                  }`}
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1 flex items-center justify-between">
                  <span>Hardware Model</span>
                  {aiDetectedFields.model && (
                    <span className="text-[9px] text-emerald-400 font-bold">AI Scanned</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Dell Latitude 5420"
                  className={`w-full px-3 py-2 rounded-xl bg-[#0b0e14] border text-white focus:outline-none ${
                    aiDetectedFields.model
                      ? 'border-emerald-500/70 ring-1 ring-emerald-500/40 bg-emerald-950/20'
                      : 'border-[#232d3f] focus:border-cyan-500'
                  }`}
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1 flex items-center justify-between">
                  <span>Serial Number (S/N)</span>
                  {aiDetectedFields.serialNumber && (
                    <span className="text-[9px] text-emerald-400 font-bold">AI Scanned</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. 8841-B9-C1"
                  className={`w-full px-3 py-2 rounded-xl bg-[#0b0e14] border text-white font-bold focus:outline-none ${
                    aiDetectedFields.serialNumber
                      ? 'border-emerald-500/70 ring-1 ring-emerald-500/40 bg-emerald-950/20'
                      : 'border-[#232d3f] focus:border-cyan-500'
                  }`}
                />
              </div>

              {/* Device Classification */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b0e14] border border-[#232d3f] text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop Tower">Desktop Tower</option>
                  <option value="Managed Switch">Managed Switch</option>
                  <option value="Server">Server</option>
                  <option value="Power Supply">Power Supply</option>
                  <option value="Bench Equipment">Bench Equipment</option>
                  <option value="Custom Rig">Custom Rig</option>
                </select>
              </div>
            </div>

            {/* Location & Status Strip (Includes Blank Option) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#161d2b]/60 p-3.5 rounded-xl border border-[#232d3f]">
              {/* Location with Blank Option */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">
                  Location (Bench / Storage)
                </label>
                <select
                  value={assignedBench}
                  onChange={(e) => setAssignedBench(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-[#0b0e14] border text-white focus:outline-none ${
                    assignedBench.includes('Blank') || assignedBench === 'Unassigned'
                      ? 'border-gray-600 text-gray-300'
                      : 'border-[#232d3f] text-cyan-300 focus:border-cyan-500'
                  }`}
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Select "Blank" if no specific location is assigned yet.
                </span>
              </div>

              {/* Presence Toggle */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Physical Presence</label>
                <button
                  type="button"
                  onClick={() => setIsCurrentlyOnHand(!isCurrentlyOnHand)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                    isCurrentlyOnHand
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-gray-900 border-gray-700 text-gray-400'
                  }`}
                >
                  <span>{isCurrentlyOnHand ? 'Currently in Lab (On-Hand)' : 'Offsite / In Transit'}</span>
                  <span className={`w-2 h-2 rounded-full ${isCurrentlyOnHand ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Inventory Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b0e14] border border-[#232d3f] text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="In Service">In Service (Ready)</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Bench Testing">Bench Testing</option>
                  <option value="Spare Inventory">Spare Inventory</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>
            </div>

            {/* PROBLEM MARKER SECTION */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                hasProblem
                  ? 'bg-red-950/20 border-red-500/50'
                  : 'bg-[#161d2b]/40 border-[#232d3f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      hasProblem ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Mark for Problem / Needs Repair</h4>
                    <p className="text-[10px] text-gray-400">
                      Flag any broken parts, boot issues, or damage detected on intake.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasProblem}
                    onChange={(e) => {
                      setHasProblem(e.target.checked);
                      if (e.target.checked && !problemTitle) {
                        setProblemTitle('Reported Hardware Issue');
                        setStatus('Under Repair');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Problem Details & 1-Click CompTIA Presets */}
              {hasProblem && (
                <div className="space-y-3 pt-2 border-t border-red-500/30 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Quick Problem Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PROBLEM_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            problemTitle === p.label
                              ? 'bg-red-600 text-white border-red-500'
                              : 'bg-[#0d121c] border-[#232d3f] text-red-300 hover:border-red-500/50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1">Problem Title</label>
                      <input
                        type="text"
                        value={problemTitle}
                        onChange={(e) => setProblemTitle(e.target.value)}
                        placeholder="e.g. Broken Display / Cracked Glass"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e14] border border-red-500/40 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1">Severity</label>
                      <select
                        value={problemSeverity}
                        onChange={(e) => setProblemSeverity(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e14] border border-red-500/40 text-white focus:outline-none"
                      >
                        <option value="Critical">Critical (Dead / No Boot / Dangerous)</option>
                        <option value="Major">Major (Impaired Function / Faulty Part)</option>
                        <option value="Minor">Minor (Cosmetic / Intermittent / Wear)</option>
                        <option value="Diagnosing">Diagnosing / Bench Testing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">
                      Problem Description / Technician Notes
                    </label>
                    <textarea
                      rows={2}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="Describe what happened, error codes, student remarks, or parts needed..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e14] border border-red-500/40 text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Non-Tech Specs & Technician Notes */}
            <div>
              <label className="block text-gray-400 text-[11px] mb-1">
                Non-Tech Specs / Cosmetic & Physical Remarks
              </label>
              <textarea
                rows={2}
                value={nonTechNotes}
                onChange={(e) => setNonTechNotes(e.target.value)}
                placeholder="e.g. Scratched lid, missing charger, student sticker on wrist rest, donor parts candidate..."
                className="w-full px-3 py-2 rounded-xl bg-[#0b0e14] border border-[#232d3f] text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Collapsible / Detailed Hardware Specs (Pre-filled by AI) */}
            <div className="border border-[#232d3f] rounded-xl p-3.5 bg-[#0b0e14]/50 space-y-3">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Technical Hardware Specifications
                </span>
                <span className="text-[10px] text-gray-500">Auto-extracted or manual</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">CPU Processor</label>
                  <input
                    type="text"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    placeholder="e.g. Intel Core i5-1135G7"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">Memory (RAM)</label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    placeholder="e.g. 16GB DDR4"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">Storage Drive</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="e.g. 512GB NVMe SSD"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">Graphics (GPU)</label>
                  <input
                    type="text"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    placeholder="e.g. Intel Iris Xe"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">Operating System</label>
                  <input
                    type="text"
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    placeholder="e.g. Windows 11 Pro 64-bit"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-0.5">MAC / Network ID</label>
                  <input
                    type="text"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    placeholder="e.g. F4:8E:38:A2:1C:77"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111620] border border-[#232d3f] text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Pinned Modal Action Footer */}
            <div className="pt-3 border-t border-[#232d3f] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Asset to Inventory</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
