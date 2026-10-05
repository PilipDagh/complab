import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  LayoutGrid,
  CheckCircle2,
  X,
  Play,
  Square,
  UserCheck,
  Zap,
  Wrench,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertTriangle,
  Info,
  Layers,
  Award,
} from 'lucide-react';

interface WorkstationClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionRecorded?: (sessionData: {
    workerName: string;
    benchStation: string;
    task: string;
    deviceNotes: string;
    elapsedMinutes: number;
  }) => void;
}

const COMMON_TASKS = [
  'Hardware Triage & Power Diagnostic',
  'SMD Board Level Rework & Soldering',
  'Component Bench Stress Testing & QA',
  'Thermal Repasting, Delid & Cooler Assembly',
  'OS Deployment, SysPrep & Driver Verification',
  'Network Patching & Managed Switch Setup',
  'Laptop Teardown, Screen & Battery Replacement',
  'Custom PC Build & Cable Management',
  'Forensic Disk Imaging & Firmware Extraction',
];

export const WorkstationClockInModal: React.FC<WorkstationClockInModalProps> = ({
  isOpen,
  onClose,
  onSessionRecorded,
}) => {
  const { currentUser, isOwner, saveCalendarLog, users, switchUserQuick, addToast } = useApp();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    currentUser?.id || 'user_worker_kylin'
  );
  const [benchStation, setBenchStation] = useState<string>(
    currentUser?.benchStation || 'Bench 02'
  );
  const [taskCategory, setTaskCategory] = useState<string>(
    currentUser?.currentTask || COMMON_TASKS[0]
  );
  const [deviceNotes, setDeviceNotes] = useState<string>(
    'Inspecting power rail voltages on test rig. Verifying +12V, +5V, +3.3V and standby line with DMM.'
  );

  // Live Timer State
  const [isClockedIn, setIsClockedIn] = useState<boolean>(currentUser?.clockedIn || false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isClockedIn) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  useEffect(() => {
    if (currentUser) {
      setSelectedWorkerId(currentUser.id);
      if (currentUser.benchStation) setBenchStation(currentUser.benchStation);
      if (currentUser.currentTask) setTaskCategory(currentUser.currentTask);
      setIsClockedIn(currentUser.clockedIn || false);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartClockIn = () => {
    setIsClockedIn(true);
    setElapsedSeconds(0);
    addToast({
      type: 'success',
      title: 'Clocked In Successfully',
      message: `${currentUser?.displayName || 'Worker'} clocked in at ${benchStation}.`,
    });
  };

  const handleStopAndSave = async () => {
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const todayStr = new Date().toISOString().split('T')[0];

    const workerName = currentUser?.displayName || 'Technician';

    // Log to Calendar
    await saveCalendarLog({
      dateString: todayStr,
      status: 'completed',
      topicsCovered: `Workstation Session: ${taskCategory}`,
      benchRepairsPerformed: `[${benchStation}] ${workerName}: ${deviceNotes} (Duration: ${elapsedMins} mins)`,
      specialNotesAndSafety: `Technician: ${workerName} • Station: ${benchStation} • ESD Ground Certified`,
    });

    if (onSessionRecorded) {
      onSessionRecorded({
        workerName,
        benchStation,
        task: taskCategory,
        deviceNotes,
        elapsedMinutes: elapsedMins,
      });
    }

    setIsClockedIn(false);
    setElapsedSeconds(0);
    onClose();

    addToast({
      type: 'success',
      title: 'Timecard & Activity Logged',
      message: `Saved ${elapsedMins} min session to ${todayStr} lab calendar.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="max-w-xl w-full bg-[#111827] border border-[#30363d] rounded-2xl shadow-2xl p-6 space-y-5 overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Workstation Clock-In & Activity Logger
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isClockedIn
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {isClockedIn ? '● ACTIVE SESSION' : 'OFF DUTY'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Select your assigned workstation, record active repair triage, and clock in timecard entries to the lab calendar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Profile Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 flex items-center justify-between">
            <span>Technician / Worker Profile:</span>
            {isOwner && (
              <span className="text-[10px] text-amber-400 font-semibold">
                👑 Instructor Admin Oversight Mode
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {users.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              const isOwnerUser = u.role === 'ROLE_OWNER';
              return (
                <button
                  key={u.id}
                  onClick={() => switchUserQuick(u.id)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-bold shadow-sm'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
                  }`}
                >
                  <div className="truncate flex items-center gap-1">
                    {isOwnerUser ? '👑' : '🛠️'} {u.displayName}
                  </div>
                  <div className="text-[9px] text-gray-500 truncate mt-0.5">
                    {isOwnerUser ? 'Lead Admin' : u.benchStation || 'Worker'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workstation & Station Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Assigned Workstation Bench *</label>
            <select
              value={benchStation}
              onChange={(e) => setBenchStation(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Instructor Master Bench #1">Instructor Master Bench #1 (Admin)</option>
              {Array.from({ length: 16 }, (_, i) => {
                const num = String(i + 1).padStart(2, '0');
                return (
                  <option key={num} value={`Bench ${num}`}>
                    Bench {num} (Station {num})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Task / Operation Category</label>
            <select
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {COMMON_TASKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Device & Task Notes */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            What are you working on right now? (Specific Notes / Device Tag)
          </label>
          <textarea
            rows={2}
            value={deviceNotes}
            onChange={(e) => setDeviceNotes(e.target.value)}
            placeholder="e.g. Dell Precision 7680 - diagnosing short on +19V rail PU401, replacing 10uF 25V MLCC..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Live Session Timer Box */}
        <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Active Shift Elapsed Time
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tracking-wider mt-0.5">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isClockedIn ? (
              <button
                onClick={handleStartClockIn}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Clock In to {benchStation}</span>
              </button>
            ) : (
              <button
                onClick={handleStopAndSave}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-950/50 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Clock Out & Log to Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
