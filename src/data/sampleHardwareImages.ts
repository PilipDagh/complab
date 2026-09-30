// High-contrast SVG-based realistic diagnostic hardware images for vocational lab simulation and instant Google Lens testing

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleHardwareImage {
  id: string;
  title: string;
  category: string;
  description: string;
  dataUrl: string;
  mimeType: string;
  defaultPrompt: string;
}

// 1. Bulging/Vented VRM Electrolytic Capacitors
const bulgingCapacitorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#0f172a" />
  <rect x="20" y="20" width="360" height="260" rx="10" fill="#064e3b" stroke="#047857" stroke-width="2" />
  <text x="30" y="45" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">MOTHERBOARD VRM POWER DELIVERY - PHASE 1-3</text>
  
  <!-- PCB Traces -->
  <path d="M 40 80 L 120 80 L 150 140 L 360 140" stroke="#059669" stroke-width="4" fill="none" opacity="0.4" />
  <path d="M 40 180 L 160 180 L 190 220 L 360 220" stroke="#059669" stroke-width="4" fill="none" opacity="0.4" />
  
  <!-- Healthy Capacitor -->
  <g transform="translate(60, 90)">
    <rect x="0" y="0" width="50" height="90" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2" />
    <ellipse cx="25" cy="0" rx="25" ry="8" fill="#475569" stroke="#94a3b8" stroke-width="1.5" />
    <!-- Vent score (flat) -->
    <line x1="15" y1="0" x2="35" y2="0" stroke="#94a3b8" stroke-width="1.5" />
    <line x1="25" y1="-5" x2="25" y2="5" stroke="#94a3b8" stroke-width="1.5" />
    <!-- Polarity stripe -->
    <rect x="35" y="0" width="15" height="90" fill="#334155" />
    <text x="10" y="50" fill="#94a3b8" font-family="monospace" font-size="9" transform="rotate(-90 10,50)">1500uF 6.3V</text>
    <text x="5" y="115" fill="#10b981" font-family="monospace" font-size="10" font-weight="bold">C1: NORMAL</text>
  </g>

  <!-- FAULTY Bulging Capacitor with electrolyte crust -->
  <g transform="translate(170, 90)">
    <rect x="0" y="0" width="50" height="90" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="2" />
    <!-- Domed Bulging Top -->
    <path d="M 0 0 Q 25 -22 50 0" fill="#b91c1c" stroke="#f87171" stroke-width="2" />
    <!-- Crust/Electrolyte leak -->
    <circle cx="28" cy="-8" r="6" fill="#b45309" opacity="0.9" />
    <circle cx="22" cy="-5" r="4" fill="#d97706" opacity="0.8" />
    <!-- Crack in K-vent -->
    <line x1="18" y1="-6" x2="32" y2="-6" stroke="#451a03" stroke-width="2" />
    <!-- Polarity stripe -->
    <rect x="35" y="0" width="15" height="90" fill="#334155" />
    <text x="10" y="50" fill="#fca5a5" font-family="monospace" font-size="9" transform="rotate(-90 10,50)">1500uF 6.3V</text>
    <text x="-5" y="115" fill="#ef4444" font-family="monospace" font-size="10" font-weight="bold">C2: BULGED / LEAK</text>
  </g>

  <!-- Inductor Choke -->
  <g transform="translate(270, 100)">
    <rect x="0" y="0" width="60" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
    <text x="12" y="35" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">R22</text>
    <text x="5" y="80" fill="#94a3b8" font-family="monospace" font-size="9">CHOKE L1</text>
  </g>

  <rect x="25" y="245" width="350" height="28" rx="6" fill="#1e293b" stroke="#334155" />
  <text x="35" y="263" fill="#f87171" font-family="monospace" font-size="10">⚠️ DEFECT DETECTED: C2 Cap Top Vented with ESR Electrolyte Residue</text>
</svg>`;

// 2. Melted / Burned ATX 24-Pin Connector Pin 10 (+12V)
const burnedConnectorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#090d16" />
  <rect x="20" y="20" width="360" height="260" rx="10" fill="#18181b" stroke="#27272a" stroke-width="2" />
  <text x="30" y="45" fill="#f59e0b" font-family="monospace" font-size="12" font-weight="bold">ATX 24-PIN POWER HARNESS PLUG (MOLEX MINI-FIT)</text>
  
  <!-- Connector Housing -->
  <rect x="50" y="70" width="300" height="140" rx="8" fill="#f4f4f5" stroke="#71717a" stroke-width="3" />
  
  <!-- Row 1: Pins 1-12 -->
  <g transform="translate(65, 85)">
    <!-- Normal Pins -->
    <rect x="0" y="0" width="18" height="18" fill="#fbbf24" stroke="#d97706" />
    <rect x="24" y="0" width="18" height="18" fill="#f87171" stroke="#dc2626" />
    <rect x="48" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="72" y="0" width="18" height="18" fill="#f87171" stroke="#dc2626" />
    <rect x="96" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="120" y="0" width="18" height="18" fill="#f87171" stroke="#dc2626" />
    <rect x="144" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="168" y="0" width="18" height="18" fill="#9333ea" stroke="#7e22ce" />
    <rect x="192" y="0" width="18" height="18" fill="#a855f7" stroke="#7e22ce" />
    
    <!-- BURNED PIN 10 (+12V1) -->
    <rect x="216" y="0" width="18" height="18" fill="#18181b" stroke="#ef4444" stroke-width="2" />
    <circle cx="225" cy="9" r="6" fill="#451a03" />
    <path d="M 214 -8 Q 225 -2 236 -8" fill="#262626" />
    
    <rect x="240" y="0" width="18" height="18" fill="#fbbf24" stroke="#d97706" />
  </g>

  <!-- Row 2: Pins 13-24 -->
  <g transform="translate(65, 125)">
    <rect x="0" y="0" width="18" height="18" fill="#fbbf24" stroke="#d97706" />
    <rect x="24" y="0" width="18" height="18" fill="#3b82f6" stroke="#2563eb" />
    <rect x="48" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="72" y="0" width="18" height="18" fill="#22c55e" stroke="#16a34a" />
    <rect x="96" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="120" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="144" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
    <rect x="168" y="0" width="18" height="18" fill="#e2e8f0" stroke="#94a3b8" />
    <rect x="192" y="0" width="18" height="18" fill="#f87171" stroke="#dc2626" />
    <rect x="216" y="0" width="18" height="18" fill="#f87171" stroke="#dc2626" />
    <rect x="240" y="0" width="18" height="18" fill="#000" stroke="#52525b" />
  </g>

  <!-- Callout -->
  <path d="M 285 85 L 340 50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow)" />
  <rect x="220" y="160" width="150" height="45" rx="6" fill="#450a0a" stroke="#ef4444" />
  <text x="230" y="178" fill="#fca5a5" font-family="monospace" font-size="10" font-weight="bold">PIN 10 (+12V1) BURNED</text>
  <text x="230" y="195" fill="#fecaca" font-family="monospace" font-size="9">High resistance charring</text>
  
  <text x="35" y="255" fill="#f59e0b" font-family="monospace" font-size="10">⚠️ High contact resistance caused thermal runaway on 12V rail pin.</text>
</svg>`;

// 3. Motherboard 2-Digit POST Code Displaying "00" / "D0" (No CPU Execution)
const postCodeCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#0f172a" />
  <rect x="20" y="20" width="360" height="260" rx="10" fill="#1e1b4b" stroke="#4338ca" stroke-width="2" />
  <text x="30" y="45" fill="#a5b4fc" font-family="monospace" font-size="12" font-weight="bold">ROG / ASRock ONBOARD 2-DIGIT 7-SEGMENT POST DISPLAY</text>

  <!-- 7 Segment Dual Digit Housing -->
  <rect x="110" y="70" width="180" height="120" rx="8" fill="#020617" stroke="#312e81" stroke-width="3" />
  
  <!-- Digit 1: '0' -->
  <g transform="translate(130, 85)" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5">
    <rect x="10" y="0" width="40" height="10" rx="2" /> <!-- a -->
    <rect x="50" y="10" width="10" height="35" rx="2" /> <!-- b -->
    <rect x="50" y="50" width="10" height="35" rx="2" /> <!-- c -->
    <rect x="10" y="80" width="40" height="10" rx="2" /> <!-- d -->
    <rect x="0" y="50" width="10" height="35" rx="2" /> <!-- e -->
    <rect x="0" y="10" width="10" height="35" rx="2" /> <!-- f -->
    <!-- g off (middle) -->
    <rect x="10" y="42" width="40" height="8" rx="2" fill="#1e293b" stroke="#0f172a" />
  </g>

  <!-- Digit 2: '0' -->
  <g transform="translate(210, 85)" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5">
    <rect x="10" y="0" width="40" height="10" rx="2" />
    <rect x="50" y="10" width="10" height="35" rx="2" />
    <rect x="50" y="50" width="10" height="35" rx="2" />
    <rect x="10" y="80" width="40" height="10" rx="2" />
    <rect x="0" y="50" width="10" height="35" rx="2" />
    <rect x="0" y="10" width="10" height="35" rx="2" />
    <rect x="10" y="42" width="40" height="8" rx="2" fill="#1e293b" stroke="#0f172a" />
  </g>

  <!-- Q-LED Indicators -->
  <g transform="translate(30, 100)" font-family="monospace" font-size="9">
    <circle cx="20" cy="10" r="5" fill="#ef4444" stroke="#f87171" stroke-width="1.5" />
    <text x="32" y="14" fill="#f87171" font-weight="bold">CPU (RED - LIT)</text>

    <circle cx="20" cy="35" r="5" fill="#334155" />
    <text x="32" y="39" fill="#94a3b8">DRAM (OFF)</text>

    <circle cx="20" cy="60" r="5" fill="#334155" />
    <text x="32" y="64" fill="#94a3b8">VGA (OFF)</text>

    <circle cx="20" cy="85" r="5" fill="#334155" />
    <text x="32" y="89" fill="#94a3b8">BOOT (OFF)</text>
  </g>

  <rect x="30" y="215" width="340" height="45" rx="6" fill="#18181b" stroke="#374151" />
  <text x="40" y="235" fill="#f87171" font-family="monospace" font-size="11" font-weight="bold">POST DEBUG: "00" / RED CPU Q-LED ACTIVE</text>
  <text x="40" y="250" fill="#cbd5e1" font-family="monospace" font-size="9">Meaning: CPU not initializing, missing VCORE power, or bent socket LGA pins.</text>
</svg>`;

// 4. Digital Multimeter Reading 0.01 Ohms Shorted VRM MOSFET
const multimeterReadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#090d16" />
  
  <!-- Multimeter Body (Fluke Yellow Rubber Holster) -->
  <rect x="90" y="15" width="220" height="270" rx="20" fill="#eab308" stroke="#ca8a04" stroke-width="3" />
  <rect x="105" y="30" width="190" height="240" rx="14" fill="#18181b" />
  
  <!-- LCD Screen -->
  <rect x="120" y="45" width="160" height="75" rx="6" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
  <text x="130" y="65" fill="#334155" font-family="monospace" font-size="10" font-weight="bold">DIODE / CONTINUITY</text>
  <text x="130" y="105" fill="#0f172a" font-family="monospace" font-size="36" font-weight="bold">0.01 <tspan font-size="16">Ω</tspan></text>
  <text x="240" y="105" fill="#dc2626" font-family="monospace" font-size="14" font-weight="bold">BEEP</text>

  <!-- Rotary Selector -->
  <circle cx="200" cy="175" r="35" fill="#27272a" stroke="#52525b" stroke-width="2" />
  <line x1="200" y1="175" x2="200" y2="145" stroke="#eab308" stroke-width="4" stroke-linecap="round" />
  <text x="185" y="140" fill="#eab308" font-family="monospace" font-size="10" font-weight="bold">Ω / 🔊</text>

  <!-- Probes at Bottom -->
  <circle cx="160" cy="245" r="8" fill="#ef4444" />
  <circle cx="200" cy="245" r="8" fill="#000" />
  <circle cx="240" cy="245" r="8" fill="#000" />
  <text x="150" y="260" fill="#94a3b8" font-family="monospace" font-size="7">V-Ω-mA</text>
  <text x="193" y="260" fill="#94a3b8" font-family="monospace" font-size="7">COM</text>
  <text x="235" y="260" fill="#94a3b8" font-family="monospace" font-size="7">10A</text>
</svg>`;

// Export realistic sample dataset
export const SAMPLE_HARDWARE_IMAGES: SampleHardwareImage[] = [
  {
    id: 'sample_bulging_cap',
    title: 'Bulging VRM Filter Capacitors (ESR Failure)',
    category: 'Motherboard Power Delivery',
    description: 'Electrolytic capacitor dome top expanded with dried electrolyte residue crust from prolonged 105°C thermal stress.',
    dataUrl: svgToDataUrl(bulgingCapacitorSvg),
    mimeType: 'image/svg+xml',
    defaultPrompt: 'Inspect this motherboard VRM capacitor. Identify the damage on component C2, explain the ESR failure mechanics, and provide multimeter replacement specs.',
  },
  {
    id: 'sample_burned_atx',
    title: 'Charred 24-Pin ATX Connector (Pin 10 +12V)',
    category: 'Power Supply & Wiring',
    description: 'Pin 10 (+12V yellow wire) melted and charred due to high contact resistance and current overload from GPU PCIe power drawing.',
    dataUrl: svgToDataUrl(burnedConnectorSvg),
    mimeType: 'image/svg+xml',
    defaultPrompt: 'Analyze this burned 24-pin ATX power supply connector. Which pin is damaged, what caused this thermal runaway, and how do I safely re-pin the Molex terminal?',
  },
  {
    id: 'sample_post_00',
    title: 'Motherboard Debug Code "00" + Red CPU Q-LED',
    category: 'POST & Boot Failures',
    description: 'Digital 7-segment display stuck at 00 with solid red CPU diagnostic diode, indicating CPU execution has not commenced.',
    dataUrl: svgToDataUrl(postCodeCardSvg),
    mimeType: 'image/svg+xml',
    defaultPrompt: 'Google Lens Scan: Identify this 2-digit debug code "00" and red CPU Q-LED. Provide the CompTIA A+ step-by-step diagnostic checklist to test CPU VCORE and socket pins.',
  },
  {
    id: 'sample_multimeter_short',
    title: 'Multimeter 0.01Ω Short on 12V EPS Rail',
    category: 'Electrical Bench Probing',
    description: 'Digital Multimeter showing 0.01 Ohm direct continuity to ground across the 8-Pin CPU EPS connector, indicating a punctured high-side MOSFET.',
    dataUrl: svgToDataUrl(multimeterReadingSvg),
    mimeType: 'image/svg+xml',
    defaultPrompt: 'Evaluate this multimeter reading (0.01 ohms on diode continuity mode). What component is shorted on the motherboard, and how do I safely isolate it?',
  },
];
