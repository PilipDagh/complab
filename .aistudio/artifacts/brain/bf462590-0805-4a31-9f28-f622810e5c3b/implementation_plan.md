# Time Clock Quick-Add Presets, Break Toggle & Shift Photo Proof System

Enhances the Vocational Lab Time Clock with quick-add repair presets, live break pause tracking with split work/break timesheet accounting, and camera/file photo uploads for visual shift proof.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions synthesize user responses from Phase 1 alongside the new photo upload capability:

- **Confirmed: Quick-Add Task UI**: Interactive chips organized by task categories (Diagnostics, Hardware Rework, Thermal/Assembly, Software/OS, Networking) that immediately fill or append to the task description and category selector with 1 click.
- **Confirmed: Break Accounting**: Shows both gross shift duration, paused break time, and net active repair hours side-by-side in active timer tickers, clock-out modals, timesheet ledgers, and CSV exports.
- **New: Shift Photo Proof**: Camera snapshot & file attachment support allowing technicians to attach before/after repair photos directly when clocking out, logging retroactive shifts, or updating active tasks.

---

## 1. Overview & Core Concept

### What It Does
- **Repair Task Quick-Add**: Preset repair templates (e.g. *Screen Replacement*, *Thermal Paste Re-application*, *Software Reimage*, *SMD Capacitor Rework*, *VLAN Port Config*, *Battery Health Calibration*) with single-click autofill to eliminate repetitive typing on technician workstations.
- **Break Toggle & Pause Timer**: A prominent "Take Break" / "Resume Work" toggle that freezes active work accumulation, runs a dedicated amber break timer, and logs total break duration for restorative and unpaid pause tracking.
- **Visual Work Proof & Photo Upload**: Technicians can snap a photo using their device camera or select image files (with local base64/URL compression and Firestore payload compatibility) to attach visual evidence of completed diagnostics and board fixes.

### Target Audience
- Vocational computer technicians, bench workers, and lab instructors (Julian and team) needing fast documentation and verifiable vocational repair proof.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LIVE TIME CLOCK FLOW                            │
└────────────────────────────────────────────────────────────────────────┘

 [Clock In] ────────► [Quick-Add Task Chips] ────────► [Active Work Ticker]
                             │                                 │
                             ▼                                 ▼
                    [Auto-fills Category]              [Toggle "Take Break"]
                    [Appends Description]                      │
                                                               ▼
                                                      [Amber Break Ticker]
                                                      [Work Timer Paused]
                                                               │
                                                               ▼
                                                      [Resume Shift Work]
                                                               │
                                                               ▼
                                                      [Clock Out Modal]
                                                               │
                                                               ▼
                                                      [Attach Shift Photos]
                                                      [Camera / Upload]
                                                               │
                                                               ▼
                                                      [Timesheet Ledger]
                                                      (Net Work / Break / Photos)
```

### Visual Identity & Theme
- **Theme Palette**: Deep dark workspace background (`#0d1117`, `#161b22`, border `#30363d`).
- **Active Work State**: Emerald glow (`text-emerald-400`, `border-emerald-500/40`) representing active production hours.
- **Break State**: Warm amber beacon (`text-amber-400`, `bg-amber-950/40`, `border-amber-500/50`) with an animated coffee/pause indicator clearly signalling work time is halted.
- **Quick-Add Chips**: Clean segmented chips with subtle borders (`bg-[#161b22] hover:bg-[#21262d] text-cyan-300 border-[#30363d]`), organized by Category (e.g., Motherboard & Soldering, Laptop & Screen, OS & Software).
- **Photo Gallery**: Compact square thumbnail cards with hover zoom preview, camera trigger, file dropzone, and a full-size modal lightbox viewer.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Time Metric vs. Subtraction**
  - *Chosen Approach*: Record `durationMinutes` (gross elapsed), `breakMinutes` (paused break duration), and `netWorkMinutes` (`durationMinutes - breakMinutes`). Display both clearly in the timesheet and CSV export.
  - *Why*: Meets educational accreditation and labor requirements where instructors need to see both total lab bench presence and actual wrench/soldering bench time.
- **Decision 2: Image Storage Strategy**
  - *Chosen Approach*: Client-side FileReader encoding with image canvas downscaling (max 1280px width, JPEG 0.82 quality) stored in state and Firestore document array.
  - *Why*: Allows instantaneous offline-capable previews, zero external blob storage latency, and easy export within the unified Firestore data structure.
- **Decision 3: Quick-Add Chip Behavior**
  - *Chosen Approach*: Clicking a preset pre-selects the associated task category and intelligently populates the description (either replacing empty inputs or appending if text already exists).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     STATE & COMPONENT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   AppContext.tsx                                                        │
│   ├── timeClockEntries: TimeClockEntry[]                                │
│   │   ├── id, userId, technicianName, benchStation                      │
│   │   ├── clockIn, clockOut, status                                     │
│   │   ├── durationMinutes, breakMinutes, isPaused, breakStartTime       │
│   │   ├── taskCategory, workAccomplishments                             │
│   │   └── photoUrls?: string[] (Captured / uploaded repair photos)      │
│   ├── toggleBreak(userId: string)                                       │
│   ├── clockInTechnician(...)                                            │
│   ├── clockOutTechnician(userId, accomplishments, photos)               │
│   └── addManualTimeLog(...)                                             │
│                                                                         │
│   TechnicianTimeClockSuite.tsx                                          │
│   ├── [Punch Clock & Timer Subtab]                                      │
│   │   ├── QuickAddTaskChips (Preset repair categories & suggestions)    │
│   │   ├── Dual Live Tickers (Active Work vs Break Duration)             │
│   │   ├── Break Toggle Button (Take Break / Resume Shift)               │
│   │   └── Clock-Out Modal with Accomplishments & Photo Attachment       │
│   ├── [Manual Entry Subtab]                                             │
│   │   ├── QuickAddTaskChips for fast retroactive fill                   │
│   │   ├── Work Hours + Break Hours breakdown fields                     │
│   │   └── Photo uploader with preview strip                             │
│   └── [Timesheets Subtab & Admin Floor]                                 │
│       ├── Split Columns: Work Time / Break Time                         │
│       ├── Photo thumbnail strip with full-screen Modal Lightbox         │
│       └── CSV export with Break Minutes & Photo Counts                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model Updates in `src/types/index.ts`
```ts
export interface TimeClockEntry {
  id: string;
  userId: string;
  technicianName: string;
  userRole: UserRole;
  benchStation: string;
  clockIn: string; // ISO string
  clockOut?: string; // ISO string
  durationMinutes: number; // Gross total minutes
  breakMinutes?: number; // Total pause/break minutes
  isPaused?: boolean; // Currently on break
  breakStartTime?: string; // ISO string of when current pause started
  taskCategory: TimeClockTaskCategory;
  workAccomplishments: string;
  partsReplacedOrUsed?: string[];
  photoUrls?: string[]; // Base64 data URLs or storage links
  status: 'active' | 'completed';
  date: string;
}
```
