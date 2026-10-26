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
  Users,
  Tag,
  Clock,
  Monitor,
  Settings,
  Wrench,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    enterComLab,
    currentUser,
    isOwner,
    logoutUser,
    users,
    switchUserQuick,
    setIsAuthModalOpen,
    openAuthModal,
    hardwareAssets,
    timeClockEntries,
    setIsScannerModalOpen,
    setIsSettingsModalOpen,
    toolsAndSupplies,
    qualityInspections,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const [showMoreToolsDropdown, setShowMoreToolsDropdown] = useState(false);
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

  const ALL_NAVIGATION_TABS: {
    tab: AppTab;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
    tourId?: string;
  }[] = [
    {
      tab: 'board_triage',
      label: 'Board-Level Triage',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
      tourId: 'tour-modules',
    },
    {
      tab: 'networking',
      label: '02. Network & SysAdmin',
      icon: <Network className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      tab: 'vocational',
      label: '03. CompTIA Certification',
      icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      tab: 'lab_management',
      label: '04. Lab Floor Operations',
      icon: <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      tab: 'forensics',
      label: '05. Forensic & Firmware Lab',
      icon: <HardDrive className="w-3.5 h-3.5 text-teal-400" />,
    },
    {
      tab: 'signals',
      label: '06. Signals & Oscilloscope',
      icon: <Activity className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      tab: 'diagnostic',
      label: 'Diagnostic Wizard',
      icon: <Cpu className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      tab: 'gemini',
      label: 'AI Copilot',
      icon: <Bot className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      tab: 'assets',
      label: 'Hardware Assets',
      icon: <Tag className="w-3.5 h-3.5 text-teal-400" />,
      tourId: 'tour-assets',
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
          {hardwareAssets.length}
        </span>
      ),
    },
    {
      tab: 'time_clock',
      label: 'Time Clock',
      icon: <Clock className="w-3.5 h-3.5 text-emerald-400" />,
      badge: currentUser?.clockedIn ? (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Clocked In"></span>
      ) : undefined,
    },
    {
      tab: 'tools',
      label: 'Tools & Supplies',
      icon: <Wrench className="w-3.5 h-3.5 text-amber-400" />,
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {toolsAndSupplies.length}
        </span>
      ),
    },
    {
      tab: 'quality',
      label: 'Quality Ensurer',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      badge: (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {qualityInspections.length}
        </span>
      ),
    },
    {
      tab: 'comlab',
      label: 'ComLab Aerial Twin',
      icon: <Monitor className="w-3.5 h-3.5 text-cyan-400" />,
      tourId: 'tour-comlab',
      badge: <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>,
    },
    {
      tab: 'manual',
      label: 'Field Manual',
      icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
      tourId: 'tour-manual',
    },
    {
      tab: 'reference',
      label: 'Bench Reference',
      icon: <BookOpen className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      tab: 'calendar',
      label: 'Lab Calendar',
      icon: <Calendar className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] transition-all">
        {/* Tier 1: Main Header Bar (Matching user screenshot) */}
        <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              data-tour="tour-brand"
              onClick={() => setActiveTab('board_triage')}
              className="flex items-center gap-2.5 text-left group shrink-0"
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

          {/* Right: QR Scan + Settings + Hamburger + Profiles + Sign In */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick QR Scanner Trigger Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-200 hover:text-white transition-colors shrink-0 shadow-sm"
              title="Scan Asset QR Code"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>QR Scan</span>
            </button>

            {/* Settings & Theme Switcher Button */}
            <button
              data-tour="tour-settings"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center justify-center p-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 shadow-sm"
              title="Website Settings & Theme Switcher"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center p-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white transition-colors shrink-0 shadow-sm"
              title="Toggle Navigation Menu Drawer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Profiles Button */}
            <button
              onClick={() => openAuthModal('profiles_menu')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-mono transition-all shadow-sm group shrink-0"
              title="Switch Technician Profiles"
            >
              <Users className="w-4 h-4 text-cyan-400 group-hover:scale-105 transition-transform" />
              <span>Profiles</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                {users.length}
              </span>
            </button>

            {/* Sign In / Active User Profile */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-gray-500 text-left transition-all shadow-sm"
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
                        Role: {isOwner ? '👑 Master Admin (Lead)' : '🛠️ Workstation Tech (Worker)'}
                      </div>
                    </div>

                    <div className="py-1">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          Switch Profile:
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUserDropdown(false);
                            openAuthModal('profiles_menu');
                          }}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5"
                        >
                          <span>All ({users.length})</span>
                          <span>→</span>
                        </button>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
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
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{u.displayName}</span>
                              {u.benchStation && (
                                <span className="text-[9px] text-gray-500 font-mono">({u.benchStation.replace('Bench ', 'B')})</span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                u.role === 'ROLE_OWNER'
                                  ? 'bg-emerald-500/20 text-[#2ea043] border border-emerald-500/30'
                                  : 'bg-sky-500/20 text-[#38bdf8] border border-sky-500/30'
                              }`}
                            >
                              {u.role === 'ROLE_OWNER' ? 'Admin' : 'Worker'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#30363d] pt-1 mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserDropdown(false);
                          openAuthModal('profiles_menu');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-cyan-300 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors font-mono"
                      >
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        Browse Profiles Menu ({users.length})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserDropdown(false);
                          openAuthModal('signup');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors font-mono"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        Register New Account
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserDropdown(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-mono"
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
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Sub-Navigation Horizontal Strip (Matching user screenshot) */}
        <div className="bg-[#0b0e14] border-t border-[#30363d]/80 px-4 sm:px-6 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2 text-xs">
            {ALL_NAVIGATION_TABS.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  data-tour={item.tourId}
                  onClick={() => {
                    if (item.tab === 'comlab') {
                      enterComLab();
                    } else {
                      setActiveTab(item.tab);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-white font-semibold bg-[#161b22]/90 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 font-medium hover:bg-[#161b22]/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Menu Drawer / Quick Launcher (works when hamburger is clicked) */}
        {isMobileMenuOpen && (
          <div className="bg-[#161b22] border-b border-[#30363d] px-4 sm:px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
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
                <span>Lab Calendar & Workstation Clock-In</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('assets');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'assets'
                    ? 'bg-teal-950/40 border-teal-500/50 text-teal-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4 text-teal-400" />
                <span>Assets & Inventory Tracker ({hardwareAssets.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('time_clock');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'time_clock'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Technician Time Clock & Activity Logger</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tools');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'tools'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Tools, Supplies & Location Inventory ({toolsAndSupplies.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('quality');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'quality'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Quality Ensurer & Outbound Certs ({qualityInspections.length})</span>
              </button>

              <button
                onClick={() => {
                  enterComLab();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'comlab'
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>ComLab Status (Aerial Top-Down Grid)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('manual');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left col-span-2 ${
                  activeTab === 'manual'
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Lab Field Manual & Website Guide</span>
              </button>

              <button
                onClick={() => {
                  setIsSettingsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 hover:text-white text-xs col-span-2"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Settings & Theme Switcher</span>
              </button>

              <button
                onClick={() => {
                  openAuthModal('profiles_menu');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 text-cyan-300 hover:text-white text-xs font-mono font-bold col-span-2 shadow-sm"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Technician Profiles ({users.length} Available)</span>
              </button>
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

      </header>

      {/* Global Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};
