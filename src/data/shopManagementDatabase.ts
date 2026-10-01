/**
 * Enterprise Shop Floor, Lab Management & Bench Operations Database
 * Powers 16 Bench Stations, Tool Loans, Massive PC Hardware Parts Catalog, and Work Order Kanban
 * Contains comprehensive PC hardware catalog across CPUs, GPUs, Motherboards,
 * RAM, NVMe/SATA Storage, PSUs, Coolers, Chassis, Cabling, Chemicals, Diagnostics & Bench Test Tools.
 */

export interface BenchStation {
  id: string; // e.g. "bench_01"
  number: string; // "Bench 01"
  status: 'Open/Available' | 'Active Triage' | 'Awaiting Parts' | 'QA Testing' | 'Out of Service';
  assignedStudent: string;
  activeDevice: string;
  workOrderId: string;
  elapsedMinutes: number;
  esdGroundCertified: boolean;
  notes: string;
}

export const INITIAL_16_BENCH_STATIONS: BenchStation[] = [
  { id: 'b01', number: 'Bench 01', status: 'Active Triage', assignedStudent: 'Sarah Jenkins', activeDevice: 'Dell OptiPlex 7090 (No POST)', workOrderId: 'WO-2026-081', elapsedMinutes: 45, esdGroundCertified: true, notes: 'Probing 12V EPS rail with Fluke DMM.' },
  { id: 'b02', number: 'Bench 02', status: 'QA Testing', assignedStudent: 'Alex Chen', activeDevice: 'Lenovo ThinkPad T14 Gen 3', workOrderId: 'WO-2026-082', elapsedMinutes: 110, esdGroundCertified: true, notes: 'Running 2-hour FurMark + Prime95 thermal burn-in.' },
  { id: 'b03', number: 'Bench 03', status: 'Awaiting Parts', assignedStudent: 'Marcus Brody', activeDevice: 'Custom AM5 Gaming Rig', workOrderId: 'WO-2026-083', elapsedMinutes: 180, esdGroundCertified: true, notes: 'Waiting on replacement Seasonic 1000W PSU.' },
  { id: 'b04', number: 'Bench 04', status: 'Open/Available', assignedStudent: 'Unassigned', activeDevice: 'None', workOrderId: 'None', elapsedMinutes: 0, esdGroundCertified: true, notes: 'Sanitized and ESD wrist strap grounded. Ready for student intake.' },
  { id: 'b05', number: 'Bench 05', status: 'Active Triage', assignedStudent: 'David Kim', activeDevice: 'Apple MacBook Pro 16" (Liquid Ingress)', workOrderId: 'WO-2026-085', elapsedMinutes: 65, esdGroundCertified: true, notes: 'Inspecting corroded capacitor MLCC traces under microscope.' },
  { id: 'b06', number: 'Bench 06', status: 'Out of Service', assignedStudent: 'None', activeDevice: 'Hazard Hold', workOrderId: 'HAZ-001', elapsedMinutes: 0, esdGroundCertified: false, notes: 'Short circuit blown breaker on AC isolation transformer. Maintenance scheduled.' },
  { id: 'b07', number: 'Bench 07', status: 'Open/Available', assignedStudent: 'Unassigned', activeDevice: 'None', workOrderId: 'None', elapsedMinutes: 0, esdGroundCertified: true, notes: 'Calibrated oscilloscope and hot air station ready.' },
  { id: 'b08', number: 'Bench 08', status: 'Active Triage', assignedStudent: 'Elena Rostova', activeDevice: 'HP LaserJet Enterprise M608', workOrderId: 'WO-2026-088', elapsedMinutes: 30, esdGroundCertified: true, notes: 'Paper pickup roller assembly replacement.' },
  { id: 'b09', number: 'Bench 09', status: 'QA Testing', assignedStudent: 'Jordan Taylor', activeDevice: 'Cisco Catalyst 2960-X Switch', workOrderId: 'WO-2026-089', elapsedMinutes: 75, esdGroundCertified: true, notes: 'Testing 24-port PoE loopback and VLAN 10 tagging.' },
  { id: 'b10', number: 'Bench 10', status: 'Awaiting Parts', assignedStudent: 'Tyler Smith', activeDevice: 'Dell Latitude 5420 (Swollen Battery)', workOrderId: 'WO-2026-090', elapsedMinutes: 240, esdGroundCertified: true, notes: 'Battery isolated in fireproof LiPo safety bag.' },
  { id: 'b11', number: 'Bench 11', status: 'Open/Available', assignedStudent: 'Unassigned', activeDevice: 'None', workOrderId: 'None', elapsedMinutes: 0, esdGroundCertified: true, notes: 'Clean station.' },
  { id: 'b12', number: 'Bench 12', status: 'Active Triage', assignedStudent: 'Chloe Bennett', activeDevice: 'Synology DS920+ 4-Bay NAS', workOrderId: 'WO-2026-092', elapsedMinutes: 50, esdGroundCertified: true, notes: 'Degraded RAID-5 rebuild after disk 3 failure.' },
  { id: 'b13', number: 'Bench 13', status: 'Open/Available', assignedStudent: 'Unassigned', activeDevice: 'None', workOrderId: 'None', elapsedMinutes: 0, esdGroundCertified: true, notes: 'Clean station.' },
  { id: 'b14', number: 'Bench 14', status: 'Open/Available', assignedStudent: 'Unassigned', activeDevice: 'None', workOrderId: 'None', elapsedMinutes: 0, esdGroundCertified: true, notes: 'Clean station.' },
  { id: 'b15', number: 'Bench 15', status: 'Active Triage', assignedStudent: 'Lucas Wright', activeDevice: 'ASUS ROG Strix RTX 3080', workOrderId: 'WO-2026-095', elapsedMinutes: 90, esdGroundCertified: true, notes: 'Thermal pad replacement (1.5mm / 2.0mm Gelid pads).' },
  { id: 'b16', number: 'Bench 16', status: 'QA Testing', assignedStudent: 'Maya Patel', activeDevice: 'Proxmox Hypervisor Workstation', workOrderId: 'WO-2026-096', elapsedMinutes: 125, esdGroundCertified: true, notes: 'ZFS scrub test on 4x 2TB NVMe array.' },
];

export interface ToolLoanItem {
  id: string;
  name: string;
  assetTag: string;
  borrower: string;
  bench: string;
  checkoutTime: string;
  expectedReturn: string;
  condition: 'Good' | 'Needs Calibration' | 'Damaged';
  isOverdue: boolean;
}

export const INITIAL_TOOL_LOANS: ToolLoanItem[] = [
  { id: 'tl_01', name: 'Fluke 87V True-RMS Digital Multimeter', assetTag: 'TOOL-DMM-01', borrower: 'Sarah Jenkins', bench: 'Bench 01', checkoutTime: '08:15 AM', expectedReturn: '11:15 AM', condition: 'Good', isOverdue: false },
  { id: 'tl_02', name: 'FLIR E4 Wi-Fi Thermal Imaging Camera', assetTag: 'TOOL-THM-02', borrower: 'David Kim', bench: 'Bench 05', checkoutTime: '07:30 AM', expectedReturn: '09:00 AM', condition: 'Good', isOverdue: true },
  { id: 'tl_03', name: 'KingKong 4-Digit PCIe/LPC POST Card', assetTag: 'TOOL-POST-01', borrower: 'Tyler Smith', bench: 'Bench 10', checkoutTime: '08:45 AM', expectedReturn: '10:45 AM', condition: 'Good', isOverdue: false },
  { id: 'tl_04', name: 'CH341A 24/25 EEPROM SPI Flash Programmer', assetTag: 'TOOL-SPI-01', borrower: 'Julian Vance', bench: 'Master Bench', checkoutTime: '06:30 AM', expectedReturn: '12:00 PM', condition: 'Good', isOverdue: false },
  { id: 'tl_05', name: 'Klein Tools Scout Pro 3 Cable TDR Tester', assetTag: 'TOOL-TDR-03', borrower: 'Jordan Taylor', bench: 'Bench 09', checkoutTime: '08:00 AM', expectedReturn: '10:00 AM', condition: 'Needs Calibration', isOverdue: false },
  { id: 'tl_06', name: 'Quick 861DW 1000W Hot Air Rework Station', assetTag: 'TOOL-AIR-02', borrower: 'Lucas Wright', bench: 'Bench 15', checkoutTime: '07:45 AM', expectedReturn: '08:45 AM', condition: 'Good', isOverdue: true },
  { id: 'tl_07', name: 'Rigol DS1054Z 4-Channel 50MHz Oscilloscope', assetTag: 'TOOL-OSC-01', borrower: 'Alex Chen', bench: 'Bench 02', checkoutTime: '09:00 AM', expectedReturn: '12:00 PM', condition: 'Good', isOverdue: false },
  { id: 'tl_08', name: 'Hakko FM-203 Dual Soldering Station', assetTag: 'TOOL-HKO-01', borrower: 'Elena Rostova', bench: 'Bench 08', checkoutTime: '08:30 AM', expectedReturn: '10:30 AM', condition: 'Good', isOverdue: false },
  { id: 'tl_09', name: 'Siglent SDS1104X-E 100MHz 4-CH Digital Scope', assetTag: 'TOOL-OSC-02', borrower: 'Marcus Brody', bench: 'Bench 03', checkoutTime: '09:30 AM', expectedReturn: '01:30 PM', condition: 'Good', isOverdue: false },
  { id: 'tl_10', name: 'Power-Z KM003C USB-C Digital Power Analyzer', assetTag: 'TOOL-USB-01', borrower: 'David Kim', bench: 'Bench 05', checkoutTime: '08:00 AM', expectedReturn: '11:00 AM', condition: 'Good', isOverdue: false },
  { id: 'tl_11', name: 'AmScope SM-4TP 7X-45X Stereo Boom Microscope', assetTag: 'TOOL-MIC-01', borrower: 'Alex Chen', bench: 'Bench 02', checkoutTime: '07:15 AM', expectedReturn: '02:00 PM', condition: 'Good', isOverdue: false },
  { id: 'tl_12', name: 'Yihua 948 Desoldering Gun Vacuum Station', assetTag: 'TOOL-DES-01', borrower: 'Lucas Wright', bench: 'Bench 15', checkoutTime: '08:40 AM', expectedReturn: '10:40 AM', condition: 'Good', isOverdue: false },
];

export type InventoryCategory =
  | 'Processors (CPUs)'
  | 'Graphics Cards (GPUs)'
  | 'Motherboards'
  | 'Memory (RAM)'
  | 'Storage (SSD / HDD)'
  | 'Power Supplies (PSUs)'
  | 'Cooling & Fans'
  | 'Cases & Chassis'
  | 'Chemical / Thermal'
  | 'Fasteners & Connectors'
  | 'Batteries'
  | 'Cabling & Networking'
  | 'Diagnostics & Bench Tools';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  minThreshold: number;
  unitCost: number;
  supplier: 'Mouser' | 'DigiKey' | 'Amazon Business' | 'Newegg' | 'Micro Center' | 'B&H Photo' | 'Arrow' | 'Direct OEM';
  location: string;
  socket?: string; // e.g. 'AM5', 'LGA1700', 'AM4', 'LGA1851', 'SP3', 'sTR5'
  formFactor?: string; // e.g. 'ATX', 'Micro-ATX', 'Mini-ITX', 'M.2 2280', '2.5" SATA', '3.5" SATA', 'SFX'
  memoryType?: string; // e.g. 'DDR5', 'DDR4', 'DDR3', 'ECC RDIMM'
  tdpWatts?: number; // e.g. 170, 450, 850
  notes?: string;
}

export const INITIAL_PARTS_INVENTORY: InventoryItem[] = [
  // =========================================================================
  // 1. Processors (CPUs) - Modern AM5, LGA1851, LGA1700, AM4 & Enterprise
  // =========================================================================
  { id: 'cpu_01', sku: 'CPU-AMD-7800X3D', name: 'AMD Ryzen 7 7800X3D (8C/16T up to 5.0GHz 96MB 3D V-Cache AM5)', category: 'Processors (CPUs)', stock: 5, minThreshold: 2, unitCost: 419.00, supplier: 'Micro Center', location: 'CPU Safe - Tray 1', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 120 },
  { id: 'cpu_02', sku: 'CPU-AMD-7950X', name: 'AMD Ryzen 9 7950X (16C/32T up to 5.7GHz AM5 170W)', category: 'Processors (CPUs)', stock: 3, minThreshold: 2, unitCost: 549.00, supplier: 'Newegg', location: 'CPU Safe - Tray 1', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 170 },
  { id: 'cpu_03', sku: 'CPU-AMD-7950X3D', name: 'AMD Ryzen 9 7950X3D (16C/32T 128MB Cache V-Cache Flagship AM5)', category: 'Processors (CPUs)', stock: 3, minThreshold: 1, unitCost: 599.00, supplier: 'Micro Center', location: 'CPU Safe - Tray 1', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 120 },
  { id: 'cpu_04', sku: 'CPU-AMD-7900X', name: 'AMD Ryzen 9 7900X (12C/24T up to 5.6GHz AM5)', category: 'Processors (CPUs)', stock: 4, minThreshold: 2, unitCost: 389.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 2', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 170 },
  { id: 'cpu_05', sku: 'CPU-AMD-7700X', name: 'AMD Ryzen 7 7700X (8C/16T up to 5.4GHz AM5)', category: 'Processors (CPUs)', stock: 7, minThreshold: 3, unitCost: 289.00, supplier: 'Newegg', location: 'CPU Safe - Tray 2', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 105 },
  { id: 'cpu_06', sku: 'CPU-AMD-7600X', name: 'AMD Ryzen 5 7600X (6C/12T up to 5.3GHz AM5)', category: 'Processors (CPUs)', stock: 8, minThreshold: 3, unitCost: 199.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 2', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 105 },
  { id: 'cpu_07', sku: 'CPU-AMD-8700G', name: 'AMD Ryzen 7 8700G APU (8C/16T Radeon 780M NPU 16 TOPS AM5)', category: 'Processors (CPUs)', stock: 4, minThreshold: 2, unitCost: 329.00, supplier: 'Micro Center', location: 'CPU Safe - Tray 2', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 65 },
  { id: 'cpu_08', sku: 'CPU-AMD-9950X', name: 'AMD Ryzen 9 9950X Zen 5 (16C/32T up to 5.7GHz AM5)', category: 'Processors (CPUs)', stock: 2, minThreshold: 1, unitCost: 649.00, supplier: 'B&H Photo', location: 'CPU Safe - Tray 3', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 170 },
  { id: 'cpu_09', sku: 'CPU-AMD-9700X', name: 'AMD Ryzen 7 9700X Zen 5 (8C/16T up to 5.5GHz AM5 65W/105W)', category: 'Processors (CPUs)', stock: 3, minThreshold: 1, unitCost: 359.00, supplier: 'Newegg', location: 'CPU Safe - Tray 3', socket: 'AM5', memoryType: 'DDR5', tdpWatts: 65 },
  { id: 'cpu_10', sku: 'CPU-AMD-5800X3D', name: 'AMD Ryzen 7 5800X3D (8C/16T 96MB 3D V-Cache Socket AM4)', category: 'Processors (CPUs)', stock: 4, minThreshold: 2, unitCost: 319.00, supplier: 'Newegg', location: 'CPU Safe - Tray 3', socket: 'AM4', memoryType: 'DDR4', tdpWatts: 105 },
  { id: 'cpu_11', sku: 'CPU-AMD-5700X3D', name: 'AMD Ryzen 7 5700X3D (8C/16T Socket AM4 Upgrade)', category: 'Processors (CPUs)', stock: 6, minThreshold: 2, unitCost: 209.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 3', socket: 'AM4', memoryType: 'DDR4', tdpWatts: 105 },
  { id: 'cpu_12', sku: 'CPU-AMD-5600X', name: 'AMD Ryzen 5 5600X (6C/12T up to 4.6GHz AM4 65W)', category: 'Processors (CPUs)', stock: 11, minThreshold: 4, unitCost: 129.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 4', socket: 'AM4', memoryType: 'DDR4', tdpWatts: 65 },
  { id: 'cpu_13', sku: 'CPU-AMD-3600', name: 'AMD Ryzen 5 3600 (6C/12T Socket AM4 Diagnostic Test CPU)', category: 'Processors (CPUs)', stock: 5, minThreshold: 2, unitCost: 79.00, supplier: 'Newegg', location: 'CPU Safe - Tray 4', socket: 'AM4', memoryType: 'DDR4', tdpWatts: 65 },
  { id: 'cpu_14', sku: 'CPU-INT-U9-285K', name: 'Intel Core Ultra 9 285K (24C/24T Arrow Lake LGA1851 250W MTP)', category: 'Processors (CPUs)', stock: 2, minThreshold: 1, unitCost: 629.00, supplier: 'B&H Photo', location: 'CPU Safe - Tray 5', socket: 'LGA1851', memoryType: 'DDR5', tdpWatts: 250 },
  { id: 'cpu_15', sku: 'CPU-INT-U7-265K', name: 'Intel Core Ultra 7 265K (20C/20T Arrow Lake LGA1851)', category: 'Processors (CPUs)', stock: 3, minThreshold: 1, unitCost: 409.00, supplier: 'Micro Center', location: 'CPU Safe - Tray 5', socket: 'LGA1851', memoryType: 'DDR5', tdpWatts: 250 },
  { id: 'cpu_16', sku: 'CPU-INT-14900KS', name: 'Intel Core i9-14900KS Special Edition (24C/32T up to 6.2GHz LGA1700)', category: 'Processors (CPUs)', stock: 2, minThreshold: 1, unitCost: 689.00, supplier: 'B&H Photo', location: 'CPU Safe - Tray 5', socket: 'LGA1700', memoryType: 'DDR5', tdpWatts: 320 },
  { id: 'cpu_17', sku: 'CPU-INT-14900K', name: 'Intel Core i9-14900K (24C/32T up to 6.0GHz LGA1700)', category: 'Processors (CPUs)', stock: 4, minThreshold: 2, unitCost: 549.00, supplier: 'Micro Center', location: 'CPU Safe - Tray 6', socket: 'LGA1700', memoryType: 'DDR5', tdpWatts: 253 },
  { id: 'cpu_18', sku: 'CPU-INT-14700K', name: 'Intel Core i7-14700K (20C/28T up to 5.6GHz LGA1700)', category: 'Processors (CPUs)', stock: 6, minThreshold: 3, unitCost: 399.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 6', socket: 'LGA1700', memoryType: 'DDR5', tdpWatts: 253 },
  { id: 'cpu_19', sku: 'CPU-INT-14600K', name: 'Intel Core i5-14600K (14C/20T up to 5.3GHz LGA1700)', category: 'Processors (CPUs)', stock: 9, minThreshold: 4, unitCost: 299.00, supplier: 'Newegg', location: 'CPU Safe - Tray 6', socket: 'LGA1700', memoryType: 'DDR5', tdpWatts: 181 },
  { id: 'cpu_20', sku: 'CPU-INT-13400F', name: 'Intel Core i5-13400F (10C/16T Budget LGA1700 65W)', category: 'Processors (CPUs)', stock: 12, minThreshold: 4, unitCost: 185.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 7', socket: 'LGA1700', memoryType: 'DDR4/DDR5', tdpWatts: 65 },
  { id: 'cpu_21', sku: 'CPU-INT-12600K', name: 'Intel Core i5-12600K (10C/16T Golden Cove LGA1700)', category: 'Processors (CPUs)', stock: 7, minThreshold: 3, unitCost: 179.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 7', socket: 'LGA1700', memoryType: 'DDR4/DDR5', tdpWatts: 150 },
  { id: 'cpu_22', sku: 'CPU-INT-12100', name: 'Intel Core i3-12100 (4C/8T with UHD 730 Graphics LGA1700 Bench CPU)', category: 'Processors (CPUs)', stock: 8, minThreshold: 3, unitCost: 115.00, supplier: 'Amazon Business', location: 'CPU Safe - Tray 7', socket: 'LGA1700', memoryType: 'DDR4/DDR5', tdpWatts: 60 },
  { id: 'cpu_23', sku: 'CPU-INT-10850K', name: 'Intel Core i9-10850K (10C/20T Comet Lake LGA1200 Test Rig)', category: 'Processors (CPUs)', stock: 3, minThreshold: 1, unitCost: 249.00, supplier: 'Newegg', location: 'CPU Safe - Tray 8', socket: 'LGA1200', memoryType: 'DDR4', tdpWatts: 125 },
  { id: 'cpu_24', sku: 'CPU-INT-8700K', name: 'Intel Core i7-8700K (6C/12T Coffee Lake LGA1151 Legacy Test CPU)', category: 'Processors (CPUs)', stock: 4, minThreshold: 2, unitCost: 139.00, supplier: 'Direct OEM', location: 'Legacy CPU Box', socket: 'LGA1151', memoryType: 'DDR4', tdpWatts: 95 },
  { id: 'cpu_25', sku: 'CPU-INT-4790K', name: 'Intel Core i7-4790K Devil\'s Canyon (4C/8T 4.0GHz LGA1150 Retro Bench)', category: 'Processors (CPUs)', stock: 3, minThreshold: 1, unitCost: 85.00, supplier: 'Direct OEM', location: 'Legacy CPU Box', socket: 'LGA1150', memoryType: 'DDR3', tdpWatts: 88 },
  { id: 'cpu_26', sku: 'CPU-AMD-TR-7980X', name: 'AMD Ryzen Threadripper 7980X (64C/128T 4.7GHz Socket sTR5 350W)', category: 'Processors (CPUs)', stock: 1, minThreshold: 1, unitCost: 4999.00, supplier: 'B&H Photo', location: 'Workstation Vault', socket: 'sTR5', memoryType: 'ECC RDIMM', tdpWatts: 350 },
  { id: 'cpu_27', sku: 'CPU-AMD-EPYC-7763', name: 'AMD EPYC 7763 (64C/128T 256MB Cache Server Socket SP3)', category: 'Processors (CPUs)', stock: 2, minThreshold: 1, unitCost: 1850.00, supplier: 'Newegg', location: 'Server Locker 1', socket: 'SP3', memoryType: 'ECC RDIMM', tdpWatts: 280 },
  { id: 'cpu_28', sku: 'CPU-INT-XN-8480', name: 'Intel Xeon Platinum 8480+ (56C/112T Sapphire Rapids LGA4677 Server)', category: 'Processors (CPUs)', stock: 1, minThreshold: 1, unitCost: 8900.00, supplier: 'Arrow', location: 'Server Locker 1', socket: 'LGA4677', memoryType: 'ECC RDIMM', tdpWatts: 350 },

  // =========================================================================
  // 2. Graphics Cards (GPUs) - GeForce RTX 40/30, Radeon RX 7000/6000 & Workstation
  // =========================================================================
  { id: 'gpu_01', sku: 'GPU-NV-RTX4090', name: 'NVIDIA GeForce RTX 4090 24GB Founders Edition (450W 12V-2x6)', category: 'Graphics Cards (GPUs)', stock: 2, minThreshold: 1, unitCost: 1699.00, supplier: 'B&H Photo', location: 'GPU Locker - Bay A', tdpWatts: 450, notes: 'Requires ATX 3.0 16-pin 12V-2x6 cable with 600W headroom.' },
  { id: 'gpu_02', sku: 'GPU-NV-RTX4080S', name: 'ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X', category: 'Graphics Cards (GPUs)', stock: 3, minThreshold: 1, unitCost: 999.00, supplier: 'Micro Center', location: 'GPU Locker - Bay A', tdpWatts: 320 },
  { id: 'gpu_03', sku: 'GPU-NV-RTX4070TS', name: 'Gigabyte Gaming OC GeForce RTX 4070 Ti Super 16GB GDDR6X', category: 'Graphics Cards (GPUs)', stock: 4, minThreshold: 2, unitCost: 799.00, supplier: 'Newegg', location: 'GPU Locker - Bay B', tdpWatts: 285 },
  { id: 'gpu_04', sku: 'GPU-NV-RTX4070S', name: 'ASUS Dual GeForce RTX 4070 Super EVO 12GB GDDR6X', category: 'Graphics Cards (GPUs)', stock: 6, minThreshold: 2, unitCost: 599.00, supplier: 'Micro Center', location: 'GPU Locker - Bay B', tdpWatts: 220 },
  { id: 'gpu_05', sku: 'GPU-NV-RTX4060TI-16', name: 'MSI Ventus Black GeForce RTX 4060 Ti 16GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 5, minThreshold: 2, unitCost: 449.00, supplier: 'Newegg', location: 'GPU Locker - Bay B', tdpWatts: 165 },
  { id: 'gpu_06', sku: 'GPU-NV-RTX4060', name: 'MSI Ventus 2X GeForce RTX 4060 8GB GDDR6 (115W Dual Fan)', category: 'Graphics Cards (GPUs)', stock: 8, minThreshold: 3, unitCost: 299.00, supplier: 'Amazon Business', location: 'GPU Locker - Bay C', tdpWatts: 115 },
  { id: 'gpu_07', sku: 'GPU-NV-RTX3080-10', name: 'EVGA GeForce RTX 3080 FTW3 Ultra 10GB GDDR6X (Bench GPU)', category: 'Graphics Cards (GPUs)', stock: 3, minThreshold: 1, unitCost: 450.00, supplier: 'Direct OEM', location: 'GPU Locker - Bay C', tdpWatts: 320 },
  { id: 'gpu_08', sku: 'GPU-NV-RTX3060-12', name: 'ZOTAC Gaming GeForce RTX 3060 Twin Edge 12GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 9, minThreshold: 3, unitCost: 279.00, supplier: 'Amazon Business', location: 'GPU Locker - Bay C', tdpWatts: 170 },
  { id: 'gpu_09', sku: 'GPU-NV-GTX1660S', name: 'ASUS TUF Gaming GeForce GTX 1660 Super 6GB GDDR6 (Testing)', category: 'Graphics Cards (GPUs)', stock: 6, minThreshold: 2, unitCost: 189.00, supplier: 'Newegg', location: 'GPU Locker - Bay D', tdpWatts: 125 },
  { id: 'gpu_10', sku: 'GPU-AMD-7900XTX', name: 'Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 2, minThreshold: 1, unitCost: 979.00, supplier: 'Newegg', location: 'GPU Locker - Bay D', tdpWatts: 355 },
  { id: 'gpu_11', sku: 'GPU-AMD-7900XT', name: 'PowerColor Hellhound AMD Radeon RX 7900 XT 20GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 3, minThreshold: 1, unitCost: 699.00, supplier: 'Micro Center', location: 'GPU Locker - Bay D', tdpWatts: 315 },
  { id: 'gpu_12', sku: 'GPU-AMD-7800XT', name: 'XFX Speedster QICK 319 Radeon RX 7800 XT Core 16GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 5, minThreshold: 2, unitCost: 499.00, supplier: 'Micro Center', location: 'GPU Locker - Bay E', tdpWatts: 263 },
  { id: 'gpu_13', sku: 'GPU-AMD-7700XT', name: 'ASRock Challenger Radeon RX 7700 XT 12GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 4, minThreshold: 2, unitCost: 399.00, supplier: 'Newegg', location: 'GPU Locker - Bay E', tdpWatts: 245 },
  { id: 'gpu_14', sku: 'GPU-AMD-7600XT', name: 'PowerColor Fighter Radeon RX 7600 XT 16GB GDDR6', category: 'Graphics Cards (GPUs)', stock: 6, minThreshold: 2, unitCost: 319.00, supplier: 'Amazon Business', location: 'GPU Locker - Bay E', tdpWatts: 190 },
  { id: 'gpu_15', sku: 'GPU-INT-A770', name: 'Intel Arc A770 16GB GDDR6 Limited Edition Dual Fan', category: 'Graphics Cards (GPUs)', stock: 4, minThreshold: 2, unitCost: 289.00, supplier: 'Newegg', location: 'GPU Locker - Bay F', tdpWatts: 225 },
  { id: 'gpu_16', sku: 'GPU-INT-A580', name: 'ASRock Challenger Arc A580 8GB GDDR6 (Budget AV1 Video Encoder)', category: 'Graphics Cards (GPUs)', stock: 5, minThreshold: 2, unitCost: 169.00, supplier: 'Newegg', location: 'GPU Locker - Bay F', tdpWatts: 185 },
  { id: 'gpu_17', sku: 'GPU-NV-RTX6000-ADA', name: 'NVIDIA RTX 6000 Ada Generation 48GB GDDR6 ECC Workstation Flagship', category: 'Graphics Cards (GPUs)', stock: 1, minThreshold: 1, unitCost: 6800.00, supplier: 'B&H Photo', location: 'Workstation Vault', tdpWatts: 300 },
  { id: 'gpu_18', sku: 'GPU-NV-A4000', name: 'NVIDIA RTX A4000 16GB GDDR6 ECC Single-Slot Workstation Blower', category: 'Graphics Cards (GPUs)', stock: 2, minThreshold: 1, unitCost: 995.00, supplier: 'B&H Photo', location: 'Workstation Vault', tdpWatts: 140 },

  // =========================================================================
  // 3. Motherboards - AM5, AM4, LGA1851, LGA1700, LGA1200 & Server
  // =========================================================================
  { id: 'mb_01', sku: 'MB-ASUS-Z790H', name: 'ASUS ROG Maximus Z790 Dark Hero (LGA1700 ATX DDR5 20+1 Power Stages)', category: 'Motherboards', stock: 3, minThreshold: 1, unitCost: 599.00, supplier: 'Micro Center', location: 'Motherboard Shelf 1', socket: 'LGA1700', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_02', sku: 'MB-MSI-Z790-MAX', name: 'MSI MAG Z790 Tomahawk MAX WiFi (LGA1700 ATX DDR5 PCIe 5.0)', category: 'Motherboards', stock: 5, minThreshold: 2, unitCost: 269.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 1', socket: 'LGA1700', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_03', sku: 'MB-ASUS-B760P', name: 'ASUS TUF Gaming B760-Plus WiFi (LGA1700 ATX DDR5)', category: 'Motherboards', stock: 7, minThreshold: 3, unitCost: 189.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 1', socket: 'LGA1700', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_04', sku: 'MB-MSI-B760M-D4', name: 'MSI PRO B760M-A WiFi DDR4 (LGA1700 Micro-ATX DDR4 Budget Bench)', category: 'Motherboards', stock: 8, minThreshold: 3, unitCost: 149.00, supplier: 'Newegg', location: 'Motherboard Shelf 2', socket: 'LGA1700', formFactor: 'Micro-ATX', memoryType: 'DDR4' },
  { id: 'mb_05', sku: 'MB-ASUS-H610M', name: 'ASUS Prime H610M-E D4 (LGA1700 Micro-ATX DDR4 Test Board)', category: 'Motherboards', stock: 10, minThreshold: 4, unitCost: 89.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 2', socket: 'LGA1700', formFactor: 'Micro-ATX', memoryType: 'DDR4' },
  { id: 'mb_06', sku: 'MB-ASUS-Z890-HERO', name: 'ASUS ROG Maximus Z890 Hero (LGA1851 ATX DDR5 Thunderbolt 4)', category: 'Motherboards', stock: 2, minThreshold: 1, unitCost: 699.00, supplier: 'B&H Photo', location: 'Motherboard Shelf 3', socket: 'LGA1851', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_07', sku: 'MB-GIG-Z890-ELITE', name: 'Gigabyte Z890 AORUS Elite WiFi7 (LGA1851 ATX DDR5 PCIe 5.0)', category: 'Motherboards', stock: 3, minThreshold: 1, unitCost: 289.00, supplier: 'Micro Center', location: 'Motherboard Shelf 3', socket: 'LGA1851', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_08', sku: 'MB-ASUS-X670E-HERO', name: 'ASUS ROG Crosshair X670E Hero (Socket AM5 ATX DDR5 PCIe 5.0)', category: 'Motherboards', stock: 3, minThreshold: 1, unitCost: 599.00, supplier: 'Micro Center', location: 'Motherboard Shelf 4', socket: 'AM5', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_09', sku: 'MB-MSI-B650T', name: 'MSI MAG B650 Tomahawk WiFi (Socket AM5 ATX DDR5)', category: 'Motherboards', stock: 6, minThreshold: 2, unitCost: 199.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 4', socket: 'AM5', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_10', sku: 'MB-GIG-B650E', name: 'Gigabyte B650 AORUS Elite AX (AM5 ATX PCIe 5.0 M.2)', category: 'Motherboards', stock: 5, minThreshold: 2, unitCost: 219.00, supplier: 'Newegg', location: 'Motherboard Shelf 4', socket: 'AM5', formFactor: 'ATX', memoryType: 'DDR5' },
  { id: 'mb_11', sku: 'MB-ASR-B650M-PRO', name: 'ASRock B650M Pro RS WiFi (Socket AM5 Micro-ATX DDR5 3x M.2)', category: 'Motherboards', stock: 7, minThreshold: 3, unitCost: 149.00, supplier: 'Newegg', location: 'Motherboard Shelf 5', socket: 'AM5', formFactor: 'Micro-ATX', memoryType: 'DDR5' },
  { id: 'mb_12', sku: 'MB-ASUS-B650I', name: 'ASUS ROG Strix B650E-I Gaming WiFi (Mini-ITX Socket AM5)', category: 'Motherboards', stock: 3, minThreshold: 1, unitCost: 319.00, supplier: 'B&H Photo', location: 'Motherboard Shelf 5', socket: 'AM5', formFactor: 'Mini-ITX', memoryType: 'DDR5' },
  { id: 'mb_13', sku: 'MB-GIG-A620M', name: 'Gigabyte A620M Gaming X (Budget AM5 Micro-ATX DDR5)', category: 'Motherboards', stock: 6, minThreshold: 2, unitCost: 99.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 5', socket: 'AM5', formFactor: 'Micro-ATX', memoryType: 'DDR5' },
  { id: 'mb_14', sku: 'MB-MSI-B550-TOM', name: 'MSI MAG B550 Tomahawk MAX WiFi (Socket AM4 ATX DDR4)', category: 'Motherboards', stock: 7, minThreshold: 3, unitCost: 159.00, supplier: 'Amazon Business', location: 'Motherboard Shelf 6', socket: 'AM4', formFactor: 'ATX', memoryType: 'DDR4' },
  { id: 'mb_15', sku: 'MB-ASR-B550M', name: 'ASRock B550M Pro4 (Socket AM4 Micro-ATX DDR4)', category: 'Motherboards', stock: 8, minThreshold: 3, unitCost: 99.00, supplier: 'Newegg', location: 'Motherboard Shelf 6', socket: 'AM4', formFactor: 'Micro-ATX', memoryType: 'DDR4' },
  { id: 'mb_16', sku: 'MB-SPM-H12SSL', name: 'Supermicro H12SSL-i Single AMD EPYC 7002/7003 ATX Server Board', category: 'Motherboards', stock: 2, minThreshold: 1, unitCost: 485.00, supplier: 'Newegg', location: 'Server Locker 2', socket: 'SP3', formFactor: 'ATX', memoryType: 'ECC RDIMM' },
  { id: 'mb_17', sku: 'MB-ASUS-TRX50', name: 'ASUS Pro WS TRX50-SAGE WIFI (Socket sTR5 EEB Workstation Board)', category: 'Motherboards', stock: 1, minThreshold: 1, unitCost: 899.00, supplier: 'B&H Photo', location: 'Workstation Vault', socket: 'sTR5', formFactor: 'EEB', memoryType: 'ECC RDIMM' },

  // =========================================================================
  // 4. Memory (RAM) - DDR5, DDR4, SODIMM Laptop & Server ECC RDIMM
  // =========================================================================
  { id: 'ram_01', sku: 'RAM-GSK-64G5-6000', name: 'G.Skill Trident Z5 Neo RGB 64GB (2x32GB) DDR5-6000 CL30 EXPO', category: 'Memory (RAM)', stock: 8, minThreshold: 3, unitCost: 209.00, supplier: 'Micro Center', location: 'Static Safe - Tray 1', memoryType: 'DDR5', formFactor: 'UDIMM' },
  { id: 'ram_02', sku: 'RAM-COR-32G5-6000', name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000 CL30 XMP/EXPO', category: 'Memory (RAM)', stock: 14, minThreshold: 5, unitCost: 114.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 1', memoryType: 'DDR5', formFactor: 'UDIMM' },
  { id: 'ram_03', sku: 'RAM-GSK-32G5-7200', name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-7200 CL34 Intel XMP 3.0', category: 'Memory (RAM)', stock: 4, minThreshold: 2, unitCost: 139.00, supplier: 'Newegg', location: 'Static Safe - Tray 1', memoryType: 'DDR5', formFactor: 'UDIMM' },
  { id: 'ram_04', sku: 'RAM-COR-96G5-5600', name: 'Corsair Vengeance 96GB (2x48GB) DDR5-5600 CL40 High-Capacity Kit', category: 'Memory (RAM)', stock: 3, minThreshold: 1, unitCost: 279.00, supplier: 'Newegg', location: 'Static Safe - Tray 2', memoryType: 'DDR5', formFactor: 'UDIMM' },
  { id: 'ram_05', sku: 'RAM-CRU-32G5-JEDEC', name: 'Crucial Pro 32GB (2x16GB) DDR5-5600 CL46 JEDEC Standard Desktop RAM', category: 'Memory (RAM)', stock: 10, minThreshold: 4, unitCost: 89.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 2', memoryType: 'DDR5', formFactor: 'UDIMM' },
  { id: 'ram_06', sku: 'RAM-CRU-32G5-SO', name: 'Crucial 32GB (1x32GB) DDR5-5600 CL46 SODIMM (Laptop DDR5 Upgrade)', category: 'Memory (RAM)', stock: 9, minThreshold: 3, unitCost: 89.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 3', memoryType: 'DDR5', formFactor: 'SODIMM' },
  { id: 'ram_07', sku: 'RAM-KNG-64G5-SO', name: 'Kingston Fury Impact 64GB (2x32GB) DDR5-5600 CL40 Laptop SODIMM Kit', category: 'Memory (RAM)', stock: 4, minThreshold: 2, unitCost: 189.00, supplier: 'Newegg', location: 'Static Safe - Tray 3', memoryType: 'DDR5', formFactor: 'SODIMM' },
  { id: 'ram_08', sku: 'RAM-SAM-64G5-ECC', name: 'Samsung 64GB DDR5-4800 Registered ECC RDIMM (Server)', category: 'Memory (RAM)', stock: 6, minThreshold: 2, unitCost: 285.00, supplier: 'Newegg', location: 'Static Safe - Tray 4', memoryType: 'ECC RDIMM', formFactor: 'RDIMM' },
  { id: 'ram_09', sku: 'RAM-MIC-128G5-ECC', name: 'Micron 128GB DDR5-4800 Octal Rank Registered ECC RDIMM', category: 'Memory (RAM)', stock: 2, minThreshold: 1, unitCost: 620.00, supplier: 'Mouser', location: 'Static Safe - Tray 4', memoryType: 'ECC RDIMM', formFactor: 'RDIMM' },
  { id: 'ram_10', sku: 'RAM-GSK-64G4-3600', name: 'G.Skill Ripjaws V 64GB (2x32GB) DDR4-3600 CL18 Dual Channel Kit', category: 'Memory (RAM)', stock: 8, minThreshold: 3, unitCost: 119.00, supplier: 'Micro Center', location: 'Static Safe - Tray 5', memoryType: 'DDR4', formFactor: 'UDIMM' },
  { id: 'ram_11', sku: 'RAM-COR-32G4-3200', name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200 CL16 Low Profile', category: 'Memory (RAM)', stock: 16, minThreshold: 6, unitCost: 64.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 5', memoryType: 'DDR4', formFactor: 'UDIMM' },
  { id: 'ram_12', sku: 'RAM-CRU-16G4-3200', name: 'Crucial Pro 16GB (2x8GB) DDR4-3200 CL22 Desktop UDIMM', category: 'Memory (RAM)', stock: 18, minThreshold: 6, unitCost: 38.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 5', memoryType: 'DDR4', formFactor: 'UDIMM' },
  { id: 'ram_13', sku: 'RAM-CRU-32G4-SO', name: 'Crucial 32GB (2x16GB) DDR4-3200 CL22 Laptop SODIMM Kit', category: 'Memory (RAM)', stock: 12, minThreshold: 4, unitCost: 62.00, supplier: 'Amazon Business', location: 'Static Safe - Tray 6', memoryType: 'DDR4', formFactor: 'SODIMM' },
  { id: 'ram_14', sku: 'RAM-CRU-16G4-SO', name: 'Crucial 16GB (1x16GB) DDR4-3200 CL22 SODIMM (Laptop DDR4)', category: 'Memory (RAM)', stock: 15, minThreshold: 5, unitCost: 34.00, supplier: 'DigiKey', location: 'Static Safe - Tray 6', memoryType: 'DDR4', formFactor: 'SODIMM' },
  { id: 'ram_15', sku: 'RAM-SKH-32G4-ECC', name: 'SK Hynix 32GB DDR4-3200 ECC Unbuffered Server RAM (UDIMM)', category: 'Memory (RAM)', stock: 8, minThreshold: 2, unitCost: 95.00, supplier: 'DigiKey', location: 'Static Safe - Tray 7', memoryType: 'DDR4', formFactor: 'ECC UDIMM' },
  { id: 'ram_16', sku: 'RAM-KNG-8G3-1600', name: 'Kingston ValueRAM 8GB (1x8GB) DDR3-1600 CL11 1.5V (Legacy Bench RAM)', category: 'Memory (RAM)', stock: 8, minThreshold: 2, unitCost: 19.00, supplier: 'Direct OEM', location: 'Legacy RAM Box', memoryType: 'DDR3', formFactor: 'UDIMM' },
  { id: 'ram_17', sku: 'RAM-SAM-8G3L-SO', name: 'Samsung 8GB DDR3L-1600 1.35V Low-Voltage Laptop SODIMM', category: 'Memory (RAM)', stock: 10, minThreshold: 3, unitCost: 16.00, supplier: 'Direct OEM', location: 'Legacy RAM Box', memoryType: 'DDR3', formFactor: 'SODIMM' },

  // =========================================================================
  // 5. Storage (SSD / HDD) - PCIe 5.0, PCIe 4.0 NVMe, M.2 2230, 2.5" SATA & NAS
  // =========================================================================
  { id: 'ssd_01', sku: 'SSD-CRU-T705-2T', name: 'Crucial T705 2TB PCIe 5.0 NVMe M.2 SSD (14,500 MB/s Read with Heatsink)', category: 'Storage (SSD / HDD)', stock: 3, minThreshold: 1, unitCost: 299.00, supplier: 'Micro Center', location: 'Storage Vault - Row A', formFactor: 'M.2 2280' },
  { id: 'ssd_02', sku: 'SSD-SAM-990P-4T', name: 'Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD with Heatsink', category: 'Storage (SSD / HDD)', stock: 4, minThreshold: 2, unitCost: 319.00, supplier: 'B&H Photo', location: 'Storage Vault - Row A', formFactor: 'M.2 2280' },
  { id: 'ssd_03', sku: 'SSD-SAM-990P-2T', name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD (7,450 MB/s)', category: 'Storage (SSD / HDD)', stock: 12, minThreshold: 4, unitCost: 169.00, supplier: 'Amazon Business', location: 'Storage Vault - Row A', formFactor: 'M.2 2280' },
  { id: 'ssd_04', sku: 'SSD-WD-SN850X-4T', name: 'Western Digital Black SN850X 4TB PCIe 4.0 NVMe M.2 2280 SSD', category: 'Storage (SSD / HDD)', stock: 5, minThreshold: 2, unitCost: 299.00, supplier: 'Newegg', location: 'Storage Vault - Row B', formFactor: 'M.2 2280' },
  { id: 'ssd_05', sku: 'SSD-WD-SN850X-2T', name: 'Western Digital Black SN850X 2TB PCIe 4.0 NVMe M.2 SSD', category: 'Storage (SSD / HDD)', stock: 14, minThreshold: 5, unitCost: 149.00, supplier: 'Micro Center', location: 'Storage Vault - Row B', formFactor: 'M.2 2280' },
  { id: 'ssd_06', sku: 'SSD-WD-SN850X-1T', name: 'Western Digital Black SN850X 1TB PCIe 4.0 NVMe M.2 SSD', category: 'Storage (SSD / HDD)', stock: 16, minThreshold: 5, unitCost: 89.00, supplier: 'Newegg', location: 'Storage Vault - Row B', formFactor: 'M.2 2280' },
  { id: 'ssd_07', sku: 'SSD-CRU-T500-2T', name: 'Crucial T500 2TB PCIe 4.0 NVMe SSD (7,400 MB/s TLC Micron 232-Layer)', category: 'Storage (SSD / HDD)', stock: 8, minThreshold: 3, unitCost: 145.00, supplier: 'Amazon Business', location: 'Storage Vault - Row C', formFactor: 'M.2 2280' },
  { id: 'ssd_08', sku: 'SSD-KNG-NV2-1T', name: 'Kingston NV2 1TB PCIe 4.0 NVMe M.2 (Lab Standard Bench Drive)', category: 'Storage (SSD / HDD)', stock: 25, minThreshold: 8, unitCost: 58.00, supplier: 'Amazon Business', location: 'Storage Vault - Row C', formFactor: 'M.2 2280' },
  { id: 'ssd_09', sku: 'SSD-SAB-2230-1T', name: 'Sabrent Rocket 2230 1TB PCIe 4.0 NVMe M.2 SSD (Steam Deck / ROG Ally)', category: 'Storage (SSD / HDD)', stock: 6, minThreshold: 2, unitCost: 99.00, supplier: 'Amazon Business', location: 'Storage Vault - Row C', formFactor: 'M.2 2230' },
  { id: 'ssd_10', sku: 'SSD-SAM-870E-4T', name: 'Samsung 870 EVO 4TB 2.5" SATA III Internal Solid State Drive', category: 'Storage (SSD / HDD)', stock: 4, minThreshold: 2, unitCost: 289.00, supplier: 'B&H Photo', location: 'Storage Vault - Row D', formFactor: '2.5" SATA' },
  { id: 'ssd_11', sku: 'SSD-SAM-870E-1T', name: 'Samsung 870 EVO 1TB 2.5" SATA III Internal Solid State Drive', category: 'Storage (SSD / HDD)', stock: 15, minThreshold: 5, unitCost: 89.00, supplier: 'Amazon Business', location: 'Storage Vault - Row D', formFactor: '2.5" SATA' },
  { id: 'ssd_12', sku: 'SSD-CRU-MX500-1T', name: 'Crucial MX500 1TB 2.5" SATA III Internal Solid State Drive', category: 'Storage (SSD / HDD)', stock: 20, minThreshold: 6, unitCost: 75.00, supplier: 'Amazon Business', location: 'Storage Vault - Row D', formFactor: '2.5" SATA' },
  { id: 'ssd_13', sku: 'SSD-KNG-A400-480', name: 'Kingston A400 480GB 2.5" SATA III SSD (OS Reinstallation Drive)', category: 'Storage (SSD / HDD)', stock: 22, minThreshold: 6, unitCost: 32.00, supplier: 'Amazon Business', location: 'Storage Vault - Row D', formFactor: '2.5" SATA' },
  { id: 'hdd_01', sku: 'HDD-SEA-IRON-22T', name: 'Seagate IronWolf Pro 22TB NAS Hard Drive 7200 RPM 512MB CMR SATA', category: 'Storage (SSD / HDD)', stock: 3, minThreshold: 1, unitCost: 449.00, supplier: 'Newegg', location: 'Storage Vault - Row E', formFactor: '3.5" SATA' },
  { id: 'hdd_02', sku: 'HDD-SEA-IRON-16T', name: 'Seagate IronWolf Pro 16TB NAS Hard Drive 7200 RPM CMR', category: 'Storage (SSD / HDD)', stock: 6, minThreshold: 2, unitCost: 289.00, supplier: 'Newegg', location: 'Storage Vault - Row E', formFactor: '3.5" SATA' },
  { id: 'hdd_03', sku: 'HDD-WD-RED-4T', name: 'Western Digital Red Plus 4TB NAS Hard Drive 5400 RPM CMR', category: 'Storage (SSD / HDD)', stock: 10, minThreshold: 3, unitCost: 99.00, supplier: 'Amazon Business', location: 'Storage Vault - Row E', formFactor: '3.5" SATA' },
  { id: 'hdd_04', sku: 'HDD-WD-GOLD-18T', name: 'Western Digital Gold 18TB Enterprise Class SATA 7200 RPM HDD', category: 'Storage (SSD / HDD)', stock: 4, minThreshold: 2, unitCost: 349.00, supplier: 'B&H Photo', location: 'Storage Vault - Row E', formFactor: '3.5" SATA' },
  { id: 'hdd_05', sku: 'HDD-WD-BLK-6T', name: 'Western Digital Black 6TB Performance Desktop HDD 7200 RPM 256MB', category: 'Storage (SSD / HDD)', stock: 5, minThreshold: 2, unitCost: 159.00, supplier: 'Amazon Business', location: 'Storage Vault - Row F', formFactor: '3.5" SATA' },
  { id: 'hdd_06', sku: 'HDD-SEA-2T-25', name: 'Seagate BarraCuda 2TB 2.5" 5400 RPM 128MB Cache Laptop Hard Drive', category: 'Storage (SSD / HDD)', stock: 8, minThreshold: 3, unitCost: 65.00, supplier: 'Amazon Business', location: 'Storage Vault - Row F', formFactor: '2.5" SATA' },
  { id: 'ssd_14', sku: 'SSD-MIC-7450-3T8', name: 'Micron 7450 PRO 3.84TB U.3 PCIe 4.0 NVMe Enterprise Server SSD', category: 'Storage (SSD / HDD)', stock: 2, minThreshold: 1, unitCost: 460.00, supplier: 'Mouser', location: 'Storage Vault - Row F', formFactor: '2.5" U.3' },

  // =========================================================================
  // 6. Power Supplies (PSUs) - ATX 3.0 / PCIe 5.0, SFX Mini-ITX & Test Benches
  // =========================================================================
  { id: 'psu_01', sku: 'PSU-SEA-TX1600', name: 'Seasonic Prime TX-1600 ATX 3.0 Titanium 1600W Fully Modular (2x 12V-2x6)', category: 'Power Supplies (PSUs)', stock: 2, minThreshold: 1, unitCost: 529.00, supplier: 'B&H Photo', location: 'PSU Rack 1', formFactor: 'ATX', tdpWatts: 1600 },
  { id: 'psu_02', sku: 'PSU-BQT-DP13-1300', name: 'be quiet! Dark Power Pro 13 1300W 80+ Titanium ATX 3.0 Overclocking Key', category: 'Power Supplies (PSUs)', stock: 2, minThreshold: 1, unitCost: 389.00, supplier: 'B&H Photo', location: 'PSU Rack 1', formFactor: 'ATX', tdpWatts: 1300 },
  { id: 'psu_03', sku: 'PSU-COR-RM1200X-SH', name: 'Corsair RM1200x SHIFT ATX 3.0 1200W 80+ Gold Side-Interface Modular', category: 'Power Supplies (PSUs)', stock: 3, minThreshold: 1, unitCost: 229.00, supplier: 'Micro Center', location: 'PSU Rack 1', formFactor: 'ATX', tdpWatts: 1200 },
  { id: 'psu_04', sku: 'PSU-SEA-GX1000', name: 'Seasonic Focus GX-1000 ATX 3.0 PCIe 5.0 1000W 80+ Gold Modular', category: 'Power Supplies (PSUs)', stock: 6, minThreshold: 2, unitCost: 179.00, supplier: 'Newegg', location: 'PSU Rack 2', formFactor: 'ATX', tdpWatts: 1000 },
  { id: 'psu_05', sku: 'PSU-COR-RM1000E', name: 'Corsair RM1000e 1000W 80+ Gold ATX 3.0 PCIe 5.0 Low-Noise Modular', category: 'Power Supplies (PSUs)', stock: 5, minThreshold: 2, unitCost: 159.00, supplier: 'Micro Center', location: 'PSU Rack 2', formFactor: 'ATX', tdpWatts: 1000 },
  { id: 'psu_06', sku: 'PSU-COR-RM850X', name: 'Corsair RM850x (2021) 850W 80+ Gold Fully Modular Power Supply', category: 'Power Supplies (PSUs)', stock: 8, minThreshold: 3, unitCost: 134.00, supplier: 'Amazon Business', location: 'PSU Rack 2', formFactor: 'ATX', tdpWatts: 850 },
  { id: 'psu_07', sku: 'PSU-MSI-A850GL', name: 'MSI MAG A850GL PCIE5 850W 80+ Gold ATX 3.0 Compact 140mm', category: 'Power Supplies (PSUs)', stock: 7, minThreshold: 3, unitCost: 109.00, supplier: 'Amazon Business', location: 'PSU Rack 3', formFactor: 'ATX', tdpWatts: 850 },
  { id: 'psu_08', sku: 'PSU-COR-RM750X', name: 'Corsair RM750x 750W 80+ Gold Fully Modular ATX Power Supply', category: 'Power Supplies (PSUs)', stock: 8, minThreshold: 3, unitCost: 119.00, supplier: 'Amazon Business', location: 'PSU Rack 3', formFactor: 'ATX', tdpWatts: 750 },
  { id: 'psu_09', sku: 'PSU-EVG-650GT', name: 'EVGA SuperNOVA 650 GT 650W 80+ Gold Fully Modular Power Supply', category: 'Power Supplies (PSUs)', stock: 9, minThreshold: 3, unitCost: 89.00, supplier: 'Amazon Business', location: 'PSU Rack 3', formFactor: 'ATX', tdpWatts: 650 },
  { id: 'psu_10', sku: 'PSU-COR-SF750', name: 'Corsair SF750 750W 80+ Platinum SFX Fully Modular (Gold Standard SFF)', category: 'Power Supplies (PSUs)', stock: 4, minThreshold: 2, unitCost: 169.00, supplier: 'Newegg', location: 'PSU Rack 4', formFactor: 'SFX', tdpWatts: 750 },
  { id: 'psu_11', sku: 'PSU-COR-SF850L', name: 'Corsair SF850L 850W SFX-L 80+ Gold ATX 3.0 PCIe 5.0 Modular', category: 'Power Supplies (PSUs)', stock: 3, minThreshold: 1, unitCost: 179.00, supplier: 'Micro Center', location: 'PSU Rack 4', formFactor: 'SFX-L', tdpWatts: 850 },
  { id: 'psu_12', sku: 'PSU-TT-SMART-500', name: 'Thermaltake Smart 500W 80+ White (Bench Short-Circuit Dummy Load PSU)', category: 'Power Supplies (PSUs)', stock: 12, minThreshold: 4, unitCost: 39.00, supplier: 'Amazon Business', location: 'PSU Rack 4', formFactor: 'ATX', tdpWatts: 500 },
  { id: 'psu_13', sku: 'PSU-FSP-FLEX-500', name: 'FSP FlexGURU Pro 500W Flex-ATX 80+ Gold 1U Small Form Factor PSU', category: 'Power Supplies (PSUs)', stock: 3, minThreshold: 1, unitCost: 125.00, supplier: 'Newegg', location: 'PSU Rack 4', formFactor: 'Flex-ATX', tdpWatts: 500 },

  // =========================================================================
  // 7. Cooling & Fans - High-Performance AIOs, Air Coolers & Case Fans
  // =========================================================================
  { id: 'cl_01', sku: 'COL-ARC-LF3-420', name: 'Arctic Liquid Freezer III 420 A-RGB High-Performance 420mm AIO Cooler', category: 'Cooling & Fans', stock: 2, minThreshold: 1, unitCost: 139.00, supplier: 'Amazon Business', location: 'Cooling Bay 1', socket: 'AM5/LGA1700' },
  { id: 'cl_02', sku: 'COL-ARC-LF3-360', name: 'Arctic Liquid Freezer III 360 A-RGB High-Performance AIO Cooler', category: 'Cooling & Fans', stock: 6, minThreshold: 2, unitCost: 119.00, supplier: 'Amazon Business', location: 'Cooling Bay 1', socket: 'AM5/LGA1700' },
  { id: 'cl_03', sku: 'COL-COR-H150I', name: 'Corsair iCUE LINK H150i RGB 360mm Magnetic Daisy-Chain Liquid Cooler', category: 'Cooling & Fans', stock: 3, minThreshold: 1, unitCost: 219.00, supplier: 'Newegg', location: 'Cooling Bay 1', socket: 'AM5/LGA1700' },
  { id: 'cl_04', sku: 'COL-LIA-GAL-360', name: 'Lian Li Galahad II LCD 360 2.88" IPS Screen AIO Liquid Cooler', category: 'Cooling & Fans', stock: 2, minThreshold: 1, unitCost: 249.00, supplier: 'Micro Center', location: 'Cooling Bay 2', socket: 'AM5/LGA1700' },
  { id: 'cl_05', sku: 'COL-NOC-NHD15-G2', name: 'Noctua NH-D15 G2 Next-Generation Dual-Tower Flagship Air Cooler (Torx Screw)', category: 'Cooling & Fans', stock: 3, minThreshold: 1, unitCost: 149.90, supplier: 'Micro Center', location: 'Cooling Bay 2', socket: 'AM5/LGA1700' },
  { id: 'cl_06', sku: 'COL-NOC-NHD15-CH', name: 'Noctua NH-D15 chromax.black Dual-Tower Premium CPU Air Cooler', category: 'Cooling & Fans', stock: 4, minThreshold: 2, unitCost: 119.95, supplier: 'Micro Center', location: 'Cooling Bay 2', socket: 'AM5/LGA1700' },
  { id: 'cl_07', sku: 'COL-THR-PA120SE', name: 'Thermalright Peerless Assassin 120 SE Dual Tower Air Cooler (6 Heatpipes)', category: 'Cooling & Fans', stock: 16, minThreshold: 5, unitCost: 35.90, supplier: 'Amazon Business', location: 'Cooling Bay 3', socket: 'AM5/LGA1700' },
  { id: 'cl_08', sku: 'COL-THR-PS120-EVO', name: 'Thermalright Phantom Spirit 120 EVO (7 Heatpipes Dual Tower Nickel Plated)', category: 'Cooling & Fans', stock: 10, minThreshold: 3, unitCost: 42.90, supplier: 'Amazon Business', location: 'Cooling Bay 3', socket: 'AM5/LGA1700' },
  { id: 'cl_09', sku: 'COL-DEEP-AK620', name: 'DeepCool AK620 Digital Dual-Tower Air Cooler with Real-Time Temp Display', category: 'Cooling & Fans', stock: 7, minThreshold: 3, unitCost: 69.99, supplier: 'Amazon Business', location: 'Cooling Bay 3', socket: 'AM5/LGA1700' },
  { id: 'cl_10', sku: 'COL-NOC-NHL9A-AM5', name: 'Noctua NH-L9a-AM5 chromax.black Low-Profile 37mm SFF CPU Cooler', category: 'Cooling & Fans', stock: 5, minThreshold: 2, unitCost: 54.95, supplier: 'Micro Center', location: 'Cooling Bay 4', socket: 'AM5' },
  { id: 'cl_11', sku: 'COL-THR-AXP90-X47', name: 'Thermalright AXP90-X47 Full Copper 47mm Low Profile SFF Cooler', category: 'Cooling & Fans', stock: 4, minThreshold: 2, unitCost: 38.90, supplier: 'Amazon Business', location: 'Cooling Bay 4', socket: 'AM5/LGA1700' },
  { id: 'fan_01', sku: 'FAN-NOC-A12X25-CH', name: 'Noctua NF-A12x25 PWM chromax.black 120mm Sterrox Liquid-Crystal Fan', category: 'Cooling & Fans', stock: 12, minThreshold: 4, unitCost: 34.95, supplier: 'Micro Center', location: 'Cooling Bay 5' },
  { id: 'fan_02', sku: 'FAN-PHA-T30-120', name: 'Phanteks T30-120 High-Performance 120x30mm Fan (Dual Vapo Bearings 3000RPM)', category: 'Cooling & Fans', stock: 8, minThreshold: 3, unitCost: 29.99, supplier: 'Newegg', location: 'Cooling Bay 5' },
  { id: 'fan_03', sku: 'FAN-ARC-P12-5PK', name: 'Arctic P12 PWM PST 120mm Pressure-Optimized Fans (5-Pack Value Bundle)', category: 'Cooling & Fans', stock: 14, minThreshold: 4, unitCost: 32.00, supplier: 'Amazon Business', location: 'Cooling Bay 5' },
  { id: 'fan_04', sku: 'FAN-LIA-UNI-120', name: 'Lian Li UNI Fan SL-Infinity 120 RGB (3-Pack with Controller Hub)', category: 'Cooling & Fans', stock: 5, minThreshold: 2, unitCost: 99.99, supplier: 'Newegg', location: 'Cooling Bay 5' },
  { id: 'fan_05', sku: 'ACC-TG-LGA1700-CF', name: 'Thermal Grizzly Intel LGA1700 Contact Frame (Anti-Bending Buckle)', category: 'Cooling & Fans', stock: 9, minThreshold: 3, unitCost: 39.90, supplier: 'Mouser', location: 'Cabinet A - Bin 1' },
  { id: 'fan_06', sku: 'ACC-THR-AM5-SF', name: 'Thermalright AM5 CPU Contact Sealing Frame (Prevents Thermal Paste Ingress)', category: 'Cooling & Fans', stock: 15, minThreshold: 5, unitCost: 11.90, supplier: 'Amazon Business', location: 'Cabinet A - Bin 1' },

  // =========================================================================
  // 8. Cases & Chassis - Showcase, Airflow Mid-Tower, Mini-ITX SFF & Test Tables
  // =========================================================================
  { id: 'cs_01', sku: 'CAS-LIA-O11-EVO', name: 'Lian Li O11 Dynamic EVO XL Full Tower Chassis (Black Tempered Glass)', category: 'Cases & Chassis', stock: 2, minThreshold: 1, unitCost: 234.00, supplier: 'Micro Center', location: 'Chassis Storage Area', formFactor: 'Full Tower' },
  { id: 'cs_02', sku: 'CAS-FRA-NORTH', name: 'Fractal Design North Charcoal Black (Real Walnut Front Mesh Side Panel)', category: 'Cases & Chassis', stock: 3, minThreshold: 1, unitCost: 139.99, supplier: 'Newegg', location: 'Chassis Storage Area', formFactor: 'Mid Tower' },
  { id: 'cs_03', sku: 'CAS-NZX-H6-FLOW', name: 'NZXT H6 Flow Dual-Chamber Compact Panoramic ATX Mid-Tower Case (Black)', category: 'Cases & Chassis', stock: 4, minThreshold: 2, unitCost: 109.99, supplier: 'Micro Center', location: 'Chassis Storage Area', formFactor: 'Mid Tower' },
  { id: 'cs_04', sku: 'CAS-COR-4000D', name: 'Corsair 4000D Airflow Tempered Glass Mid-Tower Case', category: 'Cases & Chassis', stock: 6, minThreshold: 2, unitCost: 89.99, supplier: 'Amazon Business', location: 'Chassis Storage Area', formFactor: 'Mid Tower' },
  { id: 'cs_05', sku: 'CAS-FRA-TERRA', name: 'Fractal Design Terra Jade Green Anodized Aluminum Small Form Factor Mini-ITX Case', category: 'Cases & Chassis', stock: 3, minThreshold: 1, unitCost: 179.99, supplier: 'Newegg', location: 'Chassis Storage Area', formFactor: 'Mini-ITX' },
  { id: 'cs_06', sku: 'CAS-CM-NR200P-V2', name: 'Cooler Master NR200P V2 Mini-ITX SFF Case (PCIe 4.0 Riser Included)', category: 'Cases & Chassis', stock: 4, minThreshold: 2, unitCost: 119.99, supplier: 'Amazon Business', location: 'Chassis Storage Area', formFactor: 'Mini-ITX' },
  { id: 'cs_07', sku: 'CAS-CM-Q300L', name: 'Cooler Master MasterBox Q300L Micro-ATX Compact Case (Student Builds)', category: 'Cases & Chassis', stock: 8, minThreshold: 3, unitCost: 39.99, supplier: 'Amazon Business', location: 'Chassis Storage Area', formFactor: 'Micro-ATX' },
  { id: 'cs_08', sku: 'CAS-STR-BC1-V2', name: 'Streacom BC1 V2 Open Benchtable Titanium (Quick-Release Diagnostic Platform)', category: 'Cases & Chassis', stock: 3, minThreshold: 1, unitCost: 199.00, supplier: 'B&H Photo', location: 'Bench Equipment Area', formFactor: 'Open Test Bench' },
  { id: 'cs_09', sku: 'CAS-SLV-RM42', name: 'SilverStone RM42-502 4U Rackmount Server Chassis (19" Server Rack)', category: 'Cases & Chassis', stock: 2, minThreshold: 1, unitCost: 289.00, supplier: 'B&H Photo', location: 'Server Rack Bay', formFactor: '4U Rackmount' },

  // =========================================================================
  // 9. Chemical / Thermal & Micro-Soldering Supplies
  // =========================================================================
  { id: 'inv_01', sku: 'THM-MX6-04G', name: 'Arctic MX-6 High-Performance Thermal Paste (4g Syringe)', category: 'Chemical / Thermal', stock: 24, minThreshold: 8, unitCost: 8.50, supplier: 'Amazon Business', location: 'Cabinet A - Bin 1' },
  { id: 'thm_02', sku: 'THM-TG-KRYO-EXT', name: 'Thermal Grizzly Kryonaut Extreme Thermal Paste (2g Applicator)', category: 'Chemical / Thermal', stock: 8, minThreshold: 3, unitCost: 22.00, supplier: 'Mouser', location: 'Cabinet A - Bin 1' },
  { id: 'thm_03', sku: 'THM-TG-COND-1G', name: 'Thermal Grizzly Conductonaut Liquid Metal (1g Syringe + Foam Shield & Swabs)', category: 'Chemical / Thermal', stock: 4, minThreshold: 2, unitCost: 18.50, supplier: 'Mouser', location: 'Cabinet A - Bin 1', notes: 'DANGER: Highly electrically conductive. Do NOT use on aluminum heatsinks.' },
  { id: 'thm_04', sku: 'THM-HON-PTM7950', name: 'Honeywell PTM7950 Phase Change Thermal Pad (40x80x0.2mm for GPUs & Laptops)', category: 'Chemical / Thermal', stock: 15, minThreshold: 5, unitCost: 14.00, supplier: 'DigiKey', location: 'Cabinet A - Bin 2' },
  { id: 'thm_05', sku: 'THM-UPS-U6-100', name: 'Upsiren U6 Pro High-Performance Thermal Putty (100g Tub)', category: 'Chemical / Thermal', stock: 7, minThreshold: 3, unitCost: 26.00, supplier: 'Mouser', location: 'Cabinet A - Bin 2' },
  { id: 'thm_06', sku: 'THM-GEL-PAD-05', name: 'Gelid Solutions GP-Ultimate Thermal Pad 0.5mm (90x50mm 15W/m-K)', category: 'Chemical / Thermal', stock: 10, minThreshold: 4, unitCost: 9.50, supplier: 'Amazon Business', location: 'Cabinet A - Bin 2' },
  { id: 'thm_07', sku: 'THM-GEL-PAD-10', name: 'Gelid Solutions GP-Ultimate Thermal Pad 1.0mm (90x50mm 15W/m-K)', category: 'Chemical / Thermal', stock: 12, minThreshold: 4, unitCost: 11.50, supplier: 'Amazon Business', location: 'Cabinet A - Bin 2' },
  { id: 'thm_08', sku: 'THM-GEL-PAD-15', name: 'Gelid Solutions GP-Ultimate Thermal Pad 1.5mm (90x50mm 15W/m-K)', category: 'Chemical / Thermal', stock: 14, minThreshold: 4, unitCost: 12.50, supplier: 'Amazon Business', location: 'Cabinet A - Bin 2' },
  { id: 'thm_09', sku: 'THM-GEL-PAD-20', name: 'Gelid Solutions GP-Ultimate Thermal Pad 2.0mm (90x50mm 15W/m-K)', category: 'Chemical / Thermal', stock: 11, minThreshold: 3, unitCost: 14.50, supplier: 'Amazon Business', location: 'Cabinet A - Bin 2' },
  { id: 'sld_01', sku: 'SLD-KEST-6337', name: 'Kester 44 Rosin Core 63/37 Leaded Solder Spool 0.8mm (1 lb Spool)', category: 'Chemical / Thermal', stock: 5, minThreshold: 2, unitCost: 42.00, supplier: 'Mouser', location: 'Cabinet B - Shelf 1' },
  { id: 'sld_02', sku: 'SLD-KEST-SAC305', name: 'Kester 245 Lead-Free SAC305 Solder Wire 0.5mm (No-Clean Core)', category: 'Chemical / Thermal', stock: 6, minThreshold: 2, unitCost: 48.00, supplier: 'Mouser', location: 'Cabinet B - Shelf 1' },
  { id: 'sld_03', sku: 'FLX-AMT-559', name: 'Amtech NC-559-V2-TF Tacky No-Clean Flux Syringe (10cc with Plunger & Tips)', category: 'Chemical / Thermal', stock: 12, minThreshold: 4, unitCost: 18.00, supplier: 'Mouser', location: 'Cabinet B - Shelf 1' },
  { id: 'sld_04', sku: 'SLD-CHIP-QUIK', name: 'Chip Quik SMD1 Low-Temp Bismuth Desoldering Alloy Kit with Paste Flux', category: 'Chemical / Thermal', stock: 8, minThreshold: 3, unitCost: 16.50, supplier: 'DigiKey', location: 'Cabinet B - Shelf 2' },
  { id: 'sld_05', sku: 'SLD-REL-UVMSK', name: 'Relife Green UV Curable Solder Mask PCB Repair Resin (10cc + 395nm UV Light)', category: 'Chemical / Thermal', stock: 9, minThreshold: 3, unitCost: 13.50, supplier: 'DigiKey', location: 'Cabinet B - Shelf 2' },
  { id: 'sld_06', sku: 'WRE-MEC-002', name: 'Mechanic 0.02mm Insulated Copper Jump Wire Spool (Micro-Soldering Traces)', category: 'Chemical / Thermal', stock: 10, minThreshold: 3, unitCost: 8.90, supplier: 'DigiKey', location: 'Cabinet B - Shelf 2' },
  { id: 'chm_01', sku: 'CHM-MG-IPA-99', name: 'MG Chemicals 99.9% Pure Isopropyl Alcohol (IPA) (1 Liter Bottle)', category: 'Chemical / Thermal', stock: 10, minThreshold: 4, unitCost: 15.00, supplier: 'Mouser', location: 'Flammables Cabinet' },
  { id: 'chm_02', sku: 'CHM-CAIG-D5', name: 'CAIG DeoxIT D5 Contact Cleaner & Rejuvenator Spray (5 oz Aerosol Can)', category: 'Chemical / Thermal', stock: 8, minThreshold: 3, unitCost: 19.99, supplier: 'Mouser', location: 'Flammables Cabinet' },
  { id: 'chm_03', sku: 'TAP-KAP-20MM', name: 'Kapton Polyimide High-Temp Heat Resistant Tape (20mm x 33m Roll)', category: 'Chemical / Thermal', stock: 11, minThreshold: 3, unitCost: 7.99, supplier: 'Amazon Business', location: 'Cabinet B - Shelf 3' },
  { id: 'chm_04', sku: 'WCK-GDT-25', name: 'Goot Wick Desoldering Braid with Rosin Flux (2.5mm x 1.5m Dispenser)', category: 'Chemical / Thermal', stock: 18, minThreshold: 6, unitCost: 4.80, supplier: 'DigiKey', location: 'Cabinet B - Shelf 3' },

  // =========================================================================
  // 10. Fasteners, Screws & Standoffs
  // =========================================================================
  { id: 'inv_05', sku: 'SCR-M2-KIT', name: 'M.2 NVMe SSD Standoff & Screw Assortment Kit (ASUS/MSI/Gigabyte 50pc)', category: 'Fasteners & Connectors', stock: 16, minThreshold: 5, unitCost: 9.99, supplier: 'Amazon Business', location: 'Drawer 4' },
  { id: 'scr_02', sku: 'SCR-PC-350PC', name: 'Complete PC Case Screw & Motherboard Standoff Kit (350pc Assorted)', category: 'Fasteners & Connectors', stock: 8, minThreshold: 3, unitCost: 14.50, supplier: 'Amazon Business', location: 'Drawer 4' },
  { id: 'scr_03', sku: 'SCR-HEX-BRASS', name: 'Brass Hex Motherboard Standoffs 6+6mm M3 Male-to-Female (100-Pack)', category: 'Fasteners & Connectors', stock: 12, minThreshold: 4, unitCost: 11.20, supplier: 'DigiKey', location: 'Drawer 4' },
  { id: 'scr_04', sku: 'BRK-GPU-SAG-ROD', name: 'Anodized Aluminum Telescopic GPU Anti-Sag Support Rod Bracket (Magnetic Base)', category: 'Fasteners & Connectors', stock: 15, minThreshold: 5, unitCost: 8.99, supplier: 'Amazon Business', location: 'Drawer 5' },
  { id: 'scr_05', sku: 'MNT-FAN-SILICONE', name: 'Silicone Rubber Fan Anti-Vibration Isolation Rivet Mounts (32-Pack)', category: 'Fasteners & Connectors', stock: 20, minThreshold: 6, unitCost: 7.50, supplier: 'Amazon Business', location: 'Drawer 5' },
  { id: 'scr_06', sku: 'KIT-AM4-BACKPLATE', name: 'Metal AM4/AM5 Motherboard CPU Cooler Backplate & Clip Replacement Set', category: 'Fasteners & Connectors', stock: 9, minThreshold: 3, unitCost: 6.99, supplier: 'Amazon Business', location: 'Drawer 5' },
  { id: 'scr_07', sku: 'TIE-VELCRO-100', name: 'Reusable Hook & Loop Microfiber Cable Ties Assorted 8" (100-Pack)', category: 'Fasteners & Connectors', stock: 25, minThreshold: 8, unitCost: 9.99, supplier: 'Amazon Business', location: 'Drawer 6' },

  // =========================================================================
  // 11. Batteries & Power Cells
  // =========================================================================
  { id: 'inv_02', sku: 'BAT-CR2032-PK', name: 'Sony / Murata CR2032 3V Lithium Coin Cells for Motherboard RTC (20-Pack)', category: 'Batteries', stock: 6, minThreshold: 6, unitCost: 12.00, supplier: 'DigiKey', location: 'Cabinet A - Bin 3' },
  { id: 'bat_02', sku: 'BAT-CR2032-2PIN', name: 'Wired CR2032 3V CMOS Battery with JST 1.25mm 2-Pin Molex (Laptop/Mini PC)', category: 'Batteries', stock: 14, minThreshold: 5, unitCost: 4.50, supplier: 'DigiKey', location: 'Cabinet A - Bin 3' },
  { id: 'bat_03', sku: 'BAT-CR2025-PK', name: 'Panasonic CR2025 3V Lithium Coin Cells (10-Pack)', category: 'Batteries', stock: 8, minThreshold: 3, unitCost: 8.50, supplier: 'DigiKey', location: 'Cabinet A - Bin 3' },
  { id: 'bat_04', sku: 'BAT-DELL-54WH', name: 'Dell 54Wh 4-Cell Laptop Battery (Type 4GVGH / 1WND8 for Latitude & XPS)', category: 'Batteries', stock: 4, minThreshold: 2, unitCost: 59.00, supplier: 'Direct OEM', location: 'Cabinet A - Bin 4' },
  { id: 'bat_05', sku: 'BAT-LEN-57WH', name: 'Lenovo 57Wh 3-Cell Internal Battery (Type 01AV424 for ThinkPad T480/T14)', category: 'Batteries', stock: 3, minThreshold: 2, unitCost: 65.00, supplier: 'Direct OEM', location: 'Cabinet A - Bin 4' },
  { id: 'bat_06', sku: 'BAT-HP-45WH', name: 'HP 3-Cell 45Wh Long Life Battery (Type CI03XL for ProBook 640 G2/G3)', category: 'Batteries', stock: 3, minThreshold: 2, unitCost: 52.00, supplier: 'Direct OEM', location: 'Cabinet A - Bin 4' },

  // =========================================================================
  // 12. Cabling, Power Harnesses & Networking Hardware
  // =========================================================================
  { id: 'cab_01', sku: 'CAB-MOD-12VHPWR', name: 'CableMod Pro ModMesh 12V-2x6 / 12VHPWR 16-Pin to 3x 8-Pin PCIe 600W Cable', category: 'Cabling & Networking', stock: 5, minThreshold: 2, unitCost: 29.90, supplier: 'Newegg', location: 'Cabling Rack 1' },
  { id: 'cab_02', sku: 'CAB-EXT-24PATX', name: 'FormulaMod 24-Pin ATX Main Power Sleeved Extension Cable 30cm (Carbon)', category: 'Cabling & Networking', stock: 8, minThreshold: 3, unitCost: 14.50, supplier: 'Amazon Business', location: 'Cabling Rack 1' },
  { id: 'cab_03', sku: 'CAB-EXT-8PEPS', name: 'FormulaMod Dual 8-Pin (4+4) EPS CPU Power Extension Cables (Pair)', category: 'Cabling & Networking', stock: 10, minThreshold: 3, unitCost: 12.00, supplier: 'Amazon Business', location: 'Cabling Rack 1' },
  { id: 'cab_04', sku: 'CAB-SATA3-10PK', name: 'SATA III 6Gbps Data Cables with Locking Latch (18" Straight & Right-Angle 10-Pack)', category: 'Cabling & Networking', stock: 15, minThreshold: 5, unitCost: 11.99, supplier: 'Amazon Business', location: 'Cabling Rack 2' },
  { id: 'cab_05', sku: 'CAB-SATA-Y-SPLIT', name: 'SATA 15-Pin Power Y-Splitter Cable (1 Male to 2 Female 8" 5-Pack)', category: 'Cabling & Networking', stock: 18, minThreshold: 5, unitCost: 8.50, supplier: 'Amazon Business', location: 'Cabling Rack 2' },
  { id: 'cab_06', sku: 'CAB-PWM-HUB-10', name: 'Thermalright 10-Port 4-Pin PWM Fan & ARGB Controller Hub (SATA Powered)', category: 'Cabling & Networking', stock: 7, minThreshold: 3, unitCost: 16.90, supplier: 'Amazon Business', location: 'Cabling Rack 2' },
  { id: 'cab_07', sku: 'CAB-MAT-DP21', name: 'Cable Matters DisplayPort 2.1 VESA Certified 80Gbps UHBR20 Cable (6ft)', category: 'Cabling & Networking', stock: 9, minThreshold: 3, unitCost: 21.99, supplier: 'Amazon Business', location: 'Cabinet C - Bin 1' },
  { id: 'cab_08', sku: 'CAB-MAT-HDMI21', name: 'Cable Matters Certified 48Gbps Ultra High Speed HDMI 2.1 Cable 8K60/4K120 (6ft)', category: 'Cabling & Networking', stock: 14, minThreshold: 4, unitCost: 14.99, supplier: 'Amazon Business', location: 'Cabinet C - Bin 1' },
  { id: 'cab_09', sku: 'CAB-TB4-240W', name: 'Cable Matters USB4 / Thunderbolt 4 40Gbps 240W EPR USB-C Braided Cable (1m)', category: 'Cabling & Networking', stock: 8, minThreshold: 3, unitCost: 24.99, supplier: 'Amazon Business', location: 'Cabinet C - Bin 1' },
  { id: 'cab_10', sku: 'CAB-CAT6-100', name: 'Cat6 RJ45 Unshielded Modular Plugs with Strain Relief Boots (100-Pack)', category: 'Cabling & Networking', stock: 35, minThreshold: 10, unitCost: 14.50, supplier: 'DigiKey', location: 'Cabinet C - Bin 2' },
  { id: 'cab_11', sku: 'CAB-MONO-CAT6A', name: 'Monoprice SlimRun Cat6A 10G Ethernet Patch Cables 5ft (10-Pack Blue)', category: 'Cabling & Networking', stock: 18, minThreshold: 5, unitCost: 24.00, supplier: 'Amazon Business', location: 'Cabinet C - Bin 2' },
  { id: 'net_01', sku: 'NIC-INT-I226V', name: 'Intel I226-V PCIe 2.5 Gigabit Ethernet Network Interface Card', category: 'Cabling & Networking', stock: 7, minThreshold: 3, unitCost: 29.00, supplier: 'Newegg', location: 'Networking Drawer' },
  { id: 'net_02', sku: 'NIC-INT-X550T2', name: 'Intel X550-T2 Dual-Port 10GBASE-T Copper RJ45 PCIe 3.0 x4 Server NIC', category: 'Cabling & Networking', stock: 3, minThreshold: 1, unitCost: 189.00, supplier: 'Newegg', location: 'Server Locker 3' },
  { id: 'net_03', sku: 'NIC-MLX-CX4-25G', name: 'Mellanox ConnectX-4 Lx Dual-Port 25GbE SFP28 PCIe Adapter', category: 'Cabling & Networking', stock: 4, minThreshold: 2, unitCost: 115.00, supplier: 'Mouser', location: 'Server Locker 3' },
  { id: 'net_04', sku: 'TRN-10G-RJ45', name: '10GBASE-T SFP+ to RJ45 Copper Transceiver Module (30m Cat6a Range)', category: 'Cabling & Networking', stock: 8, minThreshold: 3, unitCost: 39.00, supplier: 'Amazon Business', location: 'Networking Drawer' },
  { id: 'net_05', sku: 'TRN-10G-SR-MM', name: '10GBASE-SR SFP+ 850nm Multi-Mode Fiber Optical Transceiver (300m LC)', category: 'Cabling & Networking', stock: 10, minThreshold: 4, unitCost: 19.50, supplier: 'Amazon Business', location: 'Networking Drawer' },
  { id: 'net_06', sku: 'CAB-10G-DAC-2M', name: '10G SFP+ Passive Direct Attach Copper (DAC) Twinax Cable (2-Meter)', category: 'Cabling & Networking', stock: 6, minThreshold: 2, unitCost: 16.00, supplier: 'Amazon Business', location: 'Networking Drawer' },
  { id: 'net_07', sku: 'WIFI-INT-BE200', name: 'Intel Wi-Fi 7 BE200 M.2 2230 Desktop Kit with Magnetic Antennas (320MHz)', category: 'Cabling & Networking', stock: 8, minThreshold: 3, unitCost: 38.00, supplier: 'Amazon Business', location: 'Networking Drawer' },
  { id: 'net_08', sku: 'PPN-CAT6-24PORT', name: '1U 24-Port Cat6 Unshielded 110-Punch Down Keystone Patch Panel (19" Rack)', category: 'Cabling & Networking', stock: 4, minThreshold: 2, unitCost: 34.00, supplier: 'Amazon Business', location: 'Network Rack Shelf' },

  // =========================================================================
  // 13. Diagnostics, Programmers & Bench Test Instruments
  // =========================================================================
  { id: 'diag_01', sku: 'TOOL-POST-4DIG', name: 'KingKong 4-Digit PCIe/LPC Diagnostic Motherboard POST Code Card', category: 'Diagnostics & Bench Tools', stock: 6, minThreshold: 2, unitCost: 28.50, supplier: 'Amazon Business', location: 'Bench Equipment Area' },
  { id: 'diag_02', sku: 'TOOL-RAM-TEST-D5', name: 'DDR5 & DDR4 RAM Slot LED Diagnostic Tester Card with CR2032 Socket', category: 'Diagnostics & Bench Tools', stock: 5, minThreshold: 2, unitCost: 34.00, supplier: 'DigiKey', location: 'Bench Equipment Area' },
  { id: 'diag_03', sku: 'TOOL-PSU-LCD', name: 'Digital 24-Pin ATX Power Supply Tester with Backlit LCD Voltage Readout', category: 'Diagnostics & Bench Tools', stock: 8, minThreshold: 3, unitCost: 17.99, supplier: 'Amazon Business', location: 'Bench Equipment Area' },
  { id: 'diag_04', sku: 'TOOL-SPI-CH341A', name: 'CH341A Pro USB BIOS Flash EEPROM Programmer Kit with SOIC8 Clip & 1.8V Adapter', category: 'Diagnostics & Bench Tools', stock: 6, minThreshold: 2, unitCost: 18.50, supplier: 'Amazon Business', location: 'Bench Equipment Area' },
  { id: 'diag_05', sku: 'TOOL-USB-KM003C', name: 'ChargerLAB Power-Z KM003C Portable USB-C Digital Power Analyzer (50V 6A)', category: 'Diagnostics & Bench Tools', stock: 3, minThreshold: 1, unitCost: 99.00, supplier: 'Amazon Business', location: 'Bench Equipment Area' },
  { id: 'diag_06', sku: 'TOOL-LOGIC-8CH', name: 'USB 8-Channel 24MHz Logic Analyzer with Micro-Hook Probes (Saleae Compatible)', category: 'Diagnostics & Bench Tools', stock: 7, minThreshold: 2, unitCost: 14.50, supplier: 'DigiKey', location: 'Bench Equipment Area' },
  { id: 'diag_07', sku: 'TOOL-CPU-DUMMY', name: 'LGA1700 & AM5 Socket Pin Alignment & Short-Circuit LED Tester Plate', category: 'Diagnostics & Bench Tools', stock: 4, minThreshold: 2, unitCost: 45.00, supplier: 'Mouser', location: 'Bench Equipment Area' },
  { id: 'diag_08', sku: 'TOOL-TDR-SCOUT3', name: 'Klein Tools Scout Pro 3 VDV501-851 Voice/Data/Video Cable Tester & Tone Generator', category: 'Diagnostics & Bench Tools', stock: 3, minThreshold: 1, unitCost: 129.00, supplier: 'Amazon Business', location: 'Bench Equipment Area' },
];

export interface KanbanTicket {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'Critical';
  stage: 'Pending Triage' | 'In Progress' | 'QA & Completed';
  assignedStudent: string;
  deviceType: string;
  reportedFault: string;
  elapsedHours: number;
}

export const INITIAL_KANBAN_TICKETS: KanbanTicket[] = [
  { id: 'TKT-101', title: 'Dell OptiPlex 7090 Amber LED 2-3', priority: 'Critical', stage: 'In Progress', assignedStudent: 'Sarah Jenkins', deviceType: 'Desktop Tower', reportedFault: 'System blinks 2 amber, 3 white. Memory training failure.', elapsedHours: 1.2 },
  { id: 'TKT-102', title: 'ThinkPad T14 Gen 3 Liquid Contact', priority: 'Critical', stage: 'In Progress', assignedStudent: 'David Kim', deviceType: 'Laptop', reportedFault: 'Coffee spillage across keyboard. Red LCI tripped near PU401.', elapsedHours: 2.5 },
  { id: 'TKT-103', title: 'Cat6 Patch Panel Termination Run', priority: 'Medium', stage: 'Pending Triage', assignedStudent: 'Tyler Smith', deviceType: 'Network Infrastructure', reportedFault: 'Terminate 12 drops to CCNA rack patch panel B with T568B.', elapsedHours: 0.5 },
  { id: 'TKT-104', title: 'Corsair RM850x Voltage Rail Variance', priority: 'Low', stage: 'Pending Triage', assignedStudent: 'Marcus Brody', deviceType: 'Power Supply', reportedFault: '+12V rail reads +11.35V under 400W load tester.', elapsedHours: 0.1 },
  { id: 'TKT-105', title: 'Cisco 2960-X PoE Port 1-8 Flapping', priority: 'Medium', stage: 'QA & Completed', assignedStudent: 'Jordan Taylor', deviceType: 'Managed Switch', reportedFault: 'PoE power inline denied. Upgraded firmware; passing 15.4W test.', elapsedHours: 3.1 },
  { id: 'TKT-106', title: 'RTX 4080 VRAM Junction 105°C Hotspot', priority: 'Critical', stage: 'In Progress', assignedStudent: 'Lucas Wright', deviceType: 'Graphics Card', reportedFault: 'GDDR6X throttling at 105°C; replacing degraded 1.5mm thermal pads with Gelid GP-Ultimate.', elapsedHours: 1.8 },
  { id: 'TKT-107', title: 'AMD Ryzen 7 7800X3D Bent Socket Pin AM5', priority: 'Critical', stage: 'Pending Triage', assignedStudent: 'Alex Chen', deviceType: 'Motherboard', reportedFault: 'Pin AJ32 (DDR5 Channel B Data) bent 45 degrees. Requires microscope alignment.', elapsedHours: 0.8 },
  { id: 'TKT-108', title: 'Crucial T705 PCIe 5.0 Thermal Throttling', priority: 'Medium', stage: 'Pending Triage', assignedStudent: 'Chloe Bennett', deviceType: 'Storage NVMe', reportedFault: 'NVMe thermal throttling to 3,000 MB/s under sustained writes. Needs active M.2 heatsink airflow.', elapsedHours: 0.3 },
];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'Processors (CPUs)',
  'Graphics Cards (GPUs)',
  'Motherboards',
  'Memory (RAM)',
  'Storage (SSD / HDD)',
  'Power Supplies (PSUs)',
  'Cooling & Fans',
  'Cases & Chassis',
  'Chemical / Thermal',
  'Fasteners & Connectors',
  'Batteries',
  'Cabling & Networking',
  'Diagnostics & Bench Tools',
];
