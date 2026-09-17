import React, { useState } from "react";
import { useBuilderStore } from "../core/builderStore";
import {
  X,
  Database,
  Layers,
  Plus,
  Trash2,
  Save,
  Check,
  Code,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import clsx from "clsx";

interface StateDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StateDataModal({ isOpen, onClose }: StateDataModalProps) {
  const { document, updateDocumentState, updateDataSources, updateDocumentMeta } = useBuilderStore();

  const [activeTab, setActiveTab] = useState<"state" | "dataSources" | "meta">("state");

  // Local editing states
  const [docName, setDocName] = useState(document.name || "");
  const [docId, setDocId] = useState(document.id || "");

  // State key-value editor
  const currentState = (document.state || {}) as Record<string, unknown>;
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newType, setNewType] = useState<"string" | "number" | "boolean" | "json">("string");

  // DataSources editor
  const currentDataSources = (document.dataSources || {}) as Record<string, unknown>;
  const [selectedDataSourceKey, setSelectedDataSourceKey] = useState<string>(
    Object.keys(currentDataSources)[0] || ""
  );
  const [dataSourceJsonText, setDataSourceJsonText] = useState("");
  const [newDataSourceName, setNewDataSourceName] = useState("");
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddState = () => {
    if (!newKey.trim()) return;
    let parsedVal: unknown = newVal;
    if (newType === "number") {
      parsedVal = parseFloat(newVal) || 0;
    } else if (newType === "boolean") {
      parsedVal = newVal.toLowerCase() === "true" || newVal === "1";
    } else if (newType === "json") {
      try {
        parsedVal = JSON.parse(newVal);
      } catch {
        parsedVal = newVal;
      }
    }

    const updated = {
      ...currentState,
      [newKey.trim()]: parsedVal,
    };

    updateDocumentState(updated);
    setNewKey("");
    setNewVal("");
  };

  const handleDeleteState = (key: string) => {
    const updated = { ...currentState };
    delete updated[key];
    updateDocumentState(updated);
  };

  const handleSaveDataSource = () => {
    if (!selectedDataSourceKey) return;
    try {
      const parsed = JSON.parse(dataSourceJsonText);
      const updated = {
        ...currentDataSources,
        [selectedDataSourceKey]: parsed,
      };
      updateDataSources(updated);
      setDataSourceError(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Invalid JSON syntax";
      setDataSourceError(errorMsg);
    }
  };

  const handleAddDataSource = () => {
    if (!newDataSourceName.trim()) return;
    const name = newDataSourceName.trim();
    const defaultData = [
      { id: 1, name: "Sample Item 1", value: 100, status: "Active" },
      { id: 2, name: "Sample Item 2", value: 250, status: "Pending" },
    ];
    const updated = {
      ...currentDataSources,
      [name]: defaultData,
    };
    updateDataSources(updated);
    setSelectedDataSourceKey(name);
    setDataSourceJsonText(JSON.stringify(defaultData, null, 2));
    setNewDataSourceName("");
  };

  const handleDeleteDataSource = (key: string) => {
    const updated = { ...currentDataSources };
    delete updated[key];
    updateDataSources(updated);
    const remainingKeys = Object.keys(updated);
    if (remainingKeys.length > 0) {
      setSelectedDataSourceKey(remainingKeys[0]);
      setDataSourceJsonText(JSON.stringify(updated[remainingKeys[0]], null, 2));
    } else {
      setSelectedDataSourceKey("");
      setDataSourceJsonText("");
    }
  };

  const handleSaveMeta = () => {
    updateDocumentMeta({ name: docName, id: docId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/20">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-sm text-white">Document State & Data Sources</span>
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
            onClick={() => setActiveTab("state")}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "state"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Reactive State ({Object.keys(currentState).length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("dataSources");
              if (selectedDataSourceKey && currentDataSources[selectedDataSourceKey]) {
                setDataSourceJsonText(JSON.stringify(currentDataSources[selectedDataSourceKey], null, 2));
              }
            }}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "dataSources"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Data Sources ({Object.keys(currentDataSources).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("meta")}
            className={clsx(
              "py-3 px-4 border-b-2 transition-all flex items-center gap-1.5",
              activeTab === "meta"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Document Meta</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {/* TAB 1: Reactive State */}
          {activeTab === "state" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Add State Variable
                </span>

                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Variable name (e.g. counter)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="col-span-4 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />

                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "string" | "number" | "boolean" | "json")}
                    className="col-span-3 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON / Object</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Initial value"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="col-span-3 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                  />

                  <button
                    onClick={handleAddState}
                    className="col-span-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* State Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Current State Entries
                </span>

                {Object.keys(currentState).length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-slate-500">
                    No state variables declared. Use the form above to add reactive state keys.
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-white/5 border-b border-white/10 text-[10px] text-slate-400 uppercase">
                        <tr>
                          <th className="py-2 px-3">State Path</th>
                          <th className="py-2 px-3">Value</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px]">
                        {Object.entries(currentState).map(([k, v]) => (
                          <tr key={k} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-semibold text-cyan-300">
                              state.{k}
                            </td>
                            <td className="py-2 px-3 text-slate-300 truncate max-w-xs">
                              {typeof v === "object" ? JSON.stringify(v) : String(v)}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[10px]">
                              {typeof v}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => handleDeleteState(k)}
                                className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Data Sources */}
          {activeTab === "dataSources" && (
            <div className="space-y-4">
              {/* Add New DataSource */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New data source key (e.g. orderList, salesKPI)"
                  value={newDataSourceName}
                  onChange={(e) => setNewDataSourceName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                />
                <button
                  onClick={handleAddDataSource}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Source</span>
                </button>
              </div>

              {/* Data Source Selector & JSON Editor */}
              {Object.keys(currentDataSources).length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Selected Source:</span>
                      <select
                        value={selectedDataSourceKey}
                        onChange={(e) => {
                          const key = e.target.value;
                          setSelectedDataSourceKey(key);
                          setDataSourceJsonText(
                            JSON.stringify(currentDataSources[key], null, 2)
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-cyan-300 font-mono"
                      >
                        {Object.keys(currentDataSources).map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteDataSource(selectedDataSourceKey)}
                        className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Source</span>
                      </button>

                      <button
                        onClick={handleSaveDataSource}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-1 transition-all"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {dataSourceError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                      {dataSourceError}
                    </div>
                  )}

                  <textarea
                    rows={12}
                    value={dataSourceJsonText}
                    onChange={(e) => setDataSourceJsonText(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-cyan-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Data source tables and arrays can be referenced by DataTables and Charts via{" "}
                    <code className="text-cyan-300">dataSource: "{selectedDataSourceKey}"</code>.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-slate-500">
                  No data sources currently registered. Create a new data source above.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Document Meta */}
          {activeTab === "meta" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-slate-400 text-[11px] font-semibold">Document Title / Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] font-semibold">Document ID</label>
                <input
                  type="text"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveMeta}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Document Metadata</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
