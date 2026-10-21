import React, { useState } from 'react';
import { HardwareAsset, AssetRepairLog } from '../types';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Wrench,
  Clock,
  Layers,
  MapPin,
  Tag,
  Share2,
  Sparkles,
  Award,
} from 'lucide-react';

interface AssetPublicSpecSheetProps {
  asset: HardwareAsset;
  onBackToApp?: () => void;
  onOpenQaModal?: (asset: HardwareAsset) => void;
}

export const AssetPublicSpecSheet: React.FC<AssetPublicSpecSheetProps> = ({
  asset,
  onBackToApp,
  onOpenQaModal,
}) => {
  const { currentUser } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isQaInspector = currentUser?.assignedJobs?.includes('quality_assurance') || currentUser?.role === 'ROLE_OWNER';

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans selection:bg-[#38bdf8]/30 selection:text-white p-3 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Top Utility Nav */}
      <div className="max-w-3xl w-full flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#30363d]">
        <button
          onClick={onBackToApp}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>TradeTech Bench Console</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-300 hover:text-white transition-colors"
            title="Copy Public Asset Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Spec Card Container */}
      <div className="max-w-3xl w-full bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden space-y-6 p-4 sm:p-7">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#30363d] pb-5">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span className="text-cyan-400 font-bold uppercase">{asset.deviceType}</span>
              <span className="text-gray-600">/</span>
              <span>{asset.department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words">
              {asset.model}
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-300 flex-wrap pt-0.5">
              <span className="font-bold text-white bg-black/40 border border-[#30363d] px-2 py-0.5 rounded">
                Tag: {asset.assetTag}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">SN: {asset.serialNumber}</span>
            </div>
          </div>

          {/* Status & Bench Badges */}
          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-black/40 border-[#30363d]">
              <span
                className={`w-2 h-2 rounded-full ${
                  asset.status === 'In Service'
                    ? 'bg-emerald-400'
                    : asset.status === 'Bench Testing'
                    ? 'bg-cyan-400'
                    : asset.status === 'Under Repair'
                    ? 'bg-amber-400'
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-white">{asset.status}</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{asset.assignedBench}</span>
            </div>
          </div>
        </div>

        {/* Quality Assurance Verification Banner */}
        {asset.qaReview ? (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs ${
              asset.qaReview.status === 'Passed'
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  asset.qaReview.status === 'Passed'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-sm flex items-center gap-1.5">
                  <span>{asset.qaReview.status === 'Passed' ? 'QA Certified & Verified' : 'QA Inspection: Rework Required'}</span>
                  <span className="text-[10px] opacity-75 font-normal">({asset.qaReview.sealId})</span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Inspected by <strong className="text-white">{asset.qaReview.inspectedBy}</strong> on{' '}
                  {new Date(asset.qaReview.inspectedAt).toLocaleDateString()}
                  {asset.qaReview.notes && ` • "${asset.qaReview.notes}"`}
                </div>
              </div>
            </div>

            {isQaInspector && onOpenQaModal && (
              <button
                onClick={() => onOpenQaModal(asset)}
                className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-current font-bold text-xs shrink-0 transition-colors"
              >
                Re-inspect
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-[#30363d] bg-black/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              <span>Awaiting final quality assurance verification by Julian / Kylin</span>
            </div>
            {isQaInspector && onOpenQaModal && (
              <button
                onClick={() => onOpenQaModal(asset)}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors"
              >
                Perform QA
              </button>
            )}
          </div>
        )}

        {/* Active Problem Alert (if flagged) */}
        {asset.problemLabel?.hasProblem && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 font-mono text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white uppercase tracking-wider">
                Active Symptom Flag: {asset.problemLabel.problemTitle || 'Hardware Fault Logged'} (
                {asset.problemLabel.problemSeverity})
              </div>
              <p className="text-[11px] text-red-300 mt-0.5">{asset.problemLabel.problemDescription}</p>
              <div className="text-[10px] text-gray-400 mt-1">
                Reported by {asset.problemLabel.reportedBy || 'Tech'} on {asset.problemLabel.reportedDate || 'Recently'}
              </div>
            </div>
          </div>
        )}

        {/* Technical Hardware Specifications Grid */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware Architecture & Bench Specs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Processor (CPU)</span>
              <span className="font-bold text-white text-xs">{asset.specs.cpu || 'Not specified'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Installed RAM</span>
              <span className="font-bold text-emerald-400 text-xs">{asset.specs.ram || 'Not specified'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Primary Storage</span>
              <span className="font-bold text-cyan-300 text-xs">{asset.specs.storage || 'Not specified'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Graphics / Video</span>
              <span className="font-bold text-white text-xs">{asset.specs.gpu || 'Integrated Video'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Motherboard / Planar</span>
              <span className="font-bold text-white text-xs">{asset.specs.motherboard || 'OEM System Board'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Power Supply Unit (PSU)</span>
              <span className="font-bold text-amber-300 text-xs">{asset.specs.psu || 'Standard Internal'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">Operating System</span>
              <span className="font-bold text-white text-xs">{asset.specs.os || 'None'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <span className="text-[10px] text-gray-400 block">BIOS / Firmware</span>
              <span className="font-bold text-white text-xs">{asset.specs.firmwareVersion || 'Latest'}</span>
            </div>
            {asset.specs.ipAddress && (
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <span className="text-[10px] text-gray-400 block">IP Assignment</span>
                <span className="font-bold text-sky-400 text-xs">{asset.specs.ipAddress}</span>
              </div>
            )}
            {asset.specs.macAddress && (
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <span className="text-[10px] text-gray-400 block">MAC Address</span>
                <span className="font-bold text-gray-300 text-xs">{asset.specs.macAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Repair & Maintenance History */}
        <div className="space-y-3 pt-2 border-t border-[#30363d]">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Diagnostic & Repair Log History ({asset.repairHistory.length})</span>
            </span>
          </div>

          {asset.repairHistory.length > 0 ? (
            <div className="space-y-2.5">
              {asset.repairHistory.map((log: AssetRepairLog) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-white font-bold">{log.date}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-400">Fault: </span>
                    {log.faultReported}
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-400">Action: </span>
                    {log.actionsTaken}
                  </div>
                  {log.partsReplaced && log.partsReplaced.length > 0 && (
                    <div className="text-[11px] text-cyan-300">
                      <span>Parts Replaced: </span>
                      {log.partsReplaced.join(', ')}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800">
                    Technician: {log.technician} {log.cost ? `• Cost: $${log.cost.toFixed(2)}` : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-center text-xs text-gray-400 font-mono">
              No historical repair logs on file. Hardware operating nominally.
            </div>
          )}
        </div>

        {/* Footer Notes & Meta */}
        <div className="text-[11px] text-gray-400 font-mono pt-3 border-t border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Registered: {new Date(asset.createdAt).toLocaleDateString()}</span>
          <span>Last Updated: {new Date(asset.updatedAt).toLocaleDateString()}</span>
          <span className="text-cyan-400">TradeTech Live Cloud Synced</span>
        </div>
      </div>
    </div>
  );
};
