import { describe, it, expect, beforeEach } from "vitest";
import { useBuilderStore } from "../builderStore";
import { validateDocument } from "../schemaValidator";
import type { UIDLDocument } from "uidl-runtime";

describe("builderStore definitions (reusable components)", () => {
  const initialDoc: UIDLDocument = {
    id: "def-test-doc",
    version: "1.0.0",
    name: "Definition Test Doc",
    root: {
      id: "root",
      type: "Container",
      props: { className: "p-4 flex flex-col gap-4" },
      children: [
        {
          id: "custom_card_1",
          type: "Card",
          props: { title: "Metrics Widget" },
          children: [
            {
              id: "stat_text",
              type: "Typography",
              props: { text: "Active Users: 1,200", variant: "h3" },
            },
            {
              id: "refresh_btn",
              type: "Button",
              props: { label: "Refresh Data", variant: "outline" },
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    useBuilderStore.getState().setDocument(initialDoc);
    useBuilderStore.getState().selectNode("custom_card_1");
  });

  it("saves a node sub-tree as a reusable component definition", () => {
    const store = useBuilderStore.getState();
    store.saveNodeAsDefinition("custom_card_1", "MetricsCard", "Reusable Metrics Card");

    const state = useBuilderStore.getState();
    expect(state.document.definitions).toBeDefined();
    expect(state.document.definitions?.MetricsCard).toBeDefined();

    const def = state.document.definitions?.MetricsCard;
    expect(def?.type).toBe("Card");
    expect(def?.name).toBe("Reusable Metrics Card");
    expect(def?.children).toHaveLength(2);
    expect(def?.componentId).toBeUndefined();

    // Document must remain 100% valid under DocumentSchema
    const val = validateDocument(state.document);
    expect(val.isValid).toBe(true);
  });

  it("adds an instance of a definition to the document tree", () => {
    const store = useBuilderStore.getState();
    store.saveNodeAsDefinition("custom_card_1", "MetricsCard", "Reusable Metrics Card");

    store.addDefinitionInstance("root", "MetricsCard");

    const state = useBuilderStore.getState();
    const children = state.document.root.children || [];
    expect(children.length).toBe(2);

    const instanceNode = children[1];
    expect(instanceNode.componentId).toBe("MetricsCard");
    expect(instanceNode.type).toBe("Card");
    expect(instanceNode.name).toContain("(Instance)");

    const val = validateDocument(state.document);
    expect(val.isValid).toBe(true);
  });

  it("detaches a definition instance into an independent editable node", () => {
    const store = useBuilderStore.getState();
    store.saveNodeAsDefinition("custom_card_1", "MetricsCard", "Reusable Metrics Card");
    store.addDefinitionInstance("root", "MetricsCard");

    let state = useBuilderStore.getState();
    const instanceId = state.document.root.children![1].id;

    store.detachDefinitionInstance(instanceId);

    state = useBuilderStore.getState();
    const detachedNode = state.document.root.children![1];
    expect(detachedNode.componentId).toBeUndefined();
    expect(detachedNode.type).toBe("Card");
    expect(detachedNode.children).toHaveLength(2);
    expect(detachedNode.children?.[0].type).toBe("Typography");

    const val = validateDocument(state.document);
    expect(val.isValid).toBe(true);
  });

  it("removes a definition from document definitions", () => {
    const store = useBuilderStore.getState();
    store.saveNodeAsDefinition("custom_card_1", "MetricsCard", "Reusable Metrics Card");

    expect(useBuilderStore.getState().document.definitions?.MetricsCard).toBeDefined();

    store.removeDefinition("MetricsCard");

    const state = useBuilderStore.getState();
    expect(state.document.definitions).toBeUndefined();

    const val = validateDocument(state.document);
    expect(val.isValid).toBe(true);
  });
});
