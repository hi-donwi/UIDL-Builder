import { describe, it, expect } from "vitest";
import {
  countDocumentNodes,
  generateReactSnippet,
  generateFlutterSnippet,
  generateComposeSnippet,
} from "../exportGenerators";
import type { UIDLDocument } from "uidl-runtime";

describe("exportGenerators", () => {
  const sampleDoc: UIDLDocument = {
    id: "dashboard-analytics",
    version: "1.0.0",
    name: "Dashboard Analytics",
    root: {
      id: "root",
      type: "Container",
      props: { className: "p-6" },
      children: [
        {
          id: "card_1",
          type: "Card",
          children: [
            { id: "btn_1", type: "Button", props: { label: "Test" } },
          ],
        },
      ],
      slots: {
        headerSlot: [
          { id: "icon_1", type: "Icon", props: { name: "activity" } },
        ],
      },
    },
  };

  it("accurately counts tree nodes including slots", () => {
    // root (1) + card_1 (1) + btn_1 (1) + icon_1 (1) = 4
    const count = countDocumentNodes(sampleDoc.root);
    expect(count).toBe(4);
  });

  it("generates clean React TSX snippet referencing uidl-runtime", () => {
    const code = generateReactSnippet(sampleDoc, "dark");
    expect(code).toContain("import { UIDocumentRenderer, meridianDarkTheme } from \"uidl-runtime\";");
    expect(code).toContain("export default function DashboardAnalytics()");
    expect(code).toContain("<UIDocumentRenderer");
  });

  it("generates clean Flutter Dart snippet referencing uidl_flutter", () => {
    const code = generateFlutterSnippet(sampleDoc, "light");
    expect(code).toContain("import 'package:uidl_flutter/uidl_flutter.dart';");
    expect(code).toContain("class DashboardAnalytics extends StatelessWidget");
    expect(code).toContain("UidlRenderer(");
    expect(code).toContain("UidlPresets.meridianLight");
  });

  it("generates clean Android Jetpack Compose snippet", () => {
    const code = generateComposeSnippet(sampleDoc, "dark");
    expect(code).toContain("import io.uidl.runtime.compose.UidlDocumentRenderer");
    expect(code).toContain("fun DashboardAnalytics(");
    expect(code).toContain("MeridianTheme.Dark");
  });
});
