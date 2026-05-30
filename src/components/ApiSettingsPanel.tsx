import React, { useState, useEffect } from "react";
import { Key } from "lucide-react";

export const ApiSettingsPanel: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setGeminiKey(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiKey(e.target.value);
    localStorage.setItem("gemini_api_key", e.target.value);
  };

  return (
    <div className="bg-slate-900/50 border border-cyan-900/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-3">
        <Key className="w-4 h-4 text-cyan-500" />
        <h3 className="text-sm font-mono text-slate-300 tracking-wider">
          API_CONFIGURATION
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={geminiKey}
            onChange={handleChange}
            placeholder="AIzaSy..."
            className="bg-black/40 border border-cyan-900/50 rounded px-3 py-2 text-xs font-mono text-cyan-400 placeholder:text-slate-700 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
