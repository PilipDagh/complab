import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HardwareAsset, AssetRepairLog } from '../types';
import { generateQrDataUrl } from '../lib/qrCode';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Cpu,
  HardDrive,
  Activity,
  History,
  Plus,
  Trash2,
  Edit3,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Tag,
  RefreshCw,
  Sliders,
  Laptop,
  Server,
  Radio,
  FileText,
} from 'lucide-react';

export const AssetQRScannerModal: React.FC = () => {
  const {
    isScannerModalOpen,
    setIsScannerModalOpen,
    hardwareAssets,
    activeScannedAsset,
    setActiveScannedAsset,
    lookupHardwareAsset,
    saveHardwareAsset,
    addAssetRepairLog,
    deleteHardwareAsset,
    addProject,
    currentUser,
    addToast,
    setActiveTab,
  } = useApp();

  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<HardwareAsset | null>(activeScannedAsset);

  // Active sub-tab in asset viewer
  const [activeAssetTab, setActiveAssetTab] = useState<'specs' | 'history' | 'qr_print' | 'edit'>('specs');

  // New repair log modal/form state
  const [isAddingLog, setIsAddingLog] = useState<boolean>(false);
  const [newFault, setNewFault] = useState<string>('');
  const [newDiagnosis, setNewDiagnosis] = useState<string>('');
  const [newActions, setNewActions] = useState<string>('');
  const [newParts, setNewParts] = useState<string>('');
  const [newCost, setNewCost] = useState<string>('0');
  const [newStatus, setNewStatus] = useState<AssetRepairLog['status']>('Resolved');

  // Edit asset specs state
  const [editModel, setEditModel] = useState<string>('');
  const [editBench, setEditBench] = useState<string>('');
  const [editStatus, setEditStatus] = useState<HardwareAsset['status']>('In Service');
  const [editCpu, setEditCpu] = useState<string>('');
  const [editRam, setEditRam] = useState<string>('');
  const [editStorage, setEditStorage] = useState<string>('');
  const [editGpu, setEditGpu] = useState<string>('');
  const [editMotherboard, setEditMotherboard] = useState<string>('');
  const [editPsu, setEditPsu] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // QR Print preview data URL
  const [qrPrintUrl, setQrPrintUrl] = useState<string>('');

  // Camera references
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync selected asset with activeScannedAsset when opened
  useEffect(() => {
    if (activeScannedAsset) {
      setSelectedAsset(activeScannedAsset);
    } else if (hardwareAssets.length > 0 && !selectedAsset) {
      setSelectedAsset(hardwareAssets[0]);
    }
  }, [activeScannedAsset, hardwareAssets]);

  // Generate QR code data URL whenever selected asset changes
  useEffect(() => {
    if (selectedAsset) {
      generateQrDataUrl(selectedAsset.assetTag).then((url) => {
        setQrPrintUrl(url);
      });

      // Prepopulate edit fields
      setEditModel(selectedAsset.model);
      setEditBench(selectedAsset.assignedBench);
      setEditStatus(selectedAsset.status);
      setEditCpu(selectedAsset.specs.cpu || '');
      setEditRam(selectedAsset.specs.ram || '');
      setEditStorage(selectedAsset.specs.storage || '');
      setEditGpu(selectedAsset.specs.gpu || '');
      setEditMotherboard(selectedAsset.specs.motherboard || '');
      setEditPsu(selectedAsset.specs.psu || '');
      setEditNotes(selectedAsset.notes || '');
    }
  }, [selectedAsset]);

  // Camera stream initialization & frame scanning loop
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isScannerModalOpen || scanMode !== 'camera') {
        stopCamera();
        return;
      }

      setCameraError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setIsCameraActive(true);
          scanVideoFrame();
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError('Camera access unavailable or permission denied. You can upload an image or select a tag below.');
        setIsCameraActive(false);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsCameraActive(false);
    };

    if (isScannerModalOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScannerModalOpen, scanMode, cameraFacing]);

  // Continuous frame analysis using jsQR
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleQrDetected(code.data);
        return; // Pause scanning on detection
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Handle detected QR Code payload
  const handleQrDetected = async (detectedData: string) => {
    const clean = detectedData.trim();
    const asset = await lookupHardwareAsset(clean);

    if (asset) {
      setSelectedAsset(asset);
      setActiveScannedAsset(asset);
      addToast({
        type: 'success',
        title: 'Asset Tag Verified (Firestore)',
        message: `Found hardware record: ${asset.assetTag} - ${asset.model}`,
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Unknown Asset Tag',
        message: `Scanned code "${clean}" is not currently in Firestore inventory. You can create a new record.`,
      });
      setManualInput(clean);
      setScanMode('manual');
    }
  };

  // Image Upload QR Scanner
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQrDetected(code.data);
          } else {
            addToast({
              type: 'error',
              title: 'No QR Code Detected',
              message: 'Could not find a valid QR barcode in the uploaded image. Try higher contrast or manual input.',
            });
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manual search submit
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const asset = await lookupHardwareAsset(manualInput.trim());
    if (asset) {
      setSelectedAsset(asset);
      setActiveScannedAsset(asset);
      addToast({
        type: 'success',
        title: 'Asset Found in Firestore',
        message: `Loaded ${asset.assetTag} (${asset.model}).`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'No Matching Asset',
        message: `No existing record for "${manualInput}". Creating template for this tag.`,
      });
      // Create new draft asset template
      const newAssetDraft: HardwareAsset = {
        id: manualInput.toUpperCase().trim(),
        assetTag: manualInput.toUpperCase().trim(),
        serialNumber: `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        model: 'Custom Bench Hardware Unit',
        deviceType: 'Desktop Tower',
        assignedBench: currentUser?.benchStation || 'Bench #1',
        department: 'Vocational IT Lab',
        status: 'In Service',
        specs: {
          cpu: 'Intel/AMD Processor',
          ram: '16GB DDR4',
          storage: '512GB SSD',
        },
        repairHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedAsset(newAssetDraft);
      setActiveAssetTab('edit');
    }
  };

  // Save new repair log
  const handleSaveRepairLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !newFault.trim() || !newDiagnosis.trim()) {
      addToast({
        type: 'error',
        title: 'Incomplete Entry',
        message: 'Reported fault and diagnosis are required fields.',
      });
      return;
    }

    const partsArray = newParts
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    await addAssetRepairLog(selectedAsset.id, {
      technician: currentUser?.displayName || 'Bench Technician',
      faultReported: newFault,
      diagnosis: newDiagnosis,
      actionsTaken: newActions || 'Inspected, tested, and verified on bench.',
      partsReplaced: partsArray,
      cost: parseFloat(newCost) || 0,
      status: newStatus,
    });

    setIsAddingLog(false);
    setNewFault('');
    setNewDiagnosis('');
    setNewActions('');
    setNewParts('');
    setNewCost('0');
  };

  // Save edited specs to Firestore
  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const updatedAsset: HardwareAsset = {
      ...selectedAsset,
      model: editModel || selectedAsset.model,
      assignedBench: editBench || selectedAsset.assignedBench,
      status: editStatus,
      specs: {
        ...selectedAsset.specs,
        cpu: editCpu,
        ram: editRam,
        storage: editStorage,
        gpu: editGpu,
        motherboard: editMotherboard,
        psu: editPsu,
      },
      notes: editNotes,
      updatedAt: new Date().toISOString(),
    };

    await saveHardwareAsset(updatedAsset);
    setSelectedAsset(updatedAsset);
    setActiveAssetTab('specs');
  };

  // Create Work Order from Scanned Asset
  const handleCreateWorkOrder = () => {
    if (!selectedAsset) return;

    addProject({
      title: `[${selectedAsset.assetTag}] ${selectedAsset.model} - Bench Service`,
      benchNumber: selectedAsset.assignedBench || 'Bench #1',
      technicianName: currentUser?.displayName || 'Bench Technician',
      clientOrDepartment: selectedAsset.department || 'TradeTech Lab',
      deviceType: selectedAsset.deviceType || 'Hardware Unit',
      reportedFault: selectedAsset.notes || 'Hardware diagnosis and maintenance inspection.',
      priority: 'Normal',
      stage: 'Intake',
      partsReplaced: [],
      estimatedCost: 0,
    });

    setIsScannerModalOpen(false);
    setActiveTab('calendar');
    addToast({
      type: 'success',
      title: 'Work Order Created',
      message: `Created new work order for ${selectedAsset.assetTag} in Lab Ledger.`,
    });
  };

  // Link asset to Diagnostic Wizard & close modal
  const handleStartDiagnostics = () => {
    if (!selectedAsset) return;
    setActiveScannedAsset(selectedAsset);
    setIsScannerModalOpen(false);
    setActiveTab('diagnostic');
    addToast({
      type: 'info',
      title: 'Asset Linked to Diagnostic Tree',
      message: `Target device [${selectedAsset.assetTag}] is now active in the Diagnostic Wizard.`,
    });
  };

  if (!isScannerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#374151] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-100">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#374151] bg-[#1f2937]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">
                  Hardware Asset QR & Barcode Scanner
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  FIRESTORE SYNCED
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Scan device stickers to instantly retrieve hardware specifications & previous repair records.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScannerModalOpen(false)}
            className="p-2 rounded-xl bg-[#374151]/50 hover:bg-[#4b5563] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Scanner Control Bar */}
        <div className="p-4 border-b border-[#374151] bg-[#161f30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0f172a] border border-[#334155] w-fit">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                scanMode === 'camera'
                  ? 'bg-cyan-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                scanMode === 'upload'
                  ? 'bg-cyan-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Tag Image</span>
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                scanMode === 'manual'
                  ? 'bg-cyan-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Manual Search</span>
            </button>
          </div>

          {/* Quick Pre-seeded Tag Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] font-mono text-gray-400 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              LAB SAMPLES:
            </span>
            {hardwareAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  setSelectedAsset(asset);
                  setActiveScannedAsset(asset);
                }}
                className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-mono transition-all border ${
                  selectedAsset?.id === asset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-[#0f172a] text-gray-300 border-[#334155] hover:border-gray-400'
                }`}
              >
                {asset.assetTag}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body (Split into Scanner & Asset Viewer) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#374151]">
          {/* Left Column: Scanner Viewport / Upload / Search */}
          <div className="lg:col-span-5 p-4 flex flex-col space-y-4 bg-[#0d131f]">
            {scanMode === 'camera' && (
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-black border-2 border-cyan-500/40 shadow-inner flex items-center justify-center group">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning Reticle & Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-400/60 rounded-2xl m-6 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#06b6d4] animate-pulse" />
                  </div>

                  {/* Corner Target Markers */}
                  <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                  {!isCameraActive && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center">
                      <Camera className="w-8 h-8 text-gray-500 mb-2 animate-bounce" />
                      <p className="text-xs text-gray-400 font-mono">
                        {cameraError || 'Initializing video feed...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between w-full max-w-[280px] mt-3">
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live QR Frame Analyzer Active
                  </span>

                  <button
                    onClick={() =>
                      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="p-1.5 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-gray-300 text-[11px] font-mono flex items-center gap-1 border border-[#374151]"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>
                </div>
              </div>
            )}

            {scanMode === 'upload' && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square max-w-[280px] rounded-2xl border-2 border-dashed border-[#374151] hover:border-cyan-500 bg-[#161f30] hover:bg-[#1a253a] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                >
                  <Upload className="w-10 h-10 text-gray-500 group-hover:text-cyan-400 transition-colors mb-3" />
                  <span className="text-xs font-bold text-gray-200">Click or Drag QR Image</span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    Upload hardware sticker, asset label, or motherboard barcode photo
                  </span>
                </div>
              </div>
            )}

            {scanMode === 'manual' && (
              <form onSubmit={handleManualSearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    Enter Asset Tag, Serial, or ID:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g. AST-DELL-7090 or SN-DL7090..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#161f30] border border-[#374151] text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs font-mono flex items-center gap-1 shadow-md"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Lookup</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151] text-[11px] text-gray-400 space-y-1">
                  <span className="font-bold text-gray-300 block font-mono">🔍 Search Hints:</span>
                  <p>• Type any exact asset tag to pull its full history.</p>
                  <p>• If unknown, submitting will scaffold a new asset profile.</p>
                </div>
              </form>
            )}

            {/* Quick Actions for Selected Asset */}
            {selectedAsset && (
              <div className="pt-2 border-t border-[#374151] space-y-2">
                <button
                  onClick={handleStartDiagnostics}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-950/30 transition-all"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Diagnose Asset in Wizard</span>
                </button>

                <button
                  onClick={handleCreateWorkOrder}
                  className="w-full py-2 px-3 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-[#374151] text-gray-200 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Create Lab Work Order</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Asset Specifications, History, QR Printing & Editing */}
          <div className="lg:col-span-7 p-4 lg:p-6 flex flex-col space-y-4 bg-[#111827]">
            {selectedAsset ? (
              <>
                {/* Asset Header Card */}
                <div className="p-4 rounded-2xl bg-[#161f30] border border-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-white">
                        {selectedAsset.assetTag}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                          selectedAsset.status === 'In Service'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : selectedAsset.status === 'Under Repair'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : selectedAsset.status === 'Bench Testing'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {selectedAsset.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 font-medium mt-0.5">
                      {selectedAsset.model}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-3">
                      <span>Serial: {selectedAsset.serialNumber}</span>
                      <span>•</span>
                      <span>Bench: {selectedAsset.assignedBench}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveAssetTab('qr_print')}
                      className="p-2 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-[#374151] text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Print QR Asset Tag"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span className="hidden sm:inline">Print Tag</span>
                    </button>
                    <button
                      onClick={() => setActiveAssetTab('edit')}
                      className="p-2 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-[#374151] text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Edit Specs"
                    >
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 border-b border-[#374151] pb-2 text-xs font-mono">
                  <button
                    onClick={() => setActiveAssetTab('specs')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeAssetTab === 'specs'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Hardware Specs</span>
                  </button>

                  <button
                    onClick={() => setActiveAssetTab('history')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeAssetTab === 'history'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Repair History ({selectedAsset.repairHistory?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveAssetTab('qr_print')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeAssetTab === 'qr_print'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Label</span>
                  </button>
                </div>

                {/* TAB 1: SPECIFICATIONS */}
                {activeAssetTab === 'specs' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">CPU Processor:</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.cpu || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">RAM Configuration:</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.ram || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">Storage Drives:</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.storage || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">Motherboard / Planar:</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.motherboard || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">Power Supply (PSU):</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.psu || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                        <span className="text-[10px] text-gray-400 block mb-0.5">Operating System / OS:</span>
                        <span className="text-gray-200 font-medium">
                          {selectedAsset.specs.os || 'Vocational Image'}
                        </span>
                      </div>

                      {selectedAsset.specs.macAddress && (
                        <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                          <span className="text-[10px] text-gray-400 block mb-0.5">MAC / IP Address:</span>
                          <span className="text-cyan-400 font-mono">
                            {selectedAsset.specs.macAddress} ({selectedAsset.specs.ipAddress || 'DHCP'})
                          </span>
                        </div>
                      )}

                      {selectedAsset.specs.firmwareVersion && (
                        <div className="p-3 rounded-xl bg-[#161f30] border border-[#374151]">
                          <span className="text-[10px] text-gray-400 block mb-0.5">Firmware / BIOS:</span>
                          <span className="text-gray-200 font-medium">
                            {selectedAsset.specs.firmwareVersion}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedAsset.notes && (
                      <div className="p-3 rounded-xl bg-[#161f30]/60 border border-[#374151] text-xs">
                        <span className="text-[10px] font-mono text-gray-400 block mb-1">
                          Bench Technician Notes:
                        </span>
                        <p className="text-gray-300 leading-relaxed">{selectedAsset.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: REPAIR HISTORY */}
                {activeAssetTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">
                        CHRONOLOGICAL FIRESTORE SERVICE LOG:
                      </span>
                      <button
                        onClick={() => setIsAddingLog(!isAddingLog)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log New Repair</span>
                      </button>
                    </div>

                    {/* New Repair Form */}
                    {isAddingLog && (
                      <form
                        onSubmit={handleSaveRepairLog}
                        className="p-4 rounded-2xl bg-[#161f30] border border-emerald-500/40 space-y-3 animate-in fade-in"
                      >
                        <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Add Bench Repair Record to Firestore</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-mono text-gray-400 mb-1">
                              Reported Fault / Symptom:
                            </label>
                            <input
                              type="text"
                              value={newFault}
                              onChange={(e) => setNewFault(e.target.value)}
                              placeholder="e.g. Blown VRM phase, continuous beep on cold boot..."
                              className="w-full px-3 py-1.5 rounded-lg bg-[#0d131f] border border-[#374151] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-gray-400 mb-1">
                              Diagnosis / Root Cause:
                            </label>
                            <input
                              type="text"
                              value={newDiagnosis}
                              onChange={(e) => setNewDiagnosis(e.target.value)}
                              placeholder="e.g. High-side MOSFET shorted to ground (0.02 ohms)..."
                              className="w-full px-3 py-1.5 rounded-lg bg-[#0d131f] border border-[#374151] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-gray-400 mb-1">
                              Action Taken:
                            </label>
                            <textarea
                              value={newActions}
                              onChange={(e) => setNewActions(e.target.value)}
                              placeholder="e.g. Replaced MOSFET, tested +12V rail, passed 1hr stress test..."
                              rows={2}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#0d131f] border border-[#374151] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                                Parts Replaced (comma separated):
                              </label>
                              <input
                                type="text"
                                value={newParts}
                                onChange={(e) => setNewParts(e.target.value)}
                                placeholder="e.g. MOSFET Q4, Thermal Pad"
                                className="w-full px-3 py-1.5 rounded-lg bg-[#0d131f] border border-[#374151] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                                Status:
                              </label>
                              <select
                                value={newStatus}
                                onChange={(e: any) => setNewStatus(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-[#0d131f] border border-[#374151] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                              >
                                <option value="Resolved">Resolved</option>
                                <option value="Parts Ordered">Parts Ordered</option>
                                <option value="Bench Testing">Bench Testing</option>
                                <option value="Under Inspection">Under Inspection</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingLog(false)}
                            className="px-3 py-1.5 rounded-lg bg-[#1f2937] text-gray-400 hover:text-white font-mono text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-md"
                          >
                            Save Log to Firestore
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Timeline of previous logs */}
                    {selectedAsset.repairHistory && selectedAsset.repairHistory.length > 0 ? (
                      <div className="space-y-3">
                        {selectedAsset.repairHistory.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-xl bg-[#161f30] border border-[#374151] space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-cyan-400 font-bold">{log.date}</span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                Tech: {log.technician}
                              </span>
                            </div>

                            <div className="text-gray-200">
                              <span className="text-gray-400 font-mono text-[11px]">Fault: </span>
                              <span className="font-semibold">{log.faultReported}</span>
                            </div>

                            <div className="text-gray-300">
                              <span className="text-gray-400 font-mono text-[11px]">Diagnosis: </span>
                              {log.diagnosis}
                            </div>

                            <div className="text-gray-400 text-[11px]">
                              <span className="text-gray-500 font-mono">Action: </span>
                              {log.actionsTaken}
                            </div>

                            {log.partsReplaced && log.partsReplaced.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] font-mono text-gray-500">Parts:</span>
                                {log.partsReplaced.map((part, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f2937] text-gray-300 border border-[#374151]"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl bg-[#161f30]/40 border border-[#374151] text-center text-xs text-gray-400 font-mono">
                        No previous repair records logged for this hardware unit. Click "Log New Repair" to add the first entry.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: QR PRINT LABEL */}
                {activeAssetTab === 'qr_print' && (
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-gray-900 shadow-xl space-y-4 max-w-sm mx-auto">
                    <div className="text-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        TradeTech Vocational Lab Suite
                      </h3>
                      <div className="text-base font-black font-mono text-black">
                        {selectedAsset.assetTag}
                      </div>
                    </div>

                    {qrPrintUrl && (
                      <img
                        src={qrPrintUrl}
                        alt="Asset Tag QR"
                        className="w-44 h-44 rounded-lg border-2 border-black"
                      />
                    )}

                    <div className="text-center text-[11px] font-mono text-gray-800 space-y-0.5">
                      <div className="font-bold">{selectedAsset.model}</div>
                      <div>S/N: {selectedAsset.serialNumber}</div>
                      <div>Location: {selectedAsset.assignedBench}</div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="w-full py-2 rounded-xl bg-black text-white font-mono text-xs font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Bench Sticker</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: EDIT ASSET SPECS */}
                {activeAssetTab === 'edit' && (
                  <form onSubmit={handleSaveSpecs} className="space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Model Name:</label>
                        <input
                          type="text"
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Bench Station:</label>
                        <input
                          type="text"
                          value={editBench}
                          onChange={(e) => setEditBench(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Status:</label>
                        <select
                          value={editStatus}
                          onChange={(e: any) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        >
                          <option value="In Service">In Service</option>
                          <option value="Under Repair">Under Repair</option>
                          <option value="Bench Testing">Bench Testing</option>
                          <option value="Spare Inventory">Spare Inventory</option>
                          <option value="Decommissioned">Decommissioned</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">CPU:</label>
                        <input
                          type="text"
                          value={editCpu}
                          onChange={(e) => setEditCpu(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">RAM:</label>
                        <input
                          type="text"
                          value={editRam}
                          onChange={(e) => setEditRam(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Storage:</label>
                        <input
                          type="text"
                          value={editStorage}
                          onChange={(e) => setEditStorage(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#161f30] border border-[#374151] text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setActiveAssetTab('specs')}
                        className="px-3 py-1.5 rounded-lg bg-[#1f2937] text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold shadow-md"
                      >
                        Save Specs to Firestore
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3">
                <QrCode className="w-12 h-12 text-gray-600 animate-pulse" />
                <div className="text-sm font-bold text-gray-300">No Asset Tag Selected</div>
                <p className="text-xs max-w-sm">
                  Scan a QR code with your camera, upload an asset image, or select one of the lab sample chips above to inspect its live specifications and repair records.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
