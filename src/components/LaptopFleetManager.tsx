import React, { useState, useMemo } from 'react';
import { LaptopAsset, INITIAL_LAPTOPS_CATALOG } from '../data/shopManagementDatabase';
import { useApp } from '../context/AppContext';
import {
  Laptop,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  Cpu,
  HardDrive,
  ShieldAlert,
  Wrench,
  Sparkles,
  Award,
  Layers,
  Info,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Tag,
  Monitor,
} from 'lucide-react';

interface LaptopFleetManagerProps {
  laptops?: LaptopAsset[];
  onAssignToBench?: (laptop: LaptopAsset, benchNumber: string) => void;
  onUpdateLaptopStatus?: (laptopId: string, status: LaptopAsset['status']) => void;
}

export const LaptopFleetManager: React.FC<LaptopFleetManagerProps> = ({
  laptops = INITIAL_LAPTOPS_CATALOG,
  onAssignToBench,
  onUpdateLaptopStatus,
}) => {
  const { addToast } = useApp();

  const [fleetList, setFleetList] = useState<LaptopAsset[]>(laptops);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ramUpgradeFilter, setRamUpgradeFilter] = useState<string>('ALL');

  // Detail Modal State
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopAsset | null>(null);
  const [batteryTesting, setBatteryTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Bench Assignment State in Modal
  const [targetBenchNum, setTargetBenchNum] = useState<string>('Bench 01');

  // Filtered Laptops
  const filteredLaptops = useMemo(() => {
    return fleetList.filter((lap) => {
      const matchesSearch =
        searchQuery === '' ||
        lap.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.cpu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.gpu.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = brandFilter === 'ALL' || lap.brand === brandFilter;
      const matchesCategory = categoryFilter === 'ALL' || lap.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || lap.status === statusFilter;
      const matchesRam = ramUpgradeFilter === 'ALL' || lap.ramUpgrade === ramUpgradeFilter;

      return matchesSearch && matchesBrand && matchesCategory && matchesStatus && matchesRam;
    });
  }, [fleetList, searchQuery, brandFilter, categoryFilter, statusFilter, ramUpgradeFilter]);

  const brandsList = useMemo(() => {
    const set = new Set(fleetList.map((l) => l.brand));
    return ['ALL', ...Array.from(set)];
  }, [fleetList]);

  const categoriesList = useMemo(() => {
    const set = new Set(fleetList.map((l) => l.category));
    return ['ALL', ...Array.from(set)];
  }, [fleetList]);

  // Battery health test simulator
  const handleRunBatteryHealthTest = (lap: LaptopAsset) => {
    setBatteryTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setBatteryTesting(false);
      const randomCycleCount = Math.floor(Math.random() * 220) + 40;
      const designCapacityWh = lap.batteryWh;
      const currentCapacityWh = Math.round(((designCapacityWh * lap.batteryHealth) / 100) * 10) / 10;
      setTestResult(
        `Battery Health: ${lap.batteryHealth}% • Cycle Count: ${randomCycleCount} • Full Charge Capacity: ${currentCapacityWh} Wh / ${designCapacityWh} Wh • Cell Voltage Delta: 12mV (PASS)`
      );
      addToast({
        type: 'success',
        title: 'Battery Diagnostic Complete',
        message: `${lap.model} battery health verified at ${lap.batteryHealth}%.`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-gray-900 to-indigo-950/40 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              Comprehensive Laptop Fleet & Diagnostic Registry
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold">
                {fleetList.length}+ Laptops Managed
              </span>
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Enterprise database of 500+ commercial, workstation, gaming, and student loaner laptops with teardown guides and triage status.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
            <span className="text-emerald-400 font-bold">
              {fleetList.filter((l) => l.status === 'In Fleet / Available').length}
            </span>{' '}
            Available
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
            <span className="text-amber-400 font-bold">
              {fleetList.filter((l) => l.status === 'Under Triage / Bench').length}
            </span>{' '}
            In Triage
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 500+ laptops by model, asset tag, CPU, GPU, or brand..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-8 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-sky-400"
            >
              {brandsList.map((b) => (
                <option key={b} value={b}>
                  Brand: {b}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-sky-400"
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  Class: {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-sky-400"
            >
              <option value="ALL">Status: All</option>
              <option value="In Fleet / Available">Available</option>
              <option value="Under Triage / Bench">Under Triage</option>
              <option value="Assigned to Student">Assigned</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laptops Dense Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {filteredLaptops.slice(0, 48).map((lap) => {
          const isTriage = lap.status === 'Under Triage / Bench';
          const isAvail = lap.status === 'In Fleet / Available';

          return (
            <div
              key={lap.id}
              onClick={() => {
                setSelectedLaptop(lap);
                setTestResult(null);
              }}
              className="p-4 rounded-2xl bg-gray-950/90 border border-gray-800 hover:border-sky-500/50 hover:bg-gray-900/60 transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300">
                    {lap.assetTag}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isAvail
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isTriage
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {lap.status}
                  </span>
                </div>

                <div className="font-sans font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-sky-200">
                  {lap.model}
                </div>

                <div className="space-y-1 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{lap.cpu}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Monitor className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{lap.gpu}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{lap.ram}</span>
                    <span>•</span>
                    <span>{lap.storage}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  <span>{lap.batteryHealth}% Health</span>
                </div>
                <span className="text-sky-400 font-semibold group-hover:underline">
                  View Triage Specs &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLaptops.length > 48 && (
        <div className="text-center font-mono text-xs text-gray-500 py-3">
          Showing 48 of {filteredLaptops.length} filtered laptops. Use the search bar above to narrow down specific assets.
        </div>
      )}

      {/* Laptop Deep Inspection Modal */}
      {selectedLaptop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
          <div className="max-w-3xl w-full bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
                    {selectedLaptop.assetTag}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-gray-800 text-gray-300">
                    {selectedLaptop.brand}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                    {selectedLaptop.category}
                  </span>
                </div>
                <h3 className="font-sans font-bold text-lg text-white mt-1.5">
                  {selectedLaptop.model}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLaptop(null)}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Sheet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="font-bold text-gray-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Compute Architecture
                </div>
                <div className="space-y-1 text-gray-400">
                  <div>
                    <span className="text-gray-500">CPU:</span> {selectedLaptop.cpu}
                  </div>
                  <div>
                    <span className="text-gray-500">GPU:</span> {selectedLaptop.gpu}
                  </div>
                  <div>
                    <span className="text-gray-500">Display:</span> {selectedLaptop.screen}
                  </div>
                  <div>
                    <span className="text-gray-500">Power Supply:</span> {selectedLaptop.powerAdapterWatts}W Type-C / Barrel
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                <div className="font-bold text-gray-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  Memory & Storage Upgradeability
                </div>
                <div className="space-y-1 text-gray-400">
                  <div>
                    <span className="text-gray-500">RAM:</span> {selectedLaptop.ram} ({selectedLaptop.ramUpgrade})
                  </div>
                  <div>
                    <span className="text-gray-500">Storage:</span> {selectedLaptop.storage} ({selectedLaptop.storageSlots})
                  </div>
                  <div>
                    <span className="text-gray-500">Operating System:</span> {selectedLaptop.os}
                  </div>
                  <div>
                    <span className="text-gray-500">Teardown Difficulty:</span> {selectedLaptop.teardownDifficulty} / 5 (1=Modular, 5=Glued)
                  </div>
                </div>
              </div>
            </div>

            {/* Common Fault Modes & Bench Triage Notes */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Known Hardware Failure Modes & Triage Protocol:</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{selectedLaptop.commonFaults}</p>
            </div>

            {/* Battery Health Simulator Box */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  <span>Battery Health & Voltage Test</span>
                </div>
                <button
                  onClick={() => handleRunBatteryHealthTest(selectedLaptop)}
                  disabled={batteryTesting}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${batteryTesting ? 'animate-spin' : ''}`} />
                  <span>{batteryTesting ? 'Querying BMS Controller...' : 'Run Battery Diagnostic'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
                  {testResult}
                </div>
              )}
            </div>

            {/* Bench Dispatch Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-400">Dispatch to:</span>
                <select
                  value={targetBenchNum}
                  onChange={(e) => setTargetBenchNum(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {Array.from({ length: 16 }, (_, i) => {
                    const num = String(i + 1).padStart(2, '0');
                    return (
                      <option key={num} value={`Bench ${num}`}>
                        Bench {num}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => {
                    if (onAssignToBench) {
                      onAssignToBench(selectedLaptop, targetBenchNum);
                    }
                    // Update local status
                    setFleetList((prev) =>
                      prev.map((l) =>
                        l.id === selectedLaptop.id
                          ? { ...l, status: 'Under Triage / Bench', assignedBench: targetBenchNum }
                          : l
                      )
                    );
                    setSelectedLaptop((prev) => (prev ? { ...prev, status: 'Under Triage / Bench', assignedBench: targetBenchNum } : null));
                    addToast({
                      type: 'success',
                      title: 'Asset Dispatched',
                      message: `${selectedLaptop.model} assigned to ${targetBenchNum} for triage.`,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  Assign to Bench
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setFleetList((prev) =>
                      prev.map((l) =>
                        l.id === selectedLaptop.id ? { ...l, status: 'In Fleet / Available', assignedBench: undefined } : l
                      )
                    );
                    setSelectedLaptop((prev) => (prev ? { ...prev, status: 'In Fleet / Available', assignedBench: undefined } : null));
                    addToast({
                      type: 'info',
                      title: 'Status Updated',
                      message: `${selectedLaptop.model} returned to available fleet.`,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs"
                >
                  Mark Available
                </button>
                <button
                  onClick={() => setSelectedLaptop(null)}
                  className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
