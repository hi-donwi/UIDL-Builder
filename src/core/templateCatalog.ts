import type { UIDLDocument } from "uidl-runtime";
import gallery from "uidl-runtime/catalog/gallery.json";

export type TemplateCategory = "industry" | "dashboard" | "form" | "blank";

export interface DocumentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  document: UIDLDocument;
}

/**
 * The gallery comes from uidl-runtime: one copy of each document, validated when that package
 * is built, in every locale it has. The Builder used to keep its own copies here, and they had
 * drifted from the runtime's. It shows the English variant.
 */
const fromCatalog: DocumentTemplate[] = gallery.entries.map((entry) => ({
  id: entry.id,
  name: entry.name,
  category: entry.category as TemplateCategory,
  description: entry.description,
  tags: entry.tags,
  document: entry.documents.en as unknown as UIDLDocument,
}));

/** An empty starting point: part of the editor, not a template, so it stays here. */
const BLANK_CANVAS: DocumentTemplate = {
  id: "blank-canvas",
  name: "Blank Canvas",
  category: "blank",
  description: "Clean empty document ready for drag-and-drop or component stacking.",
  tags: ["Empty", "Clean", "Starter"],
  document: {
    $schema: "https://uidl.dev/schema/v1/document.json",
    version: "1.0.0",
    id: "blank-canvas-doc",
    name: "Untitled UIDL Document",
    root: {
      id: "root",
      type: "Container",
      props: {
        className: "p-8 flex flex-col gap-6 min-h-[400px] border-2 border-dashed border-white/20 rounded-2xl items-center justify-center text-center",
      },
      children: [
        {
          id: "empty_heading",
          type: "Text",
          props: {
            heading: "3",
            value: "Empty Canvas",
            className: "text-xl font-bold text-slate-300",
          },
        },
        {
          id: "empty_hint",
          type: "Text",
          props: {
            value: "Select components from the left palette to begin designing your UIDL interface.",
            className: "text-sm text-slate-500 max-w-sm",
          },
        },
      ],
    },
  },
};

export const TEMPLATES: DocumentTemplate[] = [...fromCatalog, BLANK_CANVAS];

/** A template by id. Lookups by position break whenever the gallery changes order. */
export function templateById(id: string): DocumentTemplate {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown template '${id}'`);
  return template;
}
