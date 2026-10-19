# Multi-Photo AI Asset Autofill, Responsive UI Polish & Blank Location Support

Automates hardware asset registration through multi-photo visual capture (camera and file upload) with Gemini multimodal extraction of QR codes, serial numbers, make/model, and hardware specs, paired with a responsive screen-fitting UI overhaul and optional "Blank" (Unassigned) location categorization.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview and will guide this implementation:

- **Confirmed Decision 1 (Photo Capture & Input)**: Support both real-time device camera capture (continuous snapshot mode for front/back/bottom labels) and multi-photo file upload, allowing technicians to snap bottom labels, serial stickers, and QR tags in one session.
- **Confirmed Decision 2 (AI Auto-Fill & Review Flow)**: Extracted specs (Serial Number, Model/Make, CPU, RAM, Storage, Device Type, OS) will instantly autofill directly into the intake form with visual green highlight glows on scanned fields, leaving the technician only to mark any problem status and enter non-tech notes.
- **Confirmed Decision 3 (Blank Location Behavior)**: Support a first-class "Blank" option in the location selector, represented cleanly as "Unassigned" across inventory tables, filter bars, and card badges, with a dedicated quick-filter tag to easily isolate unassigned assets.
- **Confirmed Decision 4 (Screen-Fitting UI Layout)**: Fix all overflowing containers, modal max-height clamps, and cramped controls so the entire dashboard and asset workflow fit comfortably within any viewport (mobile, tablet, desktop) without broken horizontal scrollbars or clipping.

---

### 1. Overview & Core Concept

- **What It Does**: Technicians and vocational students frequently intake laptops and hardware units with small stickers, QR codes, barcode labels, and technical specs. Instead of manually typing long serial numbers and technical specs, users take 1 to 4 photos (e.g. laptop top lid, bottom regulatory sticker, barcode/QR sticker, BIOS/spec screen). Gemini 3.8 / 3.1 Flash analyzes all photos collectively, extracts the model, serial number, regulatory tag, device classification, and technical specifications, and fills the form instantly. The user then simply selects or marks whether the unit has a problem (using 1-click CompTIA presets) and enters optional bench notes.
- **Target Audience / Persona**: Vocational instructors (Julian), student technicians, and lab assistants at Fred W. Eberle Technical Center managing hundreds of laptops and lab units.
- **Key Value**: Drastically reduces intake triage time from 5 minutes down to 15 seconds per laptop, eliminates manual typing errors on serial numbers, and provides a clean, glitch-free dashboard that fits perfectly on workshop laptops, tablets, and phones.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Initiate Asset Registration**: In the Asset Inventory tab, click the enhanced **"Add New Asset"** or **"Snap & Autofill (AI Lens)"** action.
2. **Multi-Photo Capture & Staging**:
   - Technician selects **Live Camera** (with toggle for front/rear camera and capture button) or clicks **Upload Photos** to drag/drop multiple photos of the laptop bottom, serial plate, and QR codes.
   - Thumbnails display with individual remove buttons and a prominent **"Analyze & Autofill Specs"** button.
3. **Multimodal AI Extraction**:
   - The backend `/api/gemini/extract-asset-specs` processes the images using Gemini multimodal vision with structured JSON output.
   - The intake form populates immediately: Model, Serial Number, Device Type (Laptop, Desktop, Switch), CPU, RAM, Storage, OS, and MAC/Regulatory ID.
   - Fields populated by AI glow with a transient cyan/emerald accent border and an "AI Detected" indicator.
4. **Technician Review & Problem Marking**:
   - The technician verifies the detected fields, selects **Location** (including the new **"Blank / Unassigned"** default option), and marks whether the unit has an active problem using CompTIA problem presets (e.g., "Cracked Display", "No Power", "RAM Bit Flipping").
5. **Save to Cloud**:
   - Asset saves directly into Firestore/Cloud SQL state, updates inventory metrics in real-time, and displays a success toast.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-precision vocational dark slate lab interface (`#0B0F19` canvas, `#161B26` containers, `#232D3F` hairline borders). Clean, utilitarian, anti-slop design.
- **Color Palette**:
  - Deep Neutral Canvas: `#0B0F19` (60%)
  - Structural Cards & Surfaces: `#161B26` and `#1E2638` (30%)
  - Functional Accents: Emerald (`#10B981`) for verified/healthy states, Cyan (`#38BDF8`) for AI vision scanning, Amber (`#F59E0B`) for warnings, Crimson (`#EF4444`) for critical defects (10% budget).
- **Typography & Hierarchy**:
  - Headers: Manrope / Plus Jakarta Sans font style (`font-sans font-bold`).
  - Technical Data & Identifiers: Strictly tabular monospace (`font-mono tabular-nums`) for serial numbers, asset tags, bench numbers, and specs.
- **Screen-Fitting Layout & Viewport Containment**:
  - Fix modal containment with `max-h-[90vh] overflow-y-auto` and sticky headers/footers so modal action buttons are always reachable regardless of screen resolution.
  - Responsive multi-column grid with `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` that eliminates viewport blowout and horizontal document scroll.
  - Compact row heights (40px) for tables with text truncation and tooltips.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Multimodal Gemini Extraction vs. Client OCR**:
  - *Chosen Approach*: Route images to a dedicated server endpoint (`/api/gemini/extract-asset-specs`) using the `@google/genai` SDK with `gemini-3.8-flash` (or `gemini-3.1-flash-lite` fallback).
  - *Why*: Laptop bottom stickers contain fragmented abbreviations (`S/N:`, `Service Tag:`, `Reg Model:`, `P/N:`, `16GB DDR5`, `i7-13700H`, QR/DataMatrix codes). Generic client OCR produces garbled strings; Gemini multimodal vision accurately parses layout context, decodes tiny barcodes/QR codes, and normalizes specs into structured JSON.
  - *Security & Privacy*: API keys remain strictly server-side in accordance with the `@google/genai` guidelines.
- **Decision 2: Location Handling with "Blank / Unassigned" Option**:
  - *Chosen Approach*: Add `""` / `"Unassigned"` as the first option in the bench location dropdown and quick filters.
  - *Why*: Allows technicians to register incoming stock or off-bench repairs that do not yet have a designated physical lab bench.
- **Decision 3: Multi-Photo Batch Staging**:
  - *Chosen Approach*: Technicians can take or upload up to 4 photos per asset (e.g. Lid photo, Bottom serial sticker, Port label, Screen/BIOS). All images are merged into a single multi-part prompt, enabling cross-referencing between the model name on the bezel and the serial code on the bottom label.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TradeTech Client UI                             │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │ AssetInventoryManager │          │   AssetPhotoAutofillModal     │  │
│  │ - Unassigned Filter   │ ◄─────── │   - Live Camera Stream        │  │
│  │ - Screen-Fit Grid/List│          │   - Multi-Photo File Drop     │  │
│  │ - Quick Problem Marks │          │   - Highlighted Spec Review   │  │
│  └───────────────────────┘          └───────────────┬───────────────┘  │
└─────────────────────────────────────────────────────┼──────────────────┘
                                                      │ POST Base64 Photos
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Server                           │
│                                                                        │
│   POST /api/gemini/extract-asset-specs                                 │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ GoogleGenAI SDK (gemini-3.8-flash / gemini-3.1-flash-lite)      │   │
│   │ Structured JSON Schema Response:                               │   │
│   │ {                                                              │   │
│   │   make, model, serialNumber, deviceType, cpu, ram, storage,    │   │
│   │   gpu, macAddress, os, detectedConditionHint                   │   │
│   │ }                                                              │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Firestore & Local Storage Sync                     │
│   Collection: hardwareAssets                                           │
│   - assignedBench: "" | "Unassigned" | "Bench #X"                      │
│   - problemLabel: { hasProblem, problemTitle, severity, description }  │
│   - specs: { cpu, ram, storage, gpu, macAddress, os }                  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Implementation Scope
1. **Server Endpoint (`server.ts`)**:
   - Add `POST /api/gemini/extract-asset-specs` accepting an array of base64 image strings.
   - Build a specialized prompt instructing Gemini to parse manufacturer branding (Dell, Lenovo, HP, Apple, Cisco, Asus, Acer), serial numbers (`S/N`, `Service Tag`, `Serial`, `SN`), QR code contents, MAC addresses, and technical specs.
   - Enforce structured JSON response schema (`Type.OBJECT`) for deterministic client parsing.
2. **Asset Model & Schema (`src/types/index.ts`)**:
   - Ensure `HardwareAsset['assignedBench']` cleanly accommodates `""` and `"Unassigned"`.
   - Update `specs` and intake types to include any optional photo references.
3. **Asset Intake & Autofill Component (`src/components/AssetPhotoAutofillModal.tsx` & `AssetInventoryManager.tsx`)**:
   - Build camera viewfinder with frame guidelines for serial labels and QR codes.
   - Multi-image dropzone with preview pills and delete buttons.
   - Direct injection into form fields with animated pulse highlight for newly auto-filled fields.
   - Location dropdown featuring `[ Blank / Unassigned ]` as a prominent option.
   - Problem marker section with one-click CompTIA diagnostic presets.
4. **UI Screen-Fitting & Layout Polish**:
   - Overhaul `AssetInventoryManager.tsx` and all parent layout containers to use `w-full max-w-7xl mx-auto px-4 sm:px-6` with proper flex-wrap and responsive breakpoint handling (`xs`, `sm`, `md`, `lg`, `xl`).
   - Fix all modal viewport constraints (`max-h-[85vh]` scrollable body with pinned header and footer actions).
   - Add filter tag for `"Unassigned / Blank Location"` alongside `"On-Hand"`, `"Has Problem"`, and `"Healthy"`.

---

### Verification & Testing Plan
- Test camera capture and multi-photo file upload with real sample laptop labels.
- Verify that `POST /api/gemini/extract-asset-specs` returns valid JSON with serial, model, and specs.
- Test setting location to "Blank" and verify it displays as "Unassigned" and filters properly.
- Verify responsive layout on mobile (375px), tablet (768px), and desktop (1440px) viewports with zero horizontal overflow.
- Run `compile_applet` and `lint_applet` to ensure error-free builds.
