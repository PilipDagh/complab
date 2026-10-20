# Implementation Plan: Interactive Welcome Tour, Lab Manual Tab, Role Specialization (Mr. McKismic), and Theme Engine

Build an interactive spotlight onboarding tour, a comprehensive and accessible "Manual" tab, role-based quick action toolbars based on the FETC vocational lab duty roster, Mr. McKismic teacher management features, and a Settings modal with a theme switcher supporting Dark Industrial and High Contrast Light modes.

---

## 1. User Intent & Clarifications Summary
- **Interactive Spotlight Onboarding Tour:** One-time game-style walkthrough with darkened backdrop spotlighting key UI controls, step-by-step explanations, "Next/Back/Skip", saved to `localStorage` (`has_seen_onboarding_tour`), with replay capability from the Manual and Settings.
- **Dedicated "Manual" Tab:** In-depth, easy-to-read, visual field manual explaining every tab, module, tool, keyboard shortcut, and workflow with search, role guidelines, and quick jump links.
- **Printed Job Assignments & Permissions:**
  - Team Safety Manager (Xavier W.)
  - Foreman (Jason F.)
  - Ambasitor / Ambassador (Jason F.)
  - Environment Manager (Katrina C., Bridget C.)
  - Asset Manager (Katrina C., Bridget C.)
  - Clock In Manager (Remington W.)
  - Cart Management (Remington W.)
  - Teacher Profile (Mr. McKismic): Instructor-level management over roster and role assignments.
  - Jobless / General Technicians (Kylin, Tristan, etc.): Full, identical permissions to all site features, accompanied by general technician quick actions.
  - Specialized Quick Action Toolbars: Give assigned roles 1-click access to specific tasks (audits, logs, scripts) without restricting other technicians from accessing tools normally.
- **Theme Switcher & Settings Modal:**
  - Settings button (gear icon) in the header opening a centralized Settings modal.
  - Toggle between **Dark Industrial** (default) and **High Contrast Light** mode (for bright vocational classrooms and projectors).
  - Presentation of 10 creative extra theme concepts for future customization.

---

## 2. Proposed Changes & Architecture

### A. Types & Seed Data Updates (`src/types/index.ts` & `src/data/seedData.ts`)
- Extend `User` interface:
  - `assignedJobs: LabJobRole[]`
  - `isTeacher?: boolean`
- Define `LabJobRole`:
  - `'team_safety_manager'` | `'foreman'` | `'ambassador'` | `'environment_manager'` | `'asset_manager'` | `'clock_in_manager'` | `'cart_management'` | `'teacher'` | `'jobless'`
- Update `INITIAL_USERS`:
  - Add **Mr. McKismic** (`id: 'user_teacher_mckismic'`, `displayName: 'Mr. McKismic'`, `role: 'ROLE_OWNER'`, `isTeacher: true`)
  - Update Xavier W. with `assignedJobs: ['team_safety_manager']`
  - Update Jason F. with `assignedJobs: ['foreman', 'ambassador']`
  - Update Katrina C. with `assignedJobs: ['environment_manager', 'asset_manager']`
  - Update Bridget C. with `assignedJobs: ['environment_manager', 'asset_manager']`
  - Update Remington W. with `assignedJobs: ['clock_in_manager', 'cart_management']`
  - Ensure Kylin, Tristan, etc., have `assignedJobs: ['jobless']`

### B. One-Time Interactive Welcome Spotlight Tour (`src/components/OnboardingTour.tsx`)
- High-tech SVG/canvas-backed spotlight overlay that darkens the background and highlights current target DOM elements (`data-tour-target`).
- Step sequence:
  1. Header & Lab Status
  2. 6 Vocational Engineering Modules
  3. Diagnostic Wizard & Reference
  4. ComLab Digital Twin
  5. Asset Inventory & AI Photo Autofill
  6. Technician Profile & Specialized Quick Actions
  7. Settings & Theme Switcher
- Controls: "Next", "Back", "Skip", "Finish".
- State persistence in `localStorage`: `trade_tech_tour_completed`.
- Can be re-triggered anytime via `openTour()` in `AppContext`.

### C. Dedicated Lab Field Manual & Guidebook Tab (`src/components/LabManualGuide.tsx`)
- Add `'manual'` to `AppTab` in `AppContext`.
- Clean, searchable, modular documentation:
  - **Quick Start & Core Workflow:** How to intake assets, run diagnostics, and clock in.
  - **Lab Duty Roster & Role Playbook:** Details each job from the printed sheet, duties, checklists, and quick tools.
  - **Vocational Modules (1–6):** Comprehensive guides for Board Triage, SysAdmin CLI, CompTIA Certs, Floor Operations, Forensics, and Signals.
  - **ComLab Spatial Twin Guide:** Controls, row layouts, and status LED color meanings.
  - **AI Camera Intake Guide:** How to snap bottom QR/serial stickers for instant autofill.
  - **Teacher & Instructor Guide:** Classroom control, assigning roles, student progress tracking.
  - **Interactive Tour Launcher:** One-click button to restart the spotlight tour.

### D. Specialized Quick Action Toolbars (`src/components/RoleQuickActionsBar.tsx`)
- Render a dynamic, non-intrusive quick-action bar tailored to the currently active user's assigned role(s):
  - **Safety Manager:** ESD wrist strap checklist, chemical fume check, 1-click hazard report.
  - **Foreman:** Priority task dispatch, active technician overview, shift briefing alert.
  - **Ambassador:** Visitor greeting log, lab tour talking points, welcome broadcast.
  - **Environment Manager:** Temperature & humidity check, bench cleanliness audit.
  - **Asset Manager:** 1-click camera autofill intake, unassigned assets triage, QR label printer.
  - **Clock In Manager:** Attendance roll call, station assignment sync, late audit.
  - **Cart Management:** Laptop Cart 1 & 2 charging check, cable locks check, return audit.
  - **Teacher (Mr. McKismic):** Teacher Console modal to modify student jobs, view class participation, and reset lab states.
  - **Jobless / General Tech:** Quick launch for Diagnostic Wizard, AI Copilot, and Spec Reference.

### E. Settings Modal & Theme Engine (`src/components/SettingsModal.tsx` & `src/context/AppContext.tsx`)
- Header Gear icon button that opens the Settings modal.
- Active theme options:
  - **Dark Industrial (Default):** Deep slate `#0d1117`, cyan/emerald LED accents, brushed metal aesthetic.
  - **High Contrast Light:** Crisp pure white/light gray background, dark high-contrast typography, vivid deep navy/emerald accents optimized for classroom projection and brightly lit tech labs.
- Persist selected theme in `localStorage` (`trade_tech_active_theme`).
- List the **10 Extra Theme Concepts** inside the settings panel with previews:
  1. *Cyberpunk 2077 Neon* (Vivid magenta, cyan, deep obsidian)
  2. *Amber CRT Terminal (DEC VT220)* (Monochrome retro phosphorus amber)
  3. *Matrix Hacker Green (Phosphor 80s)* (Classic IBM green-screen terminal)
  4. *Clean Architectural Whiteboard* (Technical marker styling on clean slate)
  5. *Solarized Dark IDE* (Classic Ethan Schoonover color theory)
  6. *Deep Ocean Submarine* (Navy blue, bioluminescent cyan, sonar radar pings)
  7. *Stealth Monokai Pro* (Warm charcoal with pastel syntax highlights)
  8. *Draftsman Blueprint Cyan* (Cad cyan gridlines on dark architectural navy)
  9. *Sunset Synthwave 1984* (Neon purple, warm orange, retro gradient wireframes)
  10. *Minimalist E-Ink Monochrome* (Ultra-clean grayscale distraction-free paper)

---

## 3. Verification & Acceptance Criteria
1. **Interactive Tour:** Fires on first load on a fresh session, darkens background, highlights navigation items, advances smoothly, and marks as seen in `localStorage`.
2. **Replay Tour:** Clicking "Restart Interactive Tour" from the Manual or Settings re-triggers the full tour without refreshing.
3. **Lab Manual Tab:** Accessible via the top navigation, easily searchable, responsive on mobile and desktop, clearly explaining the whole system.
4. **Duty Roster & Profiles:**
   - Xavier W., Jason F., Katrina C., Bridget C., Remington W., and Mr. McKismic display their proper role badges and role tools.
   - Jobless technicians retain full access to every website module and feature.
   - Mr. McKismic profile has the Teacher Console to manage roles.
5. **Theme Switcher:** Toggling between Dark Industrial and High Contrast Light immediately updates UI styling and persists across reloads.
6. **Build Quality:** Runs `compile_applet` and `lint_applet` with zero TypeScript errors or lint issues.
