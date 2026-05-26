import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { OrbitalHUD } from './OrbitalHUD';
import { TacticalGrid } from './TacticalGrid';

interface DashboardProps {
  onLaunchDesktop?: () => void;
  systemCheck?: {
    inProgress: boolean;
    progress: number;
    currentStep: string;
    results: { name: string; status: 'online' | 'offline' | 'error' | 'pending' }[];
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ onLaunchDesktop, systemCheck }) => {
  const { authenticatedFetch } = useAuth();
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [c2Status, setC2Status] = useState<any>(null);

  // Layout mode switcher state
  const [dashboardMode, setDashboardMode] = useState<'orbital' | 'tactical'>('orbital');

  // Holographic Hub States
  const [stealthActive, setStealthActive] = useState(false);
  const [decoyActive, setDecoyActive] = useState(false);
  const [counterActive, setCounterActive] = useState(false);
  const [enclaveLocked, setEnclaveLocked] = useState(true);

  // Fluctuating Gauge States
  const [shieldVal, setShieldVal] = useState(98);
  const [entropyVal, setEntropyVal] = useState(24);
  const [threatIndex, setThreatIndex] = useState(12);

  // Terminal States
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SPARTANAI_SECURITY_CORE_SHELL v2.5.0-STABLE READY.',
    'ENTER SYSTEM COMMAND: status, probe network, sync hsm, purge vault'
  ]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const fetchSystemData = useCallback(async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        authenticatedFetch('/api/system/status'),
        authenticatedFetch('/api/logs')
      ]);

      if (statusRes.ok) {
        const status = await statusRes.json();
        setSystemStatus(status);
        // Map threat levels to Threat Index
        if (status.threatLevel === 'critical') setThreatIndex(94);
        else if (status.threatLevel === 'high') setThreatIndex(78);
        else if (status.threatLevel === 'medium') setThreatIndex(46);
        else setThreatIndex(15);
      }
      if (logsRes.ok) setLogs(await logsRes.json());

      const c2Res = await authenticatedFetch('/api/c2/mobile/status');
      if (c2Res.ok) {
        setC2Status(await c2Res.json());
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 3000);
    return () => clearInterval(interval);
  }, [fetchSystemData]);

  // Fluctuations for visual realism
  useEffect(() => {
    const timer = setInterval(() => {
      setShieldVal(prev => Math.max(95, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
      setEntropyVal(prev => Math.max(15, Math.min(45, prev + Math.floor(Math.random() * 5 - 2))));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Sync mode state with 3D background visualizer
  const toggleDashboardMode = (mode: 'orbital' | 'tactical') => {
    setDashboardMode(mode);
    window.dispatchEvent(new CustomEvent('spartanai-security-core-dashboard-mode', { detail: { mode } }));
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('spartanai-security-core-dashboard-mode', { detail: { mode: dashboardMode } }));
  }, [dashboardMode]);

  const initiateUpdate = async () => {
    try {
      await authenticatedFetch('/api/system/update', { method: 'POST' });
    } catch (err) {
      console.error("Failed to initiate update");
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    setTerminalLogs(prev => [...prev, `operator@spartanai-security-core:~$ ${terminalInput}`]);
    setTerminalInput('');

    try {
      const res = await authenticatedFetch('/api/security/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (res.ok) {
        setTerminalLogs(prev => [...prev, ...data.output]);
      } else {
        setTerminalLogs(prev => [...prev, `ERROR: ${data.error || 'Execution failed'}`]);
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, 'ERROR: Host communication failure.']);
    }
  };

  const hasSystemError = systemCheck?.results.some(r => r.status === 'offline' || r.status === 'error');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">SYSTEM_STATUS_REPORT</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            SpartanAI_Security_Core v{systemStatus?.version || '2.5.0'} // ENVIRONMENT: PRODUCTION
          </p>
        </div>

        {/* HUD Sub-Nav View Switcher */}
        <div className="flex items-center bg-black/40 border border-slate-800 rounded-lg p-0.5 font-mono text-[9px] z-10 glass-hologram">
          <button
            onClick={() => toggleDashboardMode('orbital')}
            className={`px-3 py-1 rounded transition-all uppercase tracking-wider ${
              dashboardMode === 'orbital'
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Orbital HUD
          </button>
          <button
            onClick={() => toggleDashboardMode('tactical')}
            className={`px-3 py-1 rounded transition-all uppercase tracking-wider ${
              dashboardMode === 'tactical'
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Tactical Grid
          </button>
        </div>

        <button
          onClick={initiateUpdate}
          disabled={systemStatus?.isUpdating}
          className={`px-4 py-1.5 rounded border flex items-center gap-2 transition-all ${systemStatus?.isUpdating
            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-500 cursor-wait'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
        >
          {systemStatus?.isUpdating ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Maintenance_{systemStatus?.updateProgress}%</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em]">System_Maintenance</span>
            </>
          )}
        </button>
      </div>

      {systemStatus?.isUpdating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Patching system core & AI definitions...</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                animate={{ width: `${systemStatus.updateProgress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-600 shrink-0">EST_REMAINING: {(10 - (systemStatus.updateProgress / 10))}s</span>
          </div>
        </motion.div>
      )}

      {systemCheck?.inProgress && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: 'auto',
            borderColor: hasSystemError ? ['#ef4444', 'rgba(239, 68, 68, 0.3)', '#ef4444'] : 'rgba(6, 182, 212, 0.2)',
          }}
          transition={{
            borderColor: hasSystemError ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
            height: { duration: 0.3 }
          }}
          className="p-6 bg-cyan-950/10 border rounded-2xl space-y-4 glow-pulse-edge"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-cyan-500 animate-spin" />
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Initial System Diagnostics</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 font-bold">{systemCheck?.progress}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              animate={{ width: `${systemCheck?.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemCheck.results.map((res, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${res.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' :
                  res.status === 'offline' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
                    res.status === 'error' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' :
                      'bg-slate-700'
                  }`} />
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">{res.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-mono text-slate-500 italic text-center uppercase tracking-widest">{systemCheck?.currentStep}</p>
        </motion.div>
      )}

      {/* Sub-Dashboard layout selector */}
      {dashboardMode === 'orbital' ? (
        <OrbitalHUD
          onLaunchDesktop={onLaunchDesktop}
          systemStatus={systemStatus}
          logs={logs}
          c2Status={c2Status}
          stealthActive={stealthActive}
          setStealthActive={setStealthActive}
          decoyActive={decoyActive}
          setDecoyActive={setDecoyActive}
          counterActive={counterActive}
          setCounterActive={setCounterActive}
          enclaveLocked={enclaveLocked}
          setEnclaveLocked={setEnclaveLocked}
          shieldVal={shieldVal}
          entropyVal={entropyVal}
          threatIndex={threatIndex}
          terminalInput={terminalInput}
          setTerminalInput={setTerminalInput}
          terminalLogs={terminalLogs}
          handleCommandSubmit={handleCommandSubmit}
          consoleBottomRef={consoleBottomRef}
        />
      ) : (
        <TacticalGrid
          onLaunchDesktop={onLaunchDesktop}
          systemStatus={systemStatus}
          logs={logs}
          c2Status={c2Status}
          stealthActive={stealthActive}
          setStealthActive={setStealthActive}
          decoyActive={decoyActive}
          setDecoyActive={setDecoyActive}
          counterActive={counterActive}
          setCounterActive={setCounterActive}
          enclaveLocked={enclaveLocked}
          setEnclaveLocked={setEnclaveLocked}
          shieldVal={shieldVal}
          entropyVal={entropyVal}
          threatIndex={threatIndex}
          terminalInput={terminalInput}
          setTerminalInput={setTerminalInput}
          terminalLogs={terminalLogs}
          handleCommandSubmit={handleCommandSubmit}
          consoleBottomRef={consoleBottomRef}
        />
      )}
    </div>
  );
};