import React, { useState } from "react";
import { TEMPLATES, type TemplateCategory } from "../core/templateCatalog";
import { useBuilderStore } from "../core/builderStore";
import { LayoutTemplate, Sparkles, Search, Briefcase, LayoutDashboard, FileText, Square } from "lucide-react";
import clsx from "clsx";

export function TemplateGalleryPanel() {
  const { loadTemplate, document } = useBuilderStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: "all", label: "All", icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
    { id: "industry", label: "Industry", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "form", label: "Forms", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "blank", label: "Blank", icon: <Square className="w-3.5 h-3.5" /> },
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === "all" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22]">
      {/* Header */}
      <div className="p-3 border-b border-white/10 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Template Catalog
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {filteredTemplates.length} available
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates (Healthcare, CRM, Form...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all shrink-0",
                selectedCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/[0.03] text-slate-400 hover:text-white border border-transparent"
              )}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No templates matching your filter criteria.
          </div>
        ) : (
          filteredTemplates.map((tpl) => {
            const isCurrent = document.id === tpl.document.id;

            return (
              <div
                key={tpl.id}
                onClick={() => loadTemplate(tpl.id)}
                className={clsx(
                  "p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group",
                  isCurrent
                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-cyan-500/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tpl.name}</span>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {tpl.category}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
