import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  INITIAL_16_BENCH_STATIONS,
  INITIAL_TOOL_LOANS,
  INITIAL_PARTS_INVENTORY,
  INITIAL_KANBAN_TICKETS,
  INITIAL_LAPTOPS_CATALOG,
  INITIAL_SAVED_COMBOS,
  INVENTORY_CATEGORIES,
  BenchStation,
  ToolLoanItem,
  InventoryItem,
  InventoryCategory,
  KanbanTicket,
  SavedHardwareCombo,
  LaptopAsset,
} from '../data/shopManagementDatabase';
import { InventoryAnalyticsDashboard } from './InventoryAnalyticsDashboard';
import { InventoryBarcodeScannerModal } from './InventoryBarcodeScannerModal';
import { BottleneckCalculator } from './BottleneckCalculator';
import { HardwareCombosPlanner } from './HardwareCombosPlanner';
import { LaptopFleetManager } from './LaptopFleetManager';
import { AssetInventoryManager } from './AssetInventoryManager';
import {
  LayoutGrid,
  QrCode,
  PenTool,
  Receipt,
  Wrench,
  FileBarChart,
  Kanban,
  Package,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Key,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Printer,
  Sliders,
  Clock,
  UserCheck,
  ArrowRight,
  TrendingDown,
  Camera,
  CheckCircle2,
  Cpu,
  Layers,
  SlidersHorizontal,
  HardDrive,
  Zap,
  Thermometer,
  ShoppingCart,
  Download,
  Filter,
  ArrowUpDown,
  Boxes,
  Tag,
  Info,
  BarChart3,
  ShieldAlert,
  Flame,
  Award,
  Laptop,
} from 'lucide-react';

type Module4ToolId =
  | 'bench_grid'
  | 'scanner_tool'
  | 'digital_rubric'
  | 'receipt_generator'
  | 'tool_loans'
  | 'weekly_summary'
  | 'kanban_dispatch'
  | 'parts_inventory'
  | 'bottleneck_calc'
  | 'hardware_combos'
  | 'laptop_fleet'
  | 'asset_inventory';

export const ShopManagementSuite: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool state
  const [activeTool, setActiveTool] = useState<Module4ToolId>('bench_grid');

  // AI Drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 4.1 State: 16 Bench Station Grid
  // -------------------------------------------------------------
  const [benchStations, setBenchStations] = useState<BenchStation[]>(INITIAL_16_BENCH_STATIONS);
  const [selectedBench, setSelectedBench] = useState<BenchStation>(INITIAL_16_BENCH_STATIONS[0]);

  // -------------------------------------------------------------
  // Tool 4.2 State: Barcode & Serial Scanner
  // -------------------------------------------------------------
  const [scannedSerialInput, setScannedSerialInput] = useState<string>('SN-DL7090-8841B');
  const [scanResult, setScanResult] = useState<{
    serial: string;
    oem: string;
    productLine: string;
    warrantyStatus: string;
    theftCheck: string;
  }>({
    serial: 'SN-DL7090-8841B',
    oem: 'Dell Commercial Operations',
    productLine: 'OptiPlex 7090 Micro Tower (LGA1200)',
    warrantyStatus: 'Active ProSupport Plus (Expires Aug 2026)',
    theftCheck: 'Clean (Verified TradeTech Department Inventory)',
  });

  // -------------------------------------------------------------
  // Tool 4.3 State: Digital Sign-off & Grading Rubric
  // -------------------------------------------------------------
  const [studentName, setStudentName] = useState<string>('Sarah Jenkins');
  const [rubricScores, setRubricScores] = useState<{
    safety: number;
    diagnostics: number;
    workmanship: number;
    documentation: number;
  }>({
    safety: 10,
    diagnostics: 9,
    workmanship: 9,
    documentation: 8,
  });
  const [instructorNotes, setInstructorNotes] = useState<string>(
    'Demonstrated excellent ESD safety protocol. Successfully diagnosed shorted high-side MOSFET on +12V EPS rail.'
  );
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingSig = useRef<boolean>(false);

  // -------------------------------------------------------------
  // Tool 4.4 State: Printable Receipt Generator
  // -------------------------------------------------------------
  const [clientName, setClientName] = useState<string>('Vocational Media Arts Lab');
  const [deviceModel, setDeviceModel] = useState<string>('Dell OptiPlex 7090 Desktop');
  const [deviceSerial, setDeviceSerial] = useState<string>('SN-DL7090-8841B');
  const [reportedSymptom, setReportedSymptom] = useState<string>('No POST, power LED blinks 2 amber, 3 white.');
  const [rawTechDiagnosis, setRawTechDiagnosis] = useState<string>(
    'Replaced shorted decoupling MLCC capacitor on +19V rail near PU401; reflowed cold solder joint on DIMM Slot 2; flashed corrupted SPI ROM with clean Intel ME region.'
  );
  const [partsCost, setPartsCost] = useState<number>(12.5);
  const [laborHours, setLaborHours] = useState<number>(2.0);
  const [laborRate, setLaborRate] = useState<number>(45.0);
  const [customerFriendlyText, setCustomerFriendlyText] = useState<string>(
    'Diagnosed and replaced a faulty power regulation filter component that prevented the computer from starting up. Refreshed memory slot connections and updated the motherboard security firmware to full working order.'
  );

  // -------------------------------------------------------------
  // Tool 4.5 State: Equipment & Tool Loan Ledger
  // -------------------------------------------------------------
  const [toolLoans, setToolLoans] = useState<ToolLoanItem[]>(INITIAL_TOOL_LOANS);

  // -------------------------------------------------------------
  // Tool 4.6 State: Automated Weekly Lab Summary
  // -------------------------------------------------------------
  const [reportRange, setReportRange] = useState<'Weekly' | 'Monthly' | 'Semester'>('Weekly');

  // -------------------------------------------------------------
  // Tool 4.7 State: Kanban Work Order Dispatcher
  // -------------------------------------------------------------
  const [kanbanTickets, setKanbanTickets] = useState<KanbanTicket[]>(INITIAL_KANBAN_TICKETS);

  // -------------------------------------------------------------
  // Tool 4.8 State: Parts Inventory & Consumption Ledger
  // -------------------------------------------------------------
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_PARTS_INVENTORY);
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'ALL'>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK' | 'OUT'>('ALL');
  const [inventoryViewMode, setInventoryViewMode] = useState<'cards' | 'table' | 'compatibility_lab'>('cards');
  const [inventorySortBy, setInventorySortBy] = useState<'category' | 'name' | 'stock' | 'price'>('category');

  // -------------------------------------------------------------
  // Tool 4.9 & 4.10 State: Saved Hardware Combos & Build Planner
  // -------------------------------------------------------------
  const [savedCombos, setSavedCombos] = useState<SavedHardwareCombo[]>(() => {
    const saved = localStorage.getItem('tradetech_saved_hardware_combos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SAVED_COMBOS;
      }
    }
    return INITIAL_SAVED_COMBOS;
  });

  useEffect(() => {
    localStorage.setItem('tradetech_saved_hardware_combos', JSON.stringify(savedCombos));
  }, [savedCombos]);

  // -------------------------------------------------------------
  // Tool 4.11 State: Laptop Fleet & Diagnostics Registry
  // -------------------------------------------------------------
  const [laptopFleet, setLaptopFleet] = useState<LaptopAsset[]>(() => {
    const saved = localStorage.getItem('tradetech_laptop_fleet_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length >= INITIAL_LAPTOPS_CATALOG.length) return parsed;
      } catch (e) {
        return INITIAL_LAPTOPS_CATALOG;
      }
    }
    return INITIAL_LAPTOPS_CATALOG;
  });

  useEffect(() => {
    localStorage.setItem('tradetech_laptop_fleet_registry', JSON.stringify(laptopFleet));
  }, [laptopFleet]);

  // Barcode Scanner & D3 Analytics Modal State
  const [isBarcodeScannerModalOpen, setIsBarcodeScannerModalOpen] = useState<boolean>(false);
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState<boolean>(false);

  // Add Custom Part Modal State
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState<boolean>(false);
  const [newPartData, setNewPartData] = useState<{
    name: string;
    sku: string;
    category: InventoryCategory;
    stock: number;
    minThreshold: number;
    unitCost: number;
    supplier: 'Micro Center' | 'Newegg' | 'Amazon Business' | 'DigiKey' | 'Mouser' | 'B&H Photo' | 'Direct OEM';
    location: string;
    socket: string;
    formFactor: string;
    memoryType: string;
    tdpWatts: number;
    storageCapacity: string;
  }>({
    name: '',
    sku: '',
    category: 'Processors (CPUs)',
    stock: 5,
    minThreshold: 2,
    unitCost: 199.00,
    supplier: 'Micro Center',
    location: 'Bench Storage',
    socket: 'AM5',
    formFactor: 'ATX',
    memoryType: 'DDR5',
    tdpWatts: 105,
    storageCapacity: '',
  });

  // PC Compatibility Builder Selection State
  const [compatSelections, setCompatSelections] = useState<{
    cpuId: string;
    mbId: string;
    gpuId: string;
    ramId: string;
    ssdId: string;
    psuId: string;
    coolerId: string;
    caseId: string;
  }>({
    cpuId: 'cpu_01', // Ryzen 7 7800X3D
    mbId: 'mb_08',  // ROG Crosshair X670E Hero
    gpuId: 'gpu_02', // RTX 4080 Super
    ramId: 'ram_01', // G.Skill DDR5 64GB
    ssdId: 'ssd_03', // Samsung 990 Pro 2TB
    psuId: 'psu_04', // Seasonic Focus GX-1000
    coolerId: 'cl_02', // Arctic Liquid Freezer III 360
    caseId: 'cs_02', // Fractal North Walnut
  });

  // Load API Key & saved Module 4 state
  useEffect(() => {
    const key = getStoredGeminiApiKey();
    setCustomApiKey(key);

    const saved = localStorage.getItem('tradetech_module4_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeTool) setActiveTool(parsed.activeTool);
        if (parsed.benchStations) setBenchStations(parsed.benchStations);
        // Ensure new rich parts inventory replaces older, smaller cached inventory
        if (parsed.inventory && parsed.inventory.length >= INITIAL_PARTS_INVENTORY.length) {
          setInventory(parsed.inventory);
        } else {
          setInventory(INITIAL_PARTS_INVENTORY);
        }
        if (parsed.kanbanTickets) setKanbanTickets(parsed.kanbanTickets);
      } catch (e) {
        console.warn('Could not restore Module 4 state', e);
      }
    }
  }, []);

  // Save Module 4 state
  useEffect(() => {
    try {
      localStorage.setItem(
        'tradetech_module4_state',
        JSON.stringify({
          activeTool,
          benchStations,
          inventory,
          kanbanTickets,
        })
      );
    } catch (e) {
      console.warn('Failed saving module 4 state', e);
    }
  }, [activeTool, benchStations, inventory, kanbanTickets]);

  // Handle signature pad drawing
  useEffect(() => {
    if (activeTool === 'digital_rubric') {
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [activeTool]);

  const startSigDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingSig.current = true;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopSigDrawing = () => {
    isDrawingSig.current = false;
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // -------------------------------------------------------------
  // Universal AI Dispatcher for Module 4
  // -------------------------------------------------------------
  const handleRunAiAnalysis = async (toolTitle: string, payload: any) => {
    setAiLoading(true);
    setIsAiDrawerOpen(true);

    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 4: INSTRUCTOR, LAB MANAGEMENT & BENCH WORKFLOW SUITE',
        toolName: toolTitle,
        inputPayload: payload,
        userRole: isOwner ? 'ROLE_OWNER' : 'ROLE_STUDENT',
        customPrompt: aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Shop Administrator AI Analyzed',
        message: `Generated administrative report for ${toolTitle}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Shop AI Error',
        message: err?.message || 'Check network connection or API Key.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Navigation for the 11 Shop Management Tools
  // -------------------------------------------------------------
  const toolNav: { id: Module4ToolId; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'bench_grid', label: '1. Live 16-Bench Grid & Capacity', icon: <LayoutGrid className="w-4 h-4" />, badge: '16 Benches' },
    { id: 'scanner_tool', label: '2. Barcode, QR Code & Serial Scanner', icon: <QrCode className="w-4 h-4" />, badge: 'Asset Profiler' },
    { id: 'digital_rubric', label: '3. Instructor Digital Sign-Off & Rubric', icon: <PenTool className="w-4 h-4" />, badge: 'E-Sign' },
    { id: 'receipt_generator', label: '4. Work Order & Service Receipt', icon: <Receipt className="w-4 h-4" />, badge: 'Print / PDF' },
    { id: 'tool_loans', label: '5. Equipment & Tool Loan Ledger', icon: <Wrench className="w-4 h-4" />, badge: 'Overdue Track' },
    { id: 'weekly_summary', label: '6. Automated Weekly Lab Summary', icon: <FileBarChart className="w-4 h-4" />, badge: 'Principal Report' },
    { id: 'kanban_dispatch', label: '7. Student Work Order Kanban', icon: <Kanban className="w-4 h-4" />, badge: '3 Stages' },
    { id: 'parts_inventory', label: '8. Parts Inventory & Reorder Ledger', icon: <Package className="w-4 h-4" />, badge: `${inventory.length} Parts` },
    { id: 'bottleneck_calc', label: '9. Bottleneck Calculator & Synergy', icon: <SlidersHorizontal className="w-4 h-4 text-cyan-400" />, badge: 'Gauge Chart' },
    { id: 'hardware_combos', label: '10. Build Planner & Saved Part Combos', icon: <Layers className="w-4 h-4 text-emerald-400" />, badge: 'PDF Report' },
    { id: 'laptop_fleet', label: '11. Laptop Fleet Registry & Triage', icon: <Laptop className="w-4 h-4 text-sky-400" />, badge: `${laptopFleet.length} Units` },
    { id: 'asset_inventory', label: '12. Asset Inventory & Problem Marker', icon: <Tag className="w-4 h-4 text-teal-400" />, badge: 'Hardware Tracker' },
  ];

  const totalRubricScore =
    rubricScores.safety + rubricScores.diagnostics + rubricScores.workmanship + rubricScores.documentation;
  const rubricPercentage = Math.round((totalRubricScore / 40) * 100);
  let letterGrade = 'A';
  if (rubricPercentage < 60) letterGrade = 'F';
  else if (rubricPercentage < 70) letterGrade = 'D';
  else if (rubricPercentage < 80) letterGrade = 'C';
  else if (rubricPercentage < 90) letterGrade = 'B';

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-amber-400 font-bold">Module 04</span>
            <span className="text-gray-600">/</span>
            <span>Vocational Lab Floor & Shop Operations</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            Instructor, Lab Management & Bench Workflow Suite
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            16-station live grid, digital grading rubrics, work order invoices, tool checkout, and parts inventory.
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
            <span>{isAiDrawerOpen ? 'Hide Operations AI' : 'Consult Operations AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tool View + AI Operations Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 shadow-md">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider px-2 py-1 mb-1 font-semibold flex items-center justify-between">
              <span>8 Shop Management Tools</span>
              <span className="text-[#06b6d4]">Module 4</span>
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
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Vocational Operations Protocol
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Maintain clean chain-of-custody for client equipment. Verify calibrated multimeter returns at end of shift before signing off student lab hours.
            </p>
          </div>
        </div>

        {/* Tool Workspace Container */}
        <div className={`space-y-6 ${isAiDrawerOpen ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          {/* ======================================================== */}
          {/* TOOL 4.1: Live Bench Station Grid & Capacity Monitor */}
          {/* ======================================================== */}
          {activeTool === 'bench_grid' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-[#06b6d4]" />
                    Live 16-Bench Station Grid & Capacity Monitor
                  </h3>
                  <p className="text-xs text-gray-400">
                    Real-time visual monitoring of all 16 physical bench stations, technician allocations, and elapsed triage times.
                  </p>
                </div>
              </div>

              {/* 16 Station Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {benchStations.map((bench) => {
                  const isSelected = selectedBench.id === bench.id;
                  const isAvail = bench.status === 'Open/Available';
                  const isTriage = bench.status === 'Active Triage';
                  const isWaiting = bench.status === 'Awaiting Parts';
                  const isQA = bench.status === 'QA Testing';
                  const isHazard = bench.status === 'Out of Service';

                  return (
                    <div
                      key={bench.id}
                      onClick={() => setSelectedBench(bench)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10 shadow-lg'
                          : 'border-gray-800 bg-gray-950/70 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <strong className="text-white">{bench.number}</strong>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAvail
                              ? 'bg-emerald-400'
                              : isTriage
                              ? 'bg-cyan-400 animate-pulse'
                              : isWaiting
                              ? 'bg-amber-400'
                              : isQA
                              ? 'bg-purple-400'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>

                      <div className="text-[11px] font-mono text-gray-300 truncate">
                        {bench.assignedStudent}
                      </div>

                      <div className="text-[10px] text-gray-500 font-mono truncate mt-0.5">
                        {bench.activeDevice}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-900 text-[9px] font-mono text-gray-400">
                        <span>{bench.status}</span>
                        {bench.elapsedMinutes > 0 && <span>{bench.elapsedMinutes}m</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Station Detail & Status Controls */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm font-bold text-white">
                    {selectedBench.number} Station Management
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['Open/Available', 'Active Triage', 'Awaiting Parts', 'QA Testing', 'Out of Service'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => {
                            const updated = benchStations.map((b) =>
                              b.id === selectedBench.id ? { ...b, status: st } : b
                            );
                            setBenchStations(updated);
                            setSelectedBench({ ...selectedBench, status: st });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            selectedBench.status === st
                              ? 'bg-[#06b6d4] text-black font-bold'
                              : 'bg-gray-900 text-gray-400 hover:text-white'
                          }`}
                        >
                          {st.split('/')[0]}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500 block">Assigned Tech:</span>
                    <strong className="text-white">{selectedBench.assignedStudent}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Active Device:</span>
                    <strong className="text-cyan-400">{selectedBench.activeDevice}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Work Order:</span>
                    <strong className="text-gray-200">{selectedBench.workOrderId}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Elapsed Bench Time:</span>
                    <strong className="text-amber-400">{selectedBench.elapsedMinutes} Minutes</strong>
                  </div>
                </div>

                <p className="text-gray-400 text-[11px] pt-1 border-t border-gray-900">
                  <strong>Bench Notes:</strong> {selectedBench.notes}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Live Bench Station Grid & Capacity Monitor', {
                      totalBenches: benchStations.length,
                      activeOccupancy: benchStations.filter((b) => b.status !== 'Open/Available').length,
                      benchStates: benchStations.map((b) => ({
                        bench: b.number,
                        status: b.status,
                        tech: b.assignedStudent,
                        elapsed: `${b.elapsedMinutes}m`,
                      })),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Capacity & Bottleneck Analyzer</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.2: Barcode, QR Code & Serial Scanner */}
          {/* ======================================================== */}
          {activeTool === 'scanner_tool' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#06b6d4]" />
                    Barcode, QR Code & Serial Hardware Scanner
                  </h3>
                  <p className="text-xs text-gray-400">
                    Reads Code 128 / UPC-A barcodes and 2D QR asset tags, resolving warranty coverage and inventory records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-gray-400">
                    Scan or Paste Serial / Asset Tag String:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scannedSerialInput}
                      onChange={(e) => setScannedSerialInput(e.target.value)}
                      placeholder="e.g. SN-DL7090-8841B or FOC2441A99X"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#06b6d4] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setScanResult({
                          serial: scannedSerialInput,
                          oem: scannedSerialInput.startsWith('SN-DL')
                            ? 'Dell Enterprise'
                            : scannedSerialInput.startsWith('SN-CS')
                            ? 'Corsair Memory Inc.'
                            : 'Cisco Systems Inc.',
                          productLine: 'Enterprise Hardware Asset',
                          warrantyStatus: 'Active Factory Coverage Verified',
                          theftCheck: 'Clean Record (No Lost/Stolen Match)',
                        });
                        addToast({ type: 'success', title: 'Asset Queried', message: `Found ${scannedSerialInput}` });
                      }}
                      className="px-4 py-2 bg-[#06b6d4] text-black font-bold font-mono text-xs rounded-lg shrink-0"
                    >
                      Lookup
                    </button>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono block">
                    Quick tests: "SN-DL7090-8841B", "SN-CS-RM850X-77123", "SN-FOC2441A99X"
                  </span>
                </div>

                {/* Scanned Card */}
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <strong className="text-white">{scanResult.serial}</strong>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="text-gray-400">OEM: <span className="text-white">{scanResult.oem}</span></div>
                  <div className="text-gray-400">Model: <span className="text-cyan-400">{scanResult.productLine}</span></div>
                  <div className="text-gray-400">Warranty: <span className="text-emerald-400">{scanResult.warrantyStatus}</span></div>
                  <div className="text-gray-400">Police/Theft DB: <span className="text-gray-300">{scanResult.theftCheck}</span></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Barcode, QR Code & Serial Scanner', {
                      scannedTag: scannedSerialInput,
                      profileResult: scanResult,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Asset & Theft Profiler</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.3: Instructor Digital Sign-Off & Grading Rubric */}
          {/* ======================================================== */}
          {activeTool === 'digital_rubric' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-[#06b6d4]" />
                    Instructor Digital Sign-Off & Vocational Rubric
                  </h3>
                  <p className="text-xs text-gray-400">
                    4-criteria competency grading with HTML5 digital signature capture and personalized AI feedback generation.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-gray-400">Final Grade:</span>
                  <div className="text-xl font-bold text-emerald-400">
                    Grade {letterGrade} ({rubricPercentage}%)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Student Technician Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Safety & ESD Precautions (0-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={rubricScores.safety}
                    onChange={(e) => setRubricScores({ ...rubricScores, safety: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#06b6d4]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Ground Strap Compliance</span>
                    <strong className="text-cyan-400">{rubricScores.safety}/10</strong>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Diagnostic Accuracy & Methodology (0-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={rubricScores.diagnostics}
                    onChange={(e) => setRubricScores({ ...rubricScores, diagnostics: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#06b6d4]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Theory Testing Sequence</span>
                    <strong className="text-cyan-400">{rubricScores.diagnostics}/10</strong>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Workmanship & Soldering (0-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={rubricScores.workmanship}
                    onChange={(e) => setRubricScores({ ...rubricScores, workmanship: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#06b6d4]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>IPC-A-610 Solder Quality</span>
                    <strong className="text-cyan-400">{rubricScores.workmanship}/10</strong>
                  </div>
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Instructor Digital Signature (Touch / Mouse):</span>
                  <button onClick={clearSignature} className="text-red-400 hover:underline">
                    Clear Signature
                  </button>
                </div>
                <div className="border border-gray-800 rounded-xl overflow-hidden bg-black flex justify-center">
                  <canvas
                    ref={signatureCanvasRef}
                    width={480}
                    height={100}
                    onMouseDown={startSigDrawing}
                    onMouseMove={drawSig}
                    onMouseUp={stopSigDrawing}
                    onMouseLeave={stopSigDrawing}
                    className="cursor-crosshair"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Instructor Digital Sign-Off & Grading Rubric', {
                      student: studentName,
                      scores: rubricScores,
                      totalPercentage: `${rubricPercentage}%`,
                      letterGrade,
                      hasDigitalSignature: hasSignature,
                      instructorNotes,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Student Feedback Generator</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.4: Printable Work Order & Service Receipt */}
          {/* ======================================================== */}
          {activeTool === 'receipt_generator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#06b6d4]" />
                    Printable Work Order & Service Receipt Generator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Produces clean, itemized customer service receipts with one-click AI translation from raw tech jargon.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs border border-gray-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>

              {/* Form Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Device Model</label>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Parts Cost ($)</label>
                  <input
                    type="number"
                    value={partsCost}
                    onChange={(e) => setPartsCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Tech Jargon vs Customer Friendly Dual-Pane */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Raw Technician Bench Notes (Complex):</label>
                  <textarea
                    rows={4}
                    value={rawTechDiagnosis}
                    onChange={(e) => setRawTechDiagnosis(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-gray-200"
                  />
                </div>
                <div>
                  <label className="text-cyan-400 block mb-1">Customer-Friendly Translated Summary:</label>
                  <textarea
                    rows={4}
                    value={customerFriendlyText}
                    onChange={(e) => setCustomerFriendlyText(e.target.value)}
                    className="w-full bg-gray-950 border border-cyan-500/40 rounded-lg p-2.5 text-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                <span className="font-mono text-xs text-gray-400">
                  Total Billable: <strong className="text-emerald-400">${(partsCost + laborHours * laborRate).toFixed(2)}</strong> (Parts: ${partsCost} + Labor: ${laborHours * laborRate})
                </span>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('Printable Work Order & Service Receipt Generator', {
                      rawNotes: rawTechDiagnosis,
                      client: clientName,
                      device: deviceModel,
                      cost: `$${(partsCost + laborHours * laborRate).toFixed(2)}`,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Jargon-to-Customer Translator</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.5: Equipment & Tool Loan Ledger */}
          {/* ======================================================== */}
          {activeTool === 'tool_loans' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#06b6d4]" />
                    Equipment & Tool Loan Tracking Ledger
                  </h3>
                  <p className="text-xs text-gray-400">
                    Tracks precision multimeters, thermal cameras, and programmers with return deadline enforcement.
                  </p>
                </div>
              </div>

              {/* Tool Loan List */}
              <div className="space-y-2 font-mono text-xs">
                {toolLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      loan.isOverdue
                        ? 'bg-red-950/30 border-red-500/50'
                        : 'bg-gray-950 border-gray-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {loan.name}
                        {loan.isOverdue && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500 text-black font-bold animate-pulse">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Tag: {loan.assetTag} • Borrower: <span className="text-cyan-400">{loan.borrower}</span> ({loan.bench})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-300">Due: {loan.expectedReturn}</span>
                      <div className="text-[10px] text-gray-500">Condition: {loan.condition}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Equipment & Tool Loan Tracking System', {
                      loans: toolLoans,
                      overdueCount: toolLoans.filter((t) => t.isOverdue).length,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Tool Risk & Inventory Forecaster</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.6: Automated Weekly Lab Summary */}
          {/* ======================================================== */}
          {activeTool === 'weekly_summary' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <FileBarChart className="w-5 h-5 text-[#06b6d4]" />
                    Automated Weekly Lab Summary Generator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Compiles institutional repair metrics and curriculum milestones for vocational department chairs.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  {(['Weekly', 'Monthly', 'Semester'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportRange(r)}
                      className={`px-3 py-1 text-xs font-mono rounded ${
                        reportRange === r ? 'bg-[#06b6d4] text-black font-bold' : 'text-gray-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aggregation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Completed Work Orders</span>
                  <strong className="text-lg text-emerald-400">28 Tickets</strong>
                </div>
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Student Lab Hours</span>
                  <strong className="text-lg text-cyan-400">142 Hours</strong>
                </div>
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Top Fault Triaged</span>
                  <strong className="text-lg text-amber-400">RAM / POST</strong>
                </div>
                <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-500 block">Safety Violations</span>
                  <strong className="text-lg text-emerald-400">0 (100% ESD)</strong>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Automated Weekly Lab Summary Generator', {
                      timeframe: reportRange,
                      completedTickets: 28,
                      labHoursLogged: 142,
                      topFailures: ['RAM Seating / XMP failure', 'Burnt MLCC capacitors', 'Ethernet termination faults'],
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Executive Report Compiler</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.7: Student Work Order Kanban Dispatcher */}
          {/* ======================================================== */}
          {activeTool === 'kanban_dispatch' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Kanban className="w-5 h-5 text-[#06b6d4]" />
                    Student Work Order Kanban Dispatcher
                  </h3>
                  <p className="text-xs text-gray-400">
                    Live 3-stage visual workflow dispatcher allocating repair jobs across technician skill levels.
                  </p>
                </div>
              </div>

              {/* 3 Column Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {(['Pending Triage', 'In Progress', 'QA & Completed'] as const).map((stage) => {
                  const stageTickets = kanbanTickets.filter((t) => t.stage === stage);
                  return (
                    <div key={stage} className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-gray-800">
                        <span className="font-bold text-gray-300">{stage}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-900 text-cyan-400">
                          {stageTickets.length}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {stageTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="p-2.5 bg-gray-900 rounded-lg border border-gray-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#06b6d4] font-bold">{ticket.id}</span>
                              <span
                                className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                                  ticket.priority === 'Critical'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {ticket.priority}
                              </span>
                            </div>
                            <strong className="text-white text-[11px] block">{ticket.title}</strong>
                            <div className="text-[10px] text-gray-400 line-clamp-1">{ticket.reportedFault}</div>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-[9px] text-gray-500">
                              <span>Tech: {ticket.assignedStudent}</span>
                              {stage !== 'QA & Completed' && (
                                <button
                                  onClick={() => {
                                    const nextStage = stage === 'Pending Triage' ? 'In Progress' : 'QA & Completed';
                                    setKanbanTickets((prev) =>
                                      prev.map((t) => (t.id === ticket.id ? { ...t, stage: nextStage } : t))
                                    );
                                  }}
                                  className="text-cyan-400 hover:underline flex items-center gap-0.5"
                                >
                                  Advance ➔
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Student Work Order Kanban Dispatcher', {
                      tickets: kanbanTickets,
                      totalTickets: kanbanTickets.length,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Smart Ticket Dispatcher</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.8: Parts Inventory & Consumption Ledger */}
          {/* ======================================================== */}
          {activeTool === 'parts_inventory' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-6 shadow-xl">
              {/* Header with Inventory Stats Summary */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                        PC Hardware & Bench Inventory Catalog
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                          {inventory.length} Parts Available
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Vocational stock covering CPUs, GPUs, Motherboards, RAM, NVMe/SATA, PSUs, Coolers, Chassis & Chemicals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Top Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => setIsBarcodeScannerModalOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-mono text-xs font-semibold shadow-sm transition-all"
                    title="Real-time Camera Barcode & QR Scanner"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Scan Barcode</span>
                  </button>

                  <button
                    onClick={() => setIsAnalyticsDashboardOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/50 font-mono text-xs font-semibold shadow-sm transition-all"
                    title="D3.js Telemetry, Lead Times & Failure Charts"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>D3 Analytics</span>
                  </button>

                  <button
                    onClick={() => setIsAddPartModalOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Part</span>
                  </button>

                  <button
                    onClick={() => {
                      const headers = ['SKU', 'Name', 'Category', 'Stock', 'Min Threshold', 'Unit Cost (USD)', 'Supplier', 'Location', 'Socket', 'Form Factor', 'Memory Type', 'TDP (W)'];
                      const rows = inventory.map(i => [
                        `"${i.sku}"`,
                        `"${i.name.replace(/"/g, '""')}"`,
                        `"${i.category}"`,
                        i.stock,
                        i.minThreshold,
                        i.unitCost.toFixed(2),
                        `"${i.supplier}"`,
                        `"${i.location}"`,
                        `"${i.socket || 'N/A'}"`,
                        `"${i.formFactor || 'N/A'}"`,
                        `"${i.memoryType || 'N/A'}"`,
                        i.tdpWatts || 'N/A'
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `tradetech_inventory_audit_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      addToast({
                        type: 'success',
                        title: 'Inventory Audit Exported',
                        message: `Exported ${inventory.length} PC parts to CSV spreadsheet.`,
                      });
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-mono text-xs transition-colors"
                    title="Export full catalog to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() =>
                      handleRunAiAnalysis('Parts Inventory & Consumption Ledger', {
                        totalCatalogParts: inventory.length,
                        totalUnits: inventory.reduce((a, b) => a + b.stock, 0),
                        lowStockItems: inventory.filter((i) => i.stock <= i.minThreshold).map(i => ({ sku: i.sku, name: i.name, current: i.stock, threshold: i.minThreshold, supplier: i.supplier })),
                        reorderRequest: 'Generate comprehensive Purchase Order summary with suppliers and estimated costs.',
                      })
                    }
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Reorder Forecaster</span>
                  </button>
                </div>
              </div>

              {/* Live Catalog Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-gray-950 border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Unique SKUs</div>
                  <div className="text-xl font-bold text-white mt-0.5">{inventory.length}</div>
                  <div className="text-[10px] text-cyan-400 mt-1">Across 13 PC Categories</div>
                </div>

                <div className="p-3 rounded-lg bg-gray-950 border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Physical Units</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {inventory.reduce((acc, i) => acc + i.stock, 0)}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">Active Bench Stock</div>
                </div>

                <div className="p-3 rounded-lg bg-gray-950 border border-gray-800/80">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Inventory Value</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    ${inventory.reduce((acc, i) => acc + i.stock * i.unitCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-purple-400 mt-1">Wholesale Cost Basis</div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  inventory.filter((i) => i.stock <= i.minThreshold).length > 0
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-gray-950 border-gray-800/80'
                }`}>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Low Stock Warnings</div>
                  <div className="text-xl font-bold text-amber-400 mt-0.5">
                    {inventory.filter((i) => i.stock <= i.minThreshold).length}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Below Min Safety Margin</div>
                </div>
              </div>

              {/* View Mode Switcher Strip */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-800/80 pb-2">
                <div className="flex items-center gap-1.5 p-1 bg-gray-950 border border-gray-800 rounded-xl">
                  <button
                    onClick={() => setInventoryViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      inventoryViewMode === 'cards'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Component Cards</span>
                  </button>

                  <button
                    onClick={() => setInventoryViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      inventoryViewMode === 'table'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Dense Audit Table</span>
                  </button>

                  <button
                    onClick={() => setInventoryViewMode('compatibility_lab')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      inventoryViewMode === 'compatibility_lab'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>PC Build & Compatibility Lab</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-500">Sort:</span>
                  <select
                    value={inventorySortBy}
                    onChange={(e: any) => setInventorySortBy(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="category">Category</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="stock">Stock (Low to High)</option>
                    <option value="price">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SUB-VIEW 1 & 2: Search, Filters & Catalog View */}
              {/* ======================================================== */}
              {(inventoryViewMode === 'cards' || inventoryViewMode === 'table') && (
                <div className="space-y-4">
                  {/* Search and Stock Status Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search parts by SKU, model, socket (AM5, LGA1700), or storage..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none placeholder-gray-500"
                      />
                      {inventorySearch && (
                        <button
                          onClick={() => setInventorySearch('')}
                          className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[11px]">
                      <button
                        onClick={() => setStockStatusFilter('ALL')}
                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                          stockStatusFilter === 'ALL'
                            ? 'bg-gray-800 text-white border border-gray-600 font-semibold'
                            : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                        }`}
                      >
                        All Stock ({inventory.length})
                      </button>
                      <button
                        onClick={() => setStockStatusFilter('LOW')}
                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                          stockStatusFilter === 'LOW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                            : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                        }`}
                      >
                        ⚠️ Low Safety ({inventory.filter((i) => i.stock <= i.minThreshold && i.stock > 0).length})
                      </button>
                      <button
                        onClick={() => setStockStatusFilter('IN_STOCK')}
                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                          stockStatusFilter === 'IN_STOCK'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-semibold'
                            : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                        }`}
                      >
                        ✅ In Stock ({inventory.filter((i) => i.stock > 0).length})
                      </button>
                      <button
                        onClick={() => setStockStatusFilter('OUT')}
                        className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                          stockStatusFilter === 'OUT'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/50 font-semibold'
                            : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                        }`}
                      >
                        ❌ Out ({inventory.filter((i) => i.stock === 0).length})
                      </button>
                    </div>
                  </div>

                  {/* Category Pills Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-mono text-xs">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                        selectedCategory === 'ALL'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                          : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                      }`}
                    >
                      All Categories ({inventory.length})
                    </button>
                    {INVENTORY_CATEGORIES.map((cat) => {
                      const count = inventory.filter((i) => i.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            selectedCategory === cat
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                              : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                          }`}
                        >
                          <span>{cat.replace(/\s*\(.*?\)\s*/g, '')}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 text-gray-400">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card View */}
                  {inventoryViewMode === 'cards' && (
                    <div className="space-y-6">
                      {/* High-Value Flagship Components Spotlight Strip (≥$200) */}
                      {selectedCategory === 'ALL' && stockStatusFilter === 'ALL' && !inventorySearch && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-gray-950 to-cyan-950/30 border border-purple-500/40 space-y-3.5 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-purple-400" />
                              <h4 className="font-mono font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                                High-Value Component Flagships (≥ $200.00 Cost Basis)
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 lowercase">
                                  {inventory.filter((i) => i.unitCost >= 200).length} high-asset parts
                                </span>
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                              Vocational Lab Capital Assets &amp; Flagship Hardware
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {inventory
                              .filter((i) => i.unitCost >= 200)
                              .slice(0, 6)
                              .map((item) => {
                                const isLow = item.stock <= item.minThreshold && item.stock > 0;
                                const isOut = item.stock === 0;
                                const stockRatio = Math.min(100, Math.round((item.stock / (item.minThreshold * 3)) * 100));

                                return (
                                  <div
                                    key={item.id}
                                    className="p-3.5 rounded-xl bg-gray-950/90 border border-purple-500/30 hover:border-purple-500/80 shadow-md hover:shadow-purple-500/10 transition-all flex flex-col justify-between space-y-3 group"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-1.5">
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300">
                                          {item.sku}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                                          ${item.unitCost.toFixed(2)}
                                        </span>
                                      </div>

                                      <div className="font-sans font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-purple-200">
                                        {item.name}
                                      </div>

                                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                                        {item.socket && (
                                          <span className="px-1.5 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                                            {item.socket}
                                          </span>
                                        )}
                                        {item.tdpWatts && (
                                          <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                                            {item.tdpWatts}W TDP
                                          </span>
                                        )}
                                        {item.formFactor && (
                                          <span className="px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40">
                                            {item.formFactor}
                                          </span>
                                        )}
                                      </div>

                                      {/* Stock Level Progress Bar */}
                                      <div className="space-y-1 pt-1">
                                        <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className={`h-full transition-all duration-300 ${
                                              isOut
                                                ? 'bg-red-500'
                                                : isLow
                                                ? 'bg-amber-400'
                                                : 'bg-emerald-400'
                                            }`}
                                            style={{ width: `${Math.max(6, stockRatio)}%` }}
                                          ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                                          <span>Stock: {item.stock} units</span>
                                          <span className={isOut ? 'text-red-400 font-bold' : isLow ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Quick Reorder Button */}
                                    <div className="pt-2 border-t border-gray-800/80 flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          const reorderQty = 5;
                                          setInventory((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + reorderQty } : i))
                                          );
                                          addToast({
                                            type: 'success',
                                            title: 'Quick Reorder Placed',
                                            message: `Ordered +${reorderQty} units of ${item.sku} from ${item.supplier} ($${(item.unitCost * reorderQty).toFixed(2)}).`,
                                          });
                                        }}
                                        className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>1-Click PO (+5)</span>
                                      </button>

                                      <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5">
                                        <button
                                          onClick={() => {
                                            setInventory((prev) =>
                                              prev.map((i) => (i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i))
                                            );
                                          }}
                                          className="w-5 h-5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center justify-center font-bold text-xs"
                                        >
                                          -
                                        </button>
                                        <span className="w-6 text-center font-mono font-bold text-[11px] text-white">
                                          {item.stock}
                                        </span>
                                        <button
                                          onClick={() => {
                                            setInventory((prev) =>
                                              prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 1 } : i))
                                            );
                                          }}
                                          className="w-5 h-5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center justify-center font-bold text-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Main All-Components Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {inventory
                          .filter((item) => {
                            const matchesSearch =
                              inventorySearch === '' ||
                              item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                              item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                              (item.socket && item.socket.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                              (item.formFactor && item.formFactor.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                              (item.storageCapacity && item.storageCapacity.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                              (item.location && item.location.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                              (item.supplier && item.supplier.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                              (item.notes && item.notes.toLowerCase().includes(inventorySearch.toLowerCase()));

                            const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

                            let matchesStatus = true;
                            if (stockStatusFilter === 'LOW') matchesStatus = item.stock <= item.minThreshold && item.stock > 0;
                            if (stockStatusFilter === 'OUT') matchesStatus = item.stock === 0;
                            if (stockStatusFilter === 'IN_STOCK') matchesStatus = item.stock > 0;

                            return matchesSearch && matchesCategory && matchesStatus;
                          })
                          .sort((a, b) => {
                            if (inventorySortBy === 'name') return a.name.localeCompare(b.name);
                            if (inventorySortBy === 'stock') return a.stock - b.stock;
                            if (inventorySortBy === 'price') return b.unitCost - a.unitCost;
                            return a.category.localeCompare(b.category);
                          })
                          .map((item) => {
                            const isLow = item.stock <= item.minThreshold && item.stock > 0;
                            const isOut = item.stock === 0;
                            const isHighValue = item.unitCost >= 200;
                            const stockRatio = Math.min(100, Math.round((item.stock / (item.minThreshold * 3)) * 100));

                            return (
                              <div
                                key={item.id}
                                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 group hover:border-cyan-500/50 ${
                                  isOut
                                    ? 'bg-red-950/20 border-red-500/50 shadow-sm'
                                    : isLow
                                    ? 'bg-amber-950/15 border-amber-500/40'
                                    : isHighValue
                                    ? 'bg-gray-950 border-purple-500/30 hover:bg-gray-900/60'
                                    : 'bg-gray-950 border-gray-800/80 hover:bg-gray-900/60'
                                }`}
                              >
                                <div className="space-y-2">
                                  {/* Top badges row */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400">
                                      {item.category.replace(/\s*\(.*?\)\s*/g, '')}
                                    </span>

                                    {isOut ? (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                                        OUT OF STOCK
                                      </span>
                                    ) : isLow ? (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        LOW ({item.stock} left)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        In Stock: {item.stock}
                                      </span>
                                    )}
                                  </div>

                                  {/* Part Title & SKU */}
                                  <div>
                                    <div className="font-sans font-semibold text-sm text-gray-100 group-hover:text-white leading-snug line-clamp-2">
                                      {item.name}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.sku);
                                          addToast({
                                            type: 'success',
                                            title: 'SKU Copied',
                                            message: `Copied ${item.sku} to clipboard`,
                                          });
                                        }}
                                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40"
                                        title="Click to copy SKU"
                                      >
                                        <span>{item.sku}</span>
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>

                                      {item.socket && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300 font-semibold">
                                          {item.socket}
                                        </span>
                                      )}

                                      {item.formFactor && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40 text-sky-300">
                                          {item.formFactor}
                                        </span>
                                      )}

                                      {item.tdpWatts && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                                          {item.tdpWatts}W
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Location & Supplier info */}
                                  <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1">
                                    <span className="truncate">📍 {item.location}</span>
                                    <span className="text-gray-500">{item.supplier}</span>
                                  </div>

                                  {/* Stock progress bar */}
                                  <div className="space-y-1 pt-1">
                                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-300 ${
                                          isOut
                                            ? 'bg-red-500'
                                            : isLow
                                            ? 'bg-amber-400'
                                            : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.max(5, stockRatio)}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                                      <span>Threshold: {item.minThreshold}</span>
                                      <span>Current: {item.stock} units</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Price, Quick Reorder and Stepper Bottom Bar */}
                                <div className="border-t border-gray-800/80 pt-3 mt-3 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-[10px] text-gray-500 font-mono">Unit Price</div>
                                      <div className="text-sm font-mono font-bold text-cyan-400">
                                        ${item.unitCost.toFixed(2)}
                                      </div>
                                    </div>

                                    {/* One-Click Quick Reorder Button */}
                                    <button
                                      onClick={() => {
                                        const reorderQty = 5;
                                        setInventory((prev) =>
                                          prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + reorderQty } : i))
                                        );
                                        addToast({
                                          type: 'success',
                                          title: 'Quick Reorder Submitted',
                                          message: `Restocked +${reorderQty} units of ${item.name} ($${(item.unitCost * reorderQty).toFixed(2)}).`,
                                        });
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors"
                                      title="One-click quick reorder 5 units"
                                    >
                                      <RefreshCw className="w-2.5 h-2.5" />
                                      <span>+5 Reorder</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-gray-800/40">
                                    <span className="text-[10px] font-mono text-gray-500">Adjust Bench Stock:</span>
                                    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-0.5 rounded-lg">
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) => {
                                              if (i.id === item.id) {
                                                const newStock = Math.max(0, i.stock - 5);
                                                return { ...i, stock: newStock };
                                              }
                                              return i;
                                            })
                                          );
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 hover:text-white hover:bg-gray-800"
                                        title="Deduct 5"
                                      >
                                        -5
                                      </button>
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) => {
                                              if (i.id === item.id) {
                                                const newStock = Math.max(0, i.stock - 1);
                                                if (newStock <= i.minThreshold) {
                                                  addToast({
                                                    type: 'warning',
                                                    title: 'Low Safety Stock',
                                                    message: `${i.name} down to ${newStock} units.`,
                                                  });
                                                }
                                                return { ...i, stock: newStock };
                                              }
                                              return i;
                                            })
                                          );
                                        }}
                                        className="w-5 h-5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold flex items-center justify-center text-xs"
                                        title="Deduct 1"
                                      >
                                        -
                                      </button>
                                      <span className="w-7 text-center font-mono font-bold text-xs text-white">
                                        {item.stock}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 1 } : i))
                                          );
                                        }}
                                        className="w-5 h-5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold flex items-center justify-center text-xs"
                                        title="Add 1"
                                      >
                                        +
                                      </button>
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 5 } : i))
                                          );
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 hover:text-white hover:bg-gray-800"
                                        title="Add 5"
                                      >
                                        +5
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Table View */}
                  {inventoryViewMode === 'table' && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-gray-900 border-b border-gray-800 text-[11px] text-gray-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Component Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Socket / Form</th>
                            <th className="p-3">Location</th>
                            <th className="p-3 text-right">Unit Cost</th>
                            <th className="p-3 text-center">Stock</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/80">
                          {inventory
                            .filter((item) => {
                              const matchesSearch =
                                inventorySearch === '' ||
                                item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                                item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                                (item.socket && item.socket.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                                (item.formFactor && item.formFactor.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                                (item.storageCapacity && item.storageCapacity.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                                (item.location && item.location.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                                (item.supplier && item.supplier.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                                (item.notes && item.notes.toLowerCase().includes(inventorySearch.toLowerCase()));

                              const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

                              let matchesStatus = true;
                              if (stockStatusFilter === 'LOW') matchesStatus = item.stock <= item.minThreshold && item.stock > 0;
                              if (stockStatusFilter === 'OUT') matchesStatus = item.stock === 0;
                              if (stockStatusFilter === 'IN_STOCK') matchesStatus = item.stock > 0;

                              return matchesSearch && matchesCategory && matchesStatus;
                            })
                            .map((item) => {
                              const isLow = item.stock <= item.minThreshold && item.stock > 0;
                              const isOut = item.stock === 0;

                              return (
                                <tr key={item.id} className="hover:bg-gray-900/50 transition-colors">
                                  <td className="p-3 text-cyan-400 font-bold font-mono whitespace-nowrap">
                                    {item.sku}
                                  </td>
                                  <td className="p-3 text-white font-sans font-medium">
                                    <div>{item.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                      {item.supplier}
                                    </div>
                                  </td>
                                  <td className="p-3 text-gray-400 whitespace-nowrap">
                                    {item.category.replace(/\s*\(.*?\)\s*/g, '')}
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                                      {item.socket || item.formFactor || 'Standard'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-gray-400 whitespace-nowrap">{item.location}</td>
                                  <td className="p-3 text-right font-bold text-cyan-400 whitespace-nowrap">
                                    ${item.unitCost.toFixed(2)}
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        isOut
                                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                          : isLow
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      }`}
                                    >
                                      {item.stock} / {item.minThreshold} min
                                    </span>
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) =>
                                              i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i
                                            )
                                          );
                                        }}
                                        className="w-6 h-6 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center justify-center font-bold"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() => {
                                          setInventory((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 1 } : i))
                                          );
                                        }}
                                        className="w-6 h-6 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center justify-center font-bold"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-VIEW 3: PC Build Compatibility & System Wattage Lab */}
              {/* ======================================================== */}
              {inventoryViewMode === 'compatibility_lab' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h4 className="font-mono font-bold text-white text-sm">
                        Interactive PC Hardware Compatibility & Power Supply Engine
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      Select active components from the trade school inventory. The system cross-examines CPU socket matches, motherboard form factors, DDR4/DDR5 memory generations, and calculates actual load wattage and safety margin.
                    </p>
                  </div>

                  {(() => {
                    const cpu = inventory.find((i) => i.id === compatSelections.cpuId);
                    const mb = inventory.find((i) => i.id === compatSelections.mbId);
                    const gpu = inventory.find((i) => i.id === compatSelections.gpuId);
                    const ram = inventory.find((i) => i.id === compatSelections.ramId);
                    const ssd = inventory.find((i) => i.id === compatSelections.ssdId);
                    const psu = inventory.find((i) => i.id === compatSelections.psuId);
                    const cooler = inventory.find((i) => i.id === compatSelections.coolerId);
                    const pcCase = inventory.find((i) => i.id === compatSelections.caseId);

                    // Compatibility checks
                    const socketMatch = !cpu || !mb || !cpu.socket || !mb.socket || cpu.socket === mb.socket;
                    const ramMatch = !mb || !ram || !mb.memoryType || !ram.memoryType || mb.memoryType.includes(ram.memoryType) || ram.memoryType.includes(mb.memoryType);

                    // Wattage breakdown
                    const cpuWatts = cpu?.tdpWatts || 105;
                    const gpuWatts = gpu?.tdpWatts || 220;
                    const baseSystemWatts = 75; // Motherboard chipset, RGB, M.2, Fans
                    const totalWatts = cpuWatts + gpuWatts + baseSystemWatts;
                    const recommendedPsuRating = Math.ceil((totalWatts * 1.35) / 50) * 50; // 35% margin rounded to nearest 50W
                    const selectedPsuWatts = psu?.tdpWatts || 750;
                    const psuAdequate = selectedPsuWatts >= recommendedPsuRating;

                    // Total build cost
                    const totalCost =
                      (cpu?.unitCost || 0) +
                      (mb?.unitCost || 0) +
                      (gpu?.unitCost || 0) +
                      (ram?.unitCost || 0) +
                      (ssd?.unitCost || 0) +
                      (psu?.unitCost || 0) +
                      (cooler?.unitCost || 0) +
                      (pcCase?.unitCost || 0);

                    // Stock health check
                    const selectedList = [cpu, mb, gpu, ram, ssd, psu, cooler, pcCase].filter(Boolean) as InventoryItem[];
                    const allInStock = selectedList.every((i) => i.stock > 0);

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
                        {/* Left 2 Cols: 8 Component Selectors */}
                        <div className="lg:col-span-2 space-y-3">
                          {/* 1. CPU */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                                <Cpu className="w-3.5 h-3.5" />
                                1. Processor (CPU)
                              </span>
                              <span>Socket: {cpu?.socket || 'N/A'} • {cpu?.tdpWatts || 105}W TDP</span>
                            </div>
                            <select
                              value={compatSelections.cpuId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, cpuId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Processors (CPUs)')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 2. Motherboard */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                                <Layers className="w-3.5 h-3.5" />
                                2. Motherboard
                              </span>
                              <span>
                                Socket: {mb?.socket || 'N/A'} • {mb?.memoryType || 'DDR5'} • {mb?.formFactor || 'ATX'}
                              </span>
                            </div>
                            <select
                              value={compatSelections.mbId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, mbId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Motherboards')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 3. GPU */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <Zap className="w-3.5 h-3.5" />
                                3. Graphics Card (GPU)
                              </span>
                              <span>TDP: {gpu?.tdpWatts || 220}W</span>
                            </div>
                            <select
                              value={compatSelections.gpuId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, gpuId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Graphics Cards (GPUs)')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 4. RAM */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                                <Boxes className="w-3.5 h-3.5" />
                                4. Memory (RAM)
                              </span>
                              <span>Type: {ram?.memoryType || 'DDR5'}</span>
                            </div>
                            <select
                              value={compatSelections.ramId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, ramId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Memory (RAM)')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 5. Storage */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                                <HardDrive className="w-3.5 h-3.5" />
                                5. Primary Storage (NVMe / SSD)
                              </span>
                              <span>Form: {ssd?.formFactor || 'M.2 2280'}</span>
                            </div>
                            <select
                              value={compatSelections.ssdId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, ssdId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Storage (SSD / HDD)')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 6. Power Supply */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <Zap className="w-3.5 h-3.5" />
                                6. Power Supply (PSU)
                              </span>
                              <span>Rating: {psu?.tdpWatts || 850}W • {psu?.formFactor || 'ATX'}</span>
                            </div>
                            <select
                              value={compatSelections.psuId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, psuId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Power Supplies (PSUs)')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 7. Cooler */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                                <Thermometer className="w-3.5 h-3.5" />
                                7. CPU Cooler
                              </span>
                              <span>Socket Support: {cooler?.socket || 'Universal'}</span>
                            </div>
                            <select
                              value={compatSelections.coolerId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, coolerId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Cooling & Fans')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* 8. Chassis */}
                          <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                            <div className="flex items-center justify-between text-gray-400">
                              <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                8. Chassis & Case
                              </span>
                              <span>Form: {pcCase?.formFactor || 'Mid Tower'}</span>
                            </div>
                            <select
                              value={compatSelections.caseId}
                              onChange={(e) => setCompatSelections((prev) => ({ ...prev, caseId: e.target.value }))}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                            >
                              {inventory
                                .filter((i) => i.category === 'Cases & Chassis')
                                .map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.name} [Stock: {i.stock}] - ${i.unitCost.toFixed(2)}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {/* Right Col: Real-time Analysis Card */}
                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="border-b border-gray-800 pb-3">
                              <h4 className="font-mono font-bold text-white text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                Build Verification Status
                              </h4>
                            </div>

                            {/* Socket Match Card */}
                            <div className={`p-3 rounded-lg border ${
                              socketMatch
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-950/30 border-red-500/60 text-red-300'
                            }`}>
                              <div className="font-bold flex items-center gap-2">
                                {socketMatch ? '✅ Socket Compatibility Verified' : '❌ Incompatible CPU & Board Socket!'}
                              </div>
                              <div className="text-[11px] text-gray-300 mt-1">
                                CPU Socket: <strong className="text-white">{cpu?.socket || 'N/A'}</strong> • Board: <strong className="text-white">{mb?.socket || 'N/A'}</strong>
                                {!socketMatch && (
                                  <p className="text-red-400 mt-1">
                                    Physical mismatch. This CPU cannot be inserted into this socket.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* RAM Match Card */}
                            <div className={`p-3 rounded-lg border ${
                              ramMatch
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-950/30 border-red-500/60 text-red-300'
                            }`}>
                              <div className="font-bold flex items-center gap-2">
                                {ramMatch ? '✅ RAM Generation Match' : '❌ RAM Generation Incompatible'}
                              </div>
                              <div className="text-[11px] text-gray-300 mt-1">
                                Board requires: <strong className="text-white">{mb?.memoryType || 'DDR5'}</strong> • RAM: <strong className="text-white">{ram?.memoryType || 'DDR5'}</strong>
                              </div>
                            </div>

                            {/* Wattage Breakdown */}
                            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
                              <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                                Power Consumption & PSU Sizing
                              </div>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span>CPU TDP:</span>
                                  <span className="text-white">{cpuWatts} W</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GPU Peak Load:</span>
                                  <span className="text-white">{gpuWatts} W</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Base System & Fans:</span>
                                  <span className="text-white">{baseSystemWatts} W</span>
                                </div>
                                <div className="border-t border-gray-800 pt-1 flex justify-between font-bold">
                                  <span>Estimated Max Draw:</span>
                                  <span className="text-amber-400">{totalWatts} W</span>
                                </div>
                                <div className="flex justify-between text-cyan-400 font-bold">
                                  <span>Recommended PSU (35% Margin):</span>
                                  <span>{recommendedPsuRating} W</span>
                                </div>
                                <div className="flex justify-between text-purple-400">
                                  <span>Selected PSU Capacity:</span>
                                  <span>{selectedPsuWatts} W</span>
                                </div>
                              </div>

                              <div className={`mt-2 p-2 rounded text-[10px] font-bold ${
                                psuAdequate
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-red-950/40 text-red-400 border border-red-800/40'
                              }`}>
                                {psuAdequate
                                  ? `✅ PSU Capacity Adequate (Headroom: +${selectedPsuWatts - totalWatts}W)`
                                  : `⚠️ PSU Underpowered for high transient current spikes! Upgrade to >= ${recommendedPsuRating}W.`}
                              </div>
                            </div>

                            {/* Total Cost Calculation */}
                            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Build Cost</div>
                                <div className="text-lg font-bold text-cyan-300">
                                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                allInStock
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {allInStock ? 'All 8 Parts In Stock' : 'Partial Stock'}
                              </span>
                            </div>
                          </div>

                          {/* 1-Click Deduct Button */}
                          <div className="space-y-2 pt-2 border-t border-gray-800">
                            <button
                              disabled={!socketMatch || !ramMatch}
                              onClick={() => {
                                const selectedIds = [
                                  compatSelections.cpuId,
                                  compatSelections.mbId,
                                  compatSelections.gpuId,
                                  compatSelections.ramId,
                                  compatSelections.ssdId,
                                  compatSelections.psuId,
                                  compatSelections.coolerId,
                                  compatSelections.caseId,
                                ];
                                setInventory((prev) =>
                                  prev.map((i) => {
                                    if (selectedIds.includes(i.id)) {
                                      return { ...i, stock: Math.max(0, i.stock - 1) };
                                    }
                                    return i;
                                  })
                                );
                                addToast({
                                  type: 'success',
                                  title: 'Build Allocated to Bench Station',
                                  message: `8 PC parts deducted from inventory ($${totalCost.toFixed(2)} total value issued).`,
                                });
                              }}
                              className={`w-full py-2.5 rounded-lg font-mono font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                                !socketMatch || !ramMatch
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Deduct & Issue Build to Bench</span>
                            </button>
                            <p className="text-[10px] text-gray-500 text-center">
                              Decrements 1 unit of each component from active inventory ledger.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Bottom Smart Forecaster Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800/80">
                <div className="text-xs text-gray-400 font-mono">
                  Inventory changes are automatically synchronized to local trade-school bench storage.
                </div>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('Parts Inventory & Consumption Ledger', {
                      items: inventory,
                      lowStockCount: inventory.filter((i) => i.stock <= i.minThreshold).length,
                      reorderRequest: 'Auto-generate purchase order cart for items below safety stock.',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Smart Reorder Forecaster</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.9: Bottleneck Calculator & Hardware Synergy Evaluator */}
          {/* ======================================================== */}
          {activeTool === 'bottleneck_calc' && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <BottleneckCalculator
                inventory={inventory}
                onSaveAsCombo={(combo) => {
                  const newCombo: SavedHardwareCombo = {
                    id: `combo_${Date.now()}`,
                    name: `${combo.cpu?.name?.split(' ')[2] || 'Custom'} + ${combo.gpu?.name?.split(' ')[3] || 'GPU'} Balanced Rig`,
                    category: 'Gaming Build',
                    targetResolution: combo.resolution as any,
                    targetWorkload: combo.workload,
                    parts: [
                      ...(combo.cpu ? [{ partId: combo.cpu.id, sku: combo.cpu.sku, name: combo.cpu.name, category: combo.cpu.category, unitCost: combo.cpu.unitCost, quantity: 1, tdpWatts: combo.cpu.tdpWatts, socket: combo.cpu.socket }] : []),
                      ...(combo.gpu ? [{ partId: combo.gpu.id, sku: combo.gpu.sku, name: combo.gpu.name, category: combo.gpu.category, unitCost: combo.gpu.unitCost, quantity: 1, tdpWatts: combo.gpu.tdpWatts }] : []),
                      ...(combo.ram ? [{ partId: combo.ram.id, sku: combo.ram.sku, name: combo.ram.name, category: combo.ram.category, unitCost: combo.ram.unitCost, quantity: 1 }] : []),
                    ],
                    totalCost: (combo.cpu?.unitCost || 0) + (combo.gpu?.unitCost || 0) + (combo.ram?.unitCost || 0),
                    totalTdp: (combo.cpu?.tdpWatts || 105) + (combo.gpu?.tdpWatts || 220) + 75,
                    recommendedPsu: Math.ceil((((combo.cpu?.tdpWatts || 105) + (combo.gpu?.tdpWatts || 220) + 75) * 1.35) / 50) * 50,
                    bottleneckRating: {
                      cpuScore: 90,
                      gpuScore: 90,
                      bottleneckPercent: combo.bottleneckPercent,
                      mainBottleneck: combo.mainBottleneck,
                      severity: combo.bottleneckPercent > 30 ? 'Severe' : combo.bottleneckPercent > 18 ? 'Noticeable' : combo.bottleneckPercent > 8 ? 'Mild' : 'Minimal',
                    },
                    dateCreated: new Date().toISOString(),
                    dateUpdated: new Date().toISOString(),
                    technicianName: currentUser?.displayName || 'Lead Technician',
                  };
                  setSavedCombos((prev) => [newCombo, ...prev]);
                  setActiveTool('hardware_combos');
                  addToast({
                    type: 'success',
                    title: 'Combo Transferred to Build Planner',
                    message: `Transferred "${newCombo.name}" with evaluated synergy rating.`,
                  });
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.10: Build Planner & Saved Hardware Combos with PDF Report */}
          {/* ======================================================== */}
          {activeTool === 'hardware_combos' && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <HardwareCombosPlanner
                inventory={inventory}
                savedCombos={savedCombos}
                onSaveCombo={(combo) => {
                  setSavedCombos((prev) => {
                    const exists = prev.some((c) => c.id === combo.id);
                    if (exists) {
                      return prev.map((c) => (c.id === combo.id ? combo : c));
                    }
                    return [combo, ...prev];
                  });
                }}
                onDeleteCombo={(comboId) => {
                  setSavedCombos((prev) => prev.filter((c) => c.id !== comboId));
                  addToast({
                    type: 'info',
                    title: 'Combo Deleted',
                    message: 'Removed saved hardware combination from library.',
                  });
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.11: Comprehensive Laptop Fleet & Diagnostic Registry */}
          {/* ======================================================== */}
          {activeTool === 'laptop_fleet' && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg">
              <LaptopFleetManager
                laptops={laptopFleet}
                onAssignToBench={(laptop, benchNumber) => {
                  setLaptopFleet((prev) =>
                    prev.map((l) => (l.id === laptop.id ? { ...l, status: 'Under Triage / Bench', assignedBench: benchNumber } : l))
                  );
                  // Also update bench station
                  setBenchStations((prev) =>
                    prev.map((b) =>
                      b.number === benchNumber
                        ? { ...b, status: 'Active Triage', activeDevice: `${laptop.model} (${laptop.assetTag})`, notes: `Triage: ${laptop.commonFaults}` }
                        : b
                    )
                  );
                }}
                onUpdateLaptopStatus={(laptopId, status) => {
                  setLaptopFleet((prev) =>
                    prev.map((l) => (l.id === laptopId ? { ...l, status } : l))
                  );
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 4.12: Hardware Asset Inventory & Problem Marker */}
          {/* ======================================================== */}
          {activeTool === 'asset_inventory' && (
            <AssetInventoryManager />
          )}
        </div>

        {/* Universal AI Operations Drawer */}
        {isAiDrawerOpen && (
          <div className="xl:col-span-1 bg-[#111827] border border-[#06b6d4]/40 rounded-xl p-4 shadow-xl space-y-4 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                <span className="font-mono font-bold text-white text-xs">
                  Gemini Operations & Shop Floor AI
                </span>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Question Box */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                Shop Floor / Administrative Query
              </label>
              <textarea
                rows={2}
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ask shop management question (e.g. How to allocate Bench 6 hazard?)..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-200 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            {/* AI Output Container */}
            <div className="flex-1 bg-gray-950 rounded-xl p-3.5 border border-gray-800/80 overflow-y-auto space-y-3 font-mono text-xs">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#06b6d4] animate-spin" />
                  <span className="text-gray-400">
                    Querying Gemini Shop Floor Operations Engine...
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
                    Select any of the 8 shop management tools and click the AI button to compile reports and balance workloads.
                  </p>
                </div>
              )}
            </div>

            {/* Shortcut Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Shortcut Directives:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setAiCustomPrompt('Forecast shop floor bottleneck based on bench occupancy.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Bottleneck?
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Translate these raw technician notes into professional customer receipt language.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Customer Voice
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Compile an administrative summary for the vocational department director.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Executive Report
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
              Enter your Google AI Studio Gemini API Key below. When saved, Module 4 executes direct client-side requests to{' '}
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
                    message: 'Module 4 will use the server-side proxy fallback.',
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

      {/* Add Custom PC Part Modal */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Custom PC Part / Tool to Inventory
              </h3>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPartData.name.trim() || !newPartData.sku.trim()) {
                  addToast({
                    type: 'error',
                    title: 'Validation Failed',
                    message: 'Part Name and SKU are required.',
                  });
                  return;
                }
                const newPart: InventoryItem = {
                  id: `part_${Date.now()}`,
                  sku: newPartData.sku.toUpperCase().trim(),
                  name: newPartData.name.trim(),
                  category: newPartData.category,
                  stock: Number(newPartData.stock) || 0,
                  minThreshold: Number(newPartData.minThreshold) || 1,
                  unitCost: Number(newPartData.unitCost) || 0,
                  supplier: newPartData.supplier as any,
                  location: newPartData.location.trim() || 'General Bench Storage',
                  socket: newPartData.socket.trim() || undefined,
                  formFactor: newPartData.formFactor.trim() || undefined,
                  memoryType: newPartData.memoryType.trim() || undefined,
                  tdpWatts: Number(newPartData.tdpWatts) || undefined,
                  storageCapacity: newPartData.storageCapacity.trim() || undefined,
                };
                setInventory((prev) => [newPart, ...prev]);
                setIsAddPartModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Part Added to Inventory',
                  message: `${newPart.name} (${newPart.sku}) stored in ${newPart.location}.`,
                });
              }}
              className="space-y-4 font-mono text-xs"
            >
              <div>
                <label className="block text-gray-400 mb-1">Part Name & Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMD Ryzen 7 9800X3D or Crucial T705 4TB"
                  value={newPartData.name}
                  onChange={(e) => setNewPartData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Part SKU / Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CPU-AMD-9800X3D"
                    value={newPartData.sku}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Category</label>
                  <select
                    value={newPartData.category}
                    onChange={(e: any) => setNewPartData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {INVENTORY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartData.stock}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Min Safety Margin</label>
                  <input
                    type="number"
                    min="1"
                    value={newPartData.minThreshold}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, minThreshold: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPartData.unitCost}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Preferred Supplier</label>
                  <select
                    value={newPartData.supplier}
                    onChange={(e: any) => setNewPartData((prev) => ({ ...prev, supplier: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Micro Center">Micro Center</option>
                    <option value="Newegg">Newegg</option>
                    <option value="Amazon Business">Amazon Business</option>
                    <option value="DigiKey">DigiKey</option>
                    <option value="Mouser">Mouser</option>
                    <option value="B&H Photo">B&H Photo</option>
                    <option value="Direct OEM">Direct OEM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Bin / Locker Location</label>
                  <input
                    type="text"
                    placeholder="e.g. CPU Safe - Tray 8"
                    value={newPartData.location}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-gray-800">
                <div>
                  <label className="block text-gray-500 text-[10px] mb-1">Socket</label>
                  <input
                    type="text"
                    placeholder="AM5 / LGA1700"
                    value={newPartData.socket}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, socket: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-1">Form Factor</label>
                  <input
                    type="text"
                    placeholder="ATX / M.2"
                    value={newPartData.formFactor}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, formFactor: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-1">Memory Type</label>
                  <input
                    type="text"
                    placeholder="DDR5 / DDR4"
                    value={newPartData.memoryType}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, memoryType: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-1">TDP (Watts)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newPartData.tdpWatts}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, tdpWatts: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] mb-1">Capacity / Size</label>
                  <input
                    type="text"
                    placeholder="2TB / 64GB"
                    value={newPartData.storageCapacity}
                    onChange={(e) => setNewPartData((prev) => ({ ...prev, storageCapacity: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Camera Barcode & QR Scanner Modal */}
      <InventoryBarcodeScannerModal
        isOpen={isBarcodeScannerModalOpen}
        onClose={() => setIsBarcodeScannerModalOpen(false)}
        inventory={inventory}
        kanbanTickets={kanbanTickets}
        onUpdateStock={(itemId, newStock, workOrderId) => {
          setInventory((prev) =>
            prev.map((i) => {
              if (i.id === itemId) {
                return { ...i, stock: newStock };
              }
              return i;
            })
          );
          const target = inventory.find((i) => i.id === itemId);
          if (target) {
            addToast({
              type: 'success',
              title: 'Barcode Scanner Transaction',
              message: `${target.name} (${target.sku}) stock updated to ${newStock} units${
                workOrderId ? ` (Linked to Work Order #${workOrderId})` : ''
              }.`,
            });
          }
        }}
        onTriggerLowStockAlert={(item) => {
          addToast({
            type: 'warning',
            title: 'Low Safety Stock Alert',
            message: `${item.name} (${item.sku}) is below safety threshold (${item.stock} left / min ${item.minThreshold}).`,
          });
        }}
      />

      {/* D3.js Hardware Telemetry & Consumption Dashboard Overlay Modal */}
      {isAnalyticsDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-4xl w-full max-h-[92vh] overflow-y-auto">
            <InventoryAnalyticsDashboard
              inventory={inventory}
              onClose={() => setIsAnalyticsDashboardOpen(false)}
              onQuickReorder={(item) => {
                const reorderQty = 5;
                setInventory((prev) =>
                  prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + reorderQty } : i))
                );
                addToast({
                  type: 'success',
                  title: '1-Click PO Generated',
                  message: `Reordered +${reorderQty} units of ${item.sku} ($${(item.unitCost * reorderQty).toFixed(2)}) from ${item.supplier}.`,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
