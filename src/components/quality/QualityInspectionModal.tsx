import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QualityInspection, QualityChecksRubric } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
  Sparkles,
  Zap,
  Cpu,
  Monitor,
  Check,
  FileText,
  BadgeCheck,
  Hash,
} from 'lucide-react';

interface QualityInspectionModalProps {
  isOpen: boolean;
  existingInspection?: QualityInspection | null;
  initialData?: {
    deviceModel?: string;
    assetTag?: string;
    workOrderId?: string;
    serialNumber?: string;
    clientOrRecipient?: string;
    deviceType?: 'Desktop Tower' | 'Laptop' | 'Server' | 'All-in-One' | 'Custom Rig';
  };
  onClose: () => void;
}

export const QualityInspectionModal: React.FC<QualityInspectionModalProps> = ({
  isOpen,
  existingInspection,
  initialData,
  onClose,
}) => {
  const { currentUser, addQualityInspection, updateQualityInspection } = useApp();

  const [deviceModel, setDeviceModel] = useState(
    existingInspection?.deviceModel || initialData?.deviceModel || ''
  );
  const [deviceType, setDeviceType] = useState<
    'Desktop Tower' | 'Laptop' | 'Server' | 'All-in-One' | 'Custom Rig'
  >(existingInspection?.deviceType || initialData?.deviceType || 'Desktop Tower');
  const [assetTag, setAssetTag] = useState(
    existingInspection?.assetTag || initialData?.assetTag || ''
  );
  const [workOrderId, setWorkOrderId] = useState(
    existingInspection?.workOrderId || initialData?.workOrderId || ''
  );
  const [serialNumber, setSerialNumber] = useState(
    existingInspection?.serialNumber || initialData?.serialNumber || ''
  );
  const [clientOrRecipient, setClientOrRecipient] = useState(
    existingInspection?.clientOrRecipient || initialData?.clientOrRecipient || 'Client Pickup / Outbound Fleet'
  );
  const [technicianName, setTechnicianName] = useState(
    existingInspection?.technicianName || 'Bench Technician'
  );
  const [inspectorName, setInspectorName] = useState(
    existingInspection?.inspectorName || currentUser?.displayName || 'Lead Quality Inspector'
  );

  // 4-Stage Testing Rubric State
  const [checks, setChecks] = useState<QualityChecksRubric>(
    existingInspection?.checks || {
      // 1. Electrical & Safety Integrity
      powerSupplyGroundVerified: true,
      cablesInsulatedNoExposedWire: true,
      powerRailVoltagesNormal: true,
      esdGroundingDischarged: true,

      // 2. Hardware Stability & Burn-In
      cpuThermalsUnderLoadPass: true,
      maxCpuTempCelsius: 64,
      ramMemtestStable: true,
      storageSmartHealthClean: true,
      gpuStabilityTestPass: true,
      coolingFansSpinFreely: true,

      // 3. Clean OS & Driver Validation
      cleanOsInstalledAndActivated: true,
      allDriversFunctionalNoUnknown: true,
      benchProfilesRemoved: true,
      biosFirmwareUpdated: true,
      antivirusEnabledAndUpdated: true,

      // 4. Physical Detailing & Sanitation
      chassisCleanedAndSanitized: true,
      screenSpotlessNoFingerprints: true,
      portsDustFree: true,
      accessoriesAndPowerLeadBagged: true,
    }
  );

  const [overallStatus, setOverallStatus] = useState<'passed' | 'rework_required' | 'rejected'>(
    existingInspection?.overallStatus || 'passed'
  );
  const [inspectorNotes, setInspectorNotes] = useState(existingInspection?.inspectorNotes || '');
  const [benchVoltagesRecorded, setBenchVoltagesRecorded] = useState(
    existingInspection?.benchVoltagesRecorded || '+12.06V, +5.03V, +3.32V (Clean ripple)'
  );
  const [approvedForOutboundRelease, setApprovedForOutboundRelease] = useState(
    existingInspection?.approvedForOutboundRelease ?? true
  );

  const [showCertificateView, setShowCertificateView] = useState(false);
  const [createdCert, setCreatedCert] = useState<QualityInspection | null>(existingInspection || null);

  if (!isOpen) return null;

  const toggleCheck = (key: keyof QualityChecksRubric) => {
    setChecks((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // Check if all are true
      const allBooleanPass = (
        Object.entries(updated).filter(([k]) => k !== 'maxCpuTempCelsius') as [string, boolean][]
      ).every(([_, val]) => val === true);

      if (!allBooleanPass && overallStatus === 'passed') {
        setOverallStatus('rework_required');
        setApprovedForOutboundRelease(false);
      } else if (allBooleanPass && overallStatus !== 'passed') {
        setOverallStatus('passed');
        setApprovedForOutboundRelease(true);
      }
      return updated;
    });
  };

  const handleSelectAll = (val: boolean) => {
    setChecks((prev) => ({
      ...prev,
      powerSupplyGroundVerified: val,
      cablesInsulatedNoExposedWire: val,
      powerRailVoltagesNormal: val,
      esdGroundingDischarged: val,
      cpuThermalsUnderLoadPass: val,
      ramMemtestStable: val,
      storageSmartHealthClean: val,
      gpuStabilityTestPass: val,
      coolingFansSpinFreely: val,
      cleanOsInstalledAndActivated: val,
      allDriversFunctionalNoUnknown: val,
      benchProfilesRemoved: val,
      biosFirmwareUpdated: val,
      antivirusEnabledAndUpdated: val,
      chassisCleanedAndSanitized: val,
      screenSpotlessNoFingerprints: val,
      portsDustFree: val,
      accessoriesAndPowerLeadBagged: val,
    }));
    setOverallStatus(val ? 'passed' : 'rework_required');
    setApprovedForOutboundRelease(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim()) return;

    if (existingInspection) {
      await updateQualityInspection(existingInspection.id, {
        deviceModel: deviceModel.trim(),
        deviceType,
        assetTag: assetTag.trim() || undefined,
        workOrderId: workOrderId.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        clientOrRecipient: clientOrRecipient.trim(),
        technicianName: technicianName.trim(),
        inspectorName: inspectorName.trim(),
        checks,
        overallStatus,
        inspectorNotes: inspectorNotes.trim() || undefined,
        benchVoltagesRecorded: benchVoltagesRecorded.trim() || undefined,
        approvedForOutboundRelease,
      });
      setCreatedCert({
        ...existingInspection,
        deviceModel: deviceModel.trim(),
        deviceType,
        assetTag: assetTag.trim() || undefined,
        workOrderId: workOrderId.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        clientOrRecipient: clientOrRecipient.trim(),
        technicianName: technicianName.trim(),
        inspectorName: inspectorName.trim(),
        checks,
        overallStatus,
        inspectorNotes: inspectorNotes.trim() || undefined,
        benchVoltagesRecorded: benchVoltagesRecorded.trim() || undefined,
        approvedForOutboundRelease,
      });
      setShowCertificateView(true);
    } else {
      const newCert = await addQualityInspection({
        deviceModel: deviceModel.trim(),
        deviceType,
        assetTag: assetTag.trim() || undefined,
        workOrderId: workOrderId.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        clientOrRecipient: clientOrRecipient.trim(),
        technicianName: technicianName.trim(),
        inspectorName: inspectorName.trim(),
        inspectionDate: new Date().toISOString(),
        checks,
        overallStatus,
        inspectorNotes: inspectorNotes.trim() || undefined,
        benchVoltagesRecorded: benchVoltagesRecorded.trim() || undefined,
        approvedForOutboundRelease,
      });
      setCreatedCert(newCert);
      setShowCertificateView(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Quality Ensurer Certification
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Outbound Release Rubric
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Rigorous electrical, burn-in, driver, and sanitation inspection before release
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {createdCert && (
              <button
                type="button"
                onClick={() => setShowCertificateView(!showCertificateView)}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors flex items-center gap-1.5"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>{showCertificateView ? 'Return to Form' : 'View QA Cert Slip'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Slip View (Printable / Exportable) */}
        {showCertificateView && createdCert ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0d1117]">
            {/* Visual Certificate Card */}
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden font-sans space-y-6">
              {/* Corner Watermark Seal */}
              <div className="absolute top-4 right-4 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-dashed border-emerald-400/60 bg-emerald-950/40 text-emerald-300 shadow-lg animate-pulse">
                  <div className="text-center">
                    <ShieldCheck className="w-8 h-8 mx-auto" />
                    <span className="text-[9px] font-mono font-bold tracking-widest block uppercase">
                      QA PASSED
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Header */}
              <div className="border-b border-emerald-500/30 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  <span>TRADETECH VOCATIONAL BENCH ASSISTANT</span>
                  <span>•</span>
                  <span>OUTBOUND CERTIFICATION</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-1">
                  Certificate of Quality & Safety
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  This device has undergone and passed the 4-stage vocational testing rubric for electrical integrity, hardware stability, driver health, and physical detailing.
                </p>
              </div>

              {/* Hardware & Inspection Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Certificate #</span>
                  <span className="text-emerald-300 font-bold text-sm">{createdCert.certificateNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Verification Hash</span>
                  <span className="text-cyan-300 font-bold text-xs truncate block">{createdCert.certificateHash || 'VERIFIED-OK'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Hardware Model</span>
                  <span className="text-white font-bold">{createdCert.deviceModel}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Asset Tag / Serial</span>
                  <span className="text-white">{createdCert.assetTag || createdCert.serialNumber || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Lead Inspector</span>
                  <span className="text-emerald-400 font-semibold">{createdCert.inspectorName}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-500 text-[10px] block uppercase">Certified Date</span>
                  <span className="text-gray-300">{new Date(createdCert.inspectionDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* 4 Rubric Milestones Summary */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  Passed Verification Milestones:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. Electrical Ground & Rail Voltages Verified</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Heavy Load CPU/RAM Burn-in Passed</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3. Clean OS, Drivers & Antivirus Active</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4. Chassis & Port Detailing Sanitized</span>
                  </div>
                </div>
              </div>

              {/* Inspector Sign-off Notes */}
              {createdCert.inspectorNotes && (
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] text-xs space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Inspector Sign-off Notes:</span>
                  <p className="text-gray-200 italic">"{createdCert.inspectorNotes}"</p>
                </div>
              )}

              {/* Release Stamp Bar */}
              <div className="pt-4 border-t border-emerald-500/30 flex items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300 font-bold uppercase">APPROVED FOR OUTBOUND RELEASE</span>
                </div>
                <span>Recipient: {createdCert.clientOrRecipient}</span>
              </div>
            </div>

            {/* Print Action Bar */}
            <div className="max-w-2xl mx-auto flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateView(false)}
                className="px-4 py-2 rounded-xl border border-[#30363d] text-gray-300 hover:text-white text-xs font-medium"
              >
                ← Back to Edit Inspection
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate Slip</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Content: 4-Stage QA Rubric */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Quick Fill & Device Information */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Device & Customer Identification
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    ✓ Pass All Checks
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Reset Checks
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Device Model / Unit Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. Dell OptiPlex 7090 Tower, ThinkPad T14 Gen 2"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Form Factor</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Desktop Tower">Desktop Tower</option>
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="All-in-One">All-in-One</option>
                    <option value="Server">Rack Server</option>
                    <option value="Custom Rig">Custom Gaming Rig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Asset Tag</label>
                  <input
                    type="text"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    placeholder="e.g. AST-DELL-7090"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Work Order #</label>
                  <input
                    type="text"
                    value={workOrderId}
                    onChange={(e) => setWorkOrderId(e.target.value)}
                    placeholder="e.g. WO-2026-003"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. 7X8921A"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Client / Outbound Recipient
                  </label>
                  <input
                    type="text"
                    value={clientOrRecipient}
                    onChange={(e) => setClientOrRecipient(e.target.value)}
                    placeholder="e.g. Student Loaner Fleet, Client Pick-up"
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Repair Technician</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Lead QA Inspector</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* STAGE 1: ELECTRICAL & SAFETY INTEGRITY */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Stage 1: Electrical & Safety Integrity
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Verify physical insulation, chassis ground bond, and voltage tolerances
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    key: 'powerSupplyGroundVerified' as const,
                    label: 'PSU Earth Ground Continuity Verified (< 0.1Ω)',
                  },
                  {
                    key: 'cablesInsulatedNoExposedWire' as const,
                    label: 'Wiring Harness Insulated & Tied (No Pinched/Bare Wire)',
                  },
                  {
                    key: 'powerRailVoltagesNormal' as const,
                    label: 'ATX/DC Rail Voltages Within 5% (+12V, +5V, +3.3V)',
                  },
                  {
                    key: 'esdGroundingDischarged' as const,
                    label: 'ESD Safe Ground Discharged & Capacitors Bled',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      checks[item.key]
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        checks[item.key]
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {checks[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">
                  Recorded Bench Voltage Rails:
                </label>
                <input
                  type="text"
                  value={benchVoltagesRecorded}
                  onChange={(e) => setBenchVoltagesRecorded(e.target.value)}
                  placeholder="+12.08V, +5.02V, +3.31V (within tolerance)"
                  className="w-full px-2.5 py-1.5 rounded bg-[#161b22] border border-[#30363d] text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* STAGE 2: HARDWARE STABILITY & BURN-IN */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-300">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Stage 2: Hardware Stability & Heavy Load Burn-In
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    AIDA64 / Prime95 stress test, MemTest86, and thermals under load
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    key: 'cpuThermalsUnderLoadPass' as const,
                    label: 'CPU Stress Test Passed (No Throttling)',
                  },
                  {
                    key: 'ramMemtestStable' as const,
                    label: 'RAM MemTest86 4-Pass Zero Bit Errors',
                  },
                  {
                    key: 'storageSmartHealthClean' as const,
                    label: 'NVMe/SSD SMART Health Clean (0 Reallocated Sectors)',
                  },
                  {
                    key: 'gpuStabilityTestPass' as const,
                    label: 'GPU 3D Stress Benchmark Stable (No Artifacts)',
                  },
                  {
                    key: 'coolingFansSpinFreely' as const,
                    label: 'Fans Spin Freely with Quiet Bearings & Correct RPM Profile',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      checks[item.key]
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        checks[item.key]
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {checks[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-[#30363d]">
                  <span className="text-gray-300">Max CPU Temp Under Load:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      value={checks.maxCpuTempCelsius}
                      onChange={(e) =>
                        setChecks((prev) => ({ ...prev, maxCpuTempCelsius: Number(e.target.value) }))
                      }
                      className="w-14 px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-white text-xs text-center"
                    />
                    <span className="text-gray-400">°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STAGE 3: CLEAN OS & DRIVER VALIDATION */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Stage 3: Clean OS & Driver Validation
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Device Manager audit, activated OS, firmware update, and clean handover
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    key: 'cleanOsInstalledAndActivated' as const,
                    label: 'Clean OS Installed & Activated with Digital License',
                  },
                  {
                    key: 'allDriversFunctionalNoUnknown' as const,
                    label: '0 Unknown Devices in Device Manager (All Chipset/Audio/LAN OK)',
                  },
                  {
                    key: 'benchProfilesRemoved' as const,
                    label: 'Bench Testing Accounts & Diagnostic Logs Removed',
                  },
                  {
                    key: 'biosFirmwareUpdated' as const,
                    label: 'Motherboard UEFI / BIOS Updated to Stable Release',
                  },
                  {
                    key: 'antivirusEnabledAndUpdated' as const,
                    label: 'Antivirus & Windows Security Definitions Up-to-Date',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      checks[item.key]
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        checks[item.key]
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {checks[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STAGE 4: PHYSICAL DETAILING & SANITATION */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Stage 4: Physical Detailing & Sanitation
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Cosmetic clean, anti-static wipe-down, spotless screen, bagged power leads
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    key: 'chassisCleanedAndSanitized' as const,
                    label: 'Exterior Chassis Blown Out & Sanitized with 70% IPA',
                  },
                  {
                    key: 'screenSpotlessNoFingerprints' as const,
                    label: 'Display Screen Cleaned with Microfiber (0 Fingerprints)',
                  },
                  {
                    key: 'portsDustFree' as const,
                    label: 'USB, HDMI, Ethernet, & Audio Ports Dust-Free',
                  },
                  {
                    key: 'accessoriesAndPowerLeadBagged' as const,
                    label: 'Power Adapter / AC Cable Neatly Tied & Packaged',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      checks[item.key]
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        checks[item.key]
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-gray-600 bg-transparent'
                      }`}
                    >
                      {checks[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Decision & Inspector Notes */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono block">
                Final Inspection Verdict & Sign-Off
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    status: 'passed' as const,
                    label: 'QA Passed',
                    desc: 'Safe & ready for client outbound release',
                    color: 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300',
                  },
                  {
                    status: 'rework_required' as const,
                    label: 'Needs Rework',
                    desc: 'Non-fatal item needs adjustment before release',
                    color: 'bg-amber-950/40 border-amber-500/60 text-amber-300',
                  },
                  {
                    status: 'rejected' as const,
                    label: 'Rejected',
                    desc: 'Critical defect; cannot be released safely',
                    color: 'bg-red-950/40 border-red-500/60 text-red-300',
                  },
                ].map((item) => (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => {
                      setOverallStatus(item.status);
                      setApprovedForOutboundRelease(item.status === 'passed');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      overallStatus === item.status
                        ? item.color + ' font-bold shadow-md'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs capitalize">{item.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Inspector Sign-Off Notes & Repair Verification:
                </label>
                <textarea
                  rows={2}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="e.g. Replaced swollen VRM capacitor on motherboard. All 4 burn-in hours passed at 64°C max. Sealed with QA badge."
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Submit & Stamp */}
            <div className="pt-4 border-t border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Generates verifiable Certificate Number & SHA-256 seal</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[#30363d] text-gray-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Certify & Generate QA Stamp</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
