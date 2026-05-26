import React, { useEffect, useState, useCallback } from 'react';
import { Terminal, Shield, Brain, Cpu, Mic, Settings, LayoutDashboard, LogOut, ShieldCheck, Cpu as HsmIcon, Crosshair, Download, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth, ROLE_DISPLAY, ROLE_COLOR, UserRole } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const [hsmOnline, setHsmOnline] = useState(false);

  const checkHSM = useCallback(async () => {
    try {
      const res = await fetch('/api/security/hsm/status');
      const data = await res.json();
      setHsmOnline(data.status === 'OPERATIONAL');
    } catch {
      setHsmOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHSM();
  }, [checkHSM]);

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'COMMAND' },
    { id: 'enclave', icon: ShieldCheck, label: 'OP_ENCLAVE' },
    { id: 'jarvis', icon: Mic, label: 'JARVIS' },
    { id: 'terminal', icon: Terminal, label: 'KALI_CONS' },
    { id: 'models', icon: Brain, label: 'NEURAL_MOD' },
    { id: 'security', icon: Shield, label: 'SEC_RECON' },
    { id: 'msf_framework', icon: Crosshair, label: 'MSF_FRAMEWORK' },
    { id: 'deeplearning', icon: Cpu, label: 'MATRIX_CORE' },
    { id: 'hub', icon: Download, label: 'HUB_MASTER' },
    // User Management — only visible to Creator (root tier)
    ...(user?.role === 'root' ? [{ id: 'users', icon: Users, label: 'USER_MGMT' }] : []),
  ];

    return (
      <div className="w-20 lg:w-48 h-full bg-[#02040a]/80 border-r border-slate-800/50 flex flex-col transition-all duration-300 backdrop-blur-md overflow-y-auto overflow-x-hidden hide-scrollbar">
        <div className="p-4 px-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center glow-cyan">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block font-bold text-lg tracking-tighter text-white">SPARTANAI_SECURITY_CORE</span>
        </div>

        <nav className="flex-1 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-colors relative group ${isActive ? 'text-cyan-400 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-500' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="hidden lg:block font-medium text-[10px] tracking-widest uppercase">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 px-6 border-t border-slate-800/30 space-y-3">
          {/* Sovereign Role Badge */}
          {user && (
            <div className="hidden lg:block px-3 py-2 rounded-xl border mb-2" style={{ borderColor: `${ROLE_COLOR[user.role as UserRole]}30`, backgroundColor: `${ROLE_COLOR[user.role as UserRole]}08` }}>
              <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: ROLE_COLOR[user.role as UserRole] }}>
                {ROLE_DISPLAY[user.role as UserRole]}
              </div>
              <div className="text-[7px] text-slate-500 font-mono truncate">{user.email}</div>
            </div>
          )}

          {hsmOnline && (
            <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4">
              <HsmIcon className="w-3.5 h-3.5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">HSM Locked</span>
                <span className="text-[7px] text-emerald-500/50 font-mono">FIPS-140-2</span>
              </div>
            </div>
          )}
          <button onClick={onOpenSettings} className="flex items-center gap-4 text-slate-500 hover:text-slate-300 transition-colors w-full">
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block font-medium text-[10px] tracking-widest uppercase">CONFIG</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-4 text-red-500/70 hover:text-red-400 transition-colors w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block font-medium text-[10px] tracking-widest uppercase">DISCONNECT</span>
          </button>
        </div>
      </div>
    );
  };
