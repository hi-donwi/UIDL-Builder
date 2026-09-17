import React from "react";
import { useBuilderStore } from "../core/builderStore";
import { findNodeById } from "../core/documentOps";
import { getWidgetManifest } from "../lib/uidlBridge";
import { Sliders, Sparkles, Hash, Code, Info } from "lucide-react";

export function PropertyInspectorPanel() {
  const { document, selectedNodeId, updateNodeProps } = useBuilderStore();

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-[#161b22] select-none">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-xs font-medium text-slate-400">No Component Selected</span>
        <span className="text-[11px] text-slate-600 max-w-xs mt-1">
          Click any component on the canvas or layer tree to customize its properties and styling.
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

  const handlePropChange = (propName: string, value: unknown) => {
    updateNodeProps(selectedNode.id, {
      [propName]: value,
    });
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

      {/* Property Controls Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Properties */}
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

        {/* Styling & Utility Classes */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Styling (Tailwind)
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
            Direct Tailwind utility classes passed directly to the UIDL component renderer.
          </p>
        </div>
      </div>
    </div>
  );
}
