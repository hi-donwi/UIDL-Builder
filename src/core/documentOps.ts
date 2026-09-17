import type { UIDLNode } from "uidl-runtime";

export function generateNodeId(type: string): string {
  const prefix = type.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${rand}`;
}

export function findNodeById(node: UIDLNode, id: string): UIDLNode | null {
  if (node.id === id) return node;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentNode(root: UIDLNode, targetId: string): { parent: UIDLNode; index: number } | null {
  if (!root.children || !Array.isArray(root.children)) return null;

  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (child.id === targetId) {
      return { parent: root, index: i };
    }
    const found = findParentNode(child, targetId);
    if (found) return found;
  }

  return null;
}

export function cloneNodeWithNewIds(node: UIDLNode): UIDLNode {
  const newId = generateNodeId(node.type);
  const cloned: UIDLNode = {
    ...node,
    id: newId,
    props: node.props ? JSON.parse(JSON.stringify(node.props)) : {},
  };

  if (node.children && Array.isArray(node.children)) {
    cloned.children = node.children.map((c) => cloneNodeWithNewIds(c));
  }

  return cloned;
}

export function insertChildNode(root: UIDLNode, targetParentId: string, newNode: UIDLNode, index?: number): UIDLNode {
  const rootClone: UIDLNode = JSON.parse(JSON.stringify(root));
  const targetParent = findNodeById(rootClone, targetParentId);

  if (!targetParent) {
    // If parent not found, append to root
    if (!rootClone.children) rootClone.children = [];
    rootClone.children.push(newNode);
    return rootClone;
  }

  if (!targetParent.children) {
    targetParent.children = [];
  }

  if (typeof index === "number" && index >= 0 && index <= targetParent.children.length) {
    targetParent.children.splice(index, 0, newNode);
  } else {
    targetParent.children.push(newNode);
  }

  return rootClone;
}

export function deleteNodeById(root: UIDLNode, id: string): UIDLNode {
  if (root.id === id) {
    // Cannot delete root, return empty container
    return {
      id: "root",
      type: "Container",
      props: { className: "p-6 flex flex-col gap-4" },
      children: [],
    };
  }

  const rootClone: UIDLNode = JSON.parse(JSON.stringify(root));
  const parentInfo = findParentNode(rootClone, id);

  if (parentInfo && parentInfo.parent.children) {
    parentInfo.parent.children.splice(parentInfo.index, 1);
  }

  return rootClone;
}

export function duplicateNodeById(root: UIDLNode, id: string): { newRoot: UIDLNode; duplicatedId: string | null } {
  const nodeToDup = findNodeById(root, id);
  if (!nodeToDup || root.id === id) {
    return { newRoot: root, duplicatedId: null };
  }

  const rootClone: UIDLNode = JSON.parse(JSON.stringify(root));
  const parentInfo = findParentNode(rootClone, id);

  if (!parentInfo || !parentInfo.parent.children) {
    return { newRoot: root, duplicatedId: null };
  }

  const cloned = cloneNodeWithNewIds(nodeToDup);
  parentInfo.parent.children.splice(parentInfo.index + 1, 0, cloned);

  return { newRoot: rootClone, duplicatedId: cloned.id };
}

export function patchNodeProps(root: UIDLNode, id: string, newProps: Record<string, unknown>): UIDLNode {
  const rootClone: UIDLNode = JSON.parse(JSON.stringify(root));
  const target = findNodeById(rootClone, id);

  if (target) {
    target.props = {
      ...(target.props || {}),
      ...newProps,
    };
  }

  return rootClone;
}

export function buildFlatNodeList(node: UIDLNode, depth = 0): Array<{ node: UIDLNode; depth: number }> {
  const list: Array<{ node: UIDLNode; depth: number }> = [{ node, depth }];
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      list.push(...buildFlatNodeList(child, depth + 1));
    }
  }
  return list;
}
