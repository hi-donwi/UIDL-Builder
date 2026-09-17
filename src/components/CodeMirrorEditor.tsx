import React, { useState, useEffect } from "react";
import { useBuilderStore } from "../core/builderStore";
import { validateDocument } from "../core/schemaValidator";
import { Code2, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";

export function CodeMirrorEditor() {
  const { document, setDocument } = useBuilderStore();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(document, null, 2));
    setError(null);
  }, [document]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);

    try {
      const parsed = JSON.parse(text);
      const val = validateDocument(parsed);
      if (!val.isValid) {
        setError(val.errors.map((err) => `${err.path}: ${err.message}`).join(", "));
      } else {
        setError(null);
        setDocument(parsed);
      }
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      // Ignore format if parse fails
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#161b22] text-xs">
      <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/20">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">
            UIDL JSON Schema
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            title="Auto-format JSON"
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if Error */}
      {error && (
        <div className="p-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 flex items-start gap-2 shrink-0 font-mono text-[11px]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="overflow-x-auto">
            <span className="font-bold">Schema Error:</span> {error}
          </div>
        </div>
      )}

      {/* Code Textarea */}
      <div className="flex-1 overflow-hidden p-2">
        <textarea
          value={jsonText}
          onChange={handleTextChange}
          spellCheck={false}
          className="w-full h-full p-3 font-mono text-[12px] bg-black/50 border border-white/10 rounded-xl text-cyan-300 leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors resize-none selection:bg-cyan-500 selection:text-black"
        />
      </div>
    </div>
  );
}
