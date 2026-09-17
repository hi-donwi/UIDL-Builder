import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import { findNodeById } from "../core/documentOps";
import { getWidgetManifest } from "../lib/uidlBridge";
import {
  Sliders,
  Sparkles,
  Hash,
  Code,
  Zap,
  Palette,
  Plus,
  Trash2,
  Play,
  ArrowRight,
  Settings,
  Bell,
  Navigation,
  Database,
  Layers,
} from "lucide-react";
import clsx from "clsx";

type TabMode = "props" | "styles" | "events";

type ActionType = "showSnackbar" | "showDialog" | "setState" | "navigate" | "api" | "mutate" | "custom";

const COMMON_EVENTS = ["onClick", "onChange", "onSubmit", "onSelect", "onRowClick", "onBlur"];

export function PropertyInspectorPanel() {
  const { document, selectedNodeId, updateNodeProps, updateNodeEvents, updateNodeStyle } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<TabMode>("props");
  const [newEventTrigger, setNewEventTrigger] = useState("onClick");

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#161b22] select-none">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-xs font-medium text-slate-400">No Component Selected</span>
        <span className="text-[11px] text-slate-600 max-w-xs mt-1">
          Click any component on the canvas or layer tree to customize its properties, styling, and event actions.
        </span>
      </div>
    );
  }

  const selectedNode = findNodeById(document.root, selectedNodeId);

  if (!selectedNode) {
    return null;
  }

  const manifest = getWidgetManifest(selectedNode.type);
  const currentProps = selectedNode.props || {};
  const currentEvents = (selectedNode.events || {}) as Record<string, Record<string, unknown>>;
  const currentStyle = (selectedNode.style || {}) as Record<string, unknown>;

  const handlePropChange = (propName: string, value: unknown) => {
    updateNodeProps(selectedNode.id, {
      [propName]: value,
    });
  };

  const handleStyleChange = (key: string, value: unknown) => {
    updateNodeStyle(selectedNode.id, {
      [key]: value,
    });
  };

  // Helper to detect action type from an action object
  const getActionType = (actionObj: unknown): ActionType => {
    if (!actionObj || typeof actionObj !== "object") return "showSnackbar";
    const keys = Object.keys(actionObj);
    if (keys.includes("showSnackbar")) return "showSnackbar";
    if (keys.includes("showDialog")) return "showDialog";
    if (keys.includes("setState")) return "setState";
    if (keys.includes("navigate")) return "navigate";
    if (keys.includes("api")) return "api";
    if (keys.includes("mutate")) return "mutate";
    return "custom";
  };

  const handleAddEvent = () => {
    if (!newEventTrigger) return;
    const defaultAction = {
      showSnackbar: {
        message: `${selectedNode.type} triggered ${newEventTrigger}`,
        duration: 3000,
      },
    };
    const updated = {
      ...currentEvents,
      [newEventTrigger]: defaultAction,
    };
    updateNodeEvents(selectedNode.id, updated);
  };

  const handleRemoveEvent = (eventKey: string) => {
    const updated = { ...currentEvents };
    delete updated[eventKey];
    updateNodeEvents(selectedNode.id, updated);
  };

  const handleChangeActionType = (eventKey: string, newType: ActionType) => {
    let actionPayload: Record<string, unknown> = {};

    switch (newType) {
      case "showSnackbar":
        actionPayload = {
          showSnackbar: {
            message: "Operation completed successfully.",
            duration: 3000,
          },
        };
        break;
      case "showDialog":
        actionPayload = {
          showDialog: {
            title: "Confirmation",
            content: "Are you sure you want to proceed with this request?",
          },
        };
        break;
      case "setState":
        actionPayload = {
          setState: {
            path: "state.activeItem",
            value: "updated",
          },
        };
        break;
      case "navigate":
        actionPayload = {
          navigate: {
            route: "/dashboard",
          },
        };
        break;
      case "api":
        actionPayload = {
          api: {
            url: "/api/v1/resource",
            method: "POST",
          },
        };
        break;
      case "mutate":
        actionPayload = {
          mutate: {
            collection: "records",
            operation: "create",
          },
        };
        break;
      case "custom":
      default:
        actionPayload = {
          showSnackbar: { message: "Custom action" },
        };
        break;
    }

    const updated = {
      ...currentEvents,
      [eventKey]: actionPayload,
    };
    updateNodeEvents(selectedNode.id, updated);
  };

  const handleUpdateActionPayload = (eventKey: string, updatedAction: Record<string, unknown>) => {
    const updated = {
      ...currentEvents,
      [eventKey]: updatedAction,
    };
    updateNodeEvents(selectedNode.id, updated);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22] text-xs">
      {/* Header Info */}
      <div className="p-3 border-b border-white/10 shrink-0 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedNode.type}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            {manifest?.category || "custom"}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-mono">
          <Hash className="w-3 h-3 text-slate-600" />
          <span>{selectedNode.id}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-white/10 bg-black/30 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("props")}
          className={clsx(
            "flex-1 py-2 flex items-center justify-center gap-1.5 transition-all border-b-2",
            activeTab === "props"
              ? "border-cyan-400 text-cyan-300 bg-white/[0.04]"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Props</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={clsx(
            "flex-1 py-2 flex items-center justify-center gap-1.5 transition-all border-b-2",
            activeTab === "styles"
              ? "border-cyan-400 text-cyan-300 bg-white/[0.04]"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Styles</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={clsx(
            "flex-1 py-2 flex items-center justify-center gap-1.5 transition-all border-b-2",
            activeTab === "events"
              ? "border-cyan-400 text-cyan-300 bg-white/[0.04]"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Events ({Object.keys(currentEvents).length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab: Props */}
        {activeTab === "props" && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Component Properties
            </span>

            {manifest?.propDescriptors && manifest.propDescriptors.length > 0 ? (
              manifest.propDescriptors.map((desc) => {
                const val = currentProps[desc.name];

                return (
                  <div key={desc.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-medium capitalize">
                        {desc.name}
                      </label>
                      {desc.type === "enum" && (
                        <span className="text-[9px] text-slate-500 uppercase font-mono">select</span>
                      )}
                    </div>

                    {desc.type === "enum" && desc.values ? (
                      <select
                        value={String(val ?? "")}
                        onChange={(e) => handlePropChange(desc.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="">(default)</option>
                        {desc.values.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : desc.type === "boolean" ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handlePropChange(desc.name, e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-slate-400 text-[11px]">Enable {desc.name}</span>
                      </div>
                    ) : desc.type === "number" ? (
                      <input
                        type="number"
                        value={typeof val === "number" ? val : ""}
                        onChange={(e) => handlePropChange(desc.name, parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(val ?? "")}
                        placeholder={desc.description || `Enter ${desc.name}...`}
                        onChange={(e) => handlePropChange(desc.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    )}

                    {desc.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">{desc.description}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-500 italic">No customizable properties exposed.</p>
            )}
          </div>
        )}

        {/* Tab: Styles */}
        {activeTab === "styles" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Tailwind Utility Classes
                </span>
                <Code className="w-3 h-3 text-slate-500" />
              </div>

              <textarea
                rows={3}
                placeholder="e.g. p-4 bg-slate-800 rounded-xl shadow-md..."
                value={String(currentProps.className ?? "")}
                onChange={(e) => handlePropChange("className", e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px] placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="text-[10px] text-slate-500">
                Direct Tailwind CSS utility classes rendered directly by the runtime engine.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                UIDL Style Tokens
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400 text-[11px]">Padding</label>
                  <input
                    type="text"
                    placeholder="e.g. p-4 or {spacing.md}"
                    value={String(currentStyle.padding ?? "")}
                    onChange={(e) => handleStyleChange("padding", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Gap</label>
                  <input
                    type="text"
                    placeholder="e.g. gap-3 or {spacing.sm}"
                    value={String(currentStyle.gap ?? "")}
                    onChange={(e) => handleStyleChange("gap", e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Events & Actions */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {/* Add Event Form */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Attach Event Trigger</span>
              </span>

              <div className="flex items-center gap-1.5">
                <select
                  value={newEventTrigger}
                  onChange={(e) => setNewEventTrigger(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  {COMMON_EVENTS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddEvent}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bind</span>
                </button>
              </div>
            </div>

            {/* Configured Events List */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Configured Event Handlers
              </span>

              {Object.keys(currentEvents).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-slate-500 text-[11px]">
                  No events bound to this component yet. Select an event trigger above to attach an interactive action.
                </div>
              ) : (
                Object.entries(currentEvents).map(([eventKey, actionVal]) => {
                  const actionType = getActionType(actionVal);

                  return (
                    <div
                      key={eventKey}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5"
                    >
                      {/* Event Card Header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-cyan-300">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{eventKey}</span>
                        </div>

                        <button
                          onClick={() => handleRemoveEvent(eventKey)}
                          title="Remove event"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Type Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">
                          Action Type
                        </label>
                        <select
                          value={actionType}
                          onChange={(e) => handleChangeActionType(eventKey, e.target.value as ActionType)}
                          className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="showSnackbar">showSnackbar (Toast notification)</option>
                          <option value="showDialog">showDialog (Modal confirmation)</option>
                          <option value="setState">setState (Document state update)</option>
                          <option value="navigate">navigate (Client-side routing)</option>
                          <option value="api">api (HTTP REST Request)</option>
                          <option value="mutate">mutate (Data store mutation)</option>
                          <option value="custom">custom (Raw JSON payload)</option>
                        </select>
                      </div>

                      {/* Dynamic Action Fields */}
                      {actionType === "showSnackbar" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">Message</label>
                            <input
                              type="text"
                              value={String((actionVal as { showSnackbar?: { message?: string } })?.showSnackbar?.message ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  showSnackbar: {
                                    message: e.target.value,
                                    duration: (actionVal as { showSnackbar?: { duration?: number } })?.showSnackbar?.duration ?? 3000,
                                  },
                                })
                              }
                              placeholder="e.g. Profile updated successfully"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Duration (ms)</label>
                            <input
                              type="number"
                              value={Number((actionVal as { showSnackbar?: { duration?: number } })?.showSnackbar?.duration ?? 3000)}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  showSnackbar: {
                                    message: (actionVal as { showSnackbar?: { message?: string } })?.showSnackbar?.message ?? "",
                                    duration: parseInt(e.target.value, 10) || 3000,
                                  },
                                })
                              }
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "showDialog" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">Dialog Title</label>
                            <input
                              type="text"
                              value={String((actionVal as { showDialog?: { title?: string } })?.showDialog?.title ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  showDialog: {
                                    title: e.target.value,
                                    content: (actionVal as { showDialog?: { content?: string } })?.showDialog?.content ?? "",
                                  },
                                })
                              }
                              placeholder="e.g. Confirm Submission"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Dialog Message / Content</label>
                            <textarea
                              rows={2}
                              value={String((actionVal as { showDialog?: { content?: string } })?.showDialog?.content ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  showDialog: {
                                    title: (actionVal as { showDialog?: { title?: string } })?.showDialog?.title ?? "",
                                    content: e.target.value,
                                  },
                                })
                              }
                              placeholder="e.g. Please verify all information before proceeding."
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "setState" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">State Path</label>
                            <input
                              type="text"
                              value={String((actionVal as { setState?: { path?: string } })?.setState?.path ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  setState: {
                                    path: e.target.value,
                                    value: (actionVal as { setState?: { value?: unknown } })?.setState?.value ?? "",
                                  },
                                })
                              }
                              placeholder="e.g. state.user.name or state.counter"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Value</label>
                            <input
                              type="text"
                              value={String((actionVal as { setState?: { value?: unknown } })?.setState?.value ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  setState: {
                                    path: (actionVal as { setState?: { path?: string } })?.setState?.path ?? "",
                                    value: e.target.value,
                                  },
                                })
                              }
                              placeholder="New state value"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "navigate" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">Route URL</label>
                            <input
                              type="text"
                              value={String((actionVal as { navigate?: { route?: string } })?.navigate?.route ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  navigate: {
                                    route: e.target.value,
                                  },
                                })
                              }
                              placeholder="e.g. /dashboard or /orders/details"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "api" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">Endpoint URL</label>
                            <input
                              type="text"
                              value={String((actionVal as { api?: { url?: string } })?.api?.url ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  api: {
                                    url: e.target.value,
                                    method: (actionVal as { api?: { method?: string } })?.api?.method || "POST",
                                  },
                                })
                              }
                              placeholder="e.g. /api/v1/checkout"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">HTTP Method</label>
                            <select
                              value={String((actionVal as { api?: { method?: string } })?.api?.method ?? "POST")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  api: {
                                    url: (actionVal as { api?: { url?: string } })?.api?.url || "",
                                    method: e.target.value,
                                  },
                                })
                              }
                              className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {actionType === "mutate" && (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400">Collection</label>
                            <input
                              type="text"
                              value={String((actionVal as { mutate?: { collection?: string } })?.mutate?.collection ?? "")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  mutate: {
                                    collection: e.target.value,
                                    operation: (actionVal as { mutate?: { operation?: string } })?.mutate?.operation || "create",
                                  },
                                })
                              }
                              placeholder="e.g. customers, orders"
                              className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Operation</label>
                            <select
                              value={String((actionVal as { mutate?: { operation?: string } })?.mutate?.operation ?? "create")}
                              onChange={(e) =>
                                handleUpdateActionPayload(eventKey, {
                                  mutate: {
                                    collection: (actionVal as { mutate?: { collection?: string } })?.mutate?.collection || "",
                                    operation: e.target.value,
                                  },
                                })
                              }
                              className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px]"
                            >
                              <option value="create">create</option>
                              <option value="update">update</option>
                              <option value="delete">delete</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {actionType === "custom" && (
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] text-slate-400">Raw JSON Action</label>
                          <textarea
                            rows={4}
                            value={JSON.stringify(actionVal, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleUpdateActionPayload(eventKey, parsed);
                              } catch {
                                // Keep raw text while editing
                              }
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-cyan-300 font-mono text-[10px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Note on testing actions */}
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-start gap-2">
              <Play className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                Switch to <strong>Preview Mode</strong> in the canvas top bar to interactively trigger and test your actions live with the UIDL Runtime interpreter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
