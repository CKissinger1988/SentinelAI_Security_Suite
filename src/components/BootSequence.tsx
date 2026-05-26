import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Loader2, Cpu, Database, Network } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Fast fake initialization that feels like real checks
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        if (i === 0) setMessages(["OS CORE LOADED"]);
        if (i === 20) setMessages(prev => [...prev, "KERNEL VERIFIED"]);
        if (i === 40) setMessages(prev => [...prev, "NETWORK PROTOCOLS STABILIZED"]);
        if (i === 60) setMessages(prev => [...prev, "BINARY INTEGRITY SECURE"]);
        if (i === 80) setMessages(prev => [...prev, "NEURAL INTERFACE SYNCED"]);
        if (i === 100) setMessages(prev => [...prev, "AUTHENTICATION READY"]);
        await new Promise(r => setTimeout(r, 200));
      }
      setIsFinishing(true);
      setTimeout(onComplete, 800);
    };

    init();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#02040a] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_70%)]" />
      
      <div className="w-full max-w-md p-8 space-y-8 relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 relative group">
            <Shield className="w-12 h-12 text-cyan-500 group-hover:animate-pulse" />
            <div className="absolute -inset-1 bg-cyan-500/20 blur opacity-30 group-hover:opacity-50 transition-opacity rounded-2xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase italic">SPARTANAI_SECURITY_CORE_OS</h1>
            <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">Initialization & Configuration Protocol</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              <span>System_Core_Loading</span>
              <span className="text-cyan-500 font-bold">{progress}%</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="bg-black/40 border border-slate-800 rounded p-4 h-32 overflow-hidden relative">
             <div className="space-y-2">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 text-[9px] font-mono text-slate-400"
                    >
                      <span className="text-cyan-500">[OK]</span>
                      <span className="uppercase tracking-tight">{msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {progress < 100 && (
                   <div className="flex items-center gap-3 text-[9px] font-mono text-cyan-500/50 animate-pulse">
                      <span>{'>'}</span>
                      <span className="uppercase tracking-tight">Pulling latest security definitions...</span>
                   </div>
                )}
             </div>
             <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#02040a] to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: "CPU" },
            { icon: Database, label: "DB" },
            { icon: Network, label: "NET" },
            { icon: Shield, label: "SEC" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
               <div className={`p-2 rounded bg-slate-900 border ${progress > (i + 1) * 25 ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-800 text-slate-600'}`}>
                  <item.icon className="w-4 h-4" />
               </div>
               <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>

        {isFinishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 pt-4"
          >
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
            <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest animate-pulse">Handing control to JARVIS...</span>
          </motion.div>
        )}
      </div>

      {/* Decorative backdrop elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-10 left-10 w-64 h-64 border border-cyan-500/20 rounded-full animate-pulse" />
         <div className="absolute bottom-10 right-10 w-96 h-96 border border-cyan-500/10 rounded-full animate-reverse-spin" style={{ animation: 'spin 20s linear infinite reverse' }} />
      </div>
    </div>
  );
};
