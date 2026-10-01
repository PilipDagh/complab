import React, { useState, useEffect } from 'react';
import { useApp, AppTab } from '../context/AppContext';
import { CommandPaletteModal } from './CommandPaletteModal';
import { INITIAL_PARTS_INVENTORY } from '../data/shopManagementDatabase';
import {
  Terminal,
  Activity,
  Cpu,
  BookOpen,
  Bot,
  Calendar,
  Lock,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Network,
  GraduationCap,
  LayoutGrid,
  HardDrive,
  Search,
  QrCode,
  Sliders,
  Check,
  Package,
  Menu,
  X,
  Boxes,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isOwner,
    logoutUser,
    users,
    switchUserQuick,
    setIsAuthModalOpen,
    setIsScannerModalOpen,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // The 6 Vocational Engineering Modules
  const MODULES_LIST: {
    tab: AppTab;
    number: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      tab: 'board_triage',
      number: '01',
      label: 'Board-Level Triage',
      shortLabel: 'Board Triage',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/60 text-cyan-300 bg-cyan-950/40',
    },
    {
      tab: 'networking',
      number: '02',
      label: 'Network & SysAdmin',
      shortLabel: 'Network & CLI',
      icon: <Network className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/60 text-sky-300 bg-sky-950/40',
    },
    {
      tab: 'vocational',
      number: '03',
      label: 'CompTIA Certification',
      shortLabel: 'CompTIA Study',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/60 text-emerald-300 bg-emerald-950/40',
    },
    {
      tab: 'lab_management',
      number: '04',
      label: 'Lab Floor Operations',
      shortLabel: 'Lab Floor',
      icon: <LayoutGrid className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/60 text-amber-300 bg-amber-950/40',
    },
    {
      tab: 'forensics',
      number: '05',
      label: 'Forensic & Firmware Lab',
      shortLabel: 'Forensics',
      icon: <HardDrive className="w-4 h-4 text-teal-400" />,
      color: 'border-teal-500/60 text-teal-300 bg-teal-950/40',
    },
    {
      tab: 'signals',
      number: '06',
      label: 'Signals & Oscilloscope',
      shortLabel: 'Signals & Scopes',
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/60 text-indigo-300 bg-indigo-950/40',
    },
  ];

  const isModuleTab = MODULES_LIST.some((m) => m.tab === activeTab);
  const activeModuleItem = MODULES_LIST.find((m) => m.tab === activeTab);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] transition-all">
        {/* Tier 1: Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setActiveTab('board_triage')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#161b22] border border-[#30363d] shadow-sm text-[#38bdf8] group-hover:border-cyan-500/50 transition-colors">
                <Terminal className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ea043] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ea043]"></span>
                </span>
              </div>

              <div>
                <div className="font-mono font-bold tracking-tight text-white text-sm lg:text-base leading-none flex items-center gap-1.5">
                  <span>TradeTech</span>
                  <span className="text-[#38bdf8]">Bench</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span>
                  <span className="text-gray-400">Lab Station Active</span>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Primary Navigation Links (Clean, Spacious, Zero-Wrapping) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-xl text-xs font-medium font-sans">
            {/* 1. Modules Dropdown / Active Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isModuleTab) {
                    setActiveTab('board_triage');
                  }
                  setShowModulesDropdown(!showModulesDropdown);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isModuleTab
                    ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-cyan-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {activeModuleItem ? `${activeModuleItem.number}. ${activeModuleItem.shortLabel}` : 'Bench Modules'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* Modules Dropdown Popover */}
              {showModulesDropdown && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowModulesDropdown(false)}
                >
                  <div className="px-2.5 py-1.5 border-b border-[#30363d] mb-1">
                    <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                      Vocational Modules (1–6)
                    </p>
                  </div>
                  <div className="space-y-1">
                    {MODULES_LIST.map((mod) => (
                      <button
                        key={mod.tab}
                        onClick={() => {
                          setActiveTab(mod.tab);
                          setShowModulesDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                          activeTab === mod.tab
                            ? 'bg-[#21262d] text-white font-semibold'
                            : 'text-gray-300 hover:bg-[#21262d]/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {mod.icon}
                          <span>
                            {mod.number}. {mod.label}
                          </span>
                        </div>
                        {activeTab === mod.tab && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Diagnostic Wizard */}
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'diagnostic'
                  ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Wizard</span>
            </button>

            {/* 3. Bench Reference */}
            <button
              onClick={() => setActiveTab('reference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'reference'
                  ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-purple-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Reference</span>
            </button>

            {/* 4. Gemini AI Assistant */}
            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'gemini'
                  ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-emerald-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Copilot</span>
            </button>

            {/* 5. PC Parts Inventory Direct Link */}
            <button
              onClick={() => setActiveTab('lab_management')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'lab_management'
                  ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-amber-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Parts</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {INITIAL_PARTS_INVENTORY.length}
              </span>
            </button>

            {/* 6. Lab Calendar (Owner Only) */}
            {isOwner && (
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d] text-amber-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Calendar</span>
              </button>
            )}
          </nav>

          {/* Right: Quick Command Search + QR Scanner + User Profile + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Quick Command Search Button (Cmd+K) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs text-gray-400 hover:text-gray-200 transition-colors"
              title="Search tools and diagnostics (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-sans">Search tools...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/50 border border-gray-700 text-gray-400">
                ⌘K
              </kbd>
            </button>

            {/* Quick QR Scanner Trigger Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs text-gray-300 transition-colors"
              title="Scan Asset QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] font-sans">QR Scan</span>
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-gray-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Top-Right Auth Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-gray-500 text-left transition-all"
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      isOwner
                        ? 'bg-gradient-to-br from-[#2ea043] to-[#238636] text-white shadow-sm'
                        : 'bg-gradient-to-br from-[#38bdf8] to-blue-700 text-white'
                    }`}
                  >
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs font-medium text-gray-200 block leading-tight">
                      {currentUser.displayName.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* User Profile Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#30363d] mb-1">
                      <p className="text-xs font-semibold text-white">{currentUser.displayName}</p>
                      <p className="text-[11px] text-gray-400 font-mono truncate">@{currentUser.username}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3 h-3" />
                        Role: {isOwner ? 'Lead Instructor (Owner)' : 'Bench Tech (Student)'}
                      </div>
                    </div>

                    <div className="py-1">
                      <p className="px-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                        Switch Profile:
                      </p>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => switchUserQuick(u.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-[#21262d] text-white font-medium'
                              : 'text-gray-300 hover:bg-[#21262d]/50'
                          }`}
                        >
                          <span className="truncate">{u.displayName}</span>
                          <span
                            className={`text-[9px] font-mono px-1 rounded ${
                              u.role === 'ROLE_OWNER' ? 'text-[#2ea043]' : 'text-[#38bdf8]'
                            }`}
                          >
                            {u.role === 'ROLE_OWNER' ? 'Owner' : 'Student'}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-[#30363d] pt-1 mt-1">
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        Switch / Register Account
                      </button>
                      <button
                        onClick={logoutUser}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#161b22] border-b border-[#30363d] px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              Bench Diagnostic Tools
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveTab('diagnostic');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left ${
                  activeTab === 'diagnostic'
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Wizard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reference');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left ${
                  activeTab === 'reference'
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Reference</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('gemini');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left ${
                  activeTab === 'gemini'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>AI Copilot</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('lab_management');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left ${
                  activeTab === 'lab_management'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>Parts ({INITIAL_PARTS_INVENTORY.length})</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                    activeTab === 'calendar'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Lab Calendar & Daily Activity</span>
                </button>
              )}
            </div>

            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider pt-2 border-t border-gray-800">
              Vocational Engineering Modules (1–6)
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {MODULES_LIST.map((mod) => (
                <button
                  key={mod.tab}
                  onClick={() => {
                    setActiveTab(mod.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    activeTab === mod.tab
                      ? `${mod.color} border font-bold`
                      : 'bg-gray-900/60 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mod.icon}
                    <span>{mod.number}. {mod.label}</span>
                  </div>
                  {activeTab === mod.tab && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tier 2: Dedicated Bench Modules Sub-Nav Strip (Visible when in any module or on desktop) */}
        <div className="border-t border-[#30363d]/80 bg-[#0d1117] px-4 lg:px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mr-2 hidden xl:inline flex-shrink-0">
              Diagnostic Suites:
            </span>
            {MODULES_LIST.map((mod) => {
              const isActive = activeTab === mod.tab;
              return (
                <button
                  key={mod.tab}
                  onClick={() => setActiveTab(mod.tab)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? `${mod.color} border shadow-sm font-semibold`
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22] border border-transparent'
                  }`}
                >
                  {mod.icon}
                  <span>
                    <span className="font-mono text-[10px] opacity-75 mr-1">{mod.number}.</span>
                    {mod.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};
