import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Shield,
  KeyRound,
  User as UserIcon,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Crown,
  Laptop,
  Users,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Radio,
  LogIn,
} from 'lucide-react';
import { User } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    signupUser,
    signInWithGoogle,
    users,
    currentUser,
    switchUserQuick,
  } = useApp();

  // Mode: 'login' | 'signup' | 'profiles_menu'
  const [profileSearch, setProfileSearch] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const authMode = authModalMode || 'login';
  const setAuthMode = (mode: 'login' | 'signup' | 'profiles_menu') => {
    setAuthModalMode(mode);
  };

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        if (!username.trim()) {
          setErrorText('Please specify a technician username or email.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorText('Password must contain at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const res = await signupUser(username, password, displayName);
        if (!res.success) {
          setErrorText(res.message);
        } else {
          setUsername('');
          setPassword('');
          setDisplayName('');
        }
      } else {
        if (!username.trim()) {
          setErrorText('Enter your username or email to log in.');
          setIsSubmitting(false);
          return;
        }
        const res = await loginUser(username, password);
        if (!res.success) {
          setErrorText(res.message);
        } else {
          setUsername('');
          setPassword('');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProfile = (user: User) => {
    switchUserQuick(user.id);
    setIsAuthModalOpen(false);
  };

  // Filtered users for scrollable profiles menu
  const filteredUsers = users.filter((u) => {
    if (!profileSearch.trim()) return true;
    const q = profileSearch.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.benchStation && u.benchStation.toLowerCase().includes(q)) ||
      (u.currentTask && u.currentTask.toLowerCase().includes(q)) ||
      (u.role === 'ROLE_OWNER' && 'admin owner lead instructor'.includes(q)) ||
      (u.role !== 'ROLE_OWNER' && 'worker tech student'.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-cyan-500/10 via-emerald-500/10 to-transparent pointer-events-none rounded-bl-full" />

        {/* Top Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-[#21262d] border border-[#30363d] text-cyan-400 shadow-sm">
              {authMode === 'profiles_menu' ? (
                <Users className="w-5 h-5 text-cyan-400" />
              ) : authMode === 'signup' ? (
                <Crown className="w-5 h-5 text-emerald-400" />
              ) : (
                <KeyRound className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono leading-tight">
                {authMode === 'profiles_menu'
                  ? 'Technician Profile Switcher'
                  : authMode === 'signup'
                  ? 'Technician Registration'
                  : 'TradeTech Authentication'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {authMode === 'profiles_menu'
                  ? 'Select any technician or instructor to enter their workstation session'
                  : authMode === 'signup'
                  ? 'Register a new profile in the lab database'
                  : 'Sign in to access workstation benches, lab calendar, and work orders'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1117] rounded-xl border border-[#30363d] text-xs font-mono mb-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorText('');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              authMode === 'login'
                ? 'bg-[#21262d] text-cyan-300 font-bold shadow-sm border border-[#30363d]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('profiles_menu');
              setErrorText('');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              authMode === 'profiles_menu'
                ? 'bg-[#21262d] text-emerald-300 font-bold shadow-sm border border-[#30363d]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profiles ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorText('');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              authMode === 'signup'
                ? 'bg-[#21262d] text-cyan-300 font-bold shadow-sm border border-[#30363d]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {errorText && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs font-mono text-red-200 flex items-center gap-2 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* MODE 1: SCROLLABLE PROFILES MENU */}
        {authMode === 'profiles_menu' ? (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Search filter for profiles */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                placeholder="Filter Julian, Kylin, Jason, Tristan, Xaiver, Katrina, Bridget..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              {profileSearch && (
                <button
                  onClick={() => setProfileSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scrollable Profiles List Container */}
            <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1 max-h-[50vh]">
              {filteredUsers.map((u) => {
                const isSelected = currentUser?.id === u.id;
                const isAdmin = u.role === 'ROLE_OWNER';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectProfile(u)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                        : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 hover:bg-[#161b22]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-inner ${
                          isAdmin
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-black font-extrabold shadow-amber-950/50'
                            : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-cyan-950/50'
                        }`}
                      >
                        {isAdmin ? '👑' : u.displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono truncate">
                            {u.displayName}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${
                              isAdmin
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {isAdmin ? 'Master Admin' : 'Worker'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 truncate mt-0.5">
                          <span className="text-gray-300 truncate">
                            {u.benchStation || 'Station Assigned'}
                          </span>
                          {u.currentTask && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500 truncate max-w-[140px] sm:max-w-[180px]">
                                {u.currentTask}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Select Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-bold px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-[#21262d] group-hover:bg-cyan-600 group-hover:text-white text-gray-400 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-6 text-xs font-mono text-gray-400 bg-[#0d1117] rounded-xl border border-dashed border-[#30363d]">
                  No profiles match &quot;{profileSearch}&quot;
                </div>
              )}
            </div>

            {/* Bottom Actions for Profiles Mode */}
            <div className="pt-2 border-t border-[#30363d] flex items-center justify-between flex-shrink-0 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Password Login
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* MODE 2 & 3: STANDARD LOGIN / REGISTRATION FORM */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Quick Profile Switcher Banner Button (Prominent Callout) */}
            <button
              type="button"
              onClick={() => setAuthMode('profiles_menu')}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/50 via-[#16233b] to-emerald-950/50 hover:from-cyan-900/60 hover:to-emerald-900/60 border border-cyan-500/40 text-left transition-all shadow-md group flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <span>Quick Profile Picker</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {users.length} Available
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 font-mono truncate">
                    Julian (Admin), Kylin, Jason, Tristan, Xaiver, Remington, Katrina, Bridget...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>Browse</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Google Sign-In */}
            <div>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold font-mono tracking-wide shadow-md border border-gray-200 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.01]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google (Firebase)</span>
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#30363d]" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase">
                  <span className="bg-[#161b22] px-2 text-gray-500">or manual credentials</span>
                </div>
              </div>
            </div>

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-gray-300 mb-1">Full Name / Technician Title</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Julian, Lead Tech"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-1">Technician Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. julian, kylin, or jason"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Password {authMode === 'signup' && <span className="text-gray-500">(min 6 characters)</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : authMode === 'signup'
                    ? 'Create Account in Database'
                    : 'Authenticate & Enter Lab'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full py-2 px-3 rounded-xl bg-[#0d1117] hover:bg-[#21262d] text-gray-400 hover:text-gray-200 text-xs transition-colors border border-[#30363d] flex items-center justify-center gap-1.5"
              >
                <span>Continue as Guest Session</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
