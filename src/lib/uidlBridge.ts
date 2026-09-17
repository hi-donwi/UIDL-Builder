import {
  defaultRegistry,
  meridianDarkTheme,
  meridianLightTheme,
  type UIDLDocument,
  type UIDLNode,
  type WidgetManifest,
  type ComponentPropDescriptor,
} from "uidl-runtime";

export interface WidgetCategoryGroup {
  id: string;
  label: string;
  description: string;
  iconName: string;
  widgets: WidgetManifest[];
}

export function getCategorizedWidgets(): WidgetCategoryGroup[] {
  const allWidgets = defaultRegistry.list();

  const categories: Record<string, WidgetManifest[]> = {
    layout: [],
    input: [],
    display: [],
    data: [],
    feedback: [],
    navigation: [],
    other: [],
  };

  for (const widget of allWidgets) {
    const cat = widget.category?.toLowerCase() || "other";
    if (categories[cat]) {
      categories[cat].push(widget);
    } else {
      categories.other.push(widget);
    }
  }

  return [
    {
      id: "layout",
      label: "Layout & Containers",
      description: "Structural blocks, flex rows, columns, and cards",
      iconName: "LayoutGrid",
      widgets: categories.layout,
    },
    {
      id: "input",
      label: "Forms & Controls",
      description: "Inputs, selects, checkboxes, switches, and sliders",
      iconName: "FormInput",
      widgets: categories.input,
    },
    {
      id: "display",
      label: "Typography & Media",
      description: "Text, headings, badges, dividers, and images",
      iconName: "Type",
      widgets: categories.display,
    },
    {
      id: "data",
      label: "Data & Collections",
      description: "DataTables, ListViews, GridViews, and Charts",
      iconName: "Table",
      widgets: categories.data,
    },
    {
      id: "navigation",
      label: "Navigation",
      description: "Navbars, sidebars, toolbars, and page bars",
      iconName: "Navigation",
      widgets: categories.navigation,
    },
    {
      id: "feedback",
      label: "Feedback & Overlays",
      description: "Dialogs, drawers, popovers, and snackbars",
      iconName: "MessageSquare",
      widgets: categories.feedback,
    },
  ];
}

export function getWidgetManifest(type: string): WidgetManifest | undefined {
  return defaultRegistry.get(type);
}

export function getWidgetDefaultProps(type: string): Record<string, unknown> {
  const manifest = defaultRegistry.get(type);
  if (!manifest) return {};

  const props: Record<string, unknown> = { ...(manifest.defaultProps || {}) };

  // Set friendly defaults for common widgets if not already present
  switch (type) {
    case "Text":
      props.value = props.value ?? "Sample text headline";
      break;
    case "Button":
      props.label = props.label ?? "Click Me";
      props.variant = props.variant ?? "primary";
      break;
    case "Badge":
      props.label = props.label ?? "Active";
      props.variant = props.variant ?? "success";
      break;
    case "TextField":
      props.label = props.label ?? "Full Name";
      props.placeholder = props.placeholder ?? "Enter value...";
      break;
    case "Container":
      props.className = props.className ?? "p-6 rounded-xl border border-border bg-surface";
      break;
    case "Row":
      props.className = props.className ?? "flex flex-row items-center gap-4";
      break;
    case "Column":
      props.className = props.className ?? "flex flex-col gap-4";
      break;
  }

  return props;
}

export { meridianDarkTheme, meridianLightTheme };
