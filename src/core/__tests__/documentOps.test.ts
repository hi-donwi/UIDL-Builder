import { describe, it, expect } from "vitest";
import type { UIDLNode } from "uidl-runtime";
import {
  generateNodeId,
  findNodeById,
  findParentNode,
  cloneNodeWithNewIds,
  insertChildNode,
  deleteNodeById,
  duplicateNodeById,
  patchNodeProps,
  patchNodeEvents,
  patchNodeStyle,
  moveNode,
  buildFlatNodeList,
  insertSlotChild,
  removeSlotChild,
  findNodeAncestors,
  patchNodeResponsiveProps,
} from "../documentOps";

describe("documentOps", () => {
  const sampleTree: UIDLNode = {
    id: "root",
    type: "Container",
    props: { className: "p-4" },
    children: [
      {
        id: "header_1",
        type: "Typography",
        props: { text: "Welcome", variant: "h1" },
      },
      {
        id: "card_1",
        type: "Card",
        props: { title: "Metrics" },
        children: [
          {
            id: "btn_1",
            type: "Button",
            props: { label: "Click Me" },
          },
        ],
      },
    ],
  };

  describe("generateNodeId", () => {
    it("generates an ID with clean type prefix and random suffix", () => {
      const id = generateNodeId("Button");
      expect(id).toMatch(/^button_[a-z0-9]+$/);
    });

    it("handles complex type names with special characters", () => {
      const id = generateNodeId("Custom-Widget!v2");
      expect(id).toMatch(/^customwidgetv2_[a-z0-9]+$/);
    });
  });

  describe("findNodeById", () => {
    it("finds the root node by id", () => {
      const node = findNodeById(sampleTree, "root");
      expect(node).not.toBeNull();
      expect(node?.id).toBe("root");
    });

    it("finds deeply nested children", () => {
      const node = findNodeById(sampleTree, "btn_1");
      expect(node).not.toBeNull();
      expect(node?.type).toBe("Button");
      expect(node?.props?.label).toBe("Click Me");
    });

    it("returns null for non-existent id", () => {
      const node = findNodeById(sampleTree, "does_not_exist");
      expect(node).toBeNull();
    });
  });

  describe("findParentNode", () => {
    it("returns direct parent and index", () => {
      const result = findParentNode(sampleTree, "card_1");
      expect(result).not.toBeNull();
      expect(result?.parent.id).toBe("root");
      expect(result?.index).toBe(1);
    });

    it("returns nested parent and index", () => {
      const result = findParentNode(sampleTree, "btn_1");
      expect(result).not.toBeNull();
      expect(result?.parent.id).toBe("card_1");
      expect(result?.index).toBe(0);
    });

    it("returns null when searching for root", () => {
      const result = findParentNode(sampleTree, "root");
      expect(result).toBeNull();
    });
  });

  describe("cloneNodeWithNewIds", () => {
    it("recursively clones node with fresh unique IDs", () => {
      const cloned = cloneNodeWithNewIds(sampleTree);
      expect(cloned.id).not.toBe(sampleTree.id);
      expect(cloned.children).toHaveLength(2);
      expect(cloned.children?.[0].id).not.toBe(sampleTree.children?.[0].id);
      expect(cloned.children?.[1].children?.[0].id).not.toBe("btn_1");
      expect(cloned.props).toEqual(sampleTree.props);
    });
  });

  describe("insertChildNode", () => {
    it("inserts a child at the end when index is omitted", () => {
      const newNode: UIDLNode = { id: "new_btn", type: "Button", props: { label: "New" } };
      const updated = insertChildNode(sampleTree, "card_1", newNode);
      const card = findNodeById(updated, "card_1");
      expect(card?.children).toHaveLength(2);
      expect(card?.children?.[1].id).toBe("new_btn");
    });

    it("inserts a child at a specific index", () => {
      const newNode: UIDLNode = { id: "first_header", type: "Typography", props: { text: "Title" } };
      const updated = insertChildNode(sampleTree, "root", newNode, 0);
      expect(updated.children?.[0].id).toBe("first_header");
      expect(updated.children?.[1].id).toBe("header_1");
    });

    it("falls back to appending to root if parentId is not found", () => {
      const newNode: UIDLNode = { id: "orphan", type: "Badge" };
      const updated = insertChildNode(sampleTree, "invalid_parent", newNode);
      expect(updated.children?.some((c) => c.id === "orphan")).toBe(true);
    });
  });

  describe("deleteNodeById", () => {
    it("removes target node from its parent", () => {
      const updated = deleteNodeById(sampleTree, "header_1");
      expect(findNodeById(updated, "header_1")).toBeNull();
      expect(updated.children).toHaveLength(1);
    });

    it("returns a safe empty container when attempting to delete root", () => {
      const updated = deleteNodeById(sampleTree, "root");
      expect(updated.id).toBe("root");
      expect(updated.type).toBe("Container");
      expect(updated.children).toEqual([]);
    });
  });

  describe("duplicateNodeById", () => {
    it("duplicates node and places it immediately after the original", () => {
      const { newRoot, duplicatedId } = duplicateNodeById(sampleTree, "header_1");
      expect(duplicatedId).not.toBeNull();
      expect(newRoot.children).toHaveLength(3);
      expect(newRoot.children?.[0].id).toBe("header_1");
      expect(newRoot.children?.[1].id).toBe(duplicatedId);
    });

    it("returns unmodified root when target is not found or is root", () => {
      const res1 = duplicateNodeById(sampleTree, "root");
      expect(res1.duplicatedId).toBeNull();
      const res2 = duplicateNodeById(sampleTree, "nonexistent");
      expect(res2.duplicatedId).toBeNull();
    });
  });

  describe("patchNodeProps, patchNodeEvents, patchNodeStyle", () => {
    it("patches props immutably", () => {
      const updated = patchNodeProps(sampleTree, "btn_1", { label: "Updated", variant: "outline" });
      const btn = findNodeById(updated, "btn_1");
      expect(btn?.props?.label).toBe("Updated");
      expect(btn?.props?.variant).toBe("outline");
    });

    it("patches events", () => {
      const updated = patchNodeEvents(sampleTree, "btn_1", { onClick: { action: "submit" } });
      const btn = findNodeById(updated, "btn_1");
      expect(btn?.events).toEqual({ onClick: { action: "submit" } });
    });

    it("patches inline style", () => {
      const updated = patchNodeStyle(sampleTree, "btn_1", { backgroundColor: "#ff0000" });
      const btn = findNodeById(updated, "btn_1");
      expect(btn?.style).toEqual({ backgroundColor: "#ff0000" });
    });
  });

  describe("moveNode", () => {
    it("reorders nodes within the same parent", () => {
      const updated = moveNode(sampleTree, "card_1", "root", 0);
      expect(updated.children?.[0].id).toBe("card_1");
      expect(updated.children?.[1].id).toBe("header_1");
    });

    it("moves node to another container", () => {
      const updated = moveNode(sampleTree, "btn_1", "root", 1);
      const card = findNodeById(updated, "card_1");
      expect(card?.children).toHaveLength(0);
      expect(updated.children?.[1].id).toBe("btn_1");
    });

    it("handles invalid move safely", () => {
      const updated = moveNode(sampleTree, "root", "card_1");
      expect(updated).toBe(sampleTree);
    });
  });

  describe("slots support", () => {
    it("inserts child into designated slot", () => {
      const slotNode: UIDLNode = { id: "header_icon", type: "Icon", props: { name: "bell" } };
      const updated = insertSlotChild(sampleTree, "card_1", "headerSlot", slotNode);
      const card = findNodeById(updated, "card_1");
      expect(card?.slots?.headerSlot).toBeDefined();
      expect(card?.slots?.headerSlot?.[0].id).toBe("header_icon");
    });

    it("removes child from slot", () => {
      const slotNode: UIDLNode = { id: "header_icon", type: "Icon", props: { name: "bell" } };
      const withSlot = insertSlotChild(sampleTree, "card_1", "headerSlot", slotNode);
      const removed = removeSlotChild(withSlot, "card_1", "headerSlot", "header_icon");
      const card = findNodeById(removed, "card_1");
      expect(card?.slots?.headerSlot).toEqual([]);
    });
  });

  describe("buildFlatNodeList & findNodeAncestors", () => {
    it("flattens tree into array with depths", () => {
      const list = buildFlatNodeList(sampleTree);
      expect(list).toHaveLength(4);
      expect(list[0].node.id).toBe("root");
      expect(list[0].depth).toBe(0);
      expect(list[3].node.id).toBe("btn_1");
      expect(list[3].depth).toBe(2);
    });

    it("finds ancestor path for a node", () => {
      const path = findNodeAncestors(sampleTree, "btn_1");
      expect(path).not.toBeNull();
      expect(path?.map((n) => n.id)).toEqual(["root", "card_1", "btn_1"]);
    });
  });

  describe("patchNodeResponsiveProps", () => {
    it("stores responsive breakpoint overrides", () => {
      const updated = patchNodeResponsiveProps(sampleTree, "header_1", "mobile", { variant: "h3" });
      const node = findNodeById(updated, "header_1");
      expect(node?.responsive?.mobile).toEqual({ props: { variant: "h3" } });
    });
  });
});
