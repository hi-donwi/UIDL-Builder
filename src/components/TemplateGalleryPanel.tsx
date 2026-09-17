import React from "react";
import { TEMPLATES, type DocumentTemplate } from "../core/templateCatalog";
import { useBuilderStore } from "../core/builderStore";
import { LayoutTemplate, Sparkles, ArrowRight, Layers } from "lucide-react";

export function TemplateGalleryPanel() {
  const { loadTemplate, document } = useBuilderStore();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22]">
      <div className="p-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Starter Templates
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Pick a battle-tested UIDL template to jumpstart your application layout.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {TEMPLATES.map((tpl) => {
          const isCurrent = document.id === tpl.document.id;

          return (
            <div
              key={tpl.id}
              onClick={() => loadTemplate(tpl.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group ${
                isCurrent
                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-cyan-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tpl.name}</span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">
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
        })}
      </div>
    </div>
  );
}
