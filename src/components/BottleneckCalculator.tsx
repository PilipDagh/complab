import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../data/shopManagementDatabase';
import {
  Zap,
  Cpu,
  Monitor,
  Gamepad2,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  RefreshCw,
  Plus,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Thermometer,
} from 'lucide-react';

interface BottleneckCalculatorProps {
  inventory: InventoryItem[];
  onSaveAsCombo?: (comboData: {
    cpu: InventoryItem | null;
    gpu: InventoryItem | null;
    ram: InventoryItem | null;
    resolution: string;
    workload: string;
    bottleneckPercent: number;
    mainBottleneck: 'CPU Bound' | 'GPU Bound' | 'Balanced Synergy';
  }) => void;
}

export const BottleneckCalculator: React.FC<BottleneckCalculatorProps> = ({
  inventory,
  onSaveAsCombo,
}) => {
  // Extract CPUs, GPUs, RAM from inventory
  const cpus = useMemo(
    () => inventory.filter((i) => i.category === 'Processors (CPUs)'),
    [inventory]
  );
  const gpus = useMemo(
    () => inventory.filter((i) => i.category === 'Graphics Cards (GPUs)'),
    [inventory]
  );
  const rams = useMemo(
    () => inventory.filter((i) => i.category === 'Memory (RAM)'),
    [inventory]
  );

  // Selected State
  const [selectedCpuId, setSelectedCpuId] = useState<string>(cpus[0]?.id || 'cpu_001');
  const [selectedGpuId, setSelectedGpuId] = useState<string>(gpus[0]?.id || 'gpu_001');
  const [selectedRamId, setSelectedRamId] = useState<string>(rams[0]?.id || 'ram_001');

  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4K' | '8K' | 'Ultrawide'>('1440p');
  const [workload, setWorkload] = useState<
    'competitive_fps' | 'aaa_gaming' | 'video_editing' | '3d_rendering' | 'ai_inference' | 'cad_engineering'
  >('aaa_gaming');

  const selectedCpu = cpus.find((c) => c.id === selectedCpuId) || cpus[0];
  const selectedGpu = gpus.find((g) => g.id === selectedGpuId) || gpus[0];
  const selectedRam = rams.find((r) => r.id === selectedRamId) || rams[0];

  // Benchmark Scoring Heuristics
  const calculation = useMemo(() => {
    if (!selectedCpu || !selectedGpu) {
      return {
        cpuScore: 100,
        gpuScore: 100,
        cpuBottleneckPercent: 0,
        gpuBottleneckPercent: 0,
        combinedBottleneck: 0,
        mainBottleneck: 'Balanced Synergy' as const,
        severity: 'Minimal' as const,
        estimatedFps: 120,
        systemTdp: 350,
        recommendedPsuWatts: 650,
        ramSufficiency: 95,
      };
    }

    // CPU Raw Score (based on name, cores, cost, TDP)
    let cpuBase = Math.min(100, (selectedCpu.unitCost / 6.5) + (selectedCpu.tdpWatts || 105) * 0.2);
    if (selectedCpu.name.includes('X3D')) cpuBase *= 1.22; // 3D V-Cache gaming boost
    if (selectedCpu.name.includes('9950X') || selectedCpu.name.includes('14900KS')) cpuBase = 99;
    if (selectedCpu.name.includes('7800X3D') || selectedCpu.name.includes('9800X3D')) cpuBase = 98;
    if (selectedCpu.name.includes('5600') || selectedCpu.name.includes('12400')) cpuBase = 62;
    if (selectedCpu.name.includes('i3') || selectedCpu.name.includes('5500')) cpuBase = 45;

    // GPU Raw Score
    let gpuBase = Math.min(100, (selectedGpu.unitCost / 18.0) + (selectedGpu.tdpWatts || 220) * 0.1);
    if (selectedGpu.name.includes('5090') || selectedGpu.name.includes('4090')) gpuBase = 100;
    if (selectedGpu.name.includes('5080') || selectedGpu.name.includes('4080')) gpuBase = 90;
    if (selectedGpu.name.includes('4070 Ti') || selectedGpu.name.includes('7900 XT')) gpuBase = 82;
    if (selectedGpu.name.includes('4070') || selectedGpu.name.includes('7800 XT')) gpuBase = 74;
    if (selectedGpu.name.includes('4060') || selectedGpu.name.includes('7600') || selectedGpu.name.includes('B580')) gpuBase = 55;
    if (selectedGpu.name.includes('1660') || selectedGpu.name.includes('6600') || selectedGpu.name.includes('3050')) gpuBase = 38;

    // Resolution Scaling Factor
    // 1080p puts heavier relative load on CPU; 4K & 8K puts almost all load on GPU
    let cpuResolutionMultiplier = 1.0;
    let gpuResolutionMultiplier = 1.0;

    switch (resolution) {
      case '1080p':
        cpuResolutionMultiplier = 1.35; // CPU is critical for high frame delivery
        gpuResolutionMultiplier = 0.85;
        break;
      case '1440p':
        cpuResolutionMultiplier = 1.0;
        gpuResolutionMultiplier = 1.05;
        break;
      case 'Ultrawide':
        cpuResolutionMultiplier = 0.92;
        gpuResolutionMultiplier = 1.25;
        break;
      case '4K':
        cpuResolutionMultiplier = 0.75;
        gpuResolutionMultiplier = 1.55; // GPU becomes dominant limit
        break;
      case '8K':
        cpuResolutionMultiplier = 0.55;
        gpuResolutionMultiplier = 2.10;
        break;
    }

    // Workload Multipliers
    let workloadCpuWeight = 1.0;
    let workloadGpuWeight = 1.0;
    switch (workload) {
      case 'competitive_fps':
        workloadCpuWeight = 1.4;
        workloadGpuWeight = 0.8;
        break;
      case 'aaa_gaming':
        workloadCpuWeight = 1.0;
        workloadGpuWeight = 1.15;
        break;
      case 'video_editing':
        workloadCpuWeight = 1.25;
        workloadGpuWeight = 1.0;
        break;
      case '3d_rendering':
        workloadCpuWeight = 1.1;
        workloadGpuWeight = 1.35;
        break;
      case 'ai_inference':
        workloadCpuWeight = 0.8;
        workloadGpuWeight = 1.6;
        break;
      case 'cad_engineering':
        workloadCpuWeight = 1.3;
        workloadGpuWeight = 0.9;
        break;
    }

    const effectiveCpuDemand = cpuBase / (cpuResolutionMultiplier * workloadCpuWeight);
    const effectiveGpuDemand = gpuBase / (gpuResolutionMultiplier * workloadGpuWeight);

    let bottleneckPercent = 0;
    let mainBottleneck: 'CPU Bound' | 'GPU Bound' | 'Balanced Synergy' = 'Balanced Synergy';

    if (effectiveCpuDemand < effectiveGpuDemand * 0.82) {
      // CPU is falling behind GPU
      bottleneckPercent = Math.min(65, Math.round(((effectiveGpuDemand - effectiveCpuDemand) / effectiveGpuDemand) * 100));
      mainBottleneck = 'CPU Bound';
    } else if (effectiveGpuDemand < effectiveCpuDemand * 0.82) {
      // GPU is falling behind CPU
      bottleneckPercent = Math.min(65, Math.round(((effectiveCpuDemand - effectiveGpuDemand) / effectiveCpuDemand) * 100));
      mainBottleneck = 'GPU Bound';
    } else {
      bottleneckPercent = Math.max(2, Math.round(Math.abs(effectiveCpuDemand - effectiveGpuDemand) * 0.25));
      mainBottleneck = 'Balanced Synergy';
    }

    let severity: 'Minimal' | 'Mild' | 'Noticeable' | 'Severe' = 'Minimal';
    if (bottleneckPercent > 32) severity = 'Severe';
    else if (bottleneckPercent > 18) severity = 'Noticeable';
    else if (bottleneckPercent > 9) severity = 'Mild';
    else severity = 'Minimal';

    // FPS estimation
    const baseFps = Math.min(cpuBase * 2.8, gpuBase * 3.2);
    let fpsMultiplier = resolution === '1080p' ? 1.6 : resolution === '1440p' ? 1.1 : resolution === '4K' ? 0.65 : 0.35;
    const estimatedFps = Math.round(baseFps * fpsMultiplier);

    const systemTdp = (selectedCpu.tdpWatts || 105) + (selectedGpu.tdpWatts || 220) + 95;
    const recommendedPsuWatts = Math.ceil((systemTdp * 1.35) / 50) * 50;

    const bPercent: number = bottleneckPercent ?? 0;

    return {
      cpuScore: Math.round(cpuBase),
      gpuScore: Math.round(gpuBase),
      bottleneckPercent: bPercent,
      mainBottleneck,
      severity,
      estimatedFps,
      systemTdp,
      recommendedPsuWatts,
      ramSufficiency: 96,
    };
  }, [selectedCpu, selectedGpu, resolution, workload]);

  const currentBottleneckPct: number = calculation?.bottleneckPercent ?? 0;

  // Gauge Angle Helpers (0% to 100% mapped to -90deg to +90deg or circle arc)
  const getGaugeColor = (pct: number) => {
    if (pct <= 8) return '#10b981'; // Emerald (Optimal)
    if (pct <= 18) return '#0ea5e9'; // Sky blue (Good)
    if (pct <= 30) return '#f59e0b'; // Amber (Noticeable)
    return '#ef4444'; // Red (Severe)
  };

  const gaugeStrokeColor = getGaugeColor(currentBottleneckPct);

  // SVG Gauge calculations
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semicircle gauge: arc from 180 to 0 degrees
  const arcLength = Math.PI * normalizedRadius;
  const strokeDashoffset = arcLength - (currentBottleneckPct / 100) * arcLength;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-gray-900 to-purple-950/40 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              Hardware Bottleneck & Synergy Analyzer
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                CompTIA Lab Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time IPC, VRAM bandwidth, thermal envelope, and resolution scaling synergy evaluator.
          </p>
        </div>

        {onSaveAsCombo && (
          <button
            onClick={() => {
              onSaveAsCombo({
                cpu: selectedCpu,
                gpu: selectedGpu,
                ram: selectedRam,
                resolution,
                workload,
                bottleneckPercent: currentBottleneckPct,
                mainBottleneck: calculation.mainBottleneck,
              });
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Save to Build Planner Combo</span>
          </button>
        )}
      </div>

      {/* Main Grid: Inputs vs Interactive Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Component & Workload Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hardware Selectors Card */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. Select Hardware Combination
            </h4>

            {/* CPU Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Processor (CPU)
                </span>
                <span className="text-cyan-400 font-bold">
                  {selectedCpu ? `$${selectedCpu.unitCost.toFixed(2)} • ${selectedCpu.socket || 'AM5/LGA1700'} • ${selectedCpu.tdpWatts || 105}W` : ''}
                </span>
              </div>
              <select
                value={selectedCpuId}
                onChange={(e) => setSelectedCpuId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              >
                {cpus.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.socket || 'Standard'} - {c.tdpWatts || 105}W) - ${c.unitCost.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* GPU Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Graphics Card (GPU)
                </span>
                <span className="text-purple-400 font-bold">
                  {selectedGpu ? `$${selectedGpu.unitCost.toFixed(2)} • ${selectedGpu.storageCapacity || 'VRAM'} • ${selectedGpu.tdpWatts || 220}W` : ''}
                </span>
              </div>
              <select
                value={selectedGpuId}
                onChange={(e) => setSelectedGpuId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              >
                {gpus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.storageCapacity || 'VRAM'} - {g.tdpWatts || 200}W) - ${g.unitCost.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* RAM Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  System Memory (RAM)
                </span>
                <span className="text-emerald-400 font-bold">
                  {selectedRam ? `$${selectedRam.unitCost.toFixed(2)} • ${selectedRam.storageCapacity || '32GB'}` : ''}
                </span>
              </div>
              <select
                value={selectedRamId}
                onChange={(e) => setSelectedRamId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              >
                {rams.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} - ${r.unitCost.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resolution & Workload Target Card */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              2. Target Resolution & Workload Profile
            </h4>

            {/* Target Resolution Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">Display Resolution Target:</label>
              <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                {(['1080p', '1440p', 'Ultrawide', '4K', '8K'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      resolution === res
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-md shadow-cyan-950/50'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <div>{res}</div>
                    <div className="text-[9px] text-gray-500 font-normal">
                      {res === '1080p'
                        ? 'FHD'
                        : res === '1440p'
                        ? 'QHD'
                        : res === 'Ultrawide'
                        ? '3440x1440'
                        : res === '4K'
                        ? '2160p'
                        : '4320p'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Workload Profile */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-400">Target Application / Workload:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                {[
                  { id: 'aaa_gaming', label: 'AAA Gaming Ultra', icon: <Gamepad2 className="w-3.5 h-3.5 text-purple-400" /> },
                  { id: 'competitive_fps', label: 'Esports High-FPS', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: 'video_editing', label: '4K/8K Video Edit', icon: <Layers className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: '3d_rendering', label: '3D Blender / Maya', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: 'ai_inference', label: 'Local LLM / PyTorch', icon: <Cpu className="w-3.5 h-3.5 text-pink-400" /> },
                  { id: 'cad_engineering', label: 'CAD & Simulation', icon: <Award className="w-3.5 h-3.5 text-teal-400" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setWorkload(item.id as any)}
                    className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                      workload === item.id
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500/60 font-semibold'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Gauge & Analysis Output (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-950 via-gray-950 to-[#0a0f18] border border-gray-800 space-y-6 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            {/* Background Ambient Glow */}
            <div
              className="absolute -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all"
              style={{ backgroundColor: gaugeStrokeColor }}
            ></div>

            {/* Gauge Header */}
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-semibold">
                System Bottleneck Metric
              </span>
              <h4 className="text-xl font-bold font-mono text-white flex items-center justify-center gap-2">
                {calculation.mainBottleneck}
              </h4>
            </div>

            {/* Interactive Semi-Circle Gauge SVG */}
            <div className="relative w-64 h-36 flex items-end justify-center z-10">
              <svg width="240" height="130" viewBox="0 0 240 130" className="overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 30 120 A 90 90 0 0 1 210 120"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Foreground Dynamic Arc */}
                <path
                  d="M 30 120 A 90 90 0 0 1 210 120"
                  fill="none"
                  stroke={gaugeStrokeColor}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 90}`}
                  strokeDashoffset={`${Math.PI * 90 * (1 - Math.min(1, currentBottleneckPct / 60))}`}
                  className="transition-all duration-700 ease-out"
                />

                {/* Tick Indicators */}
                <text x="30" y="140" fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="middle">0% (Ideal)</text>
                <text x="120" y="24" fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="middle">30% (Noticeable)</text>
                <text x="210" y="140" fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="middle">60%+ (Severe)</text>
              </svg>

              {/* Centered Large Metric */}
              <div className="absolute bottom-2 flex flex-col items-center">
                <div className="text-4xl font-black font-mono tracking-tight" style={{ color: gaugeStrokeColor }}>
                  {currentBottleneckPct}%
                </div>
                <div
                  className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 border"
                  style={{
                    backgroundColor: `${gaugeStrokeColor}20`,
                    borderColor: `${gaugeStrokeColor}60`,
                    color: gaugeStrokeColor,
                  }}
                >
                  {calculation.severity} Impact
                </div>
              </div>
            </div>

            {/* Performance Indicators Grid */}
            <div className="w-full grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-800/80 font-mono text-left z-10">
              <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">CPU Synergy Index</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">
                  {calculation.cpuScore} / 100
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${calculation.cpuScore}%` }}></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">GPU Power Index</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">
                  {calculation.gpuScore} / 100
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${calculation.gpuScore}%` }}></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">Est. Avg FPS ({resolution})</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  ~{calculation.estimatedFps} FPS
                </div>
                <div className="text-[9px] text-gray-500">Ultra Preset Baseline</div>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="text-[10px] text-gray-500 uppercase">Recommended PSU</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {calculation.recommendedPsuWatts}W
                </div>
                <div className="text-[9px] text-gray-500">System TDP: {calculation.systemTdp}W</div>
              </div>
            </div>

            {/* Diagnostic Advice Message */}
            <div className="w-full p-3 rounded-xl bg-gray-900/90 border border-gray-800 text-left font-mono text-xs space-y-1 z-10">
              <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Technician Recommendation:</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {currentBottleneckPct <= 10
                  ? `Excellent synergy! The ${selectedCpu?.name} and ${selectedGpu?.name} operate in harmonic balance at ${resolution} with negligible frametime variance.`
                  : calculation.mainBottleneck === 'CPU Bound'
                  ? `The CPU is limiting the GPU's raster throughput at ${resolution}. Consider pairing with a higher-IPC processor (e.g., Ryzen 7 7800X3D or Core i7-14700K) or upgrading to a 1440p/4K display to shift workload to the GPU.`
                  : `The GPU is running near 100% capacity while the CPU has surplus headroom. This is normal for heavy AAA ${resolution} graphics, but upgrading to a higher-tier GPU will unlock higher frame rates.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
