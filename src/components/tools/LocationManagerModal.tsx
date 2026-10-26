import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabLocation, LabZoneType } from '../../types';
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Package,
  Layers,
  Sparkles,
  Info,
  Edit2,
  Check,
} from 'lucide-react';

interface LocationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (locationId: string) => void;
}

export const LocationManagerModal: React.FC<LocationManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const { labLocations, toolsAndSupplies, addLabLocation, updateLabLocation, deleteLabLocation } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [zoneType, setZoneType] = useState<LabZoneType>('tool_storage');
  const [description, setDescription] = useState('');

  // Edit states
  const [editName, setEditName] = useState('');
  const [editZoneType, setEditZoneType] = useState<LabZoneType>('tool_storage');
  const [editDescription, setEditDescription] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLoc = await addLabLocation({
      name: name.trim(),
      zoneType,
      description: description.trim(),
      createdBy: 'Technician',
    });

    setName('');
    setDescription('');
    setIsAdding(false);

    if (onSelectLocation) {
      onSelectLocation(newLoc.id);
      onClose();
    }
  };

  const startEdit = (loc: LabLocation) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditZoneType(loc.zoneType);
    setEditDescription(loc.description || '');
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateLabLocation(id, {
      name: editName.trim(),
      zoneType: editZoneType,
      description: editDescription.trim(),
    });
    setEditingId(null);
  };

  const getZoneLabel = (zone: LabZoneType) => {
    switch (zone) {
      case 'tool_storage':
        return 'Tool Wall / Chest';
      case 'bench_area':
        return 'Workstation Bench';
      case 'mobile_cart':
        return 'Mobile Crash Cart';
      case 'solder_bench':
      case 'chemical_locker':
        return 'Chemical & Solvents';
      case 'clean_room':
        return 'Clean Room Shelf';
      case 'staging_shelf':
        return 'Outbound Staging';
      default:
        return 'Storage Zone';
    }
  };

  const getZoneBadgeColor = (zone: LabZoneType) => {
    switch (zone) {
      case 'tool_storage':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'bench_area':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'mobile_cart':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'chemical_locker':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'staging_shelf':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Custom Physical Locations Manager
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {labLocations.length} Locations
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Organize tools, equipment racks, mobile crash carts, and solvent lockers
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Locations configured here appear across all tool checkout lists and equipment modals.
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Location</span>
              </button>
            )}
          </div>

          {/* Inline Add Location Form */}
          {isAdding && (
            <form
              onSubmit={handleCreate}
              className="p-4 rounded-xl bg-[#0d1117] border border-cyan-500/40 space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> New Physical Storage Location
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Location Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tool Chest C - Drawer 3, Clean Room Rack"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Zone Type</label>
                  <select
                    value={zoneType}
                    onChange={(e) => setZoneType(e.target.value as LabZoneType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tool_storage">Tool Wall / Chest / Tool Cabinet</option>
                    <option value="bench_area">Workstation Bench Area</option>
                    <option value="mobile_cart">Mobile Crash Cart / Rolling Unit</option>
                    <option value="chemical_locker">Chemical & Solvent Locker</option>
                    <option value="staging_shelf">Outbound Staging / QA Shelf</option>
                    <option value="clean_room">Clean Room & Sensitive Parts</option>
                    <option value="secure_cabinet">Lockable Secure Cabinet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Description / Specific Notes (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Top steel drawer with foam cutouts for calibrated multimeters."
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#30363d] text-gray-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                >
                  Save & Add Location
                </button>
              </div>
            </form>
          )}

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labLocations.map((loc) => {
              const isEditing = editingId === loc.id;
              // Real-time count of items assigned to this location
              const itemsInLocation = toolsAndSupplies.filter((i) => i.locationId === loc.id);

              if (isEditing) {
                return (
                  <div
                    key={loc.id}
                    className="p-4 rounded-xl bg-[#0d1117] border border-cyan-500/50 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#161b22] border border-[#30363d] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Zone</label>
                      <select
                        value={editZoneType}
                        onChange={(e) => setEditZoneType(e.target.value as LabZoneType)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#161b22] border border-[#30363d] text-xs text-white"
                      >
                        <option value="tool_storage">Tool Wall / Chest</option>
                        <option value="bench_area">Workstation Bench Area</option>
                        <option value="mobile_cart">Mobile Crash Cart</option>
                        <option value="chemical_locker">Chemical Locker</option>
                        <option value="staging_shelf">Outbound Staging</option>
                        <option value="clean_room">Clean Room</option>
                        <option value="secure_cabinet">Lockable Cabinet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#161b22] border border-[#30363d] text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded border border-[#30363d] text-xs text-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(loc.id)}
                        className="px-3 py-1 rounded bg-cyan-600 text-xs text-white font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={loc.id}
                  className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-gray-600 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <h3 className="text-sm font-semibold text-white">{loc.name}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getZoneBadgeColor(
                          loc.zoneType
                        )}`}
                      >
                        {getZoneLabel(loc.zoneType)}
                      </span>
                    </div>

                    {loc.description && (
                      <p className="text-xs text-gray-400 leading-relaxed">{loc.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono">
                      <Package className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {itemsInLocation.length}{' '}
                        {itemsInLocation.length === 1 ? 'item stored' : 'items stored'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {onSelectLocation && (
                        <button
                          onClick={() => {
                            onSelectLocation(loc.id);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-colors"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(loc)}
                        title="Edit location details"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${loc.name}"? Any items stored here will be reset to Unassigned (Blank).`
                            )
                          ) {
                            deleteLabLocation(loc.id);
                          }
                        }}
                        title="Delete location"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {labLocations.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#30363d] rounded-2xl bg-[#0d1117] space-y-3">
              <MapPin className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No physical locations configured yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Add your vocational lab's tool drawers, soldering benches, and supply shelves to begin tracking inventory.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold shadow hover:bg-cyan-500"
              >
                <Plus className="w-4 h-4" /> Add First Location
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Items can also be left with no location ("Blank / Unassigned").</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#21262d] hover:bg-gray-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
