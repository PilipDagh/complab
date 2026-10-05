import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AppTab } from '../context/AppContext';
import { INITIAL_PARTS_INVENTORY } from '../data/shopManagementDatabase';
import {
  Search,
  X,
  Zap,
  Network,
  GraduationCap,
  LayoutGrid,
  HardDrive,
  Activity,
  Cpu,
  BookOpen,
  Bot,
  Calendar,
  ArrowRight,
  Command,
  Terminal,
  Package,
  Tag,
  Users,
} from 'lucide-react';

interface ToolSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tab: AppTab;
  keywords: string[];
  icon: React.ReactNode;
}

const SEARCHABLE_TOOLS: ToolSearchItem[] = [
  // Module 1: Board Triage
  {
    id: 'smd_decoder',
    title: 'SMD Resistor & Capacitor Decoder',
    subtitle: 'Decode 3/4-digit, EIA-96 resistor and capacitor markings',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['smd', 'resistor', 'capacitor', 'code', 'decoder', 'eia-96', 'tolerance', 'microhenry'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'smart_parser',
    title: 'S.M.A.R.T. Drive Health & Hex Parser',
    subtitle: 'Parse crystaldiskinfo and smartctl logs for SSD/HDD health',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['smart', 'hdd', 'ssd', 'health', 'reallocated', 'pending', 'sectors', 'crystaldiskinfo'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'post_codes',
    title: 'POST Diagnostic Card Hex Matrix',
    subtitle: '2-digit/4-digit PCI/LPC diagnostic codes across AMI, Award, Phoenix',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['post', 'hex', 'debug', 'code', 'bios', 'ami', 'award', 'hang', 'led'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'thermal_vision',
    title: 'Thermal & Inspection Photo Uploader',
    subtitle: 'Annotate hot spots and inspect corroded motherboard traces with Vision AI',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['thermal', 'flir', 'inspection', 'photo', 'camera', 'corrosion', 'vision', 'hotspot'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'short_isolator',
    title: 'Multimeter Short-to-Ground Isolator',
    subtitle: 'Safe voltage injection calculations and resistance-to-ground triage',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['short', 'ground', 'multimeter', 'ohms', 'injection', 'rail', 'vcore', '19v'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'ram_visualizer',
    title: 'RAM Socket & Dual-Channel Visualizer',
    subtitle: 'Slot pairing guidance (A2/B2) and memory controller stability analysis',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['ram', 'dimm', 'ddr4', 'ddr5', 'dual-channel', 'slots', 'xmp', 'expo'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'thermal_pads',
    title: 'Thermal Pad & VRAM Thickness Database',
    subtitle: 'GPU and laptop pad clearances (0.5mm, 1.0mm, 1.5mm, 2.0mm)',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['thermal pad', 'thickness', 'vram', 'putty', 'rtx 3080', 'rtx 4090', 'heatsink'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'battery_parser',
    title: 'Battery Health & Degradation Parser',
    subtitle: 'Parse Windows powercfg and macOS ioreg battery cycle logs',
    category: 'Module 1: Board Triage',
    tab: 'board_triage',
    keywords: ['battery', 'powercfg', 'cycles', 'capacity', 'degradation', 'swell', 'safety'],
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },

  // Module 2: Networking & SysAdmin
  {
    id: 'subnet_calc',
    title: 'VLSM Subnet Calculator & Supernetter',
    subtitle: 'CIDR prefix calculation, broadcast addresses, and usable host ranges',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['subnet', 'cidr', 'vlsm', 'ip', 'mask', 'broadcast', 'hosts', 'slash notation'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'cisco_cli',
    title: 'Switch CLI Script Generator',
    subtitle: 'Automated configuration templates for Cisco, Aruba, MikroTik, Ubiquiti',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['cisco', 'switch', 'vlan', 'cli', 'trunk', 'spanning tree', 'aruba', 'mikrotik'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'mac_oui',
    title: 'Enterprise MAC OUI Hardware Lookup',
    subtitle: 'Search 50+ enterprise hardware and NIC manufacturer prefixes',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['mac', 'oui', 'vendor', 'intel', 'cisco', 'dell', 'realtek', 'ethernet'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'script_builder',
    title: 'Sysprep & Automated Repair Script Builder',
    subtitle: 'Batch, PowerShell, and Bash system recovery commands',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['sysprep', 'script', 'powershell', 'sfc', 'dism', 'repair', 'windows update'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'wifi_spectrum',
    title: 'Wi-Fi Channel Spectrum & Analyzer',
    subtitle: '2.4 GHz, 5 GHz, and 6 GHz spectrum channels and overlap visualizer',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['wifi', 'wi-fi', 'channel', 'spectrum', '2.4ghz', '5ghz', '6ghz', 'overlap'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'terminal_sandbox',
    title: 'Interactive Bench Terminal Sandbox',
    subtitle: 'Simulated CLI environment with command history and AI mentor',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['terminal', 'cli', 'cmd', 'bash', 'ping', 'traceroute', 'ipconfig'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'cable_tester',
    title: 'Cable Fault & RJ45 Pinout Tester',
    subtitle: 'T568A vs T568B wiring and Time Domain Reflectometry (TDR) distance calculator',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['cable', 'rj45', 'pinout', 't568a', 't568b', 'tdr', 'fault', 'cat6'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'routing_triage',
    title: 'Routing Triage & DNS Traceroute Map',
    subtitle: 'Visual hop traceroute, latency, packet loss, and DNS resolution triage',
    category: 'Module 2: Network & SysAdmin',
    tab: 'networking',
    keywords: ['routing', 'hops', 'traceroute', 'dns', 'latency', 'packet loss', 'ping'],
    icon: <Network className="w-4 h-4 text-sky-400" />,
  },

  // Module 3: CompTIA Vocational
  {
    id: 'pbq_simulator',
    title: 'CompTIA PBQ Performance Simulator',
    subtitle: 'Hands-on front panel wiring, router hardening, and RAID rebuilds',
    category: 'Module 3: CompTIA Vocational',
    tab: 'vocational',
    keywords: ['pbq', 'comptia', 'exam', 'simulation', 'front panel', 'router', 'raid'],
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'raid_calculator',
    title: 'RAID Geometry & Rebuild Calculator',
    subtitle: 'Calculate usable capacity, fault tolerance, and URE rebuild failure risks',
    category: 'Module 3: CompTIA Vocational',
    tab: 'vocational',
    keywords: ['raid', 'storage', 'raid 0', 'raid 1', 'raid 5', 'raid 10', 'parity', 'rebuild'],
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'osi_sandbox',
    title: 'OSI 7-Layer Protocol Encapsulation',
    subtitle: 'Interactive packet encapsulation sandbox across all 7 layers',
    category: 'Module 3: CompTIA Vocational',
    tab: 'vocational',
    keywords: ['osi', 'layers', 'encapsulation', 'packet', 'frame', 'segment', 'headers'],
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'acronym_decoder',
    title: 'CompTIA Acronym Flashcard Decoder',
    subtitle: 'Master 40+ essential acronyms (APIPA, CIDR, DKIM, NVMe, TPM, etc.)',
    category: 'Module 3: CompTIA Vocational',
    tab: 'vocational',
    keywords: ['acronym', 'flashcards', 'definitions', 'comptia', 'study', 'exam'],
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  },

  // Module 4: Lab Management
  {
    id: 'bench_grid',
    title: '16-Bench Live Lab Station Grid',
    subtitle: 'Monitor active student repairs, bench power states, and ESD safety',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['bench', 'lab', 'stations', 'students', 'esd', 'live grid', 'management'],
    icon: <LayoutGrid className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'bottleneck_calc',
    title: 'Hardware Bottleneck & Synergy Calculator',
    subtitle: 'Interactive gauge chart for CPU/GPU bottleneck %, resolution scaling, and FPS estimation',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['bottleneck', 'calculator', 'gauge', 'cpu', 'gpu', 'fps', 'synergy', 'resolution', '1440p', '4k'],
    icon: <LayoutGrid className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'hardware_combos',
    title: 'Build Planner & Saved Hardware Combos',
    subtitle: 'Design, save, balance, and export hardware part combinations as PDF specification reports',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['build planner', 'combos', 'combinations', 'saved builds', 'pdf export', 'bom', 'pc parts'],
    icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'laptop_fleet',
    title: 'Comprehensive Laptop Fleet & Diagnostic Registry',
    subtitle: 'Manage and triage 500+ commercial, workstation, and gaming laptops with battery health simulator',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['laptop', 'fleet', 'laptops', 'battery health', 'thinkpad', 'macbook', 'xps', 'triage', 'teardown'],
    icon: <LayoutGrid className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 'kanban_dispatch',
    title: 'Student Work Order Kanban Board',
    subtitle: 'Drag-and-drop repair job tickets across triage, in-progress, and QA',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['kanban', 'work order', 'tickets', 'dispatch', 'repair job', 'students'],
    icon: <LayoutGrid className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'receipt_generator',
    title: 'Customer Receipt & Invoice Generator',
    subtitle: 'Translate technical bench repairs into clear customer work order invoices',
    category: 'Module 4: Lab Management',
    tab: 'lab_management',
    keywords: ['receipt', 'invoice', 'customer', 'cost', 'translation', 'print'],
    icon: <LayoutGrid className="w-4 h-4 text-amber-400" />,
  },

  // Module 5: Forensics & Storage
  {
    id: 'file_carving',
    title: 'File Carving & Magic Signature Forensics',
    subtitle: 'Extract intact files from raw disk dumps using 50+ magic byte headers',
    category: 'Module 5: Forensic Lab',
    tab: 'forensics',
    keywords: ['file carving', 'magic bytes', 'hex', 'forensics', 'recovery', 'foremost', 'dd'],
    icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'spi_bios',
    title: 'SPI Flash & BIOS/UEFI ROM Hex Analyzer',
    subtitle: 'Clean Intel ME regions, remove supervisor passwords, verify 1.8V vs 3.3V',
    category: 'Module 5: Forensic Lab',
    tab: 'forensics',
    keywords: ['spi', 'bios', 'uefi', 'flashrom', 'ch341a', 'clean me', 'password', 'eeprom'],
    icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'hdd_geometry',
    title: 'HDD Head Crash & Platter Geometry',
    subtitle: 'Selective head imaging, cleanroom donor matching, acoustic failure synthesizer',
    category: 'Module 5: Forensic Lab',
    tab: 'forensics',
    keywords: ['hdd', 'heads', 'platters', 'click of death', 'cleanroom', 'ddrescue', 'seagate'],
    icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'ddrescue_builder',
    title: 'GNU ddrescue Command Builder',
    subtitle: 'Multi-pass imaging command generator with persistent mapfiles',
    category: 'Module 5: Forensic Lab',
    tab: 'forensics',
    keywords: ['ddrescue', 'imaging', 'bad sectors', 'mapfile', 'bitstream', 'recovery'],
    icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'nist_sanitizer',
    title: 'NIST SP 800-88 Sanitization Generator',
    subtitle: 'Issue cryptographic certificates of media sanitization and erasure',
    category: 'Module 5: Forensic Lab',
    tab: 'forensics',
    keywords: ['nist', 'sanitization', 'clear', 'purge', 'destroy', 'certificate', 'erase', 'sha256'],
    icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
  },

  // Module 6: Signal Integrity & Scopes
  {
    id: 'oscilloscope',
    title: 'Digital Storage Oscilloscope (DSO) Visualizer',
    subtitle: 'Real-time oscilloscope trace simulation for RTC crystals and VRM ripple',
    category: 'Module 6: Signals & Scopes',
    tab: 'signals',
    keywords: ['oscilloscope', 'dso', 'waveform', 'vrm ripple', 'clock', 'frequency', 'attenuation'],
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'logic_analyzer',
    title: 'Logic Analyzer & Protocol Decoder Matrix',
    subtitle: 'Decode I2C, SPI, UART, and SMBus packets with NACK error detection',
    category: 'Module 6: Signals & Scopes',
    tab: 'signals',
    keywords: ['logic analyzer', 'protocol', 'i2c', 'spi', 'uart', 'smbus', 'ack', 'nack'],
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'usb_pd',
    title: 'USB-PD & CC Line Protocol Analyzer',
    subtitle: 'CC line 5.1kΩ pull-down triage, E-Marker detection, and EPR 240W PDO rules',
    category: 'Module 6: Signals & Scopes',
    tab: 'signals',
    keywords: ['usb-pd', 'type-c', 'cc line', 'charging', '20v', '5v stuck', 'e-marker', 'epr'],
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'power_sequence',
    title: 'Power Sequence & S0-S5 State Machine',
    subtitle: 'Step-by-step motherboard signal chain from RTCVDD to PLTRST#',
    category: 'Module 6: Signals & Scopes',
    tab: 'signals',
    keywords: ['power sequence', 's0', 's3', 's5', 'rsmrst', 'pltrst', 'slp_s3', 'intel'],
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'bga_stencil',
    title: 'BGA Reballing & Thermal Profiler',
    subtitle: 'NVIDIA GPU and PCH stencil ball pitch specs and reflow temperature curves',
    category: 'Module 6: Signals & Scopes',
    tab: 'signals',
    keywords: ['bga', 'reballing', 'stencil', 'pitch', 'reflow', 'solder alloy', 'sn63', 'sac305'],
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },

  // Global Tools
  {
    id: 'assets_tracker',
    title: 'Hardware Assets & Inventory Problem Marker',
    subtitle: 'Track physical assets on hand, mark/flag problems, delete decommissioned units & add new hardware',
    category: 'Global Assets',
    tab: 'assets',
    keywords: ['assets', 'inventory', 'hardware', 'mark problem', 'tag', 'on hand', 'adder', 'qr code', 'delete asset', 'specs'],
    icon: <Tag className="w-4 h-4 text-teal-400" />,
  },
  {
    id: 'quick_specs',
    title: 'Quick Specs & CPU/RAM Compatibility Standards',
    subtitle: 'Lookup AMD AM5/AM4, Intel LGA1700/1851, DDR5/DDR4 voltages, notch maps & A2/B2 slot rules',
    category: 'Global Reference',
    tab: 'reference',
    keywords: ['quick specs', 'cpu socket', 'am5', 'am4', 'lga1700', 'lga1851', 'ddr5', 'ddr4', 'ram', 'notch', 'compatibility', 'expo', 'xmp'],
    icon: <Cpu className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'diag_wizard',
    title: 'Interactive Diagnostic Engine (Wizard)',
    subtitle: 'Step-by-step diagnostic decision flowcharts for hardware failures',
    category: 'Global Diagnostic',
    tab: 'diagnostic',
    keywords: ['wizard', 'flowchart', 'troubleshooting', 'no post', 'overheating', 'bsod'],
    icon: <Cpu className="w-4 h-4 text-blue-400" />,
  },
  {
    id: 'bench_reference',
    title: 'Bench Reference Library & Pinouts',
    subtitle: 'ATX 24-pin, PCIe 8-pin, beep codes, Ohm law calculators, DDR pinouts',
    category: 'Global Reference',
    tab: 'reference',
    keywords: ['reference', 'pinouts', 'atx', 'beep codes', 'specifications', 'calculator'],
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'gemini_assistant',
    title: 'Gemini AI Assistant & Multimodal Vision',
    subtitle: 'Full bench diagnostic copilot with webcam inspection and voice queries',
    category: 'Global AI',
    tab: 'gemini',
    keywords: ['gemini', 'ai', 'chatbot', 'assistant', 'camera', 'vision', 'copilot'],
    icon: <Bot className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'lab_calendar',
    title: 'Lab Calendar & Repair Work Orders',
    subtitle: 'Schedule bench sessions, manage repair tickets, and export service logs',
    category: 'Instructor & Admin',
    tab: 'calendar',
    keywords: ['calendar', 'projects', 'work orders', 'schedule', 'appointments', 'owner'],
    icon: <Calendar className="w-4 h-4 text-amber-400" />,
  },
];

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = useMemo(() => {
    // Generate combined catalog of tools and PC parts
    const partSearchItems: ToolSearchItem[] = INITIAL_PARTS_INVENTORY.map((part) => ({
      id: `part_${part.id}`,
      title: part.name,
      subtitle: `SKU: ${part.sku} • In Stock: ${part.stock} • $${part.unitCost.toFixed(2)} (${part.location})`,
      category: `PC Part: ${part.category.replace(/\s*\(.*?\)\s*/g, '')}`,
      tab: 'lab_management' as AppTab,
      keywords: [
        part.sku,
        part.name,
        part.category,
        part.supplier,
        part.socket || '',
        part.formFactor || '',
        part.memoryType || '',
        'hardware',
        'part',
        'inventory',
        'stock',
      ],
      icon: <Package className="w-4 h-4 text-cyan-400" />,
    }));

    const allItems = [...SEARCHABLE_TOOLS, ...partSearchItems];

    if (!searchQuery.trim()) return allItems.slice(0, 12);
    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }).slice(0, 25);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (item: ToolSearchItem) => {
    setActiveTab(item.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="w-full max-w-2xl bg-[#111827] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800 bg-[#161b22]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bench tools, diagnostics, pinouts, acronyms, or commands... (e.g. 'SMD', 'ddrescue', 'oscilloscope')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
              }
              if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
              }
            }}
          />
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/50 p-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border border-cyan-500/40 text-white'
                      : 'hover:bg-gray-800/40 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.title}</span>
                        <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-gray-600'} transition-transform`} />
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-gray-500 font-mono">
              No matching tools or bench modules found for "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#0d1117] border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-gray-400">TradeTech Bench Navigator</span>
        </div>
      </div>
    </div>
  );
};
