import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LabInventoryItem, LabItemType, ToolCondition } from '../../types';
import { LocationManagerModal } from './LocationManagerModal';
import {
  Wrench,
  Package,
  Cpu,
  Plus,
  MapPin,
  X,
  Sparkles,
  Barcode,
  Layers,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface ToolItemModalProps {
  isOpen: boolean;
  itemToEdit?: LabInventoryItem | null;
  defaultType?: LabItemType;
  onClose: () => void;
}

export const ToolItemModal: React.FC<ToolItemModalProps> = ({
  isOpen,
  itemToEdit,
  defaultType = 'tool',
  onClose,
}) => {
  const { labLocations, addToolOrSupplyItem, updateToolOrSupplyItem, addLabLocation } = useApp();

  const [itemType, setItemType] = useState<LabItemType>(itemToEdit?.itemType || defaultType);
  const [name, setName] = useState(itemToEdit?.name || '');
  const [category, setCategory] = useState(itemToEdit?.category || 'Hand Tools');
  const [skuOrTag, setSkuOrTag] = useState(itemToEdit?.skuOrTag || '');
  const [brand, setBrand] = useState(itemToEdit?.brand || '');
  const [model, setModel] = useState(itemToEdit?.model || '');
  const [serialNumber, setSerialNumber] = useState(itemToEdit?.serialNumber || '');

  // Location tracking: supports blank / unassigned
  const [locationId, setLocationId] = useState<string>(itemToEdit?.locationId || '');
  const [condition, setCondition] = useState<ToolCondition>(itemToEdit?.condition || 'good');

  // Supply fields
  const [quantityOnHand, setQuantityOnHand] = useState<number>(itemToEdit?.quantityOnHand ?? 10);
  const [unitOfMeasure, setUnitOfMeasure] = useState<string>(itemToEdit?.unitOfMeasure || 'units');
  const [minReorderLevel, setMinReorderLevel] = useState<number>(itemToEdit?.minReorderLevel ?? 2);

  const [cost, setCost] = useState<number | ''>(itemToEdit?.cost ?? '');
  const [notes, setNotes] = useState(itemToEdit?.notes || '');
  const [barcode, setBarcode] = useState(itemToEdit?.barcode || '');

  // Sub-modal for location management
  const [isLocationManagerOpen, setIsLocationManagerOpen] = useState(false);

  // Quick inline add custom location
  const [showQuickAddLoc, setShowQuickAddLoc] = useState(false);
  const [quickLocName, setQuickLocName] = useState('');

  if (!isOpen) return null;

  const handleQuickAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLocName.trim()) return;

    const created = await addLabLocation({
      name: quickLocName.trim(),
      zoneType: 'tool_storage',
      description: 'Quick added from item editor',
      createdBy: 'Technician',
    });

    setLocationId(created.id);
    setQuickLocName('');
    setShowQuickAddLoc(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedLocation = labLocations.find((l) => l.id === locationId);

    const payload = {
      name: name.trim(),
      itemType,
      category: category.trim(),
      skuOrTag: skuOrTag.trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      // If locationId is empty string, it's explicitly Blank/Unassigned
      locationId: locationId || undefined,
      locationName: matchedLocation ? matchedLocation.name : undefined,
      status: itemToEdit ? itemToEdit.status : ('available' as const),
      condition,
      quantityOnHand: itemType === 'supply' ? Number(quantityOnHand) : undefined,
      unitOfMeasure: itemType === 'supply' ? unitOfMeasure : undefined,
      minReorderLevel: itemType === 'supply' ? Number(minReorderLevel) : undefined,
      cost: cost !== '' ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
      barcode: barcode.trim() || undefined,
    };

    if (itemToEdit) {
      await updateToolOrSupplyItem(itemToEdit.id, payload);
    } else {
      await addToolOrSupplyItem(payload);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                {itemType === 'tool' ? (
                  <Wrench className="w-5 h-5" />
                ) : itemType === 'supply' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <Cpu className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {itemToEdit ? 'Edit Lab Inventory Item' : 'Add New Tool, Supply, or Equipment'}
                </h2>
                <p className="text-xs text-gray-400">
                  Track physical location, condition, specs, and clock-out availability
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Item Type Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Item Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'tool' as LabItemType, label: 'Tool', desc: 'Meters, Drivers, Hand Tools' },
                  { type: 'supply' as LabItemType, label: 'Consumable Supply', desc: 'Flux, Solder, Thermal Paste' },
                  { type: 'equipment' as LabItemType, label: 'Bench Equipment', desc: 'Stations, Blowers, Scopes' },
                ].map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setItemType(t.type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      itemType === t.type
                        ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-sm'
                        : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold capitalize">{t.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hakko FX-888D Soldering Station, Arctic MX-4 4g, Fluke Multimeter"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Soldering, Hand Tools, Meters, Consumables"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">SKU / Asset Tag</label>
                <input
                  type="text"
                  value={skuOrTag}
                  onChange={(e) => setSkuOrTag(e.target.value)}
                  placeholder="e.g. TL-FLK-87V, SUP-MX4-01"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Brand / Manufacturer</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Fluke, Hakko, iFixit, Kester"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Model / Part #</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 87V, FX-888D, Pro Tech"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* LOCATION SELECTOR WITH BLANK OPTION + INLINE ADD CUSTOM LOCATION */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Physical Location Assignment
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddLoc(!showQuickAddLoc)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Location</span>
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() => setIsLocationManagerOpen(true)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Manage Locations ({labLocations.length})
                  </button>
                </div>
              </div>

              {/* Quick Inline Location Creator */}
              {showQuickAddLoc && (
                <div className="p-2.5 rounded-lg bg-[#161b22] border border-cyan-500/40 flex items-center gap-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={quickLocName}
                    onChange={(e) => setQuickLocName(e.target.value)}
                    placeholder="Enter new custom location name..."
                    className="flex-1 px-2.5 py-1.5 rounded bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickAddLocation(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddLocation}
                    className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
                  >
                    Save & Select
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddLoc(false)}
                    className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Main Location Dropdown with Blank Option */}
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {/* REQUIRED: Blank / Unassigned Option */}
                <option value="">[ None / Blank ] — Unassigned Location</option>

                {labLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name} ({loc.zoneType.replace('_', ' ')})
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-gray-400 font-mono">
                {locationId ? (
                  <span className="text-cyan-300">
                    Assigned to: {labLocations.find((l) => l.id === locationId)?.name}
                  </span>
                ) : (
                  <span className="text-gray-500">Currently unassigned (blank location).</span>
                )}
              </p>
            </div>

            {/* Consumable Supply Quantity Details */}
            {itemType === 'supply' && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Consumable Stock Tracking
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Quantity on Hand</label>
                    <input
                      type="number"
                      min={0}
                      value={quantityOnHand}
                      onChange={(e) => setQuantityOnHand(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Unit of Measure</label>
                    <input
                      type="text"
                      value={unitOfMeasure}
                      onChange={(e) => setUnitOfMeasure(e.target.value)}
                      placeholder="e.g. tubes, spools, bottles, packs"
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Min Reorder Level</label>
                    <input
                      type="number"
                      min={0}
                      value={minReorderLevel}
                      onChange={(e) => setMinReorderLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tool Condition & Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Condition Rating</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ToolCondition)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="new">New (Factory fresh)</option>
                  <option value="good">Good (Normal calibrated bench use)</option>
                  <option value="fair">Fair (Wear visible, functional)</option>
                  <option value="damaged">Damaged (Needs repair / calibration)</option>
                  <option value="missing_parts">Missing Parts / Bits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Replacement Cost ($ USD)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 135.00"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Notes & Barcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-300 mb-1">Notes & Specifications</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Includes T18 chisel tip and iron stand. Calibrated October 2026."
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Barcode / Serial Tag</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. HK-48201-A"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#30363d] flex items-center justify-end gap-2">
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
                <Plus className="w-4 h-4" />
                <span>{itemToEdit ? 'Save Changes' : 'Register Item'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sub-modal: Location Manager */}
      <LocationManagerModal
        isOpen={isLocationManagerOpen}
        onClose={() => setIsLocationManagerOpen(false)}
        onSelectLocation={(locId) => setLocationId(locId)}
      />
    </>
  );
};
