import React, { useState } from 'react';
import { RepairTaskPreset, TimeClockTaskCategory } from '../types';
import { REPAIR_TASK_PRESETS, PRESET_CATEGORY_FILTERS } from '../data/repairTaskPresets';
import { Sparkles, Check, ChevronDown, ChevronUp, Clock, Tag } from 'lucide-react';

interface QuickAddRepairChipsProps {
  onSelectPreset: (preset: RepairTaskPreset) => void;
  selectedPresetId?: string;
  className?: string;
  compact?: boolean;
}

export const QuickAddRepairChips: React.FC<QuickAddRepairChipsProps> = ({
  onSelectPreset,
  selectedPresetId,
  className = '',
  compact = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  const filteredPresets = REPAIR_TASK_PRESETS.filter((preset) => {
    if (selectedCategory === 'All') return true;
    return preset.category === selectedCategory;
  });

  const handleChipClick = (preset: RepairTaskPreset) => {
    setLastClickedId(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className={`bg-[#0d1117] border border-[#30363d] rounded-xl p-3 space-y-2.5 font-mono ${className}`}>
      {/* Header with expand/collapse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Quick-Add Common Repair Tasks</span>
            <span className="text-[10px] text-cyan-400 font-normal">
              ({filteredPresets.length} presets)
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-[#161b22]"
        >
          <span>{isExpanded ? 'Collapse' : 'Show Presets'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
            {PRESET_CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all font-semibold ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-[#161b22] text-gray-400 hover:text-gray-200 border border-[#30363d]/60 hover:border-[#30363d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Interactive Preset Chips Grid */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id || lastClickedId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleChipClick(preset)}
                  title={`Autofill: ${preset.description}`}
                  className={`group px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 text-left border ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                      : 'bg-[#161b22] border-[#30363d] text-gray-300 hover:bg-[#21262d] hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span className="font-semibold text-[11px]">{preset.label}</span>

                  {preset.estimatedMinutes && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#0d1117] text-gray-400 border border-[#30363d]/60 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {preset.estimatedMinutes}m
                    </span>
                  )}

                  {isSelected && (
                    <Check className="w-3 h-3 text-cyan-400 ml-0.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-500 pt-0.5 flex items-center gap-1">
            <span>💡 Click any preset to instantly auto-fill task description, category, and estimated time.</span>
          </div>
        </>
      )}
    </div>
  );
};
