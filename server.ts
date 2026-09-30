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

// Robust model invocation with automatic retry & fallback for high-demand 503s or quota issues
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

  let lastError: any = null;

  for (let attempt = 0; attempt < candidateModels.length; attempt++) {
    const currentModel = candidateModels[attempt];
    try {
      const config = { ...baseConfig };
      // Thinking mode is only supported on gemini-3.1-pro-preview
      if (currentModel !== 'gemini-3.1-pro-preview' && config.thinkingConfig) {
        delete config.thinkingConfig;
      }

      console.log(`[Gemini Engine] Querying model ${currentModel} (attempt ${attempt + 1}/${candidateModels.length})...`);
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
      lastError = err;
      console.warn(
        `[Gemini Engine Warning] Model ${currentModel} error: ${err?.message || err}. Attempting fallback...`
      );

      // If there are more models in candidateModels, proceed directly to the next model
      if (attempt < candidateModels.length - 1) {
        continue;
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

    // Format contents with history
    const contents: any[] = [];

    // Append prior history turns
    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }],
        });
      }
    }

    // Current turn parts
    const currentParts: any[] = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
    if (prompt) {
      currentParts.push({ text: prompt });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

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
  try {
    const { category, symptomPath, solutionNode, notes, ownerContext } = req.body;
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
