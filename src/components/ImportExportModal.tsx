import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import { validateDocument } from "../core/schemaValidator";
import { X, Download, Upload, Copy, Check, FileJson, AlertCircle } from "lucide-react";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "export" | "import";
}

export function ImportExportModal({ isOpen, onClose, defaultTab = "export" }: ImportExportModalProps) {
  const { document, setDocument } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<"export" | "import">(defaultTab);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(document, null, 2);

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
    } catch (err: any) {
      setImportError(err.message || "Invalid JSON syntax");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#161b22] text-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              {activeTab === "export" ? "Export UIDL Document" : "Import UIDL Document"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 text-xs">
              <button
                onClick={() => setActiveTab("export")}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  activeTab === "export" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
                }`}
              >
                Export
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  activeTab === "import" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
                }`}
              >
                Import
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-hidden flex flex-col gap-4">
          {activeTab === "export" ? (
            <>
              <p className="text-xs text-slate-400">
                You can copy the raw UIDL document JSON or download it as a `.json` schema file ready to be rendered anywhere by <code className="text-cyan-400">UIDocumentRenderer</code>.
              </p>

              <div className="relative flex-1">
                <textarea
                  readOnly
                  value={jsonString}
                  className="w-full h-72 p-3 font-mono text-[11px] bg-black/50 border border-white/10 rounded-xl text-cyan-300 resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/10"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy JSON"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Paste your existing UIDL JSON document below or upload a JSON file from your machine:
              </p>

              {importError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}

              <textarea
                value={importText}
                placeholder="Paste UIDL JSON here..."
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-60 p-3 font-mono text-[11px] bg-black/50 border border-white/10 rounded-xl text-slate-200 resize-none focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
              />

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose file...</span>
                  <input type="file" accept="application/json" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={handleImportSubmit}
                  disabled={!importText.trim()}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                >
                  Load into Canvas
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
