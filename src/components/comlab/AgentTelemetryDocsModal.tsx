import React, { useState } from 'react';
import {
  X,
  Radio,
  Terminal,
  Copy,
  Check,
  Server,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AgentTelemetryDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentTelemetryDocsModal: React.FC<AgentTelemetryDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { comLabWorkstations, simulateTelemetryHeartbeat, addToast } = useApp();
  const [selectedPcId, setSelectedPcId] = useState<string>(comLabWorkstations[0]?.id || 'pc_A_1');
  const [copiedScript, setCopiedScript] = useState<'py' | 'ps1' | 'json' | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'py' | 'ps1' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedScript(type);
    setTimeout(() => setCopiedScript(null), 2500);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Agent script copied to clipboard.',
    });
  };

  const handleRunSimulator = async () => {
    setIsPinging(true);
    await simulateTelemetryHeartbeat(selectedPcId);
    setTimeout(() => setIsPinging(false), 600);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const cleanPc = selectedPcId.replace('pc_', '').replace('_', '').toUpperCase();

  const pythonScript = `# tradetech_agent.py - Real-Time Lab Telemetry Daemon (< 1s interval)
import psutil
import socket
import time
import requests

WORKSTATION_ID = "${selectedPcId}" # Target Workstation: ${cleanPc}
API_ENDPOINT = "${origin}/api/comlab/telemetry"

def collect_telemetry():
    cpu_usage = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory()
    temp = 42
    try:
        temps = psutil.sensors_temperatures()
        if "coretemp" in temps and len(temps["coretemp"]) > 0:
            temp = temps["coretemp"][0].current
    except Exception:
        pass

    return {
        "pcId": WORKSTATION_ID,
        "hostname": socket.gethostname(),
        "ipAddress": socket.gethostbyname(socket.gethostname()),
        "os": "Linux / Ubuntu 64-bit",
        "cpuTempCelsius": int(temp),
        "cpuUsagePercent": int(cpu_usage),
        "ramUsagePercent": int(ram.percent),
        "powerState": "powered_on",
        "agentOnline": True,
        "statusLevel": "green" if temp < 80 else "blinking_orange"
    }

def start_heartbeat(interval_sec=0.9):
    print(f"[*] TradeTech ComLab Agent active for PC {WORKSTATION_ID}...")
    while True:
        try:
            payload = collect_telemetry()
            res = requests.post(API_ENDPOINT, json=payload, timeout=2)
            print(f"[+] Heartbeat delivered (Status {res.status_code})")
        except Exception as e:
            print(f"[-] Telemetry defer: {e}")
        time.sleep(interval_sec)

if __name__ == "__main__":
    start_heartbeat()
`;

  const powerShellScript = `# tradetech_agent.ps1 - Windows Real-Time Telemetry Loop (< 1s interval)
$WorkstationId = "${selectedPcId}"
$ApiEndpoint = "${origin}/api/comlab/telemetry"

Write-Host "[*] Starting TradeTech Telemetry Agent for $WorkstationId..." -ForegroundColor Cyan

while ($true) {
    try {
        $Cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1)
        $Os = (Get-CimInstance Win32_OperatingSystem)
        $RamUsage = [math]::Round((($Os.TotalVisibleMemorySize - $Os.FreePhysicalMemory) / $Os.TotalVisibleMemorySize) * 100)

        $Payload = @{
            pcId = $WorkstationId
            hostname = $env:COMPUTERNAME
            cpuTempCelsius = 42
            cpuUsagePercent = [int]$Cpu.LoadPercentage
            ramUsagePercent = $RamUsage
            statusLevel = if ($Cpu.LoadPercentage -gt 85) { "blinking_orange" } else { "green" }
        } | ConvertTo-Json

        Invoke-RestMethod -Uri $ApiEndpoint -Method Post -Body $Payload -ContentType "application/json" -TimeoutSec 2 | Out-Null
    } catch {
        Write-Warning "Telemetry ping deferred: $($_.Exception.Message)"
    }
    Start-Sleep -Milliseconds 900
}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  Automated Direct Telemetry Connection Protocol
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Future Automated Architecture</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">
                How laboratory computers will directly report live status without manual input.
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
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-sm">
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-100 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>How Direct Computer-to-Website Live Sync Works</span>
            </h4>
            <p className="text-xs text-cyan-200/90 leading-relaxed">
              When ready to deploy direct connectivity, each computer in the ComLab runs a lightweight 
              background service (Python daemon or Windows PowerShell scheduled task). Every 30 seconds, 
              it queries CPU thermals, RAM utilization, missing hardware devices, and power state, then 
              submits an authenticated heartbeat directly to this web application via cloud Firestore.
            </p>
          </div>

          {/* Standardized JSON Telemetry Agent Payload Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Agent JSON Telemetry Event Contract</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        pc_id: selectedPcId.replace('pc_', ''),
                        status: 'BLINKING_RED',
                        power_connected: false,
                        hardware_detected: {
                          cpu: null,
                          ram_gb: 0,
                          storage_count: 0,
                        },
                        alert_message: 'ZERO PARTS INSIDE',
                      },
                      null,
                      2
                    ),
                    'json'
                  )
                }
                className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedScript === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedScript === 'json' ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto custom-scrollbar">
{JSON.stringify(
  {
    pc_id: selectedPcId.replace('pc_', ''),
    status: 'BLINKING_RED',
    power_connected: false,
    hardware_detected: {
      cpu: null,
      ram_gb: 0,
      storage_count: 0,
    },
    alert_message: 'ZERO PARTS INSIDE',
  },
  null,
  2
)}
            </pre>
          </div>

          {/* Live Simulator Test Box */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Interactive Live Heartbeat Simulator
                </h4>
                <p className="text-xs text-gray-400">
                  Select a workstation to simulate an external agent sending a live telemetry ping right now.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPcId}
                  onChange={(e) => setSelectedPcId(e.target.value)}
                  className="bg-[#161b22] border border-gray-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-400"
                >
                  {comLabWorkstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.displayName} ({ws.rowLabel})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleRunSimulator}
                  disabled={isPinging}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Send Live Ping'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Python Script Tab */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Python Background Agent (Linux / Windows / macOS)</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(pythonScript, 'py')}
                className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedScript === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === 'py' ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto custom-scrollbar">
              {pythonScript}
            </pre>
          </div>

          {/* PowerShell Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Windows PowerShell Scheduled Task Script</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(powerShellScript, 'ps1')}
                className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedScript === 'ps1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === 'ps1' ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-blue-200 overflow-x-auto custom-scrollbar">
              {powerShellScript}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#30363d] bg-[#0d1117]/90 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 font-medium transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
