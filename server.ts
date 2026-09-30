import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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
      model = 'gemini-3.8-flash',
      thinkingMode = false,
      image = null,
    } = req.body;

    if (!prompt && !image) {
      return res.status(400).json({ error: 'Prompt or image is required.' });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback message when API key is not configured in environment
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

    const chosenModel = model || 'gemini-3.8-flash';
    const config: any = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (thinkingMode && chosenModel === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config,
    });

    const reply = response.text || 'No response generated from model.';
    return res.json({ reply, status: 'success' });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI diagnostics request.',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      analysis: response.text,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate diagnostic evaluation.',
    });
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
