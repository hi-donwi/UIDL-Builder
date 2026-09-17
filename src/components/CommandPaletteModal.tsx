import React, { useState, useEffect, useRef } from "react";
import { useBuilderStore } from "../core/builderStore";
import { defaultRegistry } from "uidl-runtime";
import { TEMPLATES } from "../core/templateCatalog";
import {
  Search,
  Box,
  LayoutTemplate,
  Monitor,
  Tablet,
  Smartphone,
  Database,
  Share2,
  Sun,
  Moon,
  Grid,
  Eye,
  Undo2,
  Redo2,
  ArrowRight,
  Terminal,
} from "lucide-react";
import clsx from "clsx";

interface CommandItem {
  id: string;
  category: "Component" | "Template" | "Viewport" | "Tool";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteModalProps {
  onOpenExportModal: () => void;
  onOpenStateModal: () => void;
}

export function CommandPaletteModal({ onOpenExportModal, onOpenStateModal }: CommandPaletteModalProps) {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    addNode,
    selectedNodeId,
    loadTemplate,
    setViewport,
    setThemeMode,
    themeMode,
    setShowGrid,
    showGrid,
    setPreviewMode,
    previewMode,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBuilderStore();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build command list
  const allCommands: CommandItem[] = [];

  // 1. All Widgets / Components
  const widgets = defaultRegistry.list();
  for (const w of widgets) {
    allCommands.push({
      id: `widget-${w.type}`,
      category: "Component",
      title: `Insert ${w.type}`,
      subtitle: `${w.category || "Widget"} component`,
      icon: <Box className="w-4 h-4 text-cyan-400" />,
      action: () => {
        addNode(selectedNodeId, w.type);
        setIsCommandPaletteOpen(false);
      },
    });
  }

  // 2. Templates
  for (const tpl of TEMPLATES) {
    allCommands.push({
      id: `template-${tpl.id}`,
      category: "Template",
      title: `Load: ${tpl.name}`,
      subtitle: tpl.description,
      icon: <LayoutTemplate className="w-4 h-4 text-purple-400" />,
      action: () => {
        loadTemplate(tpl.id);
        setIsCommandPaletteOpen(false);
      },
    });
  }

  // 3. Viewports
  allCommands.push(
    {
      id: "vp-desktop",
      category: "Viewport",
      title: "Switch to Desktop Viewport",
      subtitle: "Full-width responsive canvas (100%)",
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      action: () => {
        setViewport("desktop");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "vp-tablet",
      category: "Viewport",
      title: "Switch to Tablet Viewport",
      subtitle: "768px tablet emulation view",
      icon: <Tablet className="w-4 h-4 text-blue-400" />,
      action: () => {
        setViewport("tablet");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "vp-mobile",
      category: "Viewport",
      title: "Switch to Mobile Viewport",
      subtitle: "375px mobile screen view",
      icon: <Smartphone className="w-4 h-4 text-blue-400" />,
      action: () => {
        setViewport("mobile");
        setIsCommandPaletteOpen(false);
      },
    }
  );

  // 4. Tools & Actions
  allCommands.push(
    {
      id: "tool-state-data",
      category: "Tool",
      title: "Open State & DataSources Manager",
      subtitle: "Configure reactive state variables, mock datasets, and API endpoints",
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setIsCommandPaletteOpen(false);
        onOpenStateModal();
      },
    },
    {
      id: "tool-export",
      category: "Tool",
      title: "Export & Generate React TSX Code",
      subtitle: "Export UIDL JSON, copy React TSX snippet, or import schema",
      icon: <Share2 className="w-4 h-4 text-amber-400" />,
      action: () => {
        setIsCommandPaletteOpen(false);
        onOpenExportModal();
      },
    },
    {
      id: "tool-theme",
      category: "Tool",
      title: `Toggle Theme Mode (Current: ${themeMode})`,
      subtitle: "Switch between Meridian Dark and Light theme presets",
      icon: themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />,
      action: () => {
        setThemeMode(themeMode === "dark" ? "light" : "dark");
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "tool-grid",
      category: "Tool",
      title: `Toggle Canvas Background Grid (Current: ${showGrid ? "On" : "Off"})`,
      subtitle: "Show or hide canvas alignment grid pattern",
      icon: <Grid className="w-4 h-4 text-cyan-400" />,
      action: () => {
        setShowGrid(!showGrid);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: "tool-preview",
      category: "Tool",
      title: `Toggle Live Preview Mode (Current: ${previewMode ? "Preview" : "Design"})`,
      subtitle: "Switch between interactive live runtime test and visual design mode",
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setPreviewMode(!previewMode);
        setIsCommandPaletteOpen(false);
      },
    }
  );

  if (canUndo) {
    allCommands.push({
      id: "tool-undo",
      category: "Tool",
      title: "Undo Action",
      subtitle: "Revert the last canvas change (Ctrl+Z)",
      icon: <Undo2 className="w-4 h-4 text-slate-400" />,
      action: () => {
        undo();
        setIsCommandPaletteOpen(false);
      },
    });
  }

  if (canRedo) {
    allCommands.push({
      id: "tool-redo",
      category: "Tool",
      title: "Redo Action",
      subtitle: "Reapply the undone canvas change (Ctrl+Y)",
      icon: <Redo2 className="w-4 h-4 text-slate-400" />,
      action: () => {
        redo();
        setIsCommandPaletteOpen(false);
      },
    });
  }

  // Filter commands by search query
  const filtered = allCommands.filter((cmd) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#161b22] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[560px]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-black/40">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, component, or template... (Esc to close)"
            className="w-full bg-transparent border-none text-white text-sm placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No matching commands found</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Try searching for Button, Table, EMR, or Export</p>
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors text-xs",
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/30 text-white"
                      : "text-slate-300 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={clsx(
                        "p-1.5 rounded-lg border",
                        isSelected ? "bg-cyan-500/20 border-cyan-500/30" : "bg-black/30 border-white/5"
                      )}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{cmd.title}</span>
                        <span
                          className={clsx(
                            "px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider",
                            cmd.category === "Component"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : cmd.category === "Template"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : cmd.category === "Viewport"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{cmd.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight
                    className={clsx(
                      "w-3.5 h-3.5 shrink-0 transition-transform ml-2",
                      isSelected ? "text-cyan-400 translate-x-0.5" : "text-slate-600 opacity-0"
                    )}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1 py-0.2 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="text-slate-600 font-mono text-[10px]">{filtered.length} actions</span>
        </div>
      </div>
    </div>
  );
}
