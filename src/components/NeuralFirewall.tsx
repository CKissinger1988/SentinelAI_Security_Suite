import React, { useEffect, useState, useCallback } from "react";
import { Shield, Activity, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export const NeuralFirewall: React.FC = () => {
  const [packets, setPackets] = useState<any[]>([]);
  const { authenticatedFetch } = useAuth();

  const fetchPackets = useCallback(async () => {
    const fetchPackets = async () => {
      try {
        const res = await authenticatedFetch("/api/security/firewall/packets");
        if (res.ok) {
          const data = await res.json();
          setPackets((prev) => {
            const newPackets = data.filter(
              (p: any) => !prev.find((old) => old.id === p.id),
            );
            const highSeverity = newPackets.find(
              (p: any) => p.severity === "high" || p.severity === "critical",
            );

            if (highSeverity) {
              window.dispatchEvent(
                new CustomEvent("spartanai-security-core-firewall-alert", {
                  detail: {
                    source: highSeverity.source,
                    protocol: highSeverity.protocol,
                  },
                }),
              );
            }

            return data;
          });
        }
      } catch (err) {
        // Maintain state on link failure for visual persistence
      }
    }; // Memoize fetchPackets

    fetchPackets();
    const interval = setInterval(fetchPackets, 2000);
    return () => clearInterval(interval);
  }, [authenticatedFetch]);

  return (
    <div className="immersive-card p-6 bg-slate-900/10 flex flex-col min-h-[300px] border border-cyan-900/20 relative overflow-hidden group font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.03)_0%,_transparent_60%)]" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500" />
          Neural Firewall
        </h3>
        <div className="flex items-center gap-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-bold text-cyan-400">
          <Activity className="w-2 h-2 animate-pulse" />
          LIVE_ENCLAVE
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden relative z-10">
        <div className="grid grid-cols-3 px-1 mb-2 text-[7px] text-slate-600 uppercase tracking-widest font-black">
          <span>Source</span>
          <span>Protocol</span>
          <span className="text-right">Action</span>
        </div>

        <div className="h-[180px] overflow-y-auto space-y-1 custom-scrollbar pr-1">
          <AnimatePresence initial={false}>
            {packets.map((pkt) => (
              <motion.div
                key={pkt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-3 p-1.5 bg-black/40 border border-white/5 rounded text-[8px] items-center hover:bg-cyan-900/10 transition-colors"
              >
                <span
                  className={`truncate ${pkt.severity === "critical" ? "text-red-400 font-bold" : pkt.severity === "high" ? "text-orange-400 font-bold" : "text-cyan-100/60"}`}
                >
                  {pkt.source}
                </span>
                <span className="text-cyan-500 font-bold">{pkt.protocol}</span>
                <div className="flex justify-end">
                  <span className="px-1 py-0.5 bg-red-900/20 border border-red-500/30 text-red-500 font-black rounded uppercase text-[6px]">
                    {pkt.action}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <span className="text-[7px] text-slate-700 uppercase tracking-tighter">
            Matrix Load
          </span>
          <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <motion.div
              animate={{ width: ["20%", "45%", "30%"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="h-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]"
            />
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] text-slate-700 uppercase tracking-tighter">
            Filtered
          </span>
          <span className="text-[10px] text-cyan-400 font-bold tracking-widest">
            {packets.length * 12 + 42}
          </span>
        </div>
      </div>
    </div>
  );
};
