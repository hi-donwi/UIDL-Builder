import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Globe,
  MoreVertical,
} from "lucide-react";
import clsx from "clsx";

export function PageTabBar() {
  const {
    pages,
    activePageId,
    switchPage,
    addPage,
    renamePage,
    deletePage,
    duplicatePage,
    previewMode,
  } = useBuilderStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageRoute, setNewPageRoute] = useState("");

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoute, setEditRoute] = useState("");

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewPageName(`Screen ${pages.length + 1}`);
    setNewPageRoute(`/screen-${pages.length + 1}`);
  };

  const handleConfirmCreate = () => {
    if (!newPageName.trim()) return;
    const formattedRoute = newPageRoute.startsWith("/")
      ? newPageRoute.trim()
      : `/${newPageRoute.trim()}`;
    addPage(newPageName.trim(), formattedRoute || "/page");
    setIsCreating(false);
  };

  const handleStartEdit = (pageId: string, currentName: string, currentRoute: string) => {
    setEditingPageId(pageId);
    setEditName(currentName);
    setEditRoute(currentRoute);
  };

  const handleConfirmEdit = (pageId: string) => {
    if (!editName.trim()) return;
    const formattedRoute = editRoute.startsWith("/") ? editRoute.trim() : `/${editRoute.trim()}`;
    renamePage(pageId, editName.trim(), formattedRoute || "/page");
    setEditingPageId(null);
  };

  return (
    <div className="h-9 px-3 border-b border-white/10 bg-[#161b22]/95 backdrop-blur-sm flex items-center justify-between shrink-0 text-xs select-none">
      {/* Page Tabs List */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-[80vw]">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const isEditing = editingPageId === page.id;

          if (isEditing) {
            return (
              <div
                key={page.id}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-cyan-500/40"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Page Name"
                  className="w-24 px-1.5 py-0.5 rounded bg-black border border-white/10 text-[11px] text-white focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  value={editRoute}
                  onChange={(e) => setEditRoute(e.target.value)}
                  placeholder="/route"
                  className="w-20 px-1.5 py-0.5 rounded bg-black border border-white/10 font-mono text-[10px] text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={() => handleConfirmEdit(page.id)}
                  className="p-1 rounded hover:bg-white/10 text-emerald-400"
                  title="Save Page"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingPageId(null)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={page.id}
              onClick={() => switchPage(page.id)}
              className={clsx(
                "group flex items-center gap-2 px-2.5 py-1 rounded-lg cursor-pointer border transition-all text-xs shrink-0",
                isActive
                  ? "bg-cyan-500/15 border-cyan-500/30 text-white font-semibold shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <FileText
                className={clsx(
                  "w-3.5 h-3.5",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"
                )}
              />
              <span>{page.name}</span>
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                {page.route}
              </span>

              {/* Action buttons (Duplicate, Edit, Delete) on active tab or hover */}
              {!previewMode && (
                <div
                  className={clsx(
                    "items-center gap-0.5 ml-1",
                    isActive ? "flex" : "hidden group-hover:flex"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartEdit(page.id, page.name, page.route)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Edit name and route"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => duplicatePage(page.id)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Duplicate page"
                  >
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={() => deletePage(page.id)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Page Form or Button */}
        {!previewMode && (
          isCreating ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-cyan-500/40 shrink-0">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Page Name"
                className="w-24 px-1.5 py-0.5 rounded bg-black border border-white/10 text-[11px] text-white focus:outline-none"
                autoFocus
              />
              <input
                type="text"
                value={newPageRoute}
                onChange={(e) => setNewPageRoute(e.target.value)}
                placeholder="/route"
                className="w-20 px-1.5 py-0.5 rounded bg-black border border-white/10 font-mono text-[10px] text-cyan-300 focus:outline-none"
              />
              <button
                onClick={handleConfirmCreate}
                className="p-1 rounded hover:bg-white/10 text-emerald-400"
                title="Create Page"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded hover:bg-white/10 text-slate-400"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-white/15 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 text-[11px] transition-colors shrink-0"
              title="Add New Screen / Page"
            >
              <Plus className="w-3 h-3" />
              <span>New Screen</span>
            </button>
          )
        )}
      </div>

      {/* Active Route Display */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
        <Globe className="w-3 h-3 text-cyan-400" />
        <span>Active Screen Route:</span>
        <span className="text-cyan-300">
          {pages.find((p) => p.id === activePageId)?.route || "/"}
        </span>
      </div>
    </div>
  );
}
