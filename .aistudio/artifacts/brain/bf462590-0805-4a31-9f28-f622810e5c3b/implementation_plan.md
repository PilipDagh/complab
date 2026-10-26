# Tools, Supplies & Equipment Inventory with Custom Location Manager and Quality Ensurer

An industrial-grade tool checkout and consumable inventory management system with custom location management, paired with a comprehensive Quality Assurance (QA) Ensurer suite to certify repaired and refurbished computers/laptops prior to outbound release.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and will be built directly into the system architecture:

* **Navigation Architecture**: A dedicated top-level **"Tools & Supplies"** tab in the main header with dedicated sub-views for **Tools & Equipment**, **Consumable Supplies**, and **Location Manager**.
* **Quality Ensurer Workflow**: A dedicated **"Quality Ensurer"** tab coupled with outbound certification inspection modals accessible from completed projects, work orders, and repaired inventory assets. Includes a multi-point safety & burn-in checklist, digital QA Pass stamp, and printable client certification slip.
* **Tool Checkouts & Clock-Outs**: Both **1-Click Instant Checkout** linked to the active clocked-in technician and bench station, and **Flexible Checkout** allowing assignment to any technician or student with return notes and condition logging.
* **Custom Location Manager**: Every tool, supply item, and hardware asset supports a **Blank Location** option, quick selection from known locations, or **"Add Custom Location"** on the fly with immediate persistence, managed via the Locations tab.

---

### 1. Overview & Core Concept

1. **Tools & Equipment Tracking**:
   * Complete inventory catalog of multimeters, soldering stations, heat guns, oscilloscope probes, precision bit sets, ESD mats, PSU testers, and power tools.
   * Real-time checkout status (`Available` vs `In Use / Checked Out`), tracking who checked it out, their bench, checkout timestamp, and expected return.
   * Check-in / return workflow recording returned tool condition (`Good`, `Needs Maintenance`, `Damaged`).

2. **Consumable Supplies Inventory**:
   * Stock tracking for thermal paste tubes (Arctic MX-4, Noctua NT-H1), solder spools, flux syringes, isopropyl alcohol 99%, microfiber cloths, zip ties, and CR2032 CMOS batteries.
   * Quantity on hand, minimum reorder thresholds, and one-click "Use 1 Unit" fast deductions with low-stock warning badges.

3. **Custom Location Management**:
   * Physical lab location tracking (e.g. *Main Tool Wall*, *Tool Chest B - Drawer 3*, *Solder Bench 1*, *Chemical Cabinet*, *In Transit*).
   * Supports **Blank / Unassigned** location.
   * In-line "Add Custom Location" modal in all forms that automatically adds the location to the lab database.
   * Dedicated **Location Manager** view to rename, merge, delete unused locations, and view an audit count of all items stored at each location.

4. **Quality Ensurer (QA Outbound Inspection)**:
   * Professional inspection rubric for refurbished laptops, customer repair rigs, and lab machines ready for outbound deployment.
   * Rigorous 4-stage quality gate:
     1. **Electrical & Cable Safety**: IEC power cord integrity, grounding pin continuity, no exposed wiring, power rail voltage checks (12V, 5V, 3.3V tolerance).
     2. **Hardware Integrity & Burn-In**: CPU/GPU stress thermal stability (< 75°C), zero memory errors (MemTest86 benchmark), SMART disk health 100% verified.
     3. **Software & Driver Cleanliness**: Clean Windows/Linux deployment, all Device Manager drivers signed and operational, temporary bench user profiles removed, updates applied.
     4. **Aesthetic & Physical Detailing**: Clean chassis, spotless screen, sanitized keyboard/touchpad, lint-free ports, protective wrapping.
   * Official **TradeTech Certified QA Pass Stamp** generated with inspector ID, date/time, certification number, and printable Client Handover Certificate.

---

### 2. User Experience & Visual Design

#### A. Main Navigation Integration
* Clean cyber-industrial header with high-contrast active tab indicators:
  * `Diagnostic Flow` • `ComLab Digital Twin` • `Hardware Assets` • `Projects & Work Orders` • **`Tools & Supplies`** *(New)* • **`Quality Ensurer`** *(New)* • `Time Clock` • `Lab Duty`

#### B. Tools & Supplies View (`/tools-supplies`)
* **Sub-Navigation Switcher**:
  * `[Wrench Icon] Tools & Equipment` (Count badge: e.g. 24 items, 5 in use)
  * `[Box Icon] Consumable Supplies` (Count badge: e.g. 18 items, 2 low stock)
  * `[MapPin Icon] Location Manager` (Count badge: e.g. 12 active storage zones)
* **Search & Quick Filters**:
  * Text search by tool name, serial number, brand, or barcode tag.
  * Status filter: `All` | `Available` | `In Use / Checked Out` | `Needs Maintenance`.
  * Location filter dropdown: `All Locations` | `Blank / Unassigned` | `[Custom Locations...]`.
* **Tool Card & Row Actions**:
  * **Clock Out Tool (Self / 1-Click)**: Instantly marks tool checked out to the current logged-in user at their active bench.
  * **Custom Checkout Modal**: Assigns tool to another student/technician, set expected return time, and notes work order / repair target.
  * **Return Tool**: Opens 1-click return prompt with condition check (Good / Maintenance required).
  * **Edit / Remove Tool**: Full modal to update location, specs, serial, or archive from inventory.

#### C. Locations Manager Sub-View
* Grid cards for every physical storage location in the vocational lab.
* Shows:
  * Location Name (e.g. `Tool Chest A - Top Drawer`)
  * Storage Zone Category (`Tool Storage`, `Bench Area`, `Mobile Cart`, `Secure Cabinet`, `Hazardous / Chemical`)
  * Real-time item counter: e.g. "7 Tools • 3 Consumables stored here"
  * One-click filter to view all items currently stored in that spot.
  * Edit & Delete actions (with confirmation prompt ensuring items are safely relocated).
  * **"Add New Custom Location"** button with quick presets or custom text input.

#### D. Quality Ensurer View (`/quality-ensurer`)
* **Outbound Readiness Queue**:
  * Cards for finished computers, customer repairs, and refurbished workstations awaiting final QA clearance before handoff.
  * Readiness badge: `Awaiting Inspection`, `In Review`, `Certified Outbound Pass`, or `Rejected / Revision Needed`.
* **Interactive Inspection Modal**:
  * Interactive step-by-step checklist with CompTIA/A+ certified vocational safety standards.
  * Inspector sign-off field (defaults to active logged-in teacher/QA manager).
  * Bench notes & measured parameters (e.g. Peak CPU Load Temp, Idle Temp, 12V Rail Voltage).
* **Digital Outbound QA Certificate**:
  * High-res cyber-industrial certificate card with gold/emerald holographic border.
  * Unique Verification Hash (e.g. `TT-QA-2026-9842`).
  * Inspector signature, hardware spec summary, and **"Print / Export PDF Certificate"** button.

---

### 3. Key Product Decisions & Trade-Offs

1. **Unified Storage vs. Fragmented Collections**:
   * *Decision*: Use Firestore `tools_supplies` with an `itemType: 'tool' | 'supply' | 'equipment'` discriminator, rather than separate disjoint tables.
   * *Why*: Enables unified barcode scanning, shared location dropdowns, and combined inventory exports while maintaining dedicated category views.
2. **Dynamic Location Taxonomy**:
   * *Decision*: Store custom locations in Firestore `lab_locations` and cache in localStorage, while providing a clear `[None / Unassigned]` option on all dropdowns.
   * *Why*: Prevents orphan location strings, lets the instructor organize the workshop layout, and supports instant location creation directly from any tool edit modal without navigating away.
3. **QA Integration with Work Orders**:
   * *Decision*: QA inspections live in their own `quality_inspections` collection, but are linked by `workOrderId` and `assetTag` to repair tickets.
   * *Why*: Ensures standalone QA auditing for any device, while automatically populating completed work orders with verified QA pass stamps.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TradeTech UI Navigation                         │
│  [Diagnostic] [ComLab Twin] [Assets] [Projects] [Tools] [QA] [Clock]   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌───────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ Tools & Supplies View │ │  Locations Manager   │ │   Quality Ensurer    │
│ - Tool Catalog        │ │ - Zone Registry      │ │ - Inspection Queue   │
│ - 1-Click Clock-Out   │ │ - Custom Add / Edit  │ │ - 4-Gate Checklist   │
│ - Consumable Stock    │ │ - Item Usage Audit   │ │ - Digital QA Stamp   │
│ - Return & Condition  │ │ - Blank Loc Handler  │ │ - Client Print Slip  │
└──────────┬────────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                         │                        │
           └─────────────────────────┼────────────────────────┘
                                     ▼
                   ┌──────────────────────────────────┐
                   │    AppContext State & Firestore  │
                   │ - tools_supplies collection      │
                   │ - lab_locations collection       │
                   │ - quality_inspections collection │
                   │ - Real-time onSnapshot sync      │
                   └──────────────────────────────────┘
```

#### Core Data Entities:

```typescript
// 1. Tool, Supply & Equipment Item
export interface LabInventoryItem {
  id: string;
  name: string;
  itemType: 'tool' | 'supply' | 'equipment';
  category: string; // e.g. "Soldering", "Meters", "Hand Tools", "Power", "Consumables"
  skuOrTag?: string;
  locationId?: string; // Blank / undefined allowed
  locationName?: string; // "Tool Chest B", "Bench 2", or "Unassigned"
  status: 'available' | 'checked_out' | 'maintenance' | 'depleted';
  
  // Checkout / Clock-out metadata
  checkedOutBy?: {
    userId: string;
    userName: string;
    benchStation: string;
    checkedOutAt: string;
    expectedReturn?: string;
    taskNotes?: string;
  };
  condition: 'new' | 'good' | 'fair' | 'damaged' | 'missing_parts';
  
  // Consumable quantity tracking
  quantityOnHand?: number;
  unitOfMeasure?: string; // "tubes", "spools", "packs", "bottles"
  minReorderLevel?: number;
  
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

// 2. Custom Physical Lab Location
export interface LabLocation {
  id: string;
  name: string; // e.g. "Tool Cabinet A - Drawer 2"
  zoneType: 'tool_storage' | 'bench_area' | 'mobile_cart' | 'secure_cabinet' | 'clean_room';
  description?: string;
  itemCount?: number;
  createdAt: string;
  createdBy: string;
}

// 3. Quality Ensurer Outbound Certification
export interface QualityInspection {
  id: string;
  certificateNumber: string; // e.g. "TT-QA-2026-0814"
  workOrderId?: string;
  assetTag?: string;
  deviceModel: string;
  deviceType: 'desktop' | 'laptop' | 'server' | 'all_in_one' | 'custom_build';
  clientOrRecipient: string;
  technicianName: string;
  inspectorName: string;
  inspectionDate: string;
  
  // 4-Stage Quality Checklist Rubric
  checks: {
    // Stage 1: Electrical & Safety
    powerSupplyGroundVerified: boolean;
    cablesInsulatedNoExposedWire: boolean;
    powerRailVoltagesNormal: boolean;
    // Stage 2: Hardware & Burn-In
    cpuThermalsUnderLoadPass: boolean;
    maxCpuTempCelsius: number;
    ramMemtestStable: boolean;
    storageSmartHealthClean: boolean;
    gpuStabilityTestPass: boolean;
    // Stage 3: OS & System Cleanliness
    cleanOsInstalledAndActivated: boolean;
    allDriversFunctionalNoUnknown: boolean;
    benchProfilesRemoved: boolean;
    biosFirmwareUpdated: boolean;
    // Stage 4: Physical Detailing & Sanitation
    chassisCleanedAndSanitized: boolean;
    screenSpotlessNoFingerprints: boolean;
    portsDustFree: boolean;
    accessoriesAndPowerLeadBagged: boolean;
  };
  
  overallStatus: 'passed' | 'rework_required' | 'rejected';
  inspectorNotes?: string;
  benchVoltagesRecorded?: string;
  approvedForOutboundRelease: boolean;
}
```

---

### Plan Approval & Next Steps

When approved, we will:
1. Update `firestore.rules` and `src/types/index.ts` with the new schemas.
2. Implement Firestore real-time listeners and handlers in `src/db/firestore.ts` and `src/context/AppContext.tsx`.
3. Create the `ToolsSuppliesSuite.tsx` component with tools check-out, supplies tracking, and `LocationManagerModal.tsx`.
4. Create the `QualityEnsurerSuite.tsx` and `QualityInspectionModal.tsx` components with the 4-stage inspection checklist and digital certificate print slip.
5. Add navigation tabs in `src/components/Header.tsx` and verify clean build compilation.
