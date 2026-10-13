import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TimeClockEntry, TimeClockTaskCategory, User, RepairTaskPreset } from '../types';
import { QuickAddRepairChips } from './QuickAddRepairChips';
import { PhotoProofUploader } from './PhotoProofUploader';
import { PhotoViewerModal, PhotoViewerModalData } from './PhotoViewerModal';
import {
  Clock,
  Play,
  Square,
  Plus,
  Trash2,
  Edit3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  FileText,
  ShieldCheck,
  Activity,
  Layers,
  Wrench,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Cpu,
  Monitor,
  RotateCcw,
  Coffee,
  Pause,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Upload,
} from 'lucide-react';

const TASK_CATEGORIES: TimeClockTaskCategory[] = [
  'Diagnostics & Triage',
  'SMD Rework & Soldering',
  'Thermal Repasting & Assembly',
  'OS Deployment & Drivers',
  'Network Cabling & Switches',
  'Laptop Teardown & Battery',
  'Lab Supervision & Safety',
  'General Bench Work',
];

const BENCH_STATIONS = [
  'Instructor Master Bench #1',
  'Bench 02',
  'Bench 03',
  'Bench 04',
  'Bench 05',
  'Bench 06',
  'Bench 07',
  'Bench 08',
  'Bench 09',
  'Bench 10',
  'Bench 11',
  'Bench 12',
  'Bench 13',
  'Bench 14',
  'Bench 15',
  'Bench 16',
  'Server Rack 01',
  'Repair Staging Cage',
];

export const TechnicianTimeClockSuite: React.FC = () => {
  const {
    currentUser,
    users,
    isOwner,
    isAdmin,
    switchUserQuick,
    openAuthModal,
    timeClockEntries,
    clockInTechnician,
    clockOutTechnician,
    toggleTechnicianBreak,
    addShiftPhotos,
    addManualTimeLog,
    deleteTimeLog,
    updateTimeLog,
    exportTimesheetsCsv,
    addToast,
  } = useApp();

  // Active top-level subtab: 'punch_clock' | 'manual_entry' | 'timesheet' | 'admin_floor'
  const [activeSubTab, setActiveSubTab] = useState<'punch_clock' | 'manual_entry' | 'timesheet' | 'admin_floor'>('punch_clock');

  // Currently selected profile for the punch clock (defaults to logged-in user or Julian)
  const activeUser: User = currentUser || users[0] || {
    id: 'user_julian_admin',
    username: 'julian',
    displayName: 'Julian',
    role: 'ROLE_OWNER',
    createdAt: new Date().toISOString(),
    benchStation: 'Instructor Master Bench #1',
    clockedIn: true,
  };

  // Find if this technician has an active clock-in session
  const activeSession = useMemo(() => {
    return timeClockEntries.find((e) => e.userId === activeUser.id && e.status === 'active');
  }, [timeClockEntries, activeUser.id]);

  // Live Dual-Timer Ticker State for active session (Net Work vs Break vs Gross Shift)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0); // Net work time
  const [breakElapsedSeconds, setBreakElapsedSeconds] = useState<number>(0); // Break time
  const [totalShiftSeconds, setTotalShiftSeconds] = useState<number>(0); // Total shift elapsed

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      setBreakElapsedSeconds(0);
      setTotalShiftSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const nowMs = Date.now();
      const startMs = new Date(activeSession.clockIn).getTime();
      const totalShiftSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));

      // Completed break seconds
      const completedBreakSec = (activeSession.breakMinutes || 0) * 60;

      // Live ongoing break seconds if currently paused
      let ongoingBreakSec = 0;
      if (activeSession.isPaused && activeSession.breakStartTime) {
        ongoingBreakSec = Math.max(0, Math.floor((nowMs - new Date(activeSession.breakStartTime).getTime()) / 1000));
      }

      const totalBreakSec = completedBreakSec + ongoingBreakSec;
      const netWorkSec = Math.max(0, totalShiftSec - totalBreakSec);

      setElapsedSeconds(netWorkSec);
      setBreakElapsedSeconds(totalBreakSec);
      setTotalShiftSeconds(totalShiftSec);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimerDigits = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clock In Form State
  const [punchStation, setPunchStation] = useState<string>(activeUser.benchStation || 'Bench 02');
  const [punchCategory, setPunchCategory] = useState<TimeClockTaskCategory>('Diagnostics & Triage');
  const [punchTaskNotes, setPunchTaskNotes] = useState<string>('');
  const [punchPhotos, setPunchPhotos] = useState<string[]>([]);

  // Clock Out Modal State
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState<boolean>(false);
  const [clockOutAccomplishments, setClockOutAccomplishments] = useState<string>('');
  const [clockOutPhotos, setClockOutPhotos] = useState<string[]>([]);

  // Update Task In-Flight Modal State
  const [isUpdateTaskModalOpen, setIsUpdateTaskModalOpen] = useState<boolean>(false);
  const [inFlightTaskNotes, setInFlightTaskNotes] = useState<string>('');

  // Manual Log Form State
  const [manualUserId, setManualUserId] = useState<string>(activeUser.id);
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStation, setManualStation] = useState<string>('Bench 02');
  const [manualCategory, setManualCategory] = useState<TimeClockTaskCategory>('Diagnostics & Triage');
  const [manualHours, setManualHours] = useState<string>('3');
  const [manualMinutes, setManualMinutes] = useState<string>('30');
  const [manualBreakMinutes, setManualBreakMinutes] = useState<string>('15');
  const [manualAccomplishments, setManualAccomplishments] = useState<string>('');
  const [manualPartsUsed, setManualPartsUsed] = useState<string>('');
  const [manualPhotos, setManualPhotos] = useState<string[]>([]);

  // Fullscreen Photo Viewer Modal State
  const [previewPhotoModal, setPreviewPhotoModal] = useState<PhotoViewerModalData | null>(null);

  // Selected preset tracking
  const [selectedPunchPresetId, setSelectedPunchPresetId] = useState<string | undefined>(undefined);
  const [selectedManualPresetId, setSelectedManualPresetId] = useState<string | undefined>(undefined);
  const [selectedInFlightPresetId, setSelectedInFlightPresetId] = useState<string | undefined>(undefined);

  // Timesheet Filters
  const [filterTechId, setFilterTechId] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit Timesheet Modal
  const [editingEntry, setEditingEntry] = useState<TimeClockEntry | null>(null);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editBreakMinutes, setEditBreakMinutes] = useState<number>(0);
  const [editAccomplishments, setEditAccomplishments] = useState<string>('');
  const [editCategory, setEditCategory] = useState<TimeClockTaskCategory>('General Bench Work');
  const [editStation, setEditStation] = useState<string>('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

  // Delete Confirmation Modal
  const [deletingEntry, setDeletingEntry] = useState<TimeClockEntry | null>(null);

  // Sync punch station when active user changes
  useEffect(() => {
    if (activeUser.benchStation) {
      setPunchStation(activeUser.benchStation);
    }
  }, [activeUser.id, activeUser.benchStation]);

  // Quick Preset Handlers
  const handleSelectPunchPreset = (preset: RepairTaskPreset) => {
    setSelectedPunchPresetId(preset.id);
    setPunchTaskNotes(preset.description);
    setPunchCategory(preset.category);
    addToast({
      type: 'info',
      title: 'Quick-Add Applied',
      message: `Selected "${preset.label}" (${preset.category}).`,
    });
  };

  const handleSelectManualPreset = (preset: RepairTaskPreset) => {
    setSelectedManualPresetId(preset.id);
    setManualAccomplishments(preset.description);
    setManualCategory(preset.category);
    if (preset.estimatedMinutes) {
      const h = Math.floor(preset.estimatedMinutes / 60);
      const m = preset.estimatedMinutes % 60;
      setManualHours(h.toString());
      setManualMinutes(m.toString());
    }
    if (preset.partsHint && preset.partsHint.length > 0) {
      setManualPartsUsed(preset.partsHint.join(', '));
    }
    addToast({
      type: 'info',
      title: 'Quick-Add Applied',
      message: `Pre-populated "${preset.label}" details and duration.`,
    });
  };

  const handleSelectInFlightPreset = (preset: RepairTaskPreset) => {
    setSelectedInFlightPresetId(preset.id);
    setInFlightTaskNotes(preset.description);
    addToast({
      type: 'info',
      title: 'Task Autofilled',
      message: `Updated notes template to "${preset.label}".`,
    });
  };

  // Handle Punch In
  const handlePunchIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await clockInTechnician(
      activeUser.id,
      punchStation,
      punchCategory,
      punchTaskNotes.trim() || `Triage & bench service at ${punchStation}`,
      punchPhotos
    );
    setPunchTaskNotes('');
    setPunchPhotos([]);
    setSelectedPunchPresetId(undefined);
  };

  // Handle Break Toggle
  const handleToggleBreak = async () => {
    await toggleTechnicianBreak(activeUser.id);
  };

  // Handle Active Shift Photo Addition
  const handleAddPhotosToActiveShift = async (newUrls: string[]) => {
    await addShiftPhotos(activeUser.id, newUrls);
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    await clockOutTechnician(activeUser.id, clockOutAccomplishments.trim(), clockOutPhotos);
    setIsClockOutModalOpen(false);
    setClockOutAccomplishments('');
    setClockOutPhotos([]);
  };

  // Handle In-Flight Task Update
  const handleUpdateCurrentTask = async () => {
    if (!activeSession) return;
    const notes = inFlightTaskNotes.trim();
    if (!notes) return;

    await updateTimeLog(activeSession.id, {
      workAccomplishments: notes,
    });
    setIsUpdateTaskModalOpen(false);
    setInFlightTaskNotes('');
    addToast({
      type: 'info',
      title: 'Current Task Updated',
      message: `Active task logged: "${notes}"`,
    });
  };

  // Handle Manual Log Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const techUser = users.find((u) => u.id === manualUserId) || activeUser;
    const h = parseInt(manualHours, 10) || 0;
    const m = parseInt(manualMinutes, 10) || 0;
    const totalNetMins = h * 60 + m;
    const breakM = parseInt(manualBreakMinutes, 10) || 0;

    if (totalNetMins <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Duration',
        message: 'Please specify total net work hours or minutes greater than 0.',
      });
      return;
    }

    if (!manualAccomplishments.trim()) {
      addToast({
        type: 'error',
        title: 'Work Summary Required',
        message: 'Please mark what you did during this shift.',
      });
      return;
    }

    const startDateTime = new Date(`${manualDate}T09:00:00.000Z`).toISOString();
    const grossTotalMins = totalNetMins + breakM;
    const endDateTime = new Date(new Date(startDateTime).getTime() + grossTotalMins * 60000).toISOString();

    const parts = manualPartsUsed
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    await addManualTimeLog({
      userId: techUser.id,
      technicianName: techUser.displayName,
      userRole: techUser.role,
      benchStation: manualStation,
      clockIn: startDateTime,
      clockOut: endDateTime,
      durationMinutes: totalNetMins,
      breakMinutes: breakM,
      grossDurationMinutes: grossTotalMins,
      taskCategory: manualCategory,
      workAccomplishments: manualAccomplishments.trim(),
      partsReplacedOrUsed: parts.length > 0 ? parts : undefined,
      photoUrls: manualPhotos.length > 0 ? manualPhotos : undefined,
      status: 'completed',
      date: manualDate,
    });

    setManualAccomplishments('');
    setManualPartsUsed('');
    setManualPhotos([]);
    setSelectedManualPresetId(undefined);
    setActiveSubTab('timesheet');
  };

  // Filtered Timesheet Entries
  const filteredEntries = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return timeClockEntries.filter((entry) => {
      // Tech filter
      if (filterTechId !== 'ALL' && entry.userId !== filterTechId) return false;

      // Category filter
      if (filterCategory !== 'ALL' && entry.taskCategory !== filterCategory) return false;

      // Date Range filter
      if (filterDateRange === 'TODAY' && entry.date !== todayStr) return false;
      if (filterDateRange === 'WEEK') {
        const entryDate = new Date(entry.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (entryDate < sevenDaysAgo) return false;
      }
      if (filterDateRange === 'MONTH') {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (entryDate < thirtyDaysAgo) return false;
      }

      // Query Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.technicianName.toLowerCase().includes(q) ||
          entry.benchStation.toLowerCase().includes(q) ||
          entry.taskCategory.toLowerCase().includes(q) ||
          entry.workAccomplishments.toLowerCase().includes(q) ||
          (entry.partsReplacedOrUsed && entry.partsReplacedOrUsed.some((p) => p.toLowerCase().includes(q)))
        );
      }

      return true;
    });
  }, [timeClockEntries, filterTechId, filterCategory, filterDateRange, searchQuery]);

  // Timesheet Summary Aggregations
  const totalLoggedMinutes = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }, [filteredEntries]);

  const totalBreakMinutes = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (curr.breakMinutes || 0), 0);
  }, [filteredEntries]);

  const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);
  const totalBreakHours = (totalBreakMinutes / 60).toFixed(1);

  const activeTechniciansCount = useMemo(() => {
    return users.filter((u) => u.clockedIn).length;
  }, [users]);

  // Open Edit Modal
  const handleOpenEdit = (entry: TimeClockEntry) => {
    setEditingEntry(entry);
    setEditMinutes(entry.durationMinutes);
    setEditBreakMinutes(entry.breakMinutes || 0);
    setEditAccomplishments(entry.workAccomplishments);
    setEditCategory(entry.taskCategory);
    setEditStation(entry.benchStation);
    setEditPhotos(entry.photoUrls || []);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    await updateTimeLog(editingEntry.id, {
      durationMinutes: editMinutes,
      breakMinutes: editBreakMinutes,
      grossDurationMinutes: editMinutes + editBreakMinutes,
      workAccomplishments: editAccomplishments.trim(),
      taskCategory: editCategory,
      benchStation: editStation,
      photoUrls: editPhotos,
    });
    setEditingEntry(null);
  };


  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. Header Banner & Profile Session Bar */}
      {/* ============================================================== */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-inner shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-lg font-bold text-white font-mono">
                  Technician Time Clock & Activity Logger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Vocational Lab Floor
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time punch clock, station allocations, detailed repair accomplishment logs, and timesheet reports.
              </p>
            </div>
          </div>

          {/* Quick Profile Switcher Strip */}
          <div className="flex items-center gap-2 flex-wrap bg-[#0d1117] p-2 rounded-xl border border-[#30363d]">
            <span className="text-[11px] font-mono text-gray-400 pl-1">
              Active Technician:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeUser.clockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                }`}
                title={activeUser.clockedIn ? 'Currently Clocked In' : 'Clocked Out'}
              />
              <span className="text-xs font-bold font-mono text-white">
                {activeUser.displayName}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeUser.role === 'ROLE_OWNER'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {activeUser.role === 'ROLE_OWNER' ? 'Master Admin' : 'Worker'}
              </span>
            </div>

            <button
              onClick={() => openAuthModal('profiles_menu')}
              className="ml-2 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-cyan-300 text-[11px] font-mono transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Switch Profile</span>
            </button>
          </div>
        </div>

        {/* 4-Tab Navigation Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 bg-[#0d1117] rounded-xl border border-[#30363d] text-xs font-mono mt-5">
          <button
            onClick={() => setActiveSubTab('punch_clock')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'punch_clock'
                ? 'bg-[#21262d] text-cyan-300 font-bold border border-[#30363d] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Punch Clock & Timer</span>
            {activeSession && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('manual_entry')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'manual_entry'
                ? 'bg-[#21262d] text-cyan-300 font-bold border border-[#30363d] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manual Time Log</span>
          </button>

          <button
            onClick={() => setActiveSubTab('timesheet')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'timesheet'
                ? 'bg-[#21262d] text-cyan-300 font-bold border border-[#30363d] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Timesheets & Activity ({timeClockEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('admin_floor')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'admin_floor'
                ? 'bg-[#21262d] text-amber-300 font-bold border border-[#30363d] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Floor Monitor</span>
            {activeTechniciansCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeTechniciansCount} Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUBTAB A: LIVE PUNCH CLOCK & DURATION TICKER */}
      {/* ============================================================== */}
      {activeSubTab === 'punch_clock' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Punch Clock Display (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`border rounded-2xl p-6 transition-all shadow-xl font-mono relative overflow-hidden ${
                activeSession
                  ? 'bg-gradient-to-br from-[#0c1a1a] via-[#161b22] to-[#0c1a1a] border-emerald-500/50 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-[#161b22] border-[#30363d]'
              }`}
            >
              {/* Corner Watermark */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Clock className="w-32 h-32 text-cyan-400" />
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-4 mb-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Session Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        activeSession ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                      }`}
                    />
                    <h3 className="text-lg font-bold text-white">
                      {activeSession ? 'Currently Clocked In' : 'Shift Not Started'}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">Assigned Station</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {activeSession ? activeSession.benchStation : punchStation}
                  </span>
                </div>
              </div>

              {/* ACTIVE SESSION VIEW */}
              {activeSession ? (
                <div className="space-y-6">
                  {/* Digital Clock Display & Break Banner */}
                  <div
                    className={`border rounded-2xl p-6 text-center space-y-4 shadow-inner transition-all ${
                      activeSession.isPaused
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-[#0d1117] border-emerald-500/40'
                    }`}
                  >
                    {/* Live Status Badge */}
                    <div className="flex items-center justify-center gap-2">
                      {activeSession.isPaused ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider animate-pulse">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>On Break — Main Timer Paused</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Bench Active & Working</span>
                        </div>
                      )}
                    </div>

                    {/* Primary Large Digital Ticker */}
                    <div>
                      <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold block mb-1">
                        {activeSession.isPaused ? 'Current Break Elapsed' : 'Net Bench Work Time'}
                      </span>
                      <div
                        className={`text-4xl sm:text-6xl font-bold font-mono tracking-tight tabular-nums ${
                          activeSession.isPaused ? 'text-amber-300' : 'text-emerald-300'
                        }`}
                      >
                        {formatTimerDigits(activeSession.isPaused ? breakElapsedSeconds : elapsedSeconds)}
                      </div>
                    </div>

                    {/* Dual-Time Accounting Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#30363d]/60 text-left">
                      <div className="bg-[#161b22] p-2.5 rounded-xl border border-emerald-500/30">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                          Net Work
                        </span>
                        <span className="text-base sm:text-lg font-bold text-emerald-300 tabular-nums font-mono">
                          {formatTimerDigits(elapsedSeconds)}
                        </span>
                        <span className="text-[9px] text-gray-500 block">Billable / Active</span>
                      </div>

                      <div className="bg-[#161b22] p-2.5 rounded-xl border border-amber-500/30">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                          Break / Rest
                        </span>
                        <span className="text-base sm:text-lg font-bold text-amber-300 tabular-nums font-mono">
                          {formatTimerDigits(breakElapsedSeconds)}
                        </span>
                        <span className="text-[9px] text-gray-500 block">Unpaid / Paused</span>
                      </div>

                      <div className="bg-[#161b22] p-2.5 rounded-xl border border-cyan-500/30">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                          Total Shift
                        </span>
                        <span className="text-base sm:text-lg font-bold text-cyan-300 tabular-nums font-mono">
                          {formatTimerDigits(totalShiftSeconds)}
                        </span>
                        <span className="text-[9px] text-gray-500 block">Gross Elapsed</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-1">
                      <span>
                        Punched In: {new Date(activeSession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>·</span>
                      <span>Date: {activeSession.date}</span>
                    </div>

                    {/* Break Action Control Button */}
                    <div className="pt-2">
                      {activeSession.isPaused ? (
                        <button
                          type="button"
                          onClick={handleToggleBreak}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Resume Bench Work (End Break)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleToggleBreak}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <Coffee className="w-4 h-4" />
                          <span>Take Break (Pause Work Timer)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Task Info Card */}
                  <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Current Task Category:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                        {activeSession.taskCategory}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#30363d]/60">
                      <span className="text-xs text-gray-400 block mb-1">Activity Notes / What You Are Doing:</span>
                      <p className="text-sm text-gray-200 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                        {activeSession.workAccomplishments || 'No specific task notes recorded yet.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => {
                          setInFlightTaskNotes(activeSession.workAccomplishments);
                          setIsUpdateTaskModalOpen(true);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Update What You Are Working On</span>
                      </button>
                    </div>
                  </div>

                  {/* Attached Photos Strip & Live Camera Snapshot */}
                  <PhotoProofUploader
                    photoUrls={activeSession.photoUrls || []}
                    onPhotosChange={handleAddPhotosToActiveShift}
                    onPreviewPhoto={(url) =>
                      setPreviewPhotoModal({
                        url,
                        title: `${activeUser.displayName} - Active Shift Proof`,
                        technicianName: activeUser.displayName,
                        benchStation: activeSession.benchStation,
                        date: activeSession.date,
                        caption: activeSession.workAccomplishments,
                      })
                    }
                    title="Shift Work Proof Photos & Documentation"
                    subtitle="Take pictures or upload images of your ongoing repairs to show what was done"
                  />

                  {/* Clock Out Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setClockOutAccomplishments(activeSession.workAccomplishments);
                        setClockOutPhotos(activeSession.photoUrls || []);
                        setIsClockOutModalOpen(true);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Clock Out & Submit Shift Work Summary</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CLOCKED OUT / PUNCH IN FORM */
                <form onSubmit={handlePunchIn} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-300 mb-1.5">
                        Workstation / Bench Allocation:
                      </label>
                      <select
                        value={punchStation}
                        onChange={(e) => setPunchStation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        {BENCH_STATIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1.5">
                        Task Category:
                      </label>
                      <select
                        value={punchCategory}
                        onChange={(e) => setPunchCategory(e.target.value as TimeClockTaskCategory)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        {TASK_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick-Add Interactive Preset Chips */}
                  <QuickAddRepairChips
                    onSelectPreset={handleSelectPunchPreset}
                    selectedPresetId={selectedPunchPresetId}
                  />

                  <div>
                    <label className="block text-xs text-gray-300 mb-1.5">
                      What are you working on today? (Task notes):
                    </label>
                    <textarea
                      rows={3}
                      value={punchTaskNotes}
                      onChange={(e) => setPunchTaskNotes(e.target.value)}
                      placeholder="e.g., Triage power rails on Dell 7090, replace thermal paste on CAD workstations, or select a Quick-Add preset above..."
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                    />
                  </div>

                  {/* Optional Initial Photo Proof */}
                  <PhotoProofUploader
                    photoUrls={punchPhotos}
                    onPhotosChange={setPunchPhotos}
                    onPreviewPhoto={(url) =>
                      setPreviewPhotoModal({
                        url,
                        title: 'Intake / Initial Diagnostic Photo',
                        technicianName: activeUser.displayName,
                        benchStation: punchStation,
                        date: new Date().toISOString().split('T')[0],
                      })
                    }
                    title="Intake & Diagnostic Photos (Optional)"
                    subtitle="Attach device condition or error screen photo prior to servicing"
                    compact
                    maxPhotos={4}
                  />

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Clock In to {punchStation}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

          {/* Right Column: Quick Profile Summary & Today's Shift Logs */}
          <div className="space-y-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Profile Overview</span>
                </span>
                <span className="text-[10px] text-gray-400">{activeUser.displayName}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#30363d]/40">
                  <span className="text-gray-400">Default Station:</span>
                  <span className="text-white font-semibold">{activeUser.benchStation || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#30363d]/40">
                  <span className="text-gray-400">System Role:</span>
                  <span className="text-cyan-400">
                    {activeUser.role === 'ROLE_OWNER' ? '👑 Lead Instructor' : '🛠️ Station Technician'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Total Shifts Logged:</span>
                  <span className="text-emerald-400 font-bold">
                    {timeClockEntries.filter((e) => e.userId === activeUser.id).length} shifts
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setFilterTechId(activeUser.id);
                    setActiveSubTab('timesheet');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-cyan-300 text-center font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View {activeUser.displayName}&apos;s Timesheet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick All Profiles Floor Snapshot */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="font-bold text-white">Lab Floor Status (8 Techs)</span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {activeTechniciansCount} Punched In
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {users.map((u) => {
                  const hasActive = timeClockEntries.some((e) => e.userId === u.id && e.status === 'active');
                  const isCurrent = u.id === activeUser.id;

                  return (
                    <button
                      key={u.id}
                      onClick={() => switchUserQuick(u.id)}
                      className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between border ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                          : 'bg-[#0d1117] border-[#30363d]/60 hover:bg-[#161b22] text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            hasActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                          }`}
                        />
                        <span className="font-bold truncate">{u.displayName}</span>
                        <span className="text-[10px] text-gray-400 truncate">
                          ({u.benchStation ? u.benchStation.replace('Bench ', 'B') : 'Bench'})
                        </span>
                      </div>

                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          hasActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {hasActive ? 'Working' : 'Out'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUBTAB B: MANUAL TIME ENTRY FORM */}
      {/* ============================================================== */}
      {activeSubTab === 'manual_entry' && (
        <div className="max-w-2xl mx-auto bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl font-mono text-xs space-y-5">
          <div className="border-b border-[#30363d] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Log Completed Shift or Retroactive Bench Time</span>
            </h3>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Record completed repair hours, bench stations, and detailed accomplishments for lab vocational credits.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Technician Profile:</label>
                <select
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} ({u.role === 'ROLE_OWNER' ? 'Admin' : 'Worker'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Shift Date:</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Workstation / Bench:</label>
                <select
                  value={manualStation}
                  onChange={(e) => setManualStation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {BENCH_STATIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Task Category:</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as TimeClockTaskCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick-Add Interactive Preset Chips */}
            <QuickAddRepairChips
              onSelectPreset={handleSelectManualPreset}
              selectedPresetId={selectedManualPresetId}
            />

            {/* Shift Duration & Dual Break Accounting */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 font-bold block">
                  Shift Duration & Break Accounting:
                </label>
                <span className="text-[10px] text-cyan-400">
                  Total Shift: {(parseInt(manualHours, 10) || 0) * 60 + (parseInt(manualMinutes, 10) || 0) + (parseInt(manualBreakMinutes, 10) || 0)}m gross
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#161b22] p-2.5 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-1">
                    Net Work Hours:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                  />
                </div>

                <div className="bg-[#161b22] p-2.5 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-1">
                    Net Work Minutes:
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                  />
                </div>

                <div className="bg-[#161b22] p-2.5 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 font-bold block mb-1">
                    Break / Paused (Mins):
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={manualBreakMinutes}
                    onChange={(e) => setManualBreakMinutes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* What Was Done / Accomplishments */}
            <div>
              <label className="block text-gray-300 mb-1">
                Work Accomplishments (What did you do during this time?):
              </label>
              <textarea
                rows={4}
                value={manualAccomplishments}
                onChange={(e) => setManualAccomplishments(e.target.value)}
                placeholder="Detail diagnostics performed, components replaced, cables verified, or select a Quick-Add preset above..."
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            {/* Optional Parts Used */}
            <div>
              <label className="block text-gray-300 mb-1">
                Parts Used / Replaced (Optional, comma-separated):
              </label>
              <input
                type="text"
                value={manualPartsUsed}
                onChange={(e) => setManualPartsUsed(e.target.value)}
                placeholder="e.g. Arctic MX-6 paste, 16GB DDR4 RAM stick, Cat6 RJ45 jacks..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            {/* Shift Work Proof Photos */}
            <PhotoProofUploader
              photoUrls={manualPhotos}
              onPhotosChange={setManualPhotos}
              onPreviewPhoto={(url) =>
                setPreviewPhotoModal({
                  url,
                  title: 'Shift Work Proof Photo',
                  technicianName: users.find((u) => u.id === manualUserId)?.displayName || activeUser.displayName,
                  benchStation: manualStation,
                  date: manualDate,
                  caption: manualAccomplishments,
                })
              }
              title="Work Proof Photos & Documentation (Optional)"
              subtitle="Upload camera pictures or screenshots of completed bench work"
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('punch_clock')}
                className="px-4 py-2.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-mono shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Shift to Timesheet</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUBTAB C: TIMESHEETS & ACTIVITY LEDGER */}
      {/* ============================================================== */}
      {activeSubTab === 'timesheet' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#161b22] p-3.5 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">
                Net Work Time
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {totalLoggedHours}
                </span>
                <span className="text-xs text-emerald-400">Hours</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                {totalLoggedMinutes} net active mins
              </span>
            </div>

            <div className="bg-[#161b22] p-3.5 rounded-xl border border-amber-500/30">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
                Total Breaks
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-amber-300 tabular-nums">
                  {totalBreakHours}
                </span>
                <span className="text-xs text-amber-400">Hours</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                {totalBreakMinutes} break minutes
              </span>
            </div>

            <div className="bg-[#161b22] p-3.5 rounded-xl border border-[#30363d]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Total Shifts
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-cyan-300 tabular-nums">
                  {filteredEntries.length}
                </span>
                <span className="text-xs text-gray-400">Entries</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                {activeTechniciansCount} active on floor
              </span>
            </div>

            <div className="bg-[#161b22] p-3.5 rounded-xl border border-[#30363d] flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Export Options
              </span>
              <button
                onClick={() => exportTimesheetsCsv(filterTechId)}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-cyan-500/40 text-cyan-300 hover:text-white font-bold transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV File</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search technician, station, or what they did..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Technician Dropdown */}
              <select
                value={filterTechId}
                onChange={(e) => setFilterTechId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Technicians (8 Profiles)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.role === 'ROLE_OWNER' ? 'Admin' : 'Worker'})
                  </option>
                ))}
              </select>

              {/* Category Dropdown */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Task Categories</option>
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Date Segment Filter */}
              <div className="flex items-center bg-[#0d1117] p-0.5 rounded-xl border border-[#30363d] shrink-0">
                {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setFilterDateRange(range)}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors text-[11px] ${
                      filterDateRange === range
                        ? 'bg-[#21262d] text-cyan-300 font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range === 'ALL' ? 'All' : range === 'TODAY' ? 'Today' : range === 'WEEK' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dense High-Precision Timesheet Table with Break & Visual Proof Columns */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#30363d] text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 min-w-[240px]">Work Accomplishments</th>
                    <th className="py-3 px-4 text-center">Visual Proof</th>
                    <th className="py-3 px-4 text-right">Net Work</th>
                    <th className="py-3 px-4 text-right">Break</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/60">
                  {filteredEntries.map((entry) => {
                    const hrs = (entry.durationMinutes / 60).toFixed(1);
                    const isActive = entry.status === 'active';
                    const hasPhotos = entry.photoUrls && entry.photoUrls.length > 0;

                    return (
                      <tr
                        key={entry.id}
                        className={`hover:bg-[#1f242c] transition-colors ${
                          isActive ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap text-gray-300 tabular-nums">
                          {entry.date}
                        </td>

                        {/* Tech */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{entry.technicianName}</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded ${
                                entry.userRole === 'ROLE_OWNER'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-cyan-500/20 text-cyan-300'
                              }`}
                            >
                              {entry.userRole === 'ROLE_OWNER' ? 'Admin' : 'Worker'}
                            </span>
                          </div>
                        </td>

                        {/* Station */}
                        <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                          {entry.benchStation}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[11px] text-cyan-400">
                            {entry.taskCategory}
                          </span>
                        </td>

                        {/* Accomplishments */}
                        <td className="py-3 px-4 text-gray-200 leading-relaxed text-xs">
                          <div>{entry.workAccomplishments}</div>
                          {entry.partsReplacedOrUsed && entry.partsReplacedOrUsed.length > 0 && (
                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <span className="text-gray-500 font-semibold">Parts:</span>
                              <span>{entry.partsReplacedOrUsed.join(', ')}</span>
                            </div>
                          )}
                        </td>

                        {/* Visual Proof / Photos */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          {hasPhotos ? (
                            <div className="inline-flex items-center gap-1.5">
                              {entry.photoUrls!.slice(0, 2).map((photoUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhotoModal({
                                      url: photoUrl,
                                      title: `Work Proof Photo (${pIdx + 1}/${entry.photoUrls!.length})`,
                                      technicianName: entry.technicianName,
                                      benchStation: entry.benchStation,
                                      date: entry.date,
                                      caption: entry.workAccomplishments,
                                    })
                                  }
                                  className="w-7 h-7 rounded-md overflow-hidden border border-[#30363d] hover:border-cyan-400 transition-all hover:scale-110 shadow-sm shrink-0"
                                  title="View full-resolution work proof photo"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={`Proof ${pIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                              {entry.photoUrls!.length > 2 && (
                                <span className="text-[10px] font-bold text-gray-400">
                                  +{entry.photoUrls!.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-600">—</span>
                          )}
                        </td>

                        {/* Net Work Duration */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          {isActive ? (
                            <span className="text-emerald-400 font-bold animate-pulse">
                              In Progress
                            </span>
                          ) : (
                            <div className="text-right">
                              <span className="text-white font-bold tabular-nums">
                                {entry.durationMinutes}m
                              </span>
                              <span className="text-[10px] text-gray-400 block tabular-nums">
                                ~{hrs} hrs
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Break Time */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <span className={`tabular-nums font-semibold ${entry.breakMinutes ? 'text-amber-300' : 'text-gray-500'}`}>
                            {entry.breakMinutes ? `${entry.breakMinutes}m` : '0m'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? entry.isPaused
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {isActive ? (entry.isPaused ? 'On Break' : 'Active') : 'Logged'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1 rounded bg-[#0d1117] hover:bg-[#21262d] text-gray-400 hover:text-white transition-colors"
                              title="Edit time, break, or notes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              className="p-1 rounded bg-[#0d1117] hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-500 font-mono">
                        No time clock entries match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ============================================================== */}
      {/* 5. SUBTAB D: JULIAN MASTER ADMIN FLOOR MONITOR */}
      {/* ============================================================== */}
      {activeSubTab === 'admin_floor' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-amber-950/40 via-[#161b22] to-cyan-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <h3 className="text-base font-bold text-white font-mono">
                  Julian&apos;s Master Admin Floor Supervision
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lead Instructor Oversight
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Real-time visibility across all 8 technician profiles, active clock-in durations, station locks, and timesheet exports.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportTimesheetsCsv('ALL')}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Lab CSV</span>
              </button>
            </div>
          </div>

          {/* Floor Technician Grid (All 8 Profiles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((tech) => {
              const activeLog = timeClockEntries.find((e) => e.userId === tech.id && e.status === 'active');
              const techPastLogs = timeClockEntries.filter((e) => e.userId === tech.id);
              const techTotalMins = techPastLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
              const techHours = (techTotalMins / 60).toFixed(1);
              const isAdminTech = tech.role === 'ROLE_OWNER';

              return (
                <div
                  key={tech.id}
                  className={`bg-[#161b22] border rounded-2xl p-4 space-y-3 shadow-lg flex flex-col justify-between ${
                    activeLog
                      ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 bg-gradient-to-b from-[#121c17] to-[#161b22]'
                      : 'border-[#30363d]'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs shadow-inner ${
                            isAdminTech
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isAdminTech ? '👑' : tech.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {tech.displayName}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {isAdminTech ? 'Master Admin' : 'Technician'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          activeLog
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {activeLog ? 'Clocked In' : 'Off-Clock'}
                      </span>
                    </div>

                    {/* Bench Station & Active Task */}
                    <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-gray-400">
                        <span>Current Station:</span>
                        <span className="text-white font-bold">{tech.benchStation || 'None'}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Cumulative Hours:</span>
                        <span className="text-emerald-400 font-bold tabular-nums">{techHours} hrs</span>
                      </div>
                    </div>

                    {/* Active Work Note */}
                    {activeLog && (
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[10px] text-emerald-200">
                        <span className="font-bold block text-emerald-400 mb-0.5">
                          Active: {activeLog.taskCategory}
                        </span>
                        <p className="line-clamp-2">{activeLog.workAccomplishments}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  <div className="pt-2 border-t border-[#30363d]/60 flex items-center gap-1.5">
                    <button
                      onClick={() => switchUserQuick(tech.id)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-cyan-300 text-center font-bold text-[11px] transition-colors"
                    >
                      Enter Session
                    </button>

                    {activeLog && (
                      <button
                        onClick={() => clockOutTechnician(tech.id, 'Supervisor override clock-out by Julian')}
                        className="py-1.5 px-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-[10px] transition-colors"
                        title="Force Clock Out"
                      >
                        Force Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: CLOCK OUT WORK ACCOMPLISHMENT PROMPT */}
      {/* ============================================================== */}
      {isClockOutModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Square className="w-4 h-4 text-red-400 fill-current" />
                  <span>Clock Out & Submit Work Log</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Technician: {activeUser.displayName} · Station: {activeSession.benchStation}
                </p>
              </div>
              <button
                onClick={() => setIsClockOutModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Time Summary Ticker */}
            <div className="grid grid-cols-3 gap-2 bg-[#0d1117] p-3 rounded-xl border border-[#30363d] text-center">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                  Net Work
                </span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {formatTimerDigits(elapsedSeconds)}
                </span>
                <span className="text-[9px] text-gray-500 block">
                  ~{Math.max(1, Math.round(elapsedSeconds / 60))}m
                </span>
              </div>

              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
                  Break Time
                </span>
                <span className="text-lg font-bold text-amber-300 tabular-nums">
                  {formatTimerDigits(breakElapsedSeconds)}
                </span>
                <span className="text-[9px] text-gray-500 block">
                  {Math.round(breakElapsedSeconds / 60)}m logged
                </span>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                  Total Shift
                </span>
                <span className="text-lg font-bold text-cyan-300 tabular-nums">
                  {formatTimerDigits(totalShiftSeconds)}
                </span>
                <span className="text-[9px] text-gray-500 block">
                  Gross elapsed
                </span>
              </div>
            </div>

            {/* Quick-Add Suggestion Chips for Fast Entry */}
            <QuickAddRepairChips
              onSelectPreset={(preset) => {
                setClockOutAccomplishments(preset.description);
                addToast({
                  type: 'info',
                  title: 'Accomplishment Autofilled',
                  message: `Loaded template for "${preset.label}".`,
                });
              }}
              compact
            />

            <div>
              <label className="block text-gray-300 mb-1 font-bold">
                What did you accomplish during this shift?
              </label>
              <textarea
                rows={4}
                value={clockOutAccomplishments}
                onChange={(e) => setClockOutAccomplishments(e.target.value)}
                placeholder="Explain diagnostic test results, motherboard solder points checked, replaced cables, or select a preset above..."
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            {/* Shift Work Proof Photos Upload */}
            <PhotoProofUploader
              photoUrls={clockOutPhotos}
              onPhotosChange={setClockOutPhotos}
              onPreviewPhoto={(url) =>
                setPreviewPhotoModal({
                  url,
                  title: 'Completed Shift Work Proof',
                  technicianName: activeUser.displayName,
                  benchStation: activeSession.benchStation,
                  date: activeSession.date,
                  caption: clockOutAccomplishments,
                })
              }
              title="Upload Final Work Photos & Proof"
              subtitle="Add photos of the repaired device, test screen, or replaced components"
              compact
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClockOutModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePunchOut}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Clock Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: UPDATE IN-FLIGHT TASK NOTES */}
      {/* ============================================================== */}
      {isUpdateTaskModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Update Active Shift Notes</span>
              </h3>
              <button
                onClick={() => setIsUpdateTaskModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick-Add Chips for Fast In-Flight Switching */}
            <QuickAddRepairChips
              onSelectPreset={handleSelectInFlightPreset}
              selectedPresetId={selectedInFlightPresetId}
              compact
            />

            <div>
              <label className="block text-gray-300 mb-1">
                What are you working on right now?
              </label>
              <textarea
                rows={4}
                value={inFlightTaskNotes}
                onChange={(e) => setInFlightTaskNotes(e.target.value)}
                placeholder="Update current bench diagnosis or active task..."
                className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUpdateTaskModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateCurrentTask}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: EDIT PAST TIMESHEET ENTRY */}
      {/* ============================================================== */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Edit Timesheet Entry</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {editingEntry.technicianName} · {editingEntry.date}
                </p>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">Net Work (Mins):</label>
                <input
                  type="number"
                  min="1"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Break (Mins):</label>
                <input
                  type="number"
                  min="0"
                  value={editBreakMinutes}
                  onChange={(e) => setEditBreakMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Station:</label>
                <select
                  value={editStation}
                  onChange={(e) => setEditStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
                >
                  {BENCH_STATIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Task Category:</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as TimeClockTaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white font-mono"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Work Accomplishments:</label>
              <textarea
                rows={4}
                value={editAccomplishments}
                onChange={(e) => setEditAccomplishments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono text-xs"
              />
            </div>

            {/* Edit Photos */}
            <PhotoProofUploader
              photoUrls={editPhotos}
              onPhotosChange={setEditPhotos}
              onPreviewPhoto={(url) =>
                setPreviewPhotoModal({
                  url,
                  title: 'Timesheet Entry Photo Proof',
                  technicianName: editingEntry.technicianName,
                  benchStation: editStation,
                  date: editingEntry.date,
                  caption: editAccomplishments,
                })
              }
              title="Work Proof Photos"
              compact
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. MODAL: DELETE CONFIRMATION */}
      {/* ============================================================== */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#161b22] border border-red-500/50 rounded-2xl p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Timesheet Entry?</h3>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Are you sure you want to delete this {deletingEntry.durationMinutes}-minute log for{' '}
              <strong className="text-white">{deletingEntry.technicianName}</strong> on{' '}
              <strong className="text-white">{deletingEntry.date}</strong>?
            </p>

            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] text-[11px] text-gray-400">
              &quot;{deletingEntry.workAccomplishments}&quot;
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="px-4 py-2 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteTimeLog(deletingEntry.id);
                  setDeletingEntry(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. MODAL: FULLSCREEN PHOTO VIEWER LIGHTBOX */}
      {/* ============================================================== */}
      <PhotoViewerModal
        photoData={previewPhotoModal}
        onClose={() => setPreviewPhotoModal(null)}
      />
    </div>
  );
};

