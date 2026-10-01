import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  OSCILLOSCOPE_PRESETS,
  LOGIC_PROTOCOL_FRAMES,
  USB_PD_PROFILES,
  INTEL_POWER_SEQUENCE_CHAIN,
  BGA_STENCIL_DATABASE,
  VRM_POWER_STAGES,
  WaveformPreset,
  LogicProtocolFrame,
  UsbPdProfile,
  PowerSequenceSignal,
  BgaStencilSpec,
  VrmPowerStageSpec,
} from '../data/signalDatabase';
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Search,
  Zap,
  Key,
  X,
  Volume2,
  Lock,
  Unlock,
  AlertTriangle,
  Terminal,
  Radio,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Gauge,
  Thermometer,
  ShieldAlert,
  Flame,
  Clock,
  Eye,
  Crosshair,
  Maximize2,
  Play,
  Pause,
} from 'lucide-react';

export type Module6ToolId =
  | 'oscilloscope'
  | 'logic_analyzer'
  | 'usb_pd'
  | 'power_sequence'
  | 'bga_stencil'
  | 'clock_crystals'
  | 'vrm_mosfet'
  | 'esd_protection';

export const SignalIntegritySuite: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool state
  const [activeTool, setActiveTool] = useState<Module6ToolId>('oscilloscope');

  // AI Drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 6.1 State: Digital Storage Oscilloscope (DSO)
  // -------------------------------------------------------------
  const [selectedWaveId, setSelectedWaveId] = useState<string>('wave-rtc-32k');
  const [isWaveRunning, setIsWaveRunning] = useState<boolean>(true);
  const [voltDivIndex, setVoltDivIndex] = useState<number>(2); // 100mV, 200mV, 500mV, 1V, 2V
  const [timeDivIndex, setTimeDivIndex] = useState<number>(2);
  const [couplingMode, setCouplingMode] = useState<'AC' | 'DC'>('AC');
  const [probeAttenuation, setProbeAttenuation] = useState<'1X' | '10X'>('10X');
  const [triggerLevel, setTriggerLevel] = useState<number>(0.5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // Tool 6.2 State: Logic Analyzer & Protocol Decoder
  // -------------------------------------------------------------
  const [selectedFrameId, setSelectedFrameId] = useState<string>('proto-i2c-nack-tps');
  const [busFilter, setBusFilter] = useState<string>('all');

  // -------------------------------------------------------------
  // Tool 6.3 State: USB-PD CC Line & EPR Protocol Analyzer
  // -------------------------------------------------------------
  const [selectedPdId, setSelectedPdId] = useState<string>('pd-20v-5a');
  const [cc1Voltage, setCc1Voltage] = useState<number>(1.68);
  const [cc2Voltage, setCc2Voltage] = useState<number>(0.0);
  const [eMarkerDetected, setEMarkerDetected] = useState<boolean>(true);

  // -------------------------------------------------------------
  // Tool 6.4 State: Power Sequence & State Machine
  // -------------------------------------------------------------
  const [failedSignalStep, setFailedSignalStep] = useState<number>(4); // RSMRST# missing
  const [activePlatform, setActivePlatform] = useState<'Intel_Core' | 'AMD_Zen' | 'Apple_Silicon'>('Intel_Core');

  // -------------------------------------------------------------
  // Tool 6.5 State: BGA Reballing, Stencil & Thermal Profile
  // -------------------------------------------------------------
  const [selectedBgaId, setSelectedBgaId] = useState<string>('bga-ga102');
  const [selectedAlloy, setSelectedAlloy] = useState<'Sn63/Pb37' | 'SAC305' | 'Sn42/Bi58'>('Sn63/Pb37');
  const [pcbThicknessMm, setPcbThicknessMm] = useState<number>(1.6);

  // -------------------------------------------------------------
  // Tool 6.6 State: Clock Crystals & Load Capacitance
  // -------------------------------------------------------------
  const [crystalNominalFreq, setCrystalNominalFreq] = useState<number>(32768);
  const [crystalTargetCl, setCrystalTargetCl] = useState<number>(12.5); // pF
  const [strayCapacitance, setStrayCapacitance] = useState<number>(3.0); // pF

  // -------------------------------------------------------------
  // Tool 6.7 State: VRM DrMOS Power Stage Sandbox
  // -------------------------------------------------------------
  const [selectedVrmId, setSelectedVrmId] = useState<string>('vrm-sic634');
  const [phaseCount, setPhaseCount] = useState<number>(8);
  const [cpuCurrentDrawA, setCpuCurrentDrawA] = useState<number>(140);

  // -------------------------------------------------------------
  // Tool 6.8 State: ESD Protection & EMI Filter Matrix
  // -------------------------------------------------------------
  const [differentialLine, setDifferentialLine] = useState<'HDMI_2.1' | 'USB4_40G' | 'DisplayPort_1.4'>('USB4_40G');
  const [chokeImpedanceOhms, setChokeImpedanceOhms] = useState<number>(90);
  const [tvsCapacitancePf, setTvsCapacitancePf] = useState<number>(0.25);

  // Selected object references
  const currentWave = OSCILLOSCOPE_PRESETS.find((w) => w.id === selectedWaveId) || OSCILLOSCOPE_PRESETS[0];
  const currentFrame = LOGIC_PROTOCOL_FRAMES.find((f) => f.id === selectedFrameId) || LOGIC_PROTOCOL_FRAMES[0];
  const currentPd = USB_PD_PROFILES.find((p) => p.id === selectedPdId) || USB_PD_PROFILES[0];
  const currentBga = BGA_STENCIL_DATABASE.find((b) => b.id === selectedBgaId) || BGA_STENCIL_DATABASE[0];
  const currentVrm = VRM_POWER_STAGES.find((v) => v.id === selectedVrmId) || VRM_POWER_STAGES[0];

  // -------------------------------------------------------------
  // Oscilloscope Canvas Rendering Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTool !== 'oscilloscope') return;

    let phase = 0;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope CRT background
      ctx.fillStyle = '#06130b';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines (Green Phosphor Reticle)
      ctx.strokeStyle = '#0e3a1f';
      ctx.lineWidth = 1;

      const gridCols = 10;
      const gridRows = 8;
      const colW = w / gridCols;
      const rowH = h / gridRows;

      ctx.beginPath();
      for (let i = 1; i < gridCols; i++) {
        ctx.moveTo(i * colW, 0);
        ctx.lineTo(i * colW, h);
      }
      for (let j = 1; j < gridRows; j++) {
        ctx.moveTo(0, j * rowH);
        ctx.lineTo(w, j * rowH);
      }
      ctx.stroke();

      // Center crosshairs with tick marks
      ctx.strokeStyle = '#185d34';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Render Dynamic Waveform Trace
      ctx.strokeStyle = '#10b981'; // Phosphor Green
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const centerY = h / 2;
      const points = 300;

      for (let x = 0; x <= points; x++) {
        const normX = x / points;
        const timeVal = normX + phase;
        const rawV = currentWave.pointsGenerator(timeVal);

        // Scale voltage to vertical pixels based on voltDiv
        const voltScale = (rowH / (currentWave.voltDivMv / 1000)) * (probeAttenuation === '10X' ? 1.0 : 1.2);
        const y = centerY - rawV * voltScale * 0.4;

        const screenX = normX * w;
        if (x === 0) {
          ctx.moveTo(screenX, y);
        } else {
          ctx.lineTo(screenX, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset blur

      // Trigger line indicator
      const trigY = centerY - triggerLevel * (rowH / (currentWave.voltDivMv / 1000)) * 0.4;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, trigY);
      ctx.lineTo(w, trigY);
      ctx.stroke();
      ctx.setLineDash([]);

      // OSD text overlay on canvas
      ctx.fillStyle = '#10b981';
      ctx.font = '11px monospace';
      ctx.fillText(`CH1: ${currentWave.voltDivMv}mV/div (${probeAttenuation}) [${couplingMode}]`, 12, 20);
      ctx.fillText(`TIME: ${currentWave.timeDivUs}µs/div  FREQ: ${currentWave.nominalFreq}`, 12, 36);
      ctx.fillText(`Vpp: ${currentWave.nominalVpp}  TRIG: ${(triggerLevel * 1000).toFixed(0)}mV`, 12, 52);

      if (isWaveRunning) {
        phase += 0.012;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeTool, selectedWaveId, isWaveRunning, couplingMode, probeAttenuation, triggerLevel]);

  // Compile diagnostic payload for Gemini AI Copilot
  const getToolDiagnosticPayload = () => {
    switch (activeTool) {
      case 'oscilloscope': {
        return {
          tool: 'Digital Storage Oscilloscope (DSO) Signal Integrity',
          waveformSelected: currentWave.name,
          category: currentWave.category,
          nominalFreq: currentWave.nominalFreq,
          nominalVpp: currentWave.nominalVpp,
          couplingMode,
          probeAttenuation,
          triggerLevel: `${(triggerLevel * 1000).toFixed(0)} mV`,
          healthyCriteria: currentWave.healthyCriteria,
          faultSymptoms: currentWave.faultSymptoms,
        };
      }
      case 'logic_analyzer': {
        return {
          tool: 'Logic Analyzer & Protocol Decoder Matrix',
          busType: currentFrame.busType,
          clockRate: currentFrame.clockRate,
          voltageLevel: currentFrame.voltageLevel,
          addressOrCommand: currentFrame.addressOrCommand,
          dataBytes: currentFrame.dataBytes,
          ackStatus: currentFrame.ackStatus,
          benchTriageNotes: currentFrame.benchTriageNotes,
        };
      }
      case 'usb_pd': {
        return {
          tool: 'Power Delivery (USB-PD / Type-C) CC Line & EPR Protocol Analyzer',
          profileSelected: currentPd.id,
          voltageV: `${currentPd.voltageV}V`,
          currentA: `${currentPd.currentA}A`,
          maxPowerW: `${currentPd.maxPowerW}W`,
          cc1Voltage: `${cc1Voltage.toFixed(2)}V`,
          cc2Voltage: `${cc2Voltage.toFixed(2)}V`,
          eMarkerPresent: eMarkerDetected,
          negotiationStage: currentPd.negotiationStage,
          failureMode: currentPd.failureMode,
        };
      }
      case 'power_sequence': {
        const failedSignal = INTEL_POWER_SEQUENCE_CHAIN.find((s) => s.order === failedSignalStep);
        return {
          tool: 'Power Sequence & State Machine (Intel S5 to S0)',
          platform: activePlatform,
          failedStepNumber: failedSignalStep,
          failedSignalName: failedSignal?.signalName,
          expectedVoltage: failedSignal?.nominalVoltage,
          originatingChip: failedSignal?.originatingChip,
          receivingChip: failedSignal?.receivingChip,
          troubleshootingDirective: failedSignal?.troubleshootingIfMissing,
        };
      }
      case 'bga_stencil': {
        return {
          tool: 'BGA Reballing, Stencil & Solder Ball Pitch Database',
          component: currentBga.componentName,
          ballCount: currentBga.ballCount,
          ballPitch: `${currentBga.ballPitchMm} mm`,
          ballDiameter: `${currentBga.ballDiameterMm} mm`,
          selectedAlloy,
          preheatTempC: currentBga.preheatTempC,
          peakReflowTempC: currentBga.peakReflowTempC,
          pcbThicknessMm,
        };
      }
      case 'clock_crystals': {
        // Compute required C1 & C2 assuming C1 = C2:
        // CL = (C1 * C2)/(C1 + C2) + Cstray => (C / 2) + Cstray = CL => C = 2 * (CL - Cstray)
        const requiredExtCap = 2 * (crystalTargetCl - strayCapacitance);
        return {
          tool: 'Clock Distribution & Crystal Oscillator Triage',
          nominalFreq: `${crystalNominalFreq} Hz`,
          targetLoadCapacitanceCl: `${crystalTargetCl} pF`,
          strayPcbCapacitance: `${strayCapacitance} pF`,
          calculatedC1C2LoadCaps: `${requiredExtCap.toFixed(1)} pF (Standard 5% C0G/NP0 Ceramic)`,
        };
      }
      case 'vrm_mosfet': {
        const currentPerPhase = (cpuCurrentDrawA / phaseCount).toFixed(1);
        return {
          tool: 'High-Side/Low-Side VRM & MOSFET Gate Driver Sandbox',
          powerStageModel: currentVrm.partNumber,
          package: currentVrm.packageType,
          totalPhases: phaseCount,
          totalCurrentDrawA: `${cpuCurrentDrawA} A`,
          currentPerPhaseA: `${currentPerPhase} A (Rated max: ${currentVrm.maxCurrentA} A)`,
          bootstrapCapacitance: currentVrm.bootstrapCapUf,
          failureSignatures: currentVrm.failureSignatures,
        };
      }
      case 'esd_protection': {
        return {
          tool: 'ESD Protection & EMI Filter Matrix',
          differentialLine,
          chokeImpedance: `${chokeImpedanceOhms} Ω`,
          tvsJunctionCapacitance: `${tvsCapacitancePf} pF`,
          eyeDiagramIntegrity: tvsCapacitancePf < 0.3 ? 'Compliant (<0.3pF preserves eye height)' : 'Excessive Capacitance Distortion Warning',
        };
      }
    }
  };

  const handleRunAiAnalysis = async (userPrompt?: string) => {
    setAiLoading(true);
    const payload = getToolDiagnosticPayload();
    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 6: SIGNAL INTEGRITY, OSCILLOSCOPE & PROTOCOL LAB',
        toolName: activeTool,
        inputPayload: payload,
        userRole: currentUser?.role || 'ROLE_STUDENT',
        customPrompt: userPrompt || aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Signal Analysis Complete',
        message: 'Waveform and bus timing diagnostic report generated.',
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

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-indigo-400 font-bold">Module 06</span>
            <span className="text-gray-600">/</span>
            <span>Signal Integrity & Oscilloscope Laboratory</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Signal Integrity, Waveform & Logic Analyzer Suite
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            DSO digital oscilloscope, I2C/SPI protocol decoders, USB-PD CC line triage, S0-S5 power sequencing, and BGA reballing.
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
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-[#161b22] border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            AI Copilot Drawer {isAiDrawerOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* 8-Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { id: 'oscilloscope', label: 'DSO Waveform', icon: Activity },
          { id: 'logic_analyzer', label: 'Logic Decoder', icon: Radio },
          { id: 'usb_pd', label: 'USB-PD & CC', icon: Zap },
          { id: 'power_sequence', label: 'Power Sequence', icon: Clock },
          { id: 'bga_stencil', label: 'BGA Reballing', icon: Flame },
          { id: 'clock_crystals', label: 'Clock & Crystals', icon: Crosshair },
          { id: 'vrm_mosfet', label: 'VRM DrMOS Stage', icon: Gauge },
          { id: 'esd_protection', label: 'ESD & EMI Filter', icon: ShieldAlert },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as Module6ToolId)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-400/60 text-white shadow-md shadow-cyan-950/50'
                  : 'bg-[#111827] border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
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
          {/* TOOL 6.1: Digital Storage Oscilloscope (DSO) */}
          {/* ========================================================= */}
          {activeTool === 'oscilloscope' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Digital Storage Oscilloscope (DSO) Waveform Visualizer
                  </h3>
                  <p className="text-xs text-gray-400">
                    High-speed signal trace simulation for crystal oscillators, VRM ripple, I2C serial frames, and PCIe eye diagrams.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWaveRunning(!isWaveRunning)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      isWaveRunning
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-amber-500/20 border-amber-500 text-amber-300'
                    }`}
                  >
                    {isWaveRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isWaveRunning ? 'RUN / LIVE' : 'STOP / FROZEN'}
                  </button>
                </div>
              </div>

              {/* Signal Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {OSCILLOSCOPE_PRESETS.map((wave) => (
                  <button
                    key={wave.id}
                    onClick={() => {
                      setSelectedWaveId(wave.id);
                      setCouplingMode(wave.coupling);
                      setProbeAttenuation(wave.probeAttenuation);
                    }}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedWaveId === wave.id
                        ? 'bg-emerald-950/50 border-emerald-500/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-[10px] text-emerald-400 font-bold">{wave.category}</div>
                    <div className="font-bold text-gray-200 truncate">{wave.name}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Nominal: {wave.nominalFreq}</div>
                  </button>
                ))}
              </div>

              {/* Oscilloscope Screen (HTML5 Canvas CRT) */}
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-950 bg-black shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={320}
                  className="w-full h-72 sm:h-80 block"
                />
              </div>

              {/* Oscilloscope Control Panel */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-gray-400 block mb-1">Coupling Mode:</span>
                    <div className="flex rounded border border-gray-700 overflow-hidden">
                      <button
                        onClick={() => setCouplingMode('AC')}
                        className={`flex-1 py-1.5 text-center font-bold ${
                          couplingMode === 'AC' ? 'bg-emerald-600 text-white' : 'bg-[#1e293b] text-gray-400'
                        }`}
                      >
                        AC
                      </button>
                      <button
                        onClick={() => setCouplingMode('DC')}
                        className={`flex-1 py-1.5 text-center font-bold ${
                          couplingMode === 'DC' ? 'bg-emerald-600 text-white' : 'bg-[#1e293b] text-gray-400'
                        }`}
                      >
                        DC
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Probe Attenuation:</span>
                    <div className="flex rounded border border-gray-700 overflow-hidden">
                      <button
                        onClick={() => setProbeAttenuation('1X')}
                        className={`flex-1 py-1.5 text-center font-bold ${
                          probeAttenuation === '1X' ? 'bg-cyan-600 text-white' : 'bg-[#1e293b] text-gray-400'
                        }`}
                      >
                        1X (1MΩ)
                      </button>
                      <button
                        onClick={() => setProbeAttenuation('10X')}
                        className={`flex-1 py-1.5 text-center font-bold ${
                          probeAttenuation === '10X' ? 'bg-cyan-600 text-white' : 'bg-[#1e293b] text-gray-400'
                        }`}
                      >
                        10X (10MΩ)
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Trigger Level:</span>
                    <input
                      type="range"
                      min={-100}
                      max={200}
                      value={Math.round(triggerLevel * 100)}
                      onChange={(e) => setTriggerLevel(Number(e.target.value) / 100)}
                      className="w-full accent-amber-500"
                    />
                    <span className="text-[10px] text-amber-400">{(triggerLevel * 1000).toFixed(0)} mV</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Bandwidth Filter:</span>
                    <div className="p-1.5 bg-[#1e293b] border border-gray-700 rounded text-center text-cyan-300 font-bold">
                      20 MHz BW Limit ON
                    </div>
                  </div>
                </div>

                {/* Healthy vs Fault Diagnostic Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-emerald-300">
                    <strong className="block mb-1">✅ Healthy Waveform Bench Standard:</strong>
                    {currentWave.healthyCriteria}
                  </div>
                  <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-lg text-red-300">
                    <strong className="block mb-1">⚠️ Failure Symptoms & Fault Diagnosis:</strong>
                    {currentWave.faultSymptoms}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.2: Logic Analyzer & Protocol Decoder */}
          {/* ========================================================= */}
          {activeTool === 'logic_analyzer' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  Logic Analyzer & Protocol Decoder Matrix
                </h3>
                <p className="text-xs text-gray-400">
                  Decode serial communications across I2C, SPI, UART, and SMBus battery management buses with packet analysis.
                </p>
              </div>

              {/* Protocol Packets Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {LOGIC_PROTOCOL_FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrameId(frame.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedFrameId === frame.id
                        ? 'bg-cyan-950/50 border-cyan-400/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-cyan-400">{frame.busType}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          frame.ackStatus === 'ACK'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {frame.ackStatus}
                      </span>
                    </div>
                    <div className="text-gray-200 font-bold truncate">{frame.addressOrCommand}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{frame.clockRate}</div>
                  </button>
                ))}
              </div>

              {/* Protocol Packet Breakdown Card */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-white font-bold text-sm">
                    {currentFrame.busType} Bus Frame ({currentFrame.voltageLevel})
                  </span>
                  <span className="text-cyan-400 font-bold">Clock: {currentFrame.clockRate}</span>
                </div>

                {/* Packet Byte Stream Visualizer */}
                <div className="space-y-1">
                  <span className="text-gray-400 block mb-1">Packet Stream Bytes:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-2 bg-black border border-cyan-500/50 rounded text-cyan-400 font-bold">
                      [ADDR/CMD] {currentFrame.addressOrCommand}
                    </div>
                    {currentFrame.dataBytes.map((b, idx) => (
                      <div key={idx} className="px-3 py-2 bg-black border border-emerald-500/50 rounded text-emerald-400 font-bold">
                        [DATA {idx}] {b}
                      </div>
                    ))}
                    <div
                      className={`px-3 py-2 rounded font-bold border ${
                        currentFrame.ackStatus === 'ACK'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-red-950 border-red-500 text-red-300'
                      }`}
                    >
                      [{currentFrame.ackStatus}]
                    </div>
                  </div>
                </div>

                {/* Triage Note */}
                <div className="p-3 bg-gray-900 rounded border border-gray-700 text-gray-200">
                  <strong className="text-amber-400 block mb-1">🔍 Protocol Bus Diagnostic Analysis:</strong>
                  {currentFrame.benchTriageNotes}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.3: USB-PD CC Line & EPR Protocol Analyzer */}
          {/* ========================================================= */}
          {activeTool === 'usb_pd' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Power Delivery (USB-PD / Type-C) CC Line & EPR Protocol Analyzer
                </h3>
                <p className="text-xs text-gray-400">
                  Troubleshoot Type-C charging stuck at 5V, inspect CC1/CC2 Rp-Rd voltage dividers, and verify EPR 240W PDO rules.
                </p>
              </div>

              {/* USB-PD Profile Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {USB_PD_PROFILES.map((pd) => (
                  <button
                    key={pd.id}
                    onClick={() => setSelectedPdId(pd.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedPdId === pd.id
                        ? 'bg-amber-950/50 border-amber-500/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-amber-400">PDO {pd.pdoIndex}</span>
                      <span className="text-[10px] text-gray-400">{pd.type.split(' ')[0]}</span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      {pd.voltageV}V @ {pd.currentA}A ({pd.maxPowerW}W)
                    </div>
                  </button>
                ))}
              </div>

              {/* Interactive CC Line Resistance & Voltage Sandbox */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  CC1 / CC2 Configuration Channel Triage (5.1kΩ Rd Pull-Down)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-black/60 rounded border border-gray-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold">CC1 Line DC Voltage:</span>
                      <span className="text-cyan-400 font-bold">{cc1Voltage.toFixed(2)} V</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={330}
                      value={Math.round(cc1Voltage * 100)}
                      onChange={(e) => setCc1Voltage(Number(e.target.value) / 100)}
                      className="w-full accent-cyan-500"
                    />
                    <div className="text-[10px] text-gray-400">
                      Normal DFP/UFP connected voltage is between 0.4V and 2.04V. If 0V, 5.1kΩ pull-down resistor or EC pin is open.
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded border border-gray-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold">E-Marker Cable Chip:</span>
                      <button
                        onClick={() => setEMarkerDetected(!eMarkerDetected)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eMarkerDetected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {eMarkerDetected ? 'E-MARKER 5A VALID' : 'NO E-MARKER (3A MAX)'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 pt-1">
                      Power Delivery over 60W (3A) mandates an electronically marked cable responding to SOP' packets over VCONN (5V).
                    </p>
                  </div>
                </div>

                {/* Failure Analysis Directive */}
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded text-amber-300">
                  <strong className="block mb-0.5">⚠️ Charging Handshake Fault Indicator:</strong>
                  {currentPd.failureMode}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.4: Power Sequence & State Machine */}
          {/* ========================================================= */}
          {activeTool === 'power_sequence' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Motherboard Power Sequence & State Machine (G3 to S0)
                </h3>
                <p className="text-xs text-gray-400">
                  Step-by-step signal chain simulator. Click any prerequisite signal to test fault propagation down the motherboard.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="flex gap-2">
                {(['Intel_Core', 'AMD_Zen', 'Apple_Silicon'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setActivePlatform(plat)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      activePlatform === plat
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#161b22] border-gray-800 text-gray-400'
                    }`}
                  >
                    {plat.replace('_', ' ')} Architecture
                  </button>
                ))}
              </div>

              {/* Interactive Power Sequence Timeline */}
              <div className="space-y-2 font-mono text-xs">
                {INTEL_POWER_SEQUENCE_CHAIN.map((step) => {
                  const isPassed = step.order < failedSignalStep;
                  const isCurrentFailed = step.order === failedSignalStep;
                  const isBlocked = step.order > failedSignalStep;

                  return (
                    <div
                      key={step.order}
                      onClick={() => setFailedSignalStep(step.order)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isCurrentFailed
                          ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-950/50'
                          : isPassed
                          ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                          : 'bg-[#161b22] border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              isCurrentFailed
                                ? 'bg-red-500 text-white'
                                : isPassed
                                ? 'bg-emerald-500 text-black'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {step.order}
                          </span>
                          <strong className="text-white text-sm">{step.signalName}</strong>
                          <span className="text-[11px] text-cyan-400">({step.nominalVoltage})</span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {step.originatingChip} ➔ {step.receivingChip}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1">{step.description}</p>

                      {isCurrentFailed && (
                        <div className="mt-2 p-2 bg-black/80 rounded border border-red-500/60 text-red-300 text-[11px]">
                          <strong>❌ FAULT ISOLATION DIRECTIVE:</strong> {step.troubleshootingIfMissing}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.5: BGA Reballing & Stencil Database */}
          {/* ========================================================= */}
          {activeTool === 'bga_stencil' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  BGA Reballing, Stencil & Solder Ball Pitch Database
                </h3>
                <p className="text-xs text-gray-400">
                  GPU and PCH ball pitch geometries, solder alloy melting curves, and 4-phase reflow temperature profiles.
                </p>
              </div>

              {/* BGA Chipset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {BGA_STENCIL_DATABASE.map((bga) => (
                  <button
                    key={bga.id}
                    onClick={() => setSelectedBgaId(bga.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedBgaId === bga.id
                        ? 'bg-red-950/50 border-red-500/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-[10px] text-red-400 font-bold">{bga.category}</div>
                    <div className="font-bold text-gray-200 truncate">{bga.componentName.split('(')[0]}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {bga.ballCount} Balls | {bga.ballPitchMm}mm Pitch
                    </div>
                  </button>
                ))}
              </div>

              {/* BGA Details & Thermal Profile Card */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-white font-bold text-sm">{currentBga.componentName}</span>
                  <span className="text-amber-400 font-bold">Ball Diam: {currentBga.ballDiameterMm}mm</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-black/60 rounded border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Preheat Ramp:</span>
                    <strong className="text-white text-sm">{currentBga.preheatTempC}°C</strong>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Soak Zone:</span>
                    <strong className="text-cyan-400 text-sm">{currentBga.preheatTempC + 20}°C</strong>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Peak Reflow:</span>
                    <strong className="text-red-400 text-sm">{currentBga.peakReflowTempC}°C</strong>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded border border-gray-800">
                    <span className="text-gray-400 text-[10px] block">Liquid Time (TAL):</span>
                    <strong className="text-emerald-400 text-sm">45 - 60 sec</strong>
                  </div>
                </div>

                <div className="text-gray-300">
                  <span className="text-cyan-400 font-semibold">Verified Hardware:</span> {currentBga.commonBoards}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.6: Clock Distribution & Crystal Oscillator Triage */}
          {/* ========================================================= */}
          {activeTool === 'clock_crystals' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-cyan-400" />
                  Clock Distribution & Crystal Load Capacitance Calculator
                </h3>
                <p className="text-xs text-gray-400">
                  Calculate exact surface-mount load capacitors (C1 & C2) to eliminate RTC drift and PCH PLL unlock hangs.
                </p>
              </div>

              {/* Formula Card */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-3 font-mono text-xs">
                <div className="text-white font-bold text-sm">Pierce Crystal Load Capacitance Equation:</div>
                <div className="p-3 bg-black rounded text-cyan-400 font-bold select-all">
                  C_L = (C1 * C2) / (C1 + C2) + C_stray  ==&gt;  If C1 = C2: C1 = 2 * (C_L - C_stray)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Target Load Capacitance ($C_L$):</label>
                    <input
                      type="number"
                      step={0.5}
                      value={crystalTargetCl}
                      onChange={(e) => setCrystalTargetCl(Number(e.target.value))}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white font-bold"
                    />
                    <span className="text-[10px] text-gray-500">Typical: 6.0pF, 9.0pF, or 12.5pF per crystal datasheet.</span>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">PCB Stray Parasitic Capacitance (C_stray):</label>
                    <input
                      type="number"
                      step={0.5}
                      value={strayCapacitance}
                      onChange={(e) => setStrayCapacitance(Number(e.target.value))}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white font-bold"
                    />
                    <span className="text-[10px] text-gray-500">Typical: 2.5pF to 4.0pF for multilayer FR4.</span>
                  </div>
                </div>

                {/* Computed Output */}
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-emerald-300">
                  <span className="text-xs text-gray-400 block mb-1">Recommended Physical SMD Load Capacitors:</span>
                  <strong className="text-lg font-bold text-white">
                    C1 = C2 = {(2 * (crystalTargetCl - strayCapacitance)).toFixed(1)} pF
                  </strong>
                  <p className="text-[11px] text-gray-300 mt-1">
                    Use high-stability C0G / NP0 dielectric capacitors with ±5% tolerance. Never use high-k X7R/Y5V for clock circuits due to piezoelectric microphonics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.7: High-Side/Low-Side VRM & MOSFET Stage */}
          {/* ========================================================= */}
          {activeTool === 'vrm_mosfet' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-amber-400" />
                  High-Side/Low-Side VRM & MOSFET Gate Driver Sandbox
                </h3>
                <p className="text-xs text-gray-400">
                  Calculate phase current sharing, DrMOS bootstrap capacitor values, and diagnose high-side MOSFET punctures.
                </p>
              </div>

              {/* DrMOS Power Stage Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {VRM_POWER_STAGES.map((vrm) => (
                  <button
                    key={vrm.id}
                    onClick={() => setSelectedVrmId(vrm.id)}
                    className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedVrmId === vrm.id
                        ? 'bg-amber-950/50 border-amber-500/80 text-white shadow-sm'
                        : 'bg-[#161b22] border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="font-bold text-white">{vrm.partNumber}</div>
                    <div className="text-[10px] text-amber-400 mt-1">Max: {vrm.maxCurrentA}A Continuous</div>
                  </button>
                ))}
              </div>

              {/* Phase Current Simulator */}
              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">
                      CPU VCORE Load: <strong className="text-white">{cpuCurrentDrawA} Amps</strong>
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={300}
                      value={cpuCurrentDrawA}
                      onChange={(e) => setCpuCurrentDrawA(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Active VRM Phases:</label>
                    <select
                      value={phaseCount}
                      onChange={(e) => setPhaseCount(Number(e.target.value))}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white font-bold"
                    >
                      <option value={4}>4-Phase Power Stage</option>
                      <option value={6}>6-Phase Power Stage</option>
                      <option value={8}>8-Phase Power Stage</option>
                      <option value={12}>12-Phase Power Stage</option>
                      <option value={16}>16-Phase Power Stage</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-black/60 rounded border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-300">Current Load Per Phase:</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {(cpuCurrentDrawA / phaseCount).toFixed(1)} A / phase (Rated: {currentVrm.maxCurrentA} A)
                  </span>
                </div>

                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded text-red-300">
                  <strong className="block mb-0.5">⚠️ Catastrophic Failure Mode:</strong>
                  {currentVrm.failureSignatures}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOL 6.8: ESD Protection & EMI Filter Matrix */}
          {/* ========================================================= */}
          {activeTool === 'esd_protection' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  ESD Protection & EMI Common-Mode Filter Matrix
                </h3>
                <p className="text-xs text-gray-400">
                  Ensure TVS diode capacitance (Cj &lt; 0.3pF) does not attenuate 10Gbps+ differential high-speed eye masks.
                </p>
              </div>

              {/* Interface Selector */}
              <div className="flex gap-2">
                {(['USB4_40G', 'HDMI_2.1', 'DisplayPort_1.4'] as const).map((line) => (
                  <button
                    key={line}
                    onClick={() => setDifferentialLine(line)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      differentialLine === line
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#161b22] border-gray-800 text-gray-400'
                    }`}
                  >
                    {line.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-[#161b22] border border-gray-800 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 block mb-1">
                      TVS Diode Junction Capacitance ($C_j$): <strong className="text-white">{tvsCapacitancePf} pF</strong>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={150}
                      value={Math.round(tvsCapacitancePf * 100)}
                      onChange={(e) => setTvsCapacitancePf(Number(e.target.value) / 100)}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Common-Mode Choke Impedance @ 100MHz:</label>
                    <input
                      type="number"
                      value={chokeImpedanceOhms}
                      onChange={(e) => setChokeImpedanceOhms(Number(e.target.value))}
                      className="w-full bg-[#1e293b] border border-gray-700 rounded p-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div
                  className={`p-3 rounded border text-xs ${
                    tvsCapacitancePf < 0.35
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/50 text-red-300'
                  }`}
                >
                  {tvsCapacitancePf < 0.35 ? (
                    <span>
                      ✅ <strong>Ultra-Low Capacitance Compliant:</strong> {tvsCapacitancePf}pF will preserve high-speed differential eye height and meet HDMI 2.1 Fixed Rate Link (FRL) specs.
                    </span>
                  ) : (
                    <span>
                      ❌ <strong>High-Frequency Signal Attenuation Hazard:</strong> {tvsCapacitancePf}pF exceeds maximum high-speed limits, rounding differential rise times and causing black screen drops.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dedicated Gemini AI Signal Copilot Drawer */}
        {isAiDrawerOpen && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#111827] border border-cyan-500/30 rounded-xl p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-bold font-mono text-white">Gemini Signal Copilot</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Oscilloscope AI
                </span>
              </div>

              <p className="text-xs text-gray-400">
                Live AI assistant receiving active waveform parameters, bus decodes, and power sequence states to provide deep bench triage.
              </p>

              {/* Action Trigger Button */}
              <button
                onClick={() => handleRunAiAnalysis()}
                disabled={aiLoading}
                className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-950"
              >
                {aiLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Analyzing Signal Parameters...
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
                <label className="text-[11px] font-mono text-gray-400">Custom Signal Inquiry (Optional):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Why is VRM ripple spiking to 75mV?"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunAiAnalysis();
                    }}
                    className="flex-1 bg-[#1e293b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleRunAiAnalysis()}
                    disabled={aiLoading}
                    className="p-1.5 bg-[#1e293b] hover:bg-gray-700 border border-gray-600 rounded text-cyan-400"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Analysis Response Card */}
              {aiResponse ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="text-cyan-400 flex items-center gap-1">
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
                  Ready to query oscilloscope waveform models and power stage diagnostics.
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
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold"
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
