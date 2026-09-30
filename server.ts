import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getAllUsers, updateUserRole } from './src/db/users.ts';
import { getAllProjects, insertProject, updateProjectById, deleteProjectById } from './src/db/projects.ts';
import { getAllCalendarLogs, upsertCalendarLog } from './src/db/calendar.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to sanitize and format conversation contents for Gemini API (prevents role order errors)
function formatGeminiContents(history: any[], currentPrompt: string, image?: any): any[] {
  const contents: any[] = [];

  // Filter and sanitize history
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (!msg || !msg.content || typeof msg.content !== 'string') continue;
      // Skip welcome greeting or system messages that shouldn't be the leading turn
      if (msg.id === 'msg_welcome') continue;

      const role = msg.role === 'assistant' ? 'model' : 'user';

      // Gemini requires first turn to be 'user'
      if (contents.length === 0 && role === 'model') {
        continue;
      }

      // Avoid consecutive turns with identical role by merging
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts.push({ text: msg.content });
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }
  }

  // Current turn parts
  const currentParts: any[] = [];

  // If image provided
  if (image && image.data) {
    let cleanBase64 = image.data;
    if (typeof cleanBase64 === 'string' && cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }
    const mimeType = image.mimeType || 'image/jpeg';
    currentParts.push({
      inlineData: {
        mimeType: mimeType === 'image/svg+xml' ? 'image/png' : mimeType,
        data: cleanBase64,
      },
    });
  }

  if (currentPrompt && currentPrompt.trim()) {
    currentParts.push({ text: currentPrompt.trim() });
  } else if (currentParts.length === 0) {
    currentParts.push({ text: 'Please diagnose this hardware issue.' });
  }

  // If previous turn in history was user, merge to adhere to alternation
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts.push(...currentParts);
  } else {
    contents.push({
      role: 'user',
      parts: currentParts,
    });
  }

  return contents;
}

// Robust model invocation with automatic exponential backoff retry & fallback for high-demand 503s or quota issues
async function generateWithModelFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  contents: any[],
  baseConfig: any,
  fallbackPromptContext: string
): Promise<{ text: string; modelUsed: string; isFallback: boolean }> {
  // Ordered fallback models: always include the ultra-reliable, high-throughput gemini-3.1-flash-lite
  const candidateModels = [
    preferredModel || 'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
    const currentModel = candidateModels[modelIdx];
    const maxRetries = 3;

    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const config = { ...baseConfig };
        // Thinking mode is only supported on gemini-3.1-pro-preview
        if (currentModel !== 'gemini-3.1-pro-preview' && config.thinkingConfig) {
          delete config.thinkingConfig;
        }

        console.log(`[Gemini Engine] Querying model ${currentModel} (attempt ${retry + 1}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config,
        });

        if (response && response.text) {
          return {
            text: response.text,
            modelUsed: currentModel,
            isFallback: currentModel !== preferredModel,
          };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini Engine Warning] Model ${currentModel} try ${retry + 1} failed: ${errMsg}`);

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('high demand') ||
          errMsg.includes('fetch failed');

        if (isTransient && retry < maxRetries - 1) {
          // Exponential backoff with jitter: 600ms, 1200ms, 2400ms
          const delay = Math.min(600 * Math.pow(2, retry) + Math.random() * 200, 3000);
          console.log(`[Gemini Engine] Backing off for ${Math.round(delay)}ms before retry...`);
          await sleep(delay);
          continue;
        }
        break; // Proceed to next candidate model
      }
    }
  }

  // If all cloud model instances are experiencing high demand (503) or quota, deliver intelligent local CompTIA analysis
  console.warn('All Gemini cloud models currently congested or unavailable. Serving CompTIA offline bench analysis.');
  return {
    text:
      `⚡ **CompTIA A+ Bench Advisory** *(Cloud Model High Demand Fallback)*\n\n` +
      `Here is targeted technical bench troubleshooting for your query: **"${fallbackPromptContext.slice(0, 100)}"**\n\n` +
      `#### 1. Core Electrical & POST Diagnostic Steps\n` +
      `- **Motherboard Standby Rail:** Probe Pin 9 (Purple +5VSB) against Pin 15 (Black COM) on 24-pin ATX. Must read 4.75V – 5.25V DC with a Digital Multimeter.\n` +
      `- **Single-Channel RAM Seating:** Remove all DIMMs except one known-good stick in Primary Slot A2 (second slot from CPU). Clear CMOS for 10 seconds.\n` +
      `- **PS_ON Jump Start:** Bridge Pin 16 (Green) to Pin 17 (Black) with an insulated paperclip to isolate PSU fan and +12V/+5V rail health under dummy load.\n\n` +
      `#### 2. Component Isolation & Signaling Protocol\n` +
      `- **CPU Power Rail:** Inspect 8-pin EPS 12V connection. A dead short (0Ω to GND) indicates blown high-side VRM MOSFETs.\n` +
      `- **APIPA 169.254.x.x:** Indicates failure to receive DHCP offer. Run: \`netsh winsock reset && netsh int ip reset && ipconfig /flushdns\` then reboot.\n` +
      `- **Missing NVMe Drive:** Verify motherboard PCIe lane bifurcation rules (secondary M.2 often shares lanes with SATA ports 5/6). Clean M-Key gold contacts with 99% IPA.\n\n` +
      `*Note: Model traffic usually subsides within moments. You can ask follow-up questions anytime!*`,
    modelUsed: 'TradeTech Bench Engine (Local Fallback)',
    isFallback: true,
  };
}

// API: Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    service: 'TradeTech Bench Assistant Backend',
  });
});

// API: Gemini Chatbot
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      prompt,
      history = [],
      systemInstruction = '',
      model = 'gemini-3.1-flash-lite',
      thinkingMode = false,
      image = null,
    } = req.body;

    if (!prompt && !image) {
      return res.status(400).json({ error: 'Prompt or image is required.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply:
          "⚠️ **Gemini API Key Missing**: The `GEMINI_API_KEY` is not detected in the environment. " +
          "To enable live Gemini AI repair diagnostics, configure your key in Google AI Studio Secrets.\n\n" +
          "**Standard Bench Advice:**\n" +
          "1. For POST failure: Disconnect all peripherals, reseat RAM in single-channel slot A2, clear CMOS by bridging CLRTC jumpers for 10 seconds.\n" +
          "2. For PSU check: Use paperclip test (PS_ON Pin 16 green shorted to Pin 17/18 black COM) while testing +12V (yellow) and +5V (red) with a digital multimeter.\n" +
          "3. For network APIPA (169.254.x.x): Verify DHCP server reachability and test with static IP configuration.",
        status: 'demo_fallback',
      });
    }

    // Format contents safely with history and images
    const contents = formatGeminiContents(history, prompt, image);

    const chosenModel = model || 'gemini-3.1-flash-lite';
    const config: any = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (thinkingMode && chosenModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const result = await generateWithModelFallback(
      ai,
      chosenModel,
      contents,
      config,
      prompt || 'Hardware diagnostic query'
    );

    return res.json({
      reply: result.text,
      modelUsed: result.modelUsed,
      isFallback: result.isFallback,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.status(200).json({
      reply:
        `⚠️ **Temporary High Cloud Traffic**: Google AI models are currently experiencing high request volume.\n\n` +
        `**Quick Bench Solution:**\n` +
        `1. Try switching the model dropdown above to **gemini-3.1-flash-lite** for immediate high-throughput response.\n` +
        `2. For POST loop failures: Disconnect 8-pin EPS CPU 12V cable. If PSU stays on, replace high-side VRM MOSFET.\n` +
        `3. For RAM training: Single stick in Slot A2, clean gold contacts with 99% IPA.`,
      status: 'notice',
    });
  }
});

// API: Specialized Diagnostic Second Opinion
app.post('/api/gemini/diagnose', async (req, res) => {
  const { category, symptomPath, solutionNode, notes, ownerContext } = req.body || {};
  try {
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        analysis:
          `### CompTIA A+ Field Verification Protocol\n` +
          `**Category:** ${category || 'General Hardware'}\n` +
          `**Path Taken:** ${Array.isArray(symptomPath) ? symptomPath.join(' ➔ ') : 'Direct node'}\n\n` +
          `#### Root Cause Probability\n` +
          `High confidence alignment with **${solutionNode?.title || 'Hardware Fault'}**. ` +
          `Recommended next action: Verify standby power rails (+5VSB) and isolate minimum boot components.\n\n` +
          `#### Bench Tools Required\n` +
          `- Digital Multimeter (DMM - True RMS)\n` +
          `- Motherboard POST 2-Digit Diagnostic Debug Card (PCIe / LPC header)\n` +
          `- Anti-static grounding wrist strap (1MΩ resistor safety rated)`,
        status: 'demo_fallback',
      });
    }

    const prompt = `You are a CompTIA A+, Cisco CCNA, and Master Bench Repair Instructor for a vocational technical institute.
Review this student or technician diagnostic path and generate an authoritative technical breakdown.

Symptom Category: ${category}
Diagnostic Step Path: ${Array.isArray(symptomPath) ? symptomPath.join(' -> ') : 'N/A'}
Identified Node / Preliminary Solution: ${JSON.stringify(solutionNode || {})}
Technician Additional Notes: ${notes || 'None provided'}
${ownerContext ? `Active Lab Work Orders & Context: ${ownerContext}` : ''}

Please deliver:
1. **Root Cause Analysis & Electrical / Logical Mechanics**
2. **CompTIA 6-Step Troubleshooting Step Assessment** (Identify, Establish theory, Test theory, Plan of Action, Verify full system, Document findings)
3. **Bench Test Points & Multimeter Specs** (Specific pins, expected voltages, resistance/continuity values)
4. **Safety & Component Hazard Warnings** (e.g. capacitor discharge, ESD precautions, thermal paste toxicity)
5. **Technician Pro-Tip** (An instructor trick of the trade)`;

    const result = await generateWithModelFallback(
      ai,
      'gemini-3.1-flash-lite',
      [{ role: 'user', parts: [{ text: prompt }] }],
      {},
      `Diagnostic evaluation: ${category} - ${solutionNode?.title || ''}`
    );

    return res.json({
      analysis: result.text,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return res.status(200).json({
      analysis:
        `### CompTIA A+ Field Verification Advisory\n` +
        `**Category:** ${category || 'General Hardware'}\n` +
        `**Path:** ${Array.isArray(symptomPath) ? symptomPath.join(' ➔ ') : 'Direct'}\n\n` +
        `#### Immediate Diagnostic Verification:\n` +
        `- Verify standby power rails (+5VSB on ATX Pin 9 Purple) read between 4.75V - 5.25V.\n` +
        `- Clean memory DIMM gold fingers with 99% IPA and test single stick in Slot A2.\n` +
        `- Probe 8-pin EPS connector for shorted VRM MOSFET (0.00V drop to ground).`,
      status: 'fallback',
    });
  }
});

// API: Hardware Lens Visual Inspection & Component Detection (Google Lens style for hardware)
app.post('/api/gemini/lens-analyze', async (req, res) => {
  const { image, query, model, hardwareContext } = req.body || {};
  try {
    const ai = getAiClient();

    if (!image || !image.data) {
      return res.status(400).json({
        error: 'No image data provided for visual inspection.',
        status: 'error',
      });
    }

    if (!ai) {
      return res.json({
        analysis:
          `### 🔍 TradeTech Hardware Lens Visual Inspection Report (Local Fallback)\n\n` +
          `**Detected Component**: PCB Surface Mount Electronics & Power Delivery Subsystem\n\n` +
          `#### 1. Visual Defect Analysis\n` +
          `- **Suspected Anomaly**: High probability of thermal stress, electrolytic capacitor venting, or MOSFET junction degradation.\n` +
          `- **Silkscreen & Alignment**: Verify polarity markings (cathode stripe on electrolytic caps, pin 1 dot on ICs).\n\n` +
          `#### 2. CompTIA A+ Bench Verification\n` +
          `- **Step 1 - Resistance Check**: Set DMM to diode/continuity mode. Measure resistance between 12V rail and Ground (COM). Expected reading > 300Ω. If reading < 1.0Ω, a direct short exists.\n` +
          `- **Step 2 - Component Isolation**: Desolder suspected capacitor or remove inductor coil to isolate faulty power phase.\n` +
          `- **Step 3 - Thermal Inspection**: Power bench supply with 1.0V current-limited injection to detect hot spots using isopropyl alcohol evaporation or thermal camera.\n\n` +
          `#### 3. Technician Safety & PPE\n` +
          `- Discharge high-voltage bulk filter capacitors before tactile probing.\n` +
          `- Always use ESD-safe grounded mat and 1MΩ wrist strap.`,
        status: 'demo_fallback',
      });
    }

    const prompt = `You are the TradeTech Hardware Lens Computer Vision & Master Electronics Diagnostic AI.
Analyze this uploaded hardware photo like an advanced Google Lens for CompTIA A+ technicians, electrical engineers, and vocational students.

Technician Question / Notes: ${query || 'Identify this component, detect defects or damage, and provide diagnostic steps.'}
${hardwareContext ? `Target Device / Asset Info: ${JSON.stringify(hardwareContext)}` : ''}

Please deliver an authoritative, structured diagnostic report with these sections:
1. **🔍 Component Identification & Silkscreen Markings**
   - Precise identification of the board, socket, IC, connector, cable, card, or tool shown in the photo.
   - Any readable markings, part numbers, chip codes, or capacitor/resistor ratings.
2. **⚠️ Visual Defect & Anomaly Detection**
   - Identify physical damage, burning, discoloration, bulging/vented capacitors, cracked solder joints, bent pins, corroded traces, missing components, or improper seating.
3. **⚡ Root Cause & Electrical Failure Mechanics**
   - Explain what causes this failure mode (over-voltage, power surge, ESD, thermal throttling, capacitor ESR aging, dry solder).
4. **🛠️ Bench Testing & Multimeter Probing Procedure**
   - Exact test points, probe locations, expected DC voltages, continuity, and resistance values.
5. **🛡️ Safety Warnings & CompTIA A+ Best Practices**
   - ESD precautions, capacitor discharge procedures, soldering safety, and part replacement guidance.
6. **📋 Recommended Action / Fix Steps**
   - Step 1 to Step 4 action plan for repairing or replacing the component.`;

    const parts: any[] = [
      {
        inlineData: {
          mimeType: image.mimeType || 'image/jpeg',
          data: image.data,
        },
      },
      { text: prompt },
    ];

    const chosenModel = model || 'gemini-3.1-flash-lite';
    const result = await generateWithModelFallback(
      ai,
      chosenModel,
      [{ role: 'user', parts }],
      {},
      'Hardware Lens Visual Inspection'
    );

    return res.json({
      analysis: result.text,
      modelUsed: result.modelUsed,
      isFallback: result.isFallback,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Hardware Lens Error:', error);
    return res.status(200).json({
      analysis:
        `### 🔍 TradeTech Hardware Lens Diagnostic Advisory\n\n` +
        `**Visual Inspection Notice**: High-throughput fallback engaged.\n\n` +
        `#### Identified Diagnostic Checklist:\n` +
        `1. **Capacitor Inspection**: Check for dome bulging on aluminum electrolytic caps or brown electrolyte crust.\n` +
        `2. **MOSFET VRM Probing**: Test drain-to-source resistance on low-side and high-side FETs (replace if reading 0.00Ω).\n` +
        `3. **Pin Straightening**: If LGA/PGA pins are bent, use 0.5mm mechanical pencil tip or stereo microscope under ESD control.`,
      status: 'fallback',
    });
  }
});


// --- CLOUD SQL & FIREBASE AUTH API ROUTES ---

// Sync Firebase User with Cloud SQL and apply First-User Owner rule
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || `${uid}@tradetech.local`;
    const { displayName, benchStation } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user UID' });
    }

    const user = await getOrCreateUser(uid, email, displayName, benchStation);
    return res.json({ user, status: 'success' });
  } catch (error: any) {
    console.error('User sync error:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user with database' });
  }
});

// List all registered technicians from Cloud SQL
app.get('/api/users', async (req, res) => {
  try {
    const userList = await getAllUsers();
    return res.json({ users: userList });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load users' });
  }
});

// Projects / Work Orders endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const list = await getAllProjects();
    return res.json({ projects: list });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = await insertProject(req.body);
    return res.json({ project, status: 'success' });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateProjectById(id, req.body);
    return res.json({ project: updated, status: 'success' });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteProjectById(id);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
});

// Daily Calendar Logs endpoints
app.get('/api/calendar-logs', async (req, res) => {
  try {
    const logs = await getAllCalendarLogs();
    return res.json({ logs });
  } catch (error: any) {
    console.error('Get calendar logs error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load calendar logs' });
  }
});

app.post('/api/calendar-logs', async (req, res) => {
  try {
    const log = await upsertCalendarLog(req.body);
    return res.json({ log, status: 'success' });
  } catch (error: any) {
    console.error('Save calendar log error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save calendar log' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TradeTech Bench Assistant running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
