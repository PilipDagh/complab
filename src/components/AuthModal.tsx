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
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
    signupUser,
    users,
    switchUserQuick,
  } = useApp();

  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (isSignup) {
      if (!username.trim()) {
        setErrorText('Please specify a technician username.');
        return;
      }
      if (password.length < 6) {
        setErrorText('Password must contain at least 6 characters.');
        return;
      }
      const res = signupUser(username, password, displayName);
      if (!res.success) {
        setErrorText(res.message);
      } else {
        setUsername('');
        setPassword('');
        setDisplayName('');
      }
    } else {
      if (!username.trim()) {
        setErrorText('Enter your username to log in.');
        return;
      }
      const res = loginUser(username, password);
      if (!res.success) {
        setErrorText(res.message);
      } else {
        setUsername('');
        setPassword('');
      }
    }
  };

  const isFirstEverAccount = users.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#38bdf8]/10 via-[#2ea043]/10 to-transparent pointer-events-none rounded-bl-full"></div>

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-[#21262d] border border-[#30363d] text-[#38bdf8]">
              {isSignup ? <Crown className="w-5 h-5 text-[#2ea043]" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                {isSignup ? 'Technician Registration' : 'Bench Tech Authentication'}
              </h2>
              <p className="text-xs text-gray-400">
                {isSignup
                  ? 'Create your local vocational lab account'
                  : 'Log in to sync your diagnostic logs and bench orders'}
              </p>
            </div>
          </div>

          {/* First Account Owner Callout */}
          {isSignup && (
            <div className="mt-3 p-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <span className="font-semibold text-white">Automatic Owner Elevation:</span>{' '}
                  The <span className="text-[#2ea043] font-mono">first account</span> ever registered receives{' '}
                  <span className="text-[#38bdf8] font-mono">ROLE_OWNER</span> with complete Lab Calendar, Project
                  Boards, and AI Memory privileges. Subsequent users receive{' '}
                  <span className="text-gray-300 font-mono">ROLE_STUDENT</span>.
                  <div className="mt-1 font-mono text-[10px] text-gray-400">
                    Currently registered in lab database: {users.length} accounts.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorText && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-center gap-2 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Full Name / Technician Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Julian Vance, Lead Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">Technician Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. tech_alex or instructor_julian"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">
              Password {isSignup && <span className="text-gray-500">(minimum 6 characters)</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{isSignup ? 'Complete Registration' : 'Authenticate & Enter Lab'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="mt-5 pt-4 border-t border-[#30363d] text-center">
          {isSignup ? (
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setErrorText('');
                }}
                className="text-[#38bdf8] hover:underline font-mono font-medium"
              >
                Log in here
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setErrorText('');
                }}
                className="text-[#2ea043] hover:underline font-mono font-medium"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>

        {/* Demo Fast Pickers */}
        <div className="mt-4 p-3 rounded-xl bg-[#0d1117]/80 border border-[#30363d]">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Instant Demo Switcher:</span>
            <span className="text-[#38bdf8]">Click to load</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {users.slice(0, 2).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchUserQuick(u.id);
                  setIsAuthModalOpen(false);
                }}
                className="p-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-left transition-colors text-[11px]"
              >
                <div className="font-semibold text-gray-200 truncate">{u.displayName.split(' ')[0]}</div>
                <div className={`font-mono text-[9px] ${u.role === 'ROLE_OWNER' ? 'text-[#2ea043]' : 'text-[#38bdf8]'}`}>
                  {u.role === 'ROLE_OWNER' ? '👑 Lead Tech / Owner' : '🛠️ Student Tech'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
