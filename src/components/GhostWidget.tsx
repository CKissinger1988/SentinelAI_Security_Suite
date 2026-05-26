import React, { useEffect, useState, useRef } from 'react';
import { Ghost, ShieldAlert, Cpu, Activity, RefreshCw } from 'lucide-react';

interface GhostWidgetProps {
  stealthActive: boolean;
}

export const GhostWidget: React.FC<GhostWidgetProps> = ({ stealthActive }) => {
  const [secondaryKey, setSecondaryKey] = useState('SPARTANAI-SECURITY-CORE-7742-X');
  const [hops, setHops] = useState<string[]>(['127.0.0.1', '127.0.0.1', '127.0.0.1']);
  const [bandwidthNoise, setBandwidthNoise] = useState<number[]>(Array(10).fill(5));
  const noiseInterval = useRef<NodeJS.Timeout | null>(null);

  // Poll local storage for HSM key update
  useEffect(() => {
    const updateKey = () => {
      const key = localStorage.getItem('spartanai_security_core_secondary_key') || (stealthActive ? 'CLANDESTINE-SIG-77E2A' : 'SPARTANAI-SECURITY-CORE-7742-X');
      setSecondaryKey(key);
    };

    updateKey();
    const interval = setInterval(updateKey, 1000);

    // Dynamic hop IPs
    const generateHops = () => {
      if (stealthActive) {
        setHops([
          `104.244.42.${Math.floor(Math.random() * 254) + 1}`,
          `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
          `203.0.113.${Math.floor(Math.random() * 254) + 1}`
        ]);
      } else {
        setHops(['DIRECT_ROUTE', 'UNSECURED', 'BYPASS_ACTIVE']);
      }
    };
    generateHops();
    const hopInterval = setInterval(generateHops, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(hopInterval);
    };
  }, [stealthActive]);

  // Real-time Traffic Noise simulation
  useEffect(() => {
    if (stealthActive) {
      noiseInterval.current = setInterval(() => {
        setBandwidthNoise(prev => 
          prev.map(() => Math.floor(Math.random() * 30) + 10)
        );
      }, 300);
    } else {
      if (noiseInterval.current) clearInterval(noiseInterval.current);
      setBandwidthNoise(Array(10).fill(2));
    }

    return () => {
      if (noiseInterval.current) clearInterval(noiseInterval.current);
    };
  }, [stealthActive]);

  return (
    <div className="glass-hologram p-5 rounded-2xl flex flex-col justify-between min-h-[220px] relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 p-3 opacity-15">
        <Ghost className={`w-16 h-16 ${stealthActive ? 'text-cyan-500 animate-pulse' : 'text-slate-500'}`} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Ghost className={`w-4 h-4 ${stealthActive ? 'text-cyan-400 animate-bounce' : 'text-slate-500'}`} />
          Ghost Operations Center
        </h3>
        <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full border ${
          stealthActive 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
        }`}>
          {stealthActive ? 'Clandestine Link Active' : 'Direct Link Exposure'}
        </span>
      </div>

      {/* Hops Tracker */}
      <div className="space-y-2 z-10 my-1">
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Secure routing hops</div>
        <div className="flex items-center gap-2 font-mono text-[9px]">
          {hops.map((hop, i) => (
            <React.Fragment key={i}>
              <div className={`p-1.5 rounded border transition-all duration-300 ${
                stealthActive 
                  ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400' 
                  : 'bg-red-950/10 border-red-900/20 text-red-400'
              }`}>
                {hop}
              </div>
              {i < hops.length - 1 && (
                <span className={`text-[10px] ${stealthActive ? 'text-cyan-500 animate-pulse' : 'text-red-500'}`}>&rarr;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Signature & Noise metrics */}
      <div className="grid grid-cols-2 gap-4 mt-2 z-10">
        <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1">
          <span className="text-[7px] text-slate-500 uppercase font-mono tracking-widest flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" /> Key signature
          </span>
          <p className="text-[9px] text-purple-400 font-bold font-mono truncate">{secondaryKey}</p>
        </div>

        <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex flex-col justify-between">
          <span className="text-[7px] text-slate-500 uppercase font-mono tracking-widest flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Routing cover noise
          </span>
          {/* Animating Waveform Bars */}
          <div className="flex items-end gap-0.5 h-6 mt-1">
            {bandwidthNoise.map((val, i) => (
              <div
                key={i}
                style={{ height: `${val}%` }}
                className={`w-1 rounded-t transition-all duration-300 ${
                  stealthActive ? 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-red-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
