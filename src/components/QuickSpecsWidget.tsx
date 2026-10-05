import React, { useState, useMemo } from 'react';
import {
  CPU_SOCKET_STANDARDS,
  RAM_STANDARDS,
  CpuSocketStandard,
  RamStandard,
} from '../data/cpuRamCompatibilityData';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Search,
  Layers,
  Zap,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Laptop,
  HardDrive,
  Info,
  Server,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface QuickSpecsWidgetProps {
  embeddedInDashboard?: boolean;
  onNavigateToReference?: (subTab?: string) => void;
}

export const QuickSpecsWidget: React.FC<QuickSpecsWidgetProps> = ({
  embeddedInDashboard = false,
  onNavigateToReference,
}) => {
  const { setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AMD' | 'INTEL' | 'DDR5' | 'DDR4' | 'LAPTOP'>('ALL');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'sockets_and_ram' | 'notch_diagram' | 'dual_channel_guide'>('sockets_and_ram');

  const handleCopySpec = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleOpenReference = () => {
    if (onNavigateToReference) {
      onNavigateToReference('psu');
    } else {
      setActiveTab('reference');
    }
  };

  // Filtered Sockets
  const filteredSockets = useMemo(() => {
    return CPU_SOCKET_STANDARDS.filter((socket) => {
      const matchCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'AMD' && socket.vendor === 'AMD') ||
        (categoryFilter === 'INTEL' && socket.vendor === 'Intel') ||
        (categoryFilter === 'DDR5' && socket.supportedRam.some((r) => r.includes('DDR5'))) ||
        (categoryFilter === 'DDR4' && socket.supportedRam.includes('DDR4'));

      if (!matchCategory) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      return (
        socket.socketName.toLowerCase().includes(q) ||
        socket.vendor.toLowerCase().includes(q) ||
        socket.cpuGenerations.some((gen) => gen.toLowerCase().includes(q)) ||
        socket.compatibleChipsets.some((cs) => cs.toLowerCase().includes(q)) ||
        socket.supportedRam.some((ram) => ram.toLowerCase().includes(q)) ||
        socket.pcieGeneration.toLowerCase().includes(q) ||
        socket.installationNotes.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, searchTerm]);

  // Filtered RAM Standards
  const filteredRam = useMemo(() => {
    return RAM_STANDARDS.filter((ram) => {
      const matchCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'DDR5' && ram.id.includes('ddr5')) ||
        (categoryFilter === 'DDR4' && ram.id.includes('ddr4')) ||
        (categoryFilter === 'LAPTOP' && ram.formFactor.includes('SO-DIMM')) ||
        categoryFilter === 'AMD' ||
        categoryFilter === 'INTEL';

      if (!matchCategory) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      return (
        ram.standardName.toLowerCase().includes(q) ||
        ram.formFactor.toLowerCase().includes(q) ||
        ram.stockSpeeds.toLowerCase().includes(q) ||
        ram.enthusiastSpeeds.toLowerCase().includes(q) ||
        ram.channelArchitecture.toLowerCase().includes(q) ||
        ram.slotPriorityGuide.toLowerCase().includes(q) ||
        ram.technicianBenchNotes.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, searchTerm]);

  const totalResults = filteredSockets.length + filteredRam.length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono">
                Quick Specs & Hardware Compatibility Reference
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                CompTIA Standards
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Rapid lookup for CPU Sockets (AM5, LGA1700, LGA1851), DDR4/DDR5 RAM channels, voltages & key notches.
            </p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-xl border border-[#30363d] text-xs font-mono">
          <button
            onClick={() => setActiveViewMode('sockets_and_ram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeViewMode === 'sockets_and_ram'
                ? 'bg-[#21262d] text-cyan-300 shadow-sm border border-[#30363d] font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Specs Directory
          </button>
          <button
            onClick={() => setActiveViewMode('notch_diagram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeViewMode === 'notch_diagram'
                ? 'bg-[#21262d] text-cyan-300 shadow-sm border border-[#30363d] font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            DDR4 vs DDR5 Notch Map
          </button>
          <button
            onClick={() => setActiveViewMode('dual_channel_guide')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeViewMode === 'dual_channel_guide'
                ? 'bg-[#21262d] text-cyan-300 shadow-sm border border-[#30363d] font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            A2/B2 Slot Guide
          </button>
        </div>
      </div>

      {/* Mode 1: Search & Specs Directory */}
      {activeViewMode === 'sockets_and_ram' && (
        <div className="space-y-4">
          {/* Search Bar & Filter Chips */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AM5, LGA1700, DDR5-6000, EXPO, B650, Z790, notch offset, pin count..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[11px] font-mono">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'ALL'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                All ({CPU_SOCKET_STANDARDS.length + RAM_STANDARDS.length})
              </button>
              <button
                onClick={() => setCategoryFilter('AMD')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'AMD'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                AMD (AM5/AM4)
              </button>
              <button
                onClick={() => setCategoryFilter('INTEL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'INTEL'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                Intel (LGA1700/1851)
              </button>
              <button
                onClick={() => setCategoryFilter('DDR5')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'DDR5'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                DDR5 Standards
              </button>
              <button
                onClick={() => setCategoryFilter('DDR4')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'DDR4'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                DDR4 Standards
              </button>
              <button
                onClick={() => setCategoryFilter('LAPTOP')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  categoryFilter === 'LAPTOP'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                Laptop SO-DIMM
              </button>
            </div>
          </div>

          {/* Results Counter & Fast Stats Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Found <span className="text-cyan-400 font-bold">{totalResults}</span> standards matching query
              </span>
            </span>

            <button
              onClick={handleOpenReference}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Full Reference Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sockets Grid */}
          {filteredSockets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                <span>Processor Sockets & Chipsets ({filteredSockets.length})</span>
                <span className="text-gray-500">Click to expand bench notes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSockets.map((socket) => {
                  const isExpanded = expandedItemId === socket.id;
                  const specSummary = `${socket.socketName} • Pins: ${socket.pinCount} (${socket.contactType}) • RAM: ${socket.supportedRam.join('/')} • PCIe: ${socket.pcieGeneration} (${socket.maxCpuPcieLanes} lanes) • TDP: ${socket.maxTdpDefault}`;

                  return (
                    <div
                      key={socket.id}
                      className={`bg-[#0d1117] border rounded-xl p-3.5 transition-all ${
                        isExpanded
                          ? 'border-cyan-500/60 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                          : 'border-[#30363d] hover:border-gray-500'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                socket.vendor === 'AMD'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {socket.vendor}
                            </span>
                            <h4 className="text-xs font-bold text-white font-mono">{socket.socketName}</h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mt-1">
                            <span>{socket.pinCount} pins ({socket.contactType})</span>
                            <span>•</span>
                            <span className="text-emerald-400">{socket.supportedRam.join(', ')}</span>
                            <span>•</span>
                            <span className="text-purple-400">{socket.pcieGeneration}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCopySpec(socket.id, specSummary)}
                            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                            title="Copy socket summary"
                          >
                            {copiedId === socket.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : socket.id)}
                            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Compatible Chipsets & Generations */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {socket.compatibleChipsets.map((cs) => (
                          <span
                            key={cs}
                            className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] font-mono text-gray-300"
                          >
                            {cs}
                          </span>
                        ))}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#30363d] space-y-2.5 text-xs font-mono animate-in fade-in duration-150">
                          <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                              Supported Processor Generations:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {socket.cpuGenerations.map((gen) => (
                                <span
                                  key={gen}
                                  className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px]"
                                >
                                  {gen}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]">
                            <div>
                              <span className="text-gray-500">Max RAM Speed:</span>
                              <p className="text-gray-200 font-semibold">{socket.maxRamSpeedStock}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Max Default TDP:</span>
                              <p className="text-amber-400 font-semibold">{socket.maxTdpDefault}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">CPU PCIe Lanes:</span>
                              <p className="text-purple-400 font-semibold">{socket.maxCpuPcieLanes} Direct Lanes</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Channels:</span>
                              <p className="text-gray-200 font-semibold">{socket.maxRamChannels}</p>
                            </div>
                          </div>

                          <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5 text-[11px] text-amber-200">
                            <span className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Technician Bench Note:
                            </span>
                            <p className="leading-relaxed">{socket.installationNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAM Standards Grid */}
          {filteredRam.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                <span>Memory & RAM Architecture Standards ({filteredRam.length})</span>
                <span className="text-gray-500">Click to expand voltage & pinouts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRam.map((ram) => {
                  const isExpanded = expandedItemId === ram.id;
                  const specSummary = `${ram.standardName} • Pins: ${ram.pinCount} • Voltage: ${ram.baseVoltage} (${ram.xmpExpoVoltage}) • Speeds: ${ram.stockSpeeds} / ${ram.enthusiastSpeeds} • Slot Priority: ${ram.slotPriorityGuide}`;

                  return (
                    <div
                      key={ram.id}
                      className={`bg-[#0d1117] border rounded-xl p-3.5 transition-all ${
                        isExpanded
                          ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                          : 'border-[#30363d] hover:border-gray-500'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {ram.formFactor.split(' ')[0]}
                            </span>
                            <h4 className="text-xs font-bold text-white font-mono">{ram.standardName}</h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mt-1">
                            <span>{ram.pinCount} Pins</span>
                            <span>•</span>
                            <span className="text-amber-400">{ram.baseVoltage}</span>
                            <span>•</span>
                            <span className="text-cyan-400">{ram.enthusiastSpeeds.split(',')[0]}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCopySpec(ram.id, specSummary)}
                            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                            title="Copy RAM summary"
                          >
                            {copiedId === ram.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : ram.id)}
                            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Channel & Notch preview badge */}
                      <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-gray-400">
                        <span className="text-emerald-400 font-semibold">{ram.channelArchitecture}</span>
                      </div>

                      {/* Expanded RAM Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#30363d] space-y-2.5 text-xs font-mono animate-in fade-in duration-150">
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]">
                            <div>
                              <span className="text-gray-500">Overclock Profile:</span>
                              <p className="text-purple-400 font-semibold">{ram.xmpExpoVoltage}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Stock Speeds:</span>
                              <p className="text-gray-200 font-semibold">{ram.stockSpeeds}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Key Offset:</span>
                              <p className="text-cyan-400 font-semibold">{ram.keyOffsetMm}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">ECC Engine:</span>
                              <p className="text-emerald-400 font-semibold">{ram.eccType}</p>
                            </div>
                          </div>

                          <div className="bg-sky-950/30 border border-sky-500/30 rounded-lg p-2.5 text-[11px] text-sky-200">
                            <span className="font-bold flex items-center gap-1.5 text-sky-300 mb-1">
                              <Layers className="w-3.5 h-3.5" />
                              Slot Populating Order:
                            </span>
                            <p className="leading-relaxed">{ram.slotPriorityGuide}</p>
                          </div>

                          <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5 text-[11px] text-amber-200">
                            <span className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Technician Bench Note:
                            </span>
                            <p className="leading-relaxed">{ram.technicianBenchNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-8 bg-[#0d1117] rounded-xl border border-dashed border-[#30363d] space-y-2">
              <Cpu className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs font-mono text-gray-300">
                No CPU sockets or RAM standards match &quot;{searchTerm}&quot;
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('ALL');
                }}
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Interactive DDR4 vs DDR5 Notch Position Diagram */}
      {activeViewMode === 'notch_diagram' && (
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 lg:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Physical Key Notch & Pin Geometry Comparison
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Never force a memory module into a slot. Notice how the key notch shifts between generations.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              ⚠️ Incompatible Keying Prevents 1.2V vs 1.1V Short Circuits
            </div>
          </div>

          <div className="space-y-6">
            {/* DDR5 Desktop Representation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <span>DDR5 Desktop UDIMM (288 Pins • 1.1V)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PMIC on PCB
                  </span>
                </span>
                <span className="text-gray-400 text-[11px]">Notch offset: 13.5 mm from center</span>
              </div>

              <div className="relative h-14 bg-gradient-to-r from-emerald-950/60 via-gray-900 to-emerald-950/60 border-2 border-emerald-500/50 rounded-md flex flex-col justify-between p-2 overflow-hidden shadow-inner">
                {/* Top PCB area */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-2">
                  <span>Pin 1 (Left)</span>
                  <span className="text-emerald-300 font-bold bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    PMIC Chip + On-Die ECC
                  </span>
                  <span>Pin 288 (Right)</span>
                </div>

                {/* Bottom Gold Pins with Key Notch */}
                <div className="relative w-full h-4 flex items-end">
                  {/* Left gold contact strip (Pins 1-144 approx) */}
                  <div className="h-2.5 bg-gradient-to-b from-amber-300 to-amber-500 rounded-bl-sm flex-1 border-r-2 border-black"></div>
                  {/* Key Notch Cutout (13.5mm shifted from center) */}
                  <div className="w-4 h-3.5 bg-[#0d1117] rounded-t-sm border-t-2 border-l-2 border-r-2 border-emerald-400/80 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-cyan-300 font-bold">KEY</span>
                  </div>
                  {/* Right gold contact strip */}
                  <div className="h-2.5 bg-gradient-to-b from-amber-300 to-amber-500 rounded-br-sm flex-[1.4] border-l-2 border-black"></div>
                </div>
              </div>
            </div>

            {/* DDR4 Desktop Representation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-400 flex items-center gap-2">
                  <span>DDR4 Desktop UDIMM (288 Pins • 1.2V)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Curved Edge Pinout
                  </span>
                </span>
                <span className="text-gray-400 text-[11px]">Notch offset: 5.5 mm from center</span>
              </div>

              <div className="relative h-14 bg-gradient-to-r from-blue-950/60 via-gray-900 to-blue-950/60 border-2 border-blue-500/50 rounded-md flex flex-col justify-between p-2 overflow-hidden shadow-inner">
                {/* Top PCB area */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 px-2">
                  <span>Pin 1 (Left)</span>
                  <span className="text-blue-300 font-bold bg-blue-900/60 px-2 py-0.5 rounded border border-blue-500/30">
                    Single 64-bit Channel (Motherboard VRM)
                  </span>
                  <span>Pin 288 (Right)</span>
                </div>

                {/* Bottom Gold Pins with Key Notch */}
                <div className="relative w-full h-4 flex items-end">
                  {/* Left gold contact strip */}
                  <div className="h-2.5 bg-gradient-to-b from-amber-300 to-amber-500 rounded-bl-sm flex-1 border-r-2 border-black"></div>
                  {/* Key Notch Cutout (5.5mm offset from center) */}
                  <div className="w-4 h-3.5 bg-[#0d1117] rounded-t-sm border-t-2 border-l-2 border-r-2 border-blue-400/80 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-blue-300 font-bold">KEY</span>
                  </div>
                  {/* Right gold contact strip */}
                  <div className="h-2.5 bg-gradient-to-b from-amber-300 to-amber-500 rounded-br-sm flex-[1.08] border-l-2 border-black"></div>
                </div>
              </div>
            </div>

            {/* Comparison Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#161b22] p-3 rounded-lg border border-[#30363d] space-y-1">
                <span className="text-gray-400 text-[10px] uppercase">Power Distribution</span>
                <p className="text-white font-semibold">DDR5 has PMIC onboard</p>
                <p className="text-[11px] text-gray-400">
                  DDR5 receives +5V and regulates down internally. DDR4 receives regulated 1.2V directly from motherboard.
                </p>
              </div>

              <div className="bg-[#161b22] p-3 rounded-lg border border-[#30363d] space-y-1">
                <span className="text-gray-400 text-[10px] uppercase">Channel Topology</span>
                <p className="text-emerald-400 font-semibold">Dual 32-bit vs Single 64-bit</p>
                <p className="text-[11px] text-gray-400">
                  A single DDR5 stick operates as dual-channel internally, doubling memory efficiency for multithreaded jobs.
                </p>
              </div>

              <div className="bg-[#161b22] p-3 rounded-lg border border-[#30363d] space-y-1">
                <span className="text-gray-400 text-[10px] uppercase">Initial POST Training</span>
                <p className="text-amber-400 font-semibold">30–120s Memory Training</p>
                <p className="text-[11px] text-gray-400">
                  DDR5 systems train high-speed signal timings upon first boot. Do not power off if screen stays black briefly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Dual-Channel A2/B2 Slot Priority Guide */}
      {activeViewMode === 'dual_channel_guide' && (
        <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 lg:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Motherboard RAM Slot Placement Guide (Daisy-Chain Topology)
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Why 2-stick setups MUST occupy Slots 2 and 4 (A2 & B2) counting from the CPU socket.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ⚡ Daisy-Chain Signal Reflection Prevention
            </div>
          </div>

          <div className="space-y-4">
            {/* Motherboard Visual Schematic */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
                {/* CPU Socket Block */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center p-2 shadow-xl flex-shrink-0">
                  <Cpu className="w-8 h-8 text-cyan-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-white">CPU Socket</span>
                  <span className="text-[9px] font-mono text-gray-400">AM5 / LGA1700</span>
                </div>

                {/* Arrow */}
                <div className="text-gray-500 font-mono text-xs hidden md:block">➔ Memory Traces ➔</div>

                {/* 4 DIMM Slots */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                  {/* Slot 1: A1 (Leave Empty) */}
                  <div className="w-16 sm:w-20 h-36 rounded-lg bg-gray-900 border border-gray-700 flex flex-col justify-between p-2 text-center text-gray-500 font-mono">
                    <span className="text-[10px] font-bold">Slot 1 (A1)</span>
                    <div className="my-auto text-[9px] text-gray-500">Leave Empty (2-Stick)</div>
                    <span className="text-[9px] text-gray-600">Trace End</span>
                  </div>

                  {/* Slot 2: A2 (INSTALL HERE) */}
                  <div className="w-16 sm:w-20 h-36 rounded-lg bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40 flex flex-col justify-between p-2 text-center font-mono">
                    <span className="text-[10px] font-bold text-emerald-300">Slot 2 (A2)</span>
                    <div className="my-auto text-[10px] font-bold text-white bg-emerald-800/80 rounded py-1 border border-emerald-400">
                      ✓ STICK #1
                    </div>
                    <span className="text-[9px] text-emerald-400 font-semibold">Channel A Term.</span>
                  </div>

                  {/* Slot 3: B1 (Leave Empty) */}
                  <div className="w-16 sm:w-20 h-36 rounded-lg bg-gray-900 border border-gray-700 flex flex-col justify-between p-2 text-center text-gray-500 font-mono">
                    <span className="text-[10px] font-bold">Slot 3 (B1)</span>
                    <div className="my-auto text-[9px] text-gray-500">Leave Empty (2-Stick)</div>
                    <span className="text-[9px] text-gray-600">Trace End</span>
                  </div>

                  {/* Slot 4: B2 (INSTALL HERE) */}
                  <div className="w-16 sm:w-20 h-36 rounded-lg bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border-2 border-emerald-500 shadow-lg shadow-emerald-950/40 flex flex-col justify-between p-2 text-center font-mono">
                    <span className="text-[10px] font-bold text-emerald-300">Slot 4 (B2)</span>
                    <div className="my-auto text-[10px] font-bold text-white bg-emerald-800/80 rounded py-1 border border-emerald-400">
                      ✓ STICK #2
                    </div>
                    <span className="text-[9px] text-emerald-400 font-semibold">Channel B Term.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CompTIA Theory Explanation */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs font-mono space-y-2 text-gray-300">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Info className="w-4 h-4" />
                <span>CompTIA A+ & Electrical Signal Theory:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-gray-300">
                Almost all consumer motherboards utilize a <strong className="text-white">Daisy-Chain memory trace topology</strong>. The copper signal traces run from the CPU socket directly to Slot 1 (A1), then continue to Slot 2 (A2) where the trace terminates. If you install memory in A1 instead of A2, the open copper trace sticking out past the module to A2 acts as an electrical antenna (called an <em className="text-amber-300">open trace stub</em>), causing severe high-frequency signal reflections that prevent XMP/EXPO from booting stable at 6000+ MT/s.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
