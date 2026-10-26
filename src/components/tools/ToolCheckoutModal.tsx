import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabInventoryItem, ToolCondition } from '../../types';
import {
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  FileText,
  MapPin,
  RotateCcw,
} from 'lucide-react';

interface ToolCheckoutModalProps {
  item: LabInventoryItem | null;
  mode: 'checkout' | 'return';
  onClose: () => void;
}

export const ToolCheckoutModal: React.FC<ToolCheckoutModalProps> = ({ item, mode, onClose }) => {
  const { currentUser, users, checkoutToolItem, returnToolItem } = useApp();

  // Checkout form fields
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUser?.id || (users.length > 0 ? users[0].id : 'custom_tech')
  );
  const [technicianName, setTechnicianName] = useState<string>(
    currentUser?.displayName || (users.length > 0 ? users[0].displayName : 'Active Technician')
  );
  const [benchStation, setBenchStation] = useState<string>(
    currentUser?.benchStation || 'Bench Station #1'
  );
  const [expectedReturnHours, setExpectedReturnHours] = useState<number>(4);
  const [taskNotes, setTaskNotes] = useState<string>('');

  // Return form fields
  const [returnCondition, setReturnCondition] = useState<ToolCondition>(item?.condition || 'good');
  const [returnNotes, setReturnNotes] = useState<string>('');

  if (!item) return null;

  const handleUserSelect = (uid: string) => {
    setSelectedUserId(uid);
    const found = users.find((u) => u.id === uid);
    if (found) {
      setTechnicianName(found.displayName);
      if (found.benchStation) {
        setBenchStation(found.benchStation);
      }
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const returnTime = new Date(Date.now() + expectedReturnHours * 60 * 60 * 1000).toISOString();

    await checkoutToolItem(item.id, {
      userId: selectedUserId,
      userName: technicianName.trim(),
      benchStation: benchStation.trim(),
      expectedReturn: returnTime,
      taskNotes: taskNotes.trim() || undefined,
    });

    onClose();
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await returnToolItem(item.id, returnNotes.trim() || undefined, returnCondition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                mode === 'checkout'
                  ? 'bg-amber-950/60 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {mode === 'checkout' ? <Wrench className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {mode === 'checkout' ? 'Clock Out Tool / Equipment' : 'Return Tool to Lab'}
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-xs">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Banner */}
        <div className="px-6 py-3 bg-[#0b0e14] border-b border-[#30363d]/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-300 font-semibold">{item.skuOrTag || item.brand || 'Item'}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {item.locationName || 'Unassigned / Blank'}
            </span>
          </div>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
              item.status === 'checked_out'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {item.status === 'checked_out' ? 'In Use' : 'Available'}
          </span>
        </div>

        {/* Body Form */}
        {mode === 'checkout' ? (
          <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
            {currentUser && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-cyan-400 uppercase">1-Click Quick Self Checkout</p>
                  <p className="text-xs text-white font-medium">
                    {currentUser.displayName} ({currentUser.benchStation || 'Current Bench'})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId(currentUser.id);
                    setTechnicianName(currentUser.displayName);
                    setBenchStation(currentUser.benchStation || 'Active Workstation');
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                >
                  Use My Profile
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Technician / Student Clocking Out <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.benchStation || 'No bench assigned'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Bench / Station Assignment
                </label>
                <input
                  type="text"
                  required
                  value={benchStation}
                  onChange={(e) => setBenchStation(e.target.value)}
                  placeholder="e.g. Bench 04, Solder Station"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Expected Use Duration
                </label>
                <select
                  value={expectedReturnHours}
                  onChange={(e) => setExpectedReturnHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>1 Hour (Quick task)</option>
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours (Half shift)</option>
                  <option value={8}>8 Hours (Full shift)</option>
                  <option value={24}>Overnight / 24 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Task / Project Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="e.g. Diagnosing 12V short on Project #3 GPU, re-flashing BIOS EEPROM."
                className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[#30363d] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#30363d] text-gray-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Clock Out Tool</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
            {item.checkedOutBy && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                <p className="text-[11px] font-mono text-amber-400 uppercase">Currently Clocked Out To:</p>
                <p className="text-xs font-bold text-white">
                  {item.checkedOutBy.userName} • {item.checkedOutBy.benchStation}
                </p>
                {item.checkedOutBy.taskNotes && (
                  <p className="text-xs text-gray-300 italic">"{item.checkedOutBy.taskNotes}"</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tool Condition Upon Return
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['good', 'fair', 'damaged', 'missing_parts'] as ToolCondition[]).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setReturnCondition(cond)}
                    className={`py-2 px-2 rounded-lg text-xs font-mono capitalize border transition-all text-center ${
                      returnCondition === cond
                        ? cond === 'good'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold'
                          : cond === 'fair'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                          : 'bg-red-500/20 text-red-300 border-red-500/60 font-bold'
                        : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
                    }`}
                  >
                    {cond.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Return Notes / Maintenance Issues (Optional)
              </label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="e.g. Iron tip tinned with lead-free solder; multimeter leads in good shape, battery at 9.1V."
                className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[#30363d] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#30363d] text-gray-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Return to Available</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
