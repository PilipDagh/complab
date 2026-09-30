import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  ShieldCheck,
  BrainCircuit,
  Volume2,
  VolumeX,
  RefreshCw,
  Cpu,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const GeminiChatbot: React.FC = () => {
  const {
    chatMessages,
    isAiLoading,
    selectedModel,
    setSelectedModel,
    isThinkingMode,
    setIsThinkingMode,
    sendMessageToGemini,
    clearChatHistory,
    isOwner,
    currentUser,
    projects,
    calendarLogs,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt chips
  const promptChips = [
    'Explain POST Beep Codes',
    'How to test PSU with a multimeter',
    'Diagnose APIPA IP address (169.254.x.x)',
    'Thermal paste pattern: Pea vs Line vs Spread',
    'Troubleshoot NVMe drive missing from BIOS',
    'Check high-side MOSFET short on CPU VRM',
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Handle image upload for visual inspection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        preview: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputPrompt.trim() && !selectedImage) || isAiLoading) return;

    const textToSend = inputPrompt;
    const imgToSend = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined;

    setInputPrompt('');
    setSelectedImage(null);

    await sendMessageToGemini(textToSend, imgToSend);
  };

  // Text-To-Speech for hands-free multimeter probing
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const clean = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .substring(0, 500); // limit to first 500 characters of actionable steps

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const ongoingProjectsCount = projects.filter((p) => p.status === 'ongoing').length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[740px]">
      {/* Chat Header Bar */}
      <div className="p-4 border-b border-[#30363d] bg-[#0d1117]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ea043] to-[#38bdf8] flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono">
                TradeTech <span className="text-[#38bdf8]">AI Bench Repair Chatbot</span>
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262d] text-[#2ea043] border border-[#2ea043]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              CompTIA A+ Master Technician & Schematic Diagnostic Engine
            </p>
          </div>
        </div>

        {/* Model Selector & Thinking Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedModel}
            onChange={(e: any) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-200 focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (Fast Bench)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Schematics)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant Lookup)</option>
          </select>

          {selectedModel === 'gemini-3.1-pro-preview' && (
            <button
              onClick={() => setIsThinkingMode(!isThinkingMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                isThinkingMode
                  ? 'bg-purple-900/30 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-[#21262d] text-gray-400 border-[#30363d]'
              }`}
              title="High Reasoning Thinking Mode for complex electrical schematics"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Thinking: {isThinkingMode ? 'HIGH' : 'OFF'}</span>
            </button>
          )}

          <button
            onClick={clearChatHistory}
            className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors border border-[#30363d]"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Owner System Context Injection Status Banner */}
      <div className="px-4 py-2 bg-[#0d1117] border-b border-[#30363d] text-xs flex items-center justify-between">
        {isOwner ? (
          <div className="flex items-center gap-2 text-[#2ea043] font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#2ea043]" />
            <span>
              <span className="font-bold">Lead Tech Context Injection Active:</span> Linked{' '}
              {ongoingProjectsCount} Active Bench Work Orders & Today's Class Lab Log to AI Memory.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
            <Cpu className="w-4 h-4 shrink-0 text-blue-400" />
            <span>
              Student Mode: Standard CompTIA A+ reference base. (Log in as Owner to inject class calendar & active work orders).
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-[#38bdf8] text-gray-950 shadow-md'
                    : 'bg-[#21262d] border border-[#30363d] text-[#2ea043]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs lg:text-sm relative group ${
                  isUser
                    ? 'bg-gradient-to-br from-[#1f6feb] to-[#238636] text-white shadow-md rounded-tr-none'
                    : 'bg-[#0d1117] border border-[#30363d] text-gray-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Image Attachment Preview if provided */}
                {msg.attachedImage && (
                  <div className="mb-3">
                    <img
                      src={msg.attachedImage}
                      alt="Hardware Inspection"
                      className="max-h-56 rounded-lg border border-[#30363d] object-cover"
                    />
                    <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                      📷 Attached Hardware Photo for Inspection
                    </span>
                  </div>
                )}

                {/* Content with basic markdown render */}
                <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Footer metadata & TTS */}
                <div className="mt-2.5 pt-2 border-t border-[#30363d]/50 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-2">
                    {msg.contextInjected && (
                      <span className="text-[#2ea043] flex items-center gap-1">
                        ⚡ Owner Context
                      </span>
                    )}
                    {msg.modelUsed && <span>{msg.modelUsed}</span>}

                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="hover:text-white transition-colors p-1"
                        title="Read aloud for hands-free bench inspection"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isAiLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-[#21262d] border border-[#30363d] text-[#2ea043] flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] text-xs font-mono text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#38bdf8] animate-pulse" />
              <span>Analyzing hardware schematics & diagnostic logic...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 bg-[#0d1117]/80 border-t border-[#30363d] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-gray-400 shrink-0">QUICK BENCH CHIPS:</span>
        {promptChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => {
              setInputPrompt(chip);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#38bdf8] text-[11px] font-mono text-gray-300 hover:text-white transition-all whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-[#0d1117] border-t border-[#30363d] space-y-3">
        {/* Selected image preview chip */}
        {selectedImage && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161b22] border border-[#30363d] w-fit">
            <img src={selectedImage.preview} alt="Attached" className="w-10 h-10 object-cover rounded-lg" />
            <div className="text-xs text-gray-300 font-mono">
              <div>Visual Diagnostic Photo Ready</div>
              <div className="text-[10px] text-gray-400">{selectedImage.mimeType}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-[#38bdf8] transition-colors"
            title="Upload motherboard, cable, or error screen photo for visual AI analysis"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Gemini: 'How to jump PS_ON Pin 16', 'Inspect attached motherboard image', 'Troubleshoot 3 beeps'..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs lg:text-sm placeholder-gray-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] font-mono"
          />

          <button
            type="submit"
            disabled={(!inputPrompt.trim() && !selectedImage) || isAiLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
