import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, MessageSquare, Volume2, ShieldAlert, Settings, VolumeX, CheckCircle2, AlertCircle, RefreshCw, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { useAuth } from '../contexts/AuthContext';

interface JarvisVoiceProps {
  onCommand?: (command: string, args: Record<string, any>) => void;
}

export const JarvisVoice: React.FC<JarvisVoiceProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'jarvis', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(16).fill(0));
  const [threatLevel, setThreatLevel] = useState<string>('low');
  const prevThreatLevelRef = useRef<string>('low');
  const { token } = useAuth();

  // Use audio settings from context
  const {
    selectedInput,
    selectedOutput,
    selectedVoice,
    wakeWordSensitivity,
    allowWakeWordBypassOnCritical,
  } = useAudioSettings();

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDiagnosisRef = useRef<string[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store onCommand in a ref to avoid stale closures in the WebSocket listener
  const onCommandRef = useRef(onCommand);
  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice) || null;
    }
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  useEffect(() => {
    const handleThreatUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.level) setThreatLevel(customEvent.detail.level);
    };

    const handleFirewallAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { source, protocol } = customEvent.detail || {};
      if (source) {
        speak(`Neural firewall alert. Blocked high severity ${protocol} packet from ${source}.`);
      }
    };

    const handleGeofenceAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { model } = customEvent.detail || {};
      if (model) {
        speak(`Geofence alert. Mobile node ${model} has moved significantly beyond the secured perimeter.`);
      }
    };

    window.addEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
    window.addEventListener('spartanai-security-core-firewall-alert', handleFirewallAlert);
    window.addEventListener('spartanai-security-core-geofence-alert', handleGeofenceAlert);
    return () => {
      window.removeEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
      window.removeEventListener('spartanai-security-core-firewall-alert', handleFirewallAlert);
      window.removeEventListener('spartanai-security-core-geofence-alert', handleGeofenceAlert);
    };
  }, [speak]);

  const triggerAutoRepair = useCallback(() => {
    if (pendingDiagnosisRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      const components = pendingDiagnosisRef.current.join(", ");
      wsRef.current.send(JSON.stringify({
        type: 'text',
        data: `JARVIS, system diagnostics reported failures in: ${components}. Please diagnose the root cause and execute the repair_subsystem protocol for each failing component.`
      }));
      pendingDiagnosisRef.current = null;
    }
  }, []);

  // Listen for system check failures
  useEffect(() => {
    const handleSystemFailure = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.failedComponents) {
        pendingDiagnosisRef.current = customEvent.detail.failedComponents;

        // If already connected, trigger repair instruction immediately
        if (isListening) {
          triggerAutoRepair();
        }
      }
    };

    window.addEventListener('spartanai-security-core-system-failure', handleSystemFailure);
    return () => window.removeEventListener('spartanai-security-core-system-failure', handleSystemFailure);
  }, [isListening, triggerAutoRepair]);

  // Voice Synthesis for System Announcements (Jarvis Persona)
  useEffect(() => {
    if (threatLevel !== prevThreatLevelRef.current) {
      if (threatLevel === 'critical' || threatLevel === 'high') {
        speak(`Warning. Threat level escalation detected. Current status: ${threatLevel}.`);
      } else if (threatLevel === 'low' && (prevThreatLevelRef.current === 'high' || prevThreatLevelRef.current === 'critical')) {
        speak("Threat neutralized. System level returning to nominal status.");
      }

      // Automated Counter-Exploit Trigger
      if (threatLevel === 'critical' && wsRef.current?.readyState === WebSocket.OPEN) {
        speak("CRITICAL_INTRUSION_DETECTED. Bypassing authorization. Jarvis, analyze threat and stage counter-measures.");

        wsRef.current.send(JSON.stringify({
          type: 'text',
          data: 'SYSTEM_CRITICAL_NOTIFICATION: A critical level-5 intrusion has been detected. Analyze IDS logs, identify the source, and execute the automate_exploit protocol immediately.'
        }));
      }

      if (allowWakeWordBypassOnCritical && wsRef.current?.readyState === WebSocket.OPEN) {
        if (threatLevel === 'critical') {
          wsRef.current.send(JSON.stringify({ type: 'text', data: 'SYSTEM_NOTIFICATION: Threat level has reached CRITICAL. Wake word protocols are temporarily suspended. Respond to all voice input immediately.' }));
        } else if (prevThreatLevelRef.current === 'critical' && threatLevel !== 'critical') {
          wsRef.current.send(JSON.stringify({ type: 'text', data: 'SYSTEM_NOTIFICATION: Threat minimized. Reinstating standard wake word protocols.' }));
        }
      }

      prevThreatLevelRef.current = threatLevel;
    }
  }, [threatLevel, allowWakeWordBypassOnCritical, speak]); // Added speak to dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startJarvis = useCallback(async () => {
    // Dependencies for useCallback
    const currentSelectedVoice = selectedVoice;
    const currentWakeWordSensitivity = wakeWordSensitivity;
    const currentAllowWakeWordBypassOnCritical = allowWakeWordBypassOnCritical;
    const currentToken = token;
    const currentTriggerAutoRepair = triggerAutoRepair;
    const currentOnCommandRef = onCommandRef.current;

    try {
      setError(null);
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/jarvis?voice=${selectedVoice}&sensitivity=${wakeWordSensitivity}&bypassOnCritical=${allowWakeWordBypassOnCritical}&token=${token}`);
      wsRef.current = ws;

      // Heartbeat to keep connection alive
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'text', data: 'KEEP_ALIVE' }));
      }, 30000);

      const audioCtx = new AudioContext({ sampleRate: 16000 });

      // Ensure AudioContext is resumed (required by many browsers)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Select Output Device if supported (Chrome 110+)
      if (selectedOutput && typeof (audioCtx as any).setSinkId === 'function') {
        try { await (audioCtx as any).setSinkId(selectedOutput); } catch (e) { }
      }

      audioCtxRef.current = audioCtx;
      nextStartTimeRef.current = 0;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32; // Provides 16 frequency bins for visualizer
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current = analyser;

      ws.onopen = async () => {
        setIsListening(true);
        // Automatically instruct Jarvis to fix boot issues if any were detected
        currentTriggerAutoRepair();

        const constraints = {
          audio: selectedInput ? { deviceId: { exact: selectedInput } } : true
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const source = audioCtx.createMediaStreamSource(stream);

        // Using 2048 buffer size for better visualizer responsiveness (approx 60fps)
        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        source.connect(analyser);
        analyser.connect(processor);
        processor.connect(audioCtx.destination);

        const updateFrequencies = () => {
          if (analyserRef.current && ws.readyState === WebSocket.OPEN) {
            analyserRef.current.getByteFrequencyData(dataArray);
            setFrequencies(new Uint8Array(dataArray));
            animationFrameRef.current = requestAnimationFrame(updateFrequencies);
          }
        };
        animationFrameRef.current = requestAnimationFrame(updateFrequencies);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);

            // Real-time volume calculation (RMS) for the visualization meter
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            setVolume(Math.sqrt(sum / inputData.length));

            const pcmData = float32ToPcm16(inputData);
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
            ws.send(JSON.stringify({ type: 'audio', data: base64 }));
          }
        };
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "audio") {
          playAudioChunk(msg.data);
        } else if (msg.type === "text") {
          setMessages(prev => [...prev.slice(-20), { role: 'jarvis', text: msg.data }]);
        } else if (msg.type === "command") {
          currentOnCommandRef?.(msg.command, msg.args);
        } else if (msg.type === "interrupted") {
          stopPlayback();
        } else if (msg.type === "error") {
          setError(msg.message);
          stopJarvis();
        }
      };

      ws.onclose = (event) => {
        setIsListening(false);
        stopJarvis();
        if (!event.wasClean) {
          setError(`Connection Lost: The neural link was terminated unexpectedly (Code: ${event.code}).`);
        }
      };

      ws.onerror = (err) => {
        console.error("Jarvis WS Error:", err);
        if (!token) {
          setError("Authentication Failure: Missing session token.");
        } else {
          setError("Neural Link Failure: Could not establish WebSocket connection. Verify server status and API configuration.");
        }
        stopJarvis();
      };

    } catch (err: any) {
      setError(err.message || "Failed to start JARVIS");
      setIsListening(false);
    }
  }, [selectedInput, selectedOutput, selectedVoice, wakeWordSensitivity, allowWakeWordBypassOnCritical, token, triggerAutoRepair]);

  const stopJarvis = () => {
    setIsListening(false);
    setVolume(0);
    setFrequencies(new Uint8Array(16).fill(0));
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    wsRef.current?.close();
    processorRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioCtxRef.current?.close();
    wsRef.current = null;
    audioCtxRef.current = null;
    processorRef.current = null;
    analyserRef.current = null;
  };

  // Automated lifecycle management: Initiate link on mount and cleanup on unmount
  useEffect(() => {
    startJarvis();
    return () => stopJarvis(); // Cleanup on unmount
  }, [selectedInput, selectedOutput, selectedVoice, wakeWordSensitivity, allowWakeWordBypassOnCritical, token, triggerAutoRepair, speak]); // Added speak to dependencies

  // Fix: Handle browser audio auto-play restrictions for commercial release
  useEffect(() => {
    const resumeAudio = async () => {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      window.removeEventListener('click', resumeAudio);
    };
    window.addEventListener('click', resumeAudio);
    return () => window.removeEventListener('click', resumeAudio);
  }, []);

  const getVisualizerColor = () => {
    if (!isListening) return '#1e293b';
    switch (threatLevel) {
      case 'critical':
      case 'high': return '#ef4444'; // Red for High Threat
      case 'medium': return '#f59e0b'; // Amber for Medium Threat
      default: return '#06b6d4'; // Cyan for Low/Normal
    }
  };

  const float32ToPcm16 = (buffer: Float32Array) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7FFF;
    }
    return buf;
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!audioCtxRef.current) return;
    const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
    const pcm16 = new Int16Array(audioData);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 0x7FFF;
    }

    const buffer = audioCtxRef.current.createBuffer(1, float32.length, 16000);
    buffer.getChannelData(0).set(float32);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);

    const startTime = Math.max(audioCtxRef.current.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  const stopPlayback = () => {
    nextStartTimeRef.current = audioCtxRef.current?.currentTime || 0;
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden rounded-lg border border-cyan-900/20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-black/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`} />
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">System Status: {isListening ? 'Active' : 'Standby'}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono tracking-widest text-slate-700 uppercase italic hidden sm:block">ENGINE: GOOGLE_AI_NEXT_GEN</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/10 flex items-center justify-center relative">
              <div className={`w-24 h-24 rounded-full border-2 border-cyan-500/20 flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
                <div className={`w-16 h-16 rounded-full ${isListening ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'bg-slate-900 shadow-inner'}`}></div>
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-[-10px] border border-cyan-500/5 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-20px] border border-dashed border-cyan-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-cyan-500/50">JARVIS_CORE_{isListening ? 'ONLINE // SAY "JARVIS..." ' : 'OFFLINE'}</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded border ${msg.role === 'user'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 font-mono text-[11px]'
                }`}>
                {msg.role === 'jarvis' && (
                  <div className="text-[9px] text-cyan-500 mb-1 tracking-tighter uppercase font-bold">JARVIS INTERFACE</div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-black/80 border-t border-slate-900 z-10 shrink-0">
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded flex items-center gap-2 text-red-500 text-[10px] font-mono">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 h-4">
              {Array.from(frequencies).map((val, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isListening ? Math.max(4, (val / 255) * 18) : 4,
                    backgroundColor: getVisualizerColor(),
                    boxShadow: isListening ? `0 0 ${Math.min(20, volume * 150)}px ${getVisualizerColor()}` : '0 0 0px transparent'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                  className="w-0.5 rounded-full"
                />
              ))}
            </div>
          </div>

          <button
            onClick={isListening ? stopJarvis : startJarvis}
            className={`flex items-center gap-2 px-8 py-3 rounded-md font-mono text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${isListening
              ? 'bg-red-500/10 text-red-500 border border-red-500/40 hover:bg-red-500/20'
              : 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30 glow-cyan'
              }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                ABORT_LINK
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                INITIATE_LINK
              </>
            )}
          </button>

          <div className="flex items-center gap-4 text-slate-600">
            <Volume2 className={`w-4 h-4 ${isListening ? 'text-cyan-500' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
};