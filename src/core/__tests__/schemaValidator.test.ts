import { describe, it, expect } from "vitest";
import { validateDocument } from "../schemaValidator";
import { TEMPLATES } from "../templateCatalog";
import type { UIDLDocument } from "uidl-runtime";

describe("schemaValidator", () => {
  it("rejects non-object inputs", () => {
    expect(validateDocument(null).isValid).toBe(false);
    expect(validateDocument(undefined).isValid).toBe(false);
    expect(validateDocument("string").isValid).toBe(false);
    expect(validateDocument(123).isValid).toBe(false);
  });

  it("validates all built-in catalog templates successfully", () => {
    for (const item of TEMPLATES) {
      const res = validateDocument(item.document);
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.schemaVersion).toBe("1.0.0");
    }
  });

  it("identifies missing required properties in invalid documents", () => {
    const invalidDoc = {
      version: "1.0.0",
      // missing root
    };
    const res = validateDocument(invalidDoc);
    expect(res.isValid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.some((e) => e.path.includes("root"))).toBe(true);
  });

  it("identifies invalid node types or structure", () => {
    const invalidNodeDoc: UIDLDocument = {
      id: "invalid-doc",
      name: "Invalid Doc",
      version: "1.0.0",
      root: {
        id: "root",
        // missing type
      } as unknown as any,
    };
    const res = validateDocument(invalidNodeDoc);
    expect(res.isValid).toBe(false);
  });
});
