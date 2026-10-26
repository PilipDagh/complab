import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LabInventoryItem, LabItemType, LabItemStatus } from '../../types';
import { ToolItemModal } from './ToolItemModal';
import { ToolCheckoutModal } from './ToolCheckoutModal';
import { LocationManagerModal } from './LocationManagerModal';
import {
  Wrench,
  Package,
  Layers,
  MapPin,
  Search,
  Filter,
  Plus,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  DollarSign,
  Tag,
  Boxes,
} from 'lucide-react';

export const ToolsSuppliesSuite: React.FC = () => {
  const {
    toolsAndSupplies,
    labLocations,
    deleteToolOrSupplyItem,
    useConsumableSupply,
    currentUser,
    isOwner,
  } = useApp();

  // Sub-view: 'tools_equipment' | 'supplies' | 'locations'
  const [activeSubView, setActiveSubView] = useState<'tools_equipment' | 'supplies' | 'locations'>('tools_equipment');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<LabInventoryItem | null>(null);
  const [defaultItemType, setDefaultItemType] = useState<LabItemType>('tool');

  const [checkoutModalItem, setCheckoutModalItem] = useState<LabInventoryItem | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'checkout' | 'return'>('checkout');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Filtered tools and equipment
  const filteredTools = useMemo(() => {
    return toolsAndSupplies.filter((item) => {
      if (item.itemType === 'supply') return false; // Handled in supplies view
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (locationFilter !== 'all') {
        if (locationFilter === 'blank' && item.locationId) return false;
        if (locationFilter !== 'blank' && item.locationId !== locationFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.skuOrTag?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchModel = item.model?.toLowerCase().includes(q);
        const matchLoc = item.locationName?.toLowerCase().includes(q);
        const matchTech = item.checkedOutBy?.userName.toLowerCase().includes(q);
        return matchName || matchSku || matchBrand || matchModel || matchLoc || matchTech;
      }
      return true;
    });
  }, [toolsAndSupplies, statusFilter, locationFilter, searchQuery]);

  // Filtered consumable supplies
  const filteredSupplies = useMemo(() => {
    return toolsAndSupplies.filter((item) => {
      if (item.itemType !== 'supply') return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (locationFilter !== 'all') {
        if (locationFilter === 'blank' && item.locationId) return false;
        if (locationFilter !== 'blank' && item.locationId !== locationFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.skuOrTag?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchLoc = item.locationName?.toLowerCase().includes(q);
        return matchName || matchSku || matchBrand || matchLoc;
      }
      return true;
    });
  }, [toolsAndSupplies, statusFilter, locationFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const tools = toolsAndSupplies.filter((i) => i.itemType !== 'supply');
    const supplies = toolsAndSupplies.filter((i) => i.itemType === 'supply');
    const checkedOutCount = tools.filter((i) => i.status === 'checked_out').length;
    const lowSuppliesCount = supplies.filter(
      (s) => (s.quantityOnHand ?? 0) <= (s.minReorderLevel ?? 2)
    ).length;

    return {
      totalTools: tools.length,
      checkedOutTools: checkedOutCount,
      availableTools: tools.length - checkedOutCount,
      totalSupplies: supplies.length,
      lowSupplies: lowSuppliesCount,
      totalLocations: labLocations.length,
    };
  }, [toolsAndSupplies, labLocations]);

  const handleOpenAddModal = (type: LabItemType) => {
    setItemToEdit(null);
    setDefaultItemType(type);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: LabInventoryItem) => {
    setItemToEdit(item);
    setDefaultItemType(item.itemType);
    setIsItemModalOpen(true);
  };

  const handleOpenCheckout = (item: LabInventoryItem) => {
    setCheckoutModalItem(item);
    setCheckoutMode('checkout');
  };

  const handleOpenReturn = (item: LabInventoryItem) => {
    setCheckoutModalItem(item);
    setCheckoutMode('return');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
                Lab Tools, Supplies & Equipment Inventory
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vocational Bench Tracking
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Real-time tracking of diagnostic gear, soldering equipment, consumable supplies, and custom storage zones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenAddModal('tool')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tool / Equipment</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('supply')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Add Supply / Consumable</span>
            </button>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-gray-700 border border-[#30363d] text-gray-200 text-xs font-semibold shadow transition-all"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Locations Manager ({labLocations.length})</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#30363d]">
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-gray-400 block">Total Tools & Gear</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.totalTools}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-emerald-400 block">Available on Bench</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-0.5 block">{stats.availableTools}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/30 bg-amber-950/10">
            <span className="text-[11px] font-mono text-amber-400 block">Clocked Out / In Use</span>
            <span className="text-xl font-bold font-mono text-amber-300 mt-0.5 block">{stats.checkedOutTools}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-cyan-400 block">Consumable Supplies</span>
            <span className="text-xl font-bold font-mono text-cyan-300 mt-0.5 block">{stats.totalSupplies}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-red-400 block">Low Stock Alerts</span>
            <span className="text-xl font-bold font-mono text-red-300 mt-0.5 block">{stats.lowSupplies}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-purple-400 block">Custom Locations</span>
            <span className="text-xl font-bold font-mono text-purple-300 mt-0.5 block">{stats.totalLocations}</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('tools_equipment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'tools_equipment'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tools & Equipment ({stats.totalTools})</span>
          </button>

          <button
            onClick={() => setActiveSubView('supplies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'supplies'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Consumable Supplies ({stats.totalSupplies})</span>
          </button>

          <button
            onClick={() => setActiveSubView('locations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'locations'
                ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Custom Locations Tab ({labLocations.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TOOLS & EQUIPMENT */}
      {activeSubView === 'tools_equipment' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, brand, SKU, serial, or technician..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="checked_out">In Use (Clocked Out)</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-500 max-w-[200px]"
              >
                <option value="all">All Locations</option>
                <option value="blank">Blank / Unassigned Only</option>
                {labLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const isCheckedOut = tool.status === 'checked_out';
              const isMine = isCheckedOut && currentUser && tool.checkedOutBy?.userId === currentUser.id;

              return (
                <div
                  key={tool.id}
                  className={`p-5 rounded-2xl bg-[#161b22] border transition-all flex flex-col justify-between group ${
                    isCheckedOut
                      ? 'border-amber-500/40 hover:border-amber-400 shadow-md'
                      : 'border-[#30363d] hover:border-gray-500 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isCheckedOut
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                              : 'bg-[#0d1117] text-gray-400 border border-[#30363d]'
                          }`}
                        >
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {tool.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                            <span>{tool.brand || tool.category}</span>
                            {tool.skuOrTag && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-300">{tool.skuOrTag}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isCheckedOut
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isCheckedOut ? 'IN USE' : 'AVAILABLE'}
                      </span>
                    </div>

                    {/* Physical Location Badge (Highlights Blank/Unassigned) */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {tool.locationName ? (
                        <span className="text-cyan-300 font-medium">{tool.locationName}</span>
                      ) : (
                        <span className="text-gray-500 italic font-mono">[ Blank / Unassigned ]</span>
                      )}
                    </div>

                    {/* Checkout Details if in use */}
                    {isCheckedOut && tool.checkedOutBy && (
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-amber-400 font-bold uppercase">Clocked Out To:</span>
                          <span className="text-gray-400">
                            {new Date(tool.checkedOutBy.checkedOutAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white">
                          {tool.checkedOutBy.userName}
                          <span className="text-gray-400 font-normal"> ({tool.checkedOutBy.benchStation})</span>
                        </p>
                        {tool.checkedOutBy.taskNotes && (
                          <p className="text-[11px] text-gray-300 italic truncate">
                            "{tool.checkedOutBy.taskNotes}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes if available */}
                    {!isCheckedOut && tool.notes && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]/60">
                        {tool.notes}
                      </p>
                    )}

                    {/* Metadata strip */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-1">
                      <span>Condition: <span className="text-gray-300 capitalize">{tool.condition}</span></span>
                      {tool.cost && <span>Value: ${tool.cost}</span>}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(tool)}
                        title="Edit tool details"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${tool.name}" from inventory?`)) {
                            deleteToolOrSupplyItem(tool.id);
                          }
                        }}
                        title="Delete tool"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      {isCheckedOut ? (
                        <button
                          onClick={() => handleOpenReturn(tool)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return to Lab</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCheckout(tool)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Clock Out Tool</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#30363d] rounded-2xl bg-[#161b22] space-y-3">
              <Wrench className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No tools match your current filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setLocationFilter('all');
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CONSUMABLE SUPPLIES */}
      {activeSubView === 'supplies' && (
        <div className="space-y-4">
          {/* Supplies Search & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplies by name, brand, SKU..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Storage Locations</option>
                <option value="blank">Blank / Unassigned Only</option>
                {labLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSupplies.map((supply) => {
              const qty = supply.quantityOnHand ?? 0;
              const minReorder = supply.minReorderLevel ?? 2;
              const isLow = qty <= minReorder;
              const isDepleted = qty <= 0;

              return (
                <div
                  key={supply.id}
                  className={`p-5 rounded-2xl bg-[#161b22] border transition-all flex flex-col justify-between group ${
                    isDepleted
                      ? 'border-red-500/50 bg-red-950/10'
                      : isLow
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : 'border-[#30363d] hover:border-gray-500'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isDepleted
                              ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                              : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {supply.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                            <span>{supply.brand || supply.category}</span>
                            {supply.skuOrTag && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-300">{supply.skuOrTag}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isDepleted
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isDepleted ? 'DEPLETED' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {supply.locationName ? (
                        <span className="text-cyan-300 font-medium">{supply.locationName}</span>
                      ) : (
                        <span className="text-gray-500 italic font-mono">[ Blank / Unassigned ]</span>
                      )}
                    </div>

                    {/* Stock level meter */}
                    <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-400">Remaining Quantity:</span>
                        <span
                          className={`font-bold text-sm ${
                            isDepleted ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {qty} {supply.unitOfMeasure || 'units'}
                        </span>
                      </div>
                      <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDepleted ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (qty / (Math.max(qty, minReorder * 3) || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                        <span>Min Reorder: {minReorder}</span>
                        {supply.cost && <span>Unit Cost: ${supply.cost}</span>}
                      </div>
                    </div>

                    {supply.notes && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {supply.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(supply)}
                        title="Edit supply info"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${supply.name}" from supplies?`)) {
                            deleteToolOrSupplyItem(supply.id);
                          }
                        }}
                        title="Delete supply"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      disabled={qty <= 0}
                      onClick={() => {
                        const purpose = prompt(
                          `Log usage of 1 ${supply.unitOfMeasure || 'unit'} of ${supply.name}. Enter task/work order note:`,
                          'General bench repair'
                        );
                        if (purpose !== null) {
                          useConsumableSupply(supply.id, 1, purpose || undefined);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all ${
                        qty <= 0
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>Use 1 Unit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSupplies.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#30363d] rounded-2xl bg-[#161b22] space-y-3">
              <Package className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No consumable supplies match your query</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('all');
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DEDICATED CUSTOM LOCATIONS TAB */}
      {activeSubView === 'locations' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Physical Lab Location Management
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Manage all designated drawers, crash carts, clean rooms, and shelves. Items can also be left with no location ("Blank / Unassigned").
              </p>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Manage Custom Locations</span>
            </button>
          </div>

          {/* Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labLocations.map((loc) => {
              const itemsInLoc = toolsAndSupplies.filter((i) => i.locationId === loc.id);

              return (
                <div
                  key={loc.id}
                  className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-purple-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                          <span className="text-[10px] font-mono text-purple-300 uppercase">
                            {loc.zoneType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#0d1117] text-gray-300 border border-[#30363d]">
                        {itemsInLoc.length} {itemsInLoc.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {loc.description && (
                      <p className="text-xs text-gray-400 leading-relaxed bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
                        {loc.description}
                      </p>
                    )}

                    {/* Stored items quick list */}
                    {itemsInLoc.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Stored Items:</span>
                        <div className="flex flex-wrap gap-1">
                          {itemsInLoc.slice(0, 4).map((i) => (
                            <span
                              key={i.id}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0d1117] text-gray-300 border border-[#30363d] truncate max-w-[140px]"
                            >
                              {i.name}
                            </span>
                          ))}
                          {itemsInLoc.length > 4 && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">
                              +{itemsInLoc.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-mono text-[11px]">
                      Created by {loc.createdBy}
                    </span>
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="text-purple-400 hover:text-purple-300 font-mono text-xs hover:underline"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Modal (Add/Edit) */}
      <ToolItemModal
        isOpen={isItemModalOpen}
        itemToEdit={itemToEdit}
        defaultType={defaultItemType}
        onClose={() => setIsItemModalOpen(false)}
      />

      {/* Checkout / Return Modal */}
      <ToolCheckoutModal
        item={checkoutModalItem}
        mode={checkoutMode}
        onClose={() => setCheckoutModalItem(null)}
      />

      {/* Locations Management Modal */}
      <LocationManagerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
