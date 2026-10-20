import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LabJobRole, User } from '../types';
import {
  ShieldAlert,
  HardHat,
  Users,
  Wind,
  Tag,
  Clock,
  BatteryCharging,
  GraduationCap,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Camera,
  QrCode,
  FileText,
  UserCheck,
  Send,
  X,
  Sliders,
  ChevronRight,
  Flame,
  Thermometer,
  Layers,
  Cpu,
} from 'lucide-react';

export const RoleQuickActionsBar: React.FC = () => {
  const {
    currentUser,
    users,
    setActiveTab,
    setIsPhotoAutofillModalOpen,
    setIsScannerModalOpen,
    updateUserJobs,
    timeClockEntries,
    hardwareAssets,
    addToast,
    saveCalendarLog,
  } = useApp();

  // Active Sub-Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Safety Audit State
  const [esdChecked, setEsdChecked] = useState(true);
  const [fumeChecked, setFumeChecked] = useState(true);
  const [glassesChecked, setGlassesChecked] = useState(true);
  const [extinguisherChecked, setExtinguisherChecked] = useState(true);
  const [hazardNote, setHazardNote] = useState('');

  // Environment State
  const [labTemp, setLabTemp] = useState('71');
  const [labHumidity, setLabHumidity] = useState('42');
  const [floorClear, setFloorClear] = useState(true);
  const [toolsRacked, setToolsRacked] = useState(true);

  // Ambassador State
  const [visitorName, setVisitorName] = useState('');
  const [visitorAffiliation, setVisitorAffiliation] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('FETC Technical Tour');
  const [visitorLog, setVisitorLog] = useState<Array<{ name: string; org: string; time: string }>>([
    { name: 'Dr. Henderson', org: 'Superintendent Office', time: '09:15 AM' },
    { name: 'Sarah Miller', org: 'Cisco Networking Liaison', time: '10:30 AM' },
  ]);

  // Cart Management State
  const [cart1Count, setCart1Count] = useState('24');
  const [cart2Count, setCart2Count] = useState('22');
  const [cablesLocked, setCablesLocked] = useState(true);

  // Teacher Console State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(users[1]?.id || '');
  const [assignedRoleDraft, setAssignedRoleDraft] = useState<LabJobRole>('jobless');

  // If user is guest or has no profile selected
  const jobs: LabJobRole[] = currentUser?.assignedJobs || ['jobless'];
  const isTeacher = currentUser?.isTeacher || currentUser?.assignedJobs?.includes('teacher');

  const ROLE_CONFIG: Record<
    LabJobRole,
    { label: string; icon: React.ReactNode; color: string; desc: string }
  > = {
    team_safety_manager: {
      label: 'Team Safety Manager',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/40 bg-red-950/20 text-red-300',
      desc: 'Enforce ESD protocols, solder ventilation, and emergency checks',
    },
    foreman: {
      label: 'Foreman',
      icon: <HardHat className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      desc: 'Oversee workstation progress and triage dispatching',
    },
    ambassador: {
      label: 'Ambassador',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      desc: 'Welcome guests, lead lab tours, and explain student projects',
    },
    environment_manager: {
      label: 'Environment Manager',
      icon: <Wind className="w-4 h-4 text-teal-400" />,
      color: 'border-teal-500/40 bg-teal-950/20 text-teal-300',
      desc: 'Manage room climate, tool organization, and clean benches',
    },
    asset_manager: {
      label: 'Asset Manager',
      icon: <Tag className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      desc: 'Track PC hardware inventory, serials, and AI vision intake',
    },
    clock_in_manager: {
      label: 'Clock In Manager',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      desc: 'Audit technician attendance and workstation station logs',
    },
    cart_management: {
      label: 'Cart Management',
      icon: <BatteryCharging className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      desc: 'Audit laptop cart charging bays, locks, and returns',
    },
    teacher: {
      label: 'Instructor / Teacher',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-bold',
      desc: 'Master classroom authority, assign student roles, and review lab stats',
    },
    jobless: {
      label: 'General Technician',
      icon: <Wrench className="w-4 h-4 text-gray-400" />,
      color: 'border-gray-700 bg-gray-900/60 text-gray-300',
      desc: 'Active lab technician with full access to all diagnostic suites',
    },
  };

  const handleSaveSafetyAudit = () => {
    setActiveModal(null);
    addToast({
      type: 'success',
      title: 'Safety Audit Recorded',
      message: 'ESD, ventilation, and extinguisher checks verified for current shift.',
    });
  };

  const handleReportHazard = () => {
    if (!hazardNote.trim()) return;
    saveCalendarLog({
      dateString: new Date().toISOString().split('T')[0],
      specialNotesAndSafety: `[Safety Alert by ${currentUser?.displayName || 'Tech'}]: ${hazardNote.trim()}`,
    });
    setHazardNote('');
    setActiveModal(null);
    addToast({
      type: 'warning',
      title: 'Hazard Alert Logged',
      message: 'Safety hazard posted to the lab calendar and supervisor dashboard.',
    });
  };

  const handleSaveEnvironment = () => {
    setActiveModal(null);
    addToast({
      type: 'success',
      title: 'Environment Log Saved',
      message: `Lab at ${labTemp}°F, ${labHumidity}% RH. Benches & tool racks cleared.`,
    });
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitorLog((prev) => [
      { name: visitorName.trim(), org: visitorAffiliation.trim() || 'Guest', time: now },
      ...prev,
    ]);
    setVisitorName('');
    setVisitorAffiliation('');
    addToast({
      type: 'success',
      title: 'Visitor Logged',
      message: `Ambassador greeted ${visitorName.trim()} into the lab.`,
    });
  };

  const handleAssignRoleTeacher = () => {
    if (!selectedStudentId) return;
    updateUserJobs(selectedStudentId, [assignedRoleDraft]);
    setActiveModal(null);
  };

  return (
    <>
      {/* Pinned Quick Action Strip */}
      <div
        data-tour="tour-roles"
        className="bg-[#111620] border border-[#232d3f] rounded-2xl p-3 sm:p-4 shadow-xl font-mono text-xs transition-all"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* User & Role Badge Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              {isTeacher ? (
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              ) : (
                <Wrench className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-sm">
                  {currentUser ? currentUser.displayName : 'Guest Technician'}
                </span>
                <span className="text-[10px] text-gray-500">•</span>
                <span className="text-[11px] text-gray-400">
                  {currentUser?.benchStation || 'Open Bench'}
                </span>

                {/* Role Badges */}
                {jobs.map((job) => {
                  const cfg = ROLE_CONFIG[job] || ROLE_CONFIG.jobless;
                  return (
                    <span
                      key={job}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}
                    >
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </span>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 mt-0.5">
                {isTeacher
                  ? 'Instructor Command: Full administrative supervision, student role management, and gradebook overrides.'
                  : 'Your assigned duty unlocks quick-action shortcuts below. You maintain 100% full access to all lab modules.'}
              </p>
            </div>
          </div>

          {/* Quick Action Shortcuts depending on Role */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* TEACHER ROLE TOOLS */}
            {isTeacher && (
              <button
                onClick={() => setActiveModal('teacher_console')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teacher Console (Roles & Roster)</span>
              </button>
            )}

            {/* TEAM SAFETY MANAGER TOOLS */}
            {jobs.includes('team_safety_manager') && (
              <>
                <button
                  onClick={() => setActiveModal('safety_audit')}
                  className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Safety Protocol Audit</span>
                </button>
                <button
                  onClick={() => setActiveModal('hazard_report')}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Hazard</span>
                </button>
              </>
            )}

            {/* FOREMAN TOOLS */}
            {jobs.includes('foreman') && (
              <>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dispatch Bench Work Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('time_clock')}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Technicians ({users.filter((u) => u.clockedIn).length})</span>
                </button>
              </>
            )}

            {/* AMBASSADOR TOOLS */}
            {jobs.includes('ambassador') && (
              <>
                <button
                  onClick={() => setActiveModal('visitor_log')}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/50 text-purple-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Visitor Greeting Log</span>
                </button>
                <button
                  onClick={() => setActiveModal('tour_script')}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Orientation Script</span>
                </button>
              </>
            )}

            {/* ENVIRONMENT MANAGER TOOLS */}
            {jobs.includes('environment_manager') && (
              <button
                onClick={() => setActiveModal('environment_audit')}
                className="px-3 py-1.5 rounded-xl bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/50 text-teal-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Lab Climate & Cleanliness Check</span>
              </button>
            )}

            {/* ASSET MANAGER TOOLS */}
            {jobs.includes('asset_manager') && (
              <>
                <button
                  onClick={() => setIsPhotoAutofillModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
                  title="Snap photo of QR code or serial sticker to autofill"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap & Autofill (AI Vision)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('assets');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Asset Triage ({hardwareAssets.length})</span>
                </button>
              </>
            )}

            {/* CLOCK IN MANAGER TOOLS */}
            {jobs.includes('clock_in_manager') && (
              <>
                <button
                  onClick={() => setActiveTab('time_clock')}
                  className="px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/50 text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Attendance Roll Call</span>
                </button>
              </>
            )}

            {/* CART MANAGEMENT TOOLS */}
            {jobs.includes('cart_management') && (
              <button
                onClick={() => setActiveModal('cart_audit')}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                <span>Laptop Cart #1 & #2 Audit</span>
              </button>
            )}

            {/* GENERAL TECHNICIAN / JOBLESS TOOLS */}
            {(jobs.includes('jobless') || jobs.length === 0) && (
              <>
                <button
                  onClick={() => setActiveTab('diagnostic')}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hardware Wizard</span>
                </button>
                <button
                  onClick={() => setActiveTab('gemini')}
                  className="px-3 py-1.5 rounded-xl bg-[#161d2b] hover:bg-[#20293a] border border-[#232d3f] text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Copilot</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL: TEACHER COMMAND CONSOLE (MR. MCKISMIC) --- */}
      {activeModal === 'teacher_console' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Teacher Command Console</h3>
                  <p className="text-[11px] text-gray-400">
                    Fred W. Eberle Technical Center • Instructor Mr. McKismic
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] text-gray-300 font-bold block">
                Assign / Reassign Student Lab Duty:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#161d2b] p-3 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Assign Job Duty</label>
                  <select
                    value={assignedRoleDraft}
                    onChange={(e) => setAssignedRoleDraft(e.target.value as LabJobRole)}
                    className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="jobless">Jobless / General Tech</option>
                    <option value="team_safety_manager">Team Safety Manager (Xavier W.)</option>
                    <option value="foreman">Foreman (Jason F.)</option>
                    <option value="ambassador">Ambassador (Jason F.)</option>
                    <option value="environment_manager">Environment Manager (Katrina/Bridget)</option>
                    <option value="asset_manager">Asset Manager (Katrina/Bridget)</option>
                    <option value="clock_in_manager">Clock In Manager (Remington W.)</option>
                    <option value="cart_management">Cart Management (Remington W.)</option>
                    <option value="teacher">Instructor / Teacher</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAssignRoleTeacher}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Save Duty Assignment
                </button>
              </div>

              {/* Roster Overview Table */}
              <div className="pt-2 border-t border-gray-800">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-2">
                  Active Classroom Roster:
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0d121c] border border-gray-800"
                    >
                      <div>
                        <span className="text-white font-bold">{u.displayName}</span>
                        <span className="text-gray-500 text-[10px] ml-2">@{u.username}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(u.assignedJobs || ['jobless']).map((j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 rounded text-[9px] bg-gray-800 text-cyan-300 border border-gray-700"
                          >
                            {ROLE_CONFIG[j]?.label || j}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SAFETY AUDIT (XAVIER W.) --- */}
      {activeModal === 'safety_audit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white">Daily ESD & Safety Inspection</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Team Safety Manager Protocol: Inspect grounding cords, eyewash station, and soldering ventilation before lab triage begins.
            </p>

            <div className="space-y-2 bg-[#161d2b] p-3 rounded-xl border border-gray-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={esdChecked}
                  onChange={(e) => setEsdChecked(e.target.checked)}
                  className="rounded border-gray-700 text-red-500"
                />
                <span className="text-gray-200">ESD Mats & Grounding Straps 1MΩ Verified</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fumeChecked}
                  onChange={(e) => setFumeChecked(e.target.checked)}
                  className="rounded border-gray-700 text-red-500"
                />
                <span className="text-gray-200">Solder Fume Extractors Powered & Filtered</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={glassesChecked}
                  onChange={(e) => setGlassesChecked(e.target.checked)}
                  className="rounded border-gray-700 text-red-500"
                />
                <span className="text-gray-200">ANSI Z87 Safety Glasses Worn at Rework Benches</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extinguisherChecked}
                  onChange={(e) => setExtinguisherChecked(e.target.checked)}
                  className="rounded border-gray-700 text-red-500"
                />
                <span className="text-gray-200">Class C Fire Extinguisher Gauge in Green Zone</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSafetyAudit}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Submit Safety Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: HAZARD REPORT (XAVIER W.) --- */}
      {activeModal === 'hazard_report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Log Safety Hazard / Concern</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] mb-1">Hazard Details</label>
              <textarea
                rows={3}
                value={hazardNote}
                onChange={(e) => setHazardNote(e.target.value)}
                placeholder="e.g. Frayed AC power cord on Bench 4, swelling lithium pouch battery in triage box..."
                className="w-full bg-[#161d2b] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReportHazard}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Post Hazard Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: AMBASSADOR VISITOR LOG (JASON F.) --- */}
      {activeModal === 'visitor_log' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-purple-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Ambassador Visitor Greeting Log</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVisitor} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Visitor Name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="bg-[#161d2b] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Organization / School"
                  value={visitorAffiliation}
                  onChange={(e) => setVisitorAffiliation(e.target.value)}
                  className="bg-[#161d2b] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                + Register Visitor Entry
              </button>
            </form>

            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Today's Guest Register:
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {visitorLog.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#161d2b] text-gray-300 text-[11px]"
                  >
                    <div>
                      <span className="text-white font-bold">{v.name}</span>
                      <span className="text-gray-500 ml-2">({v.org})</span>
                    </div>
                    <span className="text-purple-400 text-[10px]">{v.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: AMBASSADOR ORIENTATION SCRIPT (JASON F.) --- */}
      {activeModal === 'tour_script' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-purple-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Lab Tour Talking Points</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-[#161d2b] p-3 rounded-xl border border-gray-800 text-[11px] text-gray-300 leading-relaxed">
              <p>
                <strong className="text-cyan-400">1. Welcome:</strong> "Welcome to the Fred W. Eberle Technical Center Computer Repair & Networking Lab! Here we train in CompTIA A+, Cisco Systems, and electronics rework."
              </p>
              <p>
                <strong className="text-emerald-400">2. Active Benches:</strong> "Across Rows A-D, technicians repair real laptops and desktops with oscilloscope diagnostics and SMD soldering."
              </p>
              <p>
                <strong className="text-amber-400">3. Digital Twin:</strong> "Every bench is tracked in real-time on our ComLab digital twin dashboard with live power and network status."
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold"
            >
              Close Script
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: ENVIRONMENT AUDIT (KATRINA C. & BRIDGET C.) --- */}
      {activeModal === 'environment_audit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-teal-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Lab Climate & Cleanliness Check</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#161d2b] p-3 rounded-xl border border-gray-800">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Room Temp (°F)</label>
                <input
                  type="number"
                  value={labTemp}
                  onChange={(e) => setLabTemp(e.target.value)}
                  className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Humidity (% RH)</label>
                <input
                  type="number"
                  value={labHumidity}
                  onChange={(e) => setLabHumidity(e.target.value)}
                  className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="space-y-2 bg-[#161d2b] p-3 rounded-xl border border-gray-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={floorClear}
                  onChange={(e) => setFloorClear(e.target.checked)}
                  className="rounded border-gray-700 text-teal-500"
                />
                <span className="text-gray-200">Floors clear of cords and tripping hazards</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={toolsRacked}
                  onChange={(e) => setToolsRacked(e.target.checked)}
                  className="rounded border-gray-700 text-teal-500"
                />
                <span className="text-gray-200">Soldering irons powered down & screwdrivers racked</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEnvironment}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
              >
                Log Environment Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CART AUDIT (REMINGTON W.) --- */}
      {activeModal === 'cart_audit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#111620] border border-cyan-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Laptop Cart #1 & #2 Charging Audit</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#161d2b] p-3 rounded-xl border border-gray-800">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Cart #1 Laptops Docked</label>
                <input
                  type="number"
                  value={cart1Count}
                  onChange={(e) => setCart1Count(e.target.value)}
                  className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Cart #2 Laptops Docked</label>
                <input
                  type="number"
                  value={cart2Count}
                  onChange={(e) => setCart2Count(e.target.value)}
                  className="w-full bg-[#0d121c] border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 bg-[#161d2b] p-3 rounded-xl border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={cablesLocked}
                onChange={(e) => setCablesLocked(e.target.checked)}
                className="rounded border-gray-700 text-cyan-500"
              />
              <span className="text-gray-200">Charging AC adapters plugged into surge timer strip</span>
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  addToast({
                    type: 'success',
                    title: 'Cart Audit Logged',
                    message: `Cart 1 (${cart1Count}/24) & Cart 2 (${cart2Count}/24) charging verified.`,
                  });
                }}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Save Cart Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
