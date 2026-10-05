import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  FileText,
  Trash2,
  Archive,
  ArrowRight,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Save,
  Tag,
  Wrench,
  Laptop,
  Radio,
  Check,
  Sparkles,
  Layers,
  Crown,
  User,
  Users,
  AlertCircle,
  Activity,
  Cpu,
  Monitor,
  Flame,
} from 'lucide-react';
import { DailyActivityLog, ProjectPriority, ProjectStage, ProjectWorkOrder, LabDayStatus } from '../types';

const BENCH_STATIONS_LIST = [
  'Instructor Master Bench #1',
  'Bench 02 (Power & Load Test)',
  'Bench 03 (SMD Solder Rework)',
  'Bench 04 (Component Diagnostics)',
  'Bench 05 (VRM & Signal Integrity)',
  'Bench 06 (Thermal & Coolers)',
  'Bench 07 (Storage & RAID Array)',
  'Bench 08 (Network & Cabling)',
  'Bench 09 (OS & Driver Staging)',
  'Bench 10 (GPU & PCIe Triage)',
  'Bench 11 (Laptop Teardown & Battery)',
  'Bench 12 (Firmware & SPI Flash)',
  'Bench 13 (Apple Mac / Logic Board)',
  'Bench 14 (Oscilloscope / Protocol Bay)',
  'Bench 15 (Audio & Sensor Calibration)',
  'Bench 16 (Quality Assurance Final Burn-in)',
];

const QUICK_TASK_PRESETS = [
  'Hardware Triage & Power Supply Testing',
  'SMD Component Rework & Soldering',
  'Motherboard VRM & Signal Integrity',
  'Thermal Repasting & Cooler Assembly',
  'Network Cabling & Switch Configuration',
  'OS Deployment & Driver Verification',
  'Laptop Teardown & Battery Diagnostics',
  'PCIe GPU Rail Testing & FurMark Burn-in',
  'BIOS SPI EEPROM Flash Recovery',
  'Data Recovery & Bad Sector Scanning',
];

export const LabCalendar: React.FC = () => {
  const {
    isOwner,
    currentUser,
    users,
    switchUserQuick,
    setIsAuthModalOpen,
    updateUserWorkstation,
    calendarLogs,
    saveCalendarLog,
    selectedDate,
    setSelectedDate,
    projects,
    addProject,
    updateProject,
    archiveProject,
    deleteProject,
    exportDataJson,
    exportDataTxt,
  } = useApp();

  const isAdmin = currentUser?.role === 'ROLE_OWNER';
  const isWorker = currentUser?.role === 'ROLE_WORKER' || currentUser?.role === 'ROLE_STUDENT';
  const isGuest = currentUser === null;

  // Active view: Calendar & Day Log | Workstation Hub | Projects Board
  const [boardTab, setBoardTab] = useState<'calendar' | 'workstation' | 'projects'>('calendar');

  // Worker Workstation Local Edit State
  const [selectedBench, setSelectedBench] = useState<string>(
    currentUser?.benchStation || 'Bench 02 (Power & Load Test)'
  );
  const [activeTaskInput, setActiveTaskInput] = useState<string>(
    currentUser?.currentTask || 'General Hardware Diagnostics & Triage'
  );

  // New Work Order Modal / Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBench, setNewBench] = useState<string>('Bench 02');
  const [newTech, setNewTech] = useState<string>(currentUser?.displayName || 'Julian');
  const [newClient, setNewClient] = useState<string>('Student Services');
  const [newDevice, setNewDevice] = useState<string>('Desktop PC');
  const [newFault, setNewFault] = useState<string>('');
  const [newPriority, setNewPriority] = useState<ProjectPriority>('Normal');
  const [newStage, setNewStage] = useState<ProjectStage>('Intake');

  // Archive Outcome Modal State
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');

  // Day Activity Logger State for Selected Date
  const currentDayLog = calendarLogs.find((l) => l.dateString === selectedDate);
  const [dayStatus, setDayStatus] = useState<LabDayStatus>(currentDayLog?.status || 'in_progress');
  const [dayTopics, setDayTopics] = useState<string>(currentDayLog?.topicsCovered || '');
  const [dayRepairs, setDayRepairs] = useState<string>(currentDayLog?.benchRepairsPerformed || '');
  const [dayParts, setDayParts] = useState<string>(currentDayLog?.partsUsedOrOrdered || '');
  const [dayNotes, setDayNotes] = useState<string>(currentDayLog?.specialNotesAndSafety || '');

  // Worker daily submission state
  const [workerNoteInput, setWorkerNoteInput] = useState<string>('');

  // Dynamic Month & Year Navigation State (0-indexed month)
  const initialDateParts = (selectedDate || '').split('-');
  const [viewYear, setViewYear] = useState<number>(() => {
    return initialDateParts.length === 3 ? parseInt(initialDateParts[0], 10) || 2026 : 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return initialDateParts.length === 3 ? (parseInt(initialDateParts[1], 10) - 1) || 9 : 9;
  });

  const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // When selectedDate changes, sync form values
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    const log = calendarLogs.find((l) => l.dateString === dateStr);
    if (log) {
      setDayStatus(log.status);
      setDayTopics(log.topicsCovered);
      setDayRepairs(log.benchRepairsPerformed);
      setDayParts(log.partsUsedOrOrdered);
      setDayNotes(log.specialNotesAndSafety);
    } else {
      setDayStatus('in_progress');
      setDayTopics('');
      setDayRepairs('');
      setDayParts('');
      setDayNotes('');
    }
  };

  const handleSaveDayLog = (e: React.FormEvent) => {
    e.preventDefault();
    saveCalendarLog({
      dateString: selectedDate,
      status: dayStatus,
      topicsCovered: dayTopics,
      benchRepairsPerformed: dayRepairs,
      partsUsedOrOrdered: dayParts,
      specialNotesAndSafety: dayNotes,
    });
  };

  const handleWorkerSubmitDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerNoteInput.trim() || !currentUser) return;

    const techSignature = `[${currentUser.displayName} @ ${currentUser.benchStation || 'Station'}]: ${workerNoteInput.trim()}`;
    const updatedRepairs = dayRepairs
      ? `${dayRepairs}\n• ${techSignature}`
      : `• ${techSignature}`;

    setDayRepairs(updatedRepairs);
    saveCalendarLog({
      dateString: selectedDate,
      status: dayStatus,
      topicsCovered: dayTopics,
      benchRepairsPerformed: updatedRepairs,
      partsUsedOrOrdered: dayParts,
      specialNotesAndSafety: dayNotes,
    });
    setWorkerNoteInput('');
  };

  const handleClockInToggle = () => {
    if (!currentUser) return;
    const nextClockedIn = !currentUser.clockedIn;
    updateUserWorkstation(
      currentUser.id,
      selectedBench,
      activeTaskInput,
      nextClockedIn
    );
  };

  const handleUpdateTaskOnly = () => {
    if (!currentUser) return;
    updateUserWorkstation(
      currentUser.id,
      selectedBench,
      activeTaskInput,
      currentUser.clockedIn ?? true
    );
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFault.trim()) return;

    addProject({
      title: newTitle,
      benchNumber: newBench,
      technicianName: newTech,
      clientOrDepartment: newClient,
      deviceType: newDevice,
      reportedFault: newFault,
      priority: newPriority,
      stage: newStage,
    });

    setNewTitle('');
    setNewFault('');
    setShowAddProjectModal(false);
  };

  const handleConfirmArchive = () => {
    if (!archiveTargetId) return;
    archiveProject(archiveTargetId, outcomeNotes || 'Repair verified and passed diagnostic QA.');
    setArchiveTargetId(null);
    setOutcomeNotes('');
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const todayStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    setViewYear(y);
    setViewMonth(m);
    handleDateSelect(todayStr);
  };

  // Generate dynamic calendar grid
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  interface CalendarGridCell {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    log?: DailyActivityLog;
  }

  const calendarGridCells: CalendarGridCell[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${prevYear}-${(prevMonthIdx + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    const log = calendarLogs.find((l) => l.dateString === dateStr);
    calendarGridCells.push({ dateStr, dayNum, isCurrentMonth: false, isToday: dateStr === todayStr, log });
  }

  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const log = calendarLogs.find((l) => l.dateString === dateStr);
    calendarGridCells.push({ dateStr, dayNum: day, isCurrentMonth: true, isToday: dateStr === todayStr, log });
  }

  const totalSlots = calendarGridCells.length > 35 ? 42 : 35;
  const remainingSlots = totalSlots - calendarGridCells.length;
  for (let day = 1; day <= remainingSlots; day++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${nextYear}-${(nextMonthIdx + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const log = calendarLogs.find((l) => l.dateString === dateStr);
    calendarGridCells.push({ dateStr, dayNum: day, isCurrentMonth: false, isToday: dateStr === todayStr, log });
  }

  // Count active clocked in users
  const clockedInWorkers = users.filter((u) => u.clockedIn);

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base lg:text-lg font-bold text-white font-mono">
                    Lab Operations & Workstation Manager
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      isAdmin
                        ? 'bg-emerald-500/20 text-[#2ea043] border border-emerald-500/30'
                        : currentUser
                        ? 'bg-sky-500/20 text-[#38bdf8] border border-sky-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {isAdmin
                      ? '👑 Master Admin (Julian)'
                      : currentUser
                      ? `🛠️ Worker (${currentUser.displayName})`
                      : '👤 Guest Tech'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAdmin
                    ? 'Supervise 16 bench stations, track live tech clock-ins, edit master class logs, and manage work orders.'
                    : currentUser
                    ? `Clock in to your workstation (${currentUser.benchStation || 'Bench'}), log active repair tasks, and update daily records.`
                    : 'Select a profile or sign in to clock in to workstations and log daily technician operations.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tabs & Profile Fast Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-[#30363d] text-xs font-mono">
              <button
                onClick={() => setBoardTab('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  boardTab === 'calendar'
                    ? 'bg-[#21262d] text-amber-300 shadow-sm border border-[#30363d] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar & Logs</span>
              </button>

              <button
                onClick={() => setBoardTab('workstation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  boardTab === 'workstation'
                    ? 'bg-[#21262d] text-cyan-300 shadow-sm border border-[#30363d] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Workstation Hub</span>
                {clockedInWorkers.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                    {clockedInWorkers.length} Live
                  </span>
                )}
              </button>

              <button
                onClick={() => setBoardTab('projects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  boardTab === 'projects'
                    ? 'bg-[#21262d] text-purple-300 shadow-sm border border-[#30363d] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Work Orders ({projects.length})</span>
              </button>
            </div>

            {/* Quick Profile Switcher Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-300 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Switch Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: WORKSTATION HUB (Clock-In & Active Task Logger) */}
      {boardTab === 'workstation' && (
        <div className="space-y-6">
          {/* Active User Workstation Bar */}
          {currentUser ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">Technician:</span>
                    <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      {currentUser.displayName}
                      {isAdmin && <Crown className="w-4 h-4 text-amber-400" />}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        currentUser.clockedIn
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {currentUser.clockedIn ? '● CLOCKED IN (ACTIVE)' : '○ CLOCKED OUT (STANDBY)'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currentUser.clockedIn
                      ? `Active session logged since ${currentUser.clockInTime || 'shift start'} at ${currentUser.benchStation || selectedBench}.`
                      : 'Select your target station below and click Clock In to begin logging work activity.'}
                  </p>
                </div>

                <button
                  onClick={handleClockInToggle}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 ${
                    currentUser.clockedIn
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-950/40'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{currentUser.clockedIn ? 'Clock Out of Station' : 'Clock In to Station'}</span>
                </button>
              </div>

              {/* Station Selection & Task Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Station Selection */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Assigned Workstation / Bench Station</span>
                  </label>
                  <select
                    value={selectedBench}
                    onChange={(e) => setSelectedBench(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {BENCH_STATIONS_LIST.map((bench) => (
                      <option key={bench} value={bench}>
                        {bench}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Task */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>What are you working on right now? (Current Task)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={activeTaskInput}
                      onChange={(e) => setActiveTaskInput(e.target.value)}
                      placeholder="e.g. SMD soldering rework on Bench 03..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleUpdateTaskOnly}
                      className="px-3.5 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-cyan-400 hover:text-white text-xs font-mono transition-colors"
                      title="Update active status description"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Task Preset Chips */}
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TASK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setActiveTaskInput(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors border ${
                        activeTaskInput === preset
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-center space-y-3">
              <Users className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-sm font-bold text-white font-mono">Select a Profile to Clock In</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Select your worker profile (Kylin, Jason, Tristan, Xaiver, Remington, Katrina, Bridget) or Julian (Admin) to clock into a station.
              </p>
              <div className="flex justify-center gap-2 flex-wrap pt-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUserQuick(u.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-300 hover:text-white transition-colors"
                  >
                    {u.displayName} ({u.role === 'ROLE_OWNER' ? 'Admin' : 'Worker'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Master Live Floor Grid (Shows all 16 Benches) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Live Lab Floor Bench Status (16 Stations)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time telemetry of all technician assignments and active bench triage sessions.
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Active Techs: <span className="text-emerald-400 font-bold">{clockedInWorkers.length}</span> / 16
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BENCH_STATIONS_LIST.map((bench, idx) => {
                const assignedWorker = users.find(
                  (u) => u.benchStation === bench || u.benchStation?.startsWith(`Bench ${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}`)
                );
                const isOccupied = !!assignedWorker && assignedWorker.clockedIn;

                return (
                  <div
                    key={bench}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOccupied
                        ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold font-mono text-white truncate">
                        {bench.split(' ')[0]} {bench.split(' ')[1] || ''}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOccupied ? 'bg-emerald-400 animate-ping' : 'bg-gray-700'
                        }`}
                      ></span>
                    </div>

                    <p className="text-[10px] font-mono text-gray-500 truncate mb-2">
                      {bench.includes('(') ? bench.substring(bench.indexOf('(')) : 'General Triage'}
                    </p>

                    {isOccupied && assignedWorker ? (
                      <div className="space-y-1 bg-[#161b22] p-2 rounded-lg border border-emerald-500/30 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>{assignedWorker.displayName}</span>
                          <span className="text-[9px] text-gray-400">{assignedWorker.clockInTime || 'Active'}</span>
                        </div>
                        <p className="text-gray-300 text-[10px] line-clamp-2 leading-tight">
                          {assignedWorker.currentTask || 'Diagnostics'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-black/30 border border-gray-800 text-[10px] font-mono text-gray-500 text-center">
                        Station Vacant
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR & DAY ACTIVITY LOGGER */}
      {boardTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dynamic Month Navigation & Interactive Grid */}
          <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3 className="text-base font-bold text-white font-mono min-w-[170px] text-center">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleJumpToToday}
                  className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-gray-500 font-semibold py-1">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarGridCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const hasLog = !!cell.log;
                const status = cell.log?.status;

                let badgeColor = 'bg-gray-800';
                if (status === 'completed') badgeColor = 'bg-emerald-500';
                else if (status === 'in_progress') badgeColor = 'bg-cyan-500';
                else if (status === 'issue_hold') badgeColor = 'bg-amber-500';

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => handleDateSelect(cell.dateStr)}
                    className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between transition-all text-left relative ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg'
                        : cell.isCurrentMonth
                        ? 'bg-[#0d1117] border-[#30363d] hover:border-gray-500'
                        : 'bg-black/30 border-gray-900/60 text-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-bold ${
                          cell.isToday
                            ? 'w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center'
                            : cell.isCurrentMonth
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {hasLog && (
                        <span
                          className={`w-2 h-2 rounded-full ${badgeColor}`}
                          title={`Status: ${status}`}
                        ></span>
                      )}
                    </div>

                    {hasLog && (
                      <div className="w-full">
                        <span className="text-[9px] font-mono text-gray-400 block truncate leading-tight">
                          {cell.log?.benchRepairsPerformed || cell.log?.topicsCovered || 'Logged'}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-3 border-t border-[#30363d]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> In Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Issue / Hold
                </span>
              </div>
              <span>Persistent across months</span>
            </div>
          </div>

          {/* Right Column: Day Log Editor / Submission Hub */}
          <div className="lg:col-span-5 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Day Activity Log ({selectedDate})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAdmin
                    ? 'Master record editor with full administrative overwrite permissions.'
                    : 'Submit your technician repair log entries for this date.'}
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={exportDataJson}
                    className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-white transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* If Julian (Admin): Full Master Form */}
            {isAdmin ? (
              <form onSubmit={handleSaveDayLog} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Day Status</label>
                  <select
                    value={dayStatus}
                    onChange={(e) => setDayStatus(e.target.value as LabDayStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="in_progress">🟡 In Progress / Active Bench Session</option>
                    <option value="completed">🟢 Completed / All Stations Cleared</option>
                    <option value="issue_hold">🔴 Issue / Pending Parts Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Curriculum & Topics Covered</label>
                  <input
                    type="text"
                    value={dayTopics}
                    onChange={(e) => setDayTopics(e.target.value)}
                    placeholder="e.g. CompTIA Core 1 PSU Rail Voltage Verification..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Bench Repairs & Worker Logs</label>
                  <textarea
                    rows={4}
                    value={dayRepairs}
                    onChange={(e) => setDayRepairs(e.target.value)}
                    placeholder="• Tech logs and repairs performed..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[11px] mb-1">Special Notes & Safety Protocols</label>
                  <input
                    type="text"
                    value={dayNotes}
                    onChange={(e) => setDayNotes(e.target.value)}
                    placeholder="e.g. ESD grounding mats tested and verified..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Master Day Record (Firestore Sync)</span>
                </button>
              </form>
            ) : (
              /* If Worker: Daily Log Appender */
              <div className="space-y-4 text-xs font-mono">
                {/* Existing Day Overview */}
                <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Day Status:</span>
                    <span className="text-cyan-400 font-bold uppercase">{dayStatus.replace('_', ' ')}</span>
                  </div>
                  {dayTopics && (
                    <div>
                      <span className="text-gray-500 text-[10px] block">Curriculum:</span>
                      <p className="text-gray-200">{dayTopics}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 text-[10px] block mb-1">Logged Repairs & Activity:</span>
                    {dayRepairs ? (
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-black/40 p-2 rounded-lg border border-gray-800 text-[11px]">
                        {dayRepairs}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic text-[11px]">No activity logged for this date yet.</p>
                    )}
                  </div>
                </div>

                {/* Worker Submission Box */}
                {currentUser ? (
                  <form onSubmit={handleWorkerSubmitDailyLog} className="space-y-2.5">
                    <label className="block text-gray-300 text-[11px] font-semibold">
                      Add Your Technician Note / Repair Performed:
                    </label>
                    <textarea
                      rows={3}
                      value={workerNoteInput}
                      onChange={(e) => setWorkerNoteInput(e.target.value)}
                      placeholder={`Describe what you worked on at ${currentUser.benchStation || 'your station'}...`}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!workerNoteInput.trim()}
                      className="w-full py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Append Note to Day Log</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                    <p className="text-gray-400 text-[11px]">Sign in or select a profile to log activity.</p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-cyan-400 text-xs"
                    >
                      Log In / Switch Profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: WORK ORDERS BOARD */}
      {boardTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Work Orders & Repair Kanban
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage ongoing client repair tickets, intake stages, and technician bench queues.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Work Order</span>
              </button>
            )}
          </div>

          {/* Work Orders Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-[#161b22] rounded-2xl border border-dashed border-[#30363d] space-y-3">
              <Wrench className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs font-mono text-gray-400">No active work orders currently in the queue.</p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-mono font-bold"
                >
                  Create First Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                return (
                  <div
                    key={proj.id}
                    className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 space-y-3 shadow-lg hover:border-gray-500 transition-all font-mono text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            proj.priority === 'Urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : proj.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {proj.priority} Priority
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{proj.title}</h4>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete Ticket (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d] space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bench / Tech:</span>
                        <span className="text-cyan-400 font-semibold">{proj.benchNumber} • {proj.technicianName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Device:</span>
                        <span className="text-gray-200">{proj.deviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Client:</span>
                        <span className="text-gray-400">{proj.clientOrDepartment}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500 text-[10px] block mb-0.5">Reported Fault:</span>
                      <p className="text-gray-300 text-[11px] leading-snug">{proj.reportedFault}</p>
                    </div>

                    {/* Stage selector (Both admin and worker can advance stage) */}
                    <div className="pt-2 border-t border-[#30363d] flex items-center justify-between">
                      <span className="text-gray-500 text-[10px]">Stage:</span>
                      <select
                        value={proj.stage}
                        onChange={(e) => updateProject(proj.id, { stage: e.target.value as ProjectStage })}
                        className="px-2 py-1 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-[11px] focus:outline-none focus:border-purple-500"
                      >
                        <option value="Intake">Intake</option>
                        <option value="Diagnostics">Diagnostics</option>
                        <option value="Waiting on Parts">Waiting on Parts</option>
                        <option value="Repair in Progress">Repair in Progress</option>
                        <option value="Burn-in Testing">Burn-in Testing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Work Order Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Create New Work Order Ticket
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Ticket Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Dell XPS 15 Thermal Throttling & VRM Re-paste"
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Bench Station</label>
                  <select
                    value={newBench}
                    onChange={(e) => setNewBench(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                  >
                    {BENCH_STATIONS_LIST.map((b) => (
                      <option key={b} value={b.split(' ')[0] + ' ' + (b.split(' ')[1] || '')}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Assigned Tech</label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.displayName}>
                        {u.displayName} ({u.role === 'ROLE_OWNER' ? 'Admin' : 'Worker'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Device Type</label>
                  <input
                    type="text"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value)}
                    placeholder="Desktop PC, Laptop, Server..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ProjectPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Reported Fault Description</label>
                <textarea
                  rows={3}
                  required
                  value={newFault}
                  onChange={(e) => setNewFault(e.target.value)}
                  placeholder="Details of client complaint or diagnostic symptoms..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
