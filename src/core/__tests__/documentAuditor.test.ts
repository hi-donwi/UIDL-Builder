import { describe, it, expect } from "vitest";
import type { UIDLDocument } from "uidl-runtime";
import { auditDocument, autoFixDocument } from "../documentAuditor";

describe("documentAuditor", () => {
  const baseDoc: UIDLDocument = {
    version: "1.0.0",
    id: "test-doc",
    name: "Test Document",
    root: {
      id: "root-1",
      type: "Container",
      children: [
        {
          id: "btn-1",
          type: "Button",
          props: { label: "Click Me" },
        },
      ],
    },
  };

  it("detects missing layout container configuration", () => {
    const report = auditDocument(baseDoc);
    const layoutIssue = report.issues.find((i) => i.id === "layout-missing-container");
    expect(layoutIssue).toBeDefined();
    expect(layoutIssue?.category).toBe("layout");
    expect(layoutIssue?.severity).toBe("info");
    expect(layoutIssue?.canAutoFix).toBe(true);
  });

  it("detects constrained layout missing explicit maxWidth", () => {
    const docWithConstrained: UIDLDocument = {
      ...baseDoc,
      layout: {
        container: "constrained",
      },
    };
    const report = auditDocument(docWithConstrained);
    const issue = report.issues.find((i) => i.id === "layout-constrained-no-maxwidth");
    expect(issue).toBeDefined();
    expect(issue?.canAutoFix).toBe(true);
  });

  it("passes cleanly when layout container and maxWidth are specified", () => {
    const validDoc: UIDLDocument = {
      ...baseDoc,
      layout: {
        container: "constrained",
        maxWidth: "80rem",
        padding: "responsive",
      },
    };
    const report = auditDocument(validDoc);
    const layoutIssues = report.issues.filter((i) => i.category === "layout");
    expect(layoutIssues).toHaveLength(0);
  });

  it("autoFixDocument applies standard constrained layout", () => {
    const fixed = autoFixDocument(baseDoc);
    expect(fixed.layout).toEqual({
      container: "constrained",
      maxWidth: "80rem",
      padding: "responsive",
    });

    // Re-auditing should have no layout issues
    const report = auditDocument(fixed);
    const layoutIssues = report.issues.filter((i) => i.category === "layout");
    expect(layoutIssues).toHaveLength(0);
  });
});
