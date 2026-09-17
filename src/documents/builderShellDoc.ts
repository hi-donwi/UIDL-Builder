import type { UIDLDocument } from "uidl-runtime";

/**
 * Self-Hosting UIDL Document defining the UI structure of the Builder Workbench itself.
 * Demonstrates how UIDL-Runtime can be dogfooded to specify complex multi-pane application shells.
 */
export const BUILDER_SHELL_UIDL: UIDLDocument = {
  $schema: "https://uidl.dev/schema/v1/document.json",
  version: "1.0.0",
  id: "uidl-builder-workbench-shell",
  name: "UIDL Builder Studio Shell",
  state: {
    activeTool: "select",
    activeTab: "palette",
    currentZoom: 100,
  },
  root: {
    id: "workbench_root",
    type: "Container",
    props: {
      className: "flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-100 font-sans",
    },
    children: [
      {
        id: "top_header_bar",
        type: "Row",
        props: {
          className: "h-14 px-4 border-b border-white/10 bg-[#161b22] flex items-center justify-between shrink-0 select-none z-30",
        },
      },
      {
        id: "main_work_area",
        type: "Row",
        props: {
          className: "flex flex-1 overflow-hidden relative",
        },
        children: [
          {
            id: "left_toolbox_sidebar",
            type: "Container",
            props: {
              className: "w-80 border-r border-white/10 bg-[#161b22] flex flex-col shrink-0 z-20 overflow-hidden",
            },
          },
          {
            id: "center_canvas_viewport",
            type: "Container",
            props: {
              className: "flex-1 flex flex-col overflow-hidden bg-[#0a0d12] relative",
            },
          },
          {
            id: "right_inspector_sidebar",
            type: "Container",
            props: {
              className: "w-84 border-l border-white/10 bg-[#161b22] flex flex-col shrink-0 z-20 overflow-hidden",
            },
          },
        ],
      },
      {
        id: "bottom_status_bar",
        type: "Row",
        props: {
          className: "h-7 px-4 border-t border-white/10 bg-[#0d1117] flex items-center justify-between text-xs text-slate-400 shrink-0 select-none z-30",
        },
      },
    ],
  },
};
