import React, { useState, useEffect } from "react";
import { useBuilderStore } from "./core/builderStore";
import { CanvasViewport } from "./components/CanvasViewport";
import { WidgetPalettePanel } from "./components/WidgetPalettePanel";
import { LayerTreePanel } from "./components/LayerTreePanel";
import { TemplateGalleryPanel } from "./components/TemplateGalleryPanel";
import { PropertyInspectorPanel } from "./components/PropertyInspectorPanel";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { ImportExportModal } from "./components/ImportExportModal";
import { StateDataModal } from "./components/StateDataModal";
import {
  Boxes,
  Layers,
  LayoutTemplate,
  Code2,
  Undo2,
  Redo2,
  Sun,
  Moon,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import clsx from "clsx";

export default function App() {
  const {
    document,
    themeMode,
    canUndo,
    canRedo,
    activeSidebarTab,
    validationErrors,
    selectedNodeId,
    undo,
    redo,
    duplicateNode,
    deleteNode,
    selectNode,
    setThemeMode,
    setActiveSidebarTab,
  } = useBuilderStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState<"export" | "snippet" | "import">("export");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Global Canvas Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.tagName === "SELECT";

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z (without Shift)
      if (isCmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (!isEditing && canUndo) {
          e.preventDefault();
          undo();
        }
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      else if (
        (isCmdOrCtrl && e.key.toLowerCase() === "y") ||
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        if (!isEditing && canRedo) {
          e.preventDefault();
          redo();
        }
      }
      // Duplicate: Ctrl+D
      else if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        if (!isEditing && selectedNodeId) {
          e.preventDefault();
          duplicateNode(selectedNodeId);
        }
      }
      // Delete: Delete or Backspace
      else if (e.key === "Delete" || (e.key === "Backspace" && !isEditing)) {
        if (!isEditing && selectedNodeId && selectedNodeId !== document.root.id) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
      // Deselect: Escape
      else if (e.key === "Escape") {
        if (!isEditing) {
          e.preventDefault();
          selectNode(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, selectedNodeId, document.root.id, undo, redo, duplicateNode, deleteNode, selectNode]);

  const openExportModal = () => {
    setModalDefaultTab("export");
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setModalDefaultTab("import");
    setIsModalOpen(true);
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans ${themeMode === "dark" ? "dark" : ""}`}>
      {/* Top Navbar */}
      <header className="h-14 px-4 border-b border-white/10 bg-[#161b22] flex items-center justify-between shrink-0 select-none z-30 shadow-md">
        {/* Left: Brand & Doc info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/25">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-white tracking-tight">
                <span>UIDL</span>
                <span className="text-cyan-400">Builder</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  v0.1
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {document.name || "Untitled Document"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              #{document.id || "doc"}
            </span>
          </div>
        </div>

        {/* Center: Undo/Redo & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y or Cmd+Shift+Z)"
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Validation badge */}
          <div
            className={clsx(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all",
              validationErrors.length === 0
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
            title={
              validationErrors.length === 0
                ? "Document matches UIDL schema specification"
                : `${validationErrors.length} validation errors found`
            }
          >
            {validationErrors.length === 0 ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Schema Valid</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>{validationErrors.length} Errors</span>
              </>
            )}
          </div>
        </div>

        {/* Right: State & Data, Theme, Import/Export, GitHub */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs transition-colors"
            title="Manage reactive state variables and datasets"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">State & Data</span>
          </button>

          <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
            title={`Toggle Theme (Current: ${themeMode})`}
          >
            {themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={openExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export / Share</span>
          </button>

          <a
            href="https://github.com/hi-donwi/UIDL-Builder"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title="View on GitHub (Public Repository)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Workspace 3-Pane Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <aside
          className={clsx(
            "border-r border-white/10 bg-[#161b22] flex flex-col shrink-0 z-20 transition-all duration-200 overflow-hidden",
            leftSidebarCollapsed ? "w-12" : "w-80"
          )}
        >
          {/* Navigation Tab Icons */}
          <div className="flex items-center border-b border-white/10 bg-black/30 shrink-0">
            <button
              onClick={() => {
                setActiveSidebarTab("palette");
                setLeftSidebarCollapsed(false);
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                activeSidebarTab === "palette" && !leftSidebarCollapsed
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
              title="Widget Palette"
            >
              <Boxes className="w-3.5 h-3.5" />
              {!leftSidebarCollapsed && <span>Widgets</span>}
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab("layers");
                setLeftSidebarCollapsed(false);
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                activeSidebarTab === "layers" && !leftSidebarCollapsed
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
              title="Layer Hierarchy"
            >
              <Layers className="w-3.5 h-3.5" />
              {!leftSidebarCollapsed && <span>Layers</span>}
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab("templates");
                setLeftSidebarCollapsed(false);
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                activeSidebarTab === "templates" && !leftSidebarCollapsed
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
              title="Starter Templates"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              {!leftSidebarCollapsed && <span>Templates</span>}
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab("json");
                setLeftSidebarCollapsed(false);
              }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                activeSidebarTab === "json" && !leftSidebarCollapsed
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.03]"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
              title="Raw JSON Document Editor"
            >
              <Code2 className="w-3.5 h-3.5" />
              {!leftSidebarCollapsed && <span>JSON</span>}
            </button>

            <button
              onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              className="px-2 py-2.5 text-slate-400 hover:text-white border-l border-white/5 transition-colors"
              title={leftSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {leftSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Left Panel Active Body */}
          {!leftSidebarCollapsed && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeSidebarTab === "palette" && <WidgetPalettePanel />}
              {activeSidebarTab === "layers" && <LayerTreePanel />}
              {activeSidebarTab === "templates" && <TemplateGalleryPanel />}
              {activeSidebarTab === "json" && <CodeMirrorEditor />}
            </div>
          )}
        </aside>

        {/* Center: Live Interactive Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0d1117] relative">
          <CanvasViewport />
        </main>

        {/* Right Sidebar: Property Inspector */}
        <aside
          className={clsx(
            "border-l border-white/10 bg-[#161b22] flex flex-col shrink-0 z-20 transition-all duration-200 overflow-hidden",
            rightSidebarCollapsed ? "w-10" : "w-84"
          )}
        >
          {/* Header */}
          <div className="h-10 px-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/30 text-xs">
            {!rightSidebarCollapsed && (
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspector</span>
              </div>
            )}
            <button
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              className="p-1 text-slate-400 hover:text-white transition-colors ml-auto"
              title={rightSidebarCollapsed ? "Expand inspector" : "Collapse inspector"}
            >
              {rightSidebarCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Inspector Body */}
          {!rightSidebarCollapsed && <PropertyInspectorPanel />}
        </aside>
      </div>

      {/* Modals */}
      <ImportExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab={modalDefaultTab}
      />

      <StateDataModal
        isOpen={isStateModalOpen}
        onClose={() => setIsStateModalOpen(false)}
      />
    </div>
  );
}
