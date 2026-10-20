import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Compass,
  Zap,
  Cpu,
  Monitor,
  Tag,
  Clock,
  ShieldCheck,
  ShieldAlert,
  HardHat,
  Users,
  Wind,
  BatteryCharging,
  GraduationCap,
  Wrench,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ChevronRight,
  Terminal,
  Activity,
  Network,
  Palette,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';

export const LabManualGuide: React.FC = () => {
  const { startTour, setActiveTab, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const SECTIONS = [
    { id: 'all', title: 'Full Field Manual' },
    { id: 'quickstart', title: 'Quick Start: 5-Minute Guide' },
    { id: 'roles', title: 'Lab Duty Roles & Responsibilities' },
    { id: 'modules', title: 'The 6 Vocational Suites' },
    { id: 'comlab', title: 'ComLab Aerial Digital Twin' },
    { id: 'assets', title: 'Asset Tracking & AI Camera' },
    { id: 'wizard', title: 'Diagnostic Wizard & AI Copilot' },
    { id: 'timeclock', title: 'Time Clock & Attendance' },
    { id: 'shortcuts', title: 'Keyboard Shortcuts & Themes' },
  ];

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hero Banner with Tour Trigger */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-[#161d2b] to-blue-950/40 border border-cyan-500/30 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-xl font-bold text-white tracking-tight">
                  Vocational Lab Operations & Systems Field Manual
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  FETC Certified
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 max-w-2xl font-sans">
                Comprehensive reference for students, technicians, and instructors at Fred W. Eberle Technical Center. Explains every module, duty role, diagnostic tree, and shortcut.
              </p>
            </div>
          </div>

          {/* Big Action: Launch Interactive Tour */}
          <button
            onClick={() => startTour()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 shrink-0 self-start md:self-auto transition-all"
          >
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Launch Spotlight Tour</span>
          </button>
        </div>

        {/* Search & Topic Filter */}
        <div className="mt-5 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manual (e.g., 'safety', 'foreman', 'comlab', 'ai camera', 'clock in', 'shortcuts')..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0b0e14] border border-[#232d3f] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedSection === sec.id
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-[#0d121c] border border-[#232d3f] text-gray-400 hover:text-white'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION 1: QUICK START 5-MINUTE GUIDE --- */}
      {(selectedSection === 'all' || selectedSection === 'quickstart') &&
        matchesSearch('quick start intake diagnostic clock in workflow') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-gray-800 pb-3">
              <Zap className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Quick Start: Daily 5-Step Technician Workflow
              </h3>
            </div>

            <p className="text-gray-300 leading-relaxed font-sans">
              Every technician follows this standardized CompTIA & shop management workflow when reporting to the lab for a shift:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              <div className="bg-[#161d2b] p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>Step 1</span>
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-xs">Clock In & Station</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Go to <strong>Time Clock</strong>, select your bench station (e.g. Bench 03), punch in, and set your primary task category.
                </p>
              </div>

              <div className="bg-[#161d2b] p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-red-400 font-bold">
                  <span>Step 2</span>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-xs">ESD & Safety Check</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Verify anti-static wrist strap is grounded. Team Safety Manager inspects eyewash station and solder fume exhaust.
                </p>
              </div>

              <div className="bg-[#161d2b] p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>Step 3</span>
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-xs">Asset Intake with AI</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Open <strong>Assets</strong> &gt; <em>Snap & Autofill</em>. Take photos of the bottom QR/serial sticker to auto-populate hardware specs!
                </p>
              </div>

              <div className="bg-[#161d2b] p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <span>Step 4</span>
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-xs">Hardware Triage</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Use the <strong>Diagnostic Wizard</strong> or <strong>Board Triage (01)</strong> to troubleshoot No POST, RAM errors, and power rail shorts.
                </p>
              </div>

              <div className="bg-[#161d2b] p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Step 5</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-xs">Log & Clock Out</h4>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Record repair notes, mark problem status as resolved, clean your bench, and punch out on the Time Clock before leaving.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* --- SECTION 2: LAB DUTY ROLES & PRINTED ROSTER --- */}
      {(selectedSection === 'all' || selectedSection === 'roles') &&
        matchesSearch('roles duty safety foreman ambassador environment asset cart teacher mckismic') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Lab Duty Roles & Responsibility Playbook (From Printed Roster)
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-sans">
                All roles retain 100% full platform access; job badges provide 1-click Quick Action toolbars.
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed font-sans">
              The vocational computer repair lab operates as a professional tech organization. Each student is assigned specialized roles corresponding to real IT enterprise duties:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Xavier W. - Safety */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="font-bold text-white">Team Safety Manager</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-500/40 font-bold">
                    Xavier W.
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Responsibilities:</strong> Conducts daily ESD grounding inspections, verifies chemical/flux storage, ensures safety glasses are worn at rework stations, and files immediate hazard alerts.
                </p>
                <div className="text-[10px] text-red-300/80 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
                  <strong>Quick Tool:</strong> 1-Click Safety Protocol Audit & Hazard Alert Logger.
                </div>
              </div>

              {/* Jason F. - Foreman & Ambassador */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Foreman & Ambassador</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                    Jason F.
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Responsibilities:</strong> As Foreman, coordinates bench repair tickets and technician task distribution. As Ambassador, greets visitors, superintendents, and leads lab orientation tours.
                </p>
                <div className="text-[10px] text-amber-300/80 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                  <strong>Quick Tools:</strong> Work Order Dispatch, Active Tech Roll, and Visitor Greeting Register.
                </div>
              </div>

              {/* Katrina C. & Bridget C. - Environment & Asset */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-teal-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <span className="font-bold text-white">Environment & Asset Managers</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-950 text-teal-300 border border-teal-500/40 font-bold">
                    Katrina C. & Bridget C.
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Responsibilities:</strong> Maintain lab environmental quality (temperature °F, humidity %, floor clearance). Oversee hardware asset intake, QR code printing, and AI camera spec scanning.
                </p>
                <div className="text-[10px] text-teal-300/80 bg-teal-950/40 p-2 rounded-lg border border-teal-500/30">
                  <strong>Quick Tools:</strong> Lab Climate Log, Instant AI Photo Intake, and Unassigned Asset Triage.
                </div>
              </div>

              {/* Remington W. - Clock In & Cart Management */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white">Clock In & Cart Management</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-500/40 font-bold">
                    Remington W.
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Responsibilities:</strong> Monitors daily student attendance and bench station synchronization. Audits Laptop Cart #1 and Cart #2 power charging plugs, lock cables, and returns.
                </p>
                <div className="text-[10px] text-blue-300/80 bg-blue-950/40 p-2 rounded-lg border border-blue-500/30">
                  <strong>Quick Tools:</strong> Attendance Roll Call Audit & Laptop Cart Charging Dock Log.
                </div>
              </div>

              {/* Mr. McKismic - Teacher Role */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-emerald-500/50 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Classroom Instructor / Teacher</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                    Mr. McKismic (Teacher)
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Responsibilities:</strong> Overall pedagogical and shop authority. Possesses elevated management over the student roster, assigning/reassigning student job duties, grading project work orders, and resetting lab benchmarks.
                </p>
                <div className="text-[10px] text-emerald-300/80 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                  <span><strong>Privilege:</strong> Teacher Command Console (Roster & Duty Management).</span>
                  <button
                    onClick={() => setActiveTab('time_clock')}
                    className="underline hover:text-white"
                  >
                    View Class Timesheets &rarr;
                  </button>
                </div>
              </div>

              {/* Jobless / General Technicians */}
              <div className="p-4 rounded-xl bg-[#161d2b] border border-gray-700 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-white">General Technicians (Jobless / Unassigned Duty)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700 font-bold">
                    Kylin, Tristan, & Open Seats
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  <strong>Permissions:</strong> General technicians have <strong>zero restrictions</strong>! They can access all 6 modules, run diagnostic wizards, log time, and repair assets. Their quick action bar provides 1-click access to the Hardware Wizard and AI Copilot.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* --- SECTION 3: THE 6 VOCATIONAL MODULES --- */}
      {(selectedSection === 'all' || selectedSection === 'modules') &&
        matchesSearch('modules board triage networking comptia floor operations forensics signals') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sky-400 border-b border-gray-800 pb-3">
              <Layers className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. The 6 Vocational Engineering Suites
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('board_triage')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>01. Board-Level Triage</span>
                  <Zap className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Diagnose motherboard DC power rails (+12V, +5V, +3.3V, VCORE), VRM phase shorts, and solder rework pinouts.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('networking')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-sky-500/30 hover:border-sky-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-sky-400 font-bold">
                  <span>02. Network & SysAdmin</span>
                  <Network className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Interactive CLI terminal, Cisco switch VLAN simulations, subnet calculator, and ping/traceroute network testing.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('vocational')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-emerald-500/30 hover:border-emerald-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>03. CompTIA Certification</span>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Core 1 & Core 2 flashcard study drills, laser printer theory, command cheat sheets, and practical lab tests.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('lab_management')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>04. Lab Floor Operations</span>
                  <Tag className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Hardware spare parts inventory, laptop fleet triage, component pricing, and storage shelf allocations.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('forensics')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-teal-500/30 hover:border-teal-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-teal-400 font-bold">
                  <span>05. Forensics & Firmware</span>
                  <Terminal className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Hex editor, BIOS SPI EEPROM flashing guides, SMART drive health analysis, and forensic raw disk recovery.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('signals')}
                className="p-3.5 rounded-xl bg-[#161d2b] border border-indigo-500/30 hover:border-indigo-400 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <span>06. Signals & Scopes</span>
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Virtual 2-channel oscilloscope with trigger controls, square/sine signal generators, and clock line analysis.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* --- SECTION 4: COMLAB AERIAL DIGITAL TWIN --- */}
      {(selectedSection === 'all' || selectedSection === 'comlab') &&
        matchesSearch('comlab spatial void digital twin benches led rows') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-gray-800 pb-3">
              <Monitor className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4. ComLab Status Aerial Digital Twin (Rows A–D)
              </h3>
            </div>

            <p className="text-gray-300 leading-relaxed font-sans">
              ComLab is a full-viewport, 2D top-down interactive canvas representing the physical vocational computer room:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-[#161d2b] p-4 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Navigation & Controls
                </h4>
                <ul className="text-[11px] text-gray-300 font-sans space-y-1 list-disc pl-4">
                  <li><strong>Pan:</strong> Left-Click or Right-Click and drag anywhere across the void.</li>
                  <li><strong>Zoom:</strong> Scroll wheel or pinch gesture (0.3x to 3.0x scale).</li>
                  <li><strong>Exit View:</strong> Click the floating glowing "EXIT LAB VIEW" door in the top-left to return to the dashboard.</li>
                </ul>
              </div>

              <div className="bg-[#161d2b] p-4 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  LED Telemetry Indicators
                </h4>
                <div className="space-y-1 text-[11px] font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span><strong>Green:</strong> Workstation good & operational.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span><strong>Orange:</strong> Attention needed (e.g., PC C3 unplugged power lead).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span><strong>Blinking Red:</strong> Emergency / Zero parts inside (e.g., PC C4).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <span><strong>Slate / Gray:</strong> Unconfigured or offline.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* --- SECTION 5: ASSET INVENTORY & AI CAMERA AUTOFILL --- */}
      {(selectedSection === 'all' || selectedSection === 'assets') &&
        matchesSearch('asset inventory camera autofill qr serial blank') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-purple-400 border-b border-gray-800 pb-3">
              <Camera className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                5. Asset Inventory & AI Photo Autofill
              </h3>
            </div>

            <p className="text-gray-300 leading-relaxed font-sans">
              Registering laptops and desktop towers is 100% automated via Gemini Vision:
            </p>

            <div className="space-y-3 pt-1">
              <div className="bg-[#161d2b] p-4 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  How to use the Camera Autofill:
                </h4>
                <ol className="text-[11px] text-gray-300 font-sans space-y-1.5 list-decimal pl-4">
                  <li>Click <strong>"Snap & Autofill (AI Vision)"</strong> in the header or Assets tab.</li>
                  <li>Hold the laptop up to the camera or upload photos of the <strong>bottom sticker</strong> (where serial numbers and QR/barcodes are printed).</li>
                  <li>Click <strong>"Analyze Photos & Autofill"</strong>. Gemini Vision automatically reads the QR code, serial number, make/model, CPU, RAM, and storage!</li>
                  <li>Auto-detected fields light up in <strong>emerald green</strong> with "AI Scanned" badges.</li>
                  <li>Mark if the unit has any defect (1-click CompTIA problem presets) and select location (use <strong>"Blank (Unassigned)"</strong> if it has no bench yet).</li>
                  <li>Click <strong>"Save Asset to Inventory"</strong>. Done in seconds!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      {/* --- SECTION 6: KEYBOARD SHORTCUTS & THEMES --- */}
      {(selectedSection === 'all' || selectedSection === 'shortcuts') &&
        matchesSearch('shortcuts theme dark light command palette') && (
          <div className="bg-[#111620] border border-[#232d3f] rounded-2xl p-5 lg:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-teal-400 border-b border-gray-800 pb-3">
              <Palette className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                6. Keyboard Shortcuts & Theme Engine
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161d2b] p-4 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs">Keyboard Shortcuts</h4>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-[#0d121c]">
                    <span>Command Palette Search</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-cyan-300">
                      ⌘K / Ctrl+K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#0d121c]">
                    <span>Exit Spotlight Tour / Modals</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-cyan-300">
                      Escape
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#0d121c]">
                    <span>Advance Tour Step</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-cyan-300">
                      &rarr; / Enter
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="bg-[#161d2b] p-4 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs">Theme Modes</h4>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Open <strong>Settings (Gear Icon)</strong> in the top header to toggle between:
                </p>
                <div className="space-y-1.5 text-[11px] font-sans">
                  <div className="p-2 rounded bg-[#0d121c] border border-gray-800">
                    <strong className="text-cyan-400 font-mono">Dark Industrial (Default):</strong> Deep charcoal slate with cyan/emerald LED status glows.
                  </div>
                  <div className="p-2 rounded bg-white text-gray-900 border border-gray-300">
                    <strong className="text-blue-700 font-mono">High Contrast Light:</strong> Crisp clean white background designed for bright classrooms and overhead projectors.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
