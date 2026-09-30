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
    signInWithGoogle,
    users,
    switchUserQuick,
  } = useApp();

  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
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

        {/* Google Firebase Sign-In Button */}
        <div className="mb-4">
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
            <span>Sign in with Google (Firebase + Cloud SQL)</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#30363d]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase">
              <span className="bg-[#161b22] px-2 text-gray-400">or bench credentials</span>
            </div>
          </div>
        </div>

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
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#38bdf8] disabled:opacity-50 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>
              {isSubmitting
                ? 'Connecting to Firestore...'
                : isSignup
                ? 'Create Account in Firestore'
                : 'Authenticate & Enter Lab'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="w-full py-2 px-3 rounded-xl bg-[#0d1117] hover:bg-[#21262d] text-gray-400 hover:text-gray-200 text-xs font-mono transition-colors border border-[#30363d] flex items-center justify-center gap-1.5"
          >
            <span>Continue as Guest Technician (Unauthenticated Mode)</span>
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
