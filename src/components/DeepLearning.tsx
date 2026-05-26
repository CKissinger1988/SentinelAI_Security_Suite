import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Cpu, Layers, Radio, Grid } from 'lucide-react'; // Ensure all icons are imported
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const DeepLearning: React.FC = () => {
  const { authenticatedFetch } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [heatmap, setHeatmap] = useState<number[][]>(
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => Math.random()))
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await authenticatedFetch('/api/training/metrics');
      const d = await res.json();
      setData(d);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch metrics");
    }
  }, [authenticatedFetch]); // Memoize fetchMetrics

  useEffect(() => { // This useEffect depends on authenticatedFetch, which is stable.
    fetchMetrics();
    let interval: any;
    if (isTraining) {
      interval = setInterval(() => {
        fetchMetrics();
        setHeatmap(prev => prev.map(row => row.map(val => {
          return Math.max(0.1, Math.min(1, val + (Math.random() - 0.5) * 0.3));
        })));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isTraining]);

  if (isLoading) return <div className="h-full flex items-center justify-center font-mono text-cyan-500 animate-pulse">SYNCHRONIZING_NEURAL_LINK...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">DEEP_LEARNING_MATRIX</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">Real-time GPU-accelerated training observability loop.</p>
        </div>
        <button
          onClick={() => setIsTraining(!isTraining)}
          className={`px-8 py-2 rounded font-bold text-[10px] tracking-[0.2em] uppercase transition-all ${isTraining
            ? 'bg-red-500/10 text-red-500 border border-red-500/40 animate-pulse'
            : 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30'
            }`}
        >
          {isTraining ? 'TERMINATE_MATRIX' : 'INITIATE_LEARNING'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="immersive-card p-6 space-y-4 bg-slate-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Model Accuracy</span>
            </div>
            <span className="text-xl font-bold text-slate-200 font-mono">{data[data.length - 1].accuracy.toFixed(2)}%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="epoch" stroke="#334155" fontSize={9} />
                <YAxis stroke="#334155" fontSize={9} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#02040a', border: '1px solid #1e293b', fontSize: '9px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="immersive-card p-6 space-y-4 bg-slate-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Training Loss</span>
            </div>
            <span className="text-xl font-bold text-slate-200 font-mono">{data[data.length - 1].loss.toFixed(4)}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="epoch" stroke="#334155" fontSize={9} />
                <YAxis stroke="#334155" fontSize={9} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#02040a', border: '1px solid #1e293b', fontSize: '9px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="loss" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="immersive-card p-6 space-y-4 bg-slate-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-purple-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Neural Heatmap</span>
            </div>
            <span className="text-[9px] font-mono text-purple-400">LAYER_V4_WEIGHTS</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center p-2 bg-black/40 rounded-xl border border-white/5">
            <div className="grid grid-cols-10 gap-1 w-full h-full">
              {heatmap.flat().map((val, i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: isTraining ? `rgba(6, 182, 212, ${val * 0.8})` : `rgba(51, 65, 85, 0.2)`,
                    boxShadow: isTraining && val > 0.8 ? `0 0 10px rgba(6, 182, 212, ${val * 0.5})` : 'none'
                  }}
                  className="rounded-[1px] transition-colors duration-500"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 immersive-card bg-slate-900/40 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-500 glow-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Compute_Tier</div>
            <div className="text-lg font-bold text-slate-200 tracking-tight">84.2 GFLOPS</div>
          </div>
        </div>

        <div className="p-6 immersive-card bg-slate-900/40 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Neural_Architecture</div>
            <div className="text-lg font-bold text-slate-200 tracking-tight italic">128_DENSE</div>
          </div>
        </div>

        <div className="p-6 immersive-card bg-slate-900/40 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-tight">Convergence_State</div>
            <div className="text-lg font-bold text-emerald-500 tracking-tight font-mono">NOMINAL</div>
          </div>
          {isTraining && (
            <div className="text-right border-l border-emerald-500/20 pl-4">
              <div className="text-[8px] font-mono text-slate-600 uppercase">STABILITY_ETA</div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold">~120s</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
