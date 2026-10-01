import React, { useState } from 'react';
import {
  PSU_24PIN_DATA,
  MOTHERBOARD_BEEP_CODES,
  COMMAND_CHEAT_SHEET,
} from '../data/seedData';
import {
  INITIAL_PARTS_INVENTORY,
  INVENTORY_CATEGORIES,
  InventoryCategory,
} from '../data/shopManagementDatabase';
import { PSUPinInfo } from '../types';
import {
  Zap,
  Volume2,
  Terminal,
  Calculator,
  Search,
  Copy,
  Check,
  ShieldAlert,
  Info,
  ExternalLink,
  Cpu,
  Package,
  Layers,
  Boxes,
  Tag,
  X,
} from 'lucide-react';

export const BenchReference: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'psu' | 'beep' | 'commands' | 'calc' | 'parts_catalog'>('psu');

  // Parts Catalog State
  const [partsSearch, setPartsSearch] = useState<string>('');
  const [partsCategory, setPartsCategory] = useState<InventoryCategory | 'ALL'>('ALL');
  const [copiedPartSku, setCopiedPartSku] = useState<string | null>(null);

  // PSU Interactive State
  const [selectedPin, setSelectedPin] = useState<PSUPinInfo>(PSU_24PIN_DATA[15]); // Default to Pin 16 PS_ON

  // Beep Code State
  const [selectedVendor, setSelectedVendor] = useState<'ALL' | 'AMI' | 'Award' | 'Phoenix' | 'Dell' | 'HP'>('ALL');
  const [beepSearch, setBeepSearch] = useState<string>('');

  // Command Cheat Sheet State
  const [cmdOs, setCmdOs] = useState<'ALL' | 'Windows' | 'Linux'>('ALL');
  const [cmdSearch, setCmdSearch] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Component Calculator State
  const [cpuTdp, setCpuTdp] = useState<number>(125);
  const [gpuTdp, setGpuTdp] = useState<number>(285);
  const [ramSticks, setRamSticks] = useState<number>(2);
  const [nvmeDrives, setNvmeDrives] = useState<number>(2);
  const [sataDrives, setSataDrives] = useState<number>(1);
  const [fansCount, setFansCount] = useState<number>(6);
  const [hasAioPump, setHasAioPump] = useState<boolean>(true);
  const [overclockHeadroom, setOverclockHeadroom] = useState<boolean>(false);

  // Wattage Calculation
  const totalBaseWattage =
    cpuTdp * (overclockHeadroom ? 1.25 : 1.0) +
    gpuTdp +
    ramSticks * 6 +
    nvmeDrives * 8 +
    sataDrives * 12 +
    fansCount * 4 +
    (hasAioPump ? 25 : 0) +
    50; // Motherboard chipset & USB base load

  const recommendedPsuRating = Math.ceil((totalBaseWattage * 1.35) / 50) * 50; // 35% safety margin rounded to nearest 50W

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Filtered Beep codes
  const filteredBeeps = MOTHERBOARD_BEEP_CODES.filter((code) => {
    const matchesVendor = selectedVendor === 'ALL' || code.vendor === selectedVendor;
    const matchesQuery =
      code.sequence.toLowerCase().includes(beepSearch.toLowerCase()) ||
      code.meaning.toLowerCase().includes(beepSearch.toLowerCase()) ||
      code.recommendedAction.toLowerCase().includes(beepSearch.toLowerCase());
    return matchesVendor && matchesQuery;
  });

  // Filtered Commands
  const filteredCommands = COMMAND_CHEAT_SHEET.filter((item) => {
    const matchesOs = cmdOs === 'ALL' || item.os === cmdOs;
    const matchesQuery =
      item.command.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(cmdSearch.toLowerCase());
    return matchesOs && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#161b22] border border-[#30363d] rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('psu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeSubTab === 'psu'
              ? 'bg-[#21262d] text-[#38bdf8] border border-[#30363d] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-[#ffd166]" />
          <span>PSU Pinouts & Voltage Tolerances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('beep')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeSubTab === 'beep'
              ? 'bg-[#21262d] text-[#38bdf8] border border-[#30363d] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#2ea043]" />
          <span>Motherboard POST Beep Codes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('commands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeSubTab === 'commands'
              ? 'bg-[#21262d] text-[#38bdf8] border border-[#30363d] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-[#38bdf8]" />
          <span>CLI Repair Cheat Sheet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeSubTab === 'calc'
              ? 'bg-[#21262d] text-[#38bdf8] border border-[#30363d] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4 text-purple-400" />
          <span>Component PSU Wattage Calculator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('parts_catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeSubTab === 'parts_catalog'
              ? 'bg-[#21262d] text-cyan-300 border border-[#30363d] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 text-cyan-400" />
          <span>PC Parts & Hardware Directory</span>
        </button>
      </div>

      {/* MODULE 1: PSU PINOUT & VOLTAGE REFERENCE */}
      {activeSubTab === 'psu' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#ffd166]" />
                ATX 24-Pin Main Power Connector Interactive Reference
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Click any pin below to inspect voltage standards, wire colors, DMM tolerance ranges, and paperclip jump points.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#2ea043] flex items-center gap-1.5">
              <span>Standard: ATX12V v2.52 / v3.1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Pinout Matrix (2x12 grid) */}
            <div className="lg:col-span-7 bg-[#0d1117] p-5 rounded-xl border border-[#30363d] space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 pb-2 border-b border-[#30363d]/60">
                <span>Row 1: Pins 1 to 12</span>
                <span className="text-[#38bdf8]">Click Pin to Probe</span>
                <span>Row 2: Pins 13 to 24</span>
              </div>

              {/* 2-Row Pin Grid representation */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                {/* Row 1 (Pins 1-12) */}
                {PSU_24PIN_DATA.slice(0, 12).map((pin) => {
                  const isSelected = selectedPin.pin === pin.pin;
                  return (
                    <button
                      key={pin.pin}
                      onClick={() => setSelectedPin(pin)}
                      className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-between p-1.5 transition-all text-center border relative ${
                        isSelected
                          ? 'ring-2 ring-[#38bdf8] scale-105 shadow-lg shadow-cyan-950/40 z-10'
                          : 'hover:scale-102 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: '#161b22',
                        borderColor: isSelected ? '#38bdf8' : '#30363d',
                      }}
                    >
                      <span className="font-mono text-[10px] text-gray-400">#{pin.pin}</span>
                      <div
                        className="w-4 h-4 rounded-full shadow-inner border border-black/40"
                        style={{ backgroundColor: pin.colorHex }}
                        title={pin.colorName}
                      />
                      <span className="font-mono text-[9px] font-bold text-gray-200 truncate w-full">
                        {pin.label}
                      </span>
                    </button>
                  );
                })}

                {/* Row 2 (Pins 13-24) */}
                {PSU_24PIN_DATA.slice(12, 24).map((pin) => {
                  const isSelected = selectedPin.pin === pin.pin;
                  return (
                    <button
                      key={pin.pin}
                      onClick={() => setSelectedPin(pin)}
                      className={`h-16 sm:h-20 rounded-lg flex flex-col items-center justify-between p-1.5 transition-all text-center border relative ${
                        isSelected
                          ? 'ring-2 ring-[#38bdf8] scale-105 shadow-lg shadow-cyan-950/40 z-10'
                          : 'hover:scale-102 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: '#161b22',
                        borderColor: isSelected ? '#38bdf8' : '#30363d',
                      }}
                    >
                      <span className="font-mono text-[10px] text-gray-400">#{pin.pin}</span>
                      <div
                        className="w-4 h-4 rounded-full shadow-inner border border-black/40"
                        style={{ backgroundColor: pin.colorHex }}
                        title={pin.colorName}
                      />
                      <span className="font-mono text-[9px] font-bold text-gray-200 truncate w-full">
                        {pin.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Wire Color Legend */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff9900]"></span> +3.3V (Orange)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e63946]"></span> +5V (Red)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffd166]"></span> +12V (Yellow)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9d4edd]"></span> +5VSB (Purple)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043]"></span> PS_ON (Green)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#222222] border border-gray-600"></span> COM/GND (Black)
                </span>
              </div>
            </div>

            {/* Selected Pin Deep Inspection Card */}
            <div className="lg:col-span-5 bg-[#0d1117] p-5 rounded-xl border border-[#30363d] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-md"
                    style={{ backgroundColor: selectedPin.colorHex }}
                  >
                    #{selectedPin.pin}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{selectedPin.label}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Wire Color: {selectedPin.colorName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">
                    {selectedPin.voltage}
                  </span>
                  <div className="text-[10px] text-gray-400 font-mono">Nominal Voltage</div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-gray-400 block mb-1">Functional Description:</span>
                  <p className="text-gray-200 bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]/80">
                    {selectedPin.description}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-gray-400 block mb-1">Multimeter Acceptance Tolerance:</span>
                  <div className="text-[#2ea043] font-mono bg-[#2ea043]/10 p-2.5 rounded-lg border border-[#2ea043]/30 font-semibold">
                    {selectedPin.tolerance}
                  </div>
                </div>

                {selectedPin.pin === 16 && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-[11px] text-emerald-200 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-emerald-400 font-mono">
                      ⚡ Paperclip Jump Start Procedure:
                    </span>
                    <p>
                      To jump start the PSU independently of the motherboard, bend a paperclip and bridge{' '}
                      <span className="font-bold text-white">Pin 16 (Green PS_ON#)</span> to any adjacent Ground pin (such as{' '}
                      <span className="font-bold text-white">Pin 15 or 17 Black</span>). Always keep at least one fan connected as dummy load!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8-Pin EPS CPU & 6+2 PCIe Quick Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#30363d]">
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
              <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>8-Pin EPS 12V Auxiliary CPU Connector</span>
                <span className="text-[#ffd166] text-[10px]">CPU Vcore Power</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pins 1–4 are <span className="text-white font-bold">COM Ground (Black)</span>. Pins 5–8 are{' '}
                <span className="text-[#ffd166] font-bold">+12V DC (Yellow)</span>. Warning: Do NOT confuse with 8-pin PCIe! The keying notches prevent insertion, but forcing it will short 12V directly into Ground.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
              <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>6+2 Pin PCIe Graphics Power Connector</span>
                <span className="text-[#38bdf8] text-[10px]">GPU Auxiliary Power</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pins 1–3 are <span className="text-[#ffd166] font-bold">+12V DC (Yellow)</span>. Pins 4–8 are{' '}
                <span className="text-white font-bold">COM Ground & Sense (Black)</span>. Sense pins inform the GPU VRM controller that the auxiliary cable is fully engaged.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: MOTHERBOARD BEEP CODE DECODER */}
      {activeSubTab === 'beep' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#2ea043]" />
                Motherboard POST Beep Code & LED Decoder
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Filter by BIOS firmware vendor or search error sequence to view CompTIA resolution procedures.
              </p>
            </div>

            {/* Vendor Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'AMI', 'Award', 'Phoenix', 'Dell', 'HP'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVendor(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                    selectedVendor === v
                      ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/50 font-bold'
                      : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={beepSearch}
              onChange={(e) => setBeepSearch(e.target.value)}
              placeholder="Search beep pattern (e.g. '1 Long', '5 Short', 'RAM', 'Dell')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38bdf8] font-mono"
            />
          </div>

          {/* Beep Code Table/Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBeeps.map((beep) => (
              <div
                key={beep.id}
                className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-gray-500 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d]">
                    {beep.vendor} BIOS
                  </span>
                  <span className="font-mono text-[11px] text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20">
                    Pattern: {beep.audioPattern}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#ffd166] font-mono">{beep.sequence}</h4>
                  <p className="text-xs text-gray-200 mt-0.5 font-medium">{beep.meaning}</p>
                </div>

                <div className="text-xs text-gray-400 bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]/70">
                  <span className="text-gray-300 font-semibold block mb-0.5">Recommended Bench Action:</span>
                  {beep.recommendedAction}
                </div>

                <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between pt-1">
                  <span>CompTIA Objective: {beep.compTiaRef}</span>
                  <span className="text-[#2ea043]">Verified Spec</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 3: COMMAND LINE REPAIR CHEAT SHEET */}
      {activeSubTab === 'commands' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#38bdf8]" />
                Technician Command Line Cheat Sheet
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Windows CMD/PowerShell and Linux recovery terminal one-liners with single-click copy.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'Windows', 'Linux'] as const).map((os) => (
                <button
                  key={os}
                  onClick={() => setCmdOs(os)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                    cmdOs === os
                      ? 'bg-[#2ea043]/15 text-[#2ea043] border-[#2ea043]/50 font-bold'
                      : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white'
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
              placeholder="Search commands (e.g. 'sfc', 'chkdsk', 'smartctl', 'dns')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38bdf8] font-mono"
            />
          </div>

          {/* Commands List */}
          <div className="space-y-3">
            {filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-gray-500 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        cmd.os === 'Windows'
                          ? 'bg-blue-500/20 text-[#38bdf8] border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {cmd.os}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]">
                      {cmd.category}
                    </span>
                    {cmd.elevationRequired && (
                      <span className="text-[10px] font-mono text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/40">
                        Admin / sudo Required
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(cmd.command)}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-gray-300 hover:text-white transition-colors border border-[#30363d]"
                  >
                    {copiedCmd === cmd.command ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2ea043]" />
                        <span className="text-[#2ea043]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] font-mono text-xs text-[#38bdf8] overflow-x-auto">
                  <code>{cmd.command}</code>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{cmd.description}</p>

                {cmd.sampleOutput && (
                  <div className="bg-[#000000]/60 p-2.5 rounded-lg border border-[#30363d]/60 font-mono text-[11px] text-gray-400 overflow-x-auto whitespace-pre">
                    <span className="text-gray-400 block mb-1">Expected Sample Output:</span>
                    {cmd.sampleOutput}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: COMPONENT PSU WATTAGE CALCULATOR */}
      {activeSubTab === 'calc' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-7 shadow-2xl space-y-6">
          <div className="border-b border-[#30363d] pb-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              Component Power Draw & PSU Sizing Benchmark Calculator
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Estimate system thermal design power (TDP), transient spike headroom, and 80 PLUS efficiency curves.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Sliders & Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* CPU TDP */}
              <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">Processor (CPU) Base TDP:</span>
                  <span className="text-[#38bdf8] font-bold">{cpuTdp} W</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="350"
                  step="5"
                  value={cpuTdp}
                  onChange={(e) => setCpuTdp(Number(e.target.value))}
                  className="w-full accent-[#38bdf8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>35W (i3/Ryzen 5)</span>
                  <span>125W (i7/Ryzen 7)</span>
                  <span>253W+ (i9-14900K PL2)</span>
                </div>
              </div>

              {/* GPU TDP */}
              <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">Graphics Card (GPU) TGP:</span>
                  <span className="text-[#ffd166] font-bold">{gpuTdp} W</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="10"
                  value={gpuTdp}
                  onChange={(e) => setGpuTdp(Number(e.target.value))}
                  className="w-full accent-[#ffd166] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>0W (Integrated iGPU)</span>
                  <span>200W (RTX 4070)</span>
                  <span>450W+ (RTX 4090)</span>
                </div>
              </div>

              {/* Additional Components Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <label className="text-xs font-mono text-gray-300 block mb-1">RAM Sticks</label>
                  <select
                    value={ramSticks}
                    onChange={(e) => setRamSticks(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-xs text-white font-mono"
                  >
                    <option value={1}>1 DIMM (6W)</option>
                    <option value={2}>2 DIMMs (12W)</option>
                    <option value={4}>4 DIMMs (24W)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <label className="text-xs font-mono text-gray-300 block mb-1">NVMe M.2 Drives</label>
                  <select
                    value={nvmeDrives}
                    onChange={(e) => setNvmeDrives(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-xs text-white font-mono"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1 Drive (8W)</option>
                    <option value={2}>2 Drives (16W)</option>
                    <option value={3}>3+ Drives (24W)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <label className="text-xs font-mono text-gray-300 block mb-1">SATA Drives</label>
                  <select
                    value={sataDrives}
                    onChange={(e) => setSataDrives(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-xs text-white font-mono"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1 Drive (12W)</option>
                    <option value={2}>2 Drives (24W)</option>
                    <option value={4}>4 Drives (48W)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0d1117] border border-[#30363d] cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={hasAioPump}
                    onChange={(e) => setHasAioPump(e.target.checked)}
                    className="accent-[#2ea043] rounded"
                  />
                  <span>Liquid Cooler AIO Pump (+25W)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0d1117] border border-[#30363d] cursor-pointer text-xs font-mono text-gray-300">
                  <input
                    type="checkbox"
                    checked={overclockHeadroom}
                    onChange={(e) => setOverclockHeadroom(e.target.checked)}
                    className="accent-[#2ea043] rounded"
                  />
                  <span>CPU Overclock Headroom (+25%)</span>
                </label>
              </div>
            </div>

            {/* Results Output Summary */}
            <div className="lg:col-span-5 bg-[#0d1117] p-5 rounded-xl border border-[#30363d] space-y-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                  Calculated Bench Sizing:
                </div>

                <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Total System Sustained Load:</span>
                    <span className="text-white font-bold">{Math.round(totalBaseWattage)} Watts</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Peak Transient Spikes (ATX 3.1):</span>
                    <span className="text-[#ffd166] font-bold">
                      {Math.round(totalBaseWattage * 1.5)} Watts
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#30363d] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-gray-400 uppercase">
                        Recommended Power Supply:
                      </div>
                      <div className="text-2xl font-bold font-mono text-[#2ea043]">
                        {recommendedPsuRating}W PSU
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#2ea043]/15 text-[#2ea043] border border-[#2ea043]/30 font-bold">
                      80 PLUS GOLD+
                    </span>
                  </div>
                </div>
              </div>

              {/* Bench Efficiency & Pro-Tip */}
              <div className="space-y-2 text-xs font-mono text-gray-300 bg-[#161b22] p-3.5 rounded-xl border border-[#30363d]">
                <div className="text-[#38bdf8] font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  CompTIA 80 PLUS Curve Sweet Spot:
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Switching power supplies reach peak electrical efficiency (lowest heat dissipation and fan noise) when operating between <span className="text-white font-semibold">50% and 70%</span> of their rated capacity. Sizing a {recommendedPsuRating}W unit guarantees zero thermal throttling of PSU rails.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: PC HARDWARE & BENCH PARTS DIRECTORY */}
      {activeSubTab === 'parts_catalog' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Comprehensive PC Hardware & Spare Parts Catalog
              </h3>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Technical database of all {INITIAL_PARTS_INVENTORY.length} PC components, CPU sockets, memory standards, power ratings, and storage form factors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                {INITIAL_PARTS_INVENTORY.length} Active Catalog Items
              </span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3 font-mono text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search across all PC parts (e.g., 7800X3D, RTX 4090, AM5, DDR5, PCIe 5.0, 1000W)..."
                value={partsSearch}
                onChange={(e) => setPartsSearch(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-8 py-2.5 text-white focus:border-cyan-500 focus:outline-none placeholder-gray-500"
              />
              {partsSearch && (
                <button
                  onClick={() => setPartsSearch('')}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setPartsCategory('ALL')}
                className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  partsCategory === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-[#0d1117] text-gray-400 border border-[#30363d] hover:text-white'
                }`}
              >
                All Categories ({INITIAL_PARTS_INVENTORY.length})
              </button>
              {INVENTORY_CATEGORIES.map((cat) => {
                const count = INITIAL_PARTS_INVENTORY.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setPartsCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      partsCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-[#0d1117] text-gray-400 border border-[#30363d] hover:text-white'
                    }`}
                  >
                    <span>{cat.replace(/\s*\(.*?\)\s*/g, '')}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 text-gray-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {INITIAL_PARTS_INVENTORY
              .filter((item) => {
                const matchesSearch =
                  partsSearch === '' ||
                  item.name.toLowerCase().includes(partsSearch.toLowerCase()) ||
                  item.sku.toLowerCase().includes(partsSearch.toLowerCase()) ||
                  (item.socket && item.socket.toLowerCase().includes(partsSearch.toLowerCase())) ||
                  (item.formFactor && item.formFactor.toLowerCase().includes(partsSearch.toLowerCase())) ||
                  (item.supplier && item.supplier.toLowerCase().includes(partsSearch.toLowerCase()));

                const matchesCat = partsCategory === 'ALL' || item.category === partsCategory;
                return matchesSearch && matchesCat;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-cyan-500/50 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-gray-400">
                        {item.category.replace(/\s*\(.*?\)\s*/g, '')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Stock: {item.stock}
                      </span>
                    </div>

                    <div>
                      <div className="font-sans font-semibold text-sm text-gray-100 group-hover:text-white line-clamp-2">
                        {item.name}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.sku);
                            setCopiedPartSku(item.sku);
                            setTimeout(() => setCopiedPartSku(null), 2000);
                          }}
                          className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 flex items-center gap-1 hover:border-cyan-400"
                          title="Click to copy SKU"
                        >
                          <span>{item.sku}</span>
                          {copiedPartSku === item.sku ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>

                        {item.socket && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300 font-semibold">
                            {item.socket}
                          </span>
                        )}

                        {item.formFactor && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/40 text-sky-300">
                            {item.formFactor}
                          </span>
                        )}

                        {item.tdpWatts && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                            {item.tdpWatts}W
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between pt-1">
                      <span>📍 {item.location}</span>
                      <span className="text-gray-500">{item.supplier}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#30363d] pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-500">Unit Basis</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      ${item.unitCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
