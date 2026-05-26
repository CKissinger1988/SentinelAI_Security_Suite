import React, { useState } from 'react';
import { Mic, Headphones, ShieldAlert, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioSettings } from '../contexts/AudioSettingsContext';

export const AudioSettingsPanel: React.FC = () => {
    const {
        inputDevices,
        outputDevices,
        selectedInput,
        setSelectedInput,
        selectedOutput,
        setSelectedOutput,
        refreshDevices,
    } = useAudioSettings();

    const [isTroubleshooting, setIsTroubleshooting] = useState(false);
    const [troubleshootResults, setTroubleshootResults] = useState<{ name: string, status: 'pass' | 'fail' | 'pending' }[]>([]);

    const runTroubleshooter = async () => {
        setIsTroubleshooting(true);
        const checks: { name: string, status: 'pass' | 'fail' | 'pending' }[] = [
            { name: 'Browser Support', status: 'pending' },
            { name: 'Microphone Access', status: 'pending' },
            { name: 'WebSocket Link', status: 'pending' },
            { name: 'Audio Engine', status: 'pending' },
        ];
        setTroubleshootResults([...checks]);

        // 1. Browser Support
        const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        checks[0].status = hasMedia ? 'pass' : 'fail';
        setTroubleshootResults([...checks]);
        await new Promise(r => setTimeout(r, 600));

        // 2. Microphone Permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop());
            checks[1].status = 'pass';
        } catch {
            checks[1].status = 'fail';
        }
        setTroubleshootResults([...checks]);
        await new Promise(r => setTimeout(r, 600));

        // 3. WebSocket Server
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const testWs = new WebSocket(`${protocol}//${window.location.host}/ws/jarvis`);
            await new Promise((res, rej) => {
                testWs.onopen = () => { testWs.close(); res(null); };
                testWs.onerror = () => rej(new Error());
                setTimeout(() => rej(new Error()), 3000);
            });
            checks[2].status = 'pass';
        } catch {
            checks[2].status = 'fail';
        }
        setTroubleshootResults([...checks]);
        await new Promise(r => setTimeout(r, 600));

        // 4. Audio Context
        try {
            const ctx = new AudioContext();
            checks[3].status = ctx.state !== 'closed' ? 'pass' : 'fail';
            ctx.close();
        } catch {
            checks[3].status = 'fail';
        }
        setTroubleshootResults([...checks]);
        setIsTroubleshooting(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
                <Mic className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold uppercase tracking-tighter">Audio Configuration</span>
            </div>
            <div className="bg-black/40 rounded-lg border border-slate-800 divide-y divide-slate-800/50 text-xs font-mono overflow-hidden">
                <div className="p-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mic className="w-3 h-3" /> Input Device (Mic)
                    </label>
                    <select
                        value={selectedInput}
                        onChange={(e) => setSelectedInput(e.target.value)}
                        className="w-full bg-black border border-slate-700 rounded p-2 text-[10px] text-cyan-400 outline-none focus:border-cyan-500"
                    >
                        {inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Microphone'}</option>)}
                        {inputDevices.length === 0 && <option>No Microphones Found</option>}
                    </select>
                </div>
                <div className="p-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Headphones className="w-3 h-3" /> Output Device (Speakers)
                    </label>
                    <select
                        value={selectedOutput}
                        onChange={(e) => setSelectedOutput(e.target.value)}
                        className="w-full bg-black border border-slate-700 rounded p-2 text-[10px] text-cyan-400 outline-none focus:border-cyan-500"
                    >
                        {outputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Output'}</option>)}
                        {outputDevices.length === 0 && <option>Default Output</option>}
                    </select>
                </div>
                <div className="p-3 flex justify-between items-center pt-2">
                    <button
                        onClick={runTroubleshooter}
                        className="text-[9px] text-cyan-500 hover:text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <ShieldAlert className="w-3.5 h-3.5" /> Start Auto-Troubleshooter
                    </button>
                    <button
                        onClick={refreshDevices}
                        className="text-[9px] text-slate-500 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Device List
                    </button>
                </div>
            </div>

            {/* Troubleshooting Overlay (rendered conditionally) */}
            <AnimatePresence>
                {isTroubleshooting && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-sm space-y-6">
                            <div className="text-center space-y-2">
                                <RefreshCw className="w-8 h-8 text-cyan-500 mx-auto animate-spin" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em]">Audio Diagnostics In Progress</h3>
                            </div>
                            <div className="space-y-3">
                                {troubleshootResults.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                                        <span className="text-[10px] text-slate-400 uppercase font-mono">{r.name}</span>
                                        {r.status === 'pending' ? (
                                            <div className="w-3 h-3 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                        ) : r.status === 'pass' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};