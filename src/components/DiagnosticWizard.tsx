import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Monitor,
  HardDrive,
  Thermometer,
  Network,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const DiagnosticWizard: React.FC = () => {
  const {
    categories,
    activeCategoryId,
    setActiveCategoryId,
    currentNodeId,
    diagnosticHistory,
    selectDiagnosticOption,
    resetDiagnostic,
    jumpToBreadcrumb,
    sendDiagnosticToGemini,
  } = useApp();

  const currentCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const currentNode = currentCategory.nodes[currentNodeId] || currentCategory.nodes[currentCategory.rootNodeId];

  // Helper to map icon names
  const renderIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Monitor':
        return <Monitor className={className} />;
      case 'HardDrive':
        return <HardDrive className={className} />;
      case 'Thermometer':
        return <Thermometer className={className} />;
      case 'Network':
        return <Network className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  // Build breadcrumb node labels
  const breadcrumbList = diagnosticHistory.map((nodeId, idx) => {
    const node = currentCategory.nodes[nodeId];
    return {
      id: nodeId,
      stepNumber: idx + 1,
      title: node?.isFinal ? 'Solution' : `Step ${idx + 1}`,
      questionSnippet: node ? node.question.substring(0, 35) + '...' : '',
    };
  });

  return (
    <div className="space-y-6">
      {/* Category Selection Carousel/Grid */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 lg:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#38bdf8]" />
              Interactive Hardware & Network Diagnostic Wizard
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a failure domain below to start a CompTIA A+ compliant branching decision tree.
            </p>
          </div>
          <button
            onClick={() => resetDiagnostic()}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs font-mono transition-colors border border-[#30363d]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset Tree</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const isSelected = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id !== activeCategoryId) {
                    resetDiagnostic(cat.id);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#21262d] border-[#38bdf8] shadow-lg shadow-cyan-950/20 ring-1 ring-[#38bdf8]'
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30'
                        : 'bg-[#21262d] text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    {renderIcon(cat.icon, 'w-4 h-4')}
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${
                      cat.faultFrequency === 'Critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-[#2ea043] border border-emerald-500/30'
                    }`}
                  >
                    {cat.faultFrequency}
                  </span>
                </div>
                <div className="font-semibold text-xs text-white truncate">{cat.name}</div>
                <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{cat.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumb Path Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] overflow-x-auto scrollbar-none text-xs font-mono">
        <span className="text-gray-400 font-semibold shrink-0 flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          PATH:
        </span>
        {breadcrumbList.map((crumb, idx) => {
          const isLast = idx === breadcrumbList.length - 1;
          return (
            <React.Fragment key={crumb.id + idx}>
              <button
                onClick={() => jumpToBreadcrumb(crumb.id)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 ${
                  isLast
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]'
                }`}
                title={crumb.questionSnippet}
              >
                <span>{crumb.title}</span>
              </button>
              {!isLast && <span className="text-gray-600 shrink-0">➔</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Diagnostic Question or Solution Card */}
      {currentNode?.isFinal && currentNode.solution ? (
        /* Final Solution Card */
        <div className="bg-[#161b22] border-2 border-[#2ea043]/50 rounded-2xl p-5 lg:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#2ea043]/15 via-transparent to-transparent pointer-events-none rounded-bl-full"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#2ea043] font-semibold">
                  CompTIA A+ Root Cause Isolation
                </span>
                <h3 className="text-lg lg:text-xl font-bold text-white font-mono">
                  {currentNode.solution.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Confidence:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/40">
                {currentNode.solution.confidence}
              </span>
            </div>
          </div>

          {/* Probable Root Cause */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
            <div className="text-xs font-mono text-gray-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
              Probable Root Cause & Mechanics
            </div>
            <p className="text-xs lg:text-sm text-gray-200 leading-relaxed">
              {currentNode.solution.probableRootCause}
            </p>
            {currentNode.solution.voltageOrSpecCheck && (
              <div className="mt-2 text-xs font-mono text-[#ffd166] bg-[#ffd166]/10 p-2 rounded-lg border border-[#ffd166]/30">
                ⚡ <span className="font-bold">Test Point / Spec:</span> {currentNode.solution.voltageOrSpecCheck}
              </div>
            )}
          </div>

          {/* Safety Warning if present */}
          {currentNode.solution.safetyWarnings && currentNode.solution.safetyWarnings.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs space-y-1">
              <div className="font-mono font-bold flex items-center gap-1.5 text-red-400">
                <ShieldAlert className="w-4 h-4" />
                SAFETY WARNING & ESD DIRECTIVE:
              </div>
              {currentNode.solution.safetyWarnings.map((warn, i) => (
                <p key={i}>{warn}</p>
              ))}
            </div>
          )}

          {/* CompTIA Recommended Bench Tools & Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Bench Tools */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="text-xs font-mono text-gray-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#38bdf8]" />
                Recommended CompTIA Bench Tools
              </div>
              <ul className="space-y-1.5">
                {currentNode.solution.comptiaTools.map((tool, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Repair Steps */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
              <div className="text-xs font-mono text-gray-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#2ea043]" />
                Actionable Fix Steps
              </div>
              <ol className="space-y-2">
                {currentNode.solution.actionSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="font-mono text-[#2ea043] font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Action Footer: Send to Gemini AI & Reset */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#30363d]">
            <button
              onClick={() => resetDiagnostic()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs font-mono transition-colors border border-[#30363d] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <span>Start New Diagnostic Session</span>
            </button>

            <button
              onClick={() => {
                const pathTitles = diagnosticHistory.map(
                  (id) => currentCategory.nodes[id]?.question.substring(0, 40) || id
                );
                sendDiagnosticToGemini(currentNode.solution, currentCategory.name, pathTitles);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#38bdf8] hover:from-[#2ea043] hover:to-[#38bdf8] text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-cyan-950/40 border border-cyan-500/40 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span>Send Diagnostic Summary to Gemini AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Card Question */
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 lg:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          {/* Question Banner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#38bdf8] border border-[#38bdf8]/30">
                DIAGNOSTIC NODE: {currentNode?.id}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Step {diagnosticHistory.length} of Category Tree
              </span>
            </div>

            <h3 className="text-base lg:text-lg font-bold text-white leading-snug font-mono">
              {currentNode?.question}
            </h3>

            {currentNode?.details && (
              <p className="text-xs text-gray-400 leading-relaxed bg-[#0d1117] p-3 rounded-xl border border-[#30363d]/80">
                💡 <span className="font-semibold text-gray-300">Bench Detail:</span> {currentNode.details}
              </p>
            )}

            {currentNode?.compTiaTip && (
              <div className="text-xs font-mono text-[#2ea043] bg-[#2ea043]/10 p-2.5 rounded-xl border border-[#2ea043]/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{currentNode.compTiaTip}</span>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Select Observed Hardware Reaction:
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {currentNode?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectDiagnosticOption(option.nextNodeId)}
                  className="w-full text-left p-4 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#38bdf8] transition-all flex items-center justify-between gap-4 group hover:shadow-md hover:shadow-cyan-950/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#161b22] group-hover:bg-[#38bdf8]/20 border border-[#30363d] group-hover:border-[#38bdf8]/40 flex items-center justify-center font-mono text-xs text-gray-400 group-hover:text-[#38bdf8] font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-200 group-hover:text-white font-medium">
                      {option.text}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#38bdf8] group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
