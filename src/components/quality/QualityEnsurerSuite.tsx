import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QualityInspection } from '../../types';
import { QualityInspectionModal } from './QualityInspectionModal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Printer,
  BadgeCheck,
  Cpu,
  Monitor,
  Calendar,
  User,
  Sparkles,
  FileCheck,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

export const QualityEnsurerSuite: React.FC = () => {
  const { qualityInspections, deleteQualityInspection, projects, hardwareAssets } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
  const [initialData, setInitialData] = useState<{
    deviceModel?: string;
    assetTag?: string;
    workOrderId?: string;
    serialNumber?: string;
    clientOrRecipient?: string;
    deviceType?: 'Desktop Tower' | 'Laptop' | 'Server' | 'All-in-One' | 'Custom Rig';
  } | undefined>(undefined);

  // Filtered list
  const filteredInspections = useMemo(() => {
    return qualityInspections.filter((insp) => {
      if (statusFilter !== 'all' && insp.overallStatus !== statusFilter) return false;
      if (deviceTypeFilter !== 'all' && insp.deviceType !== deviceTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchModel = insp.deviceModel.toLowerCase().includes(q);
        const matchCert = insp.certificateNumber.toLowerCase().includes(q);
        const matchTag = insp.assetTag?.toLowerCase().includes(q);
        const matchClient = insp.clientOrRecipient.toLowerCase().includes(q);
        const matchTech = insp.technicianName.toLowerCase().includes(q);
        const matchInsp = insp.inspectorName.toLowerCase().includes(q);
        return matchModel || matchCert || matchTag || matchClient || matchTech || matchInsp;
      }
      return true;
    });
  }, [qualityInspections, statusFilter, deviceTypeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = qualityInspections.length;
    const passed = qualityInspections.filter((i) => i.overallStatus === 'passed').length;
    const rework = qualityInspections.filter((i) => i.overallStatus === 'rework_required').length;
    const rejected = qualityInspections.filter((i) => i.overallStatus === 'rejected').length;

    const avgTemp =
      total > 0
        ? Math.round(
            qualityInspections.reduce((acc, curr) => acc + (curr.checks.maxCpuTempCelsius || 60), 0) /
              total
          )
        : 62;

    return { total, passed, rework, rejected, avgTemp };
  }, [qualityInspections]);

  // Projects ready for QA inspection (Completed or Testing stage)
  const candidateProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (p.stage === 'Quality Inspection' ||
          p.stage === 'Bench Testing' ||
          p.status === 'completed' ||
          p.status === 'resolved') &&
        !qualityInspections.some((qi) => qi.workOrderId === p.id)
    );
  }, [projects, qualityInspections]);

  const handleStartNewInspection = (candidate?: {
    model: string;
    deviceType?: any;
    workOrderId?: string;
    client?: string;
  }) => {
    setSelectedInspection(null);
    if (candidate) {
      setInitialData({
        deviceModel: candidate.model,
        deviceType: candidate.deviceType || 'Desktop Tower',
        workOrderId: candidate.workOrderId,
        clientOrRecipient: candidate.client || 'Client Pickup',
      });
    } else {
      setInitialData(undefined);
    }
    setIsModalOpen(true);
  };

  const handleEditInspection = (insp: QualityInspection) => {
    setSelectedInspection(insp);
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: QualityInspection['overallStatus']) => {
    switch (status) {
      case 'passed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>QA PASSED (RELEASE READY)</span>
          </span>
        );
      case 'rework_required':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>NEEDS REWORK</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="w-3.5 h-3.5" />
            <span>CRITICAL REJECT</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
                Quality Ensurer & Outbound Release Certification
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero-Tolerance Quality Gate
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Ensures every repaired computer, laptop, and server meets vocational electrical safety, burn-in thermals, clean OS, and sanitization standards before release.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStartNewInspection()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Quality Inspection</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[#30363d]">
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-gray-400 block">Total Certified</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[11px] font-mono text-emerald-400 block">Outbound Release Ready</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-0.5 block">{stats.passed}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/30 bg-amber-950/10">
            <span className="text-[11px] font-mono text-amber-400 block">Rework Required</span>
            <span className="text-xl font-bold font-mono text-amber-300 mt-0.5 block">{stats.rework}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-red-500/30 bg-red-950/10">
            <span className="text-[11px] font-mono text-red-400 block">Rejected Defective</span>
            <span className="text-xl font-bold font-mono text-red-300 mt-0.5 block">{stats.rejected}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <span className="text-[11px] font-mono text-cyan-400 block">Avg Burn-in Load Temp</span>
            <span className="text-xl font-bold font-mono text-cyan-300 mt-0.5 block">{stats.avgTemp}°C</span>
          </div>
        </div>
      </div>

      {/* Candidate Repair Work Orders Banner (if any completed work orders await QA) */}
      {candidateProjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Work Orders Ready for Outbound Quality Assurance ({candidateProjects.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              Select a work order below to fast-track its 4-stage inspection:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {candidateProjects.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-2 hover:border-cyan-500/50 transition-colors"
              >
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{p.title}</p>
                  <p className="text-[11px] text-gray-400 font-mono truncate">
                    {p.deviceType} • {p.benchNumber}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleStartNewInspection({
                      model: p.deviceType,
                      workOrderId: p.id,
                      client: p.clientOrDepartment,
                    })
                  }
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shrink-0 shadow"
                >
                  Inspect →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by certificate #, device model, asset tag, customer, or inspector..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Verdicts</option>
            <option value="passed">QA Passed Only</option>
            <option value="rework_required">Needs Rework</option>
            <option value="rejected">Rejected Defective</option>
          </select>

          <select
            value={deviceTypeFilter}
            onChange={(e) => setDeviceTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Form Factors</option>
            <option value="Desktop Tower">Desktop Tower</option>
            <option value="Laptop">Laptop / Notebook</option>
            <option value="Server">Rack Server</option>
            <option value="All-in-One">All-in-One</option>
            <option value="Custom Rig">Custom Rig</option>
          </select>
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className={`p-5 rounded-2xl bg-[#161b22] border transition-all flex flex-col justify-between group shadow-sm ${
              insp.overallStatus === 'passed'
                ? 'border-emerald-500/30 hover:border-emerald-400'
                : insp.overallStatus === 'rework_required'
                ? 'border-amber-500/30 hover:border-amber-400'
                : 'border-red-500/30 hover:border-red-400'
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {insp.certificateNumber}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(insp.inspectionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                    {insp.deviceModel}
                  </h3>
                </div>

                <div className="p-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-emerald-400 shrink-0">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              {/* Status Badge */}
              <div>{getStatusBadge(insp.overallStatus)}</div>

              {/* Details List */}
              <div className="space-y-1.5 text-xs font-mono bg-[#0d1117] p-3 rounded-xl border border-[#30363d]/80 text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset / Serial:</span>
                  <span className="text-white truncate max-w-[150px]">
                    {insp.assetTag || insp.serialNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Form Factor:</span>
                  <span className="text-gray-300">{insp.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient:</span>
                  <span className="text-white truncate max-w-[150px]">{insp.clientOrRecipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lead Inspector:</span>
                  <span className="text-emerald-400">{insp.inspectorName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#30363d]/60 text-[11px]">
                  <span className="text-gray-500">Max Temp Under Load:</span>
                  <span className="text-cyan-300 font-bold">{insp.checks.maxCpuTempCelsius}°C</span>
                </div>
              </div>

              {/* Inspector Sign-off Notes */}
              {insp.inspectorNotes && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed italic">
                  "{insp.inspectorNotes}"
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditInspection(insp)}
                  title="Edit inspection details"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete quality certification for "${insp.deviceModel}"?`)) {
                      deleteQualityInspection(insp.id);
                    }
                  }}
                  title="Delete certificate"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleEditInspection(insp)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Certificate Slip</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInspections.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[#30363d] rounded-2xl bg-[#161b22] space-y-3">
          <ShieldCheck className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">No quality inspections found</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Certify your first repaired PC or laptop with electrical, hardware stability, driver, and sanitation checks.
          </p>
          <button
            onClick={() => handleStartNewInspection()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4" /> Start Quality Inspection
          </button>
        </div>
      )}

      {/* Inspection Modal */}
      <QualityInspectionModal
        isOpen={isModalOpen}
        existingInspection={selectedInspection}
        initialData={initialData}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
