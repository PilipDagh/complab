import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HardwareAsset, AssetRepairLog, AssetProblemLabel } from '../types';
import { generateQrDataUrl } from '../lib/qrCode';
import {
  Tag,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Wrench,
  Cpu,
  HardDrive,
  Laptop,
  Server,
  Layers,
  Printer,
  QrCode,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Boxes,
  Eye,
  Edit3,
  Check,
  X,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  Radio,
  FileText,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

const COMMON_PROBLEM_PRESETS = [
  { label: 'No Power / Dead +5VSB Standby Rail', severity: 'Critical' as const, type: 'Power' },
  { label: 'RAM Bit Flipping / BSOD Memory Loop', severity: 'Major' as const, type: 'Memory' },
  { label: 'No Video Output / PCIe GPU Hang', severity: 'Critical' as const, type: 'GPU' },
  { label: 'Thermal Throttling / Cooler Fan Failure', severity: 'Major' as const, type: 'Thermal' },
  { label: 'BIOS Firmware Corrupted / POST Code Freeze', severity: 'Major' as const, type: 'Firmware' },
  { label: 'Storage SMART Failure / Imminent Drive Crash', severity: 'Major' as const, type: 'Storage' },
  { label: 'Cracked Display / Damaged LVDS Flex Cable', severity: 'Critical' as const, type: 'Display' },
  { label: 'Liquid Spill Damage / Board Corrosion', severity: 'Critical' as const, type: 'PCB' },
  { label: 'Broken USB / Front I/O Header Short', severity: 'Minor' as const, type: 'I/O' },
  { label: 'OS Bootloader Failure / Corrupt Master Boot Record', severity: 'Minor' as const, type: 'OS' },
];

const BENCH_LOCATIONS = [
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

interface AssetInventoryManagerProps {
  onOpenQRScanner?: () => void;
}

export const AssetInventoryManager: React.FC<AssetInventoryManagerProps> = ({
  onOpenQRScanner,
}) => {
  const {
    hardwareAssets,
    saveHardwareAsset,
    deleteHardwareAsset,
    addAssetRepairLog,
    currentUser,
    isOwner,
    addToast,
    setIsScannerModalOpen,
    setActiveScannedAsset,
  } = useApp();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPresence, setFilterPresence] = useState<'ALL' | 'ON_HAND' | 'OFFSITE'>('ALL');
  const [filterProblem, setFilterProblem] = useState<'ALL' | 'PROBLEMS_ONLY' | 'HEALTHY_ONLY'>('ALL');
  const [filterDeviceType, setFilterDeviceType] = useState<string>('ALL');
  const [filterBench, setFilterBench] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [problemModalAsset, setProblemModalAsset] = useState<HardwareAsset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<HardwareAsset | null>(null);
  const [qrPrintAsset, setQrPrintAsset] = useState<HardwareAsset | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Add Asset Form State
  const [newTag, setNewTag] = useState<string>(`AST-PC-${Math.floor(100 + Math.random() * 900)}`);
  const [newModel, setNewModel] = useState<string>('');
  const [newSerial, setNewSerial] = useState<string>('');
  const [newDeviceType, setNewDeviceType] = useState<HardwareAsset['deviceType']>('Desktop Tower');
  const [newBench, setNewBench] = useState<string>('Bench #1');
  const [newDepartment, setNewDepartment] = useState<string>('Vocational IT Lab');
  const [newStatus, setNewStatus] = useState<HardwareAsset['status']>('In Service');
  const [newIsOnHand, setNewIsOnHand] = useState<boolean>(true);
  const [newNotes, setNewNotes] = useState<string>('');

  // Initial Problem on intake
  const [newHasProblem, setNewHasProblem] = useState<boolean>(false);
  const [newProblemTitle, setNewProblemTitle] = useState<string>('');
  const [newProblemSeverity, setNewProblemSeverity] = useState<AssetProblemLabel['problemSeverity']>('Major');
  const [newProblemNotes, setNewProblemNotes] = useState<string>('');

  // Specs
  const [newCpu, setNewCpu] = useState<string>('');
  const [newRam, setNewRam] = useState<string>('');
  const [newStorage, setNewStorage] = useState<string>('');
  const [newGpu, setNewGpu] = useState<string>('');
  const [newMotherboard, setNewMotherboard] = useState<string>('');
  const [newPsu, setNewPsu] = useState<string>('');
  const [newOs, setNewOs] = useState<string>('Windows 11 Pro 64-bit');

  // Problem Marker Form State
  const [problemTitle, setProblemTitle] = useState<string>('');
  const [problemSeverity, setProblemSeverity] = useState<AssetProblemLabel['problemSeverity']>('Major');
  const [problemDesc, setProblemDesc] = useState<string>('');

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return hardwareAssets.filter((asset) => {
      // 1. Presence Filter
      const isOnHand = asset.isCurrentlyOnHand ?? true;
      if (filterPresence === 'ON_HAND' && !isOnHand) return false;
      if (filterPresence === 'OFFSITE' && isOnHand) return false;

      // 2. Problem Filter
      const hasProblem = !!asset.problemLabel?.hasProblem || asset.status === 'Under Repair';
      if (filterProblem === 'PROBLEMS_ONLY' && !hasProblem) return false;
      if (filterProblem === 'HEALTHY_ONLY' && hasProblem) return false;

      // 3. Device Type Filter
      if (filterDeviceType !== 'ALL' && asset.deviceType !== filterDeviceType) return false;

      // 4. Bench Filter
      if (filterBench !== 'ALL' && asset.assignedBench !== filterBench) return false;

      // 5. Query Search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      return (
        asset.assetTag.toLowerCase().includes(q) ||
        asset.model.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        asset.assignedBench.toLowerCase().includes(q) ||
        asset.deviceType.toLowerCase().includes(q) ||
        (asset.problemLabel?.problemTitle && asset.problemLabel.problemTitle.toLowerCase().includes(q)) ||
        (asset.problemLabel?.problemDescription && asset.problemLabel.problemDescription.toLowerCase().includes(q)) ||
        (asset.specs.cpu && asset.specs.cpu.toLowerCase().includes(q)) ||
        (asset.specs.gpu && asset.specs.gpu.toLowerCase().includes(q)) ||
        (asset.specs.ram && asset.specs.ram.toLowerCase().includes(q)) ||
        (asset.notes && asset.notes.toLowerCase().includes(q))
      );
    });
  }, [
    hardwareAssets,
    searchQuery,
    filterPresence,
    filterProblem,
    filterDeviceType,
    filterBench,
  ]);

  // Metric Aggregations
  const totalAssets = hardwareAssets.length;
  const onHandCount = hardwareAssets.filter((a) => a.isCurrentlyOnHand ?? true).length;
  const problemsCount = hardwareAssets.filter((a) => a.problemLabel?.hasProblem || a.status === 'Under Repair').length;
  const healthyCount = hardwareAssets.filter((a) => (a.isCurrentlyOnHand ?? true) && !a.problemLabel?.hasProblem && a.status === 'In Service').length;
  const spareCount = hardwareAssets.filter((a) => a.status === 'Spare Inventory').length;

  // Toggle Currently Have (On-Hand) state
  const handleToggleOnHand = async (asset: HardwareAsset) => {
    const nextVal = !(asset.isCurrentlyOnHand ?? true);
    const updated: HardwareAsset = {
      ...asset,
      isCurrentlyOnHand: nextVal,
      updatedAt: new Date().toISOString(),
    };
    await saveHardwareAsset(updated);
    addToast({
      type: nextVal ? 'success' : 'info',
      title: nextVal ? 'Marked as Currently In Lab' : 'Marked as Offsite / Missing',
      message: `Asset [${asset.assetTag}] presence updated.`,
    });
  };

  // Open Problem Marker
  const handleOpenProblemModal = (asset: HardwareAsset) => {
    setProblemModalAsset(asset);
    if (asset.problemLabel?.hasProblem) {
      setProblemTitle(asset.problemLabel.problemTitle || '');
      setProblemSeverity(asset.problemLabel.problemSeverity || 'Major');
      setProblemDesc(asset.problemLabel.problemDescription || '');
    } else {
      setProblemTitle('');
      setProblemSeverity('Major');
      setProblemDesc('');
    }
  };

  // Save Problem Label
  const handleSaveProblem = async () => {
    if (!problemModalAsset) return;

    if (!problemTitle.trim()) {
      addToast({
        type: 'error',
        title: 'Problem Label Required',
        message: 'Please describe the problem or choose a preset.',
      });
      return;
    }

    const updated: HardwareAsset = {
      ...problemModalAsset,
      status: 'Under Repair',
      problemLabel: {
        hasProblem: true,
        problemTitle: problemTitle.trim(),
        problemSeverity,
        problemDescription: problemDesc.trim(),
        reportedDate: new Date().toISOString().split('T')[0],
        reportedBy: currentUser?.displayName || 'Technician',
      },
      updatedAt: new Date().toISOString(),
    };

    await saveHardwareAsset(updated);
    setProblemModalAsset(null);
    addToast({
      type: 'warning',
      title: 'Problem Labeled on Asset',
      message: `[${problemModalAsset.assetTag}] flagged with problem: ${problemTitle}`,
    });
  };

  // Clear / Resolve Problem
  const handleClearProblem = async (asset: HardwareAsset) => {
    const prevProblemTitle = asset.problemLabel?.problemTitle || 'Unspecified Hardware Fault';

    // Auto append to repair log so history is kept!
    const resolutionLog: Omit<AssetRepairLog, 'id' | 'date'> = {
      technician: currentUser?.displayName || 'Julian (Lead Tech)',
      faultReported: prevProblemTitle,
      diagnosis: asset.problemLabel?.problemDescription || 'Diagnosed and serviced on bench.',
      actionsTaken: 'Issue resolved, verified with hardware burn-in test.',
      partsReplaced: [],
      status: 'Resolved',
    };

    await addAssetRepairLog(asset.id, resolutionLog);

    const updated: HardwareAsset = {
      ...asset,
      status: 'In Service',
      problemLabel: {
        hasProblem: false,
        problemTitle: '',
        problemDescription: '',
      },
      updatedAt: new Date().toISOString(),
    };

    await saveHardwareAsset(updated);
    if (problemModalAsset?.id === asset.id) {
      setProblemModalAsset(null);
    }

    addToast({
      type: 'success',
      title: 'Problem Marked Resolved',
      message: `[${asset.assetTag}] problem cleared & logged to repair history.`,
    });
  };

  // Delete Asset
  const handleConfirmDelete = async () => {
    if (!deleteConfirmAsset) return;
    const tag = deleteConfirmAsset.assetTag;
    await deleteHardwareAsset(deleteConfirmAsset.id);
    setDeleteConfirmAsset(null);
    addToast({
      type: 'warning',
      title: 'Asset Removed from Inventory',
      message: `Asset [${tag}] was deleted from database.`,
    });
  };

  // Quick Preset Autofill in Add Asset modal
  const handleApplyPreset = (type: 'desktop' | 'laptop' | 'switch' | 'server' | 'gear' | 'custom_rig') => {
    if (type === 'desktop') {
      setNewModel('Dell OptiPlex 7090 Micro Tower');
      setNewDeviceType('Desktop Tower');
      setNewCpu('Intel Core i7-10700 (8C/16T, 2.9GHz)');
      setNewRam('32GB DDR4-2933 Dual-Channel');
      setNewStorage('1TB PCIe Gen3 NVMe SSD');
      setNewGpu('Intel UHD Graphics 630');
      setNewMotherboard('Dell OEM Q470 Chipset');
      setNewPsu('90W AC Power Adapter');
    } else if (type === 'laptop') {
      setNewModel('Lenovo ThinkPad T14 Gen 4');
      setNewDeviceType('Laptop');
      setNewCpu('AMD Ryzen 7 PRO 7840U (8C/16T)');
      setNewRam('32GB LPDDR5-6400 Soldered');
      setNewStorage('1TB PCIe Gen4 NVMe SSD');
      setNewGpu('AMD Radeon 780M RDNA3');
      setNewMotherboard('Lenovo Mainboard FP8');
      setNewPsu('65W USB-C GaN Charger');
    } else if (type === 'switch') {
      setNewModel('Cisco Catalyst 2960-X 24-Port Gigabit');
      setNewDeviceType('Managed Switch');
      setNewCpu('APM86392 600MHz Dual-Core');
      setNewRam('512MB DRAM');
      setNewStorage('128MB Flash');
      setNewPsu('Internal 100-240V AC 370W PoE+');
      setNewOs('Cisco IOS 15.2(7)E');
    } else if (type === 'server') {
      setNewModel('Dell PowerEdge R730 2U Rack Server');
      setNewDeviceType('Server');
      setNewCpu('2x Intel Xeon E5-2680 v4 (28C/56T Total)');
      setNewRam('128GB DDR4-2400 ECC Registered');
      setNewStorage('8x 1.2TB SAS 10K RAID 10 (PERC H730P)');
      setNewPsu('Dual 750W Hot-Plug Redundant Platinum');
      setNewOs('Proxmox VE / Ubuntu Server');
    } else if (type === 'gear') {
      setNewModel('Rigol DS1054Z 50MHz 4-Channel Digital Storage Oscilloscope');
      setNewDeviceType('Bench Equipment');
      setNewCpu('Rigol Custom DSP Engine');
      setNewRam('24Mpts Deep Memory');
      setNewStorage('Internal Calibration Flash');
      setNewPsu('100-240V AC Bench Line');
    } else if (type === 'custom_rig') {
      setNewModel('Custom Workstation AM5 CAD Rig');
      setNewDeviceType('Custom Rig');
      setNewCpu('AMD Ryzen 9 7900X (12C/24T)');
      setNewRam('64GB DDR5-6000 EXPO (2x32GB)');
      setNewStorage('2TB Samsung 990 Pro Gen4 NVMe');
      setNewGpu('NVIDIA RTX 4070 Ti Super 16GB');
      setNewMotherboard('MSI MAG B650 TOMAHAWK WIFI');
      setNewPsu('Corsair RM850e 850W Gold');
    }
  };

  // Submit Add Asset
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !newModel.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Asset Tag and Model are required.',
      });
      return;
    }

    const cleanTag = newTag.trim().toUpperCase();

    // Check duplicate
    if (hardwareAssets.some((a) => a.assetTag.toLowerCase() === cleanTag.toLowerCase())) {
      addToast({
        type: 'error',
        title: 'Duplicate Asset Tag',
        message: `Asset tag [${cleanTag}] already exists in inventory.`,
      });
      return;
    }

    const newAsset: HardwareAsset = {
      id: cleanTag,
      assetTag: cleanTag,
      serialNumber: newSerial.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      model: newModel.trim(),
      deviceType: newDeviceType,
      assignedBench: newBench,
      department: newDepartment,
      status: newHasProblem ? 'Under Repair' : newStatus,
      isCurrentlyOnHand: newIsOnHand,
      problemLabel: newHasProblem
        ? {
            hasProblem: true,
            problemTitle: newProblemTitle.trim() || 'Intake Hardware Problem Reported',
            problemSeverity: newProblemSeverity,
            problemDescription: newProblemNotes.trim(),
            reportedDate: new Date().toISOString().split('T')[0],
            reportedBy: currentUser?.displayName || 'Technician',
          }
        : {
            hasProblem: false,
          },
      specs: {
        cpu: newCpu.trim() || undefined,
        ram: newRam.trim() || undefined,
        storage: newStorage.trim() || undefined,
        gpu: newGpu.trim() || undefined,
        motherboard: newMotherboard.trim() || undefined,
        psu: newPsu.trim() || undefined,
        os: newOs.trim() || undefined,
      },
      notes: newNotes.trim() || undefined,
      repairHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorUid: currentUser?.id || 'admin',
    };

    await saveHardwareAsset(newAsset);
    setIsAddModalOpen(false);

    // Reset Form
    setNewTag(`AST-PC-${Math.floor(100 + Math.random() * 900)}`);
    setNewModel('');
    setNewSerial('');
    setNewNotes('');
    setNewHasProblem(false);
    setNewProblemTitle('');
    setNewProblemNotes('');

    addToast({
      type: 'success',
      title: 'New Asset Added to Inventory',
      message: `Asset [${cleanTag}] successfully registered and synced to Firestore.`,
    });
  };

  // Open QR Print preview
  const handleOpenQrPrint = async (asset: HardwareAsset) => {
    setQrPrintAsset(asset);
    try {
      const qrPayload = JSON.stringify({
        tag: asset.assetTag,
        model: asset.model,
        sn: asset.serialNumber,
        bench: asset.assignedBench,
        specs: `${asset.specs.cpu || ''} / ${asset.specs.ram || ''}`,
      });
      const url = await generateQrDataUrl(qrPayload, 300);
      setQrDataUrl(url);
    } catch (e) {
      console.error('Failed to generate QR data url:', e);
    }
  };

  // Export full inventory summary
  const handleExportInventory = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      exportedBy: currentUser?.displayName || 'Julian (Admin)',
      totalAssetsCount: hardwareAssets.length,
      onHandCount,
      problemsCount,
      assets: hardwareAssets,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TradeTech_Asset_Inventory_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Inventory Exported',
      message: 'Full asset inventory exported to JSON file.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-lg font-bold text-white font-mono">
                  Asset Inventory & Problem Marker
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Firestore Synced
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Mark what we have currently, label problem hardware, add new assets, and delete decommissioned units.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Asset</span>
            </button>

            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
              title="Open QR scanner camera"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR / Barcode</span>
            </button>

            <button
              onClick={handleExportInventory}
              className="px-3 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              title="Export complete asset inventory"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* 5-Card At-A-Glance Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-[#30363d]">
          {/* 1. Total Assets */}
          <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Total Assets
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-white">{totalAssets}</span>
              <span className="text-[10px] font-mono text-gray-500">Registered</span>
            </div>
          </div>

          {/* 2. Currently Have (On Hand) */}
          <div className="bg-[#0d1117] p-3 rounded-xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
              Currently On Hand
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-300">{onHandCount}</span>
              <span className="text-[10px] font-mono text-gray-400">
                {totalAssets > 0 ? `${Math.round((onHandCount / totalAssets) * 100)}% in lab` : '0%'}
              </span>
            </div>
          </div>

          {/* 3. Has Problem / Needs Repair */}
          <div className="bg-[#0d1117] p-3 rounded-xl border border-red-500/40 relative overflow-hidden">
            {problemsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block font-semibold">
              Marked With Problem
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-red-300">{problemsCount}</span>
              <span className="text-[10px] font-mono text-gray-400">Needs Triage</span>
            </div>
          </div>

          {/* 4. Healthy / In Service */}
          <div className="bg-[#0d1117] p-3 rounded-xl border border-cyan-500/30">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              In Service (Ready)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-cyan-300">{healthyCount}</span>
              <span className="text-[10px] font-mono text-gray-500">100% Functional</span>
            </div>
          </div>

          {/* 5. Spare Stock */}
          <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
              Spare Inventory
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-amber-300">{spareCount}</span>
              <span className="text-[10px] font-mono text-gray-500">On Shelves</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip: Search & Multi-Filters */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tag (AST-PC-101), Model, Serial, Problem, Bench #1, Specs..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Device Type Selector */}
          <div className="flex items-center gap-2">
            <select
              value={filterDeviceType}
              onChange={(e) => setFilterDeviceType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="ALL">All Device Types</option>
              <option value="Desktop Tower">Desktop Tower</option>
              <option value="Laptop">Laptop</option>
              <option value="Managed Switch">Managed Switch</option>
              <option value="Server">Server</option>
              <option value="Bench Equipment">Bench Equipment</option>
              <option value="Custom Rig">Custom Rig</option>
            </select>

            {/* Bench Location Selector */}
            <select
              value={filterBench}
              onChange={(e) => setFilterBench(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="ALL">All Bench Locations</option>
              {BENCH_LOCATIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#21262d] text-cyan-300 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#21262d] text-cyan-300 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Dense Table View"
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {/* Presence Chips */}
          <button
            onClick={() => setFilterPresence('ALL')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
              filterPresence === 'ALL'
                ? 'bg-cyan-600 text-white font-bold border-cyan-500'
                : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
            }`}
          >
            All Presence ({totalAssets})
          </button>
          <button
            onClick={() => setFilterPresence('ON_HAND')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1 ${
              filterPresence === 'ON_HAND'
                ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                : 'bg-[#0d1117] border-[#30363d] text-emerald-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Currently On-Hand ({onHandCount})</span>
          </button>
          <button
            onClick={() => setFilterPresence('OFFSITE')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
              filterPresence === 'OFFSITE'
                ? 'bg-gray-700 text-white font-bold border-gray-600'
                : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
            }`}
          >
            Offsite / Missing ({totalAssets - onHandCount})
          </button>

          <span className="text-gray-600 px-1">|</span>

          {/* Problem Chips */}
          <button
            onClick={() => setFilterProblem('ALL')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
              filterProblem === 'ALL'
                ? 'bg-[#21262d] text-white font-bold border-gray-600'
                : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
            }`}
          >
            All Health
          </button>
          <button
            onClick={() => setFilterProblem('PROBLEMS_ONLY')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1 ${
              filterProblem === 'PROBLEMS_ONLY'
                ? 'bg-red-600 text-white font-bold border-red-500'
                : 'bg-[#0d1117] border-[#30363d] text-red-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Has Problem ({problemsCount})</span>
          </button>
          <button
            onClick={() => setFilterProblem('HEALTHY_ONLY')}
            className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
              filterProblem === 'HEALTHY_ONLY'
                ? 'bg-cyan-600 text-white font-bold border-cyan-500'
                : 'bg-[#0d1117] border-[#30363d] text-cyan-400 hover:text-white'
            }`}
          >
            Healthy / In Service ({healthyCount})
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between font-mono text-xs text-gray-400 px-1">
        <span>
          Showing <span className="text-cyan-400 font-bold">{filteredAssets.length}</span> of {totalAssets} total hardware assets
        </span>
        <span className="text-[11px]">
          1-Click Presence & Problem Labeling Enabled
        </span>
      </div>

      {/* ASSET CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const isOnHand = asset.isCurrentlyOnHand ?? true;
            const hasProblem = !!asset.problemLabel?.hasProblem || asset.status === 'Under Repair';
            const problem = asset.problemLabel;

            return (
              <div
                key={asset.id}
                className={`bg-[#161b22] border rounded-2xl p-4 flex flex-col justify-between transition-all space-y-3 font-mono text-xs shadow-lg relative ${
                  hasProblem
                    ? 'border-red-500/60 ring-1 ring-red-500/40 bg-gradient-to-b from-[#1c1214] to-[#161b22]'
                    : isOnHand
                    ? 'border-[#30363d] hover:border-gray-500'
                    : 'border-gray-800 opacity-60 bg-black/40'
                }`}
              >
                {/* Top Bar: Asset Tag, Presence Toggle, Device Type */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-[#0d1117] border border-[#30363d] text-cyan-400">
                          {asset.assetTag}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-900 border border-gray-800 text-gray-400">
                          {asset.deviceType}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {asset.model}
                      </h4>
                    </div>

                    {/* Actions: QR Print & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenQrPrint(asset)}
                        className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                        title="Print QR code label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmAsset(asset)}
                        className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-red-950/60 border border-[#30363d] text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete asset from inventory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Presence & Location Strip */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#30363d]/60">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400" />
                      <span className="text-gray-300 font-semibold">{asset.assignedBench}</span>
                    </span>

                    {/* ON-HAND PRESENCE TOGGLE BUTTON */}
                    <button
                      onClick={() => handleToggleOnHand(asset)}
                      className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                        isOnHand
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                      title="Click to toggle currently have on-hand vs offsite"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnHand ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                        }`}
                      ></span>
                      <span className="text-[10px] font-bold">
                        {isOnHand ? '✓ We Have Currently' : 'Offsite / Missing'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* PROBLEM LABEL DISPLAY BANNER */}
                {hasProblem && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/50 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>Problem: {problem?.problemTitle || 'Reported Fault'}</span>
                      </span>
                      {problem?.problemSeverity && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            problem.problemSeverity === 'Critical'
                              ? 'bg-red-500 text-black font-extrabold'
                              : 'bg-red-900/80 text-red-200 border border-red-500/40'
                          }`}
                        >
                          {problem.problemSeverity}
                        </span>
                      )}
                    </div>

                    {problem?.problemDescription && (
                      <p className="text-[10px] text-gray-300 leading-tight">
                        {problem.problemDescription}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[9px] text-gray-400">
                      <span>Flagged: {problem?.reportedDate || 'Recently'}</span>
                      <button
                        onClick={() => handleClearProblem(asset)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  </div>
                )}

                {/* Specs Snippet */}
                <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d] space-y-1 text-[11px]">
                  <div className="flex justify-between text-gray-400">
                    <span>Serial:</span>
                    <span className="text-gray-300 font-mono">{asset.serialNumber}</span>
                  </div>
                  {asset.specs.cpu && (
                    <div className="flex justify-between text-gray-400">
                      <span>CPU:</span>
                      <span className="text-gray-200 truncate max-w-[170px]">{asset.specs.cpu}</span>
                    </div>
                  )}
                  {asset.specs.ram && (
                    <div className="flex justify-between text-gray-400">
                      <span>RAM:</span>
                      <span className="text-emerald-400 truncate max-w-[170px]">{asset.specs.ram}</span>
                    </div>
                  )}
                  {asset.specs.storage && (
                    <div className="flex justify-between text-gray-400">
                      <span>Storage:</span>
                      <span className="text-cyan-400 truncate max-w-[170px]">{asset.specs.storage}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Label Problem Button & History/Scanner */}
                <div className="pt-2 border-t border-[#30363d]/80 flex items-center justify-between gap-2">
                  {/* Mark Problem Button */}
                  <button
                    onClick={() => handleOpenProblemModal(asset)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      hasProblem
                        ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/50 text-amber-300'
                        : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-red-400 hover:text-red-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{hasProblem ? 'Edit Problem' : 'Mark Problem'}</span>
                  </button>

                  {/* Open Scanner / Details */}
                  <button
                    onClick={() => {
                      setActiveScannedAsset(asset);
                      setIsScannerModalOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="View full specs and repair history"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DENSE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0d1117] border-b border-[#30363d] text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Model & Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Presence (We Have)</th>
                  <th className="p-3">Problem / Fault Status</th>
                  <th className="p-3">Key Specs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60">
                {filteredAssets.map((asset) => {
                  const isOnHand = asset.isCurrentlyOnHand ?? true;
                  const hasProblem = !!asset.problemLabel?.hasProblem || asset.status === 'Under Repair';

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-[#21262d]/50 transition-colors ${
                        hasProblem ? 'bg-red-950/20' : ''
                      }`}
                    >
                      {/* Tag */}
                      <td className="p-3 font-bold text-cyan-400 whitespace-nowrap">
                        {asset.assetTag}
                      </td>

                      {/* Model & Type */}
                      <td className="p-3">
                        <div className="font-semibold text-white truncate max-w-[200px]">{asset.model}</div>
                        <div className="text-[10px] text-gray-400">{asset.deviceType} • SN: {asset.serialNumber}</div>
                      </td>

                      {/* Location */}
                      <td className="p-3 text-gray-300 whitespace-nowrap">
                        {asset.assignedBench}
                      </td>

                      {/* Presence Toggle */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleOnHand(asset)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                            isOnHand
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-gray-900 border-gray-700 text-gray-500 hover:bg-gray-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isOnHand ? 'bg-emerald-400' : 'bg-gray-600'}`}></span>
                          <span>{isOnHand ? 'On-Hand' : 'Offsite'}</span>
                        </button>
                      </td>

                      {/* Problem Status */}
                      <td className="p-3">
                        {hasProblem ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-300 font-bold text-[10px] truncate max-w-[180px]">
                              ⚠️ {asset.problemLabel?.problemTitle || 'Under Repair'}
                            </span>
                            <button
                              onClick={() => handleClearProblem(asset)}
                              className="text-emerald-400 hover:underline text-[10px]"
                              title="Clear problem"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[10px]">No problem flagged</span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="p-3 text-[10px] text-gray-400 truncate max-w-[200px]">
                        {asset.specs.cpu || 'N/A'} • {asset.specs.ram || ''}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleOpenProblemModal(asset)}
                          className="px-2 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-red-400 text-[11px]"
                          title="Mark or edit problem"
                        >
                          {hasProblem ? 'Edit Prob' : 'Label'}
                        </button>
                        <button
                          onClick={() => handleOpenQrPrint(asset)}
                          className="p-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400"
                          title="Print QR Label"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmAsset(asset)}
                          className="p-1 rounded bg-[#0d1117] hover:bg-red-950 border border-[#30363d] text-gray-500 hover:text-red-400"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ZERO RESULTS EMPTY STATE */}
      {filteredAssets.length === 0 && (
        <div className="bg-[#161b22] border border-dashed border-[#30363d] rounded-2xl p-12 text-center space-y-3 font-mono">
          <Tag className="w-8 h-8 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Matching Hardware Assets</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No assets match &quot;{searchQuery}&quot; or the active presence and health filters.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPresence('ALL');
                setFilterProblem('ALL');
                setFilterDeviceType('ALL');
                setFilterBench('ALL');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-cyan-400 text-xs"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Add New Asset
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW ASSET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 font-mono text-xs my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register New Inventory Asset</h3>
                  <p className="text-[10px] text-gray-400">Add hardware unit with presence status and optional problem label.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="shrink-0 bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d] space-y-1.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Quick Autofill Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('desktop')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-cyan-400 text-[11px]"
                >
                  + Dell OptiPlex Tower
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('laptop')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-purple-400 text-[11px]"
                >
                  + ThinkPad Laptop
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('switch')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-sky-400 text-[11px]"
                >
                  + Cisco Switch
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('server')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-emerald-400 text-[11px]"
                >
                  + PowerEdge Server
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('custom_rig')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 text-[11px]"
                >
                  + Custom AM5 Rig
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('gear')}
                  className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-pink-400 text-[11px]"
                >
                  + Oscilloscope Gear
                </button>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleCreateAsset} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tag */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Asset Tag (Identifier)</label>
                  <input
                    type="text"
                    required
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value.toUpperCase())}
                    placeholder="e.g. AST-PC-105"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Hardware Model Name</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Dell OptiPlex 7090 Micro"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Serial */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="e.g. SN-8841-B9"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Device Type */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Device Classification</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Desktop Tower">Desktop Tower</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Managed Switch">Managed Switch</option>
                    <option value="Server">Server</option>
                    <option value="Bench Equipment">Bench Equipment</option>
                    <option value="Custom Rig">Custom Rig</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Location / Assigned Bench</label>
                  <select
                    value={newBench}
                    onChange={(e) => setNewBench(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                  >
                    {BENCH_LOCATIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Vocational IT Lab"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Physical Presence Switch */}
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Do we currently have this asset on-hand?</span>
                  </span>
                  <p className="text-[10px] text-gray-400">Keep checked if item is physically present in the lab.</p>
                </div>
                <input
                  type="checkbox"
                  checked={newIsOnHand}
                  onChange={(e) => setNewIsOnHand(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Problem Marker Toggle on Intake */}
              <div className="p-3 rounded-xl bg-[#0d1117] border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Does this asset have a known problem / need repair?</span>
                    </span>
                    <p className="text-[10px] text-gray-400">Check to mark/label problem symptoms upon intake.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newHasProblem}
                    onChange={(e) => setNewHasProblem(e.target.checked)}
                    className="w-5 h-5 accent-red-500 cursor-pointer"
                  />
                </div>

                {newHasProblem && (
                  <div className="pt-2 border-t border-red-500/30 space-y-2 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-400 text-[10px] mb-1">Problem Title / Label</label>
                        <input
                          type="text"
                          value={newProblemTitle}
                          onChange={(e) => setNewProblemTitle(e.target.value)}
                          placeholder="e.g. No POST, RAM Failure, Fan Noise..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-red-500/50 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-[10px] mb-1">Severity</label>
                        <select
                          value={newProblemSeverity}
                          onChange={(e) => setNewProblemSeverity(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-red-500/50 text-white"
                        >
                          <option value="Critical">Critical (Inoperable)</option>
                          <option value="Major">Major (Degraded / Crash)</option>
                          <option value="Minor">Minor (Cosmetic / Warning)</option>
                          <option value="Diagnosing">Diagnosing / Testing</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[10px] mb-1">Problem Description & Symptoms</label>
                      <input
                        type="text"
                        value={newProblemNotes}
                        onChange={(e) => setNewProblemNotes(e.target.value)}
                        placeholder="e.g. Fans spin 2 seconds then system power cycles..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-red-500/50 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Hardware Specifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newCpu}
                    onChange={(e) => setNewCpu(e.target.value)}
                    placeholder="CPU (e.g. i7-10700)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                  <input
                    type="text"
                    value={newRam}
                    onChange={(e) => setNewRam(e.target.value)}
                    placeholder="RAM (e.g. 32GB DDR4)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                  <input
                    type="text"
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    placeholder="Storage (e.g. 1TB NVMe)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                  <input
                    type="text"
                    value={newGpu}
                    onChange={(e) => setNewGpu(e.target.value)}
                    placeholder="GPU (e.g. RTX 4070)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                  <input
                    type="text"
                    value={newMotherboard}
                    onChange={(e) => setNewMotherboard(e.target.value)}
                    placeholder="Motherboard"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                  <input
                    type="text"
                    value={newPsu}
                    onChange={(e) => setNewPsu(e.target.value)}
                    placeholder="PSU (e.g. 650W Gold)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md"
                >
                  Save Asset to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROBLEM LABELER MODAL */}
      {problemModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-red-500/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 font-mono text-xs my-auto">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Mark / Label Problem: [{problemModalAsset.assetTag}]
                  </h3>
                  <p className="text-[10px] text-gray-400">{problemModalAsset.model}</p>
                </div>
              </div>
              <button
                onClick={() => setProblemModalAsset(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Common Problem Presets */}
            <div className="space-y-1.5 bg-[#0d1117] p-3 rounded-xl border border-[#30363d]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Quick Problem Category Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {COMMON_PROBLEM_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setProblemTitle(p.label);
                      setProblemSeverity(p.severity);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] border transition-all text-left ${
                      problemTitle === p.label
                        ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Details Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-[11px] mb-1">Problem Label / Fault Title</label>
                <input
                  type="text"
                  required
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g. Memory BSOD / Fans spin but no display output"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-red-500/50 text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-[11px] mb-1">Problem Severity Level</label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['Critical', 'Major', 'Minor', 'Diagnosing'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setProblemSeverity(sev)}
                      className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                        problemSeverity === sev
                          ? sev === 'Critical'
                            ? 'bg-red-600 text-white border-red-400 shadow-md'
                            : sev === 'Major'
                            ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                            : 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-[11px] mb-1">Detailed Diagnostic Symptoms / Notes</label>
                <textarea
                  rows={3}
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                  placeholder="e.g. When power button pressed, power LED blinks 3 amber 2 white. Tested pin 9 with DMM: reads 0.2V."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
              {problemModalAsset.problemLabel?.hasProblem ? (
                <button
                  type="button"
                  onClick={() => handleClearProblem(problemModalAsset)}
                  className="px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold"
                >
                  ✓ Mark Fixed & Log Repair
                </button>
              ) : (
                <span className="text-gray-500 text-[10px]">Asset currently in service</span>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProblemModalAsset(null)}
                  className="px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProblem}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950/40"
                >
                  Save Problem Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161b22] border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Asset from Inventory?</h3>
                <p className="text-[11px] text-gray-400">This action will remove the record from Firestore.</p>
              </div>
            </div>

            <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] space-y-1">
              <div className="text-white font-bold">[{deleteConfirmAsset.assetTag}]</div>
              <div className="text-gray-300">{deleteConfirmAsset.model}</div>
              <div className="text-gray-500 text-[10px]">Location: {deleteConfirmAsset.assignedBench}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAsset(null)}
                className="px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950/50"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: QR CODE PRINT PREVIEW */}
      {qrPrintAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs text-center">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
              <span className="font-bold text-white text-xs">Printable Asset Tag</span>
              <button
                onClick={() => setQrPrintAsset(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Label Card */}
            <div className="bg-white text-black p-4 rounded-xl border-2 border-black space-y-2 shadow-inner">
              <div className="border-b border-black pb-1">
                <span className="font-extrabold text-sm block tracking-wider">TRADETECH VOCATIONAL LAB</span>
                <span className="text-[10px] text-gray-700">HARDWARE ASSET TAG</span>
              </div>

              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={qrPrintAsset.assetTag}
                  className="w-36 h-36 mx-auto border border-gray-300 p-1"
                />
              )}

              <div className="space-y-0.5">
                <div className="font-mono font-black text-base">{qrPrintAsset.assetTag}</div>
                <div className="text-[11px] font-bold truncate">{qrPrintAsset.model}</div>
                <div className="text-[9px] text-gray-600">{qrPrintAsset.assignedBench} • SN: {qrPrintAsset.serialNumber}</div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                onClick={() => setQrPrintAsset(null)}
                className="px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
