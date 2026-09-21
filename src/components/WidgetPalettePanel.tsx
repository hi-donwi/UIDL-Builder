import React, { useState } from "react";
import { getCategorizedWidgets, type WidgetCategoryGroup } from "../lib/uidlBridge";
import { useBuilderStore } from "../core/builderStore";
import {
  Search,
  Plus,
  LayoutGrid,
  FormInput,
  Type,
  Table,
  Navigation,
  MessageSquare,
  Box,
  GripVertical,
  Sparkles,
  Trash2,
  Component,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className="w-4 h-4 text-cyan-400" />,
  FormInput: <FormInput className="w-4 h-4 text-amber-400" />,
  Type: <Type className="w-4 h-4 text-purple-400" />,
  Table: <Table className="w-4 h-4 text-emerald-400" />,
  Navigation: <Navigation className="w-4 h-4 text-sky-400" />,
  MessageSquare: <MessageSquare className="w-4 h-4 text-rose-400" />,
};

export function WidgetPalettePanel() {
  const { document, addNode, addDefinitionInstance, removeDefinition, selectedNodeId } = useBuilderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const categories = getCategorizedWidgets();

  const definitions = document.definitions || {};
  const definitionEntries = Object.entries(definitions);
  const filteredDefinitions = definitionEntries.filter(
    ([key, node]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.name && node.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      node.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      widgets: cat.widgets.filter(
        (w) =>
          w.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.category && w.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.widgets.length > 0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widgetType: string) => {
    e.dataTransfer.setData("application/uidl-widget", widgetType);
    e.dataTransfer.setData("text/plain", widgetType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDefinitionDragStart = (e: React.DragEvent<HTMLDivElement>, defKey: string, defType: string) => {
    e.dataTransfer.setData("application/uidl-definition", defKey);
    e.dataTransfer.setData("application/uidl-widget", defType);
    e.dataTransfer.setData("text/plain", defKey);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22]">
      {/* Search Filter */}
      <div className="p-3 border-b border-white/10 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search widgets & definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories and Widgets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Reusable Component Definitions */}
        {filteredDefinitions.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Reusable Templates
              </span>
              <span className="text-[10px] text-cyan-500/80 font-mono ml-auto">
                {filteredDefinitions.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {filteredDefinitions.map(([defKey, defNode]) => (
                <div
                  key={defKey}
                  draggable={true}
                  onDragStart={(e) => handleDefinitionDragStart(e, defKey, defNode.type)}
                  onClick={() => addDefinitionInstance(selectedNodeId, defKey)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400 text-left transition-all group relative cursor-grab active:cursor-grabbing select-none"
                  title={`Click or drag ${defNode.name || defKey} instance into canvas`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Component className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                        {defNode.name || defKey}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                        <span>#{defKey}</span>
                        <span>•</span>
                        <span className="text-cyan-400/80">{defNode.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete reusable definition "${defKey}"?`)) {
                          removeDefinition(defKey);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10"
                      title="Delete definition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {filteredCategories.map((group) => (
          <div key={group.id} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              {CATEGORY_ICONS[group.iconName] || <Box className="w-4 h-4 text-slate-400" />}
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {group.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">
                {group.widgets.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {group.widgets.map((widget) => (
                <div
                  key={widget.type}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, widget.type)}
                  onClick={() => addNode(selectedNodeId, widget.type)}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.07] hover:border-cyan-500/40 text-left transition-all group relative cursor-grab active:cursor-grabbing select-none"
                  title={`Click or drag ${widget.type} into canvas`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {widget.type}
                    </span>
                    <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {widget.acceptsChildren ? "Container" : "Leaf node"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
