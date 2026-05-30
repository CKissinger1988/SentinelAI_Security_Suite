import React, { useState, useEffect, useCallback } from "react";
import {
  Terminal,
  Shield,
  Zap,
  Search,
  Activity,
  Lock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  X,
  Crosshair,
  Smartphone,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScanResult } from "../types";
import { useAuth } from "../contexts/AuthContext";

const CellularAdjacencyVisual: React.FC<{ details: string[] }> = ({
  details,
}) => (
  <div className="relative h-48 w-full bg-black/40 rounded-xl border border-cyan-500/10 overflow-hidden flex items-center justify-center mb-2">
    {/* Grid Background */}
    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

    {/* Radar Rings */}
    <div className="absolute w-24 h-24 border border-cyan-500/20 rounded-full" />
    <div className="absolute w-48 h-48 border border-cyan-500/10 rounded-full" />
    <div className="absolute w-72 h-72 border border-cyan-500/5 rounded-full" />

    {/* Radar Sweep */}
    <motion.div
      className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(6,182,212,0.15)_360deg)]"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />

    {/* Detected Points */}
    <div className="relative z-10 w-full h-full">
      {details.map((detail, i) => {
        const hash = detail
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const top = 15 + (hash % 70);
        const left = 15 + ((hash * 13) % 70);

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
            style={{ top: `${top}%`, left: `${left}%` }}
            className="absolute flex flex-col items-center gap-1.5"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
              <div className="absolute inset-0 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-[7px] font-mono text-red-400 uppercase bg-black/80 px-1.5 py-0.5 rounded border border-red-500/20 backdrop-blur-sm whitespace-nowrap">
              {detail.split(":")[0].substring(0, 15)}
            </span>
          </motion.div>
        );
      })}
    </div>

    {/* Center Point */}
    <div className="relative z-20 flex flex-col items-center gap-1">
      <div className="p-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/50">
        <Radio className="w-3 h-3 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      </div>
      <span className="text-[6px] font-black text-cyan-400 uppercase tracking-widest">
        RECEIVER_NODE
      </span>
    </div>
  </div>
);

export const SecurityLab: React.FC = () => {
  const [target, setTarget] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [exploitProposal, setExploitProposal] = useState<any | null>(null);
  const [isExecutingExploit, setIsExecutingExploit] = useState(false);
  const { authenticatedFetch } = useAuth();

  useEffect(() => {
    const handleJarvisTrigger = () => fetchExploitProposal();
    const handleMobileRecon = () => {
      setTarget("MOBILE_RECON");
      startScan("MOBILE_RECON");
    };

    window.addEventListener("jarvis-exploit-trigger", handleJarvisTrigger);
    window.addEventListener("jarvis-mobile-recon-trigger", handleMobileRecon);
    return () => {
      window.removeEventListener("jarvis-exploit-trigger", handleJarvisTrigger);
      window.removeEventListener(
        "jarvis-mobile-recon-trigger",
        handleMobileRecon,
      );
    };
  }, []);

  const fetchExploitProposal = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/security/exploit/propose");
      if (res.ok) {
        const data = await res.json();
        setExploitProposal(data);
      }
    } catch (err) {
      console.error("Failed to fetch proposal");
    }
  }, [authenticatedFetch]); // Memoize fetchExploitProposal

  const [exploitResult, setExploitResult] = useState<string | null>(null);

  const executeExploit = async () => {
    if (!exploitProposal) return;
    setIsExecutingExploit(true);
    try {
      const res = await authenticatedFetch("/api/security/exploit/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: exploitProposal.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setExploitResult(data.log || "Exploit successful.");
        setExploitProposal(null);
        startScan(); // Refresh data
      }
    } catch (err) {
      console.error("Exploit execution failed");
    } finally {
      setIsExecutingExploit(false);
    }
  };

  const startScan = useCallback(
    async (forcedTarget?: string) => {
      const activeTarget = forcedTarget || target;
      if (!activeTarget) return;
      setIsScanning(true);
      setScanResult(null);
      setTimeLeft(3); // Short "analysis" period for UI feel, but real data is coming

      // Quick countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      try {
        const res = await authenticatedFetch("/api/security/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: activeTarget }),
        });
        const data = await res.json();

        // Short delay for "commercial" polish (don't return instantly so user sees the "magic")
        setTimeout(() => {
          setScanResult(data);
          setIsScanning(false);
          setTimeLeft(null);
          clearInterval(timer);
        }, 3000);
      } catch (err) {
        console.error("Scan failed");
        setIsScanning(false);
        setTimeLeft(null);
        clearInterval(timer);
      } // Memoize startScan
    },
    [authenticatedFetch, target],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
          RECON_ANALYSIS_LAB
        </h2>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest">
          Advanced vulnerability analysis and network topology mapping.
        </p>
      </div>

      <div className="bg-black/60 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-cyan-500" />
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest tracking-[0.2em]">
              SPARTANAI_SECURITY_CORE_AI_TERMINAL_V.2.4
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchExploitProposal}
              className="text-[9px] font-mono text-red-500 uppercase hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <Shield className="w-3 h-3" />
              POLL_COUNTER_EXPLOITS
            </button>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {exploitResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-full">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-mono text-emerald-400">
                    {exploitResult}
                  </p>
                </div>
                <button
                  onClick={() => setExploitResult(null)}
                  className="text-emerald-500 hover:text-emerald-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {exploitProposal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-6 bg-red-950/20 border border-red-500/30 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-red-500 uppercase flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      CRITICAL_THREAT_DETECTION: {exploitProposal.threat}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      TARGET: {exploitProposal.target} // VULNERABILITY:{" "}
                      {exploitProposal.vulnerability}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase">
                      Success Prob:{" "}
                      {(exploitProposal.success_probability * 100).toFixed(0)}%
                    </div>
                    <div className="text-[8px] text-slate-600 uppercase mt-1">
                      Payload: {exploitProposal.exploit_type}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={executeExploit}
                    disabled={isExecutingExploit}
                    className="flex-1 bg-red-600/20 border border-red-500/50 text-red-500 py-3 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isExecutingExploit ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    EXECUTE_COUNTER_EXPLOIT
                  </button>
                  <button
                    onClick={() => {
                      const payload = {
                        target: exploitProposal.target,
                        module: exploitProposal.exploit_type,
                      };
                      window.dispatchEvent(
                        new CustomEvent("msf-target-transfer", {
                          detail: payload,
                        }),
                      );
                      window.dispatchEvent(
                        new CustomEvent("switch_tab", {
                          detail: { tab: "msf_framework" },
                        }),
                      );
                    }}
                    className="flex-1 bg-red-900/40 border border-red-500/50 text-red-400 py-3 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-900/60 transition-all flex items-center justify-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    SEND_TO_MSF
                  </button>
                  <button
                    onClick={() => setExploitProposal(null)}
                    className="px-6 bg-slate-900 border border-slate-800 text-slate-500 py-3 rounded text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
                  >
                    ABORT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="PROXIED_IP_OR_HOSTNAME"
                className="w-full bg-slate-950 border border-slate-800 rounded py-3 pl-12 pr-4 text-[11px] font-mono text-cyan-100 placeholder:text-slate-800 focus:outline-none focus:border-cyan-500/30 transition-all"
              />
            </div>
            <button
              onClick={() => startScan()}
              disabled={isScanning || !target}
              className={`px-4 rounded font-bold text-[10px] tracking-[0.2em] uppercase transition-all flex items-center gap-2 ${
                isScanning
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30"
              }`}
            >
              {isScanning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  ANALYZING
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  SCAN_TARGET
                </>
              )}
            </button>
            <button
              onClick={() => {
                setTarget("LOCAL_SUBNET");
                setTimeout(startScan, 0);
              }}
              disabled={isScanning}
              className={`px-4 rounded font-bold text-[10px] tracking-[0.2em] uppercase transition-all flex items-center gap-2 ${
                isScanning
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30"
              }`}
            >
              <Search className="w-4 h-4" />
              SCAN_NETWORK
            </button>
            <button
              onClick={() => {
                setTarget("MOBILE_RECON");
                setTimeout(startScan, 0);
              }}
              disabled={isScanning}
              className={`px-4 rounded font-bold text-[10px] tracking-[0.2em] uppercase transition-all flex items-center gap-2 ${
                isScanning
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-purple-600/20 text-purple-400 border border-purple-500/40 hover:bg-purple-600/30"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              MOBILE_RECON
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-slate-600 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-500 animate-ping"></div>
                      {timeLeft && timeLeft > 0
                        ? `Bypassing firewalls... Buffer injection at 72%`
                        : "Finalizing analysis..."}
                    </span>
                    <span className="text-cyan-500 font-bold">
                      ETA: {timeLeft}s
                    </span>
                  </div>
                </motion.div>
              )}

              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">
                        Detailed Analysis Report
                      </h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[7px] text-cyan-400 font-bold uppercase tracking-tighter shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                        <Lock className="w-2.5 h-2.5" />
                        HSM_ENCRYPTED_VAULT
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">
                          Critical
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">
                          Medium
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {scanResult.results.map((res, i) => (
                      <div
                        key={i}
                        className="p-5 bg-slate-900/40 border border-slate-800/60 rounded flex flex-col gap-4 group hover:border-cyan-500/20 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded ${
                                res.severity === "critical"
                                  ? "bg-red-500/10 text-red-500"
                                  : res.severity === "high"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : res.severity === "medium"
                                      ? "bg-amber-500/10 text-amber-500"
                                      : "bg-emerald-500/10 text-emerald-500"
                              }`}
                            >
                              {res.severity === "critical" ||
                              res.severity === "high" ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-slate-200 uppercase tracking-wider">
                                {res.type}
                              </div>
                              <div className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">
                                {res.status}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`text-xs font-mono font-bold uppercase tracking-widest ${
                                res.severity === "critical"
                                  ? "text-red-500"
                                  : res.severity === "high"
                                    ? "text-orange-500"
                                    : res.severity === "medium"
                                      ? "text-amber-500"
                                      : "text-emerald-500"
                              }`}
                            >
                              {res.severity}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 font-bold mt-1">
                              {res.findings} FINDINGS
                            </div>
                          </div>
                        </div>

                        {res.type === "CELLULAR_ADJACENCY" && (
                          <div className="px-11 pb-2">
                            <CellularAdjacencyVisual details={res.details} />
                          </div>
                        )}

                        {res.details && res.details.length > 0 && (
                          <div className="pl-11 space-y-2 border-l border-slate-800/50 ml-4">
                            {res.details.map((detail, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-[10px] font-mono text-slate-500 leading-tight group-hover:text-slate-400 transition-colors"
                              >
                                <ChevronRight className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 immersive-card bg-slate-900/60 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-cyan-500" />
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
              Hardened Protocols
            </h3>
          </div>
          <p className="text-[10px] text-slate-600 font-mono leading-relaxed italic">
            System is running in Stealth Mode. All outbound traffic is routed
            through TOR Bridges. Traceability footprint: 0.04%.
          </p>
        </div>

        <div className="p-6 immersive-card bg-slate-900/60 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
              Persistence Snapshots
            </h3>
          </div>
          <p className="text-[10px] text-slate-600 font-mono leading-relaxed italic">
            Secure snapshots taken every 300 cycles. Recovery verified on
            Debian-Kali kernels. Persistence active on /dev/sda4.
          </p>
        </div>
      </div>
    </div>
  );
};
