/**
 * Enterprise Shop Floor, Lab Management & Bench Operations Database
 * Powers 16 Bench Stations, Tool Loans, Massive PC Hardware Parts Catalog, and Work Order Kanban
 * Contains comprehensive PC hardware catalog across CPUs, GPUs, Motherboards,
 * RAM, NVMe/SATA Storage, PSUs, Coolers, Chassis, Cabling, Chemicals, Diagnostics & Bench Test Tools.
 */

import pcHardwareCatalogJson from './pcHardwareCatalog.json';

export interface BenchStation {
  id: string; // e.g. "b01"
  number: string; // "Bench 01"
  status: 'Open/Available' | 'Active Triage' | 'Awaiting Parts' | 'QA Testing' | 'Out of Service';
  assignedStudent: string;
  activeDevice: string;
  workOrderId: string;
  elapsedMinutes: number;
  esdGroundCertified: boolean;
  notes: string;
}

/**
 * 16 Bench Stations - All start clean & open by default.
 * Saves dynamically to state and storage when the technician assigns repairs.
 */
export const INITIAL_16_BENCH_STATIONS: BenchStation[] = Array.from({ length: 16 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  return {
    id: `b${num}`,
    number: `Bench ${num}`,
    status: 'Open/Available',
    assignedStudent: '',
    activeDevice: '',
    workOrderId: '',
    elapsedMinutes: 0,
    esdGroundCertified: true,
    notes: '',
  };
});

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

export const INITIAL_TOOL_LOANS: ToolLoanItem[] = [];

export interface KanbanTicket {
  id: string;
  title: string;
  assignedStudent: string;
  device: string;
  reportedFault: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  stage: 'Pending Triage' | 'In Progress' | 'QA & Completed';
  dateCreated?: string;
  notes?: string;
}

export const INITIAL_KANBAN_TICKETS: KanbanTicket[] = [];

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
  storageCapacity?: string; // e.g. '2TB NVMe', '64GB (2x32GB)', '24GB VRAM', '16TB HDD'
  notes?: string;
}

/**
 * Comprehensive JSON-based PC Hardware Components Catalog
 */
export const INITIAL_PARTS_INVENTORY: InventoryItem[] = pcHardwareCatalogJson as InventoryItem[];
