/**
 * UIDL Document Schema Migration Utilities
 * Provides deterministic upgrades and normalization across UIDL schema versions.
 */

import type { UIDLDocument } from "uidl-runtime";

export interface MigrationResult {
  migrated: boolean;
  fromVersion: string;
  toVersion: string;
  changes: string[];
  document: UIDLDocument;
}

export const CANONICAL_SCHEMA_V1 = "https://uidl.dev/schema/v1/document.schema.json";
export const TARGET_SCHEMA_VERSION = "1.1.0";

/**
 * Migrates and normalizes any legacy or untyped UIDL document to the current schema target.
 */
export function migrateDocumentSchema(doc: any): MigrationResult {
  if (!doc || typeof doc !== "object") {
    throw new Error("Invalid document: expected an object");
  }

  const cloned = JSON.parse(JSON.stringify(doc));
  const changes: string[] = [];
  const fromVersion = cloned.version || "1.0.0";

  // 1. Normalize $schema URI
  if (!cloned.$schema || cloned.$schema !== CANONICAL_SCHEMA_V1) {
    cloned.$schema = CANONICAL_SCHEMA_V1;
    changes.push(`Updated $schema to ${CANONICAL_SCHEMA_V1}`);
  }

  // 2. Normalize version
  if (cloned.version !== TARGET_SCHEMA_VERSION) {
    cloned.version = TARGET_SCHEMA_VERSION;
    changes.push(`Upgraded version from ${fromVersion} to ${TARGET_SCHEMA_VERSION}`);
  }

  // 3. Ensure required top-level fields
  if (!cloned.id) {
    cloned.id = `doc-${Date.now()}`;
    changes.push(`Assigned generated document id: ${cloned.id}`);
  }

  if (!cloned.name) {
    cloned.name = "Untitled UIDL Screen";
    changes.push("Assigned default document name");
  }

  if (!cloned.dataSources) {
    cloned.dataSources = {};
  }

  // 4. Normalize root container if missing or malformed
  if (!cloned.root || typeof cloned.root !== "object") {
    cloned.root = {
      id: "root-container",
      type: "Column",
      style: {
        gap: "gap-4",
        padding: "p-4",
        minHeight: "min-h-screen",
      },
      children: [],
    };
    changes.push("Initialized default root Column container");
  }

  // 5. Recursive node normalization (ensure unique IDs, normalize legacy types)
  const idSet = new Set<string>();
  normalizeNode(cloned.root, idSet, changes);

  // 6. Normalize reusable definitions
  if (cloned.definitions && typeof cloned.definitions === "object") {
    for (const [defKey, defNode] of Object.entries(cloned.definitions)) {
      if (defNode && typeof defNode === "object") {
        normalizeNode(defNode as any, idSet, changes, `definitions.${defKey}`);
      }
    }
  }

  return {
    migrated: changes.length > 0,
    fromVersion,
    toVersion: TARGET_SCHEMA_VERSION,
    changes,
    document: cloned as UIDLDocument,
  };
}

function normalizeNode(node: any, idSet: Set<string>, changes: string[], path = "root"): void {
  if (!node || typeof node !== "object") return;

  // Ensure node id exists and is unique
  if (!node.id || idSet.has(node.id)) {
    const oldId = node.id || "anonymous";
    node.id = `${node.type?.toLowerCase() || "node"}-${Math.random().toString(36).slice(2, 7)}`;
    idSet.add(node.id);
    changes.push(`Normalized duplicate or missing node id at ${path} (${oldId} -> ${node.id})`);
  } else {
    idSet.add(node.id);
  }

  // Default type fallback
  if (!node.type) {
    node.type = "Column";
    changes.push(`Assigned default node type 'Column' at ${path}`);
  }

  // Normalize legacy layout prop
  if (node.layout && !node.style?.display) {
    node.style = node.style || {};
    if (node.layout === "horizontal" || node.layout === "row") {
      node.style.display = "flex";
      node.style.flexDirection = "row";
      changes.push(`Converted legacy layout 'row' to flex styles at ${path}`);
    } else if (node.layout === "vertical" || node.layout === "column") {
      node.style.display = "flex";
      node.style.flexDirection = "column";
      changes.push(`Converted legacy layout 'column' to flex styles at ${path}`);
    }
    delete node.layout;
  }

  // Recurse children
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any, idx: number) => {
      normalizeNode(child, idSet, changes, `${path}.children[${idx}]`);
    });
  }

  // Recurse slots
  if (node.slots && typeof node.slots === "object") {
    for (const [slotKey, slotChildren] of Object.entries(node.slots)) {
      if (Array.isArray(slotChildren)) {
        slotChildren.forEach((child: any, idx: number) => {
          normalizeNode(child, idSet, changes, `${path}.slots.${slotKey}[${idx}]`);
        });
      }
    }
  }
}
