import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  CheckCircle2, 
  AlertOctagon, 
  Zap, 
  Shield, 
  RefreshCw, 
  BarChart2, 
  Clock, 
  Key, 
  Server, 
  Settings2, 
  Check, 
  Play, 
  Info,
  Layers,
  Activity,
  Loader2,
  Sliders
} from "lucide-react";
import { AIGenerationLog, AIConfigResponse } from "../types";
import { apiFetch } from "../lib/api";

export const AIPerformanceHub: React.FC = () => {
  const [logs, setLogs] = useState<AIGenerationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // AI Config state
  const [aiConfig, setAiConfig] = useState<AIConfigResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("mock");
  const [modelInput, setModelInput] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [baseUrlInput, setBaseUrlInput] = useState<string>("");
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Test state
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    provider?: string;
    model?: string;
    sampleOutput?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/admin/ai-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Failed to load admin AI operation logs:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiConfig = async () => {
    try {
      const res = await apiFetch("/api/v1/ai/config");
      if (res.ok) {
        const data: AIConfigResponse = await res.json();
        setAiConfig(data);
        setSelectedProvider(data.provider);
        setModelInput(data.model);
        setBaseUrlInput(data.baseUrl || "");
      }
    } catch (e) {
      console.error("Failed to load AI config:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchAiConfig();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    if (aiConfig?.presets && aiConfig.presets[newProvider]) {
      const preset = aiConfig.presets[newProvider];
      setModelInput(preset.defaultModel);
      setBaseUrlInput(preset.defaultBaseUrl || "");
    }
    setTestResult(null);
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      setSaveSuccess(false);
      const res = await apiFetch("/api/v1/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          model: modelInput.trim(),
          apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
          baseUrl: baseUrlInput.trim() || undefined
        })
      });

      if (res.ok) {
        const updated: AIConfigResponse = await res.json();
        setAiConfig(updated);
        setApiKeyInput("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (e) {
      console.error("Failed to save AI configuration:", e);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await apiFetch("/api/v1/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setTestResult(data);
      fetchLogs();
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e.message || "Failed to reach AI testing service"
      });
    } finally {
      setTesting(false);
    }
  };

  const totalCalls = logs.length;
  const successCalls = logs.filter(l => l.status === "success").length;
  const successRate = totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 100;
  const avgLatency = totalCalls > 0 ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalCalls) : 0;

  return (
    <div className="space-y-6" id="ai-performance-hub-root">
      {/* Editorial Hero Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Activity size={13} className="text-violet-300" />
              <span>Real-Time Engine Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Diagnostic Synthesis & Infrastructure
            </h1>
            <p className="text-violet-200 text-xs sm:text-sm leading-relaxed">
              Live monitoring and configuration for algorithmic generation, inference latency, and AI evaluation services.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { fetchLogs(); fetchAiConfig(); }}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 backdrop-blur-xs shadow-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Engine Uptime & Health</div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">{successRate}%</div>
          <div className="text-xs text-stone-500 font-medium">
            <span className="font-bold text-emerald-700">{successCalls}</span> valid of {totalCalls} runs
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="h-1 bg-indigo-500 absolute top-0 left-0 right-0" />
          <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Total Diagnostic Calls</div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">{totalCalls}</div>
          <div className="text-xs text-stone-500 font-medium">Synthesized assessments</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="h-1 bg-amber-500 absolute top-0 left-0 right-0" />
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Average Latency</div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">{avgLatency}ms</div>
          <div className="text-xs text-stone-500 font-medium">Response turnaround</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-violet-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="h-1 bg-violet-500 absolute top-0 left-0 right-0" />
          <div className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">Active Provider</div>
          <div className="text-2xl font-extrabold text-stone-900 capitalize truncate">
            {aiConfig?.provider || "Local"}
          </div>
          <div className="text-xs text-stone-500 font-mono truncate">
            {aiConfig?.model || "Standard"}
          </div>
        </div>
      </div>

      {/* Engine Configuration Panel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Sliders size={16} className="text-indigo-600" />
              <span>Provider Routing & API Configuration</span>
            </h3>
            <p className="text-xs text-stone-500">Select active generation model, override inference endpoints, and verify API keys</p>
          </div>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0">
              <Check size={13} className="stroke-[3]" /> Settings Applied
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Provider Engine</label>
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
            >
              <option value="mock">Local Deterministic Engine (Zero API Key Required)</option>
              <option value="gemini">Google Gemini AI (Direct SDK)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="custom">Custom OpenAI-Compatible API Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Model Name</label>
            <input
              type="text"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="e.g. gemini-2.5-flash or gpt-4o-mini"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">API Key (Optional for Local)</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={aiConfig?.hasApiKey ? "•••••••••••••••• (Configured on Server)" : "Enter API secret..."}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Base Endpoint URL (Optional)</label>
            <input
              type="text"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestConnection}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {testing ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            <span>Test Diagnostic Call</span>
          </button>

          <button
            type="button"
            disabled={savingConfig}
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {savingConfig ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} className="stroke-[3]" />}
            <span>Save Configuration</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl text-xs space-y-2 border ${
            testResult.success 
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
              : "bg-rose-50/80 border-rose-200 text-rose-950"
          }`}>
            <div className="font-bold flex items-center gap-2">
              {testResult.success ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertOctagon size={16} className="text-rose-600" />}
              <span>{testResult.success ? "Inference Connection Succeeded" : "Connection Verification Failed"}</span>
              {testResult.latencyMs && <span className="font-mono text-[11px] font-semibold text-stone-600">({testResult.latencyMs}ms)</span>}
            </div>
            {testResult.sampleOutput && (
              <p className="text-[11px] font-mono bg-white p-3 rounded-lg border border-stone-200 leading-relaxed text-stone-800">
                {testResult.sampleOutput}
              </p>
            )}
            {testResult.error && (
              <p className="text-xs font-medium text-rose-700">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Real-time Diagnostic Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Recent Generation Telemetry</h3>
          <span className="text-xs text-stone-500 font-mono">Showing latest {Math.min(15, logs.length)} events</span>
        </div>
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Output / Diagnostic</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                    No diagnostic operations recorded yet.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {log.operation}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === "success" ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Success
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-700">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-800 font-semibold">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {log.outputTokens ? `${log.outputTokens} tokens` : "Synthesized"}
                    </td>
                    <td className="py-3 px-4 text-stone-400 text-[11px] text-right font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
