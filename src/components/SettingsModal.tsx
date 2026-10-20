import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeMode } from '../types';
import {
  Settings,
  Sun,
  Moon,
  Sparkles,
  Compass,
  Palette,
  CheckCircle2,
  X,
  Eye,
  Sliders,
  Laptop,
  Monitor,
  Info,
} from 'lucide-react';

interface ThemeIdea {
  id: string;
  name: string;
  tagline: string;
  colors: string[];
  vibe: string;
}

const EXTRA_THEME_IDEAS: ThemeIdea[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077 Neon',
    tagline: 'Deep Obsidian with Hot Pink Neon & Electric Cyan',
    colors: ['#09090b', '#ec4899', '#06b6d4', '#facc15'],
    vibe: 'High-octane night-shift bench vibes with neon glowing wireframes.',
  },
  {
    id: 'amber_crt',
    name: 'Amber CRT Terminal (DEC VT220)',
    tagline: 'Warm Phosphorus Amber on Pitch Black Tube',
    colors: ['#0c0800', '#ffb000', '#cc8800', '#ffe066'],
    vibe: 'Authentic 1982 mainframe terminal aesthetic with zero blue-light fatigue.',
  },
  {
    id: 'matrix_green',
    name: 'Matrix Hacker Green (IBM 5151)',
    tagline: 'P1 Phosphor Green on Pure Carbon',
    colors: ['#000000', '#22c55e', '#15803d', '#86efac'],
    vibe: 'Classic CompTIA command line and Unix terminal nostalgia.',
  },
  {
    id: 'whiteboard',
    name: 'Clean Technical Whiteboard',
    tagline: 'Crisp Dry-Erase White with Marker Blue & Red Accents',
    colors: ['#ffffff', '#0284c7', '#dc2626', '#1e293b'],
    vibe: 'Engineered specifically for classroom smartboards and laser projectors.',
  },
  {
    id: 'solarized_dark',
    name: 'Solarized Dark Precision',
    tagline: 'Ethan Schoonover Scientific Color Balance',
    colors: ['#002b36', '#2aa198', '#b58900', '#859900'],
    vibe: 'Mathematically designed color palette for 8-hour schematic analysis.',
  },
  {
    id: 'ocean_sub',
    name: 'Deep Ocean Submarine',
    tagline: 'Abyssal Navy with Sonar Green & Bioluminescent Cyan',
    colors: ['#030712', '#0ea5e9', '#10b981', '#1e3a8a'],
    vibe: 'Calm, submarine command center aesthetic for complex board diagnostics.',
  },
  {
    id: 'monokai',
    name: 'Stealth Monokai Pro',
    tagline: 'Dark Titanium with Pastel Coral, Mint & Yellow',
    colors: ['#1e1f22', '#f43f5e', '#a3e635', '#38bdf8'],
    vibe: 'Familiar and beloved palette from code editors and syntax highlighters.',
  },
  {
    id: 'blueprint',
    name: 'Draftsman Blueprint Cyan',
    tagline: 'Architectural Blueprint Navy with Crisp White Ink',
    colors: ['#003366', '#38bdf8', '#ffffff', '#0284c7'],
    vibe: 'Looks like a genuine CAD mechanical drawing or motherboard schematic.',
  },
  {
    id: 'synthwave',
    name: 'Sunset Synthwave 1984',
    tagline: 'Neon Violet Gradient, Sunset Orange & Gridlines',
    colors: ['#1a0826', '#a855f7', '#f97316', '#ec4899'],
    vibe: '80s vocational electronics lab inspired by classic hardware synths.',
  },
  {
    id: 'eink',
    name: 'Minimalist E-Ink Monochrome',
    tagline: 'Zero Color Distraction: True Paper Black & White',
    colors: ['#fafafa', '#000000', '#52525b', '#e4e4e7'],
    vibe: 'Maximum readability in direct sunlight or heavy classroom glare.',
  },
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    themeMode,
    setThemeMode,
    startTour,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appearance' | 'tour' | 'ideation'>('appearance');

  if (!isSettingsModalOpen) return null;

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    addToast({
      type: 'info',
      title: 'Theme Applied',
      message: `Active display mode set to: ${
        mode === 'high_contrast_light' ? 'High Contrast Light' : 'Dark Industrial'
      }.`,
    });
  };

  const handleRestartTour = () => {
    setIsSettingsModalOpen(false);
    startTour();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="bg-[#111620] border border-[#232d3f] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl font-mono text-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 py-3.5 bg-[#161d2b] border-b border-[#232d3f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Website Settings & Themes
              </h3>
              <p className="text-[11px] text-gray-400">
                TradeTech Vocational Suite • Display themes and interactive onboarding
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg bg-[#0d121c] hover:bg-[#20293a] border border-[#232d3f] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#0b0e14] border-b border-[#232d3f] shrink-0">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'appearance'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Active Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('ideation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'ideation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>10 Extra Theme Concepts</span>
          </button>

          <button
            onClick={() => setActiveTab('tour')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tour'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Tour</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* TAB 1: ACTIVE THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Active Display Themes
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Choose the color mode suited for your current workstation environment. Settings are saved to your browser automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Dark Industrial */}
                <div
                  onClick={() => handleSelectTheme('dark_industrial')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    themeMode === 'dark_industrial'
                      ? 'bg-[#161d2b] border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'bg-[#0d121c] border-[#232d3f] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Dark Industrial (Default)</h5>
                        <span className="text-[10px] text-gray-400">Low-Glare Cybernetic</span>
                      </div>
                    </div>
                    {themeMode === 'dark_industrial' && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className="bg-[#080c14] border border-[#232d3f] rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <div className="h-2 w-20 bg-gray-700 rounded" />
                      <div className="h-2 w-8 bg-emerald-500/60 rounded ml-auto" />
                    </div>
                    <div className="h-3 w-full bg-[#161d2b] rounded border border-gray-800" />
                  </div>

                  <p className="text-[10px] text-gray-400 mt-2.5">
                    Deep charcoal slate with cyan/emerald LED status glows. Designed for computer lab bench stations with minimal eye strain.
                  </p>
                </div>

                {/* 2. High Contrast Light */}
                <div
                  onClick={() => handleSelectTheme('high_contrast_light')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    themeMode === 'high_contrast_light'
                      ? 'bg-slate-100 border-blue-600 ring-2 ring-blue-500/30 text-gray-900'
                      : 'bg-[#0d121c] border-[#232d3f] hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-400 text-blue-700 flex items-center justify-center">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-inherit">High Contrast Light</h5>
                        <span className="text-[10px] opacity-75">Bright Classroom / Projector</span>
                      </div>
                    </div>
                    {themeMode === 'high_contrast_light' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className="bg-white border border-gray-300 rounded-lg p-2.5 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <div className="h-2 w-20 bg-gray-400 rounded" />
                      <div className="h-2 w-8 bg-emerald-600 rounded ml-auto" />
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded border border-gray-300" />
                  </div>

                  <p className="text-[10px] opacity-80 mt-2.5">
                    Clean high-contrast background with deep slate typography and bold accents. Perfect for classrooms with fluorescent lighting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 10 EXTRA THEME CONCEPTS */}
          {activeTab === 'ideation' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-[#0d1117] p-3.5 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>10 Conceptual Theme Colorways for FETC</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Here are 10 custom visual themes tailored for vocational hardware labs. Tell us which one you’d like implemented next and we will activate it in the suite!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXTRA_THEME_IDEAS.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#0d121c] border border-[#232d3f] space-y-2 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        #{idx + 1}. {item.name}
                      </span>
                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1">
                        {item.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-cyan-300 font-mono">{item.tagline}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.vibe}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE TOUR */}
          {activeTab === 'tour' && (
            <div className="space-y-4">
              <div className="bg-[#0d121c] p-4 rounded-xl border border-[#232d3f] space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Onboarding Tour
                  </h4>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  The interactive spotlight walkthrough grays out the background and highlights each key section of the website step-by-step: the 6 vocational suites, ComLab digital twin, AI photo autofill, technician duty roles, and settings.
                </p>

                <div className="p-3 bg-[#161d2b] rounded-lg border border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Tour Status on this Browser:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Saved to LocalStorage
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRestartTour}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
                >
                  <Compass className="w-4 h-4" />
                  <span>Start / Replay Interactive Tour Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#161d2b] border-t border-[#232d3f] flex items-center justify-between shrink-0">
          <span className="text-[10px] text-gray-500 font-mono">
            TradeTech Engine v2.4 • Fred W. Eberle Technical Center
          </span>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
