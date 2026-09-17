import React from "react";
import type { UIDLNode } from "uidl-runtime";
import { useBuilderStore } from "../core/builderStore";
import { buildFlatNodeList } from "../core/documentOps";
import { ChevronRight, ChevronDown, Layers, Trash2, Copy, Eye } from "lucide-react";
import clsx from "clsx";

export function LayerTreePanel() {
  const { document, selectedNodeId, selectNode, deleteNode, duplicateNode } = useBuilderStore();
  const flatNodes = buildFlatNodeList(document.root);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22]">
      <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Layer Tree
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {flatNodes.length} nodes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
        {flatNodes.map(({ node, depth }) => {
          const isSelected = selectedNodeId === node.id;
          const hasChildren = node.children && node.children.length > 0;

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                selectNode(node.id);
              }}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              className={clsx(
                "flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-colors group",
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                {hasChildren ? (
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                ) : (
                  <span className="w-3 h-3 flex items-center justify-center shrink-0">
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                  </span>
                )}
                <span className="text-white/90 font-sans font-medium text-xs truncate">
                  {node.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  #{node.id}
                </span>
              </div>

              {node.id !== document.root.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateNode(node.id);
                    }}
                    title="Duplicate node"
                    className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    title="Delete node"
                    className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
