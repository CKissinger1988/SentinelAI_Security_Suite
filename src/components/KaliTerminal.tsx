import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Hash,
  ChevronRight,
  Download,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// Assuming TerminalMessage is defined in src/types.ts
import { TerminalMessage } from "../types";

export const KaliTerminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalMessage[]>([
    {
      id: "1",
      user: "root@spartanai_security_core",
      content: "SpartanAI_Security_Core OS Terminal v2.5.0 [PRODUCTION]",
      type: "system",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "2",
      user: "root@spartanai_security_core",
      content: "Authorized personnel only. Binary integrity check passed.",
      type: "system",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [stealthMode, setStealthMode] = useState(
    localStorage.getItem("spartanai_security_core_stealth_mode") === "true",
  );
  const [secondaryKey, setSecondaryKey] = useState(
    localStorage.getItem("spartanai_security_core_secondary_key") ||
      "SPARTANAI-SECURITY-CORE-7742-X",
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStealthUpdate = (e: any) => {
      if (e.detail) {
        setStealthMode(e.detail.enabled);
        setSecondaryKey(e.detail.key);
      }
    };
    window.addEventListener("stealth-mode-update", handleStealthUpdate);
    return () =>
      window.removeEventListener("stealth-mode-update", handleStealthUpdate);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const processCommand = (cmd: string) => {
    const isStealth = stealthMode;
    const timestamp = new Date().toLocaleTimeString();

    if (isStealth) {
      const encryptedCmd = btoa(cmd + secondaryKey).slice(0, 16);
      setHistory((prev) => [
        ...prev,
        {
          id: `stealth-${Date.now()}`,
          user: "root@spartanai_security_core",
          content: `[STEALTH_MODE] Encrypting traffic with key: ${secondaryKey.slice(0, 3)}***`,
          type: "system",
          timestamp,
        },
        {
          id: `cipher-${Date.now()}`,
          user: "root@spartanai_security_core",
          content: `TX_CIPHER: ${encryptedCmd}...`,
          type: "system",
          timestamp,
        },
      ]);
    }

    const c = cmd.toLowerCase().trim();
    let output = "";
    let type: "output" | "error" | "system" = "output";

    if (c === "help") {
      output =
        "Available Commands: help, ls, clear, whoami, ifconfig, apt, nmap, cat, status, scan --target";
    } else if (c === "ls") {
      output =
        "bin/  boot/  dev/  etc/  home/  lib/  media/  mnt/  opt/  proc/  root/  run/  sbin/  srv/  sys/  tmp/  usr/  var/";
    } else if (c === "whoami") {
      output = "root / # uid=0(root) gid=0(root) groups=0(root)";
    } else if (c === "ifconfig") {
      output =
        "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::a00:27ff:fe8e:7ca2  prefixlen 64  scopeid 0x20<link>\n        ether 08:00:27:8e:7c:a2  txqueuelen 1000  (Ethernet)\n        RX packets 120512  bytes 125482012 (119.6 MiB)\n        TX packets 85412  bytes 10245812 (9.7 MiB)";
    } else if (c === "pwd") {
      output = "/root";
    } else if (c === "date") {
      output = new Date().toString();
    } else if (c === "uname -a") {
      output =
        "Linux spartanai_security_core 5.15.0-kali7-amd64 #1 SMP PREEMPT_DYNAMIC Debian 5.15.35-1kali1 (2022-05-04) x86_64 GNU/Linux";
    } else if (c === "apt update" || c === "sudo apt update") {
      output =
        "Hit:1 http://http.kali.org/kali kali-rolling InRelease\nReading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nAll packages are up to date.";
    } else if (
      c.startsWith("apt install") ||
      c.startsWith("sudo apt install")
    ) {
      output = `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\n${c.split(" ").pop()} is already the newest version (4.2.1-kali1).\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`;
    } else if (c === "nmap") {
      output =
        "Nmap 7.92 ( https://nmap.org )\nUsage: nmap [Scan Type(s)] [Options] {target specification}";
    } else if (c.startsWith("cat")) {
      output = "spartanai_security_core_v2.4.1_stable_build_unlocked";
    } else if (c === "clear") {
      setHistory([]);
      return;
    } else if (c === "status") {
      output = "SYSTEM_NOMINAL // ENCRYPTION: ACTIVE // STEALH_MODE: ENABLED";
      type = "system";
    } else if (c.startsWith("scan")) {
      output = `Scanning target... Initiating proxy-chain... Stealth-layer active. Results available in Security Lab.`;
      type = "system";
    } else if (c === "su" || c === "sudo su") {
      output =
        "Current session is already elevated to ROOT level. No escalation required.";
      type = "system";
    } else {
      output = `zsh: command not found: ${cmd.trim().split(" ")[0]}`;
      type = "error";
    }

    // Build the new history array once
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "root@spartanai_security_core",
        content: cmd,
        type: "input",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: (Date.now() + 1).toString(), // Ensure unique ID for output
        user: "root@spartanai_security_core", // Output is from the system, not user
        content: output,
        type: type,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col bg-black/60 border border-slate-800 rounded-lg overflow-hidden font-mono shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <TerminalIcon className="w-3 h-3" />
            root@spartanai_security_core: ~
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <Download className="w-3 h-3 cursor-pointer hover:text-cyan-500 transition-colors" />
          <Trash2
            onClick={() => setHistory([])}
            className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800"
      >
        <AnimatePresence>
          {history.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] leading-relaxed"
            >
              {msg.type === "input" ? (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">
                    ┌──(
                  </span>
                  <span className="text-cyan-400 font-bold shrink-0">
                    root㉿spartanai_security_core
                  </span>
                  <span className="text-emerald-500 font-bold shrink-0">
                    )-[
                  </span>
                  <span className="text-white shrink-0">~</span>
                  <span className="text-emerald-500 font-bold shrink-0">]</span>
                </div>
              ) : null}

              <div
                className={`flex items-start gap-2 ${msg.type === "input" ? "pl-4" : ""}`}
              >
                {msg.type === "input" && (
                  <span className="text-emerald-500 font-bold">
                    └─
                    <Hash className="w-3 h-3 inline pb-0.5" />
                  </span>
                )}
                {msg.type === "error" && (
                  <ShieldAlert className="w-3 h-3 text-red-500 mt-1 shrink-0" />
                )}
                <pre
                  className={`whitespace-pre-wrap break-all ${
                    msg.type === "input"
                      ? "text-white font-bold"
                      : msg.type === "error"
                        ? "text-red-400 italic"
                        : msg.type === "system"
                          ? "text-cyan-500 font-bold italic"
                          : "text-slate-400"
                  }`}
                >
                  {msg.content}
                </pre>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-black/40 border-t border-slate-800 flex items-center gap-2 group shrink-0"
      >
        <span className="text-emerald-500 font-bold text-xs shrink-0 tracking-tighter">
          root@spartanai_security_core#
        </span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-cyan-400 text-xs font-mono placeholder:text-slate-700"
          placeholder="Execute system protocol..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <ChevronRight className="w-4 h-4 text-slate-700 group-focus-within:text-cyan-500 transition-colors" />
      </form>
    </div>
  );
};
