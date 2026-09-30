import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { DiagnosticWizard } from './components/DiagnosticWizard';
import { GeminiChatbot } from './components/GeminiChatbot';
import { BenchReference } from './components/BenchReference';
import { LabCalendar } from './components/LabCalendar';
import { Toast } from './components/Toast';
import {
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  Smartphone,
  ExternalLink,
  Zap,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, isOwner } = useApp();

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans selection:bg-[#38bdf8]/30 selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Render Tab Views */}
        {activeTab === 'diagnostic' && <DiagnosticWizard />}
        {activeTab === 'reference' && <BenchReference />}
        {activeTab === 'gemini' && <GeminiChatbot />}
        {activeTab === 'calendar' && <LabCalendar />}
      </main>

      {/* Bench Station Status Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] px-4 py-4 text-xs font-mono text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
            <span className="text-gray-300 font-semibold">TradeTech Bench Assistant</span>
            <span className="text-gray-600">•</span>
            <span>CompTIA A+ / Cisco Certified Vocational Suite</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ea043]" />
              ESD Safety Protocol Enforced
            </span>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-[#38bdf8]" />
              Android WebView & PWA Ready
            </span>
            <span className="hidden md:inline text-gray-600">•</span>
            <span className="text-[#38bdf8]">
              {currentUser ? `Bench: ${currentUser.benchStation || 'Active Tech'}` : 'Guest Session'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals and Toasts */}
      <AuthModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
