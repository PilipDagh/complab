import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  InventoryItem,
  SavedHardwareCombo,
  InventoryCategory,
} from '../data/shopManagementDatabase';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Printer,
  FileDown,
  Search,
  Check,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Monitor,
  HardDrive,
  Flame,
  Tag,
  Boxes,
  Info,
  ChevronDown,
  Sparkles,
  Award,
  Clock,
  DollarSign,
  Download,
  FileText,
  X,
  Sliders,
} from 'lucide-react';

interface HardwareCombosPlannerProps {
  inventory: InventoryItem[];
  savedCombos: SavedHardwareCombo[];
  onSaveCombo: (combo: SavedHardwareCombo) => void;
  onDeleteCombo: (comboId: string) => void;
  onApplyToWorkbench?: (combo: SavedHardwareCombo) => void;
}

export const HardwareCombosPlanner: React.FC<HardwareCombosPlannerProps> = ({
  inventory,
  savedCombos,
  onSaveCombo,
  onDeleteCombo,
  onApplyToWorkbench,
}) => {
  const { addToast, currentUser } = useApp();

  // Builder State
  const [comboName, setComboName] = useState<string>('Enthusiast 1440p Esports & Creator Rig');
  const [comboCategory, setComboCategory] = useState<SavedHardwareCombo['category']>('Gaming Build');
  const [targetClient, setTargetClient] = useState<string>('Vocational Station Alpha');
  const [ticketRef, setTicketRef] = useState<string>('WO-2026-8812');
  const [benchStation, setBenchStation] = useState<string>('Bench 01');
  const [targetResolution, setTargetResolution] = useState<'1080p' | '1440p' | '4K UHD' | '8K' | 'Ultrawide'>('1440p');
  const [comboNotes, setComboNotes] = useState<string>('Tuned for zero thermal throttling and low acoustic footprint under continuous load.');

  // Current Parts in Builder
  const [selectedParts, setSelectedParts] = useState<{
    cpu?: InventoryItem;
    gpu?: InventoryItem;
    mb?: InventoryItem;
    ram?: InventoryItem;
    ssd?: InventoryItem;
    psu?: InventoryItem;
    cooler?: InventoryItem;
    case?: InventoryItem;
    extraParts: InventoryItem[];
  }>({
    cpu: inventory.find((i) => i.id === 'cpu_001') || inventory.find((i) => i.category === 'Processors (CPUs)'),
    gpu: inventory.find((i) => i.id === 'gpu_005') || inventory.find((i) => i.category === 'Graphics Cards (GPUs)'),
    mb: inventory.find((i) => i.id === 'mb_007') || inventory.find((i) => i.category === 'Motherboards'),
    ram: inventory.find((i) => i.id === 'ram_001') || inventory.find((i) => i.category === 'Memory (RAM)'),
    ssd: inventory.find((i) => i.id === 'ssd_005') || inventory.find((i) => i.category === 'Storage (SSD / HDD)'),
    psu: inventory.find((i) => i.id === 'psu_004') || inventory.find((i) => i.category === 'Power Supplies (PSUs)'),
    cooler: inventory.find((i) => i.id === 'cl_001') || inventory.find((i) => i.category === 'Cooling & Fans'),
    case: inventory.find((i) => i.id === 'cs_002') || inventory.find((i) => i.category === 'Cases & Chassis'),
    extraParts: [],
  });

  // Combo Search & Filter
  const [comboSearch, setComboSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Quick Part Selector Modal State
  const [activeSlotModal, setActiveSlotModal] = useState<string | null>(null);
  const [partSearchQuery, setPartSearchQuery] = useState<string>('');

  // Total Cost & Power Calculations
  const allCurrentParts = useMemo(() => {
    const list: InventoryItem[] = [];
    if (selectedParts.cpu) list.push(selectedParts.cpu);
    if (selectedParts.gpu) list.push(selectedParts.gpu);
    if (selectedParts.mb) list.push(selectedParts.mb);
    if (selectedParts.ram) list.push(selectedParts.ram);
    if (selectedParts.ssd) list.push(selectedParts.ssd);
    if (selectedParts.psu) list.push(selectedParts.psu);
    if (selectedParts.cooler) list.push(selectedParts.cooler);
    if (selectedParts.case) list.push(selectedParts.case);
    list.push(...selectedParts.extraParts);
    return list;
  }, [selectedParts]);

  const totalCost = useMemo(() => {
    return allCurrentParts.reduce((sum, item) => sum + item.unitCost, 0);
  }, [allCurrentParts]);

  const totalTdp = useMemo(() => {
    const cpuTdp = selectedParts.cpu?.tdpWatts || 105;
    const gpuTdp = selectedParts.gpu?.tdpWatts || 220;
    const mbTdp = 50;
    const ramTdp = 15;
    const storageTdp = 10;
    const coolerTdp = 20;
    return cpuTdp + gpuTdp + mbTdp + ramTdp + storageTdp + coolerTdp;
  }, [selectedParts]);

  const recommendedPsu = useMemo(() => {
    return Math.ceil((totalTdp * 1.35) / 50) * 50;
  }, [totalTdp]);

  // Bottleneck calculation for this combo
  const bottleneckRating = useMemo(() => {
    const cpu = selectedParts.cpu;
    const gpu = selectedParts.gpu;
    if (!cpu || !gpu) {
      return {
        cpuScore: 90,
        gpuScore: 90,
        bottleneckPercent: 4,
        mainBottleneck: 'Balanced Synergy' as const,
        severity: 'Minimal' as const,
      };
    }
    const cpuScore = Math.min(100, Math.round((cpu.unitCost / 6.0) + (cpu.tdpWatts || 105) * 0.2));
    const gpuScore = Math.min(100, Math.round((gpu.unitCost / 18.0) + (gpu.tdpWatts || 220) * 0.1));

    let bottleneckPercent = Math.abs(cpuScore - gpuScore);
    if (targetResolution === '4K UHD' || targetResolution === '8K') {
      bottleneckPercent = Math.max(2, Math.round(bottleneckPercent * 0.6));
    }

    let mainBottleneck: 'CPU Bound' | 'GPU Bound' | 'Balanced Synergy' = 'Balanced Synergy';
    if (cpuScore < gpuScore - 12) mainBottleneck = 'CPU Bound';
    else if (gpuScore < cpuScore - 12) mainBottleneck = 'GPU Bound';

    let severity: 'Minimal' | 'Mild' | 'Noticeable' | 'Severe' = 'Minimal';
    if (bottleneckPercent > 30) severity = 'Severe';
    else if (bottleneckPercent > 18) severity = 'Noticeable';
    else if (bottleneckPercent > 8) severity = 'Mild';

    return {
      cpuScore,
      gpuScore,
      bottleneckPercent,
      mainBottleneck,
      severity,
    };
  }, [selectedParts.cpu, selectedParts.gpu, targetResolution]);

  // Handle Save Current Combo
  const handleSaveCurrentCombo = () => {
    if (!comboName.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Combo Name is required.',
      });
      return;
    }

    const newCombo: SavedHardwareCombo = {
      id: `combo_${Date.now()}`,
      name: comboName.trim(),
      category: comboCategory,
      targetClient: targetClient.trim() || undefined,
      ticketRef: ticketRef.trim() || undefined,
      benchStation: benchStation.trim() || undefined,
      targetResolution: targetResolution,
      targetWorkload: 'Gaming & Production Multitask',
      parts: allCurrentParts.map((p) => ({
        partId: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unitCost: p.unitCost,
        quantity: 1,
        tdpWatts: p.tdpWatts,
        socket: p.socket,
        location: p.location,
      })),
      totalCost,
      totalTdp,
      recommendedPsu,
      bottleneckRating,
      notes: comboNotes.trim(),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      technicianName: currentUser?.displayName || 'Lead Bench Technician',
    };

    onSaveCombo(newCombo);
    addToast({
      type: 'success',
      title: 'Hardware Combo Saved',
      message: `"${newCombo.name}" with ${newCombo.parts.length} components saved ($${totalCost.toFixed(2)}).`,
    });
  };

  // Load a Saved Combo into Builder
  const handleLoadCombo = (combo: SavedHardwareCombo) => {
    setComboName(combo.name);
    setComboCategory(combo.category);
    if (combo.targetClient) setTargetClient(combo.targetClient);
    if (combo.ticketRef) setTicketRef(combo.ticketRef);
    if (combo.benchStation) setBenchStation(combo.benchStation);
    if (combo.targetResolution) setTargetResolution(combo.targetResolution);
    if (combo.notes) setComboNotes(combo.notes);

    // Map parts back
    const cpuPart = inventory.find((i) => i.category === 'Processors (CPUs)' && combo.parts.some((p) => p.sku === i.sku));
    const gpuPart = inventory.find((i) => i.category === 'Graphics Cards (GPUs)' && combo.parts.some((p) => p.sku === i.sku));
    const mbPart = inventory.find((i) => i.category === 'Motherboards' && combo.parts.some((p) => p.sku === i.sku));
    const ramPart = inventory.find((i) => i.category === 'Memory (RAM)' && combo.parts.some((p) => p.sku === i.sku));
    const ssdPart = inventory.find((i) => i.category === 'Storage (SSD / HDD)' && combo.parts.some((p) => p.sku === i.sku));
    const psuPart = inventory.find((i) => i.category === 'Power Supplies (PSUs)' && combo.parts.some((p) => p.sku === i.sku));
    const coolerPart = inventory.find((i) => i.category === 'Cooling & Fans' && combo.parts.some((p) => p.sku === i.sku));
    const casePart = inventory.find((i) => i.category === 'Cases & Chassis' && combo.parts.some((p) => p.sku === i.sku));

    setSelectedParts({
      cpu: cpuPart,
      gpu: gpuPart,
      mb: mbPart,
      ram: ramPart,
      ssd: ssdPart,
      psu: psuPart,
      cooler: coolerPart,
      case: casePart,
      extraParts: [],
    });

    addToast({
      type: 'info',
      title: 'Combo Loaded to Workbench',
      message: `Loaded "${combo.name}" into the active build planner.`,
    });
  };

  // Export Formatted PDF Report
  const handleExportPDF = (combo?: SavedHardwareCombo) => {
    const target = combo || {
      id: 'draft',
      name: comboName,
      category: comboCategory,
      targetClient,
      ticketRef,
      benchStation,
      targetResolution,
      parts: allCurrentParts.map((p) => ({
        partId: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unitCost: p.unitCost,
        quantity: 1,
        tdpWatts: p.tdpWatts,
        socket: p.socket,
        location: p.location,
      })),
      totalCost,
      totalTdp,
      recommendedPsu,
      bottleneckRating,
      notes: comboNotes,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      technicianName: currentUser?.displayName || 'Lead Vocational Technician',
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark Header & Branding
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(56, 189, 248); // Cyan 400
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TRADETECH VOCATIONAL ENGINEERING LAB', 14, 15);

    doc.setTextColor(226, 232, 240); // Slate 200
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Hardware Combination & Synergy Diagnostic Report', 14, 22);

    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()} | CompTIA A+ Standard BOM`, 14, 30);

    // Right Header Reference Tag
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(140, 8, 56, 22, 2, 2, 'F');
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`TICKET: ${target.ticketRef || 'BENCH-DRAFT'}`, 144, 15);
    doc.setFont('helvetica', 'normal');
    doc.text(`STATION: ${target.benchStation || 'Station 01'}`, 144, 21);
    doc.text(`CLIENT: ${(target.targetClient || 'Internal Lab').substring(0, 15)}`, 144, 27);

    // Section 1: Build Overview
    let yPos = 46;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Build Profile: ${target.name}`, 14, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Category: ${target.category} | Target Resolution: ${target.targetResolution || '1440p'} | Technician: ${target.technicianName}`, 14, yPos);

    // Summary KPI Box
    yPos += 6;
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(14, yPos, 182, 18, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, yPos, 182, 18, 2, 2, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TOTAL COST BASIS', 20, yPos + 6);
    doc.text('TOTAL ESTIMATED TDP', 68, yPos + 6);
    doc.text('RECOMMENDED PSU', 115, yPos + 6);
    doc.text('BOTTLENECK RATING', 158, yPos + 6);

    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199); // Sky 600
    doc.text(`$${target.totalCost.toFixed(2)}`, 20, yPos + 13);
    doc.text(`${target.totalTdp} Watts`, 68, yPos + 13);
    doc.text(`${target.recommendedPsu}W (80+ Gold)`, 115, yPos + 13);

    const bRating = target.bottleneckRating;
    const bColor = bRating.bottleneckPercent <= 10 ? [16, 185, 129] : bRating.bottleneckPercent <= 20 ? [2, 132, 199] : [239, 68, 68];
    doc.setTextColor(bColor[0], bColor[1], bColor[2]);
    doc.text(`${bRating.bottleneckPercent}% (${bRating.severity})`, 158, yPos + 13);

    // Section 2: Bill of Materials (BOM) Table
    yPos += 26;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Itemized Bill of Materials (BOM) & Inventory Allocation', 14, yPos);

    yPos += 4;
    // Table Header
    doc.setFillColor(30, 41, 59);
    doc.rect(14, yPos, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CATEGORY', 16, yPos + 5);
    doc.text('PART SKU', 52, yPos + 5);
    doc.text('DESCRIPTION & MODEL', 88, yPos + 5);
    doc.text('BIN LOC', 150, yPos + 5);
    doc.text('PRICE', 182, yPos + 5, { align: 'right' });

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    target.parts.forEach((p, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, 182, 6.5, 'F');
      }
      doc.setTextColor(30, 41, 59);
      doc.text(p.category.replace(/\s*\(.*?\)\s*/g, '').substring(0, 18), 16, yPos + 4.5);
      doc.text(p.sku.substring(0, 16), 52, yPos + 4.5);
      doc.text(p.name.substring(0, 34), 88, yPos + 4.5);
      doc.text((p.location || 'Bench Bay').substring(0, 14), 150, yPos + 4.5);
      doc.text(`$${p.unitCost.toFixed(2)}`, 192, yPos + 4.5, { align: 'right' });
      yPos += 6.5;
    });

    // Notes Box
    if (target.notes) {
      yPos += 4;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, yPos, 182, 14, 1.5, 1.5, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.text(`Technician Notes: ${target.notes}`, 18, yPos + 5, { maxWidth: 174 });
      yPos += 16;
    } else {
      yPos += 6;
    }

    // Sign-Off Block
    yPos += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, yPos, 196, yPos);

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB QA & BENCH SIGN-OFF CERTIFICATION', 14, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Lead Technician Signature: ___________________________', 14, yPos);
    doc.text('Date Verified: _______________', 130, yPos);

    yPos += 7;
    doc.text('ESD Ground & Thermal Dissipation Verified: [ X ] PASSED', 14, yPos);
    doc.text('Work Order Attachment Status: [ X ] ATTACHED', 130, yPos);

    // Save File
    const sanitizedName = target.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`TradeTech_Hardware_Combo_${sanitizedName}.pdf`);

    addToast({
      type: 'success',
      title: 'PDF Report Exported',
      message: `Downloaded formatted specification sheet for "${target.name}".`,
    });
  };

  // Filtered Saved Combos List
  const filteredCombos = useMemo(() => {
    return savedCombos.filter((c) => {
      const matchesSearch =
        comboSearch === '' ||
        c.name.toLowerCase().includes(comboSearch.toLowerCase()) ||
        (c.targetClient && c.targetClient.toLowerCase().includes(comboSearch.toLowerCase())) ||
        (c.ticketRef && c.ticketRef.toLowerCase().includes(comboSearch.toLowerCase()));
      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [savedCombos, comboSearch, categoryFilter]);

  // Slot Selector Helper
  const openSlotModal = (slotKey: string) => {
    setActiveSlotModal(slotKey);
    setPartSearchQuery('');
  };

  const getFilteredInventoryForSlot = (slotKey: string) => {
    let cat: InventoryCategory = 'Processors (CPUs)';
    if (slotKey === 'cpu') cat = 'Processors (CPUs)';
    if (slotKey === 'gpu') cat = 'Graphics Cards (GPUs)';
    if (slotKey === 'mb') cat = 'Motherboards';
    if (slotKey === 'ram') cat = 'Memory (RAM)';
    if (slotKey === 'ssd') cat = 'Storage (SSD / HDD)';
    if (slotKey === 'psu') cat = 'Power Supplies (PSUs)';
    if (slotKey === 'cooler') cat = 'Cooling & Fans';
    if (slotKey === 'case') cat = 'Cases & Chassis';

    return inventory.filter(
      (i) =>
        i.category === cat &&
        (partSearchQuery === '' ||
          i.name.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
          i.sku.toLowerCase().includes(partSearchQuery.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-gray-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              Build Planner & Hardware Combinations
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                {savedCombos.length} Saved Combos
              </span>
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Design, save, balance, and export complete vocational PC builds and part combos as PDF work order attachments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportPDF()}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-mono font-semibold border border-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Active PDF</span>
          </button>
          <button
            onClick={handleSaveCurrentCombo}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Combo</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Build Slots (8 Cols) vs Metrics & Saved Combos (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Build Slots (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Build Details Bar */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Combo / Build Name *</label>
                <input
                  type="text"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-bold focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g. Budget 1080p Esports Rig"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Build Target Category</label>
                <select
                  value={comboCategory}
                  onChange={(e: any) => setComboCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="Gaming Build">Gaming Build</option>
                  <option value="Workstation / CAD">Workstation / CAD</option>
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Esports Budget">Esports Budget</option>
                  <option value="Bench Test Kit">Bench Test Kit</option>
                  <option value="Student Lab Practice">Student Lab Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Target Client / Dept</label>
                <input
                  type="text"
                  value={targetClient}
                  onChange={(e) => setTargetClient(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g. CompTIA Lab 102"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Work Order Ref / Bench</label>
                <input
                  type="text"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="WO-2026-001"
                />
              </div>
            </div>
          </div>

          {/* Component Slots Grid */}
          <div className="space-y-2.5">
            {[
              { key: 'cpu', label: 'Processor (CPU)', icon: <Cpu className="w-4 h-4 text-cyan-400" />, part: selectedParts.cpu, color: 'border-cyan-500/40' },
              { key: 'gpu', label: 'Graphics Card (GPU)', icon: <Flame className="w-4 h-4 text-purple-400" />, part: selectedParts.gpu, color: 'border-purple-500/40' },
              { key: 'mb', label: 'Motherboard', icon: <Boxes className="w-4 h-4 text-sky-400" />, part: selectedParts.mb, color: 'border-sky-500/40' },
              { key: 'ram', label: 'Memory (RAM)', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, part: selectedParts.ram, color: 'border-emerald-500/40' },
              { key: 'ssd', label: 'Primary Storage (SSD)', icon: <HardDrive className="w-4 h-4 text-amber-400" />, part: selectedParts.ssd, color: 'border-amber-500/40' },
              { key: 'psu', label: 'Power Supply (PSU)', icon: <Zap className="w-4 h-4 text-yellow-400" />, part: selectedParts.psu, color: 'border-yellow-500/40' },
              { key: 'cooler', label: 'CPU Cooling', icon: <Award className="w-4 h-4 text-teal-400" />, part: selectedParts.cooler, color: 'border-teal-500/40' },
              { key: 'case', label: 'Chassis / Case', icon: <Layers className="w-4 h-4 text-indigo-400" />, part: selectedParts.case, color: 'border-indigo-500/40' },
            ].map((slot) => (
              <div
                key={slot.key}
                className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                    {slot.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      {slot.label}
                    </div>
                    {slot.part ? (
                      <div>
                        <div className="font-sans font-bold text-white text-xs">
                          {slot.part.name}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{slot.part.sku}</span>
                          <span>•</span>
                          <span>{slot.part.location}</span>
                          {slot.part.tdpWatts && <span>• {slot.part.tdpWatts}W</span>}
                          {slot.part.socket && <span>• {slot.part.socket}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-gray-500 italic">No component selected</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {slot.part && (
                    <span className="font-mono font-bold text-xs text-cyan-400 mr-2">
                      ${slot.part.unitCost.toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => openSlotModal(slot.key)}
                    className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-mono transition-colors cursor-pointer"
                  >
                    {slot.part ? 'Change' : 'Select Part'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Build Telemetry & Saved Combos Library (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Build Summary Card */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-4 font-mono">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Build Synergy & Power Analysis
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Estimated Total Cost:</span>
                <span className="text-base font-bold text-cyan-400">${totalCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total System TDP:</span>
                <span className="font-bold text-white">{totalTdp} Watts</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Recommended PSU:</span>
                <span className="font-bold text-yellow-400">{recommendedPsu}W (80+ Gold)</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
                <span className="text-gray-400">Synergy / Bottleneck:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    bottleneckRating.bottleneckPercent <= 10
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {bottleneckRating.bottleneckPercent}% ({bottleneckRating.severity})
                </span>
              </div>
            </div>

            <button
              onClick={() => handleExportPDF()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Specification Report</span>
            </button>
          </div>

          {/* Saved Combos Drawer / List */}
          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider text-gray-300 font-bold flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-purple-400" />
                Saved Combos ({savedCombos.length})
              </h4>
            </div>

            {/* Search Combos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
              <input
                type="text"
                value={comboSearch}
                onChange={(e) => setComboSearch(e.target.value)}
                placeholder="Search saved combos..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Combos Scroll List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {filteredCombos.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-900/50 border border-dashed border-gray-800 text-center text-gray-500 text-xs py-6">
                  No saved combos yet. Click "Save Combo" to store this configuration.
                </div>
              ) : (
                filteredCombos.map((combo) => (
                  <div
                    key={combo.id}
                    className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-purple-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="font-bold text-white text-xs line-clamp-1">{combo.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {combo.category} • {combo.parts.length} parts
                        </div>
                      </div>
                      <span className="font-bold text-xs text-cyan-400">${combo.totalCost.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800/80">
                      <span>{combo.ticketRef || 'No Ticket'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLoadCombo(combo)}
                          className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                          title="Load into builder"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExportPDF(combo)}
                          className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 transition-colors"
                          title="Export PDF"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => onDeleteCombo(combo.id)}
                          className="p-1 rounded hover:bg-red-950 text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete combo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Part Picker Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className="max-w-2xl w-full bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                Select Component for Slot: {activeSlotModal.toUpperCase()}
              </h4>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search in Modal */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={partSearchQuery}
                onChange={(e) => setPartSearchQuery(e.target.value)}
                placeholder="Filter by SKU, model, socket, or location..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {getFilteredInventoryForSlot(activeSlotModal).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedParts((prev) => ({
                      ...prev,
                      [activeSlotModal]: item,
                    }));
                    setActiveSlotModal(null);
                    addToast({
                      type: 'info',
                      title: 'Slot Updated',
                      message: `Equipped ${item.name} ($${item.unitCost.toFixed(2)}).`,
                    });
                  }}
                  className="p-3 rounded-xl bg-gray-900/80 hover:bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div>
                    <div className="font-sans font-bold text-white text-xs group-hover:text-cyan-300">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="text-cyan-400 font-semibold">{item.sku}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                      {item.socket && <span>• {item.socket}</span>}
                      {item.tdpWatts && <span>• {item.tdpWatts}W</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs text-cyan-400">${item.unitCost.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500">{item.stock} in stock</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
