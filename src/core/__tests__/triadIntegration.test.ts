import { describe, it, expect } from "vitest";
import gallery from "uidl-runtime/catalog/gallery.json";
import { validateDocument } from "../schemaValidator";
import { generateReactSnippet, generateFlutterSnippet, generateComposeSnippet } from "../exportGenerators";
import type { UIDLDocument } from "uidl-runtime";

describe("Triad End-to-End Integration (Kerangka -> UIDL-Builder -> UIDL-Runtime)", () => {
  const doc = gallery.entries.find((e) => e.id === "invoicing-erp-console")!.documents.en as unknown as UIDLDocument;

  it("validates Kerangka Invoicing ERP console document schema without errors", () => {
    const result = validateDocument(doc);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.schemaVersion).toBe("1.0.0");
  });

  it("exports valid React TSX referencing uidl-runtime and meridian theme", () => {
    const code = generateReactSnippet(doc, "dark");
    expect(code).toContain("import { UIDocumentRenderer, meridianDarkTheme } from \"uidl-runtime\";");
    expect(code).toContain("export default function KerangkaInvoicingBillingERPConsole()");
    expect(code).toContain("<UIDocumentRenderer");
  });

  it("exports valid Flutter Dart snippet referencing canonical uidl_flutter package", () => {
    const code = generateFlutterSnippet(doc, "dark");
    expect(code).toContain("import 'package:uidl_flutter/uidl_flutter.dart';");
    expect(code).toContain("class KerangkaInvoicingBillingERPConsole extends StatelessWidget");
    expect(code).toContain("UidlRenderer(");
    expect(code).toContain("UidlPresets.meridianDark");
    expect(code).toContain("onNavigate:");
    expect(code).toContain("onSnackbar:");
  });

  it("exports valid Android Compose snippet referencing UidlDocumentRenderer", () => {
    const code = generateComposeSnippet(doc, "dark");
    expect(code).toContain("import io.uidl.runtime.compose.UidlDocumentRenderer");
    expect(code).toContain("fun KerangkaInvoicingBillingERPConsole(");
    expect(code).toContain("MeridianTheme.Dark");
  });
});
