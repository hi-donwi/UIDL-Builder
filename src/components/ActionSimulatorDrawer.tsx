import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import {
  Terminal,
  Activity,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Wifi,
  Sliders,
  Send,
  ArrowRight,
  Database,
  Navigation,
  Bell,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";

export function ActionSimulatorDrawer() {
  const {
    isActionSimulatorOpen,
    setIsActionSimulatorOpen,
    actionLogs,
    clearActionLogs,
    mockLatencyMs,
    setMockLatencyMs,
    mockHttpStatus,
    setMockHttpStatus,
  } = useBuilderStore();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isActionSimulatorOpen) return null;

  const filteredLogs = actionLogs.filter((log) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "api") return log.type === "api" || log.type === "mutate";
    if (activeFilter === "nav") return log.type === "navigate";
    if (activeFilter === "state") return log.type === "setState";
    if (activeFilter === "feedback") return log.type === "snackbar" || log.type === "dialog";
    return true;
  });

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(actionLogs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "api":
      case "mutate":
        return <Database className="w-3.5 h-3.5 text-cyan-400" />;
      case "navigate":
        return <Navigation className="w-3.5 h-3.5 text-blue-400" />;
      case "setState":
        return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
      case "snackbar":
        return <Bell className="w-3.5 h-3.5 text-amber-400" />;
      case "dialog":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="h-64 border-t border-white/15 bg-[#161b22] flex flex-col shrink-0 z-30 shadow-2xl text-xs select-none">
      {/* Header Bar */}
      <div className="h-10 px-4 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Interactive Action Simulator & Console</span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
            {actionLogs.length} events recorded
          </span>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/5 ml-2">
            {[
              { id: "all", label: "All" },
              { id: "api", label: "API / Mutate" },
              { id: "nav", label: "Navigate" },
              { id: "state", label: "State" },
              { id: "feedback", label: "Feedback" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={clsx(
                  "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                  activeFilter === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Network simulation controls & drawer actions */}
        <div className="flex items-center gap-3">
          {/* Latency simulation */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Latency:</span>
            <select
              value={mockLatencyMs}
              onChange={(e) => setMockLatencyMs(Number(e.target.value))}
              className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-white text-[10px] focus:outline-none"
            >
              <option value="0">0ms (Instant)</option>
              <option value="150">150ms (Fast)</option>
              <option value="500">500ms (3G)</option>
              <option value="1000">1000ms (Slow)</option>
            </select>
          </div>

          {/* HTTP Status Simulation */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span>Mock Status:</span>
            <select
              value={mockHttpStatus}
              onChange={(e) => setMockHttpStatus(Number(e.target.value))}
              className={clsx(
                "px-1.5 py-0.5 rounded bg-black/50 border font-bold text-[10px] focus:outline-none",
                mockHttpStatus === 200
                  ? "border-emerald-500/40 text-emerald-400"
                  : mockHttpStatus === 400
                  ? "border-amber-500/40 text-amber-400"
                  : "border-rose-500/40 text-rose-400"
              )}
            >
              <option value="200">200 OK</option>
              <option value="400">400 Bad Request</option>
              <option value="500">500 Internal Error</option>
            </select>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={handleCopyLogs}
            disabled={actionLogs.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 text-[11px] hover:bg-white/5 transition-colors"
            title="Copy trace JSON"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={clearActionLogs}
            disabled={actionLogs.length === 0}
            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-400 disabled:opacity-30 hover:bg-white/5 transition-colors"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsActionSimulatorOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Minimize Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Log stream */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 border-r border-white/10">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
              <Activity className="w-6 h-6 text-slate-600 mb-1.5 animate-pulse" />
              <p className="text-xs font-medium text-slate-400">No actions intercepted yet</p>
              <p className="text-[11px] text-slate-600 max-w-sm mt-0.5">
                Switch to Preview Mode and click interactive components (Buttons, Forms, Links) to observe runtime API dispatches, state transitions, and dialog flows.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLogId === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                  className={clsx(
                    "flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all border font-mono text-[11px]",
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500/30 text-white"
                      : "border-transparent bg-black/20 text-slate-300 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <div className="flex items-center gap-1 shrink-0">{getActionIcon(log.type)}</div>
                    <span
                      className={clsx(
                        "px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider",
                        log.type === "api" || log.type === "mutate"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : log.type === "navigate"
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : log.type === "setState"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      )}
                    >
                      {log.type}
                    </span>
                    <span className="truncate text-slate-200">{log.summary}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={clsx(
                        "px-1.5 py-0.2 rounded text-[10px] font-semibold",
                        log.status === "success"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      )}
                    >
                      {log.status === "success" ? "OK" : "ERR"}
                    </span>
                    {log.latencyMs !== undefined && (
                      <span className="text-[10px] text-slate-500">{log.latencyMs}ms</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Log Payload Inspector */}
        <div className="w-80 bg-black/40 overflow-y-auto p-3 text-[11px] font-mono">
          {selectedLogId ? (
            (() => {
              const item = actionLogs.find((l) => l.id === selectedLogId);
              if (!item) return null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-cyan-300">{item.type.toUpperCase()} Payload</span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                      Request Parameters:
                    </span>
                    <pre className="p-2 rounded bg-black/60 border border-white/5 text-slate-300 overflow-x-auto text-[10px] leading-relaxed">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>

                  {item.response && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                        Simulated Mock Response:
                      </span>
                      <pre className="p-2 rounded bg-black/60 border border-emerald-500/20 text-emerald-300 overflow-x-auto text-[10px] leading-relaxed">
                        {JSON.stringify(item.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
              <Terminal className="w-5 h-5 mb-1 text-slate-700" />
              <span>Select any event from the timeline to inspect its payload details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
