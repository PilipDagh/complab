/**
 * Shared Gemini AI Engine for Vocational & Bench Diagnostic Modules
 * Supports:
 * - Client-side direct call to Gemini 1.5 Flash via stored GEMINI_API_KEY
 * - Full fallback to backend /api/gemini/chat proxy
 * - Contextual system framing per CompTIA / IPC-A-610 standards
 * - Exponential backoff retry logic for 503 / 429
 * - LocalStorage persistence for diagnostic history
 */

export interface ModuleAiRequestOptions {
  moduleName: string;
  toolName: string;
  inputPayload: Record<string, any> | string;
  userRole?: 'ROLE_OWNER' | 'ROLE_STUDENT';
  customPrompt?: string;
  image?: {
    data: string; // base64 without prefix
    mimeType: string;
  };
}

export interface ModuleAiResponse {
  analysis: string;
  timestamp: string;
  modelUsed: string;
  isFallback?: boolean;
}

const LOCAL_STORAGE_KEY_API_KEY = 'tradetech_gemini_api_key';
const LOCAL_STORAGE_KEY_MOD1_HISTORY = 'tradetech_module1_ai_history';

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY) ||
    localStorage.getItem('GEMINI_API_KEY') ||
    ''
  );
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(LOCAL_STORAGE_KEY_API_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, key.trim());
  }
}

export function saveModuleAiHistory(entry: {
  toolName: string;
  summary: string;
  analysis: string;
  timestamp: string;
}): void {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MOD1_HISTORY) || '[]');
    const updated = [entry, ...existing].slice(0, 30);
    localStorage.setItem(LOCAL_STORAGE_KEY_MOD1_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save AI history to localStorage', e);
  }
}

export function getModuleAiHistory(): Array<{
  toolName: string;
  summary: string;
  analysis: string;
  timestamp: string;
}> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MOD1_HISTORY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Universal execution runner for Module 1 AI queries
 */
export async function executeModuleAiQuery(
  options: ModuleAiRequestOptions
): Promise<ModuleAiResponse> {
  const {
    moduleName,
    toolName,
    inputPayload,
    userRole = 'ROLE_OWNER',
    customPrompt = '',
    image,
  } = options;

  const roleTitle = userRole === 'ROLE_OWNER' ? 'Lead Technician / Instructor' : 'Bench Repair Student / Network Admin';
  const payloadString =
    typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload, null, 2);

  const isNetworkModule = moduleName.includes('MODULE 2') || moduleName.toLowerCase().includes('network') || moduleName.toLowerCase().includes('sysadmin');
  const isEduModule = moduleName.includes('MODULE 3') || moduleName.toLowerCase().includes('vocational') || moduleName.toLowerCase().includes('comptia') || moduleName.toLowerCase().includes('study');
  const isShopModule = moduleName.includes('MODULE 4') || moduleName.toLowerCase().includes('instructor') || moduleName.toLowerCase().includes('lab management') || moduleName.toLowerCase().includes('workflow');
  const isForensicModule = moduleName.includes('MODULE 5') || moduleName.toLowerCase().includes('forensic') || moduleName.toLowerCase().includes('recovery') || moduleName.toLowerCase().includes('firmware') || moduleName.toLowerCase().includes('storage');
  const isSignalModule = moduleName.includes('MODULE 6') || moduleName.toLowerCase().includes('signal') || moduleName.toLowerCase().includes('oscilloscope') || moduleName.toLowerCase().includes('waveform') || moduleName.toLowerCase().includes('logic') || moduleName.toLowerCase().includes('bga');

  let systemContext = `[SYSTEM CONTEXT: TRADETECH BOARD-LEVEL REPAIR COPILOT]
Module: ${moduleName}
Tool Selected: ${toolName}
User Role: ${roleTitle}
Goal: Provide precise micro-soldering, board-level, or component replacement advice based on CompTIA A+ and IPC-A-610 standards.
Hardware Input Parameters:
${payloadString}

Format your response in structured Markdown with:
1. Executive Triage Summary
2. Physical Verification & Multimeter Probing Steps (test points, expected DC rails/voltages, impedance)
3. Board-Level Action Plan (IPC-A-610 soldering precautions, hot air temps, part cross-references)
4. CompTIA A+ / Shop Safety Warning (ESD, thermal hazard, short-circuit risk)`;

  if (isSignalModule) {
    systemContext = `[SYSTEM CONTEXT: TRADETECH SIGNAL INTEGRITY & OSCILLOSCOPE BENCH SPECIALIST]
Signal Lab Tool: ${toolName}
Waveform & Protocol Diagnostic Input:
${payloadString}
User Role: Senior Hardware Diagnostics Engineer / Signal Integrity Specialist
Objective: Provide precise oscilloscope, logic analyzer, USB-PD, BGA reflow, and power sequencing triage compliant with IPC-7711/7721 and JEDEC microelectronics standards.

Format your response in structured Markdown with:
1. Signal Analysis & Waveform Anomaly Diagnostics (Ringing, jitter, rise-time degradation, ripple Vpp)
2. Hardware Probing & Test Point Protocol (Oscilloscope AC/DC coupling, 10x probe grounding spring, bandwidth limit)
3. Board-Level Rework Strategy (BGA thermal profile, DrMOS gate drive, TVS clamp replacement)
4. IPC/JEDEC Engineering Recommendations`;
  } else if (isForensicModule) {
    systemContext = `[SYSTEM CONTEXT: TRADETECH FORENSIC DATA RECOVERY & FIRMWARE SPECIALIST]
Forensic Laboratory Tool: ${toolName}
Forensic & Firmware Diagnostic Input:
${payloadString}
User Role: Cleanroom Data Recovery Specialist / Firmware Diagnostic Engineer
Objective: Provide forensically sound, read-only bitstream recovery advice, file system rebuilding instructions, SPI programmer pinout guidance, and donor drive matching rules following NIST SP 800-88 and ISO/IEC 27037 standards.

Format your response in clean, authoritative Markdown with:
1. Forensic Triage & Risk Assessment (Head crash risk, NAND wear, Dirty ME, Write-block verification)
2. Technical Execution Protocol (exact ddrescue flags, test points, flashrom commands, offset carving)
3. Cleanroom & Hardware Precautions (Class 100 laminar flow bench, 1.8V vs 3.3V VCC hazard, donor head combs)`;
  } else if (isShopModule) {
    systemContext = `[SYSTEM CONTEXT: TRADETECH SHOP ADMINISTRATOR & INSTRUCTOR COPILOT]
Operational Module Active: ${toolName}
Shop Operations Payload:
${payloadString}
User Role: Lead Instructor / Shop Administrator
Objective: Provide efficient, professional shop management assistance, student evaluation summaries, customer-friendly service translation, and administrative trade school reporting compliant with vocational education standards.

Format your response in clean Markdown with:
1. Operational / Administrative Assessment
2. Student Competency & IPC/CompTIA Learning Recommendations
3. Actionable Shop Floor Directives & Inventory/Safety Protocol`;
  } else if (isEduModule) {
    systemContext = `[SYSTEM CONTEXT: TRADETECH COMPTIA EXAM COACH & SOCRATIC TUTOR]
Educational Tool Active: ${toolName}
Student Simulation Payload:
${payloadString}
User Role: CompTIA Vocational Student
Objective: Act as a master vocational instructor. Use supportive, Socratic questioning to identify student knowledge gaps, explain missed concepts using clear real-world analogies, and reinforce official CompTIA A+ (220-1101/1102), Network+ (N10-008), and Security+ (SY0-701) exam objectives.

Format your response in clean Markdown with:
1. Socratic Conceptual Feedback (guide without simply giving away the answer)
2. CompTIA Exam Objective Mapping (Domain & Sub-objective breakdown)
3. Real-World Engineering Analogy (relate to everyday concepts)`;
  } else if (isNetworkModule) {
    systemContext = `[SYSTEM CONTEXT: TRADETECH SYSADMIN & NETWORK COPILOT]
Active Tool: ${toolName}
Network/Sysadmin Input Payload:
${payloadString}
User Role: ${userRole === 'ROLE_OWNER' ? 'Senior Enterprise Network Administrator' : 'Network Technician / Systems Administrator Student'}
Objective: Provide accurate, secure, CompTIA Network+, Security+, and Cisco CCNA compliant networking advice, terminal guidance, and script optimizations.

Format your response in clean Markdown with:
1. Network & Topology Analysis
2. Command-Line Syntax, Security Hardening & Safe Execution Protocol
3. CompTIA Network+ / Cisco CCNA Best Practices (VLAN tags, ACL rules, routing table entries)`;
  }

  const userQuery = customPrompt.trim()
    ? `${customPrompt}\n\n[Active Diagnostics]:\n${payloadString}`
    : `Perform deep board-level engineering and micro-soldering triage for the selected parameters:\n${payloadString}`;

  const clientApiKey = getStoredGeminiApiKey();

  // Attempt 1: Direct client-side fetch if user provided an API Key
  if (clientApiKey) {
    try {
      const parts: any[] = [{ text: `${systemContext}\n\nTechnician Question:\n${userQuery}` }];

      if (image && image.data) {
        parts.push({
          inline_data: {
            mime_type: image.mimeType || 'image/jpeg',
            data: image.data,
          },
        });
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
          clientApiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 1400,
            },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const result: ModuleAiResponse = {
            analysis: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-1.5-flash (Client Direct)',
            isFallback: false,
          };
          saveModuleAiHistory({
            toolName,
            summary: typeof inputPayload === 'string' ? inputPayload.slice(0, 60) : toolName,
            analysis: text,
            timestamp: result.timestamp,
          });
          return result;
        }
      }
    } catch (clientErr) {
      console.warn('[Module AI] Direct Gemini API call failed, falling back to server proxy:', clientErr);
    }
  }

  // Attempt 2: Server-side proxy /api/gemini/chat with exponential retry
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuery,
          systemInstruction: systemContext,
          model: 'gemini-3.1-flash-lite',
          image: image || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const result: ModuleAiResponse = {
            analysis: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed || 'Gemini 3.1 Flash-Lite (Bench Engine)',
            isFallback: !!data.isFallback,
          };
          saveModuleAiHistory({
            toolName,
            summary: typeof inputPayload === 'string' ? inputPayload.slice(0, 60) : toolName,
            analysis: data.reply,
            timestamp: result.timestamp,
          });
          return result;
        }
      }

      if (res.status === 503 || res.status === 429) {
        retryCount++;
        if (retryCount <= maxRetries) {
          await new Promise((r) => setTimeout(r, 800 * retryCount));
          continue;
        }
      }
      break;
    } catch (serverErr) {
      console.warn('[Module AI] Server proxy error:', serverErr);
      break;
    }
  }

  // Fallback: Comprehensive offline CompTIA A+ & IPC-A-610 diagnostic guidance
  const offlineAnalysis = generateOfflineAdvisory(toolName, inputPayload);
  return {
    analysis: offlineAnalysis,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: 'TradeTech IPC/CompTIA Offline Bench Engine',
    isFallback: true,
  };
}

function generateOfflineAdvisory(toolName: string, payload: any): string {
  const isSignal =
    toolName.toLowerCase().includes('oscilloscope') ||
    toolName.toLowerCase().includes('waveform') ||
    toolName.toLowerCase().includes('logic') ||
    toolName.toLowerCase().includes('protocol') ||
    toolName.toLowerCase().includes('usb-pd') ||
    toolName.toLowerCase().includes('power delivery') ||
    toolName.toLowerCase().includes('sequence') ||
    toolName.toLowerCase().includes('bga') ||
    toolName.toLowerCase().includes('reball') ||
    toolName.toLowerCase().includes('clock') ||
    toolName.toLowerCase().includes('crystal') ||
    toolName.toLowerCase().includes('vrm') ||
    toolName.toLowerCase().includes('mosfet') ||
    toolName.toLowerCase().includes('esd') ||
    toolName.toLowerCase().includes('tvs');

  if (isSignal) {
    return `### ⚡ Signal Integrity & Oscilloscope Bench Advisory (Offline Engine)
**Diagnostic Tool:** ${toolName}
**Signal Payload:** ${typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 100)}

#### 1. Oscilloscope Probing & Grounding Technique
- **Ground Spring vs Alligator Clip:** High-frequency clock lines (>10MHz) and VRM switching nodes MUST use a direct ground spring tip. Standard 6-inch alligator ground leads act as parasitic inductors (~100nH), causing artificial ringing and overshoot.
- **Probe Attenuation:** Set probe to **10X mode** (10MΩ / ~10pF) to minimize circuit loading. 1X mode has high input capacitance (~100pF) which will crash high-speed crystal oscillators and I2C buses.
- **AC vs DC Coupling:** When measuring VRM switching ripple on +1.05V or VCORE rails, switch to **AC Coupling** and 20MHz bandwidth limit to isolate millivolt-level ripple without offset clipping.

#### 2. Power Sequencing & Signal State Machine
- Verify primary cold rails (+3.3VALW, +5VALW, RTCVDD 3.0V) before expecting PCH \`RSMRST#\` (Resume Reset) to release high to 3.3V.
- Missing \`PLTRST#\` (Platform Reset) with all CPU VCORE and DRAM voltages present indicates dead PCH die, missing clock generator output (100MHz spread spectrum), or corrupt BIOS SPI flash.`;
  }

  const isForensic =
    toolName.toLowerCase().includes('forensic') ||
    toolName.toLowerCase().includes('carv') ||
    toolName.toLowerCase().includes('spi') ||
    toolName.toLowerCase().includes('bios') ||
    toolName.toLowerCase().includes('hdd') ||
    toolName.toLowerCase().includes('platter') ||
    toolName.toLowerCase().includes('ssd') ||
    toolName.toLowerCase().includes('ddrescue') ||
    toolName.toLowerCase().includes('bitlocker') ||
    toolName.toLowerCase().includes('partition') ||
    toolName.toLowerCase().includes('sanitize');

  if (isForensic) {
    return `### 🔬 NIST SP 800-88 & Cleanroom Forensic Advisory (Offline Engine)
**Forensic Tool:** ${toolName}
**Parameters:** ${typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 100)}

#### 1. Forensic Integrity & Write-Block Protocol
- **Write-Block Verification:** Ensure physical hardware write-blocker (CRU WiebeTech / Tableau) is engaged before mounting patient storage.
- **Bitstream Preservation:** Always execute \`ddrescue\` with persistent mapfile (\`patient.map\`) so imaging can be resumed without re-reading stressed sectors.
- **Phase 1 Fast Pass:** Use \`ddrescue -d -b 4096 -n /dev/sdX patient.img patient.map\` (skip slow scraping on first pass to extract 95%+ of intact sectors quickly).

#### 2. Hardware & Cleanroom Safety
- **1.8V SPI BIOS Warning:** Never apply 3.3V to 1.8V flash chips (Winbond W25Q64FW/JW, MacBook/Dell XPS); use a verified 1.8V logic level shifter PCB.
- **HDD Clicking / Stiction:** Never attempt cleanroom platter swaps without matching donor head comb tools and identical MicroJogs/preamp revisions.
- **SSD Controller Lockup:** For SATAFIRM S11 or 0MB panic, bridge ROM mode pads prior to power cycling to halt NAND firmware corruption loops.`;
  }

  const isNet =
    toolName.toLowerCase().includes('script') ||
    toolName.toLowerCase().includes('cli') ||
    toolName.toLowerCase().includes('switch') ||
    toolName.toLowerCase().includes('wi-fi') ||
    toolName.toLowerCase().includes('wifi') ||
    toolName.toLowerCase().includes('mac') ||
    toolName.toLowerCase().includes('terminal') ||
    toolName.toLowerCase().includes('subnet') ||
    toolName.toLowerCase().includes('cable') ||
    toolName.toLowerCase().includes('tdr') ||
    toolName.toLowerCase().includes('dns') ||
    toolName.toLowerCase().includes('ping');

  if (isNet) {
    return `### 🌐 CompTIA Network+ & Cisco CCNA Advisory (Offline Engine)
**Active Tool:** ${toolName}
**Sysadmin Payload:** ${typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 100)}

#### 1. Network Layer & Protocol Triage
- **Physical Layer (L1):** Verify link lights (amber vs green). Cat6 TDR limits are 100m (328ft). Open pin 1/2 or 3/6 drops link from 1000BASE-T down to 100BASE-TX or link state down.
- **Data Link (L2):** Inspect Native VLAN tagging mismatch (Cisco \`switchport trunk native vlan X\`). Unmatched native VLAN causes STP loops and CDP/LLDP error storms.
- **Network Layer (L3):** Verify default gateway ARP table entry (\`arp -a\` or \`ip neigh\`). An APIPA address \`169.254.x.x\` indicates complete DHCP offer exhaustion or DORA process failure.

#### 2. Security Hardening & Script Protocol
- Restrict administrative Telnet/HTTP access; mandate SSHv2 (\`crypto key generate rsa modulus 2048\`) and HTTPS.
- Implement 802.1X NAC port security (\`switchport port-security maximum 2 violation shutdown\`).
- Flush DNS resolvers and NetBIOS cache: \`ipconfig /flushdns && nbtstat -R\` on Windows; \`resolvectl flush-caches\` on systemd-resolved.`;
  }

  return `### ⚡ CompTIA A+ & IPC-A-610 Bench Advisory (Offline Engine)
**Tool Target:** ${toolName}
**Diagnostic Context:** ${typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 100)}

#### 1. Immediate Bench Procedure
- **Power Isolation:** Immediately disconnect the main DC power source and discharge primary filter capacitors (100–470µF) using a 1kΩ 5W power resistor.
- **Microscopic Inspection:** Inspect solder fillets under 10x–30x magnification for micro-fractures, flux residue oxidation, or thermal discoloration.
- **Multimeter Probing:**
  - Place Black probe on motherboard ground screw-hole copper ring (GND).
  - Use Red probe in Resistance Mode (200Ω scale) or Diode Mode.
  - A reading below 1.0Ω on any major rail (+19V, +12V, +5V, +3.3V) signifies a dead ceramic MLCC short or punctured high-side MOSFET drain-source junction.

#### 2. Component Sourcing & Replacement Rules
- Always match or exceed original package voltage rating ($V_{work} \\ge 1.5 \\times V_{nominal}$).
- For MLCC capacitors on +19V rails, use X7R or X5R dielectric with a minimum 25V–35V rating (package size 0805 or 0603).
- Apply leaded 63/37 Sn/Pb or low-temp Bi58/Sn42 alloy to lower melting point before hot air reflow (320°C–340°C, 35% airflow) to prevent PCB delamination.

#### 3. IPC-A-610 Safety Standards
- Wear a calibrated anti-static wrist strap connected to a 1MΩ ground point.
- Avoid voltage injection exceeding 1.0V into low-voltage CPU VCORE / PCH rails.`;
}
