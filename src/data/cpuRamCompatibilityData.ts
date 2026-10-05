export interface CpuSocketStandard {
  id: string;
  socketName: string;
  vendor: 'AMD' | 'Intel';
  pinCount: number;
  contactType: 'LGA' | 'PGA' | 'BGA';
  supportedRam: ('DDR5' | 'DDR4' | 'DDR3' | 'LPDDR5' | 'DDR5-ECC')[];
  maxRamSpeedStock: string;
  maxRamChannels: 'Dual Channel' | 'Quad Channel' | '8-Channel';
  pcieGeneration: 'PCIe 5.0' | 'PCIe 4.0' | 'PCIe 3.0';
  maxCpuPcieLanes: number;
  maxTdpDefault: string;
  releaseYear: number;
  cpuGenerations: string[];
  compatibleChipsets: string[];
  keyFeatures: string[];
  installationNotes: string;
}

export interface RamStandard {
  id: string;
  standardName: string;
  formFactor: 'UDIMM (Desktop)' | 'SO-DIMM (Laptop)' | 'RDIMM (Server/Workstation)' | 'LPDDR (Soldered)';
  pinCount: number;
  baseVoltage: string;
  xmpExpoVoltage: string;
  stockSpeeds: string;
  enthusiastSpeeds: string;
  channelArchitecture: string;
  eccType: string;
  notchPositionDescription: string;
  keyOffsetMm: string;
  powerManagement: string;
  slotPriorityGuide: string;
  technicianBenchNotes: string;
}

export const CPU_SOCKET_STANDARDS: CpuSocketStandard[] = [
  {
    id: 'amd_am5',
    socketName: 'AMD Socket AM5 (LGA 1718)',
    vendor: 'AMD',
    pinCount: 1718,
    contactType: 'LGA',
    supportedRam: ['DDR5'],
    maxRamSpeedStock: 'DDR5-5200 (JEDEC) / DDR5-6000 (Sweet Spot EXPO)',
    maxRamChannels: 'Dual Channel',
    pcieGeneration: 'PCIe 5.0',
    maxCpuPcieLanes: 28,
    maxTdpDefault: '170W (230W PPT)',
    releaseYear: 2022,
    cpuGenerations: ['Ryzen 7000 (Zen 4)', 'Ryzen 8000G (Phoenix APU)', 'Ryzen 9000 (Zen 5)', 'Ryzen 9000X3D'],
    compatibleChipsets: ['X670E', 'X670', 'B650E', 'B650', 'A620', 'X870E', 'X870', 'B850', 'B840'],
    keyFeatures: [
      'Pure LGA pin grid (pins on motherboard, flat gold pads on CPU)',
      'DDR5 exclusive (no DDR4 backward compatibility)',
      'Direct PCIe 5.0 lanes to primary x16 slot & M.2 NVMe',
      'EXPO (Extended Profiles for Overclocking) memory profiles',
      'AM4 cooler bracket mounting backward compatibility',
    ],
    installationNotes: 'Inspect motherboard LGA socket pins with flashlight at 45° angle for bends before seating CPU. Align triangle on CPU gold corner with socket triangle. Never slide CPU across pins.',
  },
  {
    id: 'amd_am4',
    socketName: 'AMD Socket AM4 (PGA 1331)',
    vendor: 'AMD',
    pinCount: 1331,
    contactType: 'PGA',
    supportedRam: ['DDR4'],
    maxRamSpeedStock: 'DDR4-3200 (JEDEC) / DDR4-3600 (Sweet Spot XMP/DOCP)',
    maxRamChannels: 'Dual Channel',
    pcieGeneration: 'PCIe 4.0',
    maxCpuPcieLanes: 24,
    maxTdpDefault: '105W (142W PPT)',
    releaseYear: 2017,
    cpuGenerations: ['Ryzen 1000', 'Ryzen 2000', 'Ryzen 3000', 'Ryzen 4000', 'Ryzen 5000', 'Ryzen 5000X3D'],
    compatibleChipsets: ['X570', 'B550', 'A520', 'X470', 'B450', 'X370', 'B350', 'A320'],
    keyFeatures: [
      'PGA pin architecture (pins are on the processor underside)',
      'Extensive multi-generational longevity across 5 CPU series',
      'PCIe 4.0 support on 3000/5000 series with X570/B550 boards',
      'Requires zero-insertion force (ZIF) retention lever',
    ],
    installationNotes: 'Caution during cooler removal: twist cooler gently before lifting to prevent ripping CPU out of closed socket due to sticky thermal paste. Straighten bent pins using a mechanical pencil tip.',
  },
  {
    id: 'intel_lga1700',
    socketName: 'Intel LGA 1700 (Socket V)',
    vendor: 'Intel',
    pinCount: 1700,
    contactType: 'LGA',
    supportedRam: ['DDR5', 'DDR4'],
    maxRamSpeedStock: 'DDR5-5600 / DDR4-3200 (Board-dependent)',
    maxRamChannels: 'Dual Channel',
    pcieGeneration: 'PCIe 5.0',
    maxCpuPcieLanes: 20,
    maxTdpDefault: '125W Base / 253W MTP (Turbo Boost)',
    releaseYear: 2021,
    cpuGenerations: ['12th Gen Alder Lake', '13th Gen Raptor Lake', '14th Gen Raptor Lake Refresh'],
    compatibleChipsets: ['Z790', 'H770', 'B760', 'Z690', 'H670', 'B660', 'H610'],
    keyFeatures: [
      'Hybrid CPU architecture (Performance P-Cores + Efficient E-Cores)',
      'Hybrid memory controller (Motherboards are sold as either DDR4 or DDR5 versions)',
      '16 PCIe 5.0 lanes for GPU + 4 PCIe 4.0 lanes for CPU NVMe',
      'Rectangular 78mm x 78mm ILM footprint',
    ],
    installationNotes: 'High ILM clamping pressure can cause IHS warping. Consider a contact frame for thermal optimization on 13th/14th Gen i7/i9 processors. Update BIOS with Intel baseline 0x129/0x12B microcode for stability.',
  },
  {
    id: 'intel_lga1851',
    socketName: 'Intel LGA 1851 (Socket V1)',
    vendor: 'Intel',
    pinCount: 1851,
    contactType: 'LGA',
    supportedRam: ['DDR5'],
    maxRamSpeedStock: 'DDR5-6400 (JEDEC) / DDR5-8000+ (CUDIMM XMP)',
    maxRamChannels: 'Dual Channel',
    pcieGeneration: 'PCIe 5.0',
    maxCpuPcieLanes: 24,
    maxTdpDefault: '125W Base / 250W MTP',
    releaseYear: 2024,
    cpuGenerations: ['Core Ultra 200S (Arrow Lake-S)'],
    compatibleChipsets: ['Z890', 'B860', 'H810', 'W880'],
    keyFeatures: [
      'DDR5 exclusive with official CUDIMM (Clocked Unbuffered DIMM) support',
      'Increased CPU PCIe 5.0 lanes (up to 20 Gen5 lanes + 4 Gen4 lanes)',
      'Disaggregated tile packaging using Foveros 3D stacking & NPU engine',
      'Physical cooler mount spacing matches LGA1700 coolers',
    ],
    installationNotes: 'Compatible with LGA1700 coolers, but check cooler coldplate contact center due to hotspot shifting toward top-right die tiles.',
  },
  {
    id: 'intel_lga1200',
    socketName: 'Intel LGA 1200 (Socket H5)',
    vendor: 'Intel',
    pinCount: 1200,
    contactType: 'LGA',
    supportedRam: ['DDR4'],
    maxRamSpeedStock: 'DDR4-2933 (10th Gen) / DDR4-3200 (11th Gen)',
    maxRamChannels: 'Dual Channel',
    pcieGeneration: 'PCIe 4.0',
    maxCpuPcieLanes: 20,
    maxTdpDefault: '65W-125W TDP',
    releaseYear: 2020,
    cpuGenerations: ['10th Gen Comet Lake', '11th Gen Rocket Lake'],
    compatibleChipsets: ['Z590', 'B560', 'H510', 'Z490', 'B460', 'H410'],
    keyFeatures: [
      '14nm monolithic architecture with high single-core clocks',
      'PCIe 4.0 operational ONLY with 11th Gen CPUs installed',
      'Primary M.2 slot disabled on some 500-series boards when 10th Gen CPU is fitted',
      'DDR4 memory overclocking enabled on B560 chipsets',
    ],
    installationNotes: 'If top M.2 NVMe slot is not detected on Z590/B560, verify CPU generation: 10th Gen Core CPUs lack the dedicated 4x Gen4 CPU lanes required for the top slot on many boards.',
  },
  {
    id: 'amd_str5',
    socketName: 'AMD Socket sTR5 / SP6',
    vendor: 'AMD',
    pinCount: 4844,
    contactType: 'LGA',
    supportedRam: ['DDR5-ECC'],
    maxRamSpeedStock: 'DDR5-5200 Registered ECC (RDIMM only)',
    maxRamChannels: '8-Channel',
    pcieGeneration: 'PCIe 5.0',
    maxCpuPcieLanes: 128,
    maxTdpDefault: '350W TDP',
    releaseYear: 2023,
    cpuGenerations: ['Ryzen Threadripper 7000', 'Threadripper PRO 7000 WX-Series'],
    compatibleChipsets: ['TRX50 (Quad Channel)', 'WRX90 (8-Channel)'],
    keyFeatures: [
      'High-End Desktop (HEDT) and Pro Workstation workstation platform',
      'Requires Registered ECC (RDIMM) DDR5 — Unbuffered UDIMMs will not POST',
      'Up to 96 Zen 4 cores / 192 threads on single socket',
      'Massive 128 PCIe 5.0 lane bandwidth for multi-GPU and NVMe RAID',
    ],
    installationNotes: 'Torque wrench mandatory (13.3 in-lbs / 1.5 N-m) in sequence 1-2-3 marked on socket frame. Standard consumer desktop DDR5 UDIMMs are mechanically and electrically incompatible.',
  },
];

export const RAM_STANDARDS: RamStandard[] = [
  {
    id: 'ddr5_desktop',
    standardName: 'DDR5 Desktop UDIMM (Unbuffered)',
    formFactor: 'UDIMM (Desktop)',
    pinCount: 288,
    baseVoltage: '1.1V (JEDEC standard)',
    xmpExpoVoltage: '1.25V - 1.45V (XMP 3.0 / EXPO)',
    stockSpeeds: '4800 MT/s, 5200 MT/s, 5600 MT/s',
    enthusiastSpeeds: '6000 MT/s (Sweet Spot), 6400 MT/s, 7200–8400+ MT/s',
    channelArchitecture: 'Dual 32-bit subchannels per DIMM (64-bit total + 8-bit ECC)',
    eccType: 'On-Die ECC (ODECC) built-in for internal cell integrity',
    notchPositionDescription: 'Key notch is located closer to the center, exactly 13.5 mm offset from center. Distinctly different from DDR4.',
    keyOffsetMm: '13.5 mm offset',
    powerManagement: 'On-Module PMIC (Power Management IC) converts 5V motherboard rail to VDD/VDDQ 1.1V',
    slotPriorityGuide: '2-Stick Configuration: ALWAYS install in slots A2 and B2 (Slots 2 & 4 counting away from CPU).',
    technicianBenchNotes: 'First POST after installation or BIOS reset performs Memory Training (takes 45-120 seconds with blank screen, normal behavior). Do not force DDR5 into DDR4 socket.',
  },
  {
    id: 'ddr4_desktop',
    standardName: 'DDR4 Desktop UDIMM (Unbuffered)',
    formFactor: 'UDIMM (Desktop)',
    pinCount: 288,
    baseVoltage: '1.2V (JEDEC standard)',
    xmpExpoVoltage: '1.35V - 1.45V (XMP 2.0 / DOCP)',
    stockSpeeds: '2133 MT/s, 2400 MT/s, 2666 MT/s, 3200 MT/s',
    enthusiastSpeeds: '3600 MT/s (Ryzen sweet spot), 4000 MT/s, 4400 MT/s',
    channelArchitecture: 'Single 64-bit data channel per DIMM',
    eccType: 'Standard Non-ECC (Client) / Side-band ECC available on specific workstation boards',
    notchPositionDescription: 'Key notch is positioned 5.5 mm offset from center. Curved bottom edge connector to reduce insertion force.',
    keyOffsetMm: '5.5 mm offset',
    powerManagement: 'Motherboard VRM steps down 12V to 1.2V/1.35V DRAM rail before reaching DIMM slots',
    slotPriorityGuide: '2-Stick Configuration: Install in slots A2 and B2 (Slots 2 & 4 from CPU socket).',
    technicianBenchNotes: 'Curved bottom pin connector is designed to reduce insertion force by making initial contact in the center first. Ensure retention clips click into both sides.',
  },
  {
    id: 'ddr5_sodimm',
    standardName: 'DDR5 Laptop SO-DIMM',
    formFactor: 'SO-DIMM (Laptop)',
    pinCount: 262,
    baseVoltage: '1.1V',
    xmpExpoVoltage: '1.1V - 1.25V',
    stockSpeeds: '4800 MT/s, 5200 MT/s, 5600 MT/s',
    enthusiastSpeeds: '5600 MT/s, 6400 MT/s',
    channelArchitecture: 'Dual 32-bit subchannels per module',
    eccType: 'On-Die ECC (ODECC)',
    notchPositionDescription: 'Asymmetric single notch, 262 pins. Incompatible with 260-pin DDR4 SO-DIMM.',
    keyOffsetMm: 'Asymmetric 262-pin layout',
    powerManagement: 'On-module PMIC with SPD hub',
    slotPriorityGuide: 'Primary slot usually labeled Slot 1 / Channel A on laptop mainboard underside.',
    technicianBenchNotes: 'Insert module at 30° angle until gold fingers are seated, then gently press down until side metal spring clips snap into place. Disconnect battery before servicing.',
  },
  {
    id: 'ddr4_sodimm',
    standardName: 'DDR4 Laptop SO-DIMM',
    formFactor: 'SO-DIMM (Laptop)',
    pinCount: 260,
    baseVoltage: '1.2V',
    xmpExpoVoltage: '1.2V - 1.35V',
    stockSpeeds: '2133 MT/s, 2400 MT/s, 2666 MT/s, 3200 MT/s',
    enthusiastSpeeds: '3200 MT/s (CL16-CL22)',
    channelArchitecture: 'Single 64-bit channel per module',
    eccType: 'Non-ECC standard (ECC SO-DIMMs used in select mobile workstations)',
    notchPositionDescription: 'Asymmetric notch with 260 pins. Not pin or mechanically compatible with DDR5.',
    keyOffsetMm: 'Asymmetric 260-pin layout',
    powerManagement: 'Laptop motherboard power rail delivers 1.2V',
    slotPriorityGuide: 'Fill lower socket (Slot 0) before upper stack socket if labeled.',
    technicianBenchNotes: 'Commonly found in 2015–2023 gaming and business laptops. When diagnosing intermittent BSOD, clean gold contacts with 99% isopropyl alcohol and a lint-free swab.',
  },
  {
    id: 'ddr5_rdimm',
    standardName: 'DDR5 Server/Workstation RDIMM (Registered ECC)',
    formFactor: 'RDIMM (Server/Workstation)',
    pinCount: 288,
    baseVoltage: '1.1V',
    xmpExpoVoltage: '1.1V - 1.35V (EXPO RDIMM)',
    stockSpeeds: '4800 MT/s, 5200 MT/s, 5600 MT/s, 6400 MT/s',
    enthusiastSpeeds: '6000 MT/s (Threadripper EXPO)',
    channelArchitecture: 'Registered clock driver (RCD) + Dual 32-bit subchannels + Side-band ECC',
    eccType: 'Side-band 8-bit ECC + On-Die ECC (Full End-to-End Enterprise ECC)',
    notchPositionDescription: '288 pins, notch location matches DDR5 standard, but requires RDIMM support on CPU/motherboard.',
    keyOffsetMm: '13.5 mm offset with RCD chip',
    powerManagement: 'Enterprise PMIC with error telemetry and SPD Hub',
    slotPriorityGuide: 'Follow 4-channel or 8-channel interleaving charts printed on motherboard PCB.',
    technicianBenchNotes: 'Mandatory for AMD Threadripper 7000 and Intel Xeon W systems. Consumer desktop motherboards (AM5 B650/X670, LGA1700 Z790) will refuse to POST with RDIMMs.',
  },
];
