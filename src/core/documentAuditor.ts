import type { UIDLDocument, UIDLNode } from "uidl-runtime";
import { validateDocument } from "./schemaValidator";
import { generateNodeId } from "./documentOps";

export interface AuditIssue {
  id: string;
  nodeId?: string;
  severity: "error" | "warning" | "info";
  category: "schema" | "a11y" | "integrity" | "binding";
  title: string;
  description: string;
  canAutoFix: boolean;
  autoFixAction?: string;
}

export interface AuditReport {
  issues: AuditIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  healthScore: number;
}

export function auditDocument(doc: UIDLDocument): AuditReport {
  const issues: AuditIssue[] = [];

  // 1. Schema Validation check
  const schemaVal = validateDocument(doc);
  if (!schemaVal.isValid) {
    schemaVal.errors.forEach((err, idx) => {
      issues.push({
        id: `schema-${idx}`,
        severity: "error",
        category: "schema",
        title: `Schema Error at ${err.path}`,
        description: err.message,
        canAutoFix: false,
      });
    });
  }

  // 2. Structural & Accessibility tree traversal
  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();
  const stateKeys = new Set(Object.keys(doc.state || {}));

  function traverse(node: UIDLNode) {
    // Check ID collisions
    if (seenIds.has(node.id)) {
      duplicateIds.add(node.id);
      issues.push({
        id: `dup-${node.id}-${Math.random().toString(36).substring(2, 6)}`,
        nodeId: node.id,
        severity: "error",
        category: "integrity",
        title: `Duplicate Component ID: "${node.id}"`,
        description: `Multiple components share the ID "${node.id}". Component IDs must be unique across the document.`,
        canAutoFix: true,
        autoFixAction: "Regenerate unique ID",
      });
    } else {
      seenIds.add(node.id);
    }

    const props = node.props || {};

    // Accessibility check: Button without text
    if (node.type === "Button") {
      const label = props.label ?? "";
      const icon = props.icon ?? "";
      const hasChildren = node.children && node.children.length > 0;
      if (!label && !icon && !hasChildren) {
        issues.push({
          id: `a11y-btn-${node.id}`,
          nodeId: node.id,
          severity: "warning",
          category: "a11y",
          title: `Button has no accessible text or icon`,
          description: `Button (${node.id}) is missing a label, icon, or child element for screen readers.`,
          canAutoFix: true,
          autoFixAction: "Set default label 'Button'",
        });
      }
    }

    // Accessibility check: Input fields without label or placeholder
    if (node.type === "TextField" || node.type === "Input" || node.type === "Select") {
      const label = props.label ?? "";
      const placeholder = props.placeholder ?? "";
      const name = props.name ?? "";
      if (!label && !placeholder && !name) {
        issues.push({
          id: `a11y-input-${node.id}`,
          nodeId: node.id,
          severity: "warning",
          category: "a11y",
          title: `Input field missing label and placeholder`,
          description: `Form control (${node.id}) lacks a descriptive label or placeholder.`,
          canAutoFix: true,
          autoFixAction: "Set default label",
        });
      }
    }

    // Binding check: Reference to undeclared state variable
    for (const [propName, propVal] of Object.entries(props)) {
      if (typeof propVal === "object" && propVal !== null && "$bind" in propVal) {
        const bindPath = String((propVal as { $bind: string }).$bind || "");
        if (bindPath.startsWith("state.")) {
          const key = bindPath.replace("state.", "").split(".")[0];
          if (!stateKeys.has(key)) {
            issues.push({
              id: `bind-undef-${node.id}-${propName}`,
              nodeId: node.id,
              severity: "warning",
              category: "binding",
              title: `Unresolved State Binding: "${bindPath}"`,
              description: `Property "${propName}" on ${node.type} (${node.id}) binds to "${bindPath}", but key "${key}" is not declared in document.state.`,
              canAutoFix: false,
            });
          }
        }
      }
    }

    // Recurse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }

    // Recurse slots
    if (node.slots) {
      Object.values(node.slots).forEach((slotChildren) => {
        slotChildren.forEach(traverse);
      });
    }
  }

  traverse(doc.root);

  // 3. Document version & schema info
  if (!doc.version) {
    issues.push({
      id: "doc-no-version",
      severity: "info",
      category: "schema",
      title: "Document missing explicit version specification",
      description: "Document version was not specified; defaulting to 1.0.0.",
      canAutoFix: true,
      autoFixAction: "Set version: '1.0.0'",
    });
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const healthScore = Math.max(0, Math.min(100, 100 - errorCount * 20 - warningCount * 5));

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    healthScore,
  };
}

export function autoFixDocument(doc: UIDLDocument): UIDLDocument {
  const docClone: UIDLDocument = JSON.parse(JSON.stringify(doc));
  if (!docClone.version) {
    docClone.version = "1.0.0";
  }

  const seenIds = new Set<string>();

  function fixNode(node: UIDLNode) {
    // Fix duplicate ID
    if (seenIds.has(node.id)) {
      node.id = generateNodeId(node.type);
    }
    seenIds.add(node.id);

    if (!node.props) {
      node.props = {};
    }

    // Fix empty Button
    if (node.type === "Button") {
      const hasChildren = node.children && node.children.length > 0;
      if (!node.props.label && !node.props.icon && !hasChildren) {
        node.props.label = "Button";
      }
    }

    // Fix empty TextField / Input
    if (node.type === "TextField" || node.type === "Input") {
      if (!node.props.label && !node.props.placeholder) {
        node.props.label = "Field Label";
        node.props.placeholder = "Enter text...";
      }
    }

    if (node.type === "Select") {
      if (!node.props.label) {
        node.props.label = "Select Option";
      }
    }

    // Recurse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(fixNode);
    }

    // Recurse slots
    if (node.slots) {
      Object.values(node.slots).forEach((slotChildren) => {
        slotChildren.forEach(fixNode);
      });
    }
  }

  fixNode(docClone.root);

  return docClone;
}
