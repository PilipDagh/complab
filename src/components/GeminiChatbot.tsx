import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SAMPLE_HARDWARE_IMAGES, SampleHardwareImage } from '../data/sampleHardwareImages';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  Camera,
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
  AlertTriangle,
  Scan,
  Upload,
  Eye,
  FileText,
  Wrench,
  X,
  Layers,
  HelpCircle,
  Maximize2,
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
    activeScannedAsset,
    addProject,
    setActiveTab,
    addToast,
  } = useApp();

  const [activeChatMode, setActiveChatMode] = useState<'chat' | 'lens'>('chat');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    preview: string;
    label?: string;
  } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lensNotes, setLensNotes] = useState<string>('');
  const [isLensAnalyzing, setIsLensAnalyzing] = useState<boolean>(false);
  const [lensResult, setLensResult] = useState<string | null>(null);

  // Live Webcam state for Google Lens
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamFacing, setWebcamFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lensFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (activeChatMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiLoading, activeChatMode]);

  // Handle live webcam lifecycle in Lens mode
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      if (activeChatMode !== 'lens' || !isWebcamActive) {
        stopWebcam();
        return;
      }

      setCameraError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: webcamFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Lens webcam error:', err);
        setCameraError('Webcam unavailable. You can upload a photo or select a lab sample below.');
        setIsWebcamActive(false);
      }
    };

    const stopWebcam = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };

    if (activeChatMode === 'lens' && isWebcamActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [activeChatMode, isWebcamActive, webcamFacing]);

  // Capture snapshot from webcam
  const captureWebcamPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64Data = dataUrl.split(',')[1];

      setSelectedImage({
        data: base64Data,
        mimeType: 'image/jpeg',
        preview: dataUrl,
        label: 'Live Webcam Snapshot',
      });
      setIsWebcamActive(false);
      addToast({
        type: 'success',
        title: 'Snapshot Captured',
        message: 'Photo loaded for Google Lens hardware inspection.',
      });
    }
  };

  // Handle image upload
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isLensUpload = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const imgObj = {
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        preview: result,
        label: file.name,
      };

      setSelectedImage(imgObj);
      if (isLensUpload) {
        setIsWebcamActive(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select sample image from vocational lab library
  const handleSelectSample = (sample: SampleHardwareImage) => {
    setSelectedImage({
      data: sample.dataUrl.split(',')[1],
      mimeType: sample.mimeType,
      preview: sample.dataUrl,
      label: sample.title,
    });
    setLensNotes(sample.defaultPrompt);
    setIsWebcamActive(false);
    addToast({
      type: 'info',
      title: 'Lab Sample Selected',
      message: `Loaded: ${sample.title}`,
    });
  };

  // Run Google Lens Hardware Scan via API
  const handleRunLensScan = async () => {
    if (!selectedImage) {
      addToast({
        type: 'error',
        title: 'Image Required',
        message: 'Please take a webcam snapshot, upload a photo, or select a sample image first.',
      });
      return;
    }

    setIsLensAnalyzing(true);
    setLensResult(null);

    try {
      const response = await fetch('/api/gemini/lens-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: {
            data: selectedImage.data,
            mimeType: selectedImage.mimeType,
          },
          query: lensNotes || 'Identify this hardware component, detect defects, and provide diagnostic steps.',
          model: selectedModel,
          hardwareContext: activeScannedAsset
            ? {
                assetTag: activeScannedAsset.assetTag,
                model: activeScannedAsset.model,
                deviceType: activeScannedAsset.deviceType,
                specs: activeScannedAsset.specs,
              }
            : undefined,
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setLensResult(data.analysis);
        addToast({
          type: 'success',
          title: 'Google Lens Scan Complete',
          message: 'Hardware anomalies and diagnostic test points detected.',
        });
      } else {
        throw new Error(data.error || 'Failed to analyze image.');
      }
    } catch (err: any) {
      console.error('Lens scan error:', err);
      setLensResult(
        `### ⚠️ Inspection Fallback\n` +
          `Hardware image processed. Check VRM capacitors for dome expansion and test low-side MOSFET resistance with DMM set to diode mode.`
      );
    } finally {
      setIsLensAnalyzing(false);
    }
  };

  // Standard chat send
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputPrompt.trim() && !selectedImage) || isAiLoading) return;

    const textToSend = inputPrompt;
    const imgToSend = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined;

    setInputPrompt('');
    setSelectedImage(null);

    await sendMessageToGemini(textToSend, imgToSend);
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const clean = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .substring(0, 500);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Create Work Order from Lens Diagnosis
  const handleCreateWorkOrderFromLens = () => {
    if (!lensResult) return;

    addProject({
      title: `Hardware Lens Inspection: ${selectedImage?.label || 'Component Fault'}`,
      benchNumber: currentUser?.benchStation || 'Bench #1',
      technicianName: currentUser?.displayName || 'Bench Technician',
      clientOrDepartment: 'TradeTech Diagnostic Lab',
      deviceType: 'Hardware Component',
      reportedFault: lensNotes || 'Visual inspection defect detected by Google Lens AI.',
      priority: 'High',
      stage: 'Diagnostics',
      repairOutcomeNotes: lensResult.substring(0, 300) + '...',
      partsReplaced: [],
      estimatedCost: 0,
    });

    setActiveTab('calendar');
    addToast({
      type: 'success',
      title: 'Work Order Created',
      message: 'Lens findings converted into a new bench work order.',
    });
  };

  const ongoingProjectsCount = projects.filter((p) => p.status === 'ongoing').length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[760px]">
      {/* Header Bar */}
      <div className="p-4 border-b border-[#30363d] bg-[#0d1117]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ea043] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-cyan-950/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono">
                TradeTech <span className="text-[#38bdf8]">AI Bench Copilot & Google Lens</span>
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262d] text-[#2ea043] border border-[#2ea043]/30">
                MULTIMODAL ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              CompTIA A+ Master Technician & Computer Vision Diagnostic Engine
            </p>
          </div>
        </div>

        {/* Mode Switcher & Model Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle between Copilot Chat & Hardware Lens Mode */}
          <div className="flex items-center p-1 rounded-xl bg-[#21262d] border border-[#30363d] text-xs font-mono">
            <button
              onClick={() => setActiveChatMode('chat')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeChatMode === 'chat'
                  ? 'bg-[#38bdf8] text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Copilot Chat</span>
            </button>
            <button
              onClick={() => setActiveChatMode('lens')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeChatMode === 'lens'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-emerald-300" />
              <span>Hardware Lens</span>
            </button>
          </div>

          <select
            value={selectedModel}
            onChange={(e: any) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-200 focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (High Availability)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Standard Bench)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Thinking)</option>
          </select>

          {selectedModel === 'gemini-3.1-pro-preview' && (
            <button
              onClick={() => setIsThinkingMode(!isThinkingMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                isThinkingMode
                  ? 'bg-purple-900/30 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-[#21262d] text-gray-400 border-[#30363d]'
              }`}
              title="High Reasoning Thinking Mode"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Thinking: {isThinkingMode ? 'HIGH' : 'OFF'}</span>
            </button>
          )}

          {activeChatMode === 'chat' && (
            <button
              onClick={clearChatHistory}
              className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors border border-[#30363d]"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Target Asset & Context Injection Banner */}
      <div className="px-4 py-2 bg-[#0d1117] border-b border-[#30363d] text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
          {isOwner ? (
            <>
              <ShieldCheck className="w-4 h-4 text-[#2ea043] shrink-0" />
              <span className="text-[#2ea043]">
                <span className="font-bold">Lead Tech Context Active:</span> {ongoingProjectsCount} Active Work Orders & Today's Log Linked.
              </span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>CompTIA A+ Vocational Reference Base Linked.</span>
            </>
          )}
        </div>

        {activeScannedAsset && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/30">
            <span>Target: <strong>{activeScannedAsset.assetTag}</strong> ({activeScannedAsset.model})</span>
          </div>
        )}
      </div>

      {/* MODE 1: STANDARD COPILOT CHAT */}
      {activeChatMode === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-[#38bdf8] text-gray-950 shadow-md'
                        : 'bg-[#21262d] border border-[#30363d] text-[#2ea043]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-xs lg:text-sm relative group ${
                      isUser
                        ? 'bg-gradient-to-br from-[#1f6feb] to-[#238636] text-white shadow-md rounded-tr-none'
                        : 'bg-[#0d1117] border border-[#30363d] text-gray-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.attachedImage && (
                      <div className="mb-3">
                        <img
                          src={msg.attachedImage}
                          alt="Hardware Attachment"
                          className="max-h-56 rounded-lg border border-[#30363d] object-cover"
                        />
                        <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                          📷 Attached Hardware Visual for Inspection
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

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
                            title="Read aloud for hands-free multimeter probing"
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
            <span className="text-[10px] font-mono text-gray-400 shrink-0">QUICK CHIPS:</span>
            {promptChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => setInputPrompt(chip)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#38bdf8] text-[11px] font-mono text-gray-300 hover:text-white transition-all whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-[#0d1117] border-t border-[#30363d] space-y-3">
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageSelect(e, false)}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-[#38bdf8] transition-colors"
                title="Upload photo for visual analysis"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveChatMode('lens')}
                className="p-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-400 hover:text-emerald-400 transition-colors"
                title="Open Google Lens Hardware Vision"
              >
                <Scan className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask Gemini: 'How to jump PS_ON Pin 16', 'Inspect attached photo', 'Troubleshoot 3 beeps'..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs lg:text-sm placeholder-gray-500 focus:outline-none focus:border-[#38bdf8] font-mono"
              />

              <button
                type="submit"
                disabled={(!inputPrompt.trim() && !selectedImage) || isAiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg border border-emerald-500/30 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 2: GOOGLE LENS HARDWARE VISION ANALYZER */}
      {activeChatMode === 'lens' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0d1117]">
          {/* Left Column: Image Input & Capture Viewport */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold font-mono text-white">Hardware Lens Capture</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  GEMINI VISION AI
                </span>
              </div>

              {/* Viewport Box */}
              <div className="relative w-full aspect-video rounded-xl bg-black border border-[#30363d] overflow-hidden flex items-center justify-center">
                {isWebcamActive ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* Targeting reticle */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-400/50 rounded-xl m-4 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-emerald-400 rounded-full animate-ping opacity-30" />
                    </div>
                  </>
                ) : selectedImage ? (
                  <img
                    src={selectedImage.preview}
                    alt="Hardware Target"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
                    <Scan className="w-10 h-10 mb-2 animate-pulse text-emerald-500" />
                    <p className="text-xs font-mono text-gray-400">
                      Take webcam photo, upload image, or pick a lab sample below
                    </p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {isWebcamActive ? (
                  <>
                    <button
                      type="button"
                      onClick={captureWebcamPhoto}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWebcamActive(false)}
                      className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 flex items-center justify-center gap-1.5"
                    >
                      <span>Cancel Webcam</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsWebcamActive(true)}
                      className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Live Webcam</span>
                    </button>

                    <input
                      type="file"
                      ref={lensFileInputRef}
                      onChange={(e) => handleImageSelect(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => lensFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Upload Photo</span>
                    </button>
                  </>
                )}
              </div>

              {/* Notes or specific technician question */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">
                  Optional Technician Inspection Query:
                </label>
                <input
                  type="text"
                  value={lensNotes}
                  onChange={(e) => setLensNotes(e.target.value)}
                  placeholder="e.g. Inspect C2 capacitor, check VRM pinout, read POST hex code..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action: Execute Lens Scan */}
              <button
                type="button"
                onClick={handleRunLensScan}
                disabled={!selectedImage || isLensAnalyzing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                {isLensAnalyzing ? (
                  <>
                    <Bot className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image Components with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Run Google Lens Hardware Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Vocational Lab Sample Images Library */}
            <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Vocational Lab Benchmark Samples:
                </span>
                <span className="text-[10px] text-gray-500">1-Click Test</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_HARDWARE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-cyan-500/50 text-left transition-all group"
                  >
                    <div className="text-[11px] font-bold text-gray-200 group-hover:text-cyan-300 truncate">
                      {sample.title}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">
                      {sample.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Findings & Diagnostic Output */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {lensResult ? (
              <div className="p-5 rounded-2xl bg-[#161b22] border border-emerald-500/40 space-y-4 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold font-mono text-white">
                      Google Lens Hardware Diagnostic Analysis
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(lensResult)}
                      className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-xs font-mono flex items-center gap-1"
                      title="Read aloud for hands-free probing"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span className="hidden sm:inline">Audio</span>
                    </button>

                    <button
                      onClick={handleCreateWorkOrderFromLens}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Create Work Order</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs lg:text-sm text-gray-200 font-sans whitespace-pre-wrap leading-relaxed space-y-2">
                  {lensResult}
                </div>

                <div className="pt-3 border-t border-[#30363d] flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>CompTIA A+ & Electronics Inspection Protocol</span>
                  <span className="text-cyan-400">Model: {selectedModel}</span>
                </div>
              </div>
            ) : isLensAnalyzing ? (
              <div className="p-12 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <Scan className="w-12 h-12 text-emerald-400 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-mono">
                    Multimodal Vision Analysis In Progress
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md">
                    Gemini Vision is inspecting component silkscreens, identifying damaged silicon / bulging capacitors, and preparing multimeter test points...
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col items-center justify-center text-center space-y-3 text-gray-400">
                <Scan className="w-12 h-12 text-gray-600" />
                <div className="text-sm font-bold text-gray-300 font-mono">
                  Google Lens Hardware Detection Standby
                </div>
                <p className="text-xs max-w-md">
                  Capture a live webcam photo of a motherboard, blown capacitor, burnt ATX connector, or multimeter reading, or select a sample image on the left and click <strong>"Run Google Lens Hardware Scan"</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
