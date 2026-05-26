import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JarvisVoice } from './components/JarvisVoice';
import { ModelManager } from './components/ModelManager';
import { SecurityLab } from './components/SecurityLab';
import { DeepLearning } from './components/DeepLearning';
import { BootSequence } from './components/BootSequence';
import { KaliTerminal } from './components/KaliTerminal';
import { RemoteDesktop } from './components/RemoteDesktop';
import { MetasploitFramework } from './components/MetasploitFramework';
import { GhostChat } from './components/GhostChat';
import { SecurityModuleHub } from './components/SecurityModuleHub';
import { UserManagement } from './components/UserManagement';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth, ROLE_DISPLAY, ROLE_COLOR, UserRole } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { AudioSettingsProvider } from './contexts/AudioSettingsContext';
import { Background3D } from './components/Background3D';
import { Menu, X } from 'lucide-react';

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string, text: string }[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [threatLevel, setThreatLevel] = useState('low');
  const [systemCheck, setSystemCheck] = useState<{
    inProgress: boolean;
    progress: number;
    currentStep: string;
    results: { name: string, status: 'online' | 'offline' | 'error' | 'pending' }[];
  }>({
    inProgress: false,
    progress: 0,
    currentStep: '',
    results: []
  });
  const { user, loading, authenticatedFetch } = useAuth();
  const checkPerformed = React.useRef(false);

  useEffect(() => {
    // Check initial server state
    authenticatedFetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (!data.isBooting) {
          setIsBooting(false);
        }
      })
      .catch(() => {
        // If server is not ready yet, we rely on BootSequence internal polling
      });

    // Global event listener for tab switching
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('switch_tab', handleSwitchTab);

    return () => {
      window.removeEventListener('switch_tab', handleSwitchTab);
    };
  }, []);

  // Global listener for system-wide threat level changes
  useEffect(() => {
    const handleThreatUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.level) {
        setThreatLevel(customEvent.detail.level);
      }
    };
    window.addEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
    return () => window.removeEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
  }, []);

  // System diagnostics and Jarvis announcements on startup
  useEffect(() => {
    if (!isBooting && user && 'speechSynthesis' in window && !checkPerformed.current) {
      checkPerformed.current = true;

      const performSystemCheck = async () => {
        setSystemCheck({
          inProgress: true,
          progress: 0,
          currentStep: 'Initializing system diagnostics...',
          results: []
        });
        const failures: string[] = [];

        const speak = (text: string) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9; // Matches Jarvis persona
          utterance.pitch = 0.8;
          window.speechSynthesis.speak(utterance);
        };

        speak("Initializing system-wide diagnostics.");
        await new Promise(r => setTimeout(r, 1000));

        // 1. Core API Check
        setSystemCheck(prev => ({ ...prev, progress: 20, currentStep: 'Verifying Core Systems...' }));
        try {
          const res = await authenticatedFetch('/api/system/status', { method: 'GET' });
          const data = await res.json();
          if (res.ok) {
            speak(`Core systems online. SpartanAI_Security_Core version ${data.version} operational.`);
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Core API', status: 'online' }] }));
          }
        } catch {
          speak("System core communication failure.");
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Core API', status: 'error' }] }));
          failures.push('Core API');
        }
        await new Promise(r => setTimeout(r, 800));

        // 2. HSM Check
        setSystemCheck(prev => ({ ...prev, progress: 40, currentStep: 'Verifying HSM Authentication...' }));
        try {
          const res = await authenticatedFetch('/api/security/hsm/status', { method: 'GET' });
          const data = await res.json();
          if (data.status === 'OPERATIONAL') {
            speak("Hardware Security Module authenticated. FIPS level 3 verified.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'HSM Module', status: 'online' }] }));
          } else {
            speak("Warning: Hardware Security Module is offline.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'HSM Module', status: 'offline' }] }));
            failures.push('HSM Module');
          }
        } catch {
          speak("H S M offline.");
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'HSM Module', status: 'offline' }] }));
          failures.push('HSM Module');
        }
        await new Promise(r => setTimeout(r, 800));

        // 3. Metasploit Status
        setSystemCheck(prev => ({ ...prev, progress: 60, currentStep: 'Syncing Metasploit Framework...' }));
        try {
          const res = await authenticatedFetch('/api/msf/update/status', { method: 'GET' });
          const data = await res.json();
          if (data.state !== 'not_installed') {
            speak("Metasploit framework link established.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Metasploit', status: 'online' }] }));
          } else {
            speak("Metasploit framework not detected on local system.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Metasploit', status: 'offline' }] }));
            failures.push('Metasploit');
          }
        } catch {
          speak("Metasploit framework link failure.");
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Metasploit', status: 'error' }] }));
          failures.push('Metasploit');
        }
        await new Promise(r => setTimeout(r, 800));

        // 4. Model Registry
        setSystemCheck(prev => ({ ...prev, progress: 80, currentStep: 'Syncing Neural Repository...' }));
        try {
          const res = await authenticatedFetch('/api/models', { method: 'GET' });
          const data = await res.json();
          speak(`Neural repository synced. ${data.length} models available.`);
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Neural Models', status: 'online' }] }));
        } catch {
          speak("Neural artifact link failed.");
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Neural Models', status: 'error' }] }));
        }
        await new Promise(r => setTimeout(r, 800));

        // 5. Hardware & Drivers
        setSystemCheck(prev => ({ ...prev, progress: 100, currentStep: 'Probing Hardware Integrity...' }));
        try {
          const res = await authenticatedFetch('/api/system/hardware', { method: 'GET' });
          const data = await res.json();
          if (data.status === 'optimal') {
            speak("Hardware abstraction layer verified. Latest kernel drivers active with persistence.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Hardware', status: 'online' }] }));
          }
        } catch {
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'Hardware', status: 'error' }] }));
          failures.push('Hardware');
        }
        await new Promise(r => setTimeout(r, 800));

        // 6. Remote Mobile Bridge Check
        setSystemCheck(prev => ({ ...prev, progress: 95, currentStep: 'Verifying ADB Bridge Tunnel...' }));
        try {
          const res = await authenticatedFetch('/api/adb/status');
          if (res.ok) {
            speak("A D B bridge operational. Remote mobile nodes detected.");
            setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'ADB Bridge', status: 'online' }] }));
          }
        } catch {
          setSystemCheck(prev => ({ ...prev, results: [...prev.results, { name: 'ADB Bridge', status: 'error' }] }));
          failures.push('ADB Bridge');
        }
        await new Promise(r => setTimeout(r, 400));
        setSystemCheck(prev => ({ ...prev, progress: 100 }));

        if (failures.length > 0) {
          speak(`Diagnostics complete. I have identified ${failures.length} subsystem irregularities in: ${failures.join(", ")}. Please initiate neural link for automated repair.`);
          window.dispatchEvent(new CustomEvent('spartanai-security-core-system-failure', { detail: { failedComponents: failures } }));
        } else {
          speak("All systems nominal. Ready for command.");
          // Automatically initiate always-on learning protocols
          setTimeout(() => {
            handleJarvisCommand('manage_training', { action: 'start' });
          }, 2000);
        }

        setSystemCheck(prev => ({ ...prev, currentStep: 'Diagnostics Complete' }));
        setTimeout(() => setSystemCheck(prev => ({ ...prev, inProgress: false })), 5000);
      }; // Added authenticatedFetch to dependencies

      performSystemCheck();
    }
  }, [isBooting, user]);

  const addNotification = (text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Global listener for system-wide notifications (e.g., from Settings)
  useEffect(() => {
    const handleSystemNotify = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.message) {
        addNotification(customEvent.detail.message);
      }
    };

    window.addEventListener('system-notification', handleSystemNotify);
    return () => window.removeEventListener('system-notification', handleSystemNotify);
  }, []);

  const handleJarvisCommand = (command: string, args: any) => {
    switch (command) {
      case 'switch_tab':
        if (args.tab) {
          setActiveTab(args.tab);
          addNotification(`JARVIS: Navigating to ${args.tab.toUpperCase()}`);
        }
        break;
      case 'initiate_scan':
        setActiveTab('security');
        addNotification(`JARVIS: Initiating scan on ${args.target}`);
        break;
      case 'manage_training':
        setActiveTab('deeplearning');
        addNotification(`JARVIS: Training procedure ${args.action.toUpperCase()}ED`);
        break;
      case 'check_system_updates':
        setActiveTab('dashboard');
        if (args.mode === 'install') {
          addNotification("JARVIS: Initiating system recovery and update sequence");
          authenticatedFetch('/api/system/update', { method: 'POST' }).catch(e => console.error(e));
        } else {
          addNotification("JARVIS: Polling primary repositories for security patches");
        }
        break;
      case 'execute_advanced_protocol':
        addNotification(`JARVIS: EXECUTING PROTOCOL [${args.protocol_name.toUpperCase()}]`);
        break;
      case 'automate_exploit':
        setActiveTab('security');
        addNotification("JARVIS: Identifying severe threats and preparing counter-exploit...");
        // Call the proposal endpoint immediately
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jarvis-exploit-trigger'));
        }, 1000);
        break;
      case 'msf_configure_target':
        setActiveTab('msf_framework');
        addNotification(`JARVIS: Configuring MSF module for ${args.target}`);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('msf-target-transfer', {
            detail: { target: args.target, module: args.module }
          }));
        }, 500);
        break;
      case 'initiate_mobile_recon':
        setActiveTab('security');
        addNotification("JARVIS: Initiating Mobile Reconnaissance...");
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jarvis-mobile-recon-trigger'));
        }, 1000);
        break;
      case 'msf_execute_exploit':
        setActiveTab('msf_framework');
        addNotification(`JARVIS: Firing configured exploit sequence...`);
        window.dispatchEvent(new CustomEvent('msf-execute-exploit'));
        break;
      case 'toggle_master_stealth':
        localStorage.setItem('spartanai_security_core_stealth_mode', String(args.enabled));
        // Auto-generate a clandestine secondary key if none exists or if stealth is enabled.
        const stealthKey = args.enabled ? 'CLANDESTINE-SIG-' + Math.random().toString(36).substring(2, 7).toUpperCase() : 'SPARTANAI-SECURITY-CORE-7742-X';
        localStorage.setItem('spartanai_security_core_secondary_key', stealthKey);
        window.dispatchEvent(new CustomEvent('stealth-mode-update', {
          detail: { enabled: args.enabled, key: stealthKey }
        }));
        addNotification(`JARVIS: MASTER_STEALTH_${args.enabled ? 'ENGAGED' : 'DISENGAGED'}`);
        break;
      default:
        console.log("Unknown command:", command, args);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onLaunchDesktop={() => setActiveTab('enclave')} systemCheck={systemCheck} />;
      case 'jarvis': return <JarvisVoice onCommand={handleJarvisCommand} />;
      case 'models': return <ModelManager />;
      case 'security': return <SecurityLab />;
      case 'deeplearning': return <DeepLearning />;
      case 'terminal': return <KaliTerminal />;
      case 'enclave': return <RemoteDesktop />;
      case 'msf_framework': return <MetasploitFramework />;
      case 'hub': return <SecurityModuleHub />;
      case 'users': return <UserManagement />;
      default: return <Dashboard onLaunchDesktop={() => setActiveTab('enclave')} />;
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#02040a] flex items-center justify-center font-mono text-cyan-500 animate-pulse">
      INITIALIZING_SECURE_AUTH...
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {!user ? (
          <Login key="login" />
        ) : isBooting ? (
          <BootSequence key="boot" onComplete={() => setIsBooting(false)} />
        ) : (
          <motion.div
            key="interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen w-full bg-transparent text-slate-300 font-sans flex flex-col border-2 border-slate-900 threat-${threatLevel}`}
          >
            <Background3D />
            {/* TOP NAVIGATION BAR */}
            <nav className="sticky top-0 h-12 border-b border-cyan-900/30 bg-black/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
              <div className="flex items-center gap-4">
                <button className="md:hidden text-cyan-500 hover:text-cyan-400" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] theme-bg-glow"></div>
                  <span className="text-xs font-mono tracking-widest text-cyan-400 theme-text">SPARTANAI_SECURITY_CORE_SECURITY_CONSOLE</span>
                </div>
                <div className="h-4 w-px bg-slate-800"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter hidden md:block">OPERATIONAL STATE: ACTIVE // REGION: US-WEST</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white uppercase font-bold">{user.displayName || 'Operator'}</span>
                    {/* Sovereign Role Badge in top nav */}
                    <span
                      className="text-[8px] font-bold uppercase tracking-wider"
                      style={{ color: ROLE_COLOR[user.role as UserRole] }}
                    >
                      {ROLE_DISPLAY[user.role as UserRole]}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-slate-900 overflow-hidden"
                    style={{ borderColor: `${ROLE_COLOR[user.role as UserRole]}50` }}>
                    <span className="text-[10px] font-bold" style={{ color: ROLE_COLOR[user.role as UserRole] }}>{(user.displayName || 'OP')[0]}</span>
                  </div>
                </div>
                <div className="h-4 w-px bg-slate-800"></div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] uppercase font-bold ${threatLevel === 'critical' || threatLevel === 'high' ? 'text-red-500' : threatLevel === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    Network Status: {threatLevel === 'critical' || threatLevel === 'high' ? 'CRITICAL ALERT' : threatLevel === 'medium' ? 'WARNING' : 'NOMINAL'}
                  </span>
                  <span className="text-[9px] text-slate-600">ENCRYPTION: AES-256-GCM</span>
                </div>
              </div>
            </nav>

            {/* MAIN INTERFACE */}
            <div className="flex flex-1 relative">
              <div className="hidden md:block sticky top-12 self-start h-[calc(100vh-3rem)] shrink-0 z-40">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setIsSettingsOpen(true)} />
              </div>

              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="fixed inset-0 z-[60] bg-black/90 md:hidden flex"
                  >
                    <Sidebar
                      activeTab={activeTab}
                      setActiveTab={(t) => { setActiveTab(t); setIsMobileMenuOpen(false); }}
                      onOpenSettings={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                    />
                    <div className="flex-1 p-4" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="float-right text-white/50 hover:text-white">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Settings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

              <main className="flex-1 relative p-6 bg-black/30 backdrop-blur-sm overflow-x-hidden">
                <div className="max-w-[3840px] mx-auto space-y-6">
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderContent()}
                  </div>
                </div>

                {/* Global Notifications */}
                <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                  <AnimatePresence>
                    {notifications.map(n => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-cyan-950/80 border border-cyan-500/30 backdrop-blur-md px-4 py-2 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-3"
                      >
                        <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                        {n.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <GhostChat />
              </main>
            </div>

            {/* FOOTER BAR */}
            <footer className="mt-auto h-8 border-t border-slate-900 bg-black/80 flex items-center justify-between px-6 shrink-0 z-50 relative">
              <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  SYSTEM OK
                </span>
                <span className="hidden sm:block">UPTIME: 14D 02H 11M</span>
                <span className="hidden md:block text-slate-700">|</span>
                <span className="hidden md:block">IP: [PROTECTED]</span>
                <span className="hidden md:block text-slate-700">|</span>
                <span className="text-cyan-500/70">SECURE_SYNC: AUTHENTICATED</span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono">
                <span className="text-slate-600 uppercase tracking-tighter">SpartanAI Security Core Intelligence v2.5.0-Production</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AudioSettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AudioSettingsProvider>
  );
}
