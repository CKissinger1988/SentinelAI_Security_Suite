import React, { useState } from 'react';
import { Ghost, X, Send, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GhostChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'user' | 'system'}[]>([
    { id: '1', text: 'SECURE_CHANNEL_ESTABLISHED. ENCRYPTION: AES-256-GCM. JARVIS_NEURAL_LINK: STANDBY.', sender: 'system' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), text: input, sender: 'user' }]);
    setInput('');

    // Simulate system response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: 'Command received. Processing through clandestine network...', 
        sender: 'system' 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 h-96 bg-black/80 backdrop-blur-xl border border-cyan-900/50 rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="h-10 border-b border-cyan-900/50 bg-slate-900/50 flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-cyan-500" />
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Ghost Terminal</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-cyan-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded px-2.5 py-1.5 text-[10px] font-mono ${
                    msg.sender === 'user' 
                      ? 'bg-cyan-950/50 border border-cyan-900 text-cyan-100' 
                      : 'bg-slate-900/50 border border-slate-800 text-slate-400'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 border-t border-cyan-900/50 bg-black/60 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Transmit encrypted message..."
                className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-cyan-400 placeholder:text-slate-600 px-2"
              />
              <button type="submit" disabled={!input.trim()} className="text-cyan-600 hover:text-cyan-400 disabled:opacity-50 transition-colors p-1">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-shadow group relative"
      >
        <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <Ghost className="w-5 h-5 text-cyan-500 group-hover:text-cyan-300 transition-colors relative z-10" />
      </motion.button>
    </div>
  );
};
