import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  COMPTIA_ACRONYM_DATABASE,
  DIAGNOSTIC_ISO_CATALOG,
  HARDWARE_PORT_CATALOG,
  TROUBLESHOOTING_DRILL_SCENARIOS,
  CompTiaAcronym,
  BootableIsoTool,
  HardwarePortSpec,
  TroubleshootingScenario,
} from '../data/vocationalDatabase';
import {
  GraduationCap,
  Layers,
  HardDrive,
  Usb,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Key,
  X,
  RefreshCw,
  Play,
  ArrowUp,
  ArrowDown,
  Lock,
  Cpu,
  Tv,
  Network,
} from 'lucide-react';

type Module3ToolId =
  | 'pbq_simulator'
  | 'raid_simulator'
  | 'osi_sandbox'
  | 'ventoy_matrix'
  | 'acronym_decoder'
  | 'troubleshooting_drill'
  | 'port_matrix'
  | 'firewall_simulator';

export const VocationalEducationSuite: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool
  const [activeTool, setActiveTool] = useState<Module3ToolId>('pbq_simulator');

  // AI Socratic Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 3.1 State: PBQ Performance Simulator
  // -------------------------------------------------------------
  const [pbqScenario, setPbqScenario] = useState<'front_panel' | 'router_hardening' | 'raid_rebuild'>('front_panel');
  // Front-Panel Header Pinout Assembly state
  const [fpConnections, setFpConnections] = useState<Record<string, string>>({
    'pin_1_2': 'HDD_LED',
    'pin_3_4': 'PWR_LED',
    'pin_5_6': 'RESET_SW',
    'pin_7_8': 'PWR_SW',
  });
  const [pbqGraded, setPbqGraded] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);

  // Router hardening state
  const [routerSsid, setRouterSsid] = useState<string>('TradeTech_Secure');
  const [routerBroadcast, setRouterBroadcast] = useState<boolean>(false);
  const [routerSecurity, setRouterSecurity] = useState<string>('WPA3_Enterprise');
  const [routerAdminPass, setRouterAdminPass] = useState<string>('Admin@2026!TradeTech');
  const [routerMacFiltering, setRouterMacFiltering] = useState<boolean>(true);

  // -------------------------------------------------------------
  // Tool 3.2 State: RAID Topology & Parity Simulator
  // -------------------------------------------------------------
  const [raidLevel, setRaidLevel] = useState<'RAID 0' | 'RAID 1' | 'RAID 5' | 'RAID 6' | 'RAID 10'>('RAID 5');
  const [driveCount, setDriveCount] = useState<number>(4);
  const [driveCapacityTb, setDriveCapacityTb] = useState<number>(4);
  const [failedDriveIndex, setFailedDriveIndex] = useState<number | null>(null);

  // -------------------------------------------------------------
  // Tool 3.3 State: OSI 7-Layer & TCP/IP Stack
  // -------------------------------------------------------------
  const [selectedOsiLayer, setSelectedOsiLayer] = useState<number>(4); // Transport
  const [packetFlowDomain, setPacketFlowDomain] = useState<string>('DNS Query (UDP 53) to Root Server');

  // -------------------------------------------------------------
  // Tool 3.4 State: Bootable USB ISO & Ventoy Matrix
  // -------------------------------------------------------------
  const [selectedIsoTool, setSelectedIsoTool] = useState<BootableIsoTool>(DIAGNOSTIC_ISO_CATALOG[0]);
  const [isoSearch, setIsoSearch] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 3.5 State: Instant IT Acronym Decoder
  // -------------------------------------------------------------
  const [acronymSearch, setAcronymSearch] = useState<string>('');
  const [acronymDomainFilter, setAcronymDomainFilter] = useState<string>('All');
  const [activeAcronym, setActiveAcronym] = useState<CompTiaAcronym>(COMPTIA_ACRONYM_DATABASE[0]);

  // -------------------------------------------------------------
  // Tool 3.6 State: 6-Stage Troubleshooting Drill
  // -------------------------------------------------------------
  const [selectedDrillIndex, setSelectedDrillIndex] = useState<number>(0);
  const activeDrillScenario = TROUBLESHOOTING_DRILL_SCENARIOS[selectedDrillIndex];
  const [studentStageOrder, setStudentStageOrder] = useState<Array<{ stage: number; title: string; description: string }>>([
    ...activeDrillScenario.correctOrder,
  ]);
  const [drillScore, setDrillScore] = useState<number | null>(null);

  // -------------------------------------------------------------
  // Tool 3.7 State: Hardware Port Matrix
  // -------------------------------------------------------------
  const [selectedPort, setSelectedPort] = useState<HardwarePortSpec>(HARDWARE_PORT_CATALOG[0]);
  const [portFamilyFilter, setPortFamilyFilter] = useState<string>('All');

  // -------------------------------------------------------------
  // Tool 3.8 State: SOHO Firewall Rules Simulator
  // -------------------------------------------------------------
  const [firewallRules, setFirewallRules] = useState<
    Array<{ id: string; action: 'ALLOW' | 'DENY'; proto: 'TCP' | 'UDP' | 'ICMP'; src: string; dstPort: string; desc: string }>
  >([
    { id: '1', action: 'DENY', proto: 'TCP', src: 'ANY', dstPort: '23', desc: 'Block Telnet Cleartext' },
    { id: '2', action: 'ALLOW', proto: 'TCP', src: '192.168.10.0/24', dstPort: '22', desc: 'Allow Internal SSH Management' },
    { id: '3', action: 'ALLOW', proto: 'TCP', src: 'ANY', dstPort: '443', desc: 'Allow HTTPS Secure Web' },
    { id: '4', action: 'DENY', proto: 'TCP', src: 'ANY', dstPort: '3389', desc: 'Block Public Remote Desktop (RDP)' },
  ]);
  const [testPacket, setTestPacket] = useState<{ proto: 'TCP' | 'UDP'; dstPort: string; srcIp: string }>({
    proto: 'TCP',
    dstPort: '23',
    srcIp: '10.0.0.50',
  });
  const [packetResult, setPacketResult] = useState<string | null>(null);

  // Load API Key & saved Module 3 state
  useEffect(() => {
    const key = getStoredGeminiApiKey();
    setCustomApiKey(key);

    const saved = localStorage.getItem('tradetech_module3_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeTool) setActiveTool(parsed.activeTool);
        if (parsed.raidLevel) setRaidLevel(parsed.raidLevel);
        if (parsed.driveCount) setDriveCount(parsed.driveCount);
      } catch (e) {
        console.warn('Could not restore Module 3 state', e);
      }
    }
  }, []);

  // Save Module 3 state
  useEffect(() => {
    try {
      localStorage.setItem(
        'tradetech_module3_state',
        JSON.stringify({
          activeTool,
          raidLevel,
          driveCount,
          selectedDrillIndex,
        })
      );
    } catch (e) {
      console.warn('Failed saving module 3 state', e);
    }
  }, [activeTool, raidLevel, driveCount, selectedDrillIndex]);

  // -------------------------------------------------------------
  // Tool 3.1 PBQ Grading Engine
  // -------------------------------------------------------------
  const gradePbqScenario = () => {
    if (pbqScenario === 'front_panel') {
      let score = 0;
      const rubric = [];
      if (fpConnections['pin_7_8'] === 'PWR_SW') {
        score += 25;
        rubric.push('✓ Power Switch correctly placed on pins 7-8.');
      } else {
        rubric.push('✗ Power Switch misplaced. Standard Intel front panel headers place PWR_SW on top pins 7-8.');
      }
      if (fpConnections['pin_5_6'] === 'RESET_SW') {
        score += 25;
        rubric.push('✓ Reset Switch correctly placed on pins 5-6.');
      } else {
        rubric.push('✗ Reset Switch misplaced.');
      }
      if (fpConnections['pin_1_2'] === 'HDD_LED') {
        score += 25;
        rubric.push('✓ HDD Activity LED correctly polarized on pins 1-2.');
      } else {
        rubric.push('✗ HDD Activity LED misplaced.');
      }
      if (fpConnections['pin_3_4'] === 'PWR_LED') {
        score += 25;
        rubric.push('✓ Power LED correctly seated on pins 3-4.');
      } else {
        rubric.push('✗ Power LED misplaced.');
      }

      setPbqGraded({
        score,
        maxScore: 100,
        feedback: rubric.join('\n'),
      });
    } else if (pbqScenario === 'router_hardening') {
      let score = 0;
      const rubric = [];
      if (routerSecurity === 'WPA3_Enterprise' || routerSecurity === 'WPA3_Personal') {
        score += 30;
        rubric.push('✓ WPA3 encryption active (Simultaneous Authentication of Equals).');
      } else {
        rubric.push('✗ Insecure wireless mode. Legacy WPA/WEP vulnerable to offline dictionary attack.');
      }
      if (routerAdminPass.length >= 12 && /[A-Z]/.test(routerAdminPass) && /[0-9]/.test(routerAdminPass)) {
        score += 30;
        rubric.push('✓ Strong alphanumeric admin password enforced.');
      } else {
        rubric.push('✗ Weak admin password. Minimum 12 characters with mixed case required.');
      }
      if (routerMacFiltering) {
        score += 20;
        rubric.push('✓ 802.11 Layer 2 MAC address allowlist filtering enabled.');
      }
      if (!routerBroadcast) {
        score += 20;
        rubric.push('✓ SSID broadcast beacon suppressed.');
      }

      setPbqGraded({
        score,
        maxScore: 100,
        feedback: rubric.join('\n'),
      });
    }
  };

  // -------------------------------------------------------------
  // Tool 3.2 RAID Calculations Engine
  // -------------------------------------------------------------
  const calculateRaidStats = () => {
    const N = driveCount;
    const C = driveCapacityTb;
    let netCap = 0;
    let efficiency = 0;
    let faultTolerance = 0;
    let readIops = 'N x Read IOPS (Near Linear)';
    let writePenalty = '1x (No Penalty)';

    switch (raidLevel) {
      case 'RAID 0':
        netCap = N * C;
        efficiency = 100;
        faultTolerance = 0;
        readIops = `${N}x Speed`;
        writePenalty = 'None (0 Parity Overhead)';
        break;
      case 'RAID 1':
        netCap = C;
        efficiency = (1 / N) * 100;
        faultTolerance = N - 1;
        readIops = `${N}x Multi-Read`;
        writePenalty = 'Duplicate Writes (Mirror)';
        break;
      case 'RAID 5':
        netCap = (N - 1) * C;
        efficiency = ((N - 1) / N) * 100;
        faultTolerance = 1;
        readIops = `${N - 1}x Speed`;
        writePenalty = '4x IOPS (Read, Read, Write, Write)';
        break;
      case 'RAID 6':
        netCap = (N - 2) * C;
        efficiency = ((N - 2) / N) * 100;
        faultTolerance = 2;
        readIops = `${N - 2}x Speed`;
        writePenalty = '6x IOPS (Dual Reed-Solomon Parity)';
        break;
      case 'RAID 10':
        netCap = (N / 2) * C;
        efficiency = 50;
        faultTolerance = Math.floor(N / 2);
        readIops = `${N}x Parallel`;
        writePenalty = '2x IOPS (Striped Mirrors)';
        break;
    }

    return {
      netCap: Math.max(0, netCap),
      efficiency: Math.round(efficiency),
      faultTolerance,
      readIops,
      writePenalty,
    };
  };

  const raidStats = calculateRaidStats();

  // -------------------------------------------------------------
  // Universal AI Dispatcher for Module 3
  // -------------------------------------------------------------
  const handleRunAiAnalysis = async (toolTitle: string, payload: any) => {
    setAiLoading(true);
    setIsAiDrawerOpen(true);

    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 3: VOCATIONAL EDUCATION & COMPTIA STUDY SUITE',
        toolName: toolTitle,
        inputPayload: payload,
        userRole: isOwner ? 'ROLE_OWNER' : 'ROLE_STUDENT',
        customPrompt: aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Exam Coach Evaluated',
        message: `Socratic tutoring ready for ${toolTitle}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Exam Coach AI Error',
        message: err?.message || 'Check network connection or API Key.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Tool Nav Items for Module 3
  // -------------------------------------------------------------
  const toolNav: { id: Module3ToolId; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'pbq_simulator', label: '1. CompTIA PBQ Performance Simulator', icon: <GraduationCap className="w-4 h-4" />, badge: 'Hands-on' },
    { id: 'raid_simulator', label: '2. RAID Array Topology & Parity Simulator', icon: <HardDrive className="w-4 h-4" />, badge: 'RAID 0-10' },
    { id: 'osi_sandbox', label: '3. OSI 7-Layer & TCP/IP Protocol Stack', icon: <Layers className="w-4 h-4" />, badge: 'PDU Map' },
    { id: 'ventoy_matrix', label: '4. Diagnostic ISO & Ventoy USB Library', icon: <Usb className="w-4 h-4" />, badge: 'MemTest86' },
    { id: 'acronym_decoder', label: '5. Instant IT Acronym & Terminology', icon: <BookOpen className="w-4 h-4" />, badge: 'Analogies' },
    { id: 'troubleshooting_drill', label: '6. CompTIA 6-Stage Troubleshooting', icon: <CheckCircle2 className="w-4 h-4" />, badge: 'Methodology' },
    { id: 'port_matrix', label: '7. Hardware Port & Connector Identification', icon: <Tv className="w-4 h-4" />, badge: 'Pinouts' },
    { id: 'firewall_simulator', label: '8. SOHO Security & Firewall Simulator', icon: <ShieldAlert className="w-4 h-4" />, badge: 'Packets' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-emerald-400 font-bold">Module 03</span>
            <span className="text-gray-600">/</span>
            <span>CompTIA A+ / Net+ / Sec+ Certification Lab</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            Vocational Education & Certification Simulator
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Performance-based simulations (PBQs), RAID parity layouts, OSI encapsulation, and Socratic coaching.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1f2937] hover:bg-[#374151] text-gray-300 border border-gray-700 transition-all"
          >
            <Key className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>API Key {customApiKey ? '• Saved' : '• Default'}</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              isAiDrawerOpen
                ? 'bg-[#06b6d4] text-black shadow-md shadow-[#06b6d4]/20'
                : 'bg-[#111827] text-[#06b6d4] border border-[#06b6d4]/40 hover:bg-[#06b6d4]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiDrawerOpen ? 'Hide Exam Coach' : 'Consult Exam Coach'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tool View + AI Socratic Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 shadow-md">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider px-2 py-1 mb-1 font-semibold flex items-center justify-between">
              <span>8 CompTIA Vocational Tools</span>
              <span className="text-[#06b6d4]">Module 3</span>
            </div>
            <div className="space-y-1">
              {toolNav.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#06b6d4]/15 text-white border border-[#06b6d4]/60 font-semibold shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-[#06b6d4]' : 'text-gray-500'}>
                        {tool.icon}
                      </span>
                      <span className="truncate">{tool.label}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-1 shrink-0 ${
                        isActive
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-gray-800 text-xs text-gray-300 space-y-2 font-sans">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Socratic Learning Protocol
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Master the reasoning behind hardware choices. CompTIA exam performance questions test holistic troubleshooting methodology rather than rote memorization.
            </p>
          </div>
        </div>

        {/* Tool Workspace Container */}
        <div className={`space-y-6 ${isAiDrawerOpen ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          {/* ======================================================== */}
          {/* TOOL 3.1: CompTIA A+ PBQ Performance-Based Simulator */}
          {/* ======================================================== */}
          {activeTool === 'pbq_simulator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#06b6d4]" />
                    CompTIA A+ PBQ Performance Simulator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Interactive vocational lab scenarios simulating authentic CompTIA performance-based exam questions.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => {
                      setPbqScenario('front_panel');
                      setPbqGraded(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                      pbqScenario === 'front_panel' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    Front-Panel Header
                  </button>
                  <button
                    onClick={() => {
                      setPbqScenario('router_hardening');
                      setPbqGraded(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                      pbqScenario === 'router_hardening' ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                    }`}
                  >
                    SOHO Hardening
                  </button>
                </div>
              </div>

              {/* Scenario 1: Motherboard Front Panel Header Assembly */}
              {pbqScenario === 'front_panel' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-gray-300">
                    <strong>CompTIA PBQ Scenario:</strong> You are assembling a workstation motherboard. Wire the chassis 2-pin cables (Power SW, Reset SW, HDD LED, Power LED) to the standard 9-pin Intel front-panel connector (JFP1).
                  </div>

                  {/* Header Visualizer */}
                  <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
                    <div className="text-[11px] text-gray-400">Motherboard Pin Layout (JFP1):</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                        <span className="text-cyan-400 font-bold">Top Row (Pins 7-8: PWR_SW / Pins 5-6: RESET_SW)</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 block">Pins 7 & 8 Connector:</label>
                          <select
                            value={fpConnections['pin_7_8']}
                            onChange={(e) => setFpConnections({ ...fpConnections, pin_7_8: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-white"
                          >
                            <option value="PWR_SW">Power SW (Momentary Switch)</option>
                            <option value="RESET_SW">Reset SW</option>
                            <option value="HDD_LED">HDD LED (+/-)</option>
                            <option value="PWR_LED">Power LED (+/-)</option>
                          </select>

                          <label className="text-[10px] text-gray-400 block pt-1">Pins 5 & 6 Connector:</label>
                          <select
                            value={fpConnections['pin_5_6']}
                            onChange={(e) => setFpConnections({ ...fpConnections, pin_5_6: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-white"
                          >
                            <option value="RESET_SW">Reset SW</option>
                            <option value="PWR_SW">Power SW</option>
                            <option value="HDD_LED">HDD LED (+/-)</option>
                            <option value="PWR_LED">Power LED (+/-)</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2">
                        <span className="text-emerald-400 font-bold">Bottom Row (Pins 1-2: HDD_LED / Pins 3-4: PWR_LED)</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 block">Pins 1 & 2 Connector:</label>
                          <select
                            value={fpConnections['pin_1_2']}
                            onChange={(e) => setFpConnections({ ...fpConnections, pin_1_2: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-white"
                          >
                            <option value="HDD_LED">HDD LED (+/- Polarity Sensitive)</option>
                            <option value="PWR_LED">Power LED (+/-)</option>
                            <option value="PWR_SW">Power SW</option>
                            <option value="RESET_SW">Reset SW</option>
                          </select>

                          <label className="text-[10px] text-gray-400 block pt-1">Pins 3 & 4 Connector:</label>
                          <select
                            value={fpConnections['pin_3_4']}
                            onChange={(e) => setFpConnections({ ...fpConnections, pin_3_4: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-white"
                          >
                            <option value="PWR_LED">Power LED (+/-)</option>
                            <option value="HDD_LED">HDD LED (+/-)</option>
                            <option value="PWR_SW">Power SW</option>
                            <option value="RESET_SW">Reset SW</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario 2: SOHO Router Hardening */}
              {pbqScenario === 'router_hardening' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-gray-300">
                    <strong>CompTIA PBQ Scenario:</strong> Configure the customer SOHO wireless access point to prevent unauthorized intrusions per CompTIA Security+ standards.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">Wireless Security Mode</label>
                      <select
                        value={routerSecurity}
                        onChange={(e) => setRouterSecurity(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="WPA3_Enterprise">WPA3 Enterprise (192-bit Suite-B)</option>
                        <option value="WPA3_Personal">WPA3 Personal (SAE Handshake)</option>
                        <option value="WPA2_PSK_TKIP">WPA2 Personal (TKIP - Deprecated)</option>
                        <option value="WEP_64">WEP 64-bit (Vulnerable)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 block mb-1">Administrator Password</label>
                      <input
                        type="text"
                        value={routerAdminPass}
                        onChange={(e) => setRouterAdminPass(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs font-mono text-gray-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={routerBroadcast}
                        onChange={(e) => setRouterBroadcast(e.target.checked)}
                        className="rounded bg-gray-900 border-gray-700 text-[#06b6d4]"
                      />
                      <span>Enable SSID Broadcast</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={routerMacFiltering}
                        onChange={(e) => setRouterMacFiltering(e.target.checked)}
                        className="rounded bg-gray-900 border-gray-700 text-[#06b6d4]"
                      />
                      <span>MAC Address Filtering Allowlist</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Rubric Score Box */}
              {pbqGraded && (
                <div
                  className={`p-4 rounded-xl border ${
                    pbqGraded.score >= 80
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : 'bg-amber-950/40 border-amber-500/50'
                  } space-y-2 font-mono text-xs`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-white">
                      Exam Rubric Score: {pbqGraded.score} / {pbqGraded.maxScore} (
                      {pbqGraded.score >= 75 ? 'PASSING' : 'NEEDS REVIEW'})
                    </span>
                    <span className={pbqGraded.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pbqGraded.score}%
                    </span>
                  </div>
                  <pre className="text-[11px] text-gray-300 whitespace-pre-wrap">{pbqGraded.feedback}</pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={gradePbqScenario}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-bold rounded-lg border border-gray-700 transition-all"
                >
                  Submit & Check Answer
                </button>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('CompTIA A+ PBQ Performance Simulator', {
                      scenario: pbqScenario,
                      studentConnections: pbqScenario === 'front_panel' ? fpConnections : null,
                      routerConfig:
                        pbqScenario === 'router_hardening'
                          ? { security: routerSecurity, pass: routerAdminPass, macFilter: routerMacFiltering }
                          : null,
                      score: pbqGraded?.score ?? 'Unsubmitted',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini PBQ Socratic Examiner</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.2: Interactive RAID Array Topology & Parity Simulator */}
          {/* ======================================================== */}
          {activeTool === 'raid_simulator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-[#06b6d4]" />
                    Interactive RAID Array Topology & Parity Simulator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Computes storage efficiency, parity calculations, write IOPS penalty, and real-time failure survival.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  {(['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRaidLevel(r);
                        setFailedDriveIndex(null);
                        if (r === 'RAID 5' && driveCount < 3) setDriveCount(3);
                        if (r === 'RAID 6' && driveCount < 4) setDriveCount(4);
                        if (r === 'RAID 10' && driveCount % 2 !== 0) setDriveCount(4);
                      }}
                      className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                        raidLevel === r ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Drive Count and Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Number of Physical Drives:</span>
                    <strong className="text-cyan-400">{driveCount} Disks</strong>
                  </div>
                  <input
                    type="range"
                    min={raidLevel === 'RAID 6' ? 4 : raidLevel === 'RAID 5' ? 3 : 2}
                    max="12"
                    step={raidLevel === 'RAID 10' ? 2 : 1}
                    value={driveCount}
                    onChange={(e) => {
                      setDriveCount(parseInt(e.target.value, 10));
                      setFailedDriveIndex(null);
                    }}
                    className="w-full accent-[#06b6d4]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">Disk Capacity (Per Spindle):</span>
                    <strong className="text-cyan-400">{driveCapacityTb} TB</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={driveCapacityTb}
                    onChange={(e) => setDriveCapacityTb(parseInt(e.target.value, 10))}
                    className="w-full accent-[#06b6d4]"
                  />
                </div>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Net Usable Capacity</span>
                  <strong className="text-base text-emerald-400">{raidStats.netCap} TB</strong>
                  <span className="text-[10px] text-gray-500 block">Raw: {driveCount * driveCapacityTb} TB</span>
                </div>

                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Storage Efficiency</span>
                  <strong className="text-base text-cyan-400">{raidStats.efficiency}%</strong>
                  <span className="text-[10px] text-gray-500 block">Space Utilization</span>
                </div>

                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Fault Tolerance</span>
                  <strong className="text-base text-amber-400">{raidStats.faultTolerance} Drive(s)</strong>
                  <span className="text-[10px] text-gray-500 block">Simultaneous Loss</span>
                </div>

                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Write IOPS Penalty</span>
                  <strong className="text-xs text-gray-200 block truncate">{raidStats.writePenalty}</strong>
                  <span className="text-[10px] text-gray-500 block">{raidStats.readIops}</span>
                </div>
              </div>

              {/* Interactive Virtual Drive Array Visualizer */}
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Click any drive to simulate a sudden hardware crash:</span>
                  <span className={failedDriveIndex !== null ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {failedDriveIndex !== null ? `Drive #${failedDriveIndex + 1} FAILING` : 'All Drives Online'}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Array.from({ length: driveCount }).map((_, idx) => {
                    const isFailed = failedDriveIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setFailedDriveIndex(isFailed ? null : idx)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          isFailed
                            ? 'bg-red-950/60 border-red-500 text-red-300 animate-pulse'
                            : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-300'
                        }`}
                      >
                        <HardDrive className={`w-5 h-5 mx-auto mb-1 ${isFailed ? 'text-red-400' : 'text-cyan-400'}`} />
                        <div className="text-[11px] font-mono font-bold">Disk {idx + 1}</div>
                        <div className="text-[9px] text-gray-500 font-mono">{driveCapacityTb}TB SAS</div>
                        <span
                          className={`text-[8px] font-mono px-1 py-0.2 rounded mt-1 inline-block ${
                            isFailed ? 'bg-red-500 text-black font-bold' : 'bg-gray-800 text-emerald-400'
                          }`}
                        >
                          {isFailed ? 'FAILED' : 'ONLINE'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Interactive RAID Array Topology & Parity Simulator', {
                      raidLevel,
                      totalDrives: driveCount,
                      spindleSize: `${driveCapacityTb}TB`,
                      calculatedCapacity: `${raidStats.netCap}TB`,
                      efficiency: `${raidStats.efficiency}%`,
                      failedDisk: failedDriveIndex !== null ? `Drive #${failedDriveIndex + 1}` : 'None',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Storage Architecture Coach</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.3: OSI 7-Layer & TCP/IP Protocol Stack */}
          {/* ======================================================== */}
          {activeTool === 'osi_sandbox' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#06b6d4]" />
                    OSI 7-Layer & TCP/IP Protocol Stack Sandbox
                  </h3>
                  <p className="text-xs text-gray-400">
                    Examine encapsulation, Protocol Data Units (PDUs), and layer traversal from Application down to Physical.
                  </p>
                </div>
              </div>

              {/* Layer Stack Table */}
              <div className="space-y-2 font-mono text-xs">
                {[
                  { layer: 7, osi: 'Application', tcp: 'Application', pdu: 'Data', protocols: 'HTTP, HTTPS, DNS, DHCP, SSH, FTP' },
                  { layer: 6, osi: 'Presentation', tcp: 'Application', pdu: 'Data', protocols: 'TLS, SSL, JPEG, ASCII, MIME' },
                  { layer: 5, osi: 'Session', tcp: 'Application', pdu: 'Data', protocols: 'NetBIOS, RPC, Sockets' },
                  { layer: 4, osi: 'Transport', tcp: 'Transport', pdu: 'Segment (TCP) / Datagram (UDP)', protocols: 'TCP, UDP, QUIC' },
                  { layer: 3, osi: 'Network', tcp: 'Internet', pdu: 'Packet', protocols: 'IPv4, IPv6, ICMP, IPsec, ARP' },
                  { layer: 2, osi: 'Data Link', tcp: 'Network Access', pdu: 'Frame', protocols: 'Ethernet 802.3, Wi-Fi 802.11, PPP, MAC' },
                  { layer: 1, osi: 'Physical', tcp: 'Network Access', pdu: 'Bits (Signals)', protocols: 'RJ45, Cat6a, Fiber Optic, Hubs, Transceivers' },
                ].map((item) => {
                  const isSelected = selectedOsiLayer === item.layer;
                  return (
                    <div
                      key={item.layer}
                      onClick={() => setSelectedOsiLayer(item.layer)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white font-bold'
                          : 'bg-gray-950 border-gray-800 text-gray-300 hover:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-gray-800 text-[#06b6d4] flex items-center justify-center font-bold">
                          {item.layer}
                        </span>
                        <div>
                          <strong className="text-white">Layer {item.layer}: {item.osi}</strong>
                          <span className="text-[10px] text-gray-500 ml-2">[{item.tcp} in TCP/IP]</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{item.pdu}</span>
                        <div className="text-[10px] text-gray-400">{item.protocols}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('OSI 7-Layer & TCP/IP Protocol Stack Sandbox', {
                      focusedLayer: selectedOsiLayer,
                      packetTraceTarget: packetFlowDomain,
                      inquiry: 'Explain step-by-step encapsulation and header stripping from Layer 7 to Layer 1.',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Packet Flow Tutor</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.4: Diagnostic ISO & Ventoy Bootable USB Manager */}
          {/* ======================================================== */}
          {activeTool === 'ventoy_matrix' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Usb className="w-5 h-5 text-[#06b6d4]" />
                    Diagnostic ISO & Ventoy Bootable USB Library
                  </h3>
                  <p className="text-xs text-gray-400">
                    Curated vocational directory of bench technician rescue ISOs, RAM requirements, and Ventoy JSON deployment tips.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                {DIAGNOSTIC_ISO_CATALOG.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedIsoTool(tool)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all font-mono text-xs ${
                      selectedIsoTool.id === tool.id
                        ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{tool.name}</strong>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-gray-800 text-cyan-400">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{tool.description}</p>
                  </div>
                ))}
              </div>

              {/* Detailed ISO Specs */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <strong className="text-white text-sm">{selectedIsoTool.name}</strong>
                  <span className="text-[#06b6d4]">{selectedIsoTool.bootModes}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Minimum RAM Required</span>
                    <strong className="text-cyan-400">{selectedIsoTool.minRam}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Primary Bench Utility</span>
                    <strong className="text-emerald-400">{selectedIsoTool.category}</strong>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{selectedIsoTool.description}</p>
                <div className="p-3 bg-gray-900/80 rounded border border-gray-800 text-amber-400">
                  <strong>Ventoy Deployment Guidance:</strong> {selectedIsoTool.ventoyTip}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Diagnostic ISO & Ventoy Bootable USB Manager Matrix', {
                      isoName: selectedIsoTool.name,
                      category: selectedIsoTool.category,
                      bootModes: selectedIsoTool.bootModes,
                      useCases: selectedIsoTool.targetUseCases,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Boot Environment Copilot</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.5: Instant IT Acronym & Terminology Decoder */}
          {/* ======================================================== */}
          {activeTool === 'acronym_decoder' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#06b6d4]" />
                    CompTIA Acronym & Terminology Decoder
                  </h3>
                  <p className="text-xs text-gray-400">
                    Instant lookup for 500+ CompTIA A+, Network+, and Security+ exam acronyms paired with real-world analogies.
                  </p>
                </div>
              </div>

              {/* Search Bar & Domain Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search acronym (e.g. APIPA, NVMe, WPA3, TPM, OSPF)..."
                    value={acronymSearch}
                    onChange={(e) => setAcronymSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none uppercase"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {['All', 'Hardware', 'Networking', 'Security', 'Cloud', 'Troubleshooting'].map((dom) => (
                    <button
                      key={dom}
                      onClick={() => setAcronymDomainFilter(dom)}
                      className={`px-2.5 py-1 rounded transition-all ${
                        acronymDomainFilter === dom
                          ? 'bg-[#06b6d4] text-black font-bold'
                          : 'bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acronym List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
                {COMPTIA_ACRONYM_DATABASE.filter(
                  (a) =>
                    (acronymDomainFilter === 'All' || a.domain === acronymDomainFilter) &&
                    (a.acronym.toLowerCase().includes(acronymSearch.toLowerCase()) ||
                      a.fullName.toLowerCase().includes(acronymSearch.toLowerCase()))
                ).map((item) => (
                  <button
                    key={item.acronym}
                    onClick={() => setActiveAcronym(item)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeAcronym.acronym === item.acronym
                        ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-cyan-400">{item.acronym}</div>
                    <div className="text-[10px] text-gray-500 truncate">{item.fullName}</div>
                  </button>
                ))}
              </div>

              {/* Active Acronym Detail Card */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <span className="text-sm font-bold text-white mr-2">{activeAcronym.acronym}</span>
                    <span className="text-gray-400">— {activeAcronym.fullName}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-[#06b6d4]">
                    {activeAcronym.domain}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed font-sans">{activeAcronym.definition}</p>
                <div className="p-3 bg-gray-900/80 rounded border border-gray-800 text-emerald-400 font-sans">
                  <strong>💡 Real-World Analogy:</strong> {activeAcronym.analogy}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Instant IT Acronym & Terminology Decoder', {
                      acronym: activeAcronym.acronym,
                      name: activeAcronym.fullName,
                      domain: activeAcronym.domain,
                      definition: activeAcronym.definition,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Analogy Engine</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.6: CompTIA 6-Stage Troubleshooting Drill */}
          {/* ======================================================== */}
          {activeTool === 'troubleshooting_drill' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#06b6d4]" />
                    CompTIA 6-Stage Troubleshooting Methodology Drill
                  </h3>
                  <p className="text-xs text-gray-400">
                    Order client repair ticket actions into the sequential 6-stage CompTIA troubleshooting framework.
                  </p>
                </div>
              </div>

              {/* Scenario Card */}
              <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1 font-mono text-xs">
                <span className="text-[#06b6d4] font-bold">Ticket: {activeDrillScenario.title}</span>
                <p className="text-gray-300 font-sans text-xs">{activeDrillScenario.ticketComplaint}</p>
              </div>

              {/* 6 Stage Ordering List with Up/Down buttons */}
              <div className="space-y-2 font-mono text-xs">
                {studentStageOrder.map((step, idx) => (
                  <div
                    key={step.title}
                    className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-800 text-cyan-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-white">{step.title}</strong>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={() => {
                          const next = [...studentStageOrder];
                          const temp = next[idx - 1];
                          next[idx - 1] = next[idx];
                          next[idx] = temp;
                          setStudentStageOrder(next);
                        }}
                        className="p-1 rounded bg-gray-800 text-gray-300 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === studentStageOrder.length - 1}
                        onClick={() => {
                          const next = [...studentStageOrder];
                          const temp = next[idx + 1];
                          next[idx + 1] = next[idx];
                          next[idx] = temp;
                          setStudentStageOrder(next);
                        }}
                        className="p-1 rounded bg-gray-800 text-gray-300 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {drillScore !== null && (
                <div
                  className={`p-3 rounded-lg border font-mono text-xs ${
                    drillScore === 100
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  }`}
                >
                  Score: {drillScore}% •{' '}
                  {drillScore === 100
                    ? 'Perfect! All 6 troubleshooting stages follow exact CompTIA exam sequence.'
                    : 'Procedural errors detected. Make sure you test theories before establishing plans of action!'}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    let correctCount = 0;
                    studentStageOrder.forEach((step, idx) => {
                      if (step.stage === idx + 1) correctCount++;
                    });
                    setDrillScore(Math.round((correctCount / 6) * 100));
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs font-bold rounded-lg border border-gray-700 transition-all"
                >
                  Validate Sequence
                </button>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('CompTIA 6-Stage Troubleshooting Methodology Drill Engine', {
                      scenario: activeDrillScenario.title,
                      studentSequence: studentStageOrder.map((s, i) => `${i + 1}. ${s.title}`),
                      validatedScore: drillScore ?? 'Not validated',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Methodological Examiner</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.7: Hardware Port & Connector Physical Matrix */}
          {/* ======================================================== */}
          {activeTool === 'port_matrix' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[#06b6d4]" />
                    Hardware Port & Physical Connector Matrix
                  </h3>
                  <p className="text-xs text-gray-400">
                    High-resolution specifications for video displays, USB standards, motherboard power headers, and network cabling.
                  </p>
                </div>
              </div>

              {/* Port Selector List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                {HARDWARE_PORT_CATALOG.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPort(p)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedPort.id === p.id
                        ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white font-bold'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-cyan-400 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.family}</div>
                  </button>
                ))}
              </div>

              {/* Spec Display */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <strong className="text-white text-sm">{selectedPort.name}</strong>
                  <span className="text-[#06b6d4]">{selectedPort.pinCount} Physical Pins</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Maximum Data Bandwidth</span>
                    <strong className="text-cyan-400">{selectedPort.maxBandwidth}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-900 rounded border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Max Resolution / Power Delivery</span>
                    <strong className="text-emerald-400">{selectedPort.maxResolutionOrWattage}</strong>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed font-sans">{selectedPort.description}</p>
                <div className="text-[10px] text-gray-500 font-mono">
                  <strong>Exam Mapping:</strong> {selectedPort.comptiaObjective}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Hardware Port & Connector Physical Matrix', {
                      portName: selectedPort.name,
                      bandwidth: selectedPort.maxBandwidth,
                      maxSpec: selectedPort.maxResolutionOrWattage,
                      pinCount: selectedPort.pinCount,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Display & Cable Compatibility Checker</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 3.8: SOHO Security & Firewall Simulator */}
          {/* ======================================================== */}
          {activeTool === 'firewall_simulator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#06b6d4]" />
                    SOHO Security & Virtual Firewall Simulator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure stateful inspection rules, port forwards, and test simulated packet traversals.
                  </p>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-gray-400 block font-bold">Active Firewall Ruleset (Evaluated Top-to-Bottom):</span>
                {firewallRules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className="p-2.5 bg-gray-950 rounded-lg border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-gray-800 text-gray-400 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rule.action === 'ALLOW'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {rule.action}
                      </span>
                      <span className="text-cyan-400 font-bold">{rule.proto}</span>
                      <span className="text-gray-300">Port {rule.dstPort}</span>
                      <span className="text-[10px] text-gray-500">({rule.desc})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Packet Test Form */}
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                <span className="text-white font-bold block">Send Virtual Test Packet:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Destination Port</label>
                    <input
                      type="text"
                      value={testPacket.dstPort}
                      onChange={(e) => setTestPacket({ ...testPacket, dstPort: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Protocol</label>
                    <select
                      value={testPacket.proto}
                      onChange={(e) => setTestPacket({ ...testPacket, proto: e.target.value as any })}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const match = firewallRules.find(
                          (r) => r.proto === testPacket.proto && r.dstPort === testPacket.dstPort
                        );
                        if (match) {
                          setPacketResult(
                            `Packet Matched Rule #${match.id}: [${match.action}] - ${match.desc}`
                          );
                        } else {
                          setPacketResult('Default Policy Catch: [DENY] - Implicit Deny All at end of ruleset.');
                        }
                      }}
                      className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
                    >
                      Inspect Packet
                    </button>
                  </div>
                </div>

                {packetResult && (
                  <div className="p-2.5 bg-gray-900 rounded border border-cyan-500/40 text-cyan-300 font-bold">
                    Result: {packetResult}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('SOHO Security & Firewall Configuration Simulator', {
                      ruleset: firewallRules,
                      testPacketSent: testPacket,
                      inspectionResult: packetResult || 'Pending inspection',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Firewall Vulnerability Auditor</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Universal AI Socratic Tutor Drawer */}
        {isAiDrawerOpen && (
          <div className="xl:col-span-1 bg-[#111827] border border-[#06b6d4]/40 rounded-xl p-4 shadow-xl space-y-4 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                <span className="font-mono font-bold text-white text-xs">
                  Gemini Exam Coach & Socratic Tutor
                </span>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Question */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                Student Question / Hint Request
              </label>
              <textarea
                rows={2}
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ask for an exam hint or real-world analogy..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-200 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            {/* AI Output Container */}
            <div className="flex-1 bg-gray-950 rounded-xl p-3.5 border border-gray-800/80 overflow-y-auto space-y-3 font-mono text-xs">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#06b6d4] animate-spin" />
                  <span className="text-gray-400">
                    Consulting CompTIA Master Instructor AI...
                  </span>
                </div>
              ) : aiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
                    <span className="text-[#06b6d4] font-bold">{aiResponse.modelUsed}</span>
                    <span>{aiResponse.timestamp}</span>
                  </div>
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {aiResponse.analysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <Bot className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-[11px]">
                    Select any of the 8 CompTIA vocational study tools and click the AI button to receive supportive Socratic tutoring.
                  </p>
                </div>
              )}
            </div>

            {/* Shortcut Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Socratic Hints:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setAiCustomPrompt('Give me a Socratic hint without spoiling the answer.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Socratic Hint
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Explain this concept using a clear real-world analogy.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Analogy Please
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Which official CompTIA exam objective does this cover?')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Exam Domain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#06b6d4]" />
                Gemini API Key Configuration
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Enter your Google AI Studio Gemini API Key below. When saved, Module 3 executes direct client-side requests to{' '}
              <code className="text-[#06b6d4] font-mono">gemini-1.5-flash:generateContent</code>. If left empty, requests automatically use the server backend proxy.
            </p>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                GEMINI_API_KEY
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setCustomApiKey('');
                  setStoredGeminiApiKey('');
                  addToast({
                    type: 'info',
                    title: 'API Key Cleared',
                    message: 'Module 3 will use the server-side proxy fallback.',
                  });
                  setIsKeyModalOpen(false);
                }}
                className="text-xs font-mono text-red-400 hover:underline"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStoredGeminiApiKey(customApiKey);
                    addToast({
                      type: 'success',
                      title: 'API Key Saved',
                      message: 'Client-side Gemini API calls enabled in localStorage.',
                    });
                    setIsKeyModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
