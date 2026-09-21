import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import { validateDocument } from "../core/schemaValidator";
import {
  generateReactSnippet,
  generateFlutterSnippet,
  generateComposeSnippet,
  countDocumentNodes,
} from "../core/exportGenerators";
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  Code2,
  AlertCircle,
  Smartphone,
  Layers,
  Terminal,
} from "lucide-react";
import clsx from "clsx";

export type ExportPlatform = "json" | "react" | "flutter" | "compose";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "export" | "snippet" | "import";
}

export function ImportExportModal({ isOpen, onClose, defaultTab = "export" }: ImportExportModalProps) {
  const { document, setDocument, themeMode } = useBuilderStore();
  const [mainTab, setMainTab] = useState<"export" | "import">(
    defaultTab === "import" ? "import" : "export"
  );
  const [platform, setPlatform] = useState<ExportPlatform>(
    defaultTab === "snippet" ? "react" : "json"
  );

  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(document, null, 2);
  const totalNodes = countDocumentNodes(document.root);
  const docSizeKb = (new Blob([jsonString]).size / 1024).toFixed(1);

  const codeSnippets: Record<ExportPlatform, { code: string; ext: string; dep: string; lang: string }> = {
    json: {
      code: jsonString,
      ext: "json",
      dep: "uidl-runtime >= 0.1.4",
      lang: "json",
    },
    react: {
      code: generateReactSnippet(document, themeMode),
      ext: "tsx",
      dep: "npm install uidl-runtime",
      lang: "typescript",
    },
    flutter: {
      code: generateFlutterSnippet(document, themeMode),
      ext: "dart",
      dep: "flutter pub add uidl_runtime",
      lang: "dart",
    },
    compose: {
      code: generateComposeSnippet(document, themeMode),
      ext: "kt",
      dep: "implementation(\"io.uidl:runtime-compose:0.1.0\")",
      lang: "kotlin",
    },
  };

  const activeSnippet = codeSnippets[platform];

  const handleDownload = () => {
    const baseName = (document.id || document.name || "uidl-screen")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const filename = `${baseName}.${activeSnippet.ext}`;
    const mimeType = platform === "json" ? "application/json" : "text/plain";
    const blob = new Blob([activeSnippet.code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = () => {
    try {
      const parsed = JSON.parse(importText);
      const val = validateDocument(parsed);
      if (!val.isValid) {
        setImportError(val.errors.map((e) => `${e.path}: ${e.message}`).join(", "));
        return;
      }
      setDocument(parsed);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Invalid JSON syntax";
      setImportError(errorMsg);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      setImportError(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/30">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-sm text-white">Import & Export Multi-Platform Studio</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Level Mode Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-5 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMainTab("export")}
              className={clsx(
                "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
                mainTab === "export"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Multi-Platform Export</span>
            </button>

            <button
              onClick={() => setMainTab("import")}
              className={clsx(
                "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
                mainTab === "import"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-white"
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Document</span>
            </button>
          </div>

          {/* Quick Metrics Badge */}
          {mainTab === "export" && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{totalNodes} Nodes</span>
              </span>
              <span>•</span>
              <span>{docSizeKb} KB</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">v{document.version || "1.0.0"}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {mainTab === "export" && (
            <div className="space-y-4">
              {/* Platform Selector Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-black/50 border border-white/5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setPlatform("json");
                      setCopied(false);
                    }}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                      platform === "json"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>JSON Schema</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlatform("react");
                      setCopied(false);
                    }}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                      platform === "react"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>React (TSX)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlatform("flutter");
                      setCopied(false);
                    }}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                      platform === "flutter"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Flutter (Dart)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlatform("compose");
                      setCopied(false);
                    }}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5",
                      platform === "compose"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Android (Compose)</span>
                  </button>
                </div>

                {/* Actions: Copy & Download */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .{activeSnippet.ext}</span>
                  </button>
                </div>
              </div>

              {/* Dependency / Integration note */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-white/5 font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Integration requirement:</span>
                  <code className="text-cyan-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {activeSnippet.dep}
                  </code>
                </div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                  {activeSnippet.lang}
                </span>
              </div>

              {/* Code preview area */}
              <textarea
                readOnly
                rows={15}
                value={activeSnippet.code}
                className="w-full p-4 rounded-xl bg-black/70 border border-white/10 text-cyan-300 font-mono text-[11px] leading-relaxed focus:outline-none select-all focus:border-cyan-500/50 transition-colors"
              />
            </div>
          )}

          {mainTab === "import" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Paste a valid UIDL JSON document or upload a <code className="text-cyan-400">.json</code> file.
                </span>
                <label className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Schema Validation Error:</span>
                    <span className="text-[11px] text-rose-400/90 font-mono break-all">{importError}</span>
                  </div>
                </div>
              )}

              <textarea
                rows={14}
                placeholder="Paste UIDL JSON here..."
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!importText.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold transition-all shadow-md shadow-cyan-500/20"
                >
                  Load Into Canvas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
