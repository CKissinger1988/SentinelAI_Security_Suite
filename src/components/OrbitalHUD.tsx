import React from 'react';
import { Monitor, ExternalLink, Terminal, Cpu, Radio, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { NeuralFirewall } from './NeuralFirewall';
import { RemoteADB } from './RemoteADB';
import { GhostWidget } from './GhostWidget';
import { IDSAlerts } from './IDSAlerts';

interface OrbitalHUDProps {
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

// Concentric Dial Overlay
const ConcentricDials = ({ shield, threat, entropy }: { shield: number, threat: number, entropy: number }) => {
  // Configs
  const center = 100;
  
  const getDashoffset = (val: number, r: number) => {
    const circ = 2 * Math.PI * r;
    return circ - (val / 100) * circ;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 relative select-none">
      <svg height="210" width="210" className="transform -rotate-90 drop-shadow-[0_0_10px_var(--theme-glow-color)]">
        {/* Threat Index Ring (Outer) */}
        <circle stroke="rgba(239, 68, 68, 0.05)" fill="transparent" strokeWidth="4" r="80" cx={center} cy={center} />
        <motion.circle
          className="text-red-500"
          stroke="currentColor"
          fill="transparent"
          strokeWidth="6"
          strokeDasharray={2 * Math.PI * 80}
          animate={{ strokeDashoffset: getDashoffset(threat, 80) }}
          transition={{ duration: 0.8 }}
          r="80"
          cx={center}
          cy={center}
          strokeLinecap="round"
        />

        {/* Shield Integrity Ring (Middle) */}
        <circle stroke="rgba(16, 185, 129, 0.05)" fill="transparent" strokeWidth="4" r="60" cx={center} cy={center} />
        <motion.circle
          className="text-emerald-500"
          stroke="currentColor"
          fill="transparent"
          strokeWidth="6"
          strokeDasharray={2 * Math.PI * 60}
          animate={{ strokeDashoffset: getDashoffset(shield, 60) }}
          transition={{ duration: 0.8 }}
          r="60"
          cx={center}
          cy={center}
          strokeLinecap="round"
        />

        {/* Network Entropy Ring (Inner) */}
        <circle stroke="rgba(6, 182, 212, 0.05)" fill="transparent" strokeWidth="4" r="40" cx={center} cy={center} />
        <motion.circle
          className="text-cyan-500"
          stroke="currentColor"
          fill="transparent"
          strokeWidth="6"
          strokeDasharray={2 * Math.PI * 40}
          animate={{ strokeDashoffset: getDashoffset(entropy, 40) }}
          transition={{ duration: 0.8 }}
          r="40"
          cx={center}
          cy={center}
          strokeLinecap="round"
        />
      </svg>

      {/* Floating Readouts */}
      <div className="absolute top-[48px] flex flex-col items-center justify-center font-mono">
        <span className="text-[14px] font-black text-white tracking-tighter animate-pulse">{threat}%</span>
        <span className="text-[6px] text-red-400 uppercase tracking-widest font-bold">Threat Index</span>
      </div>
      <div className="absolute top-[82px] left-[54px] flex flex-col items-center justify-center font-mono">
        <span className="text-[10px] font-black text-white tracking-tighter">{shield}%</span>
        <span className="text-[5px] text-emerald-400 uppercase tracking-widest font-bold">Shield Integrity</span>
      </div>
      <div className="absolute top-[82px] right-[54px] flex flex-col items-center justify-center font-mono">
        <span className="text-[10px] font-black text-white tracking-tighter">{entropy}%</span>
        <span className="text-[5px] text-cyan-400 uppercase tracking-widest font-bold">Network Entropy</span>
      </div>
      
      <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mt-4 font-bold">Orbital Telemetry HUD Active</span>
    </div>
  );
};

export const OrbitalHUD: React.FC<OrbitalHUDProps> = ({
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
  consoleBottomRef
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
      {/* Column 1: Controls (Left) */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        {/* Holographic Control Hub */}
        <div className="glass-hologram p-5 flex flex-col justify-between rounded-2xl flex-1 min-h-[250px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500 theme-text" />
              Holographic Control Hub
            </h3>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between p-1.5 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-200 font-mono">Stealth Evasion</span>
                <span className="text-[6px] text-slate-500">svchost.exe Masquerade</span>
              </div>
              <button
                onClick={() => setStealthActive(!stealthActive)}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 ${stealthActive ? 'bg-cyan-600' : 'bg-slate-800'}`}
              >
                <motion.div
                  animate={{ x: stealthActive ? 18 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-200 font-mono">Decoy HoneyGrid</span>
                <span className="text-[6px] text-slate-500">Virtual Honeypot Array</span>
              </div>
              <button
                onClick={() => setDecoyActive(!decoyActive)}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 ${decoyActive ? 'bg-cyan-600' : 'bg-slate-800'}`}
              >
                <motion.div
                  animate={{ x: decoyActive ? 18 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-200 font-mono">Auto-Countermeasures</span>
                <span className="text-[6px] text-slate-500">Intrusion Retaliation</span>
              </div>
              <button
                onClick={() => setCounterActive(!counterActive)}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 ${counterActive ? 'bg-cyan-600' : 'bg-slate-800'}`}
              >
                <motion.div
                  animate={{ x: counterActive ? 18 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-black/30 border border-slate-900 rounded-lg hover:border-cyan-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-200 font-mono">Enclave Hardening</span>
                <span className="text-[6px] text-slate-500">AES-GCM Rest Vault</span>
              </div>
              <button
                onClick={() => setEnclaveLocked(!enclaveLocked)}
                className={`relative w-8 h-4 rounded-full transition-all duration-300 ${enclaveLocked ? 'bg-cyan-600' : 'bg-slate-800'}`}
              >
                <motion.div
                  animate={{ x: enclaveLocked ? 18 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile C2 Link */}
        <div className="glass-hologram p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black text-white uppercase font-mono tracking-tighter">Mobile_C2_Sovereign_Link</span>
            <span className="text-[7px] text-purple-400">{c2Status?.encryptionLevel || 'AES-XTS'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-black/30 p-2 border border-slate-900 rounded-lg">
              <div className="text-[6px] text-slate-500 uppercase font-mono">CONN</div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">{c2Status?.connectedNetwork || 'GSM/LTE'}</span>
            </div>
            <div className="bg-black/30 p-2 border border-slate-900 rounded-lg">
              <div className="text-[6px] text-slate-500 uppercase font-mono">SIG</div>
              <span className="text-[9px] font-mono text-emerald-500 font-bold">{c2Status?.signalStrength || 0}%</span>
            </div>
          </div>
        </div>

        {/* Cloud Desk */}
        <div
          onClick={onLaunchDesktop}
          className="group relative h-28 glass-hologram flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl p-4 shrink-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--theme-glow-color)_0%,_transparent_70%)]" />
          <div className="relative flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-white tracking-tighter italic">LAUNCH_CLOUD_DESK</span>
                <p className="text-[6px] text-slate-500 font-mono tracking-widest uppercase">SESSION: RDP-01</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Tunnel Secured</span>
          </div>
        </div>
      </div>

      {/* Column 2 & 3: Center Overlay Telemetry & Terminal */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        {/* Centerpiece 3D concentric dials overlay */}
        <div className="glass-hologram rounded-2xl flex-1 flex items-center justify-center min-h-[280px]">
          <ConcentricDials shield={shieldVal} threat={threatIndex} entropy={entropyVal} />
        </div>

        {/* Floating Shell Console */}
        <div className="glass-hologram p-5 h-[230px] flex flex-col justify-between rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-500 theme-text" />
              SpartanAI_Security_Core Shell
            </h3>
            <span className="text-[7px] font-mono text-cyan-500/70">SH_INT_v1.0</span>
          </div>

          <div className="flex-1 space-y-2 font-mono text-[9px] text-slate-400 overflow-y-auto pr-1 my-2 bg-black/60 p-3 rounded-lg border border-slate-900 custom-scrollbar">
            {terminalLogs.map((log, i) => (
              <div key={i} className="leading-tight">
                <span className={log.startsWith('ERROR:') ? 'text-red-500 font-bold' : log.startsWith('operator') ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>

          <form onSubmit={handleCommandSubmit} className="flex gap-2 items-center">
            <span className="text-cyan-500 font-bold text-[10px] font-mono">&gt;</span>
            <input
              type="text"
              placeholder="Enter system command..."
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-[9px] outline-none flex-1 border-none placeholder:text-slate-700"
            />
            <button type="submit" className="hidden" />
          </form>
        </div>
      </div>

      {/* Column 4: Firewall, ADB & Alerts (Right) */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        {/* IDS Alert Center */}
        <div className="glass-hologram rounded-2xl flex-1 p-4 max-h-[300px] overflow-hidden flex flex-col">
          <IDSAlerts />
        </div>
        
        {/* Ghost operations */}
        <GhostWidget stealthActive={stealthActive} />

        {/* Real Firewall and ADB */}
        <NeuralFirewall />
        <div className="glass-hologram p-5 rounded-2xl">
          <RemoteADB />
        </div>
      </div>
    </div>
  );
};
