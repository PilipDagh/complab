import React, { useState, useEffect } from 'react';
import {
  ComLabWorkstation,
  ComLabStatusLevel,
  ComLabPowerState,
} from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Power,
  Cpu,
  HardDrive,
  Monitor,
  Activity,
  Save,
  Clock,
  Radio,
  FileText,
  UserCheck,
  ZapOff,
  Zap,
  Server,
  Layers,
  Wrench,
  Check,
  Shield,
  Wifi,
  Fan,
} from 'lucide-react';

interface WorkstationStatusModalProps {
  workstation: ComLabWorkstation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkstationStatusModal: React.FC<WorkstationStatusModalProps> = ({
  workstation,
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    isOwner,
    isWorker,
    updateComLabWorkstationStatus,
    simulateTelemetryHeartbeat,
    openAuthModal,
    addToast,
  } = useApp();

  const canEdit =
    isOwner ||
    isWorker ||
    currentUser?.role === 'ROLE_OWNER' ||
    currentUser?.role === 'ROLE_WORKER';

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [statusLevel, setStatusLevel] = useState<ComLabStatusLevel>('unconfigured');
  const [powerState, setPowerState] = useState<ComLabPowerState>('standby');
  const [ethernetConnected, setEthernetConnected] = useState(true);
  const [hasParts, setHasParts] = useState(true);

  // Component Checklist toggles
  const [compMotherboard, setCompMotherboard] = useState(true);
  const [compCpu, setCompCpu] = useState(true);
  const [compRam, setCompRam] = useState(true);
  const [compStorage, setCompStorage] = useState(true);
  const [compGpu, setCompGpu] = useState(true);
  const [compPowerSupply, setCompPowerSupply] = useState(true);
  const [compCpuCooler, setCompCpuCooler] = useState(true);

  // Detailed Component Specs
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [gpu, setGpu] = useState('');
  const [motherboard, setMotherboard] = useState('');
  const [powerSupply, setPowerSupply] = useState('');
  const [cpuCooler, setCpuCooler] = useState('');
  const [display, setDisplay] = useState('');
  const [missingPartsDesc, setMissingPartsDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal state when workstation changes
  useEffect(() => {
    if (workstation) {
      setStatusLevel(workstation.statusLevel);
      setPowerState(workstation.powerState);
      setEthernetConnected(workstation.ethernetConnected ?? true);

      const partsPresent = workstation.components?.hasParts ?? true;
      setHasParts(partsPresent);

      // If parts are absent (like C4 zero parts), uncheck components
      setCompMotherboard(partsPresent && !!workstation.components?.motherboard && !workstation.components?.motherboard.includes('MISSING'));
      setCompCpu(partsPresent && !!workstation.components?.cpu && !workstation.components?.cpu.includes('MISSING'));
      setCompRam(partsPresent && !!workstation.components?.ram && !workstation.components?.ram.includes('MISSING'));
      setCompStorage(partsPresent && !!workstation.components?.storage && !workstation.components?.storage.includes('MISSING'));
      setCompGpu(partsPresent && !!workstation.components?.gpu && !workstation.components?.gpu.includes('MISSING'));
      setCompPowerSupply(partsPresent && !!workstation.components?.powerSupply && !workstation.components?.powerSupply.includes('MISSING'));
      setCompCpuCooler(partsPresent && !!workstation.components?.cpuCooler && !workstation.components?.cpuCooler.includes('MISSING'));

      setCpu(workstation.components?.cpu || '');
      setRam(workstation.components?.ram || '');
      setStorage(workstation.components?.storage || '');
      setGpu(workstation.components?.gpu || '');
      setMotherboard(workstation.components?.motherboard || '');
      setPowerSupply(workstation.components?.powerSupply || '');
      setCpuCooler(workstation.components?.cpuCooler || 'Stock Air Cooler');
      setDisplay(workstation.components?.display || '');
      setMissingPartsDesc(workstation.components?.missingPartsDescription || '');
      setNotes(workstation.notes || '');
      setIssueDescription(workstation.issueDescription || '');

      // Open directly in edit mode if blank/unconfigured
      setIsEditing(!workstation.isConfigured);
    }
  }, [workstation]);

  if (!isOpen || !workstation) return null;

  // Toggle Zero Parts mode
  const handleToggleZeroParts = (zeroParts: boolean) => {
    if (zeroParts) {
      setHasParts(false);
      setCompMotherboard(false);
      setCompCpu(false);
      setCompRam(false);
      setCompStorage(false);
      setCompGpu(false);
      setCompPowerSupply(false);
      setCompCpuCooler(false);
      setStatusLevel('red');
      setMissingPartsDesc('Case stripped down to bare chassis — ZERO parts inside.');
      setIssueDescription('ZERO PARTS INSIDE CHASSIS');
    } else {
      setHasParts(true);
      setCompMotherboard(true);
      setCompCpu(true);
      setCompRam(true);
      setCompStorage(true);
      setCompGpu(true);
      setCompPowerSupply(true);
      setCompCpuCooler(true);
      setStatusLevel('green');
      setMissingPartsDesc('');
      if (issueDescription === 'ZERO PARTS INSIDE CHASSIS') {
        setIssueDescription('');
      }
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      addToast({
        type: 'error',
        title: 'Julian / Owner Profile Required',
        message: 'Only Julian (Owner) or lab technician profiles can modify workstation status.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const anyParts =
        compMotherboard ||
        compCpu ||
        compRam ||
        compStorage ||
        compGpu ||
        compPowerSupply ||
        compCpuCooler;

      await updateComLabWorkstationStatus(workstation.id, {
        statusLevel,
        powerState,
        ethernetConnected,
        isConfigured: true,
        issueDescription: issueDescription.trim(),
        notes: notes.trim(),
        assignedTechnician:
          currentUser?.displayName || workstation.assignedTechnician || 'Technician',
        lastInspected: new Date().toISOString(),
        components: {
          hasParts: anyParts,
          cpu: compCpu ? cpu.trim() || 'Intel/AMD Processor' : 'MISSING (Empty Socket)',
          ram: compRam ? ram.trim() || '16GB DDR4' : 'MISSING (0 DIMMs)',
          storage: compStorage ? storage.trim() || '512GB SSD' : 'MISSING',
          gpu: compGpu ? gpu.trim() || 'Integrated Graphics' : 'MISSING',
          motherboard: compMotherboard
            ? motherboard.trim() || 'Standard ATX Motherboard'
            : 'MISSING / Gutted Case',
          powerSupply: compPowerSupply ? powerSupply.trim() || '500W PSU' : 'MISSING',
          cpuCooler: compCpuCooler ? cpuCooler.trim() || 'Air Cooler' : 'MISSING',
          display: display.trim(),
          missingPartsDescription: !anyParts
            ? missingPartsDesc.trim() || 'Chassis completely empty — ZERO parts inside.'
            : undefined,
        },
      });

      // Also trigger a window custom event for external telemetry listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('comlab:telemetry', {
            detail: {
              pc_id: workstation.id.replace('pc_', ''),
              status:
                statusLevel === 'red'
                  ? 'BLINKING_RED'
                  : statusLevel.toUpperCase(),
              power_connected:
                powerState !== 'no_power_cable' && powerState !== 'unplugged',
              ethernet_connected: ethernetConnected,
              hardware_detected: {
                cpu: compCpu ? cpu : null,
                ram_gb: compRam ? 16 : 0,
                storage_count: compStorage ? 1 : 0,
                gpu: compGpu ? gpu : null,
                motherboard: compMotherboard ? motherboard : null,
                power_supply: compPowerSupply ? powerSupply : null,
                cpu_cooler: compCpuCooler ? cpuCooler : null,
              },
              alert_message: issueDescription.trim(),
              notes: notes.trim(),
            },
          })
        );
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulatePing = async () => {
    await simulateTelemetryHeartbeat(workstation.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#2d3748] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#2d3748] flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            {/* Status LED Icon */}
            <div className="relative">
              {statusLevel === 'red' && (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]"></div>
                </div>
              )}
              {statusLevel === 'orange' && (
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse"></div>
              )}
              {statusLevel === 'green' && (
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              )}
              {statusLevel === 'unconfigured' && (
                <div className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-slate-400"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white font-mono tracking-wide">
                  {workstation.displayName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e293b] text-cyan-300 font-mono border border-cyan-800/60 font-bold">
                  {workstation.rowLabel} • Slot #{workstation.slotNumber} (Right-to-Left)
                </span>
                {!workstation.isConfigured && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    BLANK STATUS
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                ComLab Digital Twin Node • ID:{' '}
                <code className="text-cyan-400 font-mono">{workstation.id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-all flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Edit Node Status</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-sm custom-scrollbar bg-[#0f172a]/40">
          {/* Elevation Banner if Guest / Student */}
          {!canEdit && (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Viewing in <strong>Guest / Student Mode</strong> (Read-Only). Switch to Julian
                  (Owner) to edit hardware components and status levels.
                </span>
              </div>
              <button
                onClick={() => openAuthModal('profiles_menu')}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-[11px] shrink-0 ml-3"
              >
                Switch Profile
              </button>
            </div>
          )}

          {/* Blank Status Alert Banner if not configured */}
          {!workstation.isConfigured && !isEditing && (
            <div className="p-4 rounded-xl bg-gray-900/90 border border-dashed border-gray-700 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-200">Workstation Status is Blank</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  This computer workstation has not been configured yet. Its status will remain
                  blank until inspected by Julian (Owner) or a laboratory technician, at which point
                  it will sync to the cloud.
                </p>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2.5 px-3 py-1 text-xs font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                  >
                    Configure Status Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW MODE                                                */}
          {/* ======================================================== */}
          {!isEditing ? (
            <div className="space-y-4">
              {/* Alert Status Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  workstation.statusLevel === 'red'
                    ? 'bg-red-950/30 border-red-500/50 text-red-200'
                    : workstation.statusLevel === 'orange'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : workstation.statusLevel === 'green'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-gray-900/60 border-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {workstation.statusLevel === 'red' && (
                    <div className="p-2 rounded-lg bg-red-900/60 text-red-400 animate-pulse">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  {workstation.statusLevel === 'orange' && (
                    <div className="p-2 rounded-lg bg-amber-900/60 text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                  {workstation.statusLevel === 'green' && (
                    <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  {workstation.statusLevel === 'unconfigured' && (
                    <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                      Indicator LED State
                    </span>
                    <h4 className="font-bold text-base">
                      {workstation.statusLevel === 'red' &&
                        'BLINKING RED — Immediate Attention / Critical'}
                      {workstation.statusLevel === 'orange' &&
                        'ORANGE — Issue Present / Non-Emergency (Can Wait)'}
                      {workstation.statusLevel === 'green' &&
                        'GREEN — Operational / Good (No Issues)'}
                      {workstation.statusLevel === 'unconfigured' &&
                        'UNCONFIGURED — Blank / Awaiting Inspection'}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-gray-400 block">AC Power State</span>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border inline-block ${
                      workstation.powerState === 'no_power_cable'
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        : workstation.powerState === 'unplugged'
                        ? 'bg-red-950/60 border-red-500/50 text-red-300'
                        : workstation.powerState === 'powered_on'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    {workstation.powerState.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Special Flags for C4 or C3 */}
              {workstation.id === 'pc_C_4' && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/60 text-red-200">
                  <div className="flex items-center gap-2 font-bold text-red-400 text-xs font-mono uppercase tracking-wider mb-1">
                    <ZapOff className="w-4 h-4" />
                    <span>Special Lab Flag: Row C, PC 4 Chassis</span>
                  </div>
                  <p className="text-xs">
                    This computer has <strong className="text-red-300 underline">ZERO parts inside of it</strong>.
                    It was stripped down to the bare chassis for hands-on student teardown and assembly training.
                  </p>
                </div>
              )}

              {workstation.id === 'pc_C_3' && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
                    <Power className="w-4 h-4" />
                    <span>Special Lab Flag: Row C, PC 3 Power State</span>
                  </div>
                  <p className="text-xs">
                    This computer has <strong className="text-amber-300 underline">no power plugged in</strong>.
                    The IEC C13 power cable is detached from the desk power strip. Hardware inside is functional.
                  </p>
                </div>
              )}

              {/* Power & Cable Connections Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#0b0f19] border border-gray-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`w-4 h-4 ${
                        workstation.powerState === 'no_power_cable' || workstation.powerState === 'unplugged'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    />
                    <span>Main AC Lead:</span>
                  </div>
                  <span
                    className={`font-bold ${
                      workstation.powerState === 'no_power_cable' || workstation.powerState === 'unplugged'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {workstation.powerState === 'no_power_cable' || workstation.powerState === 'unplugged'
                      ? 'DISCONNECTED'
                      : 'CONNECTED'}
                  </span>
                </div>

                <div className="bg-[#0b0f19] border border-gray-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi
                      className={`w-4 h-4 ${
                        workstation.ethernetConnected === false ? 'text-red-400' : 'text-cyan-400'
                      }`}
                    />
                    <span>Ethernet Patch:</span>
                  </div>
                  <span
                    className={`font-bold ${
                      workstation.ethernetConnected === false ? 'text-red-400' : 'text-cyan-400'
                    }`}
                  >
                    {workstation.ethernetConnected === false ? 'DISCONNECTED' : 'PATCHED (1Gbps)'}
                  </span>
                </div>
              </div>

              {/* Hardware Component Inventory Checklist Grid */}
              <div className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>Component Inventory Checklist</span>
                  </h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      workstation.components?.hasParts
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950/50 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {workstation.components?.hasParts ? 'Hardware Present' : 'ZERO PARTS (EMPTY)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">Motherboard</span>
                    <span className={workstation.components?.motherboard && !workstation.components.motherboard.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.motherboard && !workstation.components.motherboard.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">CPU</span>
                    <span className={workstation.components?.cpu && !workstation.components.cpu.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.cpu && !workstation.components.cpu.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">RAM Sticks</span>
                    <span className={workstation.components?.ram && !workstation.components.ram.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.ram && !workstation.components.ram.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">Storage</span>
                    <span className={workstation.components?.storage && !workstation.components.storage.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.storage && !workstation.components.storage.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">GPU</span>
                    <span className={workstation.components?.gpu && !workstation.components.gpu.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.gpu && !workstation.components.gpu.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">Power Supply</span>
                    <span className={workstation.components?.powerSupply && !workstation.components.powerSupply.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.powerSupply && !workstation.components.powerSupply.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">CPU Cooler</span>
                    <span className={workstation.components?.cpuCooler && !workstation.components.cpuCooler.includes('MISSING') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.cpuCooler && !workstation.components.cpuCooler.includes('MISSING') ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">Chassis Fans</span>
                    <span className={workstation.components?.hasParts ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {workstation.components?.hasParts ? '✓ Installed' : '✗ Missing'}
                    </span>
                  </div>
                </div>

                {workstation.components?.hasParts && (
                  <div className="mt-3 pt-3 border-t border-gray-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 font-mono text-[10px]">CPU:</span>
                      <p className="text-gray-300 font-mono truncate">{workstation.components.cpu}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-mono text-[10px]">RAM:</span>
                      <p className="text-gray-300 font-mono truncate">{workstation.components.ram}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Technician & Diagnostic Work Notes */}
              <div className="bg-[#0b0f19] border border-[#2d3748] rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Diagnostic & Bench Repair Notes</span>
                </h4>
                {workstation.notes ? (
                  <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                    {workstation.notes}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic">No lab work logs recorded yet.</p>
                )}

                {workstation.issueDescription && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <span className="text-[11px] font-mono text-amber-400 block font-bold">
                      Reported Issue:
                    </span>
                    <p className="text-xs text-amber-200/90">{workstation.issueDescription}</p>
                  </div>
                )}
              </div>

              {/* Inspection Audit Log */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Updated By: {workstation.updatedBy || 'System'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{new Date(workstation.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* EDIT MODE (Owner/Admin Julian & Lab Workers Only)       */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Quick Preset: ZERO PARTS INSIDE TOGGLE */}
              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-cyan-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                    Fast Preset: Chassis Teardown (Zero Parts)
                  </span>
                  <span className="text-xs text-gray-400">
                    Like Row C, PC 4: marks chassis gutted with all components removed.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleZeroParts(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500 text-xs font-mono font-bold text-red-300 transition-colors"
                  >
                    Set Zero Parts (C4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleZeroParts(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-xs font-mono font-bold text-emerald-300 transition-colors"
                  >
                    Restore Hardware
                  </button>
                </div>
              </div>

              {/* 1. Status Indicator LED Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  1. Status Indicator Selector
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Blinking Red */}
                  <button
                    type="button"
                    onClick={() => setStatusLevel('red')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      statusLevel === 'red'
                        ? 'bg-red-950/70 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-400'
                        : 'bg-[#0b0f19] border-gray-800 text-gray-400 hover:border-red-900/80 hover:text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-xs font-bold text-red-400 font-mono">Blinking Red</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-sans">
                      Immediate Attention / Emergency
                    </span>
                  </button>

                  {/* Orange */}
                  <button
                    type="button"
                    onClick={() => setStatusLevel('orange')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      statusLevel === 'orange'
                        ? 'bg-amber-950/70 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                        : 'bg-[#0b0f19] border-gray-800 text-gray-400 hover:border-amber-900/80 hover:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-amber-400 font-mono">Orange</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-sans">
                      Attention Needed (Can Wait)
                    </span>
                  </button>

                  {/* Green */}
                  <button
                    type="button"
                    onClick={() => setStatusLevel('green')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      statusLevel === 'green'
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                        : 'bg-[#0b0f19] border-gray-800 text-gray-400 hover:border-emerald-900/80 hover:text-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">Green</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-sans">
                      Good / Operational
                    </span>
                  </button>

                  {/* Blank / Unconfigured */}
                  <button
                    type="button"
                    onClick={() => setStatusLevel('unconfigured')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      statusLevel === 'unconfigured'
                        ? 'bg-gray-800 border-gray-400 text-white ring-1 ring-gray-400'
                        : 'bg-[#0b0f19] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                      <span className="text-xs font-bold text-gray-300 font-mono">Blank</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-sans">
                      Unconfigured / Pending
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Power & Cable Connections Toggle */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  2. Power & Cable Connections Toggle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Main AC Lead Toggle */}
                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Zap
                        className={`w-4 h-4 ${
                          powerState === 'no_power_cable' || powerState === 'unplugged'
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-mono font-bold text-gray-200 block">
                          Main AC Lead (IEC C13)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {powerState === 'no_power_cable'
                            ? 'No Cable Plugged In (C3)'
                            : powerState === 'unplugged'
                            ? 'Lead Disconnected'
                            : 'Plugged into Desk Strip'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPowerState(
                          powerState === 'no_power_cable' || powerState === 'unplugged'
                            ? 'powered_on'
                            : 'no_power_cable'
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        powerState !== 'no_power_cable' && powerState !== 'unplugged'
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                          : 'bg-red-950/70 border-red-500 text-red-300'
                      }`}
                    >
                      {powerState !== 'no_power_cable' && powerState !== 'unplugged'
                        ? '✓ Connected'
                        : '✗ Disconnected'}
                    </button>
                  </div>

                  {/* Ethernet Patch Toggle */}
                  <div className="p-3 rounded-xl bg-[#0b0f19] border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Wifi
                        className={`w-4 h-4 ${
                          ethernetConnected ? 'text-cyan-400' : 'text-gray-500'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-mono font-bold text-gray-200 block">
                          Cat6 Ethernet Patch Lead
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {ethernetConnected ? 'Patched to Lab Core Switch' : 'Unpatched Lead'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEthernetConnected(!ethernetConnected)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        ethernetConnected
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {ethernetConnected ? '✓ Patched' : '✗ Unpatched'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Component Inventory Checklist */}
              <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-[#2d3748] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    3. Component Inventory Checklist
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    Check installed modules
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {/* Motherboard */}
                  <button
                    type="button"
                    onClick={() => setCompMotherboard(!compMotherboard)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compMotherboard
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>Motherboard</span>
                    <span>{compMotherboard ? '✓' : '✗'}</span>
                  </button>

                  {/* CPU */}
                  <button
                    type="button"
                    onClick={() => setCompCpu(!compCpu)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compCpu
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>CPU Socket</span>
                    <span>{compCpu ? '✓' : '✗'}</span>
                  </button>

                  {/* RAM Sticks */}
                  <button
                    type="button"
                    onClick={() => setCompRam(!compRam)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compRam
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>RAM Sticks</span>
                    <span>{compRam ? '✓' : '✗'}</span>
                  </button>

                  {/* Storage Drives */}
                  <button
                    type="button"
                    onClick={() => setCompStorage(!compStorage)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compStorage
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>Storage Drives</span>
                    <span>{compStorage ? '✓' : '✗'}</span>
                  </button>

                  {/* GPU */}
                  <button
                    type="button"
                    onClick={() => setCompGpu(!compGpu)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compGpu
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>GPU (Graphics)</span>
                    <span>{compGpu ? '✓' : '✗'}</span>
                  </button>

                  {/* Power Supply */}
                  <button
                    type="button"
                    onClick={() => setCompPowerSupply(!compPowerSupply)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compPowerSupply
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>Power Supply</span>
                    <span>{compPowerSupply ? '✓' : '✗'}</span>
                  </button>

                  {/* CPU Cooler */}
                  <button
                    type="button"
                    onClick={() => setCompCpuCooler(!compCpuCooler)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      compCpuCooler
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>CPU Cooler</span>
                    <span>{compCpuCooler ? '✓' : '✗'}</span>
                  </button>

                  {/* Fast Toggle All */}
                  <button
                    type="button"
                    onClick={() => {
                      const allChecked =
                        compMotherboard &&
                        compCpu &&
                        compRam &&
                        compStorage &&
                        compGpu &&
                        compPowerSupply &&
                        compCpuCooler;
                      handleToggleZeroParts(allChecked);
                    }}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-center font-bold"
                  >
                    Toggle All
                  </button>
                </div>

                {/* Hardware Spec Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-400 mb-1">CPU Model</label>
                    <input
                      type="text"
                      value={cpu}
                      onChange={(e) => setCpu(e.target.value)}
                      placeholder="e.g. Intel Core i5-12400 / Ryzen 5 5600"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-gray-400 mb-1">RAM Config</label>
                    <input
                      type="text"
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      placeholder="e.g. 16GB DDR4-3200 (2x8GB)"
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Diagnostic & Bench Repair Notes */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                  4. Diagnostic & Bench Repair Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record what was checked, faults observed, cable status, or pending rebuild tasks..."
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 5. Active Issue Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  5. Active Issue Summary / Alert Pill
                </label>
                <input
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. NO POWER PLUGGED IN, ZERO PARTS INSIDE, or Thermal Paste Degradation"
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#2d3748] bg-[#0b0f19] flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono">
            {canEdit ? (
              <span className="text-emerald-400">
                ✓ Authorized: Julian / Admin Profile (Cloud Sync Ready)
              </span>
            ) : (
              <span className="text-amber-400">⚠ View-Only (Sign in as Julian to edit)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Syncing to Cloud...' : 'Save & Cloud Sync'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
