import React, { useState } from 'react';
import { useApp, AppTab } from '../context/AppContext';
import {
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
  Terminal,
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
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode; requiresOwner?: boolean }[] = [
    {
      tab: 'diagnostic',
      label: 'Diagnostic Engine',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      tab: 'reference',
      label: 'Bench Reference Suite',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      tab: 'gemini',
      label: 'Gemini AI Assistant',
      icon: <Bot className="w-4 h-4" />,
    },
    {
      tab: 'calendar',
      label: 'Lab Calendar & Projects',
      icon: <Calendar className="w-4 h-4" />,
      requiresOwner: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Diagnostic Pulse */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#161b22] border border-[#30363d] shadow-inner text-[#38bdf8]">
            <Terminal className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ea043] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2ea043]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-tight text-white text-base lg:text-lg">
                TradeTech <span className="text-[#38bdf8]">Bench Assistant</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b22] text-[#2ea043] border border-[#2ea043]/30 font-medium">
                v1.0 COMPTIA
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span>
                Lab Station Active
              </span>
              <span className="text-gray-600">•</span>
              <span className="hidden md:inline font-mono text-gray-400">
                LGA1700 / AM5 / ATX 3.1
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tab Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#161b22] border border-[#30363d] rounded-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d]/80 text-[#38bdf8]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]/50'
                }`}
              >
                <span className={isActive ? 'text-[#38bdf8]' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {item.requiresOwner && (
                  <span
                    className={`ml-1 flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isOwner
                        ? 'bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/40'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                    title={isOwner ? 'Lead Tech Access Granted' : 'Requires Lead Tech / Owner Role'}
                  >
                    {isOwner ? <ShieldCheck className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    {isOwner ? 'OWNER' : 'LOCK'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Top-Right Auth Corner */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-gray-500 text-left transition-all group"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isOwner
                      ? 'bg-gradient-to-br from-[#2ea043] to-[#238636] text-white shadow-sm'
                      : 'bg-gradient-to-br from-[#38bdf8] to-blue-700 text-white'
                  }`}
                >
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-gray-200 group-hover:text-white flex items-center gap-1.5">
                    <span>{currentUser.displayName.split(' ')[0]}</span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isOwner
                          ? 'bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/30'
                          : 'bg-blue-500/20 text-[#38bdf8] border border-blue-500/30'
                      }`}
                    >
                      {isOwner ? 'OWNER' : 'TECH'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono leading-none truncate max-w-[120px]">
                    {currentUser.benchStation || 'Bench Tech'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200 transition-transform" />
              </button>

              {/* User Dropdown */}
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
                      Role: {isOwner ? 'ROLE_OWNER (Instructor)' : 'ROLE_STUDENT (Bench Tech)'}
                    </div>
                  </div>

                  <div className="py-1">
                    <p className="px-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Quick Switch Profile:
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
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2 pt-2 border-t border-[#30363d]">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium rounded-lg ${
                isActive ? 'text-[#38bdf8] bg-[#161b22]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.requiresOwner && !isOwner && (
                  <Lock className="w-2 h-2 text-amber-400 absolute -top-1 -right-1" />
                )}
              </div>
              <span className="truncate max-w-[70px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
