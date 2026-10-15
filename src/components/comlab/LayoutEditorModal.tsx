import React, { useState } from 'react';
import { ComLabLayoutConfig, ComLabRowConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Grid,
  Check,
  AlertCircle,
  HelpCircle,
  Shield,
  Layers,
} from 'lucide-react';

interface LayoutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayoutEditorModal: React.FC<LayoutEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    comLabLayout,
    updateComLabLayout,
    resetComLabToSchoolDefaults,
    isOwner,
    currentUser,
    addToast,
  } = useApp();

  // Local draft of layout
  const [rows, setRows] = useState<ComLabRowConfig[]>(() =>
    JSON.parse(JSON.stringify(comLabLayout.rows))
  );
  const [labName, setLabName] = useState(comLabLayout.labName);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Toggle whether a slot in a row is active (has PC) or empty space
  const handleToggleSlot = (rowIndex: number, slotNumber: number) => {
    setRows((prev) => {
      const updated = [...prev];
      const targetRow = { ...updated[rowIndex] };
      const currentActive = new Set(targetRow.activeSlots);

      if (currentActive.has(slotNumber)) {
        currentActive.delete(slotNumber);
      } else {
        currentActive.add(slotNumber);
      }

      targetRow.activeSlots = Array.from(currentActive).sort((a, b) => a - b);
      updated[rowIndex] = targetRow;
      return updated;
    });
  };

  // Change slot count for a row
  const handleChangeSlotCount = (rowIndex: number, newCount: number) => {
    if (newCount < 1 || newCount > 8) return;
    setRows((prev) => {
      const updated = [...prev];
      const targetRow = { ...updated[rowIndex] };
      targetRow.slotsCount = newCount;
      // Filter out active slots beyond newCount
      targetRow.activeSlots = targetRow.activeSlots.filter((s) => s <= newCount);
      updated[rowIndex] = targetRow;
      return updated;
    });
  };

  // Add a new row
  const handleAddRow = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const usedLetters = new Set(rows.map((r) => r.rowId));
    let nextLetter = 'E';
    for (const char of letters) {
      if (!usedLetters.has(char)) {
        nextLetter = char;
        break;
      }
    }

    const newRow: ComLabRowConfig = {
      rowId: nextLetter,
      label: `Row ${nextLetter}`,
      slotsCount: 4,
      activeSlots: [1, 2, 3, 4],
      benchNotes: `Newly configured laboratory row ${nextLetter}.`,
    };

    setRows((prev) => [...prev, newRow]);
  };

  // Remove a row
  const handleDeleteRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      addToast({
        type: 'warning',
        title: 'Minimum Rows Reached',
        message: 'The ComLab layout must have at least one bench row.',
      });
      return;
    }
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Save changes
  const handleSave = async () => {
    if (!isOwner) {
      addToast({
        type: 'error',
        title: 'Owner Privilege Required',
        message: 'Only Julian (Owner) has authorization to restructure the physical ComLab layout.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedConfig: ComLabLayoutConfig = {
        ...comLabLayout,
        labName: labName.trim() || 'Main TradeTech Computer Lab',
        rows,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.displayName || 'Julian (Owner)',
      };
      await updateComLabLayout(updatedConfig);
      onClose();
    } catch (err) {
      console.error('Error saving layout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (confirm('Reset ComLab to vocational default 4-row architecture (Row A 3 PCs, C3 no power, C4 zero parts)?')) {
      await resetComLabToSchoolDefaults();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono tracking-wide">
                  ComLab Physical Layout Editor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Owner Only</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Configure aerial rows, adjust workstation slot density, or add new benches.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-sm">
          {/* Lab Title */}
          <div className="bg-[#0d1117] border border-[#30363d] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Facility / Lab Designation
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="bg-[#161b22] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-72 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-cyan-400 block">
                Numbering Orientation: Right → Left
              </span>
              <p className="text-[11px] text-gray-400">
                Slot 1 on the right, Slot 4 on the left
              </p>
            </div>
          </div>

          {/* Rows List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Configured Lab Rows ({rows.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Row</span>
              </button>
            </div>

            {rows.map((row, idx) => (
              <div
                key={row.rowId}
                className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#21262d] border border-gray-700 flex items-center justify-center font-mono font-bold text-white text-sm">
                      {row.rowId}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) => {
                            const updated = [...prev];
                            updated[idx].label = val;
                            return updated;
                          });
                        }}
                        className="bg-transparent border-b border-gray-700 focus:border-cyan-400 text-sm font-bold text-white px-1 py-0.5 focus:outline-none"
                      />
                      <span className="text-xs text-gray-500 block mt-0.5 font-mono">
                        {row.activeSlots.length} Active PCs of {row.slotsCount} Slots
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-gray-400">Total Slots:</span>
                      <button
                        type="button"
                        onClick={() => handleChangeSlotCount(idx, row.slotsCount - 1)}
                        className="w-6 h-6 rounded bg-[#21262d] border border-gray-700 hover:bg-gray-700 text-gray-200 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-white font-bold">{row.slotsCount}</span>
                      <button
                        type="button"
                        onClick={() => handleChangeSlotCount(idx, row.slotsCount + 1)}
                        className="w-6 h-6 rounded bg-[#21262d] border border-gray-700 hover:bg-gray-700 text-gray-200 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      title="Delete this row"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Interactive Slot Toggle Matrix (Displaying Right-to-Left order: high to 1) */}
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
                    <span>Click a slot to toggle Active PC vs Empty Desk:</span>
                    <span className="text-gray-500">← Left (High) | Right (1) →</span>
                  </div>

                  {/* Render slots in Right-to-Left visual order */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Array.from({ length: row.slotsCount }, (_, i) => row.slotsCount - i).map((slotNum) => {
                      const isActive = row.activeSlots.includes(slotNum);
                      return (
                        <button
                          key={slotNum}
                          type="button"
                          onClick={() => handleToggleSlot(idx, slotNum)}
                          className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                            isActive
                              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300 shadow-sm'
                              : 'bg-[#161b22] border-dashed border-gray-700 text-gray-500 hover:border-gray-500'
                          }`}
                        >
                          <span className="text-xs font-mono font-bold">
                            {isActive ? `PC ${row.rowId}${slotNum}` : `[Empty Desk]`}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            Slot #{slotNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#30363d] bg-[#0d1117]/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg border border-red-800/40 text-red-400 hover:bg-red-950/40 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset School Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Physical Layout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
