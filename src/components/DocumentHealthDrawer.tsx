import React from "react";
import { useBuilderStore } from "../core/builderStore";
import { auditDocument } from "../core/documentAuditor";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sparkles,
  CheckCircle2,
  X,
  Target,
  Wrench,
} from "lucide-react";
import clsx from "clsx";

export function DocumentHealthDrawer() {
  const {
    isHealthDrawerOpen,
    setIsHealthDrawerOpen,
    document,
    selectNode,
    autoFixActiveDocument,
  } = useBuilderStore();

  if (!isHealthDrawerOpen) return null;

  const report = auditDocument(document);

  const handleFocusNode = (nodeId?: string) => {
    if (nodeId) {
      selectNode(nodeId);
      setIsHealthDrawerOpen(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsHealthDrawerOpen(false)}
    >
      <div
        className="w-full max-w-lg h-full bg-[#161b22] border-l border-white/15 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Document Health & Accessibility
              </h2>
              <p className="text-[11px] text-slate-400">
                Schema verification, accessibility standards, and structural hygiene audit.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHealthDrawerOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Health Score Banner & Auto-Fix */}
        <div className="p-4 border-b border-white/10 bg-black/20 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "px-3 py-1.5 rounded-xl border font-mono font-extrabold text-sm flex items-center gap-1.5",
                  getHealthScoreColor(report.healthScore)
                )}
              >
                <span>{report.healthScore}/100</span>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {report.healthScore === 100
                  ? "Flawless Quality Score"
                  : report.healthScore >= 80
                  ? "Good Structural Integrity"
                  : "Remediation Recommended"}
              </span>
            </div>

            {/* 1-Click Auto Fix All Button */}
            <button
              onClick={autoFixActiveDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              title="Automatically fix duplicate IDs, missing button text, and empty fields"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Auto-Fix</span>
            </button>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="block text-rose-400 font-bold font-mono text-sm">
                {report.errorCount}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Errors</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="block text-amber-400 font-bold font-mono text-sm">
                {report.warningCount}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Warnings</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="block text-blue-400 font-bold font-mono text-sm">
                {report.infoCount}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Suggestions</span>
            </div>
          </div>
        </div>

        {/* Audit Issues List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {report.issues.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Document in pristine condition</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                No schema validation errors, accessibility omissions, or broken bindings detected.
              </p>
            </div>
          ) : (
            report.issues.map((issue) => (
              <div
                key={issue.id}
                className={clsx(
                  "p-3 rounded-xl border transition-colors space-y-1.5",
                  issue.severity === "error"
                    ? "bg-rose-500/5 border-rose-500/20 text-slate-200"
                    : issue.severity === "warning"
                    ? "bg-amber-500/5 border-amber-500/20 text-slate-200"
                    : "bg-blue-500/5 border-blue-500/20 text-slate-200"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {issue.severity === "error" ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-white">{issue.title}</span>
                  </div>

                  <span
                    className={clsx(
                      "px-1.5 py-0.2 rounded text-[9px] uppercase font-mono tracking-wider shrink-0",
                      issue.category === "schema"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : issue.category === "a11y"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : issue.category === "binding"
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    )}
                  >
                    {issue.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{issue.description}</p>

                {/* Focus and Auto-fix buttons */}
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  {issue.nodeId ? (
                    <button
                      onClick={() => handleFocusNode(issue.nodeId)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      <Target className="w-3 h-3" />
                      <span>Focus Component ({issue.nodeId})</span>
                    </button>
                  ) : (
                    <span className="text-slate-600 font-mono">Document-level</span>
                  )}

                  {issue.canAutoFix && (
                    <button
                      onClick={autoFixActiveDocument}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-colors"
                      title="Apply automatic fix"
                    >
                      <Wrench className="w-3 h-3 text-cyan-400" />
                      <span>{issue.autoFixAction || "Auto-Fix"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
