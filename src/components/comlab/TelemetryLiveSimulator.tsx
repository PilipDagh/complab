import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComLabTelemetryPayload } from '../../types';
import {
  X,
  Radio,
  Play,
  Terminal,
  Activity,
  CheckCircle,
  AlertTriangle,
  ZapOff,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface TelemetryLiveSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchPayload: (payload: ComLabTelemetryPayload) => void;
}

export const TelemetryLiveSimulator: React.FC<TelemetryLiveSimulatorProps> = ({
  isOpen,
  onClose,
  onDispatchPayload,
}) => {
  const { comLabWorkstations, addToast } = useApp();

  const [selectedPc, setSelectedPc] = useState<string>('C4');
  const [jsonText, setJsonText] = useState<string>(() =>
    JSON.stringify(
      {
        pc_id: 'C4',
        status: 'BLINKING_RED',
        power_connected: false,
        hardware_detected: {
          cpu: null,
          ram_gb: 0,
          storage_count: 0,
          gpu: null,
          motherboard: null,
          power_supply: null,
          cpu_cooler: null,
        },
        alert_message: 'ZERO PARTS INSIDE',
      },
      null,
      2
    )
  );

  const [recentLogs, setRecentLogs] = useState<
    Array<{ id: string; time: string; pc_id: string; status: string; alert: string }>
  >([
    {
      id: 'log-1',
      time: '14:32:05',
      pc_id: 'C4',
      status: 'BLINKING_RED',
      alert: 'ZERO PARTS INSIDE',
    },
    {
      id: 'log-2',
      time: '14:31:18',
      pc_id: 'C3',
      status: 'ORANGE',
      alert: 'NO POWER PLUGGED IN',
    },
  ]);

  if (!isOpen) return null;

  // Preset loaders
  const loadPreset = (presetName: 'c4_teardown' | 'c3_nopower' | 'a2_overheat' | 'b1_healthy') => {
    let payload: ComLabTelemetryPayload;

    if (presetName === 'c4_teardown') {
      setSelectedPc('C4');
      payload = {
        pc_id: 'C4',
        status: 'BLINKING_RED',
        power_connected: false,
        hardware_detected: {
          cpu: null,
          ram_gb: 0,
          storage_count: 0,
          gpu: null,
          motherboard: null,
          power_supply: null,
          cpu_cooler: null,
        },
        alert_message: 'ZERO PARTS INSIDE',
        notes: 'Chassis completely empty — ZERO parts inside.',
      };
    } else if (presetName === 'c3_nopower') {
      setSelectedPc('C3');
      payload = {
        pc_id: 'C3',
        status: 'ORANGE',
        power_connected: false,
        ethernet_connected: true,
        hardware_detected: {
          cpu: 'Intel Core i7-10700K',
          ram_gb: 32,
          storage_count: 2,
          gpu: 'GTX 1660 Super',
          motherboard: 'Z490 Gaming Edge',
          power_supply: '650W Corsair',
          cpu_cooler: 'Stock Cooler',
        },
        alert_message: 'NO POWER PLUGGED IN',
        notes: 'AC power lead detached from desk power busway.',
      };
    } else if (presetName === 'a2_overheat') {
      setSelectedPc('A2');
      payload = {
        pc_id: 'A2',
        status: 'ORANGE',
        power_connected: true,
        ethernet_connected: true,
        hardware_detected: {
          cpu: 'Intel Core i5-12400 (88°C Throttling)',
          ram_gb: 16,
          storage_count: 1,
          gpu: 'Intel UHD 730',
          motherboard: 'B660M-A Pro',
          power_supply: '500W PSU',
          cpu_cooler: 'Fan Stalled',
        },
        alert_message: 'Thermal Warning: CPU 88°C (Heatsink Fan Failure)',
        notes: 'CPU heatsink fan RPM dropped below 300 RPM.',
      };
    } else {
      setSelectedPc('B1');
      payload = {
        pc_id: 'B1',
        status: 'GREEN',
        power_connected: true,
        ethernet_connected: true,
        hardware_detected: {
          cpu: 'AMD Ryzen 5 5600',
          ram_gb: 16,
          storage_count: 1,
          gpu: 'AMD Radeon RX 6600',
          motherboard: 'B550 Steel Legend',
          power_supply: '650W Gold',
          cpu_cooler: 'Wraith Stealth Cooler',
        },
        alert_message: 'All Hardware Operational (Good)',
        notes: 'Automated diagnostic passed 100% of hardware integrity checks.',
      };
    }

    setJsonText(JSON.stringify(payload, null, 2));
  };

  const handleDispatch = () => {
    try {
      const parsed = JSON.parse(jsonText) as ComLabTelemetryPayload;
      onDispatchPayload(parsed);

      // Also notify server endpoint for SSE broadcast across all browser tabs
      fetch('/api/comlab/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pcId: parsed.pc_id,
          statusLevel: parsed.status?.toLowerCase(),
          alert_message: parsed.alert_message,
          notes: parsed.notes,
          hardware_detected: parsed.hardware_detected,
          power_connected: parsed.power_connected,
          ethernet_connected: parsed.ethernet_connected,
        }),
      }).catch((err) => console.warn('Simulator server ping notice:', err));

      setRecentLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          pc_id: parsed.pc_id,
          status: parsed.status,
          alert: parsed.alert_message || 'Telemetry Heartbeat Delivered',
        },
        ...prev.slice(0, 7),
      ]);

      addToast({
        type: 'success',
        title: 'Telemetry Dispatched',
        message: `Direct agent payload delivered to PC ${parsed.pc_id} (${parsed.status}).`,
      });
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Invalid JSON',
        message: 'Could not parse JSON payload. Please verify syntax.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-800/60 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 bg-[#090e17] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  Direct Telemetry Agent Hookup & Live Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Global Event Listener Ready
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Broadcasts JSON payloads directly into the ComLab digital twin without manual input.
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm custom-scrollbar bg-[#080d1a]">
          {/* Preset Buttons Bar */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-2">
              1. Choose Fast Telemetry Preset Test:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadPreset('c4_teardown')}
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-red-400 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>PC C4 Teardown</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  BLINKING_RED • 0 Parts
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('c3_nopower')}
                className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/60 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>PC C3 No Power</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ORANGE • No AC Cable
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('a2_overheat')}
                className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/60 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>PC A2 Thermals</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ORANGE • 88°C Hot
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('b1_healthy')}
                className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/60 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>PC B1 All Clear</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  GREEN • 100% Normal
                </span>
              </button>
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                2. Live Agent JSON Payload (Editable):
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                Target: <strong>PC {selectedPc}</strong>
              </span>
            </div>
            <textarea
              rows={9}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-[#030712] border border-cyan-900/60 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Recent Broadcast Log */}
          <div className="p-3.5 rounded-xl bg-[#090e17] border border-gray-800">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Ingestion Activity Stream:</span>
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-gray-800/80 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{log.time}</span>
                    <span className="text-cyan-400 font-bold">[{log.pc_id}]</span>
                    <span className="text-gray-300 truncate max-w-xs">{log.alert}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                      log.status === 'BLINKING_RED' || log.status === 'red'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : log.status === 'ORANGE' || log.status === 'orange'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-800 bg-[#090e17] flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">
            Dispatches: <code className="text-cyan-400">window.dispatchEvent('comlab:telemetry')</code>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDispatch}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Dispatch Live Telemetry Ping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
