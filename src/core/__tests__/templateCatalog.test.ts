import { describe, it, expect } from "vitest";
import gallery from "uidl-runtime/catalog/gallery.json";
import { TEMPLATES, templateById } from "../templateCatalog";
import { useBuilderStore } from "../builderStore";

describe("the template gallery", () => {
  it("shows every entry uidl-runtime publishes, once, with the Builder's blank canvas last", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual([...gallery.entries.map((e) => e.id), "blank-canvas"]);
  });

  it("shows each entry's English document", () => {
    for (const entry of gallery.entries) {
      expect(templateById(entry.id).document).toEqual(entry.documents.en);
    }
  });

  it("refuses an id the gallery does not have", () => {
    expect(() => templateById("dashboard-analytics")).toThrow(/Unknown template/);
  });
});

describe("the starting pages", () => {
  it("open the documents their names describe", () => {
    // They were picked by position, so prepending the invoicing template shifted every page:
    // "Credit Union & Banking" opened the hospital console.
    const pages = useBuilderStore.getState().pages;
    const byName = Object.fromEntries(pages.map((p) => [p.name, p.document.id]));
    expect(byName["Credit Union & Banking"]).toBe(templateById("koperasi-bmt-console").document.id);
    expect(byName["CRM Deals"]).toBe(templateById("crm-pipeline-console").document.id);
  });
});
