export type UserRole = 'ROLE_OWNER' | 'ROLE_WORKER' | 'ROLE_STUDENT';

export type LabJobRole =
  | 'team_safety_manager'
  | 'foreman'
  | 'ambassador'
  | 'environment_manager'
  | 'asset_manager'
  | 'clock_in_manager'
  | 'cart_management'
  | 'quality_assurance'
  | 'teacher'
  | 'jobless';

export type ThemeMode = 'dark_industrial' | 'high_contrast_light';

export interface User {
  id: string;
  username: string;
  passwordHash?: string; // Stored in internal registry
  role: UserRole;
  displayName: string;
  createdAt: string;
  benchStation?: string;
  clockedIn?: boolean;
  clockInTime?: string;
  currentTask?: string;
  assignedJobs?: LabJobRole[];
  isTeacher?: boolean;
}

export interface DiagnosticOption {
  text: string;
  nextNodeId: string;
  badge?: string;
  danger?: boolean;
}

export interface DiagnosticNode {
  id: string;
  question: string;
  details?: string;
  compTiaTip?: string;
  options: DiagnosticOption[];
  isFinal?: boolean;
  solution?: DiagnosticSolution;
}

export interface DiagnosticSolution {
  title: string;
  confidence: 'High' | 'Moderate' | 'Critical';
  probableRootCause: string;
  comptiaTools: string[];
  actionSteps: string[];
  safetyWarnings?: string[];
  voltageOrSpecCheck?: string;
  recommendedPartType?: string;
}

export interface DiagnosticCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  faultFrequency: 'Very Common' | 'Common' | 'Critical' | 'Intermittent';
  rootNodeId: string;
  nodes: Record<string, DiagnosticNode>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  attachedImage?: string; // base64 thumbnail
  contextInjected?: boolean;
}

export type LabDayStatus = 'completed' | 'in_progress' | 'issue_hold';

export interface DailyActivityLog {
  id: string;
  dateString: string; // YYYY-MM-DD
  status: LabDayStatus;
  topicsCovered: string;
  benchRepairsPerformed: string;
  partsUsedOrOrdered: string;
  specialNotesAndSafety: string;
  updatedAt: string;
}

export type ProjectPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type ProjectStage = 'Intake' | 'Diagnostics' | 'Waiting on Parts' | 'Repair in Progress' | 'Burn-in Testing' | 'Completed';

export interface ProjectWorkOrder {
  id: string;
  title: string;
  benchNumber: string;
  technicianName: string;
  clientOrDepartment: string;
  deviceType: string;
  reportedFault: string;
  priority: ProjectPriority;
  stage: ProjectStage;
  status: 'ongoing' | 'archived';
  dateCreated: string;
  dateCompleted?: string;
  repairOutcomeNotes?: string;
  partsReplaced?: string[];
  estimatedCost?: number;
}

export interface PSUPinInfo {
  pin: number;
  label: string;
  colorName: string;
  colorHex: string;
  voltage: string;
  description: string;
  tolerance: string;
}

export interface MotherboardBeepCode {
  id: string;
  vendor: 'AMI' | 'Award' | 'Phoenix' | 'Dell' | 'HP';
  sequence: string;
  audioPattern: string; // e.g. "● ● ●  ▬ ▬"
  meaning: string;
  recommendedAction: string;
  compTiaRef: string;
}

export interface CommandCheatItem {
  id: string;
  os: 'Windows' | 'Linux';
  command: string;
  category: 'Disk & File System' | 'Network' | 'Hardware & BIOS' | 'System Repair & Integrity' | 'Diagnostics';
  description: string;
  sampleOutput?: string;
  elevationRequired: boolean;
}

export interface ComponentPowerSpec {
  name: string;
  baseTdp: number;
}

export interface AssetRepairLog {
  id: string;
  date: string;
  technician: string;
  faultReported: string;
  diagnosis: string;
  actionsTaken: string;
  partsReplaced: string[];
  cost?: number;
  status: 'Resolved' | 'Parts Ordered' | 'Bench Testing' | 'Under Inspection';
}

export interface AssetProblemLabel {
  hasProblem: boolean;
  problemTitle?: string;
  problemSeverity?: 'Critical' | 'Major' | 'Minor' | 'Diagnosing';
  problemDescription?: string;
  reportedDate?: string;
  reportedBy?: string;
}

export interface AssetQaChecklist {
  physicalCasingClean: boolean;
  thermalPasteAndCoolers: boolean;
  cableManagementTied: boolean;
  allPortsFunctional: boolean;
  ramAndStorageTested: boolean;
  postAndBiosClean: boolean;
  osAndDriversInstalled: boolean;
  esdSafetyChecked: boolean;
  stressBenchmarkPassed: boolean;
  assetTagAffixed: boolean;
}

export interface AssetQaReview {
  status: 'Passed' | 'Needs Rework' | 'Pending Inspection';
  inspectedBy: string;
  inspectedAt: string;
  checklist: AssetQaChecklist;
  notes?: string;
  sealId: string;
}

export type AssetKanbanStage = 'intake' | 'triage' | 'repair' | 'qa_pending' | 'deployed';

export interface HardwareAsset {
  id: string; // Document ID (usually assetTag, e.g., "AST-DELL-7090")
  assetTag: string; // e.g. "AST-DELL-7090"
  serialNumber: string;
  model: string;
  deviceType: 'Desktop Tower' | 'Laptop' | 'Managed Switch' | 'Server' | 'Power Supply' | 'Bench Equipment' | 'Custom Rig';
  assignedBench: string;
  department: string;
  status: 'In Service' | 'Under Repair' | 'Decommissioned' | 'Bench Testing' | 'Spare Inventory';
  kanbanStage?: AssetKanbanStage; // Visual Kanban workflow stage
  isCurrentlyOnHand?: boolean; // Physical presence tracking: true if currently in lab / on bench
  problemLabel?: AssetProblemLabel; // Problem marker and diagnostic symptom label
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
    motherboard?: string;
    psu?: string;
    os?: string;
    macAddress?: string;
    ipAddress?: string;
    firmwareVersion?: string;
  };
  qaReview?: AssetQaReview;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  repairHistory: AssetRepairLog[];
  createdAt: string;
  updatedAt: string;
  authorUid?: string;
}

export type TimeClockTaskCategory =
  | 'Diagnostics & Triage'
  | 'SMD Rework & Soldering'
  | 'Thermal Repasting & Assembly'
  | 'OS Deployment & Drivers'
  | 'Network Cabling & Switches'
  | 'Laptop Teardown & Battery'
  | 'Lab Supervision & Safety'
  | 'General Bench Work';

export interface RepairTaskPreset {
  id: string;
  label: string;
  category: TimeClockTaskCategory;
  description: string;
  partsHint?: string[];
  estimatedMinutes?: number;
}

export interface TimeClockEntry {
  id: string;
  userId: string;
  technicianName: string;
  userRole: UserRole;
  benchStation: string;
  clockIn: string; // ISO string
  clockOut?: string; // ISO string
  durationMinutes: number; // Net active work time in minutes
  grossDurationMinutes?: number; // Total shift duration (net work + break)
  breakMinutes?: number; // Total cumulative break / paused minutes
  isPaused?: boolean; // True if currently on break
  breakStartTime?: string; // ISO string of when active break started
  photoUrls?: string[]; // Visual work proof images / photos taken today
  taskCategory: TimeClockTaskCategory;
  workAccomplishments: string; // What was performed during the shift
  partsReplacedOrUsed?: string[];
  status: 'active' | 'completed';
  date: string; // YYYY-MM-DD
}

// --- COMLAB STATUS & AERIAL ROOM TYPES ---

export type ComLabStatusLevel =
  | 'green'           // Solid green: working fine, powered on, live heartbeat (< 3s)
  | 'blinking_green'  // Blinking green: previously healthy, now powered off / disconnected
  | 'orange'          // Solid orange: maintenance / attention
  | 'blinking_orange' // Blinking orange: bootable with non-fatal errors / warnings
  | 'blinking_red'    // Blinking red: bad recoverable error
  | 'red'             // Solid red: critical / fatal failure ("PC is FUCKED!")
  | 'unconfigured';   // Solid gray: never connected / no signal

export type ComLabPowerState = 'powered_on' | 'standby' | 'powered_off' | 'no_power_cable' | 'unplugged';

export interface ComLabHardwareComponents {
  hasParts: boolean; // false for C4 (ZERO parts inside)
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  motherboard?: string;
  powerSupply?: string;
  cpuCooler?: string;
  display?: string;
  missingPartsDescription?: string;
}

export interface ComLabDiskTelemetry {
  name: string;
  model?: string;
  sizeGb: number;
  freeGb: number;
  tempCelsius?: number;
  readSpeedMb?: number;
  writeSpeedMb?: number;
  smartHealth: 'Healthy' | 'Warning' | 'Critical';
}

export interface ComLabTelemetryData {
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;
  os?: string;
  kernel?: string;
  uptimeSeconds?: number;
  cpuModel?: string;
  cpuCores?: number;
  cpuThreads?: number;
  cpuClockMhz?: number;
  cpuTempCelsius?: number;
  coreTempsCelsius?: number[];
  cpuUsagePercent?: number;
  cpuVoltage?: number;
  isThrottling?: boolean;
  ramTotalMb?: number;
  ramUsedMb?: number;
  ramUsagePercent?: number;
  ramSpeedMhz?: number;
  ramSlotsUsed?: string;
  gpuModel?: string;
  gpuTempCelsius?: number;
  gpuUsagePercent?: number;
  gpuVramUsedMb?: number;
  gpuVramTotalMb?: number;
  gpuFanPercent?: number;
  disks?: ComLabDiskTelemetry[];
  network?: {
    linkSpeedMbps?: number;
    rxBytesSec?: number;
    txBytesSec?: number;
    gateway?: string;
    dns?: string;
  };
  motherboard?: {
    manufacturer?: string;
    model?: string;
    biosVersion?: string;
    biosDate?: string;
  };
  errorCode?: string;
  errorName?: string;
  errorDescription?: string;
  errorSeverity?: 'info' | 'warning' | 'error' | 'fatal';
  diskHealth?: 'Healthy' | 'Warning' | 'Failing' | 'Missing';
  lastPing?: string;
  agentVersion?: string;
  agentOnline?: boolean;
}

export interface ComLabTelemetryPayload {
  pc_id: string; // "C4" or "pc_C_4"
  status: 'BLINKING_RED' | 'RED' | 'ORANGE' | 'GREEN' | 'BLANK' | 'UNCONFIGURED';
  power_connected: boolean;
  ethernet_connected?: boolean;
  hardware_detected: {
    cpu?: string | null;
    ram_gb?: number;
    storage_count?: number;
    gpu?: string | null;
    motherboard?: string | null;
    power_supply?: string | null;
    cpu_cooler?: string | null;
  };
  alert_message?: string;
  notes?: string;
}

export interface ComLabWorkstation {
  id: string; // e.g. "pc_A_1", "pc_C_4"
  rowId: string; // "A", "B", "C", "D"
  rowLabel: string; // "Row A"
  slotNumber: number; // 1, 2, 3, 4 (numbered right-to-left: 1 on right, 4 on left)
  displayName: string; // "PC C4"
  statusLevel: ComLabStatusLevel; // 'red' (blinking), 'orange', 'green', 'unconfigured'
  powerState: ComLabPowerState;
  ethernetConnected?: boolean;
  isConfigured: boolean; // True once edited/inspected; false if untouched
  components: ComLabHardwareComponents;
  notes: string;
  issueDescription?: string;
  assignedTechnician?: string;
  lastInspected?: string;
  lastUpdated: string;
  updatedBy: string;
  telemetry?: ComLabTelemetryData;
}

export interface ComLabRowConfig {
  rowId: string; // "A", "B", "C", "D"
  label: string; // "Row A"
  slotsCount: number; // Total slot positions in the row
  activeSlots: number[]; // Slot indices containing actual PCs e.g. [1, 2, 3] for Row A
  benchNotes?: string;
}

export interface ComLabLayoutConfig {
  id: string;
  labName: string;
  direction: 'right_to_left'; // Numbering direction right to left
  rows: ComLabRowConfig[];
  updatedAt: string;
  updatedBy: string;
}

// --- TOOLS, SUPPLIES & EQUIPMENT INVENTORY TYPES ---

export type LabItemType = 'tool' | 'supply' | 'equipment';
export type LabItemStatus = 'available' | 'checked_out' | 'maintenance' | 'depleted';
export type ToolCondition = 'new' | 'good' | 'fair' | 'damaged' | 'missing_parts';

export interface ToolCheckoutRecord {
  userId: string;
  userName: string;
  benchStation: string;
  checkedOutAt: string; // ISO string
  expectedReturn?: string; // ISO date/time
  taskNotes?: string;
}

export interface LabInventoryItem {
  id: string;
  name: string;
  itemType: LabItemType;
  category: string; // e.g. "Soldering", "Meters", "Hand Tools", "Power Tools", "ESD Safety", "Chemicals/Solvents", "Cables & Adapters", "Consumables"
  skuOrTag?: string; // e.g. "TL-FLK-87V", "SUP-MX4-4G"
  brand?: string;
  model?: string;
  serialNumber?: string;
  
  // Physical lab location tracking (Supports blank/unassigned)
  locationId?: string; // e.g. "loc_tool_chest_b" or undefined / empty
  locationName?: string; // e.g. "Tool Chest B - Drawer 2" or "Unassigned"
  
  status: LabItemStatus;
  condition: ToolCondition;
  checkedOutBy?: ToolCheckoutRecord;
  
  // Consumable quantity tracking
  quantityOnHand?: number;
  unitOfMeasure?: string; // "tubes", "spools", "bottles", "packs", "units"
  minReorderLevel?: number;
  
  purchaseDate?: string;
  cost?: number;
  notes?: string;
  barcode?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// --- CUSTOM PHYSICAL LAB LOCATIONS ---

export type LabZoneType =
  | 'tool_storage'
  | 'bench_area'
  | 'mobile_cart'
  | 'secure_cabinet'
  | 'clean_room'
  | 'chemical_locker'
  | 'staging_shelf';

export interface LabLocation {
  id: string;
  name: string; // e.g. "Tool Chest A - Top Drawer", "Solder Bench 1", "Clean Room Shelf"
  zoneType: LabZoneType;
  description?: string;
  itemCount?: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

// --- QUALITY ENSURER OUTBOUND CERTIFICATION ---

export interface QualityChecksRubric {
  // 1. Electrical & Safety Integrity
  powerSupplyGroundVerified: boolean;
  cablesInsulatedNoExposedWire: boolean;
  powerRailVoltagesNormal: boolean;
  esdGroundingDischarged: boolean;
  
  // 2. Hardware Stability & Burn-In
  cpuThermalsUnderLoadPass: boolean;
  maxCpuTempCelsius: number;
  ramMemtestStable: boolean;
  storageSmartHealthClean: boolean;
  gpuStabilityTestPass: boolean;
  coolingFansSpinFreely: boolean;
  
  // 3. Clean OS & Driver Validation
  cleanOsInstalledAndActivated: boolean;
  allDriversFunctionalNoUnknown: boolean;
  benchProfilesRemoved: boolean;
  biosFirmwareUpdated: boolean;
  antivirusEnabledAndUpdated: boolean;
  
  // 4. Physical Detailing & Sanitation
  chassisCleanedAndSanitized: boolean;
  screenSpotlessNoFingerprints: boolean;
  portsDustFree: boolean;
  accessoriesAndPowerLeadBagged: boolean;
}

export interface QualityInspection {
  id: string;
  certificateNumber: string; // e.g. "TT-QA-2026-0814"
  workOrderId?: string;
  assetTag?: string;
  deviceModel: string;
  serialNumber?: string;
  deviceType: 'Desktop Tower' | 'Laptop' | 'Server' | 'All-in-One' | 'Custom Rig';
  clientOrRecipient: string;
  technicianName: string;
  inspectorName: string;
  inspectionDate: string; // ISO date
  
  checks: QualityChecksRubric;
  
  overallStatus: 'passed' | 'rework_required' | 'rejected';
  inspectorNotes?: string;
  benchVoltagesRecorded?: string; // e.g. "+12.1V, +5.05V, +3.32V"
  approvedForOutboundRelease: boolean;
  certificateHash?: string;
  createdAt: string;
  updatedAt: string;
}


