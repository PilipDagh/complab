import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  FORENSIC_FILE_SIGNATURES,
  SPI_FLASH_DATABASE,
  HDD_HEAD_FAMILIES,
  SSD_CONTROLLER_DATABASE,
  PARTITION_FORENSIC_SPECS,
  NIST_SANITIZATION_STANDARDS,
  FileSignature,
  SpiFlashChip,
  HddFamilyProfile,
  SsdControllerSpec,
  PartitionTableSpec,
  SanitizationStandard,
} from '../data/forensicDatabase';
import {
  HardDrive,
  Cpu,
  Binary,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
  Zap,
  Key,
  X,
  Volume2,
  VolumeX,
  FileCode,
  Lock,
  Unlock,
  AlertTriangle,
  Terminal,
  Activity,
  Award,
  Printer,
  Compass,
  FileSearch,
  Database,
  Radio,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export type Module5ToolId =
  | 'file_carving'
  | 'spi_bios'
  | 'hdd_geometry'
  | 'ssd_controller'
  | 'partition_surgeon'
  | 'ddrescue_builder'
  | 'entropy_crypto'
  | 'nist_sanitizer';

export const ForensicRecoverySuite: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool
  const [activeTool, setActiveTool] = useState<Module5ToolId>('file_carving');

  // AI Drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // Custom API key modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 5.1 State: File Carving & Hex Signature Forensics
  // -------------------------------------------------------------
  const [selectedSigId, setSelectedSigId] = useState<string>('sig-jpeg');
  const [rawHexInput, setRawHexInput] = useState<string>('FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 48 00 48 00 00 FF DB 00 43');
  const [carveOffset, setCarveOffset] = useState<number>(0);
  const [sigFilter, setSigFilter] = useState<string>('all');
  const [sigSearch, setSigSearch] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 5.2 State: SPI Flash & BIOS/UEFI ROM Hex Analyzer
  // -------------------------------------------------------------
  const [selectedSpiId, setSelectedSpiId] = useState<string>('spi-w25q128');
  const [meRegionStatus, setMeRegionStatus] = useState<'clean' | 'dirty' | 'corrupt' | 'unlocked'>('dirty');
  const [biosVendor, setBiosVendor] = useState<'Intel_CSME' | 'AMD_PSP' | 'Apple_EFI' | 'Insyde_H2O'>('Intel_CSME');
  const [hasSupervisorPassword, setHasSupervisorPassword] = useState<boolean>(true);

  // -------------------------------------------------------------
  // Tool 5.3 State: HDD Head Crash & Platter Geometry
  // -------------------------------------------------------------
  const [selectedHddId, setSelectedHddId] = useState<string>('hdd-seagate-rosewood');
  const [disabledHeads, setDisabledHeads] = useState<number[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOscillatorRef = useRef<OscillatorNode | null>(null);

  // -------------------------------------------------------------
  // Tool 5.4 State: SSD Controller & NAND Flash Reconstructor
  // -------------------------------------------------------------
  const [selectedSsdId, setSelectedSsdId] = useState<string>('ssd-smi-sm2258xt');
  const [safeModeJumperBridged, setSafeModeJumperBridged] = useState<boolean>(false);
  const [nandBlocksExhausted, setNandBlocksExhausted] = useState<number>(94);

  // -------------------------------------------------------------
  // Tool 5.5 State: Partition Table & File System Surgeon
  // -------------------------------------------------------------
  const [selectedPartitionType, setSelectedPartitionType] = useState<'MBR' | 'GPT' | 'NTFS_VBR'>('GPT');
  const [partitionStatus, setPartitionStatus] = useState<'healthy' | 'raw_corrupt' | 'missing_backup' | 'overlapping'>('raw_corrupt');

  // -------------------------------------------------------------
  // Tool 5.6 State: Forensic Bit-Stream Image & ddrescue Builder
  // -------------------------------------------------------------
  const [ddSourceDev, setDdSourceDev] = useState<string>('/dev/sdb');
  const [ddTargetImage, setDdTargetImage] = useState<string>('/mnt/storage/patient_disk.img');
  const [ddMapFile, setDdMapFile] = useState<string>('/mnt/storage/patient_disk.map');
  const [ddBlockSize, setDdBlockSize] = useState<'512' | '4096' | '64k'>('4096');
  const [ddMaxRetries, setDdMaxRetries] = useState<number>(3);
  const [ddDirectIo, setDdDirectIo] = useState<boolean>(true);
  const [ddReversePass, setDdReversePass] = useState<boolean>(false);
  const [ddPhase, setDdPhase] = useState<'phase1_fast' | 'phase2_scrape' | 'phase3_retry'>('phase1_fast');

  // -------------------------------------------------------------
  // Tool 5.7 State: Cryptographic & BitLocker / FileVault Triage
  // -------------------------------------------------------------
  const [bitlockerKeyId, setBitlockerKeyId] = useState<string>('348921-509124-783921-667109-123490-887123');
  const [entropyScore, setEntropyScore] = useState<number>(7.94);
  const [encryptionMethod, setEncryptionMethod] = useState<'AES-XTS-128' | 'AES-CBC-256' | 'FileVault-APFS' | 'LUKS2'>('AES-XTS-128');

  // -------------------------------------------------------------
  // Tool 5.8 State: NIST SP 800-88 Sanitization Certificate
  // -------------------------------------------------------------
  const [certTechName, setCertTechName] = useState<string>('Lead Tech / Lab Specialist');
  const [certAssetTag, setCertAssetTag] = useState<string>('AST-NVME-SAMS-970');
  const [certDriveSerial, setCertDriveSerial] = useState<string>('S467NX0M819201L');
  const [certDriveModel, setCertDriveModel] = useState<string>('Samsung SSD 970 EVO 1TB');
  const [certMethod, setCertMethod] = useState<'Purge_NVMe_Sanitize' | 'Clear_Single_Pass' | 'Destroy_Shred'>('Purge_NVMe_Sanitize');
  const [certSha256, setCertSha256] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [certGeneratedTime, setCertGeneratedTime] = useState<string>('');

  // Stop web audio on unmount
  useEffect(() => {
    return () => {
      stopAcousticAudio();
    };
  }, []);

  const stopAcousticAudio = () => {
    if (audioOscillatorRef.current) {
      try {
        audioOscillatorRef.current.stop();
        audioOscillatorRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      audioOscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playAcousticPattern = (pattern: string) => {
    stopAcousticAudio();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (pattern.includes('Beep')) {
        // High pitched spindle stuck motor beep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1480, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      } else if (pattern.includes('Click')) {
        // Repeated metallic head click
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      } else {
        // Scraping / white noise simulation
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
      }

      audioOscillatorRef.current = osc;
      setIsPlayingAudio(true);

      // Auto stop after 6 seconds to avoid annoyance
      setTimeout(() => {
        stopAcousticAudio();
      }, 6000);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  };

  // Helper to compile diagnostic payload for Gemini AI Copilot
  const getToolDiagnosticPayload = () => {
    switch (activeTool) {
      case 'file_carving': {
        const sig = FORENSIC_FILE_SIGNATURES.find((s) => s.id === selectedSigId);
        return {
          tool: 'File Carving & Magic Signature Forensics',
          signatureSelected: sig?.name,
          category: sig?.category,
          magicBytes: sig?.headerHex,
          terminatingFooter: sig?.footerHex || 'None (Stream or atom bounded)',
          rawHexSample: rawHexInput,
          byteOffset: carveOffset,
          carvingAdvice: sig?.carvingAdvice,
        };
      }
      case 'spi_bios': {
        const spi = SPI_FLASH_DATABASE.find((s) => s.id === selectedSpiId);
        return {
          tool: 'SPI Flash & BIOS/UEFI ROM Hex Analyzer',
          chipPartNumber: spi?.partNumber,
          capacity: spi?.capacityBytes,
          operatingVoltage: spi?.operatingVoltage,
          jumperSafetyWarning: spi?.jumperWarning,
          biosVendor,
          meRegionStatus,
          hasSupervisorPassword,
          flashromCommand: spi?.flashromCmd,
        };
      }
      case 'hdd_geometry': {
        const hdd = HDD_HEAD_FAMILIES.find((h) => h.id === selectedHddId);
        return {
          tool: 'HDD Head Crash, Platter Geometry & Acoustic Triage',
          hddFamily: hdd?.family,
          manufacturer: hdd?.manufacturer,
          formFactor: hdd?.formFactor,
          capacities: hdd?.typicalCapacities,
          disabledHeads,
          acousticFailureProfile: hdd?.acousticProfile,
          donorCriteria: hdd?.donorCriteria,
          recommendedDdrescueFlags: hdd?.safeDdrescueFlags,
        };
      }
      case 'ssd_controller': {
        const ssd = SSD_CONTROLLER_DATABASE.find((s) => s.id === selectedSsdId);
        return {
          tool: 'NVMe/SATA SSD Controller & NAND Flash Reconstructor',
          controllerModel: ssd?.controllerModel,
          vendor: ssd?.vendor,
          interface: ssd?.interface,
          dramStatus: ssd?.dramSupport,
          safeModeJumperBridged,
          nandWearLevelExhaustion: `${nandBlocksExhausted}%`,
          romModeProcedure: ssd?.romModeProcedure,
          panicSymptoms: ssd?.panicSymptoms,
        };
      }
      case 'partition_surgeon': {
        const spec = PARTITION_FORENSIC_SPECS.find((p) => p.type === selectedPartitionType);
        return {
          tool: 'Partition Table & File System Surgeon',
          partitionType: spec?.title,
          lbaLocation: spec?.lbaLocation,
          magicBytes: spec?.magicBytes,
          currentCorruptionStatus: partitionStatus,
          recoveryCommands: spec?.recoveryCommands,
        };
      }
      case 'ddrescue_builder': {
        return {
          tool: 'Forensic Bit-Stream Image & ddrescue Command Builder',
          sourceDevice: ddSourceDev,
          targetImage: ddTargetImage,
          mapFile: ddMapFile,
          blockSize: ddBlockSize,
          maxRetries: ddMaxRetries,
          directIoMode: ddDirectIo,
          reverseReading: ddReversePass,
          rescuePhase: ddPhase,
          fullGeneratedCommand: generateDdrescueCmd(),
        };
      }
      case 'entropy_crypto': {
        return {
          tool: 'Cryptographic & BitLocker / FileVault Triage',
          encryptionStandard: encryptionMethod,
          shannonEntropy: entropyScore,
          interpretation: entropyScore > 7.9 ? 'Strongly Encrypted / High-Compression Container' : 'Plaintext / Sparse Data',
          recoveryKeySpec: bitlockerKeyId,
        };
      }
      case 'nist_sanitizer': {
        return {
          tool: 'Secure Sanitization & NIST SP 800-88 Compliance',
          assetTag: certAssetTag,
          driveSerial: certDriveSerial,
          driveModel: certDriveModel,
          sanitizationLevel: certMethod,
          hashSha256: certSha256,
          auditor: certTechName,
        };
      }
    }
  };

  const handleRunAiAnalysis = async (userPrompt?: string) => {
    setAiLoading(true);
    const payload = getToolDiagnosticPayload();
    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 5: FORENSIC DATA RECOVERY & STORAGE FIRMWARE LAB',
        toolName: activeTool,
        inputPayload: payload,
        userRole: currentUser?.role || 'ROLE_STUDENT',
        customPrompt: userPrompt || aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Forensic Analysis Complete',
        message: 'Cleanroom guidance and triage strategy generated.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: err.message || 'Check API key or server status',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Generate ddrescue command string based on parameters
  const generateDdrescueCmd = () => {
    let flags = [];
    if (ddDirectIo) flags.push('-d');
    flags.push(`-b ${ddBlockSize}`);
    if (ddPhase === 'phase1_fast') {
      flags.push('-n'); // skip splitting bad blocks on first pass
    } else if (ddPhase === 'phase2_scrape') {
      flags.push('-A'); // scrape bad blocks
    } else {
      flags.push(`-r ${ddMaxRetries}`); // deep retry
    }
    if (ddReversePass) flags.push('--reverse');
    flags.push('-v');

    return `ddrescue ${flags.join(' ')} ${ddSourceDev} ${ddTargetImage} ${ddMapFile}`;
  };

  const filteredSignatures = FORENSIC_FILE_SIGNATURES.filter((s) => {
    const matchesCat = sigFilter === 'all' || s.category === sigFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(sigSearch.toLowerCase()) ||
      s.extension.toLowerCase().includes(sigSearch.toLowerCase()) ||
      s.headerHex.toLowerCase().includes(sigSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedSignature = FORENSIC_FILE_SIGNATURES.find((s) => s.id === selectedSigId) || FORENSIC_FILE_SIGNATURES[0];
  const selectedSpi = SPI_FLASH_DATABASE.find((s) => s.id === selectedSpiId) || SPI_FLASH_DATABASE[0];
  const selectedHdd = HDD_HEAD_FAMILIES.find((h) => h.id === selectedHddId) || HDD_HEAD_FAMILIES[0];
  const selectedSsd = SSD_CONTROLLER_DATABASE.find((s) => s.id === selectedSsdId) || SSD_CONTROLLER_DATABASE[0];
  const selectedPartition = PARTITION_FORENSIC_SPECS.find((p) => p.type === selectedPartitionType) || PARTITION_FORENSIC_SPECS[0];

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-teal-400 font-bold">Module 05</span>
            <span className="text-gray-600">/</span>
            <span>Forensic Data Recovery & Storage Firmware Lab</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-teal-400" />
            Forensic Data Recovery, Storage Reconditioning & Firmware Lab
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Bitstream imaging, SPI BIOS hex analysis, HDD head/platter geometry, SSD controller recovery, and NIST SP 800-88 media sanitization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-gray-700 text-xs text-gray-300 transition-colors font-mono"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            API Key
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              isAiDrawerOpen
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-[#161b22] border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            AI Copilot Drawer {isAiDrawerOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* 8-Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { id: 'file_carving', label: 'File Carving & Hex', icon: Binary },
          { id: 'spi_bios', label: 'SPI Flash & BIOS', icon: Cpu },
          { id: 'hdd_geometry', label: 'HDD Head Map', icon: HardDrive },
          { id: 'ssd_controller', label: 'SSD Controller', icon: Activity },
          { id: 'partition_surgeon', label: 'Partition Surgeon', icon: Layers },
          { id: 'ddrescue_builder', label: 'ddrescue Builder', icon: Terminal },
          { id: 'entropy_crypto', label: 'Crypto & Entropy', icon: Lock },
          { id: 'nist_sanitizer', label: 'NIST Sanitizer', icon: Award },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as Module5ToolId)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-emerald-950/40 border-emerald-400/60 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-[#111827] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="text-xs font-mono font-semibold leading-tight">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Work Area & AI Co-Pilot Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tool Work Area (8 cols when AI open, 12 cols when closed) */}
        <div className={`space-y-6 ${isAiDrawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {/* ========================================================= */}
          {/* TOOL 5.1: File Carving & Hex Signature Forensics */}
          {/* ========================================================= */}
          {activeTool === 'file_carving' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <Binary className="w-5 h-5 text-emerald-400" />
                    File Carving & Magic Signature Forensics Analyzer
                  </h3>
                  <p className="text-xs text-gray-400">
                    Extract intact documents, databases, and media from raw bitstream dumps and unallocated clusters.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-400">Category:</span>
                  <select
                    value={sigFilter}
                    onChange={(e) => setSigFilter(e.target.value)}
                    className="bg-[#1e293b] border border-gray-700 text-xs text-gray-200 rounded px-2 py-1 font-mono"
                  >
                    <option value="all">All File Formats</option>
                    <option value="image">Raster & Vector Images</option>
                    <option value="document">PDF & Office Docs</option>
                    <option value="archive">Archives & Compression</option>
                    <option value="database">Databases & Captures</option>
                    <option value="audio_video">Audio / Video Streams</option>
                    <option value="executable">Binaries (PE/ELF)</option>
                    <option value="filesystem">Encrypted Containers</option>
                  </select>
                </div>
              </div>

              {/* Signature Catalog Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">Select Magic Signature Profile ({filteredSignatures.length} formats):</span>
                  <input
                    type="text"
                    placeholder="Search format (e.g. PDF, SQLite)..."
                    value={sigSearch}
                    onChange={(e) => setSigSearch(e.target.value)}
                    className="bg-[#1e293b] border border-gray-700 rounded px-2 py-1 text-xs text-white font-mono w-48"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredSignatures.map((sig) => (
                    <button
                      key={sig.id}
                      onClick={() => setSelectedSigId(sig.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedSigId === sig.id
                          ? 'bg-emerald-950/50 border-emerald-500/70 text-white font-semibold'
                          : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-mono text-emerald-400 text-[11px]">{sig.extension}</div>
                      <div className="truncate text-gray-200">{sig.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Signature Detail Card */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{selectedSignature.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedSignature.category.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    False Positive Risk: <span className="text-amber-400">{selectedSignature.falsePositiveRate}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">Header Magic Bytes (Hex):</span>
                    <div className="p-2 rounded bg-black/60 border border-emerald-500/40 text-emerald-400 font-bold select-all">
                      {selectedSignature.headerHex}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Footer Terminating Bytes:</span>
                    <div className="p-2 rounded bg-black/60 border border-gray-700 text-cyan-400 font-bold select-all">
                      {selectedSignature.footerHex || 'None (Container Length in Header)'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded border border-gray-800">
                  <span className="text-emerald-400 font-semibold block mb-1">🔬 Carving Strategy:</span>
                  {selectedSignature.carvingAdvice}
                </div>
              </div>

              {/* Live Hex Stream Inspector Sandbox */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-300 flex items-center justify-between">
                  <span>Raw Hex Stream Inspector (Paste Hex Dump from FTK Imager / WinHex / xxd):</span>
                  <button
                    onClick={() => setRawHexInput('FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 48 00 48 00 00 FF DB 00 43')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Reset JPEG Sample
                  </button>
                </label>
                <textarea
                  value={rawHexInput}
                  onChange={(e) => setRawHexInput(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-gray-700 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Automated Carving Command Generator */}
              <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-lg space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Linux dd & Foremost Carving Command:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`foremost -t ${selectedSignature.extension.replace('.', '')} -i patient.dd -o /recovery/output`);
                      addToast({
                        type: 'success',
                        title: 'Copied to Clipboard',
                        message: 'Foremost extraction command copied.',
                      });
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <div className="p-2 bg-black rounded text-cyan-400 select-all overflow-x-auto">
                  foremost -t {selectedSignature.extension.replace('.', '').replace('/', '').trim()} -i /dev/sdb -o /recovery/carved_output
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.2: SPI Flash & BIOS/UEFI ROM Hex Analyzer */}
          {/* ========================================================= */}
          {activeTool === 'spi_bios' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  SPI Flash & BIOS/UEFI ROM Hex Analyzer
                </h3>
                <p className="text-xs text-gray-400">
                  Clean Intel ME/CSME regions, remove BIOS supervisor passwords, and verify CH341A 1.8V vs 3.3V jumper safety.
                </p>
              </div>

              {/* SPI Chip Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {SPI_FLASH_DATABASE.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedSpiId(chip.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedSpiId === chip.id
                        ? 'bg-cyan-950/50 border-cyan-400/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-200">{chip.partNumber.split(' ')[0]}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          chip.operatingVoltage === '1.8V'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {chip.operatingVoltage}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">{chip.capacityBytes} ({chip.manufacturer})</div>
                  </button>
                ))}
              </div>

              {/* Selected SPI Specification Card */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-2">
                  <span className="text-sm font-bold text-white">{selectedSpi.partNumber} ({selectedSpi.capacityBytes})</span>
                  <span className="text-gray-400">Packages: {selectedSpi.packageTypes.join(', ')}</span>
                </div>

                {/* Voltage Hazard Warning Banner */}
                {selectedSpi.operatingVoltage === '1.8V' ? (
                  <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">CRITICAL 1.8V LOGIC LEVEL HAZARD:</strong>
                      {selectedSpi.jumperWarning}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Standard 3.3V Rail:</strong>
                      {selectedSpi.jumperWarning}
                    </div>
                  </div>
                )}

                {/* Common Motherboards */}
                <div className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Verified Motherboards:</span> {selectedSpi.commonBoards}
                </div>

                {/* Flashrom Linux CLI Command */}
                <div>
                  <span className="text-gray-400 block mb-1">Direct Hardware Flashrom Command:</span>
                  <div className="p-2 bg-black rounded border border-gray-700 text-cyan-400 select-all overflow-x-auto">
                    {selectedSpi.flashromCmd}
                  </div>
                </div>
              </div>

              {/* Intel ME Region & Supervisor Password Triage */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Intel ME Region Health & Security Unlock Simulator
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-gray-400 block mb-1">Architecture / Capsule:</label>
                    <select
                      value={biosVendor}
                      onChange={(e: any) => setBiosVendor(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                    >
                      <option value="Intel_CSME">Intel CSME / ME 11/12/15</option>
                      <option value="AMD_PSP">AMD PSP / AGESA SPI</option>
                      <option value="Apple_EFI">Apple T2 / Intel EFI ROM</option>
                      <option value="Insyde_H2O">Insyde H2O Capsule</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Intel ME Status:</label>
                    <select
                      value={meRegionStatus}
                      onChange={(e: any) => setMeRegionStatus(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                    >
                      <option value="dirty">Dirty ME (Causes 30-min shutdown / fan 100%)</option>
                      <option value="clean">Clean Repositories Injected (Initialized)</option>
                      <option value="corrupt">Corrupt Descriptor (No POST / Boot Loop)</option>
                      <option value="unlocked">Service Mode Jumper Unlocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Supervisor Password State:</label>
                    <button
                      onClick={() => setHasSupervisorPassword(!hasSupervisorPassword)}
                      className={`w-full p-2 rounded border font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                        hasSupervisorPassword
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      }`}
                    >
                      {hasSupervisorPassword ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      {hasSupervisorPassword ? 'Password Locked (EEPROM)' : 'Cleared / Blank'}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-900/60 rounded border border-gray-800 text-xs text-gray-300 font-mono">
                  {meRegionStatus === 'dirty' && (
                    <div className="text-amber-300">
                      ⚠️ <strong>Dirty ME Warning:</strong> Replacing a motherboard or PCH without cleaning ME region causes CPU thermal trip shutdown at exactly 30 minutes and disables PCIe x16 link training. Request Gemini AI Clean ME script to inject pristine RGN stock repositories.
                    </div>
                  )}
                  {meRegionStatus === 'clean' && (
                    <div className="text-emerald-300">
                      ✅ <strong>Clean ME Configured:</strong> System will auto-configure unique PCH hardware keys on first boot without premature shutdown loops.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.3: HDD Head Crash & Platter Geometry */}
          {/* ========================================================= */}
          {activeTool === 'hdd_geometry' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                    HDD Head Crash, Platter Geometry & Acoustic Triage
                  </h3>
                  <p className="text-xs text-gray-400">
                    Selective head imaging map, cleanroom head-comb donor matching, and acoustic failure pattern synthesizer.
                  </p>
                </div>

                {/* Acoustic Failure Audio Player */}
                <button
                  onClick={() => {
                    if (isPlayingAudio) {
                      stopAcousticAudio();
                    } else {
                      playAcousticPattern(selectedHdd.acousticProfile);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    isPlayingAudio
                      ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                      : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isPlayingAudio ? 'Stop Acoustic Audio' : `Play ${selectedHdd.acousticProfile}`}
                </button>
              </div>

              {/* HDD Family Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {HDD_HEAD_FAMILIES.map((hdd) => (
                  <button
                    key={hdd.id}
                    onClick={() => {
                      setSelectedHddId(hdd.id);
                      setDisabledHeads([]);
                    }}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedHddId === hdd.id
                        ? 'bg-emerald-950/50 border-emerald-500/70 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-[11px] text-emerald-400 font-bold">{hdd.manufacturer} ({hdd.formFactor})</div>
                    <div className="font-bold text-gray-200 truncate">{hdd.family.split('(')[0]}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{hdd.typicalCapacities}</div>
                  </button>
                ))}
              </div>

              {/* Interactive Platter & Head Visualization */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                  <span className="text-white font-bold">
                    Physical Head Assembly ({selectedHdd.headCountMax} Heads / {selectedHdd.platterCountMax} Platters)
                  </span>
                  <span className="text-gray-400">
                    Click head to isolate/disable damaged slider from ddrescue pass:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: selectedHdd.headCountMax }).map((_, idx) => {
                    const isDisabled = disabledHeads.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isDisabled) {
                            setDisabledHeads(disabledHeads.filter((h) => h !== idx));
                          } else {
                            setDisabledHeads([...disabledHeads, idx]);
                          }
                        }}
                        className={`p-3 rounded-lg border text-center font-mono text-xs transition-all ${
                          isDisabled
                            ? 'bg-red-950/50 border-red-500/70 text-red-300'
                            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                        }`}
                      >
                        <div className="font-bold text-sm">HEAD {idx}</div>
                        <div className="text-[10px] mt-1">
                          {isDisabled ? '❌ DISABLED / SCRAPED' : '✅ HEALTHY / ACTIVE'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Donor Drive Criteria Card */}
                <div className="p-3 bg-gray-900/80 rounded border border-gray-800 text-xs font-mono space-y-2">
                  <div className="text-cyan-400 font-bold flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Cleanroom Donor Drive Matching Matrix:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {selectedHdd.donorCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.4: NVMe/SATA SSD Controller & NAND Flash Reconstructor */}
          {/* ========================================================= */}
          {activeTool === 'ssd_controller' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  NVMe/SATA SSD Controller & NAND Flash Reconstructor
                </h3>
                <p className="text-xs text-gray-400">
                  Resolve SATAFIRM S11, 0MB controller panic locks, and map ROM mode hardware jumper pads.
                </p>
              </div>

              {/* SSD Controller Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {SSD_CONTROLLER_DATABASE.map((ssd) => (
                  <button
                    key={ssd.id}
                    onClick={() => setSelectedSsdId(ssd.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedSsdId === ssd.id
                        ? 'bg-cyan-950/50 border-cyan-400/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-[11px] text-cyan-400 font-bold">{ssd.vendor} ({ssd.interface})</div>
                    <div className="font-bold text-gray-200 truncate">{ssd.controllerModel}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{ssd.dramSupport}</div>
                  </button>
                ))}
              </div>

              {/* Selected Controller Specification */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-2">
                  <span className="text-sm font-bold text-white">{selectedSsd.controllerModel}</span>
                  <span className="text-gray-400">Channels: {selectedSsd.channels} | {selectedSsd.dramSupport}</span>
                </div>

                {/* Common Drives */}
                <div className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Common Drives:</span> {selectedSsd.commonDrives.join(', ')}
                </div>

                {/* Panic Symptoms */}
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded text-amber-300">
                  <strong className="block mb-0.5">⚠️ Controller Panic Symptoms:</strong>
                  {selectedSsd.panicSymptoms}
                </div>

                {/* ROM Mode Shorting Procedure */}
                <div className="p-3 bg-gray-900 rounded border border-gray-700 text-gray-200">
                  <strong className="text-emerald-400 block mb-1">🔌 Hardware ROM Mode / Safe Mode Procedure:</strong>
                  {selectedSsd.romModeProcedure}
                </div>
              </div>

              {/* Interactive NAND Wear & Jumper Simulator */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4">
                <h4 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  NAND Wear Leveling & Safe Mode Controller Simulation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-gray-300 block mb-1">
                      NAND Reserve Block Exhaustion: <span className="text-red-400 font-bold">{nandBlocksExhausted}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nandBlocksExhausted}
                      onChange={(e) => setNandBlocksExhausted(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <span className="text-[10px] text-gray-500">
                      Over 90% triggers read-only lockup to prevent silent data corruption.
                    </span>
                  </div>

                  <div>
                    <label className="text-gray-300 block mb-1">Safe Mode Test Point Jumper:</label>
                    <button
                      onClick={() => setSafeModeJumperBridged(!safeModeJumperBridged)}
                      className={`w-full p-2.5 rounded border font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                        safeModeJumperBridged
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {safeModeJumperBridged ? '⚡ TEST POINTS BRIDGED (ROM MODE ACTIVE)' : '⚪ OPEN CIRCUIT (NORMAL BOOT)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.5: Partition Table & File System Surgeon */}
          {/* ========================================================= */}
          {activeTool === 'partition_surgeon' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Partition Table & File System Forensic Surgeon
                </h3>
                <p className="text-xs text-gray-400">
                  Rebuild MBR LBA 0, GPT headers, NTFS $MFT records, and repair "RAW Partition" file systems.
                </p>
              </div>

              {/* Partition Structure Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PARTITION_FORENSIC_SPECS.map((spec) => (
                  <button
                    key={spec.type}
                    onClick={() => setSelectedPartitionType(spec.type as any)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedPartitionType === spec.type
                        ? 'bg-emerald-950/50 border-emerald-500/70 text-white font-bold'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-emerald-400">{spec.type}</div>
                    <div className="truncate text-gray-200 mt-1">{spec.title.split('(')[0]}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{spec.lbaLocation}</div>
                  </button>
                ))}
              </div>

              {/* Selected Partition Layout Breakdown */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-white font-bold text-sm">{selectedPartition.title}</span>
                  <span className="text-emerald-400 select-all font-bold">Magic: {selectedPartition.magicBytes}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 block mb-1">Key Structural Offsets:</span>
                  <div className="divide-y divide-gray-800 rounded bg-black/50 border border-gray-800 overflow-hidden">
                    {selectedPartition.keyFields.map((field, idx) => (
                      <div key={idx} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                        <span className="text-cyan-400 font-bold sm:w-36">{field.offset}</span>
                        <span className="text-gray-400 sm:w-24">{field.size}</span>
                        <span className="text-gray-200 flex-1">{field.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forensic CLI Commands */}
                <div className="space-y-1">
                  <span className="text-gray-400 block mb-1">Emergency Forensic CLI Restoration Commands:</span>
                  {selectedPartition.recoveryCommands.map((cmd, idx) => (
                    <div key={idx} className="p-2 bg-black rounded text-cyan-400 text-xs select-all flex items-center justify-between">
                      <code>{cmd}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cmd.split('(')[0].trim());
                          addToast({
                            type: 'success',
                            title: 'Copied',
                            message: 'Command copied to clipboard',
                          });
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.6: Forensic Bit-Stream Image & ddrescue Builder */}
          {/* ========================================================= */}
          {activeTool === 'ddrescue_builder' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  Forensic Bit-Stream Image & ddrescue Command Builder
                </h3>
                <p className="text-xs text-gray-400">
                  Build multi-pass GNU ddrescue commands with persistent mapfiles, direct I/O, and reverse head reading.
                </p>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-gray-300 block mb-1">Source Device / Patient Drive:</label>
                  <input
                    type="text"
                    value={ddSourceDev}
                    onChange={(e) => setDdSourceDev(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Target Raw Image Destination:</label>
                  <input
                    type="text"
                    value={ddTargetImage}
                    onChange={(e) => setDdTargetImage(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-1">Persistent Mapfile / Log Path:</label>
                  <input
                    type="text"
                    value={ddMapFile}
                    onChange={(e) => setDdMapFile(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-amber-400"
                  />
                </div>
              </div>

              {/* Passes and Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="text-gray-400 block mb-1">Imaging Phase:</label>
                  <select
                    value={ddPhase}
                    onChange={(e: any) => setDdPhase(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="phase1_fast">Phase 1: Fast Copy (Skip Bad Blocks -n)</option>
                    <option value="phase2_scrape">Phase 2: Scrape Bad Blocks (-A)</option>
                    <option value="phase3_retry">Phase 3: Deep Retry Bad Sectors (-r 3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Sector Block Size:</label>
                  <select
                    value={ddBlockSize}
                    onChange={(e: any) => setDdBlockSize(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="4096">4096 Bytes (4KB Advanced Format)</option>
                    <option value="512">512 Bytes (Legacy Emulation)</option>
                    <option value="64k">64 KB (Fast Streaming for Large NVMe)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Flags & Direct Hardware I/O:</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setDdDirectIo(!ddDirectIo)}
                      className={`flex-1 p-2 rounded border text-[11px] font-bold ${
                        ddDirectIo ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {ddDirectIo ? 'Direct I/O (-d) ON' : 'OS Cache (-d) OFF'}
                    </button>
                    <button
                      onClick={() => setDdReversePass(!ddReversePass)}
                      className={`flex-1 p-2 rounded border text-[11px] font-bold ${
                        ddReversePass ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {ddReversePass ? 'Reverse ON' : 'Forward Pass'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Command Preview Output */}
              <div className="p-4 bg-black rounded-lg border border-gray-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Executable Shell Command:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateDdrescueCmd());
                      addToast({
                        type: 'success',
                        title: 'Command Copied',
                        message: 'ddrescue command copied to clipboard',
                      });
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Command
                  </button>
                </div>
                <div className="p-3 bg-gray-950 rounded text-emerald-400 text-sm select-all overflow-x-auto">
                  {generateDdrescueCmd()}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.7: Cryptographic & BitLocker / FileVault Triage */}
          {/* ========================================================= */}
          {activeTool === 'entropy_crypto' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Cryptographic & BitLocker / FileVault Recovery Triage
                </h3>
                <p className="text-xs text-gray-400">
                  Analyze Shannon byte entropy (0.0 - 8.0) and verify BitLocker 48-digit numerical recovery key formats.
                </p>
              </div>

              {/* Shannon Entropy Visualizer */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Shannon Byte Entropy Score:</span>
                  <span
                    className={`text-sm font-bold ${
                      entropyScore > 7.9 ? 'text-red-400' : entropyScore > 5.0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {entropyScore.toFixed(2)} / 8.00 bits/byte
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={800}
                  value={Math.round(entropyScore * 100)}
                  onChange={(e) => setEntropyScore(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-500"
                />

                <div className="p-3 bg-black/60 rounded border border-gray-800 text-gray-300">
                  {entropyScore > 7.9 ? (
                    <span className="text-red-400 font-semibold">
                      🔒 Extremely High Entropy ({entropyScore}): Indicates military-grade AES encryption (BitLocker / FileVault / VeraCrypt) or compressed payload (ZIP/7z). Direct carving without keys will yield zero salvageable data.
                    </span>
                  ) : entropyScore > 4.5 ? (
                    <span className="text-amber-400 font-semibold">
                      📝 Medium Entropy ({entropyScore}): Mixed binary executables, compiled code, or structured databases.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      📄 Low Entropy ({entropyScore}): Plain ASCII/UTF-8 text, zero-padded unallocated sectors, or raw uncompressed BMP graphics.
                    </span>
                  )}
                </div>
              </div>

              {/* BitLocker 48-digit Recovery Key Formatter */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <label className="text-gray-300 block">BitLocker 48-Digit Numerical Recovery Key Format:</label>
                <input
                  type="text"
                  value={bitlockerKeyId}
                  onChange={(e) => setBitlockerKeyId(e.target.value)}
                  className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-cyan-400 font-bold"
                />

                {/* Dislocker Linux Unlock Command */}
                <div>
                  <span className="text-gray-400 block mb-1">Linux Dislocker Mounting Syntax:</span>
                  <div className="p-2 bg-black rounded text-cyan-400 select-all overflow-x-auto">
                    dislocker -r -V /dev/sdb1 -p{bitlockerKeyId.replace(/-/g, '')} -- /mnt/bitlocker_volume
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 5.8: Secure Sanitization & NIST SP 800-88 Suite */}
          {/* ========================================================= */}
          {activeTool === 'nist_sanitizer' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Secure Sanitization & NIST SP 800-88 / DoD Compliance Suite
                </h3>
                <p className="text-xs text-gray-400">
                  Generate cryptographic sanitization certificates with SHA-256 signatures for enterprise device disposal.
                </p>
              </div>

              {/* NIST Standards Reference Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-gray-400">NIST SP 800-88 Rev. 1 Sanitization Methods:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {NIST_SANITIZATION_STANDARDS.slice(0, 3).map((std) => (
                    <div key={std.level} className="p-3 bg-[#161b22] border border-gray-800 rounded-lg font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{std.level}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                          NIST 800-88
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{std.ssdNvmeRequirement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Input Generator Form */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold text-white">Generate Bench Sanitization Certificate:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Asset Tag:</label>
                    <input
                      type="text"
                      value={certAssetTag}
                      onChange={(e) => setCertAssetTag(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Drive Serial Number:</label>
                    <input
                      type="text"
                      value={certDriveSerial}
                      onChange={(e) => setCertDriveSerial(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Drive Model:</label>
                    <input
                      type="text"
                      value={certDriveModel}
                      onChange={(e) => setCertDriveModel(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Sanitization Method:</span>
                  <select
                    value={certMethod}
                    onChange={(e: any) => setCertMethod(e.target.value)}
                    className="bg-[#1e293b] border border-gray-700 text-xs text-white rounded px-2 py-1"
                  >
                    <option value="Purge_NVMe_Sanitize">NIST 800-88 Purge (NVMe Sanitize / Crypto Erase)</option>
                    <option value="Clear_Single_Pass">NIST 800-88 Clear (Single Pass 0x00 Overwrite)</option>
                    <option value="Destroy_Shred">NIST 800-88 Destroy (Physical Shredding &lt; 2mm)</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const time = new Date().toISOString();
                    setCertGeneratedTime(time);
                    addToast({
                      type: 'success',
                      title: 'Certificate Signed',
                      message: 'NIST SP 800-88 Sanitization certificate generated.',
                    });
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Sign & Issue NIST SP 800-88 Sanitization Certificate
                </button>
              </div>

              {/* Issued Certificate Preview Card */}
              {certGeneratedTime && (
                <div className="p-5 rounded-lg bg-black/80 border border-emerald-500/60 font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-emerald-400 font-bold text-sm">
                      CERTIFICATE OF MEDIA SANITIZATION (NIST SP 800-88 REV. 1)
                    </span>
                    <span className="text-gray-500 text-[10px]">{certGeneratedTime}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div><strong>Asset Tag:</strong> {certAssetTag}</div>
                    <div><strong>Drive Model:</strong> {certDriveModel}</div>
                    <div><strong>Serial Number:</strong> {certDriveSerial}</div>
                    <div><strong>Method:</strong> {certMethod}</div>
                    <div className="col-span-2 text-emerald-400 font-mono break-all text-[11px]">
                      <strong>Verification SHA-256:</strong> {certSha256}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Dedicated Gemini AI Forensic Copilot Drawer */}
        {isAiDrawerOpen && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold font-mono text-white">Gemini Forensic Copilot</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Cleanroom AI
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Live AI assistant receiving active tool parameters, hex values, and cleanroom geometries to provide deep forensic triage.
              </p>

              {/* Action Trigger Button */}
              <button
                onClick={() => handleRunAiAnalysis()}
                disabled={aiLoading}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
              >
                {aiLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Analyzing Recovery Parameters...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze {activeTool.replace('_', ' ').toUpperCase()} with Gemini
                  </>
                )}
              </button>

              {/* Custom Prompt Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400">Custom Forensic Question (Optional):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. How to bypass locked Rosewood terminal?"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunAiAnalysis();
                    }}
                    className="flex-1 bg-[#1e293b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleRunAiAnalysis()}
                    disabled={aiLoading}
                    className="p-1.5 bg-[#1e293b] hover:bg-gray-700 border border-gray-600 rounded text-emerald-400"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Analysis Response Card */}
              {aiResponse ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {aiResponse.modelUsed}
                    </span>
                    <span>{aiResponse.timestamp}</span>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-gray-800 rounded-lg text-xs text-gray-200 font-mono leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap">
                    {aiResponse.analysis}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#161b22]/50 border border-gray-800 rounded-lg text-center text-xs text-gray-500 font-mono">
                  Ready to query cleanroom data recovery and firmware repair models.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                Gemini API Key Configuration
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Your API key is saved locally in your browser's localStorage for direct client-side requests.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-2.5 text-xs text-white font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStoredGeminiApiKey(customApiKey.trim());
                  setIsKeyModalOpen(false);
                  addToast({
                    type: 'success',
                    title: 'Key Saved',
                    message: 'Custom Gemini API Key stored in localStorage.',
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
