import { describe, it, expect } from "vitest";
import { widgetRegistry } from "../widgetExtensionSandbox";

describe("widgetExtensionSandbox", () => {
  it("provides built-in custom extensions", () => {
    expect(widgetRegistry.has("MetricTrendChart")).toBe(true);
    expect(widgetRegistry.has("StatusBadgeTimeline")).toBe(true);
    const extensions = widgetRegistry.list();
    expect(extensions.length).toBeGreaterThanOrEqual(2);
  });

  it("registers and creates new custom widget nodes", () => {
    widgetRegistry.register({
      type: "CustomQrScanner",
      name: "QR Code Scanner",
      category: "input",
      description: "Camera QR code viewfinder with barcode detection",
      icon: "camera",
      defaultProps: {
        facingMode: "environment",
        fps: 30,
      },
      hasChildren: false,
    });

    expect(widgetRegistry.has("CustomQrScanner")).toBe(true);
    const node = widgetRegistry.createNode("CustomQrScanner", "qr");
    expect(node.type).toBe("CustomQrScanner");
    expect(node.id).toMatch(/^qr-/);
    expect(node.props?.facingMode).toBe("environment");
    expect(node.props?.fps).toBe(30);

    // cleanup
    widgetRegistry.unregister("CustomQrScanner");
    expect(widgetRegistry.has("CustomQrScanner")).toBe(false);
  });

  it("throws error when registering with invalid type", () => {
    expect(() => {
      widgetRegistry.register({
        type: "",
        name: "Invalid",
        category: "custom",
        defaultProps: {},
      });
    }).toThrow();
  });
});
