import type { UIDLDocument, UIDLNode } from "uidl-runtime";

/**
 * Count total number of nodes in a UIDL node tree.
 */
export function countDocumentNodes(node?: UIDLNode | null): number {
  if (!node) return 0;
  let count = 1;

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countDocumentNodes(child);
    }
  }

  if (node.slots && typeof node.slots === "object") {
    for (const slotNodes of Object.values(node.slots)) {
      if (Array.isArray(slotNodes)) {
        for (const slotNode of slotNodes) {
          count += countDocumentNodes(slotNode);
        }
      }
    }
  }

  return count;
}

/**
 * Clean component name to form valid programming language identifiers.
 */
function sanitizeIdentifier(name?: string, fallback = "UidlView"): string {
  if (!name) return fallback;
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned || /^[0-9]/.test(cleaned)) {
    return `${fallback}${cleaned}`;
  }
  return cleaned;
}

/**
 * Generate React (TSX) boilerplate using official uidl-runtime.
 */
export function generateReactSnippet(doc: UIDLDocument, themeMode: "dark" | "light" = "dark"): string {
  const componentName = sanitizeIdentifier(doc.name, "UidlScreen");
  const jsonStr = JSON.stringify(doc, null, 2);
  const themeName = themeMode === "light" ? "meridianLightTheme" : "meridianDarkTheme";

  return `import React from "react";
import { UIDocumentRenderer, ${themeName} } from "uidl-runtime";
import type { UIDLDocument } from "uidl-runtime";
import "uidl-runtime/style.css";

// Document Schema: ${doc.id || "uidl-document"} (v${doc.version || "1.0.0"})
const documentData: UIDLDocument = ${jsonStr};

export default function ${componentName}() {
  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <UIDocumentRenderer
        document={documentData}
        theme={${themeName}}
        onAction={(action) => {
          console.log("[UIDL Action Triggered]", action);
        }}
      />
    </main>
  );
}
`;
}

/**
 * Generate Flutter (Dart) boilerplate using uidl_runtime Flutter semantic core.
 */
export function generateFlutterSnippet(doc: UIDLDocument, themeMode: "dark" | "light" = "dark"): string {
  const componentName = sanitizeIdentifier(doc.name, "UidlScreen");
  const jsonStr = JSON.stringify(doc, null, 2);
  const themeVar = themeMode === "light" ? "meridianLightTheme" : "meridianDarkTheme";

  return `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:uidl_runtime/uidl_runtime.dart';

/// Generated screen for UIDL Document: ${doc.name || doc.id || "UidlDocument"}
/// Requirements: flutter pub add uidl_runtime
class ${componentName} extends StatelessWidget {
  const ${componentName}({super.key});

  static const String _rawDocumentJson = r'''
${jsonStr}
''';

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> docMap = jsonDecode(_rawDocumentJson) as Map<String, dynamic>;
    final UidlDocument document = UidlDocument.fromJson(docMap);

    return Scaffold(
      backgroundColor: ${themeMode === "light" ? "const Color(0xFFF8FAFC)" : "const Color(0xFF0F172A)"},
      body: SafeArea(
        child: UidlWidgetTree(
          document: document,
          theme: ${themeVar},
          onAction: (UidlAction action) {
            debugPrint('UIDL Action: \${action.type} -> \${action.target}');
          },
        ),
      ),
    );
  }
}
`;
}

/**
 * Generate Android Jetpack Compose (Kotlin) boilerplate using UIDL Compose semantic core.
 */
export function generateComposeSnippet(doc: UIDLDocument, themeMode: "dark" | "light" = "dark"): string {
  const componentName = sanitizeIdentifier(doc.name, "UidlScreen");
  const jsonStr = JSON.stringify(doc, null, 2);
  const themeRef = themeMode === "light" ? "MeridianTheme.Light" : "MeridianTheme.Dark";

  return `package com.example.uidl.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import io.uidl.runtime.compose.UidlDocumentRenderer
import io.uidl.runtime.compose.rememberUidlDocument
import io.uidl.runtime.theme.MeridianTheme

/**
 * Generated Jetpack Compose screen for UIDL Document: ${doc.name || doc.id || "UidlDocument"}
 * Dependency: implementation("io.uidl:runtime-compose:0.1.0")
 */
private const val DOCUMENT_JSON = """
${jsonStr}
"""

@Composable
fun ${componentName}(
    modifier: Modifier = Modifier
) {
    val document = rememberUidlDocument(jsonString = DOCUMENT_JSON)

    Surface(
        modifier = modifier.fillMaxSize(),
        color = ${themeMode === "light" ? "androidx.compose.ui.graphics.Color(0xFFF8FAFC)" : "androidx.compose.ui.graphics.Color(0xFF0F172A)"}
    ) {
        UidlDocumentRenderer(
            document = document,
            theme = ${themeRef},
            onAction = { action ->
                println("UIDL Action: \${action.type}")
            }
        )
    }
}
`;
}
