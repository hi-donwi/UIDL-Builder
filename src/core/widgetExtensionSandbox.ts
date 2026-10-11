/**
 * Custom Widget Extension Sandbox
 * Allows developers and plugins to register custom widgets into the visual studio canvas & palette.
 */

import type { UIDLNode } from "uidl-runtime";

export interface WidgetExtensionManifest {
  type: string;
  name: string;
  category: "custom" | "data" | "input" | "layout" | "feedback";
  description?: string;
  icon?: string;
  defaultProps: Record<string, unknown>;
  defaultStyle?: Record<string, string>;
  hasChildren?: boolean;
  slots?: string[];
  propSchema?: Record<string, { type: "string" | "number" | "boolean" | "select" | "color"; options?: string[]; default?: unknown }>;
}

class WidgetExtensionRegistry {
  private registry = new Map<string, WidgetExtensionManifest>();

  constructor() {
    this.registerBuiltinCustomWidgets();
  }

  private registerBuiltinCustomWidgets(): void {
    // Example high-value built-in custom widgets:
    this.register({
      type: "MetricTrendChart",
      name: "Metric Trend Chart",
      category: "data",
      description: "Miniature sparkline trend visualization with baseline KPI comparison.",
      icon: "trending-up",
      defaultProps: {
        title: "Weekly Conversions",
        value: 12450,
        trend: "+14.2%",
        trendDirection: "up",
        color: "#06b6d4",
      },
      defaultStyle: {
        padding: "p-4",
        borderRadius: "rounded-lg",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
      },
      hasChildren: false,
    });

    this.register({
      type: "StatusBadgeTimeline",
      name: "Status Timeline",
      category: "feedback",
      description: "Auditable progression stepper showing status lifecycle transitions.",
      icon: "git-commit",
      defaultProps: {
        currentStep: 2,
        steps: ["Draft Created", "Dispatched to Customer", "Payment Settled", "Reconciled"],
      },
      hasChildren: false,
    });
  }

  register(manifest: WidgetExtensionManifest): void {
    if (!manifest.type || typeof manifest.type !== "string") {
      throw new Error("Widget extension manifest must have a valid string type");
    }
    this.registry.set(manifest.type, manifest);
  }

  unregister(type: string): boolean {
    return this.registry.delete(type);
  }

  get(type: string): WidgetExtensionManifest | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  list(): WidgetExtensionManifest[] {
    return Array.from(this.registry.values());
  }

  createNode(type: string, idPrefix?: string): UIDLNode {
    const manifest = this.registry.get(type);
    const prefix = idPrefix || (manifest ? manifest.type.toLowerCase() : "custom");
    const uniqueId = `${prefix}-${Math.random().toString(36).slice(2, 7)}`;

    const node: UIDLNode = {
      id: uniqueId,
      type: manifest ? manifest.type : type,
      props: manifest ? JSON.parse(JSON.stringify(manifest.defaultProps)) : {},
      style: manifest?.defaultStyle ? JSON.parse(JSON.stringify(manifest.defaultStyle)) : undefined,
    };

    if (manifest?.hasChildren) {
      node.children = [];
    }

    if (manifest?.slots && manifest.slots.length > 0) {
      node.slots = {};
      for (const slotName of manifest.slots) {
        node.slots[slotName] = [];
      }
    }

    return node;
  }
}

export const widgetRegistry = new WidgetExtensionRegistry();
