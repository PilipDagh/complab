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
} from 'lucide-react';
import { DailyActivityLog, ProjectPriority, ProjectStage, ProjectWorkOrder, LabDayStatus } from '../types';

export const LabCalendar: React.FC = () => {
  const {
    isOwner,
    currentUser,
    users,
    switchUserQuick,
    setIsAuthModalOpen,
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

  // Active view: Calendar & Day Log OR Projects Board
  const [boardTab, setBoardTab] = useState<'calendar' | 'projects'>('calendar');

  // New Work Order Modal / Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newBench, setNewBench] = useState<string>('Bench #1');
  const [newTech, setNewTech] = useState<string>(currentUser?.displayName || 'Alex Chen');
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

  // If NOT OWNER, display friendly lock screen
  if (!isOwner) {
    const ownerUser = users.find((u) => u.role === 'ROLE_OWNER');
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 lg:p-12 shadow-2xl text-center max-w-2xl mx-auto my-8 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-semibold">
            Instructor / Lead Tech Credential Required
          </span>
          <h2 className="text-xl lg:text-2xl font-bold text-white font-mono">
            Class Lab Calendar & Master Projects Locked
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            You are currently logged in with <span className="text-[#38bdf8] font-mono">ROLE_STUDENT</span>.
            The Class Activity Logger, Work Order Kanban, and AI Memory Context Injector are exclusively accessible by the Lead Bench Instructor / Shop Owner.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-left text-xs space-y-3">
          <div className="flex items-center gap-2 font-mono text-[#2ea043] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>How to access this feature:</span>
          </div>
          <p className="text-gray-300">
            Per the system specification, the <span className="text-white font-bold">first account ever registered</span> is automatically granted Owner privileges. You can switch to the designated Owner account below:
          </p>

          {ownerUser && (
            <button
              onClick={() => switchUserQuick(ownerUser.id)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono text-gray-200 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Switch to Lead Instructor: {ownerUser.displayName}</span>
              <span className="text-[#2ea043] font-bold">Quick Switch ➔</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] text-white text-xs font-mono font-bold transition-all shadow-md"
          >
            Authenticate with Another Account
          </button>
        </div>
      </div>
    );
  }

  // Generate simple 30-day interactive calendar grid
  const daysInGrid = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
    const log = calendarLogs.find((l) => l.dateString === dateStr);
    return { dateStr, dayNum, log };
  });

  const ongoingProjects = projects.filter((p) => p.status === 'ongoing');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2ea043]/15 text-[#2ea043] border border-[#2ea043]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Class Lab Daily Calendar & Work Order Board
              </h2>
              <p className="text-xs text-gray-400">
                Lead Tech / Owner Station • Injected into Gemini AI Context Engine
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Export Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 rounded-xl bg-[#0d1117] border border-[#30363d]">
            <button
              onClick={() => setBoardTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                boardTab === 'calendar'
                  ? 'bg-[#21262d] text-[#38bdf8] font-bold border border-[#30363d]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily Class Calendar
            </button>
            <button
              onClick={() => setBoardTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                boardTab === 'projects'
                  ? 'bg-[#21262d] text-[#38bdf8] font-bold border border-[#30363d]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Master Projects ({ongoingProjects.length})
            </button>
          </div>

          <button
            onClick={exportDataJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-mono border border-[#30363d] transition-colors"
            title="Export all database logs as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => exportDataTxt()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs font-mono border border-[#30363d] transition-colors"
            title="Download formatted text report"
          >
            <FileText className="w-3.5 h-3.5 text-[#2ea043]" />
            <span>TXT Summary</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAILY CALENDAR GRID & ACTIVITY LOGGER */}
      {boardTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid (Left 7 Cols) */}
          <div className="lg:col-span-6 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
              <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#38bdf8]" />
                September 2026 Lab Rotation
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2ea043]"></span> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ffd166]"></span> In Progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f85149]"></span> Issue/Hold
                </span>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-gray-500 pb-1">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* 30 Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysInGrid.map(({ dateStr, dayNum, log }) => {
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateSelect(dateStr)}
                    className={`h-16 rounded-xl p-1.5 text-left border flex flex-col justify-between transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#21262d] border-[#38bdf8] ring-2 ring-[#38bdf8] shadow-md z-10'
                        : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? 'text-[#38bdf8]' : 'text-gray-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {log && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'completed'
                              ? 'bg-[#2ea043]'
                              : log.status === 'issue_hold'
                              ? 'bg-[#f85149]'
                              : 'bg-[#ffd166]'
                          }`}
                        />
                      )}
                    </div>
                    {log?.topicsCovered ? (
                      <span className="text-[9px] text-gray-400 line-clamp-2 leading-tight">
                        {log.topicsCovered}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-600 italic">No notes</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-gray-400 font-mono flex items-center justify-between border-t border-[#30363d]">
              <span>Selected Date: {selectedDate}</span>
              <span className="text-[#38bdf8]">Click any day to update log</span>
            </div>
          </div>

          {/* Daily Activity Logger Form (Right 5 Cols) */}
          <div className="lg:col-span-6 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#2ea043]" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Daily Class Activity Logger ({selectedDate})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#2ea043] bg-[#2ea043]/15 px-2 py-0.5 rounded border border-[#2ea043]/30">
                AI SYNC ENABLED
              </span>
            </div>

            <form onSubmit={handleSaveDayLog} className="space-y-3.5">
              {/* Day Status Tag */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Lab Day Status Tag</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'completed', label: 'Completed Lab', color: 'text-[#2ea043]' },
                      { id: 'in_progress', label: 'In Progress', color: 'text-[#ffd166]' },
                      { id: 'issue_hold', label: 'Blown/Parts Hold', color: 'text-[#f85149]' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setDayStatus(st.id)}
                      className={`p-2 rounded-lg text-xs font-mono border transition-all text-center ${
                        dayStatus === st.id
                          ? 'bg-[#21262d] border-[#38bdf8] font-bold text-white'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400'
                      }`}
                    >
                      <span className={st.color}>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Classroom Topics */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Classroom Topics Covered
                </label>
                <textarea
                  rows={2}
                  value={dayTopics}
                  onChange={(e) => setDayTopics(e.target.value)}
                  placeholder="e.g. Soldering through-hole headers, oscilloscope bus debugging, CompTIA Core 1..."
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] font-mono"
                />
              </div>

              {/* Bench Repairs Performed Today */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Bench Repairs Performed Today
                </label>
                <textarea
                  rows={2}
                  value={dayRepairs}
                  onChange={(e) => setDayRepairs(e.target.value)}
                  placeholder="e.g. Bench 2: Replaced high-side VRM MOSFET; Bench 4: Diagnosed bad BCD..."
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] font-mono"
                />
              </div>

              {/* Parts Used or Ordered */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Parts Used / Ordered Today
                </label>
                <input
                  type="text"
                  value={dayParts}
                  onChange={(e) => setDayParts(e.target.value)}
                  placeholder="e.g. 2x 1000uF 16V caps, 1x Crucial DDR4-3200 16GB..."
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] font-mono"
                />
              </div>

              {/* Special Notes & Safety */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">
                  Special Lab Directives & Safety Alerts
                </label>
                <input
                  type="text"
                  value={dayNotes}
                  onChange={(e) => setDayNotes(e.target.value)}
                  placeholder="e.g. Exhaust hood #2 filter replaced; mandatory ESD wrist straps..."
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Day Log & Inject to AI Context</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: MASTER PROJECT WORK ORDERS BOARD */}
      {boardTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#38bdf8]" />
                Active Bench Work Orders & Lab Projects
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Track ongoing hardware intake, component soldering, and burn-in QA across student benches.
              </p>
            </div>

            <button
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] text-white text-xs font-mono font-bold shadow-md hover:scale-102 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Work Order</span>
            </button>
          </div>

          {/* Ongoing Work Orders Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ongoingProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-gray-500 transition-all space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Priority ribbon / badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-0.5 rounded-lg border border-[#38bdf8]/30">
                      {proj.benchNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        proj.priority === 'Urgent'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : proj.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-[#2ea043] border border-emerald-500/40'
                      }`}
                    >
                      {proj.priority} Priority
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-gray-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                    Stage: {proj.stage}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{proj.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-mono">
                    <span>Tech: {proj.technicianName}</span>
                    <span>•</span>
                    <span>Device: {proj.deviceType}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-gray-300">
                  <span className="text-gray-400 block text-[10px] font-mono uppercase mb-0.5">
                    Reported Fault & Intake Notes:
                  </span>
                  {proj.reportedFault}
                </div>

                {proj.partsReplaced && proj.partsReplaced.length > 0 && (
                  <div className="text-xs font-mono text-gray-400">
                    <span className="text-gray-300 font-semibold">Parts: </span>
                    {proj.partsReplaced.join(', ')}
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
                  <select
                    value={proj.stage}
                    onChange={(e: any) => updateProject(proj.id, { stage: e.target.value })}
                    className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] font-mono text-gray-300 focus:outline-none"
                  >
                    <option value="Intake">Stage: Intake</option>
                    <option value="Diagnostics">Stage: Diagnostics</option>
                    <option value="Waiting on Parts">Stage: Waiting on Parts</option>
                    <option value="Repair in Progress">Stage: Repair in Progress</option>
                    <option value="Burn-in Testing">Stage: Burn-in Testing</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setArchiveTargetId(proj.id);
                        setOutcomeNotes('');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#2ea043]/20 text-[#2ea043] border border-[#30363d] text-xs font-mono transition-colors"
                      title="Mark as completed & archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Complete & Archive</span>
                    </button>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete work order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Archived Past Projects Section */}
          <div className="pt-6 border-t border-[#30363d] space-y-4">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Archive className="w-4 h-4 text-gray-400" />
              Completed Past Repairs & Shop Archives ({archivedProjects.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {archivedProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 opacity-85 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{p.title}</span>
                    <span className="text-[#2ea043]">✓ Completed {p.dateCompleted}</span>
                  </div>
                  <p className="text-xs text-gray-400">{p.reportedFault}</p>
                  <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d]/60 text-xs text-gray-300 font-mono">
                    <span className="text-[#2ea043] font-bold">Outcome: </span>
                    {p.repairOutcomeNotes || 'System fully operational.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Work Order */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="text-base font-bold text-white font-mono">Create Bench Work Order</h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono text-gray-300 mb-1">Work Order Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bench #3: Dell XPS 15 Motherboard Short Diagnostic"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-gray-300 mb-1">Bench Station</label>
                  <select
                    value={newBench}
                    onChange={(e) => setNewBench(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                  >
                    <option value="Bench #1">Bench #1</option>
                    <option value="Bench #2">Bench #2</option>
                    <option value="Bench #3">Bench #3</option>
                    <option value="Bench #4">Bench #4</option>
                    <option value="Bench #5">Bench #5</option>
                    <option value="Master Bench">Instructor Master Bench</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-gray-300 mb-1">Assigned Tech</label>
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-gray-300 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-gray-300 mb-1">Device Platform</label>
                  <input
                    type="text"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value)}
                    placeholder="e.g. Laptop / Desktop / Switch"
                    className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-gray-300 mb-1">Reported Fault & Symptoms</label>
                <textarea
                  rows={3}
                  value={newFault}
                  onChange={(e) => setNewFault(e.target.value)}
                  placeholder="Describe initial symptoms, customer notes, or lab test findings..."
                  required
                  className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-300 font-mono hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] text-white font-mono font-bold shadow-md"
                >
                  Save Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Archive Work Order with Outcome */}
      {archiveTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2ea043]" />
              Archive Work Order & Record Outcome
            </h3>
            <p className="text-xs text-gray-400">
              Record the final repair resolution to document student work and train the AI assistant's memory.
            </p>

            <textarea
              rows={3}
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              placeholder="e.g. Replaced swollen capacitors on 12V rail; system passed 4-pass MemTest86 and FurMark 1-hour burn-in."
              className="w-full p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white font-mono focus:border-[#38bdf8] focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArchiveTargetId(null)}
                className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                className="px-4 py-2 rounded-xl bg-[#2ea043] text-white text-xs font-mono font-bold shadow-md"
              >
                Archive Repair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
