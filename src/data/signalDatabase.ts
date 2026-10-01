/**
 * Signal Integrity, Oscilloscope Waveform & Logic Analyzer Micro-Probe Database
 * Authoritative bench reference for oscilloscope presets, protocol frames,
 * USB-PD CC negotiations, power sequence machines, BGA stencils, and VRM stages.
 */

export interface WaveformPreset {
  id: string;
  name: string;
  category: 'Oscillator Clock' | 'Power VRM' | 'Serial Bus' | 'Differential High-Speed';
  nominalFreq: string;
  nominalVpp: string;
  coupling: 'AC' | 'DC';
  probeAttenuation: '1X' | '10X';
  timeDivUs: number; // in microseconds per division
  voltDivMv: number; // in millivolts per division
  description: string;
  healthyCriteria: string;
  faultSymptoms: string;
  pointsGenerator: (t: number) => number; // returns voltage in V for normalized time t (0 to 1)
}

export interface LogicProtocolFrame {
  id: string;
  busType: 'I2C' | 'SPI' | 'UART' | 'SMBus Battery';
  clockRate: string;
  voltageLevel: '1.8V' | '3.3V' | '5.0V';
  addressOrCommand: string;
  dataBytes: string[];
  ackStatus: 'ACK' | 'NACK' | 'CRC Error';
  benchTriageNotes: string;
}

export interface UsbPdProfile {
  id: string;
  pdoIndex: number;
  type: 'Fixed' | 'PPS (Programmable Power Supply)' | 'EPR (Extended Power Range)';
  voltageV: number;
  currentA: number;
  maxPowerW: number;
  ccLineRpResistance: string;
  negotiationStage: string;
  failureMode: string;
}

export interface PowerSequenceSignal {
  order: number;
  signalName: string;
  nominalVoltage: string;
  originatingChip: string;
  receivingChip: string;
  description: string;
  troubleshootingIfMissing: string;
}

export interface BgaStencilSpec {
  id: string;
  componentName: string;
  category: 'GPU Core' | 'VRAM' | 'PCH / Chipset' | 'SoC / CPU';
  ballCount: number;
  ballPitchMm: number;
  ballDiameterMm: number;
  recommendedAlloy: 'Sn63/Pb37 (183°C)' | 'SAC305 Lead-Free (217°C)' | 'Sn42/Bi58 Low-Temp (138°C)';
  preheatTempC: number;
  peakReflowTempC: number;
  commonBoards: string;
}

export interface VrmPowerStageSpec {
  id: string;
  partNumber: string;
  manufacturer: string;
  packageType: string;
  maxCurrentA: number;
  integratedDriver: boolean;
  switchingFreqKhz: number;
  bootstrapCapUf: string;
  commonBoards: string;
  failureSignatures: string;
}

// -------------------------------------------------------------
// 1. OSCILLOSCOPE WAVEFORM PRESETS
// -------------------------------------------------------------
export const OSCILLOSCOPE_PRESETS: WaveformPreset[] = [
  {
    id: 'wave-rtc-32k',
    name: '32.768 kHz RTC Real-Time Clock Crystal',
    category: 'Oscillator Clock',
    nominalFreq: '32.768 kHz',
    nominalVpp: '0.8V - 1.6V Vpp',
    coupling: 'AC',
    probeAttenuation: '10X',
    timeDivUs: 10,
    voltDivMv: 500,
    description: 'Clean sinusoidal oscillation on PCH/SoC RTC_X1 / RTC_X2 pins powered by 3.0V CMOS coin cell or RTCVDD rail.',
    healthyCriteria: 'Pure sine wave at exactly 32.768 kHz (±20 ppm). Vpp must exceed 600mV for PCH internal oscillator inverter.',
    faultSymptoms: 'Flat DC line (0V or 3V) indicates cracked tuning-fork crystal, bad load capacitors (12pF), or shorted PCH RTC domain. Motherboard will NOT turn on.',
    pointsGenerator: (t) => Math.sin(t * Math.PI * 8) * 0.8 + 1.2,
  },
  {
    id: 'wave-vrm-ripple',
    name: 'CPU VCORE VRM Phase Switching Ripple',
    category: 'Power VRM',
    nominalFreq: '500 kHz',
    nominalVpp: '< 20 mV Vpp',
    coupling: 'AC',
    probeAttenuation: '1X',
    timeDivUs: 1,
    voltDivMv: 10,
    description: 'High-frequency output voltage ripple across ceramic/polymer filter capacitors at the CPU socket inductor node.',
    healthyCriteria: 'Triangular switching ripple under 15mV peak-to-peak with smooth inductor discharge slopes.',
    faultSymptoms: 'Excessive spike ringing > 60mV Vpp indicates dried-out SMD polymer capacitors or open MLCC decoupling arrays, triggering instant WHEA Blue Screens.',
    pointsGenerator: (t) => (Math.abs(((t * 12) % 2) - 1) - 0.5) * 0.035,
  },
  {
    id: 'wave-clk-25m',
    name: '25 MHz Main System / Ethernet PHY Reference Clock',
    category: 'Oscillator Clock',
    nominalFreq: '25.000 MHz',
    nominalVpp: '1.8V - 3.3V Vpp',
    coupling: 'DC',
    probeAttenuation: '10X',
    timeDivUs: 0.05,
    voltDivMv: 500,
    description: 'Clipped sine or square wave feeding Gigabit Ethernet PHY, PCH main PLL, and Super I/O chipsets.',
    healthyCriteria: 'Rise time < 4ns, duty cycle 45% - 55%, clean edges without ringing overshoot.',
    faultSymptoms: 'Attenuated waveform (< 1.0V) or distorted frequency causes network adapter disappearance from Device Manager or PCIe bus link failure.',
    pointsGenerator: (t) => (Math.sin(t * Math.PI * 20) > 0 ? 1.65 : -1.65) * 0.8 + 1.65,
  },
  {
    id: 'wave-i2c-bus',
    name: 'I2C / SMBus Battery Management Clock (SCL)',
    category: 'Serial Bus',
    nominalFreq: '100 kHz / 400 kHz',
    nominalVpp: '3.3V Logic Level',
    coupling: 'DC',
    probeAttenuation: '10X',
    timeDivUs: 5,
    voltDivMv: 1000,
    description: 'Open-drain clock line pulled high to +3.3V via 2.2kΩ - 4.7kΩ resistors between Battery Charger IC, Super I/O, and Smart Battery Pack.',
    healthyCriteria: 'Sharp falling edges (pulled low by IC) and RC exponential rising edges (pulled high by resistor). Low level < 0.4V.',
    faultSymptoms: 'Slow rise time exceeding 1000ns indicates blown pull-up resistor. Stuck low (0V) indicates shorted battery fuel gauge or ESD diode clamp failure.',
    pointsGenerator: (t) => {
      const cycle = (t * 8) % 1;
      return cycle < 0.5 ? 0.2 : 3.3 * (1 - Math.exp(-cycle * 8));
    },
  },
  {
    id: 'wave-pcie-eye',
    name: 'PCIe Gen 4 Differential Pair (Eye Diagram)',
    category: 'Differential High-Speed',
    nominalFreq: '16.0 GT/s',
    nominalVpp: '800 mV Differential',
    coupling: 'AC',
    probeAttenuation: '10X',
    timeDivUs: 0.001,
    voltDivMv: 200,
    description: '16 GT/s high-speed differential TX+/TX- signal pair measured across 0.22µF AC coupling capacitors.',
    healthyCriteria: 'Wide open inner eye mask with jitter < 15ps. Eye height > 150mV at 10^-12 BER.',
    faultSymptoms: 'Closed eye mask indicates excessive PCB trace loss, damaged ESD protection diode array, or cracked AC coupling capacitor. PCIe drops from Gen4 to Gen1 or links fail.',
    pointsGenerator: (t) => Math.sin(t * Math.PI * 16) * Math.cos(t * Math.PI * 4) * 0.4,
  },
];

// -------------------------------------------------------------
// 2. LOGIC PROTOCOL DECODER FRAMES
// -------------------------------------------------------------
export const LOGIC_PROTOCOL_FRAMES: LogicProtocolFrame[] = [
  {
    id: 'proto-i2c-isl9241',
    busType: 'I2C',
    clockRate: '400 kHz (Fast Mode)',
    voltageLevel: '3.3V',
    addressOrCommand: '0x12 (ISL9241 Buck-Boost Charger)',
    dataBytes: ['0x14', '0x00', '0x1A'],
    ackStatus: 'ACK',
    benchTriageNotes: 'Successful write of MaxSystemVoltage register (0x14). Charger IC acknowledges communication.',
  },
  {
    id: 'proto-i2c-nack-tps',
    busType: 'I2C',
    clockRate: '100 kHz (Standard)',
    voltageLevel: '3.3V',
    addressOrCommand: '0x48 (TPS65987 Type-C PD Controller)',
    dataBytes: ['0x00', '0x03'],
    ackStatus: 'NACK',
    benchTriageNotes: 'CRITICAL FAULT: Device generated NACK (No Acknowledge). Indicates TPS65987 controller has no 3.3V LDO power or is stuck in reset.',
  },
  {
    id: 'proto-spi-w25q128',
    busType: 'SPI',
    clockRate: '33 MHz',
    voltageLevel: '3.3V',
    addressOrCommand: '0x9F (Read JEDEC ID)',
    dataBytes: ['0xEF', '0x40', '0x18'],
    ackStatus: 'ACK',
    benchTriageNotes: 'JEDEC ID returned: 0xEF (Winbond), 0x40 (SPI), 0x18 (128Mb / 16MB). SPI flash chip is healthy and communicating.',
  },
  {
    id: 'proto-uart-uboot',
    busType: 'UART',
    clockRate: '115200 Baud (8-N-1)',
    voltageLevel: '3.3V',
    addressOrCommand: 'TX Stream',
    dataBytes: ['0x55', '0x2D', '0x42', '0x6F', '0x6F', '0x74'],
    ackStatus: 'ACK',
    benchTriageNotes: 'ASCII stream reads "U-Boot". Bootloader UART debug output is transmitting cleanly.',
  },
  {
    id: 'proto-smbus-batt',
    busType: 'SMBus Battery',
    clockRate: '50 kHz',
    voltageLevel: '3.3V',
    addressOrCommand: '0x16 (Smart Battery Pack)',
    dataBytes: ['0x0D', '0x2E', '0x2C'],
    ackStatus: 'ACK',
    benchTriageNotes: 'Querying 0x0D (RelativeStateOfCharge): 0x2E = 46% charge remaining. Battery BQ gas gauge microcontroller is active.',
  },
];

// -------------------------------------------------------------
// 3. USB-PD POWER NEGOTIATION PROFILES & CC LINES
// -------------------------------------------------------------
export const USB_PD_PROFILES: UsbPdProfile[] = [
  {
    id: 'pd-5v',
    pdoIndex: 1,
    type: 'Fixed',
    voltageV: 5,
    currentA: 3.0,
    maxPowerW: 15,
    ccLineRpResistance: '56kΩ to +5V (Default USB)',
    negotiationStage: 'Initial Attachment / VBUS Present',
    failureMode: 'If stuck at 5V 0.00A, laptop EC has not pulled CC line low with 5.1kΩ Rd resistor.',
  },
  {
    id: 'pd-9v',
    pdoIndex: 2,
    type: 'Fixed',
    voltageV: 9,
    currentA: 3.0,
    maxPowerW: 27,
    ccLineRpResistance: '22kΩ to +5V (1.5A Advertised)',
    negotiationStage: 'Fast Charge Handshake (Phones/Handhelds)',
    failureMode: 'Often skipped by 45W-100W laptop chargers moving straight to 20V.',
  },
  {
    id: 'pd-15v',
    pdoIndex: 3,
    type: 'Fixed',
    voltageV: 15,
    currentA: 3.0,
    maxPowerW: 45,
    ccLineRpResistance: '10kΩ to +5V (3.0A Advertised)',
    negotiationStage: 'Tablet & Ultrabook Intermediate Rail',
    failureMode: 'Used by Nintendo Switch and Surface devices. Failure indicates PD controller failed to request PDO3.',
  },
  {
    id: 'pd-20v-5a',
    pdoIndex: 4,
    type: 'Fixed',
    voltageV: 20,
    currentA: 5.0,
    maxPowerW: 100,
    ccLineRpResistance: 'BMC Packet Negotiated via SOP*',
    negotiationStage: 'High-Power Laptop Charging (100W)',
    failureMode: 'Requires 5A E-Marker chip in cable. If 3A cable used, charger clamps maximum request to 20V 3A (60W).',
  },
  {
    id: 'pd-epr-28v',
    pdoIndex: 5,
    type: 'EPR (Extended Power Range)',
    voltageV: 28,
    currentA: 5.0,
    maxPowerW: 140,
    ccLineRpResistance: 'EPR Handshake (EPR_REQ / EPR_MODE)',
    negotiationStage: 'High-Performance Gaming Laptop / MacBook Pro 16"',
    failureMode: 'Requires EPR certified 240W cable and USB-PD 3.1 controller. Fallback to 20V occurs if cable is standard 100W.',
  },
];

// -------------------------------------------------------------
// 4. POWER SEQUENCING & STATE MACHINE (Intel S5 to S0)
// -------------------------------------------------------------
export const INTEL_POWER_SEQUENCE_CHAIN: PowerSequenceSignal[] = [
  {
    order: 1,
    signalName: 'RTCVDD / RTCRST#',
    nominalVoltage: '3.0V - 3.3V',
    originatingChip: 'CMOS Battery / +3V_RTC Regulator',
    receivingChip: 'PCH / SoC RTC Domain',
    description: 'Real-Time Clock power supply and reset. Must be present even when system is completely unplugged.',
    troubleshootingIfMissing: 'Check coin cell voltage and diode D1. Replace 32.768 kHz crystal if RTCRST# is low.',
  },
  {
    order: 2,
    signalName: '+3.3VALW / +5VALW',
    nominalVoltage: '3.3V and 5.0V',
    originatingChip: 'Always-On Dual Buck Regulator',
    receivingChip: 'Super I/O (EC), Power Button, SPI ROM',
    description: 'Always-on power rails created immediately upon plugging in AC adapter.',
    troubleshootingIfMissing: 'Check +19V main rail across current sense resistor. Verify 3V/5V enable pin and VIN MOSFETs.',
  },
  {
    order: 3,
    signalName: 'EC_ON / VCC_EC',
    nominalVoltage: '3.3V',
    originatingChip: '+3.3VALW Rail',
    receivingChip: 'Embedded Controller (IT8586 / MEC1416 / KB9028)',
    description: 'Power applied to Super I/O microcontroller. EC boots internal 8051/ARM core and reads EC firmware.',
    troubleshootingIfMissing: 'Verify EC crystal (24MHz or 32kHz) and check for cracked solder on 128-pin QFP package.',
  },
  {
    order: 4,
    signalName: 'RSMRST# (Resume Reset)',
    nominalVoltage: '3.3V',
    originatingChip: 'Embedded Controller (EC)',
    receivingChip: 'PCH / SoC',
    description: 'Tells PCH that all always-on power rails are stable and ready for power button press.',
    troubleshootingIfMissing: 'If RSMRST# is 0V, PCH will ignore power button presses completely. Check EC firmware or cold solder.',
  },
  {
    order: 5,
    signalName: 'PWRBTN# / ON/OFF#',
    nominalVoltage: '3.3V -> 0V Pulse -> 3.3V',
    originatingChip: 'Physical Power Button Switch',
    receivingChip: 'EC then forwarded to PCH (PM_PWRBTN#)',
    description: 'Momentary active-low pulse signaling user desire to turn system on.',
    troubleshootingIfMissing: 'Check power button board ribbon cable for corrosion or torn pins. Verify pull-up resistor to 3.3V.',
  },
  {
    order: 6,
    signalName: 'SLP_S5# / SLP_S4# / SLP_S3#',
    nominalVoltage: '3.3V',
    originatingChip: 'PCH / SoC',
    receivingChip: 'Embedded Controller (EC) & System Power ICs',
    description: 'Sleep control signals released high by PCH, enabling S3 (DRAM) and S0 (Full On) power supplies.',
    troubleshootingIfMissing: 'If SLP signals remain low at 0V, PCH is either dead, missing clock, or holding reset.',
  },
  {
    order: 7,
    signalName: 'DRAM_VPP / VDDQ (+1.2V / +1.1V)',
    nominalVoltage: '1.2V (DDR4) / 1.1V (DDR5)',
    originatingChip: 'DRAM Buck Regulator IC',
    receivingChip: 'DRAM Slots & CPU IMC',
    description: 'Main memory voltage rail switched on in S3 state.',
    troubleshootingIfMissing: 'Check DRAM controller enable signal from SLP_S4#. Look for shorted ceramic filter capacitors near DIMMs.',
  },
  {
    order: 8,
    signalName: 'VCCST / VCCCORE (CPU Core)',
    nominalVoltage: '0.6V - 1.35V',
    originatingChip: 'Multi-Phase CPU VRM Controller',
    receivingChip: 'CPU Cores & Cache',
    description: 'Main CPU operating voltage commanded by SVID serial bus between CPU and PWM controller.',
    troubleshootingIfMissing: 'Check VRM enable pin. Inspect high-side/low-side MOSFETs for puncture shorts to 19V rail.',
  },
  {
    order: 9,
    signalName: 'PLTRST# (Platform Reset)',
    nominalVoltage: '3.3V',
    originatingChip: 'PCH / SoC',
    receivingChip: 'Entire Motherboard (PCIe, Wi-Fi, Storage, Super I/O)',
    description: 'Final reset released high. Hardware power sequencing is 100% complete; CPU begins executing BIOS instructions.',
    troubleshootingIfMissing: 'Missing PLTRST# indicates missing clock, bad CPU VRM phase, or corrupt BIOS code.',
  },
];

// -------------------------------------------------------------
// 5. BGA REBALLING & STENCIL DATABASE
// -------------------------------------------------------------
export const BGA_STENCIL_DATABASE: BgaStencilSpec[] = [
  {
    id: 'bga-ga102',
    componentName: 'NVIDIA GA102 GPU Core (RTX 3080 / 3090)',
    category: 'GPU Core',
    ballCount: 2280,
    ballPitchMm: 0.5,
    ballDiameterMm: 0.35,
    recommendedAlloy: 'Sn63/Pb37 (183°C)',
    preheatTempC: 150,
    peakReflowTempC: 215,
    commonBoards: 'GeForce RTX 3080 10GB/12GB, RTX 3080 Ti, RTX 3090 24GB Founders & AIB',
  },
  {
    id: 'bga-ad103',
    componentName: 'NVIDIA AD103 GPU Core (RTX 4080 / 4080 Super)',
    category: 'GPU Core',
    ballCount: 2450,
    ballPitchMm: 0.45,
    ballDiameterMm: 0.3,
    recommendedAlloy: 'Sn63/Pb37 (183°C)',
    preheatTempC: 155,
    peakReflowTempC: 210,
    commonBoards: 'GeForce RTX 4080, RTX 4080 Super, RTX 4090 Laptop GPU',
  },
  {
    id: 'bga-gddr6-180',
    componentName: 'Micron / Samsung GDDR6 / GDDR6X VRAM (BGA180)',
    category: 'VRAM',
    ballCount: 180,
    ballPitchMm: 0.75,
    ballDiameterMm: 0.4,
    recommendedAlloy: 'Sn63/Pb37 (183°C)',
    preheatTempC: 140,
    peakReflowTempC: 205,
    commonBoards: 'All RTX 30/40 series and Radeon RX 6000/7000 graphics cards',
  },
  {
    id: 'bga-intel-pch-300',
    componentName: 'Intel 300/400/500 Series PCH Chipset (BGA1440)',
    category: 'PCH / Chipset',
    ballCount: 1440,
    ballPitchMm: 0.4,
    ballDiameterMm: 0.25,
    recommendedAlloy: 'Sn63/Pb37 (183°C)',
    preheatTempC: 150,
    peakReflowTempC: 212,
    commonBoards: 'Intel B360, Z390, B460, Z490, B560, Z590 motherboards',
  },
  {
    id: 'bga-apple-m2',
    componentName: 'Apple M2 SoC & Unified LPDDR5 Memory',
    category: 'SoC / CPU',
    ballCount: 3100,
    ballPitchMm: 0.35,
    ballDiameterMm: 0.2,
    recommendedAlloy: 'Sn42/Bi58 Low-Temp (138°C)',
    preheatTempC: 120,
    peakReflowTempC: 165,
    commonBoards: 'MacBook Air M2 (A2681), MacBook Pro 13" M2 (A2338)',
  },
];

// -------------------------------------------------------------
// 6. VRM POWER STAGE (DrMOS) & MOSFET SPECIFICATIONS
// -------------------------------------------------------------
export const VRM_POWER_STAGES: VrmPowerStageSpec[] = [
  {
    id: 'vrm-sic634',
    partNumber: 'Vishay SiC634 (50A VRPower)',
    manufacturer: 'Vishay Siliconix',
    packageType: 'PowerPAK MLP55-31L',
    maxCurrentA: 50,
    integratedDriver: true,
    switchingFreqKhz: 1500,
    bootstrapCapUf: '0.1µF / 16V X7R',
    commonBoards: 'ASRock B450 Pro4, ASUS Prime Z390-P, Gigabyte B550 Gaming X',
    failureSignatures: 'Shorted high-side MOSFET punches +12V EPS rail directly into CPU VCORE, destroying the CPU die instantly.',
  },
  {
    id: 'vrm-tda21472',
    partNumber: 'Infineon TDA21472 (70A OptiMOS)',
    manufacturer: 'Infineon Technologies',
    packageType: 'PQFN 5x6mm',
    maxCurrentA: 70,
    integratedDriver: true,
    switchingFreqKhz: 2000,
    bootstrapCapUf: '0.22µF / 25V X7R',
    commonBoards: 'ASUS ROG Maximus XII/XIII Hero, MSI MEG Z490/Z590 Godlike',
    failureSignatures: 'Thermal shutdown flag pulled low to PWM controller; phase is automatically dropped by controller.',
  },
  {
    id: 'vrm-aoz5311',
    partNumber: 'Alpha & Omega AOZ5311NQI (55A DrMOS)',
    manufacturer: 'Alpha & Omega Semiconductor',
    packageType: 'QFN 5x5mm',
    maxCurrentA: 55,
    integratedDriver: true,
    switchingFreqKhz: 1000,
    bootstrapCapUf: '0.1µF / 16V X7R',
    commonBoards: 'MSI B450 Tomahawk MAX, Gigabyte B450 Aorus Elite, Sapphire RX 5700 XT',
    failureSignatures: 'Bootstrap diode failure prevents high-side gate charge; phase remains silent while adjacent phases overheat.',
  },
];
