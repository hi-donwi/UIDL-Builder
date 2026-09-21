import type { BuilderPage } from "./builderStore";
import type { ThemeCustomizationConfig } from "./themeTokens";
import { validateDocument } from "./schemaValidator";

const STORAGE_KEY = "uidl_builder_draft_v1";

export interface SavedDraft {
  version: number;
  savedAt: string;
  pages: BuilderPage[];
  activePageId: string;
  themeMode: "dark" | "light";
  themeConfig?: ThemeCustomizationConfig;
}

/**
 * Persist current workbench state to browser local storage.
 */
export function saveDraftToStorage(
  pages: BuilderPage[],
  activePageId: string,
  themeMode: "dark" | "light",
  themeConfig?: ThemeCustomizationConfig
): boolean {
  try {
    const payload: SavedDraft = {
      version: 1,
      savedAt: new Date().toISOString(),
      pages,
      activePageId,
      themeMode,
      themeConfig,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn("[UIDL Builder] Failed to auto-save draft to localStorage:", err);
    return false;
  }
}

/**
 * Retrieve saved draft from browser local storage with schema validation.
 */
export function loadDraftFromStorage(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedDraft;
    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return null;
    }

    // Validate that documents inside pages are valid UIDL documents
    const validPages: BuilderPage[] = [];
    for (const page of parsed.pages) {
      if (page.document && typeof page.document === "object") {
        const val = validateDocument(page.document);
        if (val.isValid) {
          validPages.push(page);
        }
      }
    }

    if (validPages.length === 0) {
      return null;
    }

    // Ensure active page ID points to a valid page
    let activeId = parsed.activePageId;
    if (!validPages.some((p) => p.id === activeId)) {
      activeId = validPages[0].id;
    }

    return {
      version: parsed.version || 1,
      savedAt: parsed.savedAt || new Date().toISOString(),
      pages: validPages,
      activePageId: activeId,
      themeMode: parsed.themeMode === "light" ? "light" : "dark",
      themeConfig: parsed.themeConfig,
    };
  } catch (err) {
    console.warn("[UIDL Builder] Failed to load draft from localStorage:", err);
    return null;
  }
}

/**
 * Reset and clear saved draft from browser storage.
 */
export function clearDraftFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[UIDL Builder] Failed to clear draft storage:", err);
  }
}
