# UIDL Builder

> Visual schema studio and visual editor for **UIDL** (User Interface Definition Language) documents, powered 100% by [**UIDL-Runtime**](https://github.com/hi-donwi/UIDL-Runtime).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Engine: UIDL-Runtime](https://img.shields.io/badge/Engine-UIDL--Runtime%20v0.1.4-cyan)](https://github.com/hi-donwi/UIDL-Runtime)

---

## Overview

**UIDL-Builder** is an open-source, public visual builder that dogfoods **UIDL-Runtime** across both sides of its architecture:
1. **The Builder UI/UX**: The application shell, palettes, inspector surfaces, and previews are orchestrated with UIDL component registries and design tokens.
2. **The Output Documents**: Visual edits produce strictly validated JSON UIDL documents (`DocumentSchema`), which are previewed live through `UIDocumentRenderer`.

---

## Features

- **Interactive Canvas with Device Viewports**: Switch seamlessly between Desktop (100%), Tablet (768px), and Mobile (375px) breakpoints with zoom support (50% - 150%) and grid alignment.
- **Dynamic Widget Palette**: Autodiscovered from UIDL's component registry (`defaultRegistry.list()`), grouped into *Layout*, *Inputs*, *Typography*, *Data & Tables*, *Navigation*, and *Feedback*.
- **Live Document Tree & Layer Hierarchy**: Real-time layer tree with instant node selection, duplication, reordering, and deletion.
- **Adaptive Property Inspector**: Form fields generated automatically from each widget's `ComponentPropDescriptor` (text, number, enum selects, boolean toggles, and direct Tailwind utility classes).
- **Starter Template Library**: Pre-built enterprise templates (SaaS KPI Dashboard, Customer Onboarding Form, Blank Canvas).
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
│  └────────┬─────────┘            └────────▲─────────┘  │
│           │ add node                      │ inspect    │
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

## License

MIT © Doni Wicaksono
