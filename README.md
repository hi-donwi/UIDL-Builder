# UIDL Builder

> Visual schema studio and visual editor for **UIDL** (User Interface Definition Language) documents, powered 100% by [**UIDL-Runtime**](https://www.npmjs.com/package/uidl-runtime).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/uidl-runtime.svg?color=cyan)](https://www.npmjs.com/package/uidl-runtime)
[![CI/CD: GitHub Pages](https://github.com/hi-donwi/UIDL-Builder/actions/workflows/deploy.yml/badge.svg)](https://github.com/hi-donwi/UIDL-Builder/actions/workflows/deploy.yml)

---

## Overview

**UIDL-Builder** is an open-source visual editor that dogfoods **UIDL-Runtime** across both sides of its architecture:
1. **The Builder UI/UX**: The application shell, palettes, inspector surfaces, and previews are orchestrated with UIDL component registries and design tokens.
2. **The Output Documents**: Visual edits produce strictly validated JSON UIDL documents (`DocumentSchema`), which are previewed live through `UIDocumentRenderer`.

---

## Features

- **Interactive Canvas with Device Viewports**: Switch seamlessly between Desktop (100%), Tablet (768px), and Mobile (375px) breakpoints with zoom support (50% - 150%) and grid alignment.
- **Drag-and-Drop Canvas Insertion**: Drag widgets directly from the palette and drop them onto the canvas or into the layer hierarchy tree.
- **Visual Action & Event Flow Editor**: Bind component triggers (`onClick`, `onChange`, `onSubmit`, `onSelect`, `onRowClick`) to standard UIDL runtime actions:
  - `showSnackbar` (toast messages with custom duration)
  - `showDialog` (modal confirmation dialogues)
  - `setState` (document reactive state mutations)
  - `navigate` (client-side routing)
  - `api` (REST HTTP requests with method configuration)
  - `mutate` (collection mutations and transaction flows)
- **Comprehensive Industry Template Library**:
  - Healthcare & Hospital EMR Console (`hospital-medika-console`)
  - Islamic Microfinance & Koperasi BMT Console (`koperasi-bmt-console`)
  - CloudDesk IT Service & Helpdesk Portal (`helpdesk-console`)
  - CRM Sales Pipeline & Opportunity Management (`crm-pipeline-console`)
  - School Academic & Tuition Accounting Console (`school-abc-console`)
  - SaaS Growth & MRR Analytics Dashboard (`saas-growth-suite`)
  - Customer Registration & Order Form (`customer-onboarding-form`)
  - Blank Clean Canvas (`blank-canvas-doc`)
- **Dynamic Widget Palette**: Autodiscovered from UIDL's component registry (`defaultRegistry.list()`), grouped into *Layout*, *Inputs*, *Typography*, *Data & Tables*, *Navigation*, and *Feedback*.
- **Live Document Tree & Layer Hierarchy**: Real-time layer tree with instant node selection, duplication, reordering, and deletion.
- **Adaptive Property Inspector**: Form fields generated automatically from each widget's `ComponentPropDescriptor` (text, number, enum selects, boolean toggles, and direct Tailwind utility classes).
- **Two-Way JSON Synchronization**: Edit visually on the canvas or type directly into the JSON code editor with real-time schema validation feedback.
- **Instant Export & Import**: Download `.json` document files, copy formatted JSON to clipboard, or paste existing UIDL documents to continue editing.
- **Meridian Dark & Light Themes**: Built-in toggle between Meridian dark and light design token palettes.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:hi-donwi/UIDL-Builder.git
cd UIDL-Builder
npm install
```

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:3300` in your browser.

### Building for Production

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

---

## Relationship with UIDL-Runtime

```
┌────────────────────────────────────────────────────────┐
│                      UIDL-Builder                      │
│                                                        │
│  ┌──────────────────┐            ┌──────────────────┐  │
│  │   Widget Palette │            │  Prop Inspector  │  │
│  │   & Drag Source  │            │  & Action Binder │  │
│  └────────┬─────────┘            └────────▲─────────┘  │
│           │ add / drop node               │ inspect    │
│           ▼                               │            │
│  ┌────────────────────────────────────────┴─────────┐  │
│  │               Interactive Canvas                 │  │
│  │        <UIDocumentRenderer document={doc} />     │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ imports & executes
                            ▼
┌────────────────────────────────────────────────────────┐
│                      UIDL-Runtime                      │
│                                                        │
│  • DocumentSchema (Zod validation)                     │
│  • Component Registry (Layout, Forms, Tables, Charts)  │
│  • Action Interpreter & Event Bus                      │
│  • DataAdapter (InMemoryAdapter & HttpAdapter)         │
│  • Meridian Theme Engine                               │
└────────────────────────────────────────────────────────┘
```

---

## Deployment to GitHub Pages

This repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs typecheck, builds the application with the base path `/UIDL-Builder/`, and deploys it to GitHub Pages on every push to `main`.

---

## License

MIT © Doni Wicaksono
