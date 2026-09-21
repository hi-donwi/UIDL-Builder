import { describe, it, expect, beforeEach } from "vitest";
import {
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
} from "../draftPersistence";
import type { BuilderPage } from "../builderStore";
import type { UIDLDocument } from "uidl-runtime";

describe("draftPersistence", () => {
  const sampleDocument: UIDLDocument = {
    id: "sample-draft-doc",
    version: "1.0.0",
    name: "Draft Doc",
    root: {
      id: "root",
      type: "Container",
      props: { className: "p-4" },
      children: [
        {
          id: "txt_1",
          type: "Typography",
          props: { text: "Saved Text" },
        },
      ],
    },
  };

  const samplePages: BuilderPage[] = [
    {
      id: "page-1",
      name: "Main Page",
      route: "/main",
      document: sampleDocument,
    },
  ];

  // In-memory mock for localStorage in test environment
  let storageState: Record<string, string> = {};
  beforeEach(() => {
    storageState = {};
    const mockStorage = {
      getItem: (key: string) => storageState[key] ?? null,
      setItem: (key: string, value: string) => {
        storageState[key] = value;
      },
      removeItem: (key: string) => {
        delete storageState[key];
      },
      clear: () => {
        storageState = {};
      },
      length: 0,
      key: () => null,
    };
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  it("returns null when no draft has been stored", () => {
    const loaded = loadDraftFromStorage();
    expect(loaded).toBeNull();
  });

  it("saves and loads draft successfully", () => {
    const ok = saveDraftToStorage(samplePages, "page-1", "dark");
    expect(ok).toBe(true);

    const draft = loadDraftFromStorage();
    expect(draft).not.toBeNull();
    expect(draft?.pages).toHaveLength(1);
    expect(draft?.activePageId).toBe("page-1");
    expect(draft?.themeMode).toBe("dark");
    expect(draft?.pages[0].document.name).toBe("Draft Doc");
  });

  it("clears draft from storage", () => {
    saveDraftToStorage(samplePages, "page-1", "light");
    expect(loadDraftFromStorage()).not.toBeNull();

    clearDraftFromStorage();
    expect(loadDraftFromStorage()).toBeNull();
  });

  it("discards corrupt pages that do not satisfy DocumentSchema", () => {
    const corruptPage: BuilderPage = {
      id: "page-corrupt",
      name: "Broken Page",
      route: "/broken",
      document: {
        // missing id, root, and invalid types
        version: "invalid",
      } as unknown as UIDLDocument,
    };

    saveDraftToStorage([...samplePages, corruptPage], "page-corrupt", "dark");
    const loaded = loadDraftFromStorage();

    expect(loaded).not.toBeNull();
    // Only the valid page should survive
    expect(loaded?.pages).toHaveLength(1);
    expect(loaded?.pages[0].id).toBe("page-1");
    // activePageId should fall back to first valid page since active was corrupt
    expect(loaded?.activePageId).toBe("page-1");
  });
});
