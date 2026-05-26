import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, Zap, Globe, Target, Terminal, CheckCircle2, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface IDSAlert {
  id: string;
  time: string;
  source: string;
  threat: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
}

export const IDSAlerts: React.FC = () => {
  const { authenticatedFetch } = useAuth();
  const [alerts, setAlerts] = useState<IDSAlert[]>([]);

  const fetchAlerts = useCallback(async () => {
    const fetchAlerts = async () => {
      try {
        const res = await authenticatedFetch('/api/security/ids', { method: 'GET' });
        const data = await res.json(); // Assuming authenticatedFetch returns a Response object
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch IDS alerts");
      }
    }; // Memoize fetchAlerts

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      const levels = ['low', 'medium', 'high', 'critical'];
      const maxLevel = alerts.reduce((max, alert) => {
        return levels.indexOf(alert.severity) > levels.indexOf(max) ? alert.severity : max;
      }, 'low');
      window.dispatchEvent(new CustomEvent('spartanai-security-core-threat-level', { detail: { level: maxLevel } }));
    }
  }, [alerts]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 border-red-600 bg-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse font-black';
      case 'high': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'medium': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      default: return 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  const simulateAttack = async () => {
    try {
      await authenticatedFetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'LOCAL_SUBNET' })
      });
    } catch (err) {
      console.error("Simulation failed");
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg cursor-pointer hover:bg-red-500/20 transition-colors" onClick={simulateAttack}>
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">Intrusion_IDS_Active</h3>
            <p className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Real-time Traffic Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400">
          <Zap className="w-3 h-3" />
          <span>ENGINE: SURICATA_X2</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl border flex flex-col gap-3 relative group overflow-hidden ${getSeverityStyles(alert.severity)}`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertOctagon className="w-12 h-12" />
              </div>

              <div className="flex justify-between items-start relative">
                <div className="flex items-center gap-3">
                  <Globe className="w-3.5 h-3.5 opacity-50" />
                  <span className="text-[10px] font-mono tracking-tighter font-bold">{alert.source}</span>
                </div>
                <span className="text-[8px] font-mono opacity-50">
                  {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="flex flex-col gap-1 relative">
                <h4 className="text-[11px] font-black uppercase tracking-tight">{alert.threat}</h4>
                <div className="flex items-center gap-4 text-[9px] font-mono opacity-70">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    <span>SENSING...</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="uppercase">{alert.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-current/10 flex justify-between items-center relative">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Protocol Checksum: OK</span>
                </div>
                <button className="text-[9px] underline font-bold uppercase opacity-60 hover:opacity-100 transition-opacity">
                  Analysis
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 font-mono gap-3 opacity-50">
            <Terminal className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Silent Environment...</span>
          </div>
        )}
      </div>
    </div>
  );
};
