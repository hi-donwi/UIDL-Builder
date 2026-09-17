import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import { validateDocument } from "../core/schemaValidator";
import { X, Download, Upload, Copy, Check, FileJson, Code2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "export" | "snippet" | "import";
}

export function ImportExportModal({ isOpen, onClose, defaultTab = "export" }: ImportExportModalProps) {
  const { document, setDocument } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<"export" | "snippet" | "import">(defaultTab);
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(document, null, 2);

  const reactSnippet = `import React from "react";
import { UIDocumentRenderer, meridianDarkTheme } from "uidl-runtime";
import type { UIDLDocument } from "uidl-runtime";
import "uidl-runtime/style.css";

const documentData: UIDLDocument = ${jsonString};

export default function ${document.name ? document.name.replace(/[^a-zA-Z0-9]/g, "") : "UidlView"}() {
  return (
    <div className="w-full min-h-screen">
      <UIDocumentRenderer document={documentData} theme={meridianDarkTheme} />
    </div>
  );
}
`;

  const handleDownload = () => {
    const filename = `${document.id || "uidl-document"}.json`;
    const blob = new Blob([jsonString], { type: "application/json" });
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
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(reactSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
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
      <div className="w-full max-w-2xl bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/20">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-sm text-white">Import & Export Document</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-black/40 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("export")}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "export"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setActiveTab("snippet")}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "snippet"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>React TSX Snippet</span>
          </button>

          <button
            onClick={() => setActiveTab("import")}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "import"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === "export" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Ready-to-use UIDL JSON document matching the official specification.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                rows={14}
                value={jsonString}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] focus:outline-none select-all"
              />
            </div>
          )}

          {activeTab === "snippet" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Embed this UIDL document directly into your Next.js or Vite React project using <code className="text-cyan-300">uidl-runtime</code>.
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {snippetCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{snippetCopied ? "Copied" : "Copy React Code"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={14}
                value={reactSnippet}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] focus:outline-none select-all"
              />
            </div>
          )}

          {activeTab === "import" && (
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
                rows={12}
                placeholder="Paste UIDL JSON here..."
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
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
