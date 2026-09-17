import { create } from "zustand";
import type { UIDLDocument, UIDLNode } from "uidl-runtime";
import {
  findNodeById,
  insertChildNode,
  deleteNodeById,
  duplicateNodeById,
  patchNodeProps,
  patchNodeEvents,
  patchNodeStyle,
  moveNode,
  insertSlotChild,
  removeSlotChild,
  patchNodeResponsiveProps,
  generateNodeId,
} from "./documentOps";
import { getWidgetDefaultProps } from "../lib/uidlBridge";
import { validateDocument, type ValidationErrorItem } from "./schemaValidator";
import { TEMPLATES } from "./templateCatalog";
import { DEFAULT_THEME_CONFIG, type ThemeCustomizationConfig } from "./themeTokens";
import { autoFixDocument } from "./documentAuditor";

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "palette" | "layers" | "templates" | "json";

export interface BuilderPage {
  id: string;
  name: string;
  route: string;
  document: UIDLDocument;
}

export interface ActionLogItem {
  id: string;
  timestamp: string;
  type: "api" | "mutate" | "navigate" | "setState" | "snackbar" | "dialog" | "custom";
  summary: string;
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  status: "success" | "pending" | "error";
  latencyMs?: number;
}

export interface BuilderState {
  document: UIDLDocument;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewport: ViewportMode;
  themeMode: "dark" | "light";
  themeConfig: ThemeCustomizationConfig;
  canvasZoom: number;
  previewMode: boolean;
  showGrid: boolean;
  activeSidebarTab: SidebarTab;
  validationErrors: ValidationErrorItem[];
  
  // Modals & Drawers
  isCommandPaletteOpen: boolean;
  isThemeModalOpen: boolean;
  isActionSimulatorOpen: boolean;
  isHealthDrawerOpen: boolean;

  // Multi-page routing
  pages: BuilderPage[];
  activePageId: string;

  // Interactive Mock Action Simulator
  actionLogs: ActionLogItem[];
  mockLatencyMs: number;
  mockHttpStatus: number;

  history: {
    past: UIDLDocument[];
    future: UIDLDocument[];
  };

  // Actions
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
  setThemeMode: (theme: "dark" | "light") => void;
  setThemeConfig: (config: ThemeCustomizationConfig) => void;
  setCanvasZoom: (zoom: number) => void;
  setPreviewMode: (preview: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  
  // Modal visibility actions
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsThemeModalOpen: (open: boolean) => void;
  setIsActionSimulatorOpen: (open: boolean) => void;
  setIsHealthDrawerOpen: (open: boolean) => void;

  // Multi-page actions
  addPage: (name: string, route: string) => void;
  switchPage: (pageId: string) => void;
  renamePage: (pageId: string, name: string, route: string) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  // Action Simulator actions
  logAction: (log: Omit<ActionLogItem, "id" | "timestamp">) => void;
  clearActionLogs: () => void;
  setMockLatencyMs: (ms: number) => void;
  setMockHttpStatus: (status: number) => void;

  // Auto-Fix
  autoFixActiveDocument: () => void;
  
  // Tree manipulations
  addNode: (targetParentId: string | null, type: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  updateNodeEvents: (nodeId: string, events: Record<string, unknown>) => void;
  updateNodeStyle: (nodeId: string, style: Record<string, unknown>) => void;
  updateNodeResponsiveProps: (nodeId: string, breakpoint: "tablet" | "mobile", props: Record<string, unknown>) => void;
  moveNode: (sourceId: string, targetParentId: string, targetIndex?: number) => void;
  insertNodeIntoSlot: (parentId: string, slotName: string, type: string) => void;
  removeNodeFromSlot: (parentId: string, slotName: string, childId: string) => void;
  updateDocumentState: (newState: Record<string, unknown>) => void;
  updateDataSources: (newDataSources: Record<string, unknown>) => void;
  updateDocumentMeta: (meta: { name?: string; id?: string }) => void;
  setDocument: (document: UIDLDocument) => void;
  loadTemplate: (templateId: string) => void;
  
  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const initialPages: BuilderPage[] = [
  {
    id: "page_overview",
    name: "Overview",
    route: "/dashboard",
    document: TEMPLATES[0].document,
  },
  {
    id: "page_records",
    name: "Finances & BMT",
    route: "/finances",
    document: TEMPLATES[1].document,
  },
  {
    id: "page_crm",
    name: "CRM Deals",
    route: "/deals",
    document: TEMPLATES[3].document,
  },
];

const initialDoc: UIDLDocument = initialPages[0].document;

export const useBuilderStore = create<BuilderState>((set, get) => ({
  document: initialDoc,
  selectedNodeId: "header_row",
  hoveredNodeId: null,
  viewport: "desktop",
  themeMode: "dark",
  themeConfig: DEFAULT_THEME_CONFIG,
  canvasZoom: 100,
  previewMode: false,
  showGrid: true,
  activeSidebarTab: "palette",
  validationErrors: [],
  
  isCommandPaletteOpen: false,
  isThemeModalOpen: false,
  isActionSimulatorOpen: false,
  isHealthDrawerOpen: false,

  pages: initialPages,
  activePageId: initialPages[0].id,

  actionLogs: [],
  mockLatencyMs: 150,
  mockHttpStatus: 200,

  history: {
    past: [],
    future: [],
  },
  canUndo: false,
  canRedo: false,

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  setViewport: (viewport) => set({ viewport }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setThemeConfig: (themeConfig) => set({ themeConfig }),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom: Math.min(Math.max(canvasZoom, 50), 150) }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),
  
  setIsCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setIsThemeModalOpen: (isThemeModalOpen) => set({ isThemeModalOpen }),
  setIsActionSimulatorOpen: (isActionSimulatorOpen) => set({ isActionSimulatorOpen }),
  setIsHealthDrawerOpen: (isHealthDrawerOpen) => set({ isHealthDrawerOpen }),

  // Multi-Page Management
  addPage: (name, route) => {
    const { pages } = get();
    const newId = `page_${Date.now().toString(36)}`;
    const blankDoc: UIDLDocument = {
      version: "1.0.0",
      id: newId,
      name,
      route,
      state: {},
      root: {
        id: "root_container",
        type: "Container",
        props: {
          className: "p-8 space-y-6 min-h-[600px] flex flex-col items-center justify-center text-center",
        },
        children: [
          {
            id: `heading_${Date.now().toString(36)}`,
            type: "Text",
            props: {
              value: name,
              className: "text-2xl font-bold tracking-tight text-white",
            },
          },
          {
            id: `subheading_${Date.now().toString(36)}`,
            type: "Text",
            props: {
              value: `Route: ${route} — Insert components from the left widget palette to design this screen.`,
              className: "text-sm text-slate-400 max-w-md",
            },
          },
        ],
      },
    };

    const newPages = [...pages, { id: newId, name, route, document: blankDoc }];
    set({
      pages: newPages,
      activePageId: newId,
      document: blankDoc,
      selectedNodeId: blankDoc.root.id,
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,
    });
  },

  switchPage: (pageId) => {
    const { pages, activePageId, document } = get();
    if (pageId === activePageId) return;
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;

    // Persist current active document in pages
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document } : p));
    const val = validateDocument(target.document);

    set({
      pages: updatedPages,
      activePageId: pageId,
      document: target.document,
      selectedNodeId: target.document.root.id,
      validationErrors: val.errors,
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,
    });
  },

  renamePage: (pageId, name, route) => {
    const { pages, activePageId, document } = get();
    const updatedPages = pages.map((p) =>
      p.id === pageId
        ? {
            ...p,
            name,
            route,
            document: { ...p.document, name, route },
          }
        : p
    );
    set({
      pages: updatedPages,
      document: activePageId === pageId ? { ...document, name, route } : document,
    });
  },

  deletePage: (pageId) => {
    const { pages, activePageId } = get();
    if (pages.length <= 1) return;
    const remaining = pages.filter((p) => p.id !== pageId);
    if (activePageId === pageId) {
      const nextActive = remaining[0];
      const val = validateDocument(nextActive.document);
      set({
        pages: remaining,
        activePageId: nextActive.id,
        document: nextActive.document,
        selectedNodeId: nextActive.document.root.id,
        validationErrors: val.errors,
        history: { past: [], future: [] },
        canUndo: false,
        canRedo: false,
      });
    } else {
      set({ pages: remaining });
    }
  },

  duplicatePage: (pageId) => {
    const { pages } = get();
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    const newId = `page_${Date.now().toString(36)}`;
    const clonedDoc: UIDLDocument = JSON.parse(JSON.stringify(target.document));
    clonedDoc.id = newId;
    clonedDoc.name = `${target.name} (Copy)`;
    clonedDoc.route = `${target.route}-copy`;

    const newPage: BuilderPage = {
      id: newId,
      name: `${target.name} (Copy)`,
      route: `${target.route}-copy`,
      document: clonedDoc,
    };
    set({
      pages: [...pages, newPage],
      activePageId: newId,
      document: clonedDoc,
      selectedNodeId: clonedDoc.root.id,
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,
    });
  },

  // Action Simulator
  logAction: (log) => {
    const newLog: ActionLogItem = {
      ...log,
      id: `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({
      actionLogs: [newLog, ...state.actionLogs].slice(0, 50),
    }));
  },

  clearActionLogs: () => set({ actionLogs: [] }),
  setMockLatencyMs: (mockLatencyMs) => set({ mockLatencyMs }),
  setMockHttpStatus: (mockHttpStatus) => set({ mockHttpStatus }),

  // 1-Click Auto-Fix
  autoFixActiveDocument: () => {
    const { document, history, activePageId, pages } = get();
    const fixed = autoFixDocument(document);
    const val = validateDocument(fixed);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: fixed } : p));

    set({
      document: fixed,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  addNode: (targetParentId, type) => {
    const { document, history, selectedNodeId, activePageId, pages } = get();
    const parentId = targetParentId || selectedNodeId || document.root.id;
    const defaultProps = getWidgetDefaultProps(type);
    const newNode: UIDLNode = {
      id: generateNodeId(type),
      type,
      props: defaultProps,
      children: [],
    };

    const newRoot = insertChildNode(document.root, parentId, newNode);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: newNode.id,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  deleteNode: (nodeId) => {
    const { document, history, activePageId, pages } = get();
    if (nodeId === document.root.id) return;

    const newRoot = deleteNodeById(document.root, nodeId);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: null,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  duplicateNode: (nodeId) => {
    const { document, history, activePageId, pages } = get();
    if (nodeId === document.root.id) return;

    const { newRoot, duplicatedId } = duplicateNodeById(document.root, nodeId);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: duplicatedId || nodeId,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeProps: (nodeId, newProps) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = patchNodeProps(document.root, nodeId, newProps);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeEvents: (nodeId, newEvents) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = patchNodeEvents(document.root, nodeId, newEvents);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeStyle: (nodeId, newStyle) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = patchNodeStyle(document.root, nodeId, newStyle);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeResponsiveProps: (nodeId, breakpoint, newProps) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = patchNodeResponsiveProps(document.root, nodeId, breakpoint, newProps);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  moveNode: (sourceId, targetParentId, targetIndex) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = moveNode(document.root, sourceId, targetParentId, targetIndex);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: sourceId,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  insertNodeIntoSlot: (parentId, slotName, type) => {
    const { document, history, activePageId, pages } = get();
    const defaultProps = getWidgetDefaultProps(type);
    const newNode: UIDLNode = {
      id: generateNodeId(type),
      type,
      props: defaultProps,
      children: [],
    };

    const newRoot = insertSlotChild(document.root, parentId, slotName, newNode);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: newNode.id,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  removeNodeFromSlot: (parentId, slotName, childId) => {
    const { document, history, activePageId, pages } = get();
    const newRoot = removeSlotChild(document.root, parentId, slotName, childId);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: parentId,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateDocumentState: (newState) => {
    const { document, history, activePageId, pages } = get();
    const newDoc: UIDLDocument = {
      ...document,
      state: newState,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateDataSources: (newDataSources) => {
    const { document, history, activePageId, pages } = get();
    const newDoc: UIDLDocument = {
      ...document,
      dataSources: newDataSources,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  updateDocumentMeta: (meta) => {
    const { document, history, activePageId, pages } = get();
    const newDoc: UIDLDocument = {
      ...document,
      ...meta,
    };

    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc, name: meta.name || p.name } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  setDocument: (newDoc) => {
    const { history, activePageId, pages } = get();
    const val = validateDocument(newDoc);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: newDoc } : p));

    set({
      document: newDoc,
      pages: updatedPages,
      selectedNodeId: newDoc.root.id,
      validationErrors: val.errors,
      history: {
        past: [...history.past, get().document],
        future: [],
      },
      canUndo: true,
      canRedo: false,
    });
  },

  loadTemplate: (templateId) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    get().setDocument(JSON.parse(JSON.stringify(tpl.document)));
  },

  undo: () => {
    const { history, document, activePageId, pages } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    const val = validateDocument(previous);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: previous } : p));

    set({
      document: previous,
      pages: updatedPages,
      selectedNodeId: previous.root.id,
      validationErrors: val.errors,
      history: {
        past: newPast,
        future: [document, ...history.future],
      },
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { history, document, activePageId, pages } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);
    const val = validateDocument(next);
    const updatedPages = pages.map((p) => (p.id === activePageId ? { ...p, document: next } : p));

    set({
      document: next,
      pages: updatedPages,
      selectedNodeId: next.root.id,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
        future: newFuture,
      },
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },
}));
