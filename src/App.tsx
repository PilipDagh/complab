import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { AssetQRScannerModal } from './components/AssetQRScannerModal';
import { AssetPhotoAutofillModal } from './components/AssetPhotoAutofillModal';
import { DiagnosticWizard } from './components/DiagnosticWizard';
import { GeminiChatbot } from './components/GeminiChatbot';
import { BenchReference } from './components/BenchReference';
import { LabCalendar } from './components/LabCalendar';
import { BoardLevelTriage } from './components/BoardLevelTriage';
import { NetworkSysadminSuite } from './components/NetworkSysadminSuite';
import { VocationalEducationSuite } from './components/VocationalEducationSuite';
import { ShopManagementSuite } from './components/ShopManagementSuite';
import { ForensicRecoverySuite } from './components/ForensicRecoverySuite';
import { SignalIntegritySuite } from './components/SignalIntegritySuite';
import { AssetInventoryManager } from './components/AssetInventoryManager';
import { TechnicianTimeClockSuite } from './components/TechnicianTimeClockSuite';
import { ComLabStatusSuite } from './components/comlab/ComLabStatusSuite';
import { ToolsSuppliesSuite } from './components/tools/ToolsSuppliesSuite';
import { QualityEnsurerSuite } from './components/quality/QualityEnsurerSuite';
import { LabManualGuide } from './components/LabManualGuide';
import { RoleQuickActionsBar } from './components/RoleQuickActionsBar';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingTour } from './components/OnboardingTour';
import { Toast } from './components/Toast';
import { AssetPublicSpecSheet } from './components/AssetPublicSpecSheet';
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
  const {
    activeTab,
    currentUser,
    isOwner,
    isPhotoAutofillModalOpen,
    setIsPhotoAutofillModalOpen,
    hardwareAssets,
    lookupHardwareAsset,
  } = useApp();

  // Standalone QR Scanner Destination: check for ?asset= or #asset= URL parameter
  const [urlAssetTag, setUrlAssetTag] = React.useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('asset');
      if (tag) return tag.trim();
      if (window.location.hash.startsWith('#asset=')) {
        return window.location.hash.replace('#asset=', '').trim();
      }
    } catch (e) {
      console.warn('URL param error:', e);
    }
    return null;
  });

  // Watch for popstate or manual navigation
  React.useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('asset');
      if (tag) {
        setUrlAssetTag(tag.trim());
      } else if (window.location.hash.startsWith('#asset=')) {
        setUrlAssetTag(window.location.hash.replace('#asset=', '').trim());
      } else {
        setUrlAssetTag(null);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Fetch from Firestore if not immediately in memory
  React.useEffect(() => {
    if (urlAssetTag) {
      lookupHardwareAsset(urlAssetTag);
    }
  }, [urlAssetTag, lookupHardwareAsset]);

  const scannedAsset = React.useMemo(() => {
    if (!urlAssetTag) return null;
    return (
      hardwareAssets.find(
        (a) =>
          a.assetTag.toLowerCase() === urlAssetTag.toLowerCase() ||
          a.id.toLowerCase() === urlAssetTag.toLowerCase() ||
          a.serialNumber.toLowerCase() === urlAssetTag.toLowerCase()
      ) || null
    );
  }, [urlAssetTag, hardwareAssets]);

  // If user scanned QR code with phone, render the standalone responsive spec sheet
  if (urlAssetTag) {
    if (scannedAsset) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans">
          <AssetPublicSpecSheet
            asset={scannedAsset}
            onBackToApp={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('asset');
              window.history.pushState({}, '', url.pathname + (url.hash.startsWith('#asset=') ? '' : url.hash));
              setUrlAssetTag(null);
            }}
          />
          <AuthModal />
          <Toast />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col items-center justify-center p-4 font-mono text-xs">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mx-auto flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">Looking up Asset Tag: [{urlAssetTag}]</h2>
          <p className="text-gray-400 text-xs">
            Querying Firestore real-time inventory for matching diagnostic passport...
          </p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('asset');
              window.history.pushState({}, '', url.pathname);
              setUrlAssetTag(null);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            Back to TradeTech Bench
          </button>
        </div>
        <Toast />
      </div>
    );
  }

  // ComLab Spatial Void Immersion Mode: Fullscreen void with zero standard navigation or footers
  if (activeTab === 'comlab') {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#030508] z-50 text-gray-100 select-none">
        <ComLabStatusSuite />
        <AuthModal />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans selection:bg-[#38bdf8]/30 selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Sticky Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-6">
        {/* Role Quick Actions Bar for Active Technician Duty */}
        <RoleQuickActionsBar />

        {/* Render Tab Views */}
        {activeTab === 'board_triage' && <BoardLevelTriage />}
        {activeTab === 'networking' && <NetworkSysadminSuite />}
        {activeTab === 'vocational' && <VocationalEducationSuite />}
        {activeTab === 'lab_management' && <ShopManagementSuite />}
        {activeTab === 'forensics' && <ForensicRecoverySuite />}
        {activeTab === 'signals' && <SignalIntegritySuite />}
        {activeTab === 'diagnostic' && <DiagnosticWizard />}
        {activeTab === 'reference' && <BenchReference />}
        {activeTab === 'gemini' && <GeminiChatbot />}
        {activeTab === 'calendar' && <LabCalendar />}
        {activeTab === 'assets' && <AssetInventoryManager />}
        {activeTab === 'time_clock' && <TechnicianTimeClockSuite />}
        {activeTab === 'comlab' && <ComLabStatusSuite />}
        {activeTab === 'tools' && <ToolsSuppliesSuite />}
        {activeTab === 'quality' && <QualityEnsurerSuite />}
        {activeTab === 'manual' && <LabManualGuide />}
      </main>

      {/* Bench Station Status Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] px-4 py-4 text-xs font-mono text-gray-400 mt-auto">
        <div className="max-w-[1680px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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

      {/* Modals, Tour, and Toasts */}
      <AuthModal />
      <AssetQRScannerModal />
      <AssetPhotoAutofillModal
        isOpen={isPhotoAutofillModalOpen}
        onClose={() => setIsPhotoAutofillModalOpen(false)}
      />
      <SettingsModal />
      <OnboardingTour />
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
