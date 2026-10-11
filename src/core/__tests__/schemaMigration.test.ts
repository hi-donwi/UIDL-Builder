import { describe, it, expect } from "vitest";
import { migrateDocumentSchema, CANONICAL_SCHEMA_V1, TARGET_SCHEMA_VERSION } from "../schemaMigration";

describe("schemaMigration", () => {
  it("upgrades version and assigns canonical $schema to legacy document", () => {
    const legacyDoc = {
      id: "legacy-dashboard",
      name: "Legacy Dashboard",
      version: "1.0.0",
      root: {
        id: "root-1",
        type: "Column",
        children: [
          { id: "child-1", type: "Text", props: { text: "Hello" } }
        ]
      }
    };

    const res = migrateDocumentSchema(legacyDoc);
    expect(res.migrated).toBe(true);
    expect(res.toVersion).toBe(TARGET_SCHEMA_VERSION);
    expect(res.document.$schema).toBe(CANONICAL_SCHEMA_V1);
    expect(res.document.version).toBe(TARGET_SCHEMA_VERSION);
    expect(res.changes).toContain(`Updated $schema to ${CANONICAL_SCHEMA_V1}`);
  });

  it("converts legacy layout prop to flex style", () => {
    const legacyDoc = {
      root: {
        id: "root-row",
        type: "Container",
        layout: "row",
        children: []
      }
    };

    const res = migrateDocumentSchema(legacyDoc);
    expect(res.document.root.style?.display).toBe("flex");
    expect(res.document.root.style?.flexDirection).toBe("row");
    expect((res.document.root as any).layout).toBeUndefined();
  });

  it("fixes duplicate node IDs across tree nodes", () => {
    const docWithDupes = {
      root: {
        id: "duplicate-id",
        type: "Column",
        children: [
          { id: "duplicate-id", type: "Text", props: { text: "Child 1" } },
          { id: "duplicate-id", type: "Button", props: { label: "Child 2" } }
        ]
      }
    };

    const res = migrateDocumentSchema(docWithDupes);
    const rootId = res.document.root.id;
    const child1Id = res.document.root.children![0].id;
    const child2Id = res.document.root.children![1].id;

    expect(rootId).toBe("duplicate-id");
    expect(child1Id).not.toBe("duplicate-id");
    expect(child2Id).not.toBe("duplicate-id");
    expect(child1Id).not.toBe(child2Id);
  });

  it("creates default root container when root is missing", () => {
    const emptyDoc = { name: "No Root" };
    const res = migrateDocumentSchema(emptyDoc);
    expect(res.document.root).toBeDefined();
    expect(res.document.root.type).toBe("Column");
    expect(res.document.id).toBeDefined();
  });
});
