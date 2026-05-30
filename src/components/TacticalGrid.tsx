import React from "react";
import {
  Monitor,
  ExternalLink,
  Terminal,
  Cpu,
  Radio,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { NeuralFirewall } from "./NeuralFirewall";
import { RemoteADB } from "./RemoteADB";
import { GhostWidget } from "./GhostWidget";
import { IDSAlerts } from "./IDSAlerts";

interface TacticalGridProps {
  onLaunchDesktop?: () => void;
  systemStatus: any;
  logs: any[];
  c2Status: any;

  stealthActive: boolean;
  setStealthActive: (val: boolean) => void;
  decoyActive: boolean;
  setDecoyActive: (val: boolean) => void;
  counterActive: boolean;
  setCounterActive: (val: boolean) => void;
  enclaveLocked: boolean;
  setEnclaveLocked: (val: boolean) => void;

  shieldVal: number;
  entropyVal: number;
  threatIndex: number;

  terminalInput: string;
  setTerminalInput: (val: string) => void;
  terminalLogs: string[];
  handleCommandSubmit: (e: React.FormEvent) => Promise<void>;
  consoleBottomRef: React.RefObject<HTMLDivElement | null>;
}

const StatusGauge = ({
  label,
  value,
  max = 100,
  colorClass = "text-cyan-500",
}: {
  label: string;
  value: number;
  max?: number;
  colorClass?: string;
}) => {
  const radius = 32;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-slate-900 rounded-xl relative overflow-hidden glow-pulse-edge w-full text-center glass-hologram">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          className={colorClass}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute top-[32px] flex flex-col items-center justify-center">
        <span className="text-[11px] font-black font-mono text-white tracking-tighter">
          {value}%
        </span>
      </div>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-3 font-bold">
        {label}
      </span>
    </div>
  );
};

export const TacticalGrid: React.FC<TacticalGridProps> = ({
  onLaunchDesktop,
  systemStatus,
  logs,
  c2Status,
  stealthActive,
  setStealthActive,
  decoyActive,
  setDecoyActive,
  counterActive,
  setCounterActive,
  enclaveLocked,
  setEnclaveLocked,
  shieldVal,
  entropyVal,
  threatIndex,
  terminalInput,
  setTerminalInput,
  terminalLogs,
  handleCommandSubmit,
  consoleBottomRef,
}) => {
  return (
    <div className="space-y-6">
      {/* 3 Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusGauge
          label="Shield Integrity"
          value={shieldVal}
          colorClass="text-emerald-500"
        />
        <StatusGauge
          label="Threat Index"
          value={threatIndex}
          max={100}
          colorClass="text-red-500"
        />
        <StatusGauge
          label="Network Entropy"
          value={entropyVal}
          colorClass="text-cyan-500"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cloud Desk Card */}
          <div
            onClick={onLaunchDesktop}
            className="group relative h-40 glass-hologram flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--theme-glow-color)_0%,_transparent_70%)]" />

            <div className="relative flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-500 theme-text" />
                    <h3 className="font-black text-md text-white tracking-tighter italic">
                      LAUNCH_CLOUD_DESK
                    </h3>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono tracking-[0.2em] uppercase">
                    KALI_LINUX_QT6_INSTANCE // SESSION: RDP-01
                  </p>
                </div>
                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-full text-cyan-500 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-xl">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex gap-10 items-end">
                <div className="space-y-1">
                  <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                    Protocol
                  </div>
                  <div className="text-[10px] font-bold text-slate-300">
                    RDP / AES-256GCM
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                    Security
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                    Verified End-to-End
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-bold text-cyan-400 tracking-widest uppercase">
                    Tunnel Secured
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Hub & Terminal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holographic Control Hub */}
            <div className="glass-hologram p-6 flex flex-col justify-between rounded-2xl min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-500 theme-text" />
                  Holographic Control Hub
                </h3>
                <span className="text-[8px] font-mono text-cyan-500/70 uppercase">
                  Autopilot Active
                </span>
              </div>

              <div className="space-y-4 my-2 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between p-2 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-200 font-mono">
                      Stealth Evasion
                    </span>
                    <span className="text-[7px] text-slate-500">
                      svchost.exe Masquerade
                    </span>
                  </div>
                  <button
                    onClick={() => setStealthActive(!stealthActive)}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${stealthActive ? "bg-cyan-600" : "bg-slate-800"}`}
                  >
                    <motion.div
                      animate={{ x: stealthActive ? 18 : 2 }}
                      className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-200 font-mono">
                      Decoy HoneyGrid
                    </span>
                    <span className="text-[7px] text-slate-500">
                      Virtual Honeypot Array
                    </span>
                  </div>
                  <button
                    onClick={() => setDecoyActive(!decoyActive)}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${decoyActive ? "bg-cyan-600" : "bg-slate-800"}`}
                  >
                    <motion.div
                      animate={{ x: decoyActive ? 18 : 2 }}
                      className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-200 font-mono">
                      Auto-Countermeasures
                    </span>
                    <span className="text-[7px] text-slate-500">
                      Intrusion Retaliation
                    </span>
                  </div>
                  <button
                    onClick={() => setCounterActive(!counterActive)}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${counterActive ? "bg-cyan-600" : "bg-slate-800"}`}
                  >
                    <motion.div
                      animate={{ x: counterActive ? 18 : 2 }}
                      className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-200 font-mono">
                      Enclave Hardening
                    </span>
                    <span className="text-[7px] text-slate-500">
                      AES-GCM Rest Vault
                    </span>
                  </div>
                  <button
                    onClick={() => setEnclaveLocked(!enclaveLocked)}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${enclaveLocked ? "bg-cyan-600" : "bg-slate-800"}`}
                  >
                    <motion.div
                      animate={{ x: enclaveLocked ? 18 : 2 }}
                      className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Output Terminal */}
            <div className="glass-hologram p-6 h-[300px] flex flex-col justify-between rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-500 theme-text" />
                  SpartanAI_Security_Core Shell
                </h3>
                <span className="text-[7px] font-mono text-cyan-500/70">
                  SH_INT_v1.0
                </span>
              </div>

              <div className="flex-1 space-y-2 font-mono text-[9px] text-slate-400 overflow-y-auto pr-1 my-2 bg-black/60 p-3 rounded-lg border border-slate-900 custom-scrollbar">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    <span
                      className={
                        log.startsWith("ERROR:")
                          ? "text-red-500 font-bold"
                          : log.startsWith("operator")
                            ? "text-cyan-400 font-bold"
                            : "text-slate-300"
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))}
                {/* Kernel Logs Sync */}
                {logs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-slate-500 space-y-1">
                    <div className="text-[7px] tracking-wider text-slate-600 font-bold">
                      KERNEL LOG FEED:
                    </div>
                    {logs.slice(0, 3).map((l, i) => (
                      <div key={i} className="truncate">
                        [
                        {new Date(l.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        ] {l.message}
                      </div>
                    ))}
                  </div>
                )}
                <div ref={consoleBottomRef} />
              </div>

              <form
                onSubmit={handleCommandSubmit}
                className="flex gap-2 items-center"
              >
                <span className="text-cyan-500 font-bold text-[10px] font-mono">
                  &gt;
                </span>
                <input
                  type="text"
                  placeholder="Enter system command..."
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="bg-transparent text-slate-200 font-mono text-[9px] outline-none flex-1 border-none placeholder:text-slate-700"
                />
                <button type="submit" className="hidden" />
              </form>
            </div>
          </div>

          {/* Mobile C2 Sovereign Link */}
          <div className="glass-hologram p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-purple-500 animate-pulse" />
                <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">
                  Mobile_C2_Sovereign_Link
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-400">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  ENCRYPTION: {c2Status?.encryptionLevel || "AES-XTS"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">
                  Connection
                </span>
                <p className="text-[10px] text-cyan-400 font-bold font-mono">
                  {c2Status?.connectedNetwork || "GSM/LTE"}
                </p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">
                  Signal Integrity
                </span>
                <p className="text-[10px] text-emerald-500 font-bold font-mono">
                  {c2Status?.signalStrength || 0}%
                </p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">
                  C2 Heartbeat
                </span>
                <p className="text-[10px] text-slate-300 font-bold font-mono">
                  ACTIVE
                </p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">
                  Last Payload
                </span>
                <p className="text-[10px] text-purple-400 font-bold font-mono">
                  {c2Status?.lastPayloadType || "IDLE"}
                </p>
              </div>
            </div>
          </div>

          {/* Neural Firewall & Remote ADB & Ghost Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NeuralFirewall />
            <div className="space-y-6">
              <div className="glass-hologram p-6 rounded-2xl">
                <RemoteADB />
              </div>
              <GhostWidget stealthActive={stealthActive} />
            </div>
          </div>
        </div>

        {/* IDS Alert Center */}
        <div className="lg:col-span-1">
          <div className="glass-hologram rounded-2xl h-full p-4">
            <IDSAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};
