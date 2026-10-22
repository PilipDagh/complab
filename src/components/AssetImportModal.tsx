import React, { useState, useRef } from 'react';
import { HardwareAsset } from '../types';
import { useApp } from '../context/AppContext';
import {
  Upload,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';

interface AssetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetImportModal: React.FC<AssetImportModalProps> = ({ isOpen, onClose }) => {
  const { importHardwareAssets, hardwareAssets } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedAssets, setParsedAssets] = useState<HardwareAsset[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [conflictMode, setConflictMode] = useState<'merge' | 'skip'>('merge');

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParsedAssets([]);

    try {
      const text = await file.text();

      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const json = JSON.parse(text);
        let items: any[] = [];

        if (Array.isArray(json)) {
          items = json;
        } else if (json && Array.isArray(json.assets)) {
          // Standard TradeTech export format
          items = json.assets;
        } else if (json && Array.isArray(json.hardwareAssets)) {
          items = json.hardwareAssets;
        } else if (json && Array.isArray(json.inventory)) {
          items = json.inventory;
        } else if (json && Array.isArray(json.data)) {
          items = json.data;
        } else if (json && Array.isArray(json.items)) {
          items = json.items;
        } else if (json && (json.assetTag || json.serialNumber || json.model)) {
          // Single asset JSON object
          items = [json];
        } else if (json && typeof json === 'object') {
          // Key-value map of assets
          const possibleValues = Object.values(json);
          const assetCandidates = possibleValues.filter(
            (v: any) => v && typeof v === 'object' && (v.assetTag || v.serialNumber || v.model)
          );
          if (assetCandidates.length > 0) {
            items = assetCandidates;
          } else {
            throw new Error(
              'JSON file must contain an array of hardware assets, a TradeTech export envelope, or asset records.'
            );
          }
        } else {
          throw new Error('JSON file must contain an array of hardware assets or a TradeTech export envelope.');
        }

        const valid: HardwareAsset[] = items.map((item, idx) => {
          const tag = item.assetTag || item.id || `AST-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`;
          return {
            id: tag,
            assetTag: tag,
            serialNumber: item.serialNumber || 'SN-UNKNOWN',
            model: item.model || 'Imported Hardware Asset',
            deviceType: item.deviceType || 'Desktop Tower',
            assignedBench: item.assignedBench || 'Storage Shelf',
            department: item.department || 'Vocational IT Lab',
            status: item.status || 'In Service',
            kanbanStage: item.kanbanStage || 'intake',
            isCurrentlyOnHand: item.isCurrentlyOnHand !== undefined ? item.isCurrentlyOnHand : true,
            problemLabel: item.problemLabel || undefined,
            specs: item.specs || {},
            qaReview: item.qaReview || undefined,
            purchaseDate: item.purchaseDate || undefined,
            warrantyExpiry: item.warrantyExpiry || undefined,
            notes: item.notes || `Imported from ${file.name}`,
            repairHistory: Array.isArray(item.repairHistory) ? item.repairHistory : [],
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        if (valid.length === 0) {
          throw new Error('No valid hardware assets found in this JSON file.');
        }

        setParsedAssets(valid);
      } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        // Parse simple CSV
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one asset record.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const tagIdx = headers.findIndex((h) => h.includes('tag') || h.includes('id'));
        const modelIdx = headers.findIndex((h) => h.includes('model') || h.includes('name'));
        const snIdx = headers.findIndex((h) => h.includes('serial') || h.includes('sn'));
        const benchIdx = headers.findIndex((h) => h.includes('bench') || h.includes('location'));
        const statusIdx = headers.findIndex((h) => h.includes('status'));
        const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('category'));

        const valid: HardwareAsset[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length === 0 || !cols[0]) continue;

          const tag = (tagIdx >= 0 ? cols[tagIdx] : cols[0]) || `AST-CSV-${i}`;
          const model = (modelIdx >= 0 ? cols[modelIdx] : cols[1]) || 'Standard Hardware Device';

          valid.push({
            id: tag,
            assetTag: tag,
            serialNumber: snIdx >= 0 ? cols[snIdx] : `SN-IMP-${i}`,
            model,
            deviceType: (typeIdx >= 0 && cols[typeIdx]) ? (cols[typeIdx] as any) : 'Desktop Tower',
            assignedBench: benchIdx >= 0 ? cols[benchIdx] : 'Bench #1',
            department: 'Vocational IT Lab',
            status: (statusIdx >= 0 && cols[statusIdx]) ? (cols[statusIdx] as any) : 'In Service',
            kanbanStage: 'intake',
            isCurrentlyOnHand: true,
            specs: {},
            repairHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (valid.length === 0) {
          throw new Error('Could not parse any rows from the CSV file.');
        }

        setParsedAssets(valid);
      } else {
        throw new Error('Unsupported file format. Please upload a .json or .csv file.');
      }
    } catch (err: any) {
      console.error('File import parsing error:', err);
      setParseError(err?.message || 'Failed to parse file. Verify format and try again.');
    }
  };

  const handleConfirmImport = async () => {
    if (parsedAssets.length === 0) return;
    setIsImporting(true);

    try {
      let finalAssets = parsedAssets;
      if (conflictMode === 'skip') {
        const existingTags = new Set(hardwareAssets.map((a) => a.assetTag.toLowerCase()));
        finalAssets = parsedAssets.filter((a) => !existingTags.has(a.assetTag.toLowerCase()));
      }

      await importHardwareAssets(finalAssets);
      onClose();
    } catch (err) {
      console.error('Failed to import assets:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const existingOverlapCount = parsedAssets.filter((incoming) =>
    hardwareAssets.some((existing) => existing.assetTag.toLowerCase() === incoming.assetTag.toLowerCase())
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono text-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Import Hardware Assets</h3>
              <p className="text-[11px] text-gray-400">Upload TradeTech .json export or vendor .csv roster</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20 text-white'
                : 'border-[#30363d] hover:border-cyan-500/50 bg-[#0d1117] text-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-white block text-sm">Choose or Drop File</span>
              <span className="text-[11px] text-gray-400">Supports .json (TradeTech export) and standard .csv</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {/* File Info Bar */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-white block truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {parsedAssets.length} assets discovered
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setParsedAssets([]);
                  setParseError(null);
                }}
                className="text-[11px] text-cyan-400 hover:underline shrink-0"
              >
                Change File
              </button>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Overlap & Conflict Strategy */}
            {parsedAssets.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Conflict Strategy:</span>
                  <span className="text-gray-400">
                    {existingOverlapCount} tag matches found in current lab
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConflictMode('merge')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      conflictMode === 'merge'
                        ? 'bg-cyan-950/40 border-cyan-500 text-white font-bold'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Update & Merge</span>
                      {conflictMode === 'merge' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] opacity-75 block font-normal mt-0.5">
                      Overwrite existing matching tags with incoming specs
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConflictMode('skip')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      conflictMode === 'skip'
                        ? 'bg-cyan-950/40 border-cyan-500 text-white font-bold'
                        : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Skip Existing</span>
                      {conflictMode === 'skip' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] opacity-75 block font-normal mt-0.5">
                      Only import completely new assets ({parsedAssets.length - existingOverlapCount} new)
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Preview Asset Table */}
            {parsedAssets.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                  Incoming Records Preview (First 5 of {parsedAssets.length}):
                </span>
                <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117] max-h-48 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#161b22] text-[10px] text-gray-400 uppercase border-b border-[#30363d]">
                      <tr>
                        <th className="p-2">Tag</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Bench</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]/50 text-[11px]">
                      {parsedAssets.slice(0, 5).map((a, i) => (
                        <tr key={i} className="hover:bg-[#161b22]/50">
                          <td className="p-2 font-bold text-cyan-300">{a.assetTag}</td>
                          <td className="p-2 text-white truncate max-w-[140px]">{a.model}</td>
                          <td className="p-2 text-gray-400">{a.deviceType}</td>
                          <td className="p-2 text-gray-300">{a.assignedBench}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/40 border border-gray-700 text-gray-300">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#30363d] pt-3 mt-4">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedAssets.length === 0 || isImporting}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing to Firestore...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>
                  Confirm & Sync ({conflictMode === 'skip' ? parsedAssets.length - existingOverlapCount : parsedAssets.length}) Assets
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
