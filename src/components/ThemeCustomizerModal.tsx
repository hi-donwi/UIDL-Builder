import React from "react";
import { useBuilderStore } from "../core/builderStore";
import {
  ACCENT_PALETTES,
  RADIUS_PRESETS,
  FONT_PRESETS,
  DEFAULT_THEME_CONFIG,
  type AccentColorKey,
  type RadiusPresetKey,
  type FontPresetKey,
} from "../core/themeTokens";
import {
  Palette,
  X,
  RotateCcw,
  Sparkles,
  Check,
  Type,
  Maximize2,
  Layers,
} from "lucide-react";
import clsx from "clsx";

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizerModal({ isOpen, onClose }: ThemeCustomizerModalProps) {
  const { themeConfig, setThemeConfig, themeMode } = useBuilderStore();

  if (!isOpen) return null;

  const currentConfig = themeConfig || DEFAULT_THEME_CONFIG;

  const handleUpdate = (partial: Partial<typeof currentConfig>) => {
    setThemeConfig({
      ...currentConfig,
      ...partial,
    });
  };

  const handleReset = () => {
    setThemeConfig(DEFAULT_THEME_CONFIG);
  };

  const currentPalette = ACCENT_PALETTES[currentConfig.accentColor] || ACCENT_PALETTES.cyan;
  const currentRadius = RADIUS_PRESETS[currentConfig.radius] || RADIUS_PRESETS.rounded;
  const currentFont = FONT_PRESETS[currentConfig.fontFamily] || FONT_PRESETS.inter;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#161b22] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Theme & Design Token Studio</h2>
              <p className="text-[11px] text-slate-400">
                Customize brand accent colors, corner radii, and typography across the entire UIDL document.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs hover:bg-white/5 transition-colors"
              title="Reset to default theme tokens"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Section 1: Brand Accent Palette */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Brand Accent Color</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Active: {currentPalette.label} ({currentPalette.primary})
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {(Object.keys(ACCENT_PALETTES) as AccentColorKey[]).map((key) => {
                const pal = ACCENT_PALETTES[key];
                const isSelected = currentConfig.accentColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleUpdate({ accentColor: key, customPrimaryHex: undefined })}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                      isSelected
                        ? "border-white/40 bg-white/10 shadow-md ring-2 ring-white/20"
                        : "border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: pal.primary }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-medium text-slate-300">{pal.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Override */}
            <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[11px] text-slate-400">Custom Primary Hex:</span>
              <input
                type="color"
                value={currentConfig.customPrimaryHex || currentPalette.primary}
                onChange={(e) => handleUpdate({ customPrimaryHex: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={currentConfig.customPrimaryHex || currentPalette.primary}
                onChange={(e) => handleUpdate({ customPrimaryHex: e.target.value })}
                placeholder="#06b6d4"
                className="px-2 py-1 rounded bg-black/50 border border-white/10 font-mono text-[11px] text-white w-24 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 2: Corner Radii Presets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Corner Radius System</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Active: {currentRadius.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(RADIUS_PRESETS) as RadiusPresetKey[]).map((key) => {
                const rad = RADIUS_PRESETS[key];
                const isSelected = currentConfig.radius === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleUpdate({ radius: key })}
                    className={clsx(
                      "p-3 rounded-xl border text-left transition-all flex flex-col gap-2",
                      isSelected
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                        : "border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{rad.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 border-2 border-cyan-400/80 bg-cyan-400/20"
                        style={{ borderRadius: rad.md }}
                      />
                      <span className="text-[10px] font-mono text-slate-500">md: {rad.md}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Typography Font Family */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                <span>Document Font Family</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Active: {currentFont.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(FONT_PRESETS) as FontPresetKey[]).map((key) => {
                const font = FONT_PRESETS[key];
                const isSelected = currentConfig.fontFamily === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleUpdate({ fontFamily: key })}
                    className={clsx(
                      "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between",
                      isSelected
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                        : "border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white" style={{ fontFamily: font.stack }}>
                        {font.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                        The quick brown fox
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Sample Card */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Live Component Token Preview</span>
              </span>
              <span>Mode: {themeMode}</span>
            </div>

            <div
              className="p-4 rounded-xl border border-white/10 bg-[#0d1117] flex flex-wrap items-center gap-3"
              style={{
                fontFamily: currentFont.stack,
              }}
            >
              <button
                className="px-3.5 py-1.5 font-bold text-xs text-black shadow-md transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: currentConfig.customPrimaryHex || currentPalette.primary,
                  borderRadius: currentRadius.md,
                }}
              >
                <span>Primary Action</span>
              </button>

              <span
                className="px-2.5 py-0.5 text-xs font-semibold border"
                style={{
                  backgroundColor: `${currentPalette.primary}20`,
                  color: currentConfig.customPrimaryHex || currentPalette.primary,
                  borderColor: `${currentPalette.primary}40`,
                  borderRadius: currentRadius.sm,
                }}
              >
                Active Status
              </span>

              <div
                className="px-3 py-1.5 bg-black/50 border border-white/15 text-xs text-slate-300"
                style={{
                  borderRadius: currentRadius.md,
                }}
              >
                Input field preview
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
