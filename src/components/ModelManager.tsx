import React, { useEffect, useState } from 'react';
import { ModelConfig } from '../types';
import { Brain, ToggleLeft, ToggleRight, CheckCircle2, Shield, Search, CloudDownload, Sparkles, Filter, Globe, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const ModelManager: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [registryModels, setRegistryModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeView, setActiveView] = useState<'installed' | 'discovery'>('installed');
  const { authenticatedFetch } = useAuth();

  useEffect(() => {
    fetchModels();
  }, []);
  
  const fetchModels = async () => {
    try {
      const res = await authenticatedFetch('/api/models', { method: 'GET' });
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  const findModels = async (query: string, tag: string = '') => {
    try {
      const url = `/api/models/discovery?q=${query}&tag=${tag}`; // This endpoint is now authenticated
      const res = await authenticatedFetch(url);
      const data = await res.json();
      setRegistryModels(data);
    } catch (err) {
      console.error("Discovery failed");
    }
  };

  useEffect(() => {
    if (activeView === 'discovery') {
      findModels(searchQuery, selectedTag);
    }
  }, [searchQuery, activeView, selectedTag]);

  const toggleModel = async (id: string) => {
    try {
      await authenticatedFetch('/api/models/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchModels();
    } catch (err) {
      console.error("Failed to toggle model");
    }
  };

  const pullModel = async (model: any) => {
    try {
      setLoading(true);
      await authenticatedFetch('/api/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelId: model.id, 
          name: model.name,
          tags: model.tags 
        })
      });
      // Switch to installed view to see the new model
      setActiveView('installed');
      setSearchQuery('');
      fetchModels();
    } catch (err) {
      console.error("Failed to pull model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">NEURAL_REPOSITORY</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
             <button 
               onClick={() => setActiveView('installed')}
               className={`text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded border transition-all ${
                 activeView === 'installed' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
               }`}
             >
               LOCAL_INSTANCES
             </button>
             <button 
               onClick={() => setActiveView('discovery')}
               className={`text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded border transition-all ${
                 activeView === 'discovery' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
               }`}
             >
               GLOBAL_DISCOVERY
             </button>
             
             {activeView === 'discovery' && (
               <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                  {['Pentest', 'Coding'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag.toLowerCase() ? '' : tag.toLowerCase())}
                      className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded transition-all ${
                        selectedTag === tag.toLowerCase() 
                        ? 'bg-cyan-500 text-black font-black' 
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
             )}
          </div>
        </div>

        <div className="relative group max-w-xs w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-cyan-500 transition-colors" />
           <input 
             type="text"
             placeholder={activeView === 'installed' ? "FILTER_LOCAL..." : "DISCOVER_GLOBAL_MODELS..."}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-slate-900/40 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono text-cyan-400 placeholder:text-slate-700 outline-none focus:border-cyan-900 transition-all"
           />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'installed' ? (
          <motion.div 
            key="installed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {models
              .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((model) => (
              <motion.div
                key={model.id}
                layout
                className={`p-6 rounded-2xl border transition-all relative overflow-hidden group ${
                  model.active 
                  ? 'bg-cyan-500/5 border-cyan-500/30' 
                  : 'bg-slate-900/20 border-slate-800/50 opacity-60 hover:opacity-100'
                }`}
              >
                {model.active && (
                  <div className="absolute top-0 right-0 p-3">
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                       <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 absolute" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${model.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-600'}`}>
                    <Brain className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => toggleModel(model.id)}
                    className={`transition-all active:scale-95 ${model.active ? 'text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-slate-800 hover:text-slate-600'}`}
                  >
                    {model.active ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="font-black text-white text-sm tracking-tight">{model.name}</h3>
                       <span className="text-[8px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">v{model.version}</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{model.id}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                     {model.tags.map(tag => (
                       <span key={tag} className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-2 py-1 rounded bg-slate-900/50 border border-slate-800/50">
                         {tag}
                       </span>
                     ))}
                  </div>

                  <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          model.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 
                          model.status === 'degraded' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 
                          'bg-red-500/50'
                        }`} />
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{model.status}</span>
                     </div>
                     {model.status === 'online' && (
                       <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-500/80">
                          <Activity className="w-3 h-3" />
                          <span>HEALTH: {model.health}%</span>
                       </div>
                     )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="discovery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {registryModels.map(rm => (
                 <div key={rm.id} className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                          <CloudDownload className="w-8 h-8" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <h4 className="font-bold text-slate-200">{rm.name}</h4>
                             <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">{rm.provider}</span>
                          </div>
                          <div className="flex gap-2">
                             {rm.tags.map(t => (
                               <span key={t} className="text-[9px] font-mono text-slate-600 bg-black/40 px-2 py-0.5 rounded flex items-center gap-1.5">
                                 <Sparkles className="w-2.5 h-2.5 text-indigo-500/50" />
                                 {t}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => pullModel(rm)}
                      disabled={loading}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] tracking-widest uppercase transition-all disabled:opacity-50"
                    >
                       {loading ? 'Pulling...' : 'Pull Instance'}
                    </button>
                 </div>
               ))}
               
               {registryModels.length === 0 && !loading && (
                 <div className="col-span-full py-20 text-center space-y-4">
                    <Globe className="w-12 h-12 text-slate-800 mx-auto" />
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-widest italic">Syncing with global registry... No models found for current filter.</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 p-6 bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
        <Shield className="w-8 h-8 text-slate-800" />
        <div className="max-w-md">
          <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Isolation Protocols</h4>
          <p className="text-[10px] text-slate-600 font-mono mt-1 italic leading-relaxed">All neural artifacts are sandboxed using hardware-level isolation. Discovery layer is restricted to verified repositories only. Handshake protocols use mutual TLS with hardware-based keys.</p>
        </div>
      </div>
    </div>
  );
};
