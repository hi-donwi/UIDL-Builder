import React from "react";
import { useBuilderStore } from "../core/builderStore";
import { findParentNode } from "../core/documentOps";
import { Copy, Trash2, ArrowUp, Tag, Sparkles } from "lucide-react";

export function SelectionOverlay() {
  const { document, selectedNodeId, selectNode, duplicateNode, deleteNode, saveNodeAsDefinition } = useBuilderStore();

  if (!selectedNodeId) return null;

  const parentInfo = findParentNode(document.root, selectedNodeId);
  const isRoot = selectedNodeId === document.root.id;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 border border-cyan-500/40 text-xs shadow-lg backdrop-blur-md text-slate-200">
      <div className="flex items-center gap-1 font-mono text-cyan-400 font-semibold pr-1">
        <Tag className="w-3.5 h-3.5" />
        <span>{selectedNodeId}</span>
      </div>

      <div className="h-3 w-px bg-white/15" />

      {parentInfo && (
        <button
          onClick={() => selectNode(parentInfo.parent.id)}
          title={`Select parent: ${parentInfo.parent.type} (${parentInfo.parent.id})`}
          className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      )}

      {!isRoot && (
        <>
          <button
            onClick={() => {
              const defaultKey = selectedNodeId.replace(/_[a-z0-9]+$/, "Template");
              const key = window.prompt("Enter unique key for reusable template (e.g. metricCard, navbarHeader):", defaultKey);
              if (!key || !key.trim()) return;
              const title = window.prompt("Enter display label for template catalog:", key.trim());
              saveNodeAsDefinition(selectedNodeId, key.trim(), title?.trim() || key.trim());
            }}
            title="Save as Reusable Component Template"
            className="p-1 hover:bg-cyan-500/20 hover:text-cyan-300 rounded transition-colors text-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => duplicateNode(selectedNodeId)}
            title="Duplicate component"
            className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => deleteNode(selectedNodeId)}
            title="Delete component"
            className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors text-slate-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
