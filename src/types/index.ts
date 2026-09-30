export type UserRole = 'ROLE_OWNER' | 'ROLE_STUDENT';

export interface User {
  id: string;
  username: string;
  passwordHash?: string; // Stored in internal registry
  role: UserRole;
  displayName: string;
  createdAt: string;
  benchStation?: string;
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
