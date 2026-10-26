import React, { useState } from 'react';
import {
  X,
  Terminal,
  Copy,
  Check,
  Zap,
  Activity,
  Shield,
  Layers,
  Sparkles,
  Server,
  Play,
  RotateCw,
  Cpu,
  Monitor,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ComLabWorkstation } from '../../types';

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workstations: ComLabWorkstation[];
  onSelectWorkstation?: (ws: ComLabWorkstation) => void;
}

export const ConnectAgentModal: React.FC<ConnectAgentModalProps> = ({
  isOpen,
  onClose,
  workstations,
  onSelectWorkstation,
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('A1');
  const [osTab, setOsTab] = useState<'windows' | 'linux'>('windows');
  const [installStartup, setInstallStartup] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const cleanPc = selectedStation.toUpperCase();

  // One-line commands
  const winInstantCmd = `irm "${origin}/api/agent/script?pc=${cleanPc}&os=win" | iex`;
  const winStartupCmd = `irm "${origin}/api/agent/script?pc=${cleanPc}&os=win&startup=true" | iex`;

  const linuxInstantCmd = `curl -sSL "${origin}/api/agent/script?pc=${cleanPc}&os=linux" | python3 -`;
  const linuxStartupCmd = `curl -sSL "${origin}/api/agent/script?pc=${cleanPc}&os=linux&startup=true" | sudo python3 -`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Live test dispatcher that hits server POST /api/comlab/telemetry
  const handleTestDispatch = async (scenario: 'healthy' | 'bootable_error' | 'bad_error' | 'fucked') => {
    setIsSimulating(true);
    setTestStatus('Sending test telemetry packet...');

    const basePayload: any = {
      pcId: cleanPc,
      hostname: `LAB-PC-${cleanPc}`,
      os: osTab === 'windows' ? 'Windows 11 Enterprise 64-bit' : 'Ubuntu 24.04 LTS (Kernel 6.8.0)',
      uptimeSeconds: 7420,
      cpu: {
        model: osTab === 'windows' ? 'Intel Core i7-13700 @ 3.40GHz' : 'AMD Ryzen 7 5700G @ 3.8GHz',
        cores: 8,
        threads: 16,
        currentMhz: 4200,
        voltage: 1.18,
      },
      ram: {
        totalMb: 32768,
        usedMb: 9216,
        usagePercent: 28,
        speedMhz: 3200,
        slotsUsed: '2 / 4',
      },
      gpu: {
        model: 'NVIDIA GeForce RTX 3060 12GB',
        tempC: 44,
        usagePercent: 12,
        vramUsedMb: 1420,
        vramTotalMb: 12288,
        fanPercent: 35,
      },
      disks: [
        {
          name: osTab === 'windows' ? 'C: (NVMe SSD)' : '/dev/nvme0n1p2',
          model: 'Samsung 980 PRO 1TB',
          sizeGb: 1000,
          freeGb: 684,
          tempCelsius: 38,
          readSpeedMb: 45.2,
          writeSpeedMb: 12.1,
          smartHealth: 'Healthy',
        },
      ],
      network: {
        ip: `192.168.10.${100 + parseInt(cleanPc.slice(1) || '1', 10)}`,
        mac: `52:54:00:A1:${cleanPc}:88`,
        linkSpeedMbps: 1000,
        gateway: '192.168.10.1',
        dns: '1.1.1.1',
      },
    };

    if (scenario === 'healthy') {
      basePayload.statusLevel = 'green';
      basePayload.cpu.packageTempC = 41;
      basePayload.cpu.usagePercent = 14;
      basePayload.error = undefined;
    } else if (scenario === 'bootable_error') {
      basePayload.statusLevel = 'blinking_orange';
      basePayload.cpu.packageTempC = 86;
      basePayload.cpu.usagePercent = 88;
      basePayload.cpu.isThrottling = true;
      basePayload.error = {
        code: 'WARN_THERMAL_THROTTLE_0x82',
        name: 'CPU Thermal Throttling Active',
        description: 'Chassis intake fan stalled; CPU package reached 86°C. Machine is bootable and operational under clock throttle.',
        severity: 'warning',
      };
    } else if (scenario === 'bad_error') {
      basePayload.statusLevel = 'blinking_red';
      basePayload.cpu.packageTempC = 58;
      basePayload.error = {
        code: 'ERR_DISK_SMART_DEGRADED',
        name: 'Primary NVMe SMART Threshold Exceeded',
        description: 'Reallocated sectors count increasing rapidly. Recoverable if backed up immediately.',
        severity: 'error',
      };
    } else if (scenario === 'fucked') {
      basePayload.statusLevel = 'red';
      basePayload.cpu.packageTempC = 99;
      basePayload.error = {
        code: 'CRIT_KERNEL_PANIC_0xDEADDEAD',
        name: 'FATAL HARDWARE FAILURE ("PC is FUCKED!")',
        description: 'Uncorrectable PCIe bus error and power rails collapsed. Total system lockup / non-functional.',
        severity: 'fatal',
      };
    }

    try {
      const res = await fetch('/api/comlab/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      });
      const data = await res.json();
      setTestStatus(`Live telemetry dispatched! Status: ${data.statusLevel?.toUpperCase()}`);
    } catch (e: any) {
      setTestStatus(`Error dispatching test: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const stations = [
    'A1', 'A2', 'A3',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3', 'C4',
    'D1', 'D2', 'D3', 'D4',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-[#232d3f] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2937] bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide font-mono flex items-center gap-2">
                <span>CONNECT PHYSICAL LAB COMPUTERS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/60 text-emerald-300">
                  Sub-Second Sync (&lt; 1s)
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Run the agent command on any PC to sync its real-time hardware specs, temperatures, and status lights.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm custom-scrollbar bg-[#090d16]">
          {/* Step 1: Select Target Workstation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Target Workstation (Desktop Desk)</span>
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                Currently Selected: <strong className="text-white">PC {cleanPc}</strong>
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5">
              {stations.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStation(st)}
                  className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    selectedStation === st
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105'
                      : 'bg-[#111827] border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose Platform */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Choose Computer Operating System</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOsTab('windows')}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  osTab === 'windows'
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400'
                    : 'bg-[#111827] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🪟</div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-mono">Windows 10 / 11</h4>
                    <p className="text-xs text-gray-400">PowerShell 5.1+ / Core • WMI &amp; CIM sensors</p>
                  </div>
                </div>
                {osTab === 'windows' && <Check className="w-5 h-5 text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => setOsTab('linux')}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  osTab === 'linux'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                    : 'bg-[#111827] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🐧</div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-mono">Linux / Ubuntu / Debian</h4>
                    <p className="text-xs text-gray-400">Python 3 + Bash • systemd daemon service</p>
                  </div>
                </div>
                {osTab === 'linux' && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Step 3: Run the Code on the Physical PC */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Copy &amp; Paste One-Line Terminal Command</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300 font-mono flex items-center gap-2 cursor-pointer bg-[#111827] px-2.5 py-1 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={installStartup}
                    onChange={(e) => setInstallStartup(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Auto-run on PC startup</span>
                </label>
              </div>
            </div>

            {/* Command Box */}
            <div className="bg-[#04060a] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-800/80">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>
                    {osTab === 'windows' ? 'Windows PowerShell (Run as Administrator)' : 'Linux Terminal / SSH'}
                  </span>
                </span>
                <span className="text-[11px] text-gray-500">
                  {installStartup ? '⭐ Auto-Configures Boot Startup' : 'One-Time Session'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-[#0d1117] p-3 rounded-lg border border-gray-800">
                <code className="text-emerald-400 text-xs sm:text-sm break-all select-all font-mono">
                  {osTab === 'windows'
                    ? (installStartup ? winStartupCmd : winInstantCmd)
                    : (installStartup ? linuxStartupCmd : linuxInstantCmd)}
                </code>

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      osTab === 'windows'
                        ? (installStartup ? winStartupCmd : winInstantCmd)
                        : (installStartup ? linuxStartupCmd : linuxInstantCmd),
                      'cmd'
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors shrink-0 flex items-center gap-1.5 shadow"
                >
                  {copiedKey === 'cmd' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Startup Explanation & Execution Notes */}
              <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs font-sans text-gray-300 space-y-1.5">
                <div className="font-bold text-white font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>How this connects &amp; runs on startup:</span>
                </div>
                {osTab === 'windows' ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px] pl-1">
                    <li>
                      Downloads the signed PowerShell telemetry loop and connects to <code className="text-cyan-300 font-mono">/api/comlab/telemetry</code>.
                    </li>
                    <li>
                      <strong>Startup Installation:</strong> Registers a hidden background task in <strong>Windows Task Scheduler</strong> named <code className="text-cyan-300 font-mono">TradeTech-ComLab-Agent-{cleanPc}</code> that fires silently at system logon.
                    </li>
                    <li>
                      Collects CPU temps (WMI/ACPI), per-core load, clock MHz, DDR4/DDR5 RAM, GPU thermals &amp; VRAM, and Windows Event Log system warnings every 900ms.
                    </li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px] pl-1">
                    <li>
                      Executes Python 3 background loop reading <code className="text-cyan-300 font-mono">/sys/class/thermal</code>, <code className="text-cyan-300 font-mono">/proc/stat</code>, and memory.
                    </li>
                    <li>
                      <strong>Startup Installation:</strong> Writes a systemd unit to <code className="text-cyan-300 font-mono">/etc/systemd/system/tradetech-agent.service</code> and enables it with <code className="text-cyan-300 font-mono">systemctl enable --now</code>.
                    </li>
                    <li>
                      Pulls kernel diagnostics, dmesg fatal faults, and disk SMART health automatically.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Reference: Exact 6-State Status Light Matrix */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Status Light Matrix Reference (Hardware Led Behavior)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
              {/* 1. Solid Green */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-emerald-900/40 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-emerald-400 block">Solid Green</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    PC is working just fine, powered on, and transmitting live data.
                  </span>
                </div>
              </div>

              {/* 2. Blinking Green */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-emerald-900/40 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-blink-green mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-emerald-300 block">Blinking Green</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    Worked last time, but now turned off or stopped transmitting data.
                  </span>
                </div>
              </div>

              {/* 3. Blinking Orange */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-amber-900/40 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-blink-orange mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-amber-300 block">Blinking Orange</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    PC has errors or warnings, but is bootable / usable.
                  </span>
                </div>
              </div>

              {/* 4. Blinking Red */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-red-900/40 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400 animate-blink-red mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-red-400 block">Blinking Red</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    Bad recoverable error (SMART fault, bad memory block, fan failure).
                  </span>
                </div>
              </div>

              {/* 5. Solid Red */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-red-950/70 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_15px_#dc2626] animate-pulse mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-red-500 block">Solid Red</span>
                  <span className="text-[11px] text-red-300 font-sans font-bold">
                    PC is FUCKED! Critical fatal error / non-functional.
                  </span>
                </div>
              </div>

              {/* 6. Solid Gray */}
              <div className="p-2.5 rounded-lg bg-[#111827] border border-gray-800 flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-500 border border-slate-400 mt-0.5 shrink-0"></div>
                <div>
                  <span className="font-bold text-slate-400 block">Solid Gray</span>
                  <span className="text-[11px] text-gray-400 font-sans">
                    PC isn't connected at all. Zero signal registered.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Live Telemetry Right Now (In-Browser Simulator) */}
          <div className="p-4 rounded-xl bg-[#070b12] border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>Test-Fire Live Telemetry for PC {cleanPc}</span>
                </h4>
                <p className="text-[11px] text-gray-400">
                  Simulate instant telemetry packets to confirm the canvas lights and specs update live in under 1 second.
                </p>
              </div>

              {testStatus && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse">
                  {testStatus}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleTestDispatch('healthy')}
                className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-900 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Send Healthy (Green)</span>
              </button>

              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleTestDispatch('bootable_error')}
                className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-500/70 text-amber-300 hover:bg-amber-900 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>Bootable Error (Blink Orange)</span>
              </button>

              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleTestDispatch('bad_error')}
                className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/70 text-red-300 hover:bg-red-900 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
                <span>Bad Error (Blink Red)</span>
              </button>

              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleTestDispatch('fucked')}
                className="p-2.5 rounded-lg bg-red-900/90 border border-red-400 text-white hover:bg-red-800 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Fatal ("Fucked" Solid Red)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#1f2937] bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-Time SSE Server Stream: Active on port 3000</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
