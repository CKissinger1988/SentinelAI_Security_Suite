import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { AudioSettingsPanel } from './AudioSettingsPanel';
import { ApiSettingsPanel } from './ApiSettingsPanel';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <AnimatePresence> {/* AnimatePresence should wrap the conditional component */}
      {open && ( /* Conditionally render the motion.div */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0b0e14] border border-cyan-900/50 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-cyan-900/30 flex items-center justify-between">
              <h2 className="text-sm font-mono text-cyan-400 tracking-wider font-bold">SYSTEM_CONFIGURATION</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <AudioSettingsPanel />
              <ApiSettingsPanel />
            </div>
            <div className="p-4 bg-slate-950 border-t border-cyan-900/30 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};