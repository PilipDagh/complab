# ComLab Status Aerial Laboratory Map & Hardware Monitoring Suite

A top-down aerial digital twin of the trade school computer laboratory ("ComLab") providing real-time hardware status oversight, blinking LED alert states (Critical Blinking Red, Warning Orange, Nominal Green, and Unconfigured Blank), interactive status editing for technicians and instructors, and an Owner-exclusive interactive layout editor with Firestore cloud synchronization.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions synthesize your confirmed preferences alongside the physical specifications of your 4-row computer lab:

- **Confirmed Aesthetic**: Interactive dark cyber-lab grid with glowing LED indicators, top-down desk geometry, subtle room orientation cues (Instructor master station / whiteboard), and realistic pulsing optical indicators.
- **Confirmed Status Modal**: Deep inspection dialog detailing Status Alert Level, Power Connection State, Installed Hardware Components (with zero-parts chassis toggle), and Technician Maintenance Notes.
- **Confirmed Owner Controls**: Visual in-place grid editor allowing the Owner (`ROLE_OWNER` / Julian) to add/remove rows, add/remove computers, toggle active/inactive seats, and persist layout schemas to Firestore.
- **Initial Physical Layout Seeded**:
  - **Row A**: 3 active PCs (A1, A2, A3; seat 4 empty).
  - **Row B**: 4 active PCs (B1, B2, B3, B4).
  - **Row C**: 4 PCs, where **C4 has ZERO parts inside** (bare chassis, critical red blink), and **C3 has NO power plugged in** (disconnected power, warning amber).
  - **Row D**: 4 active PCs (D1, D2, D3, D4).
  - **Numbering Orientation**: Strictly right-to-left (PC 1 on the right, proceeding leftward to PC 4), matching the physical classroom walk-through perspective.
  - **Blank until edited**: All unconfigured workstations remain in a clean, unedited blank state until updated by authorized technicians.
- **Future-Proofing Agent Telemetry**: Workstation status models include simulated agent heartbeat metadata and webhook endpoint structures for seamless transition to automated client-reporting daemons.

---

## 1. Overview & Core Concept

### What It Does
ComLab Status introduces a live interactive top-down schematic map of the training facility's computer laboratory rows. Technicians, instructors (Julian), and workers can instantly see the health of every student workstation at a glance via color-coded LEDs. Clicking any workstation opens an advanced hardware status drawer to view or update power connectivity, component inventory, alert level, and repair notes. Changes automatically save to Firestore cloud storage.

### Target Audience & Persona
- **Julian (Owner / Lead Instructor)**: Can reconfigure lab bench geometry, add new computer rows or stations, adjust right-to-left seat counts, and monitor class hardware readiness.
- **Lab Technicians & Workers (Kylin, Jason, Tristan, Xaiver)**: Can inspect individual computers, flag machines needing urgent parts or diagnostics, log power cord disconnects, and update status LEDs.
- **Students**: Can view bench availability and nominal operational status without administrative edit rights.

### Key Value
Eliminates physical walk-around uncertainty by maintaining a synchronized digital twin of the vocational lab floor, highlighting missing parts, disconnected power, and bench triage requirements in real time.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Top-Down Aerial Overview**:
   - The user opens the dedicated **ComLab Status** tab from the main navigation header.
   - A lab room canvas renders with an aerial view of Rows A, B, C, and D.
   - At the top of the room, a subtle "Front of Lab / Projector & Whiteboard" orientation bar provides physical directional reference.
   - In each row, computers are numbered right-to-left: `[PC 4] [PC 3] [PC 2] [PC 1]`.
   - Each computer station shows a top-down workstation graphic (chassis tower, keyboard/mouse zone, dual monitors) and a high-visibility LED indicator:
     - **Blinking Red**: Immediate attention / critical failure (e.g., C4 bare chassis missing parts).
     - **Amber / Orange**: Moderate issue that can wait (e.g., C3 power disconnected).
     - **Emerald Green**: Nominal / all systems verified.
     - **Subtle Gray / Outline**: Blank / unconfigured station.
   - Top summary KPI strip displays total stations, nominal count, warning count, critical count, and unconfigured count with fast filter pills.

2. **Inspecting & Editing Workstation Status**:
   - The technician or owner clicks on any workstation card (e.g., Row C, PC 4).
   - An **Advanced Workstation Status Modal** slides in:
     - **Status Banner**: Displays current alert state with clear text (e.g., "Critical Attention Required - Blinking Red") and visual preview.
     - **Status Selector**: Instant buttons for *Nominal (Green)*, *Non-Emergency Issue (Orange)*, *Critical Attention (Blinking Red)*, or *Blank / Unset*.
     - **Power Connection State**: Radio buttons for *Plugged In & Powered*, *Plugged In (Standby/Off)*, *No Power Plugged In (Disconnected)*, and *Faulty PSU / Tripped Breaker*.
     - **Hardware Inventory Checklist**: Quick toggles for Motherboard, CPU, RAM, Storage (SSD/NVMe), GPU, Power Supply, and a one-click *"Bare Chassis (Zero Parts Inside)"* preset that accurately reflects C4.
     - **Technician Field Notes**: Textarea for troubleshooting details and action items.
     - **Future Agent Telemetry Preview**: Tab showing how automated local reporting scripts will push live diagnostics via API.
   - Clicking **"Save Workstation Status"** commits the record to Firestore cloud database (`/comlab_computers/{computerId}`) and dispatches an instant toast notification.

3. **Owner Visual Layout Editor**:
   - When signed in as the Owner (`currentUser.role === 'ROLE_OWNER'`), an **"Edit Lab Layout"** toggle appears in the room action toolbar.
   - In Layout Edit Mode:
     - Each row gains controls to add or remove seats (`+ Add Station`, `- Remove Station`).
     - Technicians can toggle individual seats active or inactive (e.g., marking Row A seat 4 as an empty desk space).
     - Rows can be re-ordered, renamed, or new rows added (e.g., Row E).
     - A *"Reset to Lab Default (Rows A-D)"* button guarantees safety.
     - Changes persist to Firestore (`/comlab_layout/config`) and reflect in real time.

### Visual Identity & Theme
- **Theme Palette**: Neutral deep slate background (`#0d1117`), structural cards in `#161b22`, border accents in `#30363d` and `#38bdf8`.
- **LED Alert Colors**:
  - *Critical Blinking Red*: `#ef4444` with a CSS keyframe animation pulsing between `opacity: 1` and `opacity: 0.25` accompanied by an ambient red glow shadow (`box-shadow: 0 0 12px rgba(239, 68, 68, 0.75)`).
  - *Warning Orange*: `#f59e0b` with warm amber steady illumination.
  - *Nominal Green*: `#10b981` with crisp emerald radiance.
  - *Blank / Unset*: Muted `#4b5563` dark outline denoting an unconfigured blank state.
- **Typography**: Clean title fonts in `Plus Jakarta Sans` / `DM Sans`, paired with `font-mono tabular-nums` for station IDs (`A1`, `B4`, `C3`) and timestamps.
- **Anti-Slop Discipline**: Zero pseudo-code prefixes, clean unboxed metadata with typographic dots (`·`), and single-elevation cards with crisp 1px borders.

---

## 3. Key Product Decisions & Trade-Offs

- **Right-to-Left Visual Numbering**:
  - *Chosen Approach*: The grid layout applies column ordering such that computer 1 is stationed on the right and computer 4 on the left, respecting the physical room orientation.
  - *Why*: Direct spatial correspondence prevents technicians from mistaking C1 for C4 when servicing machines in the physical room.

- **Dual-Layer Cloud Persistence (Firestore + Local Fallback)**:
  - *Chosen Approach*: The layout and workstation status records synchronize to Firestore collections (`comlab_layout` and `comlab_computers`) using the established `firestoreService.ts` patterns, with optimistic local state and `localStorage` caching for instant offline resiliency.
  - *Why*: Guarantees zero latency on station clicks while persisting updates securely across instructor and technician browsers.

- **Role-Based Layout Control**:
  - *Chosen Approach*: Owner accounts (`ROLE_OWNER`) have exclusive access to layout mutations (adding/removing rows and stations), while both Owner and Workers (`ROLE_WORKER` / `user_julian_admin`) can edit computer statuses, alert levels, and hardware components. Students have read-only inspection access.
  - *Why*: Enforces structural integrity of the lab floor while empowering all bench technicians to report and resolve hardware issues.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Header.tsx                               │
│            (ComLab Status Navigation Tab & Quick Counts)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ activeTab === 'comlab_status'
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ComLabStatusSuite.tsx                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Room Controls & Filter Toolbar                                   │  │
│  │ • Summary Status Metrics (Nominal, Warning, Critical, Blank)     │  │
│  │ • Owner "Edit Lab Layout" Toggle & Layout Config Actions         │  │
│  │ • View Filter (All Rows vs Specific Row / Alert Status Filter)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Aerial Room Grid Canvas (Front of Lab Orientation Bar)           │  │
│  │                                                                  │  │
│  │  Row A: [ Empty (4) ] [ PC A3 (Green) ] [ PC A2 (Green) ] [ PC A1 ] │
│  │  Row B: [ PC B4 (Green) ] [ PC B3 ] [ PC B2 ] [ PC B1 ]          │  │
│  │  Row C: [ PC C4 (BLINK RED - ZERO PARTS) ]                       │  │
│  │         [ PC C3 (ORANGE - NO POWER) ] [ PC C2 ] [ PC C1 ]        │  │
│  │  Row D: [ PC D4 ] [ PC D3 ] [ PC D2 ] [ PC D1 ]                  │  │
│  │                                                                  │  │
│  │  * Right-to-Left numbering orientation                           │  │
│  └──────────────────┬───────────────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────────────┘
                      │ On Workstation Click
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    ComputerStatusModal.tsx                             │
│  • LED Alert Selection (Blink Red / Warning Orange / Green / Blank)    │
│  • Power Status Selection (Connected / Disconnected / Tripped)         │
│  • Hardware Specs & "Zero Parts Inside" Toggle                         │
│  • Technician Notes & Telemetry API Webhook Preview                    │
└─────────────────────┬──────────────────────────────────────────────────┘
                      │ On Save
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│               AppContext.tsx & firestoreService.ts                     │
│  • saveComputerStatusToFirestore('/comlab_computers/{id}')             │
│  • saveLabLayoutToFirestore('/comlab_layout/config')                   │
│  • Optimistic updates & localStorage fallback                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & Schemas

```typescript
export type ComputerAlertStatus = 'blink_red' | 'orange' | 'green' | 'blank';
export type ComputerPowerState = 'plugged_on' | 'plugged_off' | 'unplugged' | 'psu_fault';

export interface ComputerHardwareSpecs {
  hasBareChassisOnly: boolean; // true for Row C4 (Zero parts inside)
  cpu?: string;
  ramGb?: number;
  storage?: string;
  gpu?: string;
  psuWatts?: number;
  hasPeripherals: boolean;
}

export interface ComLabComputer {
  id: string; // e.g., 'pc_row_c_4'
  rowId: string; // 'A', 'B', 'C', 'D'
  stationNumber: number; // 1, 2, 3, 4 (numbered right-to-left)
  status: ComputerAlertStatus;
  powerState: ComputerPowerState;
  hardware: ComputerHardwareSpecs;
  technicianNotes: string;
  isConfigured: boolean; // false until first edited (blank until edited)
  lastUpdated?: string;
  updatedBy?: string;
}

export interface ComLabRowConfig {
  rowId: string; // 'A', 'B', 'C', 'D'
  label: string; // 'Row A'
  maxPositions: number; // default 4
  activePositions: number[]; // e.g., Row A: [1, 2, 3]; Row C: [1, 2, 3, 4]
}

export interface ComLabLayoutConfig {
  id: string;
  rows: ComLabRowConfig[];
  updatedAt: string;
  updatedBy: string;
}
```

### Initial Data Seeding Strategy
- **Row A**: Active positions `[1, 2, 3]`. Position 4 is marked empty desk space. Stations A1, A2, A3 initialized in nominal or blank status.
- **Row B**: Positions `[1, 2, 3, 4]`.
- **Row C**:
  - `C4`: `status: 'blink_red'`, `hardware: { hasBareChassisOnly: true }`, `technicianNotes: 'Chassis stripped for vocational lab parts teardown. Zero internal components.'`, `isConfigured: true`.
  - `C3`: `status: 'orange'`, `powerState: 'unplugged'`, `technicianNotes: 'No power plugged in. Needs 120V IEC cable routed from bench conduit.'`, `isConfigured: true`.
  - `C2`, `C1`: Initialized as unconfigured blank stations ready for technician entry.
- **Row D**: Positions `[1, 2, 3, 4]`.

---

## 5. Verification Plan

1. **Top-Down Aerial Rendering**:
   - Verify Rows A, B, C, and D are displayed with PC numbers arranged strictly right-to-left (`4, 3, 2, 1`).
   - Confirm Row A displays only 3 computers.
   - Confirm C4 blinks red with a critical visual alert and reports zero parts inside.
   - Confirm C3 displays orange warning with power unplugged status.
   - Confirm remaining computers show as blank/unconfigured until edited.

2. **Status Editing Verification**:
   - As Julian (Owner) or a Worker (Kylin/Jason), click an unconfigured PC, set status to Blink Red, Orange, or Green, adjust power state, enter notes, and save.
   - Verify the LED updates immediately in the room view and persists across page reload via Firestore/local storage.

3. **Owner Layout Editor Verification**:
   - When signed in as Owner, verify the "Edit Lab Layout" mode can be toggled.
   - Test adding/removing a seat on a row and adding a new row.
   - Sign in as a Worker or Student and verify that the layout edit mode is inaccessible and hidden.

4. **Code Quality & Build Check**:
   - Run `compile_applet` to ensure TypeScript compilation without errors.
