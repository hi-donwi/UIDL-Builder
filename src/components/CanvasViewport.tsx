import React, { useRef, useState } from "react";
import { UIDocumentRenderer, meridianDarkTheme, meridianLightTheme } from "uidl-runtime";
import { useBuilderStore } from "../core/builderStore";
import { findNodeAncestors } from "../core/documentOps";
import { buildCustomizedTheme, generateCanvasStyleVars } from "../core/themeTokens";
import { SelectionOverlay } from "./SelectionOverlay";
import { PageTabBar } from "./PageTabBar";
import { ActionSimulatorDrawer } from "./ActionSimulatorDrawer";
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  Plus,
  ChevronRight,
  Terminal,
} from "lucide-react";
import clsx from "clsx";

export function CanvasViewport() {
  const {
    document,
    viewport,
    themeMode,
    themeConfig,
    canvasZoom,
    showGrid,
    previewMode,
    selectedNodeId,
    pages,
    switchPage,
    logAction,
    mockLatencyMs,
    mockHttpStatus,
    isActionSimulatorOpen,
    setIsActionSimulatorOpen,
    setViewport,
    setCanvasZoom,
    setShowGrid,
    setPreviewMode,
    selectNode,
    addNode,
  } = useBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Breadcrumb ancestors hierarchy
  const ancestors = !previewMode && selectedNodeId ? findNodeAncestors(document.root, selectedNodeId) : null;

  // Customized theme & dynamic styles
  const baseTheme = themeMode === "dark" ? meridianDarkTheme : meridianLightTheme;
  const activeTheme = buildCustomizedTheme(baseTheme, themeConfig);
  const canvasStyleVars = generateCanvasStyleVars(themeMode, themeConfig);

  // Click-to-select in canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (previewMode) return;
    const target = (e.target as HTMLElement).closest("[data-uidl-id], [id]");
    if (target) {
      const id = target.getAttribute("data-uidl-id") || target.id;
      if (id) {
        e.stopPropagation();
        selectNode(id);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (previewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (previewMode) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (previewMode) return;
    e.preventDefault();
    setIsDragOver(false);

    const widgetType = e.dataTransfer.getData("application/uidl-widget");
    if (!widgetType) return;

    // Check if drop target is a specific element inside canvas
    const targetElement = (e.target as HTMLElement).closest("[data-uidl-id], [id]");
    const targetId = targetElement?.getAttribute("data-uidl-id") || targetElement?.id;

    addNode(targetId || selectedNodeId, widgetType);
  };

  // Route navigation interceptor in Preview mode
  const handleRouteChange = (route: string | Record<string, unknown>) => {
    const routeStr =
      typeof route === "object" && route !== null
        ? (route.route as string) || (route.path as string) || "/"
        : String(route || "/");

    logAction({
      type: "navigate",
      summary: `Navigate to route: ${routeStr}`,
      payload: typeof route === "object" && route !== null ? route : { route: routeStr },
      status: "success",
    });

    const normalized = routeStr.startsWith("/") ? routeStr : `/${routeStr}`;
    const matchingPage = pages.find((p) => p.route === normalized || p.route === routeStr);
    if (matchingPage) {
      switchPage(matchingPage.id);
    }
  };

  // Mutation interceptor for Mock API
  const handleMutation = async (mutation: any) => {
    if (mockLatencyMs > 0) {
      await new Promise((r) => setTimeout(r, mockLatencyMs));
    }
    const isSuccess = mockHttpStatus === 200;
    const responsePayload = isSuccess
      ? { success: true, id: `mock_${Date.now()}` }
      : { success: false, error: `Simulated Error HTTP ${mockHttpStatus}` };

    logAction({
      type: "mutate",
      summary: `Mutate ${mutation.collection || "records"}.${mutation.operation || "update"}`,
      payload: mutation,
      response: responsePayload,
      status: isSuccess ? "success" : "error",
      latencyMs: mockLatencyMs,
    });
    return responsePayload;
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "w-[375px] min-h-[667px]";
      case "tablet":
        return "w-[768px] min-h-[800px]";
      case "desktop":
      default:
        return "w-full min-h-[850px]";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117] select-none relative">
      {/* Multi-Page Tab Bar */}
      <PageTabBar />

      {/* Canvas Controls Bar */}
      <div className="h-10 px-4 border-b border-white/10 bg-[#161b22] flex items-center justify-between shrink-0 text-xs">
        {/* Viewport device switcher */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setViewport("desktop")}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all",
              viewport === "desktop"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Desktop Viewport (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all",
              viewport === "tablet"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all",
              viewport === "mobile"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
            title="Mobile Viewport (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Center: Selected Element Action bar */}
        {!previewMode && selectedNodeId && (
          <div className="hidden md:flex items-center">
            <SelectionOverlay />
          </div>
        )}

        {/* Right side: Action Console, Zoom & Preview Mode */}
        <div className="flex items-center gap-3">
          {/* Action Simulator Console Toggle */}
          <button
            onClick={() => setIsActionSimulatorOpen(!isActionSimulatorOpen)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all text-xs",
              isActionSimulatorOpen
                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 font-semibold"
                : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            )}
            title="Toggle Interactive Action Simulator & Event Console"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Console</span>
          </button>

          <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg border border-white/5 text-slate-400">
            <button
              onClick={() => setCanvasZoom(canvasZoom - 10)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono">{canvasZoom}%</span>
            <button
              onClick={() => setCanvasZoom(canvasZoom + 10)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={clsx(
              "p-1.5 rounded-lg border transition-all",
              showGrid
                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                : "border-white/10 text-slate-400 hover:text-white"
            )}
            title="Toggle Canvas Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold transition-all",
              previewMode
                ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            )}
            title={previewMode ? "Exit Preview" : "Live Interactive Preview"}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? "Preview Mode" : "Design Mode"}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        className={clsx(
          "flex-1 overflow-auto p-8 flex items-start justify-center transition-all",
          showGrid && "bg-canvas-grid"
        )}
        onClick={() => !previewMode && selectNode(null)}
      >
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            ...canvasStyleVars,
            transform: `scale(${canvasZoom / 100})`,
            transformOrigin: "top center",
          }}
          className={clsx(
            "transition-all duration-200 shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-background relative",
            getViewportWidthClass(),
            previewMode ? "cursor-default" : "cursor-pointer ring-1 ring-white/10"
          )}
        >
          {/* Drag over visual indicator */}
          {isDragOver && (
            <div className="absolute inset-0 z-50 bg-cyan-500/10 border-2 border-dashed border-cyan-400 rounded-2xl flex flex-col items-center justify-center pointer-events-none backdrop-blur-[1px]">
              <div className="bg-black/90 px-4 py-2 rounded-xl border border-cyan-500/50 text-cyan-300 font-semibold text-xs shadow-2xl flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Drop to insert widget into canvas</span>
              </div>
            </div>
          )}

          {/* Device Mockup Header for Tablet/Mobile */}
          {viewport !== "desktop" && (
            <div className="h-6 bg-[#161b22] border-b border-white/10 flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono select-none">
              <span>{viewport === "mobile" ? "iPhone 15" : "iPad Mini"}</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>WiFi</span>
              </div>
            </div>
          )}

          {/* Actual UIDL Runtime Document Renderer */}
          <div className="min-h-full">
            <UIDocumentRenderer
              document={document}
              theme={activeTheme}
              onRouteChange={handleRouteChange}
              mutationHandler={handleMutation}
            />
          </div>
        </div>
      </div>

      {/* Floating Canvas Breadcrumb Hierarchy */}
      {!previewMode && ancestors && ancestors.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#161b22]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xl flex items-center gap-1 text-xs text-slate-300 font-mono max-w-[90vw] overflow-x-auto">
          {ancestors.map((node, index) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <React.Fragment key={node.id}>
                {index > 0 && <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                  }}
                  className={clsx(
                    "px-2 py-0.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1",
                    isSelected
                      ? "text-cyan-300 font-semibold bg-cyan-500/20 border border-cyan-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                  title={`Select ${node.type} (${node.id})`}
                >
                  <span>{node.type}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Bottom Action Simulator Console Drawer */}
      <ActionSimulatorDrawer />
    </div>
  );
}
