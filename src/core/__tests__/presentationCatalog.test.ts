import { describe, expect, it } from "vitest";
import { applyPresentationPreset, presentationPresetCatalog } from "uidl-runtime";
import { getPresentationPreset, getPresentationTheme } from "../../lib/uidlBridge";
import { templateById } from "../templateCatalog";

describe("runtime presentation preset integration", () => {
  it("discovers the runtime-owned dense business manifest", () => {
    const preset = presentationPresetCatalog.get("dense-business");

    expect(preset).toMatchObject({
      id: "dense-business",
      version: "0.1.0",
      provenance: { source: "uidl-runtime" },
    });
    expect(preset?.recipes).toContain("list");
    expect(preset?.targets).toContain("react");
  });

  it("applies only a pinned reference and resolves the theme from the catalog", () => {
    const preset = presentationPresetCatalog.get("dense-business");
    const document = templateById("invoicing-erp-console").document;

    if (!preset) throw new Error("dense-business preset is unavailable");

    const themed = applyPresentationPreset(document, preset, "dark");

    expect(themed.presentationPreset).toEqual({ id: "dense-business", version: "0.1.0" });
    expect(themed.theme).toBe("theme-dense-business-dark");
    expect(getPresentationPreset(themed.presentationPreset)?.id).toBe("dense-business");
    expect(getPresentationTheme(themed.presentationPreset, "dark")?.id).toBe("theme-dense-business-dark");
  });

  it("does not resolve a stale preset reference", () => {
    expect(getPresentationPreset({ id: "dense-business", version: "0.0.0" })).toBeUndefined();
  });
});
