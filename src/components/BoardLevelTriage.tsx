import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  executeModuleAiQuery,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  ModuleAiResponse,
} from '../lib/geminiModuleAi';
import {
  Cpu,
  Zap,
  HardDrive,
  FileCode,
  Flame,
  Activity,
  Layers,
  Thermometer,
  BatteryCharging,
  Sparkles,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Camera,
  Upload,
  AlertTriangle,
  Info,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Trash2,
  Key,
  X,
  RefreshCw,
  Sliders,
  Radio,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

// Tool IDs
type Module1ToolId =
  | 'smd_decoder'
  | 'smart_parser'
  | 'post_matrix'
  | 'thermal_vision'
  | 'multimeter_isolator'
  | 'ram_visualizer'
  | 'thermal_pads'
  | 'battery_parser';

// ==========================================
// EIA-96 Lookup Table (Complete 96 Codes)
// ==========================================
const EIA96_VALUE_MAP: Record<string, number> = {
  '01': 100, '02': 102, '03': 105, '04': 107, '05': 110, '06': 113, '07': 115, '08': 118,
  '09': 121, '10': 124, '11': 127, '12': 130, '13': 133, '14': 137, '15': 140, '16': 143,
  '17': 147, '18': 150, '19': 154, '20': 158, '21': 162, '22': 165, '23': 169, '24': 174,
  '25': 178, '26': 182, '27': 187, '28': 191, '29': 196, '30': 200, '31': 205, '32': 210,
  '33': 215, '34': 221, '35': 226, '36': 232, '37': 237, '38': 243, '39': 249, '40': 255,
  '41': 261, '42': 267, '43': 274, '44': 280, '45': 287, '46': 294, '47': 301, '48': 309,
  '49': 316, '50': 324, '51': 332, '52': 340, '53': 348, '54': 357, '55': 365, '56': 374,
  '57': 383, '58': 392, '59': 402, '60': 412, '61': 422, '62': 432, '63': 442, '64': 453,
  '65': 464, '66': 475, '67': 487, '68': 499, '69': 511, '70': 523, '71': 536, '72': 549,
  '73': 562, '74': 576, '75': 590, '76': 604, '77': 619, '78': 634, '79': 649, '80': 665,
  '81': 681, '82': 698, '83': 715, '84': 732, '85': 750, '86': 768, '87': 787, '88': 806,
  '89': 825, '90': 845, '91': 866, '92': 887, '93': 909, '94': 931, '95': 953, '96': 976,
};

const EIA96_MULTIPLIERS: Record<string, number> = {
  Z: 0.001,
  Y: 0.01,
  X: 0.1,
  S: 0.1,
  R: 0.1,
  A: 1,
  B: 10,
  H: 10,
  C: 100,
  D: 1000,
  E: 10000,
  F: 100000,
};

// ==========================================
// POST Diagnostic Hex Codes Database
// ==========================================
interface PostCodeInfo {
  code: string;
  vendor: string;
  phase: string;
  description: string;
  action: string;
}

const POST_CODES_DB: PostCodeInfo[] = [
  { code: '00', vendor: 'AMI / Intel', phase: 'CPU Reset / Init Failure', description: 'CPU not executing microcode. Motherboard cannot bring processor out of RESET.', action: 'Verify VCORE rail (+0.9V–1.2V), CPU_PWR 8-pin 12V cable, and bent LGA socket pins.' },
  { code: '15', vendor: 'AMI', phase: 'Early Pre-Memory Init', description: 'Northbridge / System Agent memory initialization started.', action: 'Reseat memory in Slot A2. Inspect DRAM VDD (+1.2V DDR4 or +1.1V DDR5).' },
  { code: '2E', vendor: 'AMI', phase: 'Memory Initialization', description: 'Testing DRAM addressing and dual-channel timings.', action: 'Inspect SMBus CLK/DATA lines on DIMM pins. Check for cracked solder balls under CPU.' },
  { code: '4E', vendor: 'Award', phase: 'Video BIOS Init', description: 'Initializing PEG PCIe primary display adapter.', action: 'Inspect PCIe slot gold pins, check GPU 12VHPWR / PCIe 8-pin power cables.' },
  { code: '53', vendor: 'AMI / ASUS', phase: 'Memory Compatibility Error', description: 'DRAM SPD read failed or timing training timeout occurred.', action: 'Clear CMOS for 15s. Swap to JEDEC non-XMP single module in second slot.' },
  { code: '55', vendor: 'ASUS / MSI', phase: 'Memory Not Installed / Detected', description: 'No RAM recognized in any channel.', action: 'Clean DIMM slot contacts with 99% IPA. Loosen CPU cooler mounting pressure (uneven torque causes pin disconnects).' },
  { code: 'C1', vendor: 'Award', phase: 'Early Chipset Base Memory Detect', description: 'Base 64K RAM test failed.', action: 'Inspect memory controller power rail (VDDQ/VTT). Replace suspect DIMM.' },
  { code: 'D1', vendor: 'AMI', phase: 'Early Keyboard Controller / KBC', description: 'Super I/O or EC (Embedded Controller) initialization failed.', action: 'Check +3.3V standby rail on Super I/O chip. Inspect quartz crystal oscillator (32.768 kHz).' },
  { code: 'D3', vendor: 'AMI', phase: 'S3 Resume Failure', description: 'Failed to wake from sleep mode due to memory state loss.', action: 'Disable Windows Fast Startup, check CR2032 CMOS battery voltage (must be > 3.0V).' },
  { code: 'FF', vendor: 'Award / Phoenix', phase: 'Boot Attempt / Complete or No Clock', description: 'BIOS handoff to OS bootloader or total absence of CPU CLK.', action: 'Verify +12V EPS rail with multimeter. If immediate at power-on, CPU is dead or VRM shorted.' },
  { code: 'A0', vendor: 'AMI', phase: 'IDE / SATA / NVMe Init', description: 'Enumerating storage drives on SATA and PCIe lanes.', action: 'Disconnect failing SATA drives. Inspect M.2 NVMe slot for thermal damage.' },
  { code: '2 Amber, 3 White', vendor: 'Dell Diagnostic LED', phase: 'Memory / RAM Failure', description: 'Dell system failed to configure RAM modules.', action: 'Reseat DIMMs, test each slot individually, check for cracked solder on motherboard.' },
  { code: '3 Amber, 5 White', vendor: 'Lenovo ThinkPad LED', phase: 'SPI BIOS ROM / TPM Fault', description: 'Corrupted UEFI BIOS or hardware security chip failure.', action: 'Perform emergency BIOS flash via Crisis key combination (Fn+R) or reflash SPI chip.' },
];

// ==========================================
// Thermal Pad Database
// ==========================================
interface ThermalPadSpec {
  id: string;
  device: string;
  category: 'GPU' | 'Laptop';
  vramThickness: string;
  vrmThickness: string;
  chokeThickness: string;
  notes: string;
  puttyEquivalent: string;
}

const THERMAL_PADS_DB: ThermalPadSpec[] = [
  {
    id: 'rtx3080_fe',
    device: 'NVIDIA GeForce RTX 3080 Founders Edition',
    category: 'GPU',
    vramThickness: '2.0mm (Front) / 1.5mm (Backplate)',
    vrmThickness: '1.5mm',
    chokeThickness: '1.0mm',
    notes: 'Extreme GDDR6X heat. Using pads > 2.0mm creates cold plate lift off GPU die causing 105°C hotspot!',
    puttyEquivalent: 'Upsiren U6 Pro or CX-H1300 (15g front, 10g back)',
  },
  {
    id: 'rtx3090_tuf',
    device: 'ASUS TUF Gaming GeForce RTX 3090 OC',
    category: 'GPU',
    vramThickness: '1.5mm (Front) / 1.5mm (Back)',
    vrmThickness: '1.0mm & 1.5mm stepped',
    chokeThickness: '1.0mm',
    notes: 'Dual-sided VRAM layout requires careful pad compression. Use high compressibility soft pads (e.g. Gelid Extreme).',
    puttyEquivalent: 'Fehonda LTP81 or Upsiren UX Pro Ultra',
  },
  {
    id: 'rtx4090_strix',
    device: 'ASUS ROG Strix GeForce RTX 4090',
    category: 'GPU',
    vramThickness: '1.5mm',
    vrmThickness: '1.0mm',
    chokeThickness: '1.5mm',
    notes: 'Vapor chamber contact tolerance is extremely tight. Over-tightening with dense pads cracks core silicon.',
    puttyEquivalent: 'Upsiren U6 Pro (High thermal conductivity putty recommended)',
  },
  {
    id: 'rx6800xt_ref',
    device: 'AMD Radeon RX 6800 XT Reference',
    category: 'GPU',
    vramThickness: '1.5mm',
    vrmThickness: '1.0mm',
    chokeThickness: '0.5mm',
    notes: 'Requires high-shear graphite pad on GPU die (Hitachi TC-01) or PTM7950 phase-change sheet.',
    puttyEquivalent: 'K5 Pro or Upsiren U6 Pro',
  },
  {
    id: 'thinkpad_p16',
    device: 'Lenovo ThinkPad P16 Gen 1 / Gen 2',
    category: 'Laptop',
    vramThickness: '0.5mm - 0.75mm',
    vrmThickness: '1.0mm',
    chokeThickness: '1.0mm',
    notes: 'Vapor chamber heatsink assembly. Factory uses viscous pink thermal putty on VRAM chips.',
    puttyEquivalent: 'Upsiren U6 Pro (Do NOT use stiff pads, heatsink will bend)',
  },
  {
    id: 'dell_xps15_9520',
    device: 'Dell XPS 15 (9520 / 9530)',
    category: 'Laptop',
    vramThickness: '1.0mm',
    vrmThickness: '0.5mm',
    chokeThickness: '0.5mm',
    notes: 'Slim copper heatpipe. Bridging VRMs with 1.5mm pads causes chassis bottom bulge and fan rubbing.',
    puttyEquivalent: 'K5 Pro or CX-H1300',
  },
  {
    id: 'rog_strix_g16',
    device: 'ASUS ROG Strix G16 (G614)',
    category: 'Laptop',
    vramThickness: '0.5mm',
    vrmThickness: '1.0mm',
    chokeThickness: '1.0mm',
    notes: 'CPU uses factory Conductonaut liquid metal with barrier sponge. VRAM/VRM use blue OEM thermal putty.',
    puttyEquivalent: 'Upsiren UX Pro Ultra or TG-PP10 equivalent',
  },
];

export const BoardLevelTriage: React.FC = () => {
  const { currentUser, isOwner, addToast } = useApp();

  // Active Tool selection
  const [activeTool, setActiveTool] = useState<Module1ToolId>('smd_decoder');

  // AI Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(true);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<ModuleAiResponse | null>(null);

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // -------------------------------------------------------------
  // Tool 1.1 State: SMD Decoder
  // -------------------------------------------------------------
  const [smdType, setSmdType] = useState<'resistor' | 'capacitor' | 'inductor'>('resistor');
  const [smdCode, setSmdCode] = useState<string>('472');
  const [smdPackage, setSmdPackage] = useState<string>('0603');
  const [smdResult, setSmdResult] = useState<{
    valueText: string;
    multiplierText: string;
    toleranceText: string;
    calcValue: number;
    unit: string;
    isValid: boolean;
  }>({
    valueText: '4.7 kΩ',
    multiplierText: 'x100',
    toleranceText: '±5% (Standard 3-Digit)',
    calcValue: 4700,
    unit: 'Ω',
    isValid: true,
  });

  // -------------------------------------------------------------
  // Tool 1.2 State: SMART Health Parser
  // -------------------------------------------------------------
  const [smartRawText, setSmartRawText] = useState<string>(
    `=== START OF READ SMART DATA SECTION ===\n` +
    `ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE\n` +
    `  5 Reallocated_Sector_Ct   0x0033   084   084   036    Pre-fail  Always       -       128\n` +
    `  9 Power_On_Hours          0x0032   091   091   000    Old_age   Always       -       6542\n` +
    ` 0A Spin_Retry_Count        0x0013   100   100   097    Pre-fail  Always       -       0\n` +
    ` C5 Current_Pending_Sector  0x0012   095   095   000    Old_age   Always       -       48\n` +
    ` C6 Offline_Uncorrectable   0x0010   090   090   000    Old_age   Always       -       16\n` +
    ` E7 SSD_Life_Remaining      0x0000   100   100   000    Old_age   Always       -       0`
  );
  const [smartParsed, setSmartParsed] = useState<{
    healthScore: number;
    status: 'Healthy' | 'Degrading / Urgent Backup' | 'Imminent Drive Failure';
    reallocated: number;
    pending: number;
    uncorrectable: number;
    powerOnHours: number;
    spinRetry: number;
    ssdWear: number;
  }>({
    healthScore: 42,
    status: 'Degrading / Urgent Backup',
    reallocated: 128,
    pending: 48,
    uncorrectable: 16,
    powerOnHours: 6542,
    spinRetry: 0,
    ssdWear: 100,
  });

  // -------------------------------------------------------------
  // Tool 1.3 State: POST Diagnostic Card Matrix
  // -------------------------------------------------------------
  const [postBiosVendor, setPostBiosVendor] = useState<string>('AMI');
  const [postHexCode, setPostHexCode] = useState<string>('55');
  const [postMotherboardModel, setPostMotherboardModel] = useState<string>('ASUS ROG Strix B650-E / ThinkPad T14');
  const [postMatch, setPostMatch] = useState<PostCodeInfo | null>(null);

  // -------------------------------------------------------------
  // Tool 1.4 State: Thermal Photo & Vision Inspector
  // -------------------------------------------------------------
  const [inspectionImage, setInspectionImage] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Array<{ x: number; y: number; label: string; temp: string }>>([
    { x: 180, y: 140, label: 'Hotspot: High-Side MOSFET PU401', temp: '94.2°C' },
    { x: 310, y: 220, label: 'LCI Red Indicator (Liquid Ingress)', temp: '32.1°C' },
  ]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------------------------------------------------------------
  // Tool 1.5 State: Multimeter Short-to-Ground Isolator
  // -------------------------------------------------------------
  const [railSelected, setRailSelected] = useState<string>('+19V_DC_IN');
  const [measuredImpedance, setMeasuredImpedance] = useState<string>('0.4');
  const [impedanceUnit, setImpedanceUnit] = useState<'ohms' | 'diode_mv'>('ohms');

  // -------------------------------------------------------------
  // Tool 1.6 State: RAM Socket & Dual-Channel Visualizer
  // -------------------------------------------------------------
  const [ramType, setRamType] = useState<'DDR4' | 'DDR5'>('DDR5');
  const [dimmSlots, setDimmSlots] = useState<{
    A1: { capacity: number; rank: '1R' | '2R'; speed: number; populated: boolean };
    A2: { capacity: number; rank: '1R' | '2R'; speed: number; populated: boolean };
    B1: { capacity: number; rank: '1R' | '2R'; speed: number; populated: boolean };
    B2: { capacity: number; rank: '1R' | '2R'; speed: number; populated: boolean };
  }>({
    A1: { capacity: 0, rank: '1R', speed: 5600, populated: false },
    A2: { capacity: 16, rank: '1R', speed: 5600, populated: true },
    B1: { capacity: 0, rank: '1R', speed: 5600, populated: false },
    B2: { capacity: 16, rank: '1R', speed: 5600, populated: true },
  });

  // -------------------------------------------------------------
  // Tool 1.7 State: Thermal Pad Database
  // -------------------------------------------------------------
  const [thermalSearch, setThermalSearch] = useState<string>('');
  const [selectedThermalPad, setSelectedThermalPad] = useState<ThermalPadSpec>(THERMAL_PADS_DB[0]);

  // -------------------------------------------------------------
  // Tool 1.8 State: Battery Health Parser
  // -------------------------------------------------------------
  const [batteryDesignCap, setBatteryDesignCap] = useState<number>(56000); // mWh
  const [batteryFullCap, setBatteryFullCap] = useState<number>(31500); // mWh
  const [batteryCycles, setBatteryCycles] = useState<number>(682);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(11.4); // Volts
  const [batteryReportRaw, setBatteryReportRaw] = useState<string>(
    `DESIGN CAPACITY: 56,000 mWh\nFULL CHARGE CAPACITY: 31,500 mWh\nCYCLE COUNT: 682\nCHEMISTRY: LION\nPERIODIC BATTERY DRAIN: HIGH CELL VOLTAGE DRIFT DETECTED`
  );

  // Initialize stored API Key & saved data
  useEffect(() => {
    const key = getStoredGeminiApiKey();
    setCustomApiKey(key);

    const savedMod1 = localStorage.getItem('tradetech_module1_state');
    if (savedMod1) {
      try {
        const parsed = JSON.parse(savedMod1);
        if (parsed.activeTool) setActiveTool(parsed.activeTool);
        if (parsed.smdCode) setSmdCode(parsed.smdCode);
        if (parsed.postHexCode) setPostHexCode(parsed.postHexCode);
        if (parsed.railSelected) setRailSelected(parsed.railSelected);
        if (parsed.measuredImpedance) setMeasuredImpedance(parsed.measuredImpedance);
      } catch (e) {
        console.warn('Could not restore Module 1 state', e);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'tradetech_module1_state',
        JSON.stringify({
          activeTool,
          smdCode,
          smdType,
          smdPackage,
          postHexCode,
          postBiosVendor,
          railSelected,
          measuredImpedance,
          batteryDesignCap,
          batteryFullCap,
          batteryCycles,
        })
      );
    } catch (e) {
      console.warn('Failed saving module 1 state to localStorage', e);
    }
  }, [
    activeTool,
    smdCode,
    smdType,
    smdPackage,
    postHexCode,
    postBiosVendor,
    railSelected,
    measuredImpedance,
    batteryDesignCap,
    batteryFullCap,
    batteryCycles,
  ]);

  // Decode SMD whenever inputs change
  useEffect(() => {
    decodeSmdComponent(smdCode, smdType);
  }, [smdCode, smdType]);

  // Parse SMART log whenever text changes
  useEffect(() => {
    parseSmartLog(smartRawText);
  }, [smartRawText]);

  // Look up POST code
  useEffect(() => {
    const cleanCode = postHexCode.trim().toUpperCase();
    const found = POST_CODES_DB.find(
      (p) =>
        p.code.toUpperCase() === cleanCode ||
        p.code.toUpperCase().includes(cleanCode) ||
        cleanCode.includes(p.code.toUpperCase())
    );
    setPostMatch(found || null);
  }, [postHexCode, postBiosVendor]);

  // Render canvas annotations
  useEffect(() => {
    if (activeTool === 'thermal_vision') {
      renderInspectionCanvas();
    }
  }, [activeTool, inspectionImage, annotations]);

  // -------------------------------------------------------------
  // Calculation Engine: SMD Decoder
  // -------------------------------------------------------------
  const decodeSmdComponent = (codeStr: string, type: 'resistor' | 'capacitor' | 'inductor') => {
    const code = codeStr.trim().toUpperCase();
    if (!code) {
      setSmdResult({
        valueText: '—',
        multiplierText: '—',
        toleranceText: '—',
        calcValue: 0,
        unit: 'Ω',
        isValid: false,
      });
      return;
    }

    if (type === 'resistor') {
      // Check EIA-96 first (2 digits + 1 letter, e.g. 01A, 68C, 88A)
      if (/^\d{2}[A-Z]$/.test(code)) {
        const valDigits = code.substring(0, 2);
        const multLetter = code.charAt(2);
        const baseVal = EIA96_VALUE_MAP[valDigits];
        const mult = EIA96_MULTIPLIERS[multLetter];

        if (baseVal !== undefined && mult !== undefined) {
          const val = baseVal * mult;
          setSmdResult({
            valueText: formatResistance(val),
            multiplierText: `EIA-96 Base ${baseVal} × Multiplier ${multLetter} (${mult})`,
            toleranceText: '±1% (EIA-96 Precision)',
            calcValue: val,
            unit: 'Ω',
            isValid: true,
          });
          return;
        }
      }

      // Check R notation (e.g. R47, 2R2, 0R1)
      if (code.includes('R')) {
        const numStr = code.replace('R', '.');
        const val = parseFloat(numStr);
        if (!isNaN(val)) {
          setSmdResult({
            valueText: formatResistance(val),
            multiplierText: `Direct Decimal (${code})`,
            toleranceText: '±1% or ±5%',
            calcValue: val,
            unit: 'Ω',
            isValid: true,
          });
          return;
        }
      }

      // Standard 3-digit (e.g. 472 = 47 * 10^2 = 4700)
      if (/^\d{3}$/.test(code)) {
        const base = parseInt(code.substring(0, 2), 10);
        const exp = parseInt(code.charAt(2), 10);
        const val = base * Math.pow(10, exp);
        setSmdResult({
          valueText: formatResistance(val),
          multiplierText: `10^${exp} (×${Math.pow(10, exp)})`,
          toleranceText: '±5% (Standard 3-Digit)',
          calcValue: val,
          unit: 'Ω',
          isValid: true,
        });
        return;
      }

      // Standard 4-digit (e.g. 1002 = 100 * 10^2 = 10000)
      if (/^\d{4}$/.test(code)) {
        const base = parseInt(code.substring(0, 3), 10);
        const exp = parseInt(code.charAt(3), 10);
        const val = base * Math.pow(10, exp);
        setSmdResult({
          valueText: formatResistance(val),
          multiplierText: `10^${exp} (×${Math.pow(10, exp)})`,
          toleranceText: '±1% (Precision 4-Digit)',
          calcValue: val,
          unit: 'Ω',
          isValid: true,
        });
        return;
      }
    } else if (type === 'capacitor') {
      // 3-digit ceramic capacitor marking (e.g. 104 = 100,000 pF = 100 nF = 0.1 µF)
      if (/^\d{3}$/.test(code)) {
        const base = parseInt(code.substring(0, 2), 10);
        const exp = parseInt(code.charAt(2), 10);
        const pF = base * Math.pow(10, exp);
        const nF = pF / 1000;
        const uF = pF / 1000000;

        let display = `${pF} pF`;
        if (pF >= 1000000) {
          display = `${uF} µF (${nF} nF)`;
        } else if (pF >= 1000) {
          display = `${nF} nF (${uF} µF)`;
        }

        setSmdResult({
          valueText: display,
          multiplierText: `10^${exp} pF multiplier`,
          toleranceText: '±10% (Ceramic MLCC X5R/X7R)',
          calcValue: pF,
          unit: 'pF',
          isValid: true,
        });
        return;
      }
    } else if (type === 'inductor') {
      // Inductors (e.g. R47 = 0.47 µH, 2R2 = 2.2 µH, 100 = 10 µH, 470 = 47 µH)
      if (code.includes('R')) {
        const numStr = code.replace('R', '.');
        const val = parseFloat(numStr);
        if (!isNaN(val)) {
          setSmdResult({
            valueText: `${val} µH`,
            multiplierText: 'Decimal microhenry',
            toleranceText: '±20% (SMD Power Choke)',
            calcValue: val,
            unit: 'µH',
            isValid: true,
          });
          return;
        }
      }
      if (/^\d{3}$/.test(code)) {
        const base = parseInt(code.substring(0, 2), 10);
        const exp = parseInt(code.charAt(2), 10);
        const val = base * Math.pow(10, exp);
        setSmdResult({
          valueText: `${val} µH`,
          multiplierText: `10^${exp} µH multiplier`,
          toleranceText: '±20% (SMD Inductor)',
          calcValue: val,
          unit: 'µH',
          isValid: true,
        });
        return;
      }
    }

    setSmdResult({
      valueText: 'Invalid Code',
      multiplierText: 'Unrecognized SMD Code Format',
      toleranceText: 'Check marking and try again',
      calcValue: 0,
      unit: '',
      isValid: false,
    });
  };

  const formatResistance = (ohms: number): string => {
    if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(2)} MΩ (${ohms.toLocaleString()} Ω)`;
    if (ohms >= 1000) return `${(ohms / 1000).toFixed(2)} kΩ (${ohms.toLocaleString()} Ω)`;
    return `${ohms.toFixed(ohms < 1 ? 3 : 1)} Ω`;
  };

  // -------------------------------------------------------------
  // Calculation Engine: S.M.A.R.T. Health Parser
  // -------------------------------------------------------------
  const parseSmartLog = (text: string) => {
    let reallocated = 0;
    let pending = 0;
    let uncorrectable = 0;
    let powerOnHours = 0;
    let spinRetry = 0;
    let ssdWear = 100;

    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match attribute 5 / 05 Reallocated_Sector_Ct
      if (/^\s*(0?5)\s+/i.test(trimmed) || /Reallocated_Sector/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) reallocated = parseInt(match[1], 10);
      }
      // Match C5 / 197 Current_Pending_Sector
      if (/^\s*(C5|197)\s+/i.test(trimmed) || /Current_Pending/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) pending = parseInt(match[1], 10);
      }
      // Match C6 / 198 Offline_Uncorrectable
      if (/^\s*(C6|198)\s+/i.test(trimmed) || /Offline_Uncorrectable/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) uncorrectable = parseInt(match[1], 10);
      }
      // Match 09 / 9 Power_On_Hours
      if (/^\s*(0?9)\s+/i.test(trimmed) || /Power_On_Hours/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) powerOnHours = parseInt(match[1], 10);
      }
      // Match 0A / 10 Spin_Retry_Count
      if (/^\s*(0?A|10)\s+/i.test(trimmed) || /Spin_Retry/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) spinRetry = parseInt(match[1], 10);
      }
      // Match E7 / 231 SSD Life Remaining
      if (/^\s*(E7|231)\s+/i.test(trimmed) || /Life_Remaining|Wear_Range/i.test(trimmed)) {
        const match = trimmed.match(/(\d+)\s*$/);
        if (match) ssdWear = parseInt(match[1], 10);
      }
    }

    // Determine Health Score
    let penalty = 0;
    if (reallocated > 0) penalty += Math.min(reallocated * 0.4, 50);
    if (pending > 0) penalty += Math.min(pending * 1.2, 40);
    if (uncorrectable > 0) penalty += Math.min(uncorrectable * 2.0, 50);
    if (spinRetry > 0) penalty += Math.min(spinRetry * 15, 30);

    const calculatedScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
    let status: 'Healthy' | 'Degrading / Urgent Backup' | 'Imminent Drive Failure' = 'Healthy';
    if (calculatedScore < 50 || uncorrectable > 10 || reallocated > 100) {
      status = 'Imminent Drive Failure';
    } else if (calculatedScore < 85 || pending > 0 || reallocated > 0) {
      status = 'Degrading / Urgent Backup';
    }

    setSmartParsed({
      healthScore: calculatedScore,
      status,
      reallocated,
      pending,
      uncorrectable,
      powerOnHours,
      spinRetry,
      ssdWear,
    });
  };

  // -------------------------------------------------------------
  // Tool 1.4: Thermal Canvas Drawing & Annotations
  // -------------------------------------------------------------
  const renderInspectionCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If image is uploaded or sample loaded
    if (inspectionImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAnnotations(ctx);
      };
      img.src = inspectionImage;
    } else {
      // Draw simulated motherboard PCB pattern
      ctx.fillStyle = '#0a1917';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Copper trace lines
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      for (let i = 20; i < canvas.width; i += 35) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 15, canvas.height / 2);
        ctx.lineTo(i - 10, canvas.height);
        ctx.stroke();
      }

      // IC chips
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(150, 110, 80, 60);
      ctx.strokeRect(150, 110, 80, 60);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('PU401 (PWM)', 160, 145);

      // Thermal gradient simulation near PU401
      const grad = ctx.createRadialGradient(190, 140, 5, 190, 140, 75);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)'); // 94°C Red
      grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.65)'); // Orange
      grad.addColorStop(0.8, 'rgba(6, 182, 212, 0.3)'); // Cyan
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(190, 140, 75, 0, Math.PI * 2);
      ctx.fill();

      // Liquid indicator dot (LCI)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(310, 220, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.stroke();

      drawAnnotations(ctx);
    }
  };

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.forEach((ann, idx) => {
      // Circle target
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing center
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label background box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      const text = `[#${idx + 1}] ${ann.label} (${ann.temp})`;
      ctx.font = '11px monospace';
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(ann.x + 22, ann.y - 12, textWidth + 12, 22);
      ctx.strokeRect(ann.x + 22, ann.y - 12, textWidth + 12, 22);

      // Text
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(text, ann.x + 28, ann.y + 3);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const label = prompt('Enter annotation label (e.g. Burnt trace, Hotspot, MLCC):', 'Hotspot Point');
    if (!label) return;
    const temp = prompt('Enter estimated temperature or callout (e.g. 88.5°C):', '75.0°C') || '75.0°C';

    setAnnotations((prev) => [...prev, { x, y, label, temp }]);
  };

  // -------------------------------------------------------------
  // Universal AI Dispatcher for Module 1
  // -------------------------------------------------------------
  const handleRunAiAnalysis = async (toolTitle: string, payload: any) => {
    setAiLoading(true);
    setIsAiDrawerOpen(true);

    try {
      const response = await executeModuleAiQuery({
        moduleName: 'MODULE 1: BOARD-LEVEL & HARDWARE TRIAGE SUITE',
        toolName: toolTitle,
        inputPayload: payload,
        userRole: isOwner ? 'ROLE_OWNER' : 'ROLE_STUDENT',
        customPrompt: aiCustomPrompt,
      });
      setAiResponse(response);
      addToast({
        type: 'success',
        title: 'Gemini Hardware Copilot Analyzed',
        message: `Generated micro-soldering triage for ${toolTitle}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'AI Analysis Failed',
        message: err?.message || 'Check network connection or API Key.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Navigation tabs for the 8 tools
  // -------------------------------------------------------------
  const toolNav: { id: Module1ToolId; label: string; icon: React.ReactNode; badge: string }[] = [
    { id: 'smd_decoder', label: '1. SMD & Component Code Decoder', icon: <FileCode className="w-4 h-4" />, badge: 'EIA-96' },
    { id: 'smart_parser', label: '2. S.M.A.R.T. Hex & Health Parser', icon: <HardDrive className="w-4 h-4" />, badge: 'Fail Predictor' },
    { id: 'post_matrix', label: '3. POST Diagnostic Card Hex Matrix', icon: <Cpu className="w-4 h-4" />, badge: 'BIOS Lookup' },
    { id: 'thermal_vision', label: '4. Thermal & Inspection Photo Uploader', icon: <Flame className="w-4 h-4" />, badge: 'Vision AI' },
    { id: 'multimeter_isolator', label: '5. Multimeter Short-to-Ground Isolator', icon: <Zap className="w-4 h-4" />, badge: 'V-Inject' },
    { id: 'ram_visualizer', label: '6. RAM Socket & Dual-Channel Rank', icon: <Layers className="w-4 h-4" />, badge: 'IMC Timing' },
    { id: 'thermal_pads', label: '7. Thermal Pad & VRAM Thickness DB', icon: <Thermometer className="w-4 h-4" />, badge: 'GPU/Laptop' },
    { id: 'battery_parser', label: '8. Battery Health & Degradation Parser', icon: <BatteryCharging className="w-4 h-4" />, badge: 'Swell Alert' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#30363d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="text-[#06b6d4] font-bold">Module 01</span>
            <span className="text-gray-600">/</span>
            <span>Board-Level & Micro-Soldering Diagnostics</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Active
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#06b6d4]" />
            Board-Level & Hardware Triage Suite
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            SMD decoders, raw S.M.A.R.T. parsers, POST matrix, thermal inspection, and multimeter short isolation.
          </p>
        </div>

        {/* Global Controls: API Key & AI Drawer Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#1f2937] hover:bg-[#374151] text-gray-300 border border-gray-700 transition-all"
            title="Set Gemini API Key for direct client-side requests"
          >
            <Key className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>API Key {customApiKey ? '• Saved' : '• Default'}</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              isAiDrawerOpen
                ? 'bg-[#06b6d4] text-black shadow-md shadow-[#06b6d4]/20'
                : 'bg-[#111827] text-[#06b6d4] border border-[#06b6d4]/40 hover:bg-[#06b6d4]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiDrawerOpen ? 'Hide AI Drawer' : 'Show AI Co-Pilot'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sub-navigation and Tool Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sub-Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-3">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-3 shadow-md">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider px-2 py-1 mb-1 font-semibold flex items-center justify-between">
              <span>8 Specialized Triage Tools</span>
              <span className="text-[#06b6d4]">Module 1</span>
            </div>
            <div className="space-y-1">
              {toolNav.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#06b6d4]/15 text-white border border-[#06b6d4]/60 font-semibold shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-[#06b6d4]' : 'text-gray-500'}>
                        {tool.icon}
                      </span>
                      <span className="truncate">{tool.label}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ml-1 shrink-0 ${
                        isActive
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] border-[#06b6d4]/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {tool.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Hardware Safety Guide Callout */}
          <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-gray-800 text-xs text-gray-300 space-y-2 font-sans">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              IPC-A-610 Class 3 Standards
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Before probing board rails, discharge primary bulk capacitors using a 1kΩ bleed resistor. Never inject voltage above rail nominal on low-impedance VCORE lines.
            </p>
          </div>
        </div>

        {/* Active Tool Area */}
        <div className={`space-y-6 ${isAiDrawerOpen ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          {/* ======================================================== */}
          {/* TOOL 1.1: SMD & Component Code Decoder */}
          {/* ======================================================== */}
          {activeTool === 'smd_decoder' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-[#06b6d4]" />
                    SMD & Component Code Decoder
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculates 3-digit, 4-digit, EIA-96 resistor markings, MLCC capacitance, and power chokes.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                  {(['resistor', 'capacitor', 'inductor'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSmdType(t);
                        setSmdCode(t === 'resistor' ? '472' : t === 'capacitor' ? '104' : '2R2');
                      }}
                      className={`px-2.5 py-1 text-xs font-mono capitalize rounded-md transition-all ${
                        smdType === t
                          ? 'bg-[#06b6d4] text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    SMD Marking Code
                  </label>
                  <input
                    type="text"
                    value={smdCode}
                    onChange={(e) => setSmdCode(e.target.value)}
                    placeholder="e.g. 01A, 472, 1002, 104, 2R2"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                    Supports 3-digit, 4-digit, EIA-96, R-notation
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Package Footprint
                  </label>
                  <select
                    value={smdPackage}
                    onChange={(e) => setSmdPackage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="0201">0201 (0.6 × 0.3 mm / 0.05W)</option>
                    <option value="0402">0402 (1.0 × 0.5 mm / 0.063W)</option>
                    <option value="0603">0603 (1.6 × 0.8 mm / 0.1W)</option>
                    <option value="0805">0805 (2.0 × 1.25 mm / 0.125W)</option>
                    <option value="1206">1206 (3.2 × 1.6 mm / 0.25W)</option>
                    <option value="2512">2512 (6.4 × 3.2 mm / 1W Power)</option>
                  </select>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Common Bench Samples
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {smdType === 'resistor' && (
                      <>
                        <button
                          onClick={() => setSmdCode('01A')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          01A (100Ω 1%)
                        </button>
                        <button
                          onClick={() => setSmdCode('68C')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          68C (49.9kΩ)
                        </button>
                        <button
                          onClick={() => setSmdCode('1002')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          1002 (10kΩ)
                        </button>
                        <button
                          onClick={() => setSmdCode('R010')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          R010 (Current Sense)
                        </button>
                      </>
                    )}
                    {smdType === 'capacitor' && (
                      <>
                        <button
                          onClick={() => setSmdCode('104')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          104 (100nF)
                        </button>
                        <button
                          onClick={() => setSmdCode('226')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          226 (22µF)
                        </button>
                        <button
                          onClick={() => setSmdCode('475')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          475 (4.7µF)
                        </button>
                      </>
                    )}
                    {smdType === 'inductor' && (
                      <>
                        <button
                          onClick={() => setSmdCode('R47')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          R47 (0.47µH)
                        </button>
                        <button
                          onClick={() => setSmdCode('2R2')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          2R2 (2.2µH)
                        </button>
                        <button
                          onClick={() => setSmdCode('100')}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        >
                          100 (10µH)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Decoded Output Card */}
              <div className="p-4 rounded-xl bg-gray-950/70 border border-[#06b6d4]/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#06b6d4] uppercase tracking-wider font-semibold">
                    Computed Component Rating
                  </span>
                  <div className="text-2xl font-mono font-bold text-white mt-0.5">
                    {smdResult.valueText}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1 space-x-3">
                    <span>Formula: {smdResult.multiplierText}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{smdResult.toleranceText}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('SMD & Component Code Decoder', {
                      code: smdCode,
                      type: smdType,
                      computedValue: smdResult.valueText,
                      packageSize: smdPackage,
                      tolerance: smdResult.toleranceText,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all shrink-0"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Component Finder & Datasheet</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.2: S.M.A.R.T. Hex & Health Parser */}
          {/* ======================================================== */}
          {activeTool === 'smart_parser' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-[#06b6d4]" />
                    S.M.A.R.T. Hex & Health Attribute Parser
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ingests raw `smartctl -a` or CrystalDiskInfo dumps, evaluates bad sectors, and predicts drive lifespan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSmartRawText(
                        `ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH RAW_VALUE\n` +
                        `  5 Reallocated_Sector_Ct   0x0033   032   032   036       840\n` +
                        `  9 Power_On_Hours          0x0032   065   065   000       28410\n` +
                        ` C5 Current_Pending_Sector  0x0012   040   040   000       312\n` +
                        ` C6 Offline_Uncorrectable   0x0010   020   020   000       190`
                      )
                    }
                    className="px-2 py-1 text-[11px] font-mono bg-red-950/60 text-red-300 border border-red-800/40 rounded hover:bg-red-900/50"
                  >
                    Load Failing HDD
                  </button>
                  <button
                    onClick={() =>
                      setSmartRawText(
                        `ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH RAW_VALUE\n` +
                        `  5 Reallocated_Sector_Ct   0x0033   100   100   010       0\n` +
                        `  9 Power_On_Hours          0x0032   099   099   000       1200\n` +
                        ` C5 Current_Pending_Sector  0x0012   100   100   000       0\n` +
                        ` E7 SSD_Life_Remaining      0x0000   098   098   000       2% Used`
                      )
                    }
                    className="px-2 py-1 text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 rounded hover:bg-emerald-900/50"
                  >
                    Load Healthy SSD
                  </button>
                </div>
              </div>

              {/* Health Score Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400">Health Index</span>
                  <div
                    className={`text-xl font-mono font-bold ${
                      smartParsed.healthScore > 80
                        ? 'text-emerald-400'
                        : smartParsed.healthScore > 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {smartParsed.healthScore}%
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono truncate block">
                    {smartParsed.status}
                  </span>
                </div>

                <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400">Reallocated (05)</span>
                  <div
                    className={`text-xl font-mono font-bold ${
                      smartParsed.reallocated > 0 ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    {smartParsed.reallocated} Sectors
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">NAND / Platter Reloc</span>
                </div>

                <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400">Pending (C5)</span>
                  <div
                    className={`text-xl font-mono font-bold ${
                      smartParsed.pending > 0 ? 'text-red-400' : 'text-gray-200'
                    }`}
                  >
                    {smartParsed.pending}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Unstable on read</span>
                </div>

                <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400">Offline Uncorrectable</span>
                  <div
                    className={`text-xl font-mono font-bold ${
                      smartParsed.uncorrectable > 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {smartParsed.uncorrectable} (C6)
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Data Loss Imminent</span>
                </div>
              </div>

              {/* Raw Log Input */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Raw S.M.A.R.T. Output Dump (smartctl / CrystalDiskInfo)
                </label>
                <textarea
                  rows={6}
                  value={smartRawText}
                  onChange={(e) => setSmartRawText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-200 font-mono text-xs focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">
                  Power On Hours: <strong className="text-white">{smartParsed.powerOnHours} hrs</strong> ({(smartParsed.powerOnHours / 24).toFixed(0)} days continuous)
                </span>

                <button
                  onClick={() =>
                    handleRunAiAnalysis('S.M.A.R.T. Hex & Health Parser', {
                      healthScore: smartParsed.healthScore,
                      status: smartParsed.status,
                      reallocatedSectors: smartParsed.reallocated,
                      pendingSectors: smartParsed.pending,
                      offlineUncorrectable: smartParsed.uncorrectable,
                      powerOnHours: smartParsed.powerOnHours,
                      rawLogSnippet: smartRawText.slice(0, 300),
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Failure Timeline Estimator</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.3: POST Diagnostic Card Hex Matrix */}
          {/* ======================================================== */}
          {activeTool === 'post_matrix' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#06b6d4]" />
                    POST Diagnostic Card Hex Matrix
                  </h3>
                  <p className="text-xs text-gray-400">
                    Cross-references 2-digit/4-digit PCI/LPC bus hex codes across AMI, Award, Phoenix, and OEM diagnostic LED patterns.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    BIOS Vendor
                  </label>
                  <select
                    value={postBiosVendor}
                    onChange={(e) => setPostBiosVendor(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="AMI">AMI (American Megatrends)</option>
                    <option value="Award">Award BIOS</option>
                    <option value="Phoenix">Phoenix BIOS</option>
                    <option value="Insyde">InsydeH2O UEFI</option>
                    <option value="Dell Diagnostic LED">Dell Diagnostic Blinks</option>
                    <option value="Lenovo ThinkPad LED">Lenovo ThinkPad LED Pattern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    POST Code / Blinking Pattern
                  </label>
                  <input
                    type="text"
                    value={postHexCode}
                    onChange={(e) => setPostHexCode(e.target.value)}
                    placeholder="e.g. 55, 00, D1, C1, FF"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Motherboard Model
                  </label>
                  <input
                    type="text"
                    value={postMotherboardModel}
                    onChange={(e) => setPostMotherboardModel(e.target.value)}
                    placeholder="e.g. ASUS ROG Strix B650 / Dell 7090"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
              </div>

              {/* Match Details Display */}
              {postMatch ? (
                <div className="p-4 rounded-xl bg-gray-950/80 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      POST CODE [{postMatch.code}] • {postMatch.phase}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Vendor: {postMatch.vendor}</span>
                  </div>

                  <p className="text-sm text-gray-200">{postMatch.description}</p>

                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-xs font-mono text-[#06b6d4]">
                    <strong>Recommended Bench Action:</strong> {postMatch.action}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-950/40 border border-gray-800 text-center text-xs text-gray-400 font-mono">
                  No exact offline match for code "{postHexCode}". Run Gemini AI Strategist below for custom boardview trace lookup.
                </div>
              )}

              {/* Common Reference Hex Codes Quick Selector */}
              <div>
                <span className="text-xs font-mono text-gray-400 block mb-2">
                  Frequent Bench Diagnostic Codes:
                </span>
                <div className="flex flex-wrap gap-2">
                  {POST_CODES_DB.slice(0, 8).map((p) => (
                    <button
                      key={p.code}
                      onClick={() => {
                        setPostHexCode(p.code);
                        setPostBiosVendor(p.vendor.split('/')[0].trim());
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 rounded-md transition-all"
                    >
                      {p.code} - {p.phase.slice(0, 18)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('POST Diagnostic Card Hex Matrix', {
                      hexCode: postHexCode,
                      biosVendor: postBiosVendor,
                      motherboardModel: postMotherboardModel,
                      matchedPhase: postMatch?.phase || 'Unknown Phase',
                      matchedAction: postMatch?.action || 'Manual Triage Required',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Board-Level Repair Strategist</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.4: Thermal & Inspection Photo Uploader */}
          {/* ======================================================== */}
          {activeTool === 'thermal_vision' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#ef4444]" />
                    Thermal & Inspection Photo Uploader (+ Vision AI)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Upload macro photos or FLIR thermal snapshots, annotate hot spots, and trigger Gemini Multimodal Vision inspection.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-gray-800 hover:bg-gray-700 text-gray-200 cursor-pointer border border-gray-700">
                    <Upload className="w-3.5 h-3.5 text-[#06b6d4]" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setInspectionImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    onClick={() => {
                      setInspectionImage(null);
                      setAnnotations([]);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Click anywhere on canvas to drop temperature annotations:</span>
                  <span className="text-[#06b6d4]">Active Annotations: {annotations.length}</span>
                </div>
                <div className="relative border-2 border-dashed border-gray-800 rounded-xl overflow-hidden bg-gray-950 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={320}
                    onClick={handleCanvasClick}
                    className="cursor-crosshair max-w-full"
                  />
                </div>
              </div>

              {/* Annotations List */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                  Identified Thermal Anomalies:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {annotations.map((ann, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="text-[#06b6d4] font-bold mr-2">#{idx + 1}</span>
                        <span className="text-gray-200">{ann.label}</span>
                        <span className="text-red-400 font-bold ml-2">({ann.temp})</span>
                      </div>
                      <button
                        onClick={() => setAnnotations((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Thermal & Inspection Photo Uploader', {
                      hasCustomImage: !!inspectionImage,
                      annotationCount: annotations.length,
                      anomalyPoints: annotations,
                      visualSummary: 'Inspection of PCB power delivery and thermal hotspots.',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Gemini Vision Hardware Inspector</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.5: Multimeter Short-to-Ground Isolator */}
          {/* ======================================================== */}
          {activeTool === 'multimeter_isolator' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#f59e0b]" />
                    Multimeter Short-to-Ground Isolator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Evaluates rail resistance to ground and determines safe voltage injection parameters (V_inj / I_limit).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Motherboard Power Rail Target
                  </label>
                  <select
                    value={railSelected}
                    onChange={(e) => setRailSelected(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="+19V_DC_IN">+19V / +20V Main DC-IN Rail (Normal: &gt; 100kΩ)</option>
                    <option value="+12V_EPS">+12V EPS / CPU Power Rail (Normal: &gt; 5kΩ)</option>
                    <option value="+5V_ALW">+5V Always-On / Standby (Normal: &gt; 1kΩ)</option>
                    <option value="+3.3V_ALW">+3.3V System / Standby (Normal: &gt; 500Ω)</option>
                    <option value="+1.8V_VDDQ">+1.8V / +1.2V DRAM Memory Rail (Normal: 100Ω – 300Ω)</option>
                    <option value="+1.05V_PCH">+1.05V PCH / Chipset Rail (Normal: 25Ω – 80Ω)</option>
                    <option value="+VCORE">VCORE CPU Rail (Normal: 0.5Ω – 3.0Ω Very Low Normal!)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">Measured Value to GND</label>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <button
                        onClick={() => setImpedanceUnit('ohms')}
                        className={`px-2 py-0.5 rounded ${
                          impedanceUnit === 'ohms'
                            ? 'bg-[#06b6d4] text-black font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        Ω (Ohms)
                      </button>
                      <button
                        onClick={() => setImpedanceUnit('diode_mv')}
                        className={`px-2 py-0.5 rounded ${
                          impedanceUnit === 'diode_mv'
                            ? 'bg-[#06b6d4] text-black font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        mV (Diode)
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={measuredImpedance}
                    onChange={(e) => setMeasuredImpedance(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
              </div>

              {/* Visual Impedance Status Gauge */}
              {(() => {
                const val = parseFloat(measuredImpedance) || 0;
                let isDeadShort = false;
                let isSuspicious = false;
                let isNormal = true;

                if (railSelected === '+19V_DC_IN' || railSelected === '+12V_EPS') {
                  if (val < 1.0) isDeadShort = true;
                  else if (val < 100) isSuspicious = true;
                } else if (railSelected === '+VCORE') {
                  // VCORE naturally has 0.5 - 3 ohms!
                  if (val < 0.2) isDeadShort = true;
                  else isNormal = true;
                } else {
                  if (val < 1.0) isDeadShort = true;
                  else if (val < 50) isSuspicious = true;
                }

                return (
                  <div
                    className={`p-4 rounded-xl border ${
                      isDeadShort
                        ? 'bg-red-950/40 border-red-500/60'
                        : isSuspicious
                        ? 'bg-amber-950/40 border-amber-500/60'
                        : 'bg-emerald-950/40 border-emerald-500/60'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                        {isDeadShort && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {isSuspicious && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {isNormal && <Check className="w-4 h-4 text-emerald-400" />}
                        {isDeadShort
                          ? 'Dead Short Detected (< 1.0Ω)'
                          : isSuspicious
                          ? 'Low-Impedance Leakage Detected'
                          : 'Normal Rail Impedance Range'}
                      </span>
                      <span className="text-xs font-mono text-gray-300">
                        Target: {railSelected}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 font-mono">
                      {isDeadShort
                        ? 'High probability of punctured ceramic MLCC capacitor or shorted high-side MOSFET drain-source. Do NOT connect main power adapter.'
                        : isSuspicious
                        ? 'Degraded silicon component or partial diode failure causing current leak. Thermal camera scanning advised under controlled low voltage.'
                        : 'Impedance is within standard tolerance for this specific semiconductor architecture.'}
                    </p>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Multimeter Short-to-Ground Isolator', {
                      rail: railSelected,
                      measuredValue: measuredImpedance,
                      unit: impedanceUnit,
                      diagnosticMethod: 'Resistance to ground probing against chassis GND ring',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Voltage Injection Safe Calculator</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.6: RAM Socket & Dual-Channel Rank Visualizer */}
          {/* ======================================================== */}
          {activeTool === 'ram_visualizer' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#06b6d4]" />
                    RAM Socket & Dual-Channel Rank Visualizer
                  </h3>
                  <p className="text-xs text-gray-400">
                    Daisy-chain slot priority, single vs dual rank (1R/2R) loading, and IMC stability forecasting.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRamType(ramType === 'DDR4' ? 'DDR5' : 'DDR4')}
                    className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs font-mono text-[#06b6d4]"
                  >
                    Memory Standard: {ramType}
                  </button>
                </div>
              </div>

              {/* Visual Motherboard DIMM Slots */}
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                <div className="text-xs font-mono text-gray-400 flex items-center justify-between">
                  <span>CPU Socket ➔ Primary Daisy-Chain (A2 & B2 Recommended)</span>
                  <span className="text-[#10b981]">
                    Status:{' '}
                    {dimmSlots.A2.populated && dimmSlots.B2.populated
                      ? 'Optimal Dual-Channel (128-bit)'
                      : 'Sub-Optimal / Single-Channel'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  {(['A1', 'A2', 'B1', 'B2'] as const).map((slotKey) => {
                    const slot = dimmSlots[slotKey];
                    const isOptimalSlot = slotKey === 'A2' || slotKey === 'B2';
                    return (
                      <div
                        key={slotKey}
                        onClick={() =>
                          setDimmSlots((prev) => ({
                            ...prev,
                            [slotKey]: {
                              ...prev[slotKey],
                              populated: !prev[slotKey].populated,
                            },
                          }))
                        }
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          slot.populated
                            ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white shadow-md'
                            : 'bg-gray-900/60 border-gray-800 text-gray-500 hover:border-gray-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold flex items-center justify-between">
                          <span>Slot {slotKey}</span>
                          {isOptimalSlot && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="h-16 my-2 flex items-center justify-center">
                          {slot.populated ? (
                            <div className="w-4 h-14 bg-gradient-to-b from-[#06b6d4] to-emerald-500 rounded flex flex-col items-center justify-between py-1 text-[8px] font-mono text-black font-bold">
                              <span>DIMM</span>
                              <span>{slot.rank}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-gray-600">Empty Slot</span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono block text-gray-400">
                          {slot.populated ? `${slot.capacity}GB ${slot.rank}` : 'Click to Insert'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('RAM Socket & Dual-Channel Rank Visualizer', {
                      standard: ramType,
                      configuration: dimmSlots,
                      totalPopulated: Object.values(dimmSlots).filter((s) => s.populated).length,
                      topology: 'Daisy-Chain 4-DIMM',
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Memory Controller Stability Evaluator</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.7: Thermal Pad & VRAM Thickness Database */}
          {/* ======================================================== */}
          {activeTool === 'thermal_pads' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-[#06b6d4]" />
                    Thermal Pad & VRAM Thickness Database
                  </h3>
                  <p className="text-xs text-gray-400">
                    Exact OEM thermal pad millimeters for GPUs and gaming laptops. Avoid core lift-off and thermal throttling.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search GPU or Laptop (e.g. RTX 3080, ThinkPad, XPS, Strix)..."
                  value={thermalSearch}
                  onChange={(e) => setThermalSearch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                />
              </div>

              {/* Selection Table / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {THERMAL_PADS_DB.filter(
                  (item) =>
                    item.device.toLowerCase().includes(thermalSearch.toLowerCase()) ||
                    item.category.toLowerCase().includes(thermalSearch.toLowerCase())
                ).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedThermalPad(item)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedThermalPad.id === item.id
                        ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-white font-semibold'
                        : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="truncate">{item.device}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 ml-1">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blueprint Display */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm font-bold text-white">{selectedThermalPad.device}</span>
                  <span className="text-xs text-[#06b6d4]">OEM Spec Blueprint</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">VRAM Modules</span>
                    <strong className="text-sm text-emerald-400">{selectedThermalPad.vramThickness}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">VRM MOSFETs</span>
                    <strong className="text-sm text-cyan-400">{selectedThermalPad.vrmThickness}</strong>
                  </div>
                  <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">Power Chokes</span>
                    <strong className="text-sm text-amber-400">{selectedThermalPad.chokeThickness}</strong>
                  </div>
                </div>

                <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800 text-xs text-gray-300 space-y-1">
                  <div className="text-amber-400 font-bold">Heatsink Clearance Advisory:</div>
                  <p className="text-[11px] text-gray-400">{selectedThermalPad.notes}</p>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    <strong>Putty Equivalent:</strong> {selectedThermalPad.puttyEquivalent}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Thermal Pad & VRAM Thickness Database', {
                      targetHardware: selectedThermalPad.device,
                      vramPad: selectedThermalPad.vramThickness,
                      vrmPad: selectedThermalPad.vrmThickness,
                      chokePad: selectedThermalPad.chokeThickness,
                      puttySubstitute: selectedThermalPad.puttyEquivalent,
                      notes: selectedThermalPad.notes,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Thermal Putty & Pad Substitute Engine</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOOL 1.8: Battery Health & Degradation Parser */}
          {/* ======================================================== */}
          {activeTool === 'battery_parser' && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                    <BatteryCharging className="w-5 h-5 text-[#10b981]" />
                    Battery Health & Degradation Parser
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculates cell wear, cycle health degradation, and checks for pillowing / thermal swell danger.
                  </p>
                </div>
              </div>

              {/* Capacity & Cycle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Design Capacity (mWh)
                  </label>
                  <input
                    type="number"
                    value={batteryDesignCap}
                    onChange={(e) => setBatteryDesignCap(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Full Charge Capacity (mWh)
                  </label>
                  <input
                    type="number"
                    value={batteryFullCap}
                    onChange={(e) => setBatteryFullCap(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Charge Cycle Count
                  </label>
                  <input
                    type="number"
                    value={batteryCycles}
                    onChange={(e) => setBatteryCycles(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
                  />
                </div>
              </div>

              {/* Degradation Gauge */}
              {(() => {
                const healthPct = Math.round((batteryFullCap / batteryDesignCap) * 100);
                const wearPct = 100 - healthPct;
                const isCriticalSwell = batteryCycles > 500 && healthPct < 60;

                return (
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span>Battery Degradation Curve</span>
                      <span className={healthPct > 80 ? 'text-emerald-400' : 'text-amber-400'}>
                        {healthPct}% Healthy ({wearPct}% Wear)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.min(100, healthPct)}%` }}
                        className={`h-full ${
                          healthPct > 80 ? 'bg-emerald-500' : healthPct > 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span>Rated Cycles: {batteryCycles} / 1000 threshold</span>
                      {isCriticalSwell ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Risk of Cell Swelling
                        </span>
                      ) : (
                        <span className="text-emerald-400">Normal Cell Expansion Range</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() =>
                    handleRunAiAnalysis('Battery Health & Degradation Parser', {
                      designCapacity_mWh: batteryDesignCap,
                      fullChargeCapacity_mWh: batteryFullCap,
                      healthPercentage: `${Math.round((batteryFullCap / batteryDesignCap) * 100)}%`,
                      chargeCycles: batteryCycles,
                      nominalVoltage: batteryVoltage,
                      rawLogSnippet: batteryReportRaw,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black font-mono font-bold text-xs shadow-md transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Battery Safety & Swell Risk Predictor</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Universal AI Co-Pilot Drawer / Inspection Panel */}
        {isAiDrawerOpen && (
          <div className="xl:col-span-1 bg-[#111827] border border-[#06b6d4]/40 rounded-xl p-4 shadow-xl space-y-4 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                <span className="font-mono font-bold text-white text-xs">
                  Gemini Micro-Soldering Co-Pilot
                </span>
              </div>
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt input / question */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                Custom Technician Query
              </label>
              <textarea
                rows={2}
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ask specific micro-soldering question (e.g. Which hot-air nozzle temp?)..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-200 focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            {/* Analysis Output Box */}
            <div className="flex-1 bg-gray-950 rounded-xl p-3.5 border border-gray-800/80 overflow-y-auto space-y-3 font-mono text-xs">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-[#06b6d4] animate-spin" />
                  <span className="text-gray-400">
                    Querying Gemini Vision & Micro-Soldering Engine...
                  </span>
                </div>
              ) : aiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
                    <span className="text-[#06b6d4] font-bold">{aiResponse.modelUsed}</span>
                    <span>{aiResponse.timestamp}</span>
                  </div>
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {aiResponse.analysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <Bot className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-[11px]">
                    Select any of the 8 bench tools and click the AI button to generate real-time IPC-A-610 repair advice.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Shortcut Inquiries:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setAiCustomPrompt('What is the recommended hot air rework temperature and flux type?')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Rework Temp?
                </button>
                <button
                  onClick={() => setAiCustomPrompt('What are common DigiKey / Mouser cross-reference parts?')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Cross-Ref Parts
                </button>
                <button
                  onClick={() => setAiCustomPrompt('Explain the risk of board layer delamination.')}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
                >
                  Delamination
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#06b6d4]" />
                Gemini API Key Configuration
              </h3>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Enter your Google AI Studio Gemini API Key below. When saved, Module 1 executes direct client-side requests to{' '}
              <code className="text-[#06b6d4] font-mono">gemini-1.5-flash:generateContent</code>. If left empty, requests automatically use the server backend proxy.
            </p>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                GEMINI_API_KEY
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#06b6d4] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setCustomApiKey('');
                  setStoredGeminiApiKey('');
                  addToast({
                    type: 'info',
                    title: 'API Key Cleared',
                    message: 'Module 1 will use the server-side proxy fallback.',
                  });
                  setIsKeyModalOpen(false);
                }}
                className="text-xs font-mono text-red-400 hover:underline"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setStoredGeminiApiKey(customApiKey);
                    addToast({
                      type: 'success',
                      title: 'API Key Saved',
                      message: 'Client-side Gemini API calls enabled in localStorage.',
                    });
                    setIsKeyModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-black font-mono font-bold text-xs"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
