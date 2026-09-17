import type { UIDLDocument } from "uidl-runtime";

export interface DocumentTemplate {
  id: string;
  name: string;
  category: "dashboard" | "form" | "table" | "blank";
  description: string;
  tags: string[];
  document: UIDLDocument;
}

export const TEMPLATES: DocumentTemplate[] = [
  {
    id: "dashboard-analytics",
    name: "SaaS Metrics Dashboard",
    category: "dashboard",
    description: "Executive KPI dashboard with stat cards, revenue chart, and recent customer activity.",
    tags: ["Metrics", "KPI", "Cards", "Charts"],
    document: {
      $schema: "https://uidl.dev/schema/v1/document.json",
      version: "1.0.0",
      id: "saas-metrics-dashboard",
      name: "SaaS Metrics Dashboard",
      state: {
        totalRevenue: "$124,592",
        activeUsers: "42,830",
        conversionRate: "4.8%",
        churnRate: "0.8%",
      },
      root: {
        id: "root_container",
        type: "Container",
        props: {
          className: "p-6 flex flex-col gap-6 bg-[#0a0f1d] text-white min-h-screen",
        },
        children: [
          {
            id: "header_row",
            type: "Row",
            props: {
              className: "flex justify-between items-center pb-4 border-b border-white/10",
            },
            children: [
              {
                id: "title_col",
                type: "Column",
                props: { className: "flex flex-col gap-1" },
                children: [
                  {
                    id: "dashboard_title",
                    type: "Text",
                    props: {
                      heading: "2",
                      value: "Platform Overview",
                      className: "text-2xl font-bold tracking-tight text-white",
                    },
                  },
                  {
                    id: "dashboard_subtitle",
                    type: "Text",
                    props: {
                      value: "Real-time metrics and system health indicators.",
                      className: "text-sm text-slate-400",
                    },
                  },
                ],
              },
              {
                id: "header_actions",
                type: "Row",
                props: { className: "flex items-center gap-3" },
                children: [
                  {
                    id: "export_btn",
                    type: "Button",
                    props: {
                      label: "Export Report",
                      variant: "secondary",
                      className: "px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-all",
                    },
                  },
                  {
                    id: "action_btn",
                    type: "Button",
                    props: {
                      label: "Live Settings",
                      variant: "primary",
                      className: "px-4 py-2 text-sm rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all shadow-lg shadow-cyan-500/20",
                    },
                  },
                ],
              },
            ],
          },
          {
            id: "stats_grid",
            type: "Row",
            props: {
              className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
            },
            children: [
              {
                id: "card_revenue",
                type: "Container",
                props: {
                  className: "p-5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-2 hover:border-cyan-500/40 transition-all",
                },
                children: [
                  {
                    id: "label_rev",
                    type: "Text",
                    props: { value: "Total Revenue", className: "text-xs uppercase tracking-wider text-slate-400 font-semibold" },
                  },
                  {
                    id: "val_rev",
                    type: "Text",
                    props: { value: "$124,592", className: "text-3xl font-extrabold text-white" },
                  },
                  {
                    id: "badge_rev",
                    type: "Badge",
                    props: { label: "+18.2% vs last month", variant: "success", className: "text-xs w-fit px-2 py-0.5" },
                  },
                ],
              },
              {
                id: "card_users",
                type: "Container",
                props: {
                  className: "p-5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-2 hover:border-cyan-500/40 transition-all",
                },
                children: [
                  {
                    id: "label_users",
                    type: "Text",
                    props: { value: "Active Users", className: "text-xs uppercase tracking-wider text-slate-400 font-semibold" },
                  },
                  {
                    id: "val_users",
                    type: "Text",
                    props: { value: "42,830", className: "text-3xl font-extrabold text-white" },
                  },
                  {
                    id: "badge_users",
                    type: "Badge",
                    props: { label: "+6.4% this week", variant: "success", className: "text-xs w-fit px-2 py-0.5" },
                  },
                ],
              },
              {
                id: "card_conv",
                type: "Container",
                props: {
                  className: "p-5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-2 hover:border-cyan-500/40 transition-all",
                },
                children: [
                  {
                    id: "label_conv",
                    type: "Text",
                    props: { value: "Conversion Rate", className: "text-xs uppercase tracking-wider text-slate-400 font-semibold" },
                  },
                  {
                    id: "val_conv",
                    type: "Text",
                    props: { value: "4.82%", className: "text-3xl font-extrabold text-white" },
                  },
                  {
                    id: "badge_conv",
                    type: "Badge",
                    props: { label: "+0.3% target", variant: "primary", className: "text-xs w-fit px-2 py-0.5" },
                  },
                ],
              },
              {
                id: "card_churn",
                type: "Container",
                props: {
                  className: "p-5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-2 hover:border-cyan-500/40 transition-all",
                },
                children: [
                  {
                    id: "label_churn",
                    type: "Text",
                    props: { value: "Customer Churn", className: "text-xs uppercase tracking-wider text-slate-400 font-semibold" },
                  },
                  {
                    id: "val_churn",
                    type: "Text",
                    props: { value: "0.84%", className: "text-3xl font-extrabold text-white" },
                  },
                  {
                    id: "badge_churn",
                    type: "Badge",
                    props: { label: "-0.2% optimal", variant: "success", className: "text-xs w-fit px-2 py-0.5" },
                  },
                ],
              },
            ],
          },
          {
            id: "content_split",
            type: "Row",
            props: { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            children: [
              {
                id: "chart_panel",
                type: "Container",
                props: {
                  className: "lg:col-span-2 p-6 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-4",
                },
                children: [
                  {
                    id: "chart_title",
                    type: "Text",
                    props: { heading: "4", value: "Monthly Revenue Stream", className: "text-lg font-bold text-white" },
                  },
                  {
                    id: "chart_mock",
                    type: "Container",
                    props: {
                      className: "h-64 rounded-lg bg-gradient-to-t from-cyan-500/10 via-slate-800/40 to-transparent border border-cyan-500/20 flex items-center justify-center",
                    },
                    children: [
                      {
                        id: "chart_text",
                        type: "Text",
                        props: { value: "Interactive Chart Visualization Active", className: "text-sm text-cyan-400 font-mono" },
                      },
                    ],
                  },
                ],
              },
              {
                id: "recent_activity_panel",
                type: "Container",
                props: {
                  className: "p-6 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col gap-4",
                },
                children: [
                  {
                    id: "activity_title",
                    type: "Text",
                    props: { heading: "4", value: "Recent Audits", className: "text-lg font-bold text-white" },
                  },
                  {
                    id: "activity_list",
                    type: "Column",
                    props: { className: "flex flex-col gap-3" },
                    children: [
                      {
                        id: "item_1",
                        type: "Row",
                        props: { className: "flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5" },
                        children: [
                          {
                            id: "t1_text",
                            type: "Text",
                            props: { value: "Rule R-329 Triggered", className: "text-xs font-semibold text-slate-200" },
                          },
                          {
                            id: "t1_badge",
                            type: "Badge",
                            props: { label: "High Risk", variant: "error", className: "text-[10px]" },
                          },
                        ],
                      },
                      {
                        id: "item_2",
                        type: "Row",
                        props: { className: "flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5" },
                        children: [
                          {
                            id: "t2_text",
                            type: "Text",
                            props: { value: "KYC Verified (PT Telkom)", className: "text-xs font-semibold text-slate-200" },
                          },
                          {
                            id: "t2_badge",
                            type: "Badge",
                            props: { label: "Approved", variant: "success", className: "text-[10px]" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "form-onboarding",
    name: "Customer Onboarding Form",
    category: "form",
    description: "Full registration form with validation, multi-column inputs, and action triggers.",
    tags: ["Form", "Inputs", "Registration"],
    document: {
      $schema: "https://uidl.dev/schema/v1/document.json",
      version: "1.0.0",
      id: "customer-onboarding-form",
      name: "Customer Onboarding",
      root: {
        id: "form_root",
        type: "Container",
        props: {
          className: "max-w-2xl mx-auto p-8 rounded-2xl border border-white/10 bg-slate-900/80 text-white my-8 flex flex-col gap-6",
        },
        children: [
          {
            id: "form_title",
            type: "Text",
            props: { heading: "2", value: "New Account Registration", className: "text-2xl font-bold" },
          },
          {
            id: "form_desc",
            type: "Text",
            props: { value: "Complete all fields to verify enterprise credentials.", className: "text-sm text-slate-400 -mt-3" },
          },
          {
            id: "input_name",
            type: "TextField",
            props: {
              label: "Company / Legal Entity Name",
              placeholder: "e.g. PT Maju Bersama",
              className: "w-full",
            },
          },
          {
            id: "row_contact",
            type: "Row",
            props: { className: "grid grid-cols-2 gap-4" },
            children: [
              {
                id: "input_email",
                type: "TextField",
                props: { label: "Work Email", placeholder: "admin@company.com" },
              },
              {
                id: "input_phone",
                type: "TextField",
                props: { label: "Official Phone Number", placeholder: "+62 812-3456-7890" },
              },
            ],
          },
          {
            id: "input_tier",
            type: "Select",
            props: {
              label: "Subscription Plan",
              options: [
                { value: "starter", label: "Starter — Free Tier" },
                { value: "growth", label: "Growth — $99/mo" },
                { value: "enterprise", label: "Enterprise — Custom SLA" },
              ],
            },
          },
          {
            id: "switch_terms",
            type: "Switch",
            props: {
              label: "I accept the Master Service Agreement and Data Privacy Policy",
            },
          },
          {
            id: "btn_submit",
            type: "Button",
            props: {
              label: "Create Account",
              variant: "primary",
              className: "w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25",
            },
          },
        ],
      },
    },
  },
  {
    id: "blank-canvas",
    name: "Blank Canvas",
    category: "blank",
    description: "Clean empty document ready for drag-and-drop or component stacking.",
    tags: ["Empty", "Clean", "Starter"],
    document: {
      $schema: "https://uidl.dev/schema/v1/document.json",
      version: "1.0.0",
      id: "blank-canvas-doc",
      name: "Untitled UIDL Document",
      root: {
        id: "root",
        type: "Container",
        props: {
          className: "p-8 flex flex-col gap-6 min-h-[400px] border-2 border-dashed border-white/20 rounded-2xl items-center justify-center text-center",
        },
        children: [
          {
            id: "empty_heading",
            type: "Text",
            props: {
              heading: "3",
              value: "Empty Canvas",
              className: "text-xl font-bold text-slate-300",
            },
          },
          {
            id: "empty_hint",
            type: "Text",
            props: {
              value: "Select components from the left palette to begin designing your UIDL interface.",
              className: "text-sm text-slate-500 max-w-sm",
            },
          },
        ],
      },
    },
  },
];
