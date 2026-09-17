import { create } from "zustand";
import type { UIDLDocument, UIDLNode } from "uidl-runtime";
import {
  findNodeById,
  insertChildNode,
  deleteNodeById,
  duplicateNodeById,
  patchNodeProps,
  generateNodeId,
} from "./documentOps";
import { getWidgetDefaultProps } from "../lib/uidlBridge";
import { validateDocument, type ValidationErrorItem } from "./schemaValidator";
import { TEMPLATES } from "./templateCatalog";

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "palette" | "layers" | "templates" | "json";

export interface BuilderState {
  document: UIDLDocument;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewport: ViewportMode;
  themeMode: "dark" | "light";
  canvasZoom: number;
  previewMode: boolean;
  showGrid: boolean;
  activeSidebarTab: SidebarTab;
  validationErrors: ValidationErrorItem[];
  history: {
    past: UIDLDocument[];
    future: UIDLDocument[];
  };

  // Actions
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
  setThemeMode: (theme: "dark" | "light") => void;
  setCanvasZoom: (zoom: number) => void;
  setPreviewMode: (preview: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  
  // Tree manipulations
  addNode: (targetParentId: string | null, type: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  setDocument: (document: UIDLDocument) => void;
  loadTemplate: (templateId: string) => void;
  
  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const initialDoc: UIDLDocument = TEMPLATES[0].document;

export const useBuilderStore = create<BuilderState>((set, get) => ({
  document: initialDoc,
  selectedNodeId: "header_row",
  hoveredNodeId: null,
  viewport: "desktop",
  themeMode: "dark",
  canvasZoom: 100,
  previewMode: false,
  showGrid: true,
  activeSidebarTab: "palette",
  validationErrors: [],
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
  setCanvasZoom: (canvasZoom) => set({ canvasZoom: Math.min(Math.max(canvasZoom, 50), 150) }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),

  addNode: (targetParentId, type) => {
    const { document, history, selectedNodeId } = get();
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

    set({
      document: newDoc,
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
    const { document, history, selectedNodeId } = get();
    if (nodeId === document.root.id) return;

    const newRoot = deleteNodeById(document.root, nodeId);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);

    set({
      document: newDoc,
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
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
    const { document, history } = get();
    const { newRoot, duplicatedId } = duplicateNodeById(document.root, nodeId);
    if (!duplicatedId) return;

    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);

    set({
      document: newDoc,
      selectedNodeId: duplicatedId,
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
    const { document, history } = get();
    const newRoot = patchNodeProps(document.root, nodeId, newProps);
    const newDoc: UIDLDocument = {
      ...document,
      root: newRoot,
    };

    const val = validateDocument(newDoc);

    set({
      document: newDoc,
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
    const { document, history } = get();
    const val = validateDocument(newDoc);

    set({
      document: newDoc,
      selectedNodeId: newDoc.root.id,
      validationErrors: val.errors,
      history: {
        past: [...history.past, document],
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
    const { history, document } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    const val = validateDocument(previous);

    set({
      document: previous,
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
    const { history, document } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);
    const val = validateDocument(next);

    set({
      document: next,
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
