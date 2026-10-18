import "uidl-runtime";

declare module "uidl-runtime" {
  export interface LayoutConfig {
    container?: "constrained" | "narrow" | "full" | "prose";
    maxWidth?: string;
    padding?: "none" | "compact" | "normal" | "spacious" | "responsive";
    centered?: boolean;
  }

  export interface UIDLDocument {
    layout?: LayoutConfig;
  }
}
