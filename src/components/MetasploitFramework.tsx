import React, { useState, useRef, useEffect, useCallback } from "react";
import { Crosshair, Hash, ShieldAlert, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TerminalMessage } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface MsfUpdateStatus {
  state:
    | "idle"
    | "checking"
    | "updating"
    | "complete"
    | "error"
    | "not_installed";
  message: string;
  msfVersion: string | null;
  lastUpdated: string | null;
}

export const MetasploitFramework: React.FC = () => {
  const { authenticatedFetch } = useAuth();
  const [input, setInput] = useState("");
  const [updateStatus, setUpdateStatus] = useState<MsfUpdateStatus | null>(
    null,
  );
  const [history, setHistory] = useState<TerminalMessage[]>([
    {
      id: "1",
      user: "",
      content: "       =[ metasploit v6.3.5-dev                         ]",
      type: "banner",
      timestamp: "",
    },
    {
      id: "2",
      user: "",
      content: "+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]",
      type: "banner",
      timestamp: "",
    },
    {
      id: "3",
      user: "",
      content: "+ -- --=[ 968 payloads - 45 encoders - 11 nops            ]",
      type: "banner",
      timestamp: "",
    },
    {
      id: "4",
      user: "",
      content: "+ -- --=[ 9 evasion                                       ]",
      type: "banner",
      timestamp: "",
    },
    { id: "5", user: "", content: "", type: "banner", timestamp: "" },
  ]);

  // --- Silent MSF auto-update status poller ---
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await authenticatedFetch("/api/msf/update/status");
        if (!res.ok) return;
        const data: MsfUpdateStatus = await res.json();
        if (!cancelled) setUpdateStatus(data);

        // Keep polling while the updater is still working
        const terminal = ["complete", "error", "not_installed", "idle"];
        if (!terminal.includes(data.state) && !cancelled) {
          setTimeout(poll, 3000);
        }
      } catch {
        // Server not ready yet – retry
        if (!cancelled) setTimeout(poll, 5000);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [authenticatedFetch]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const handleTransfer = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { target, module } = customEvent.detail;

        const setupLogs: TerminalMessage[] = [
          {
            id: Date.now().toString() + "-1",
            user: "",
            content: `[*] Received external target payload: ${target}`,
            type: "info",
            timestamp: "",
          },
          {
            id: Date.now().toString() + "-2",
            user: "msf6",
            content: `msf6 > use ${module}`,
            type: "input",
            timestamp: "",
          },
          {
            id: Date.now().toString() + "-3",
            user: "",
            content: `[*] Using configured payload windows/x64/meterpreter/reverse_tcp`,
            type: "info",
            timestamp: "",
          },
          {
            id: Date.now().toString() + "-4",
            user: "msf6",
            content: `msf6 exploit(${module.split("/").pop()}) > set RHOSTS ${target}`,
            type: "input",
            timestamp: "",
          },
          {
            id: Date.now().toString() + "-5",
            user: "",
            content: `RHOSTS => ${target}`,
            type: "output",
            timestamp: "",
          },
          {
            id: Date.now().toString() + "-6",
            user: "",
            content: `msf6 exploit(${module.split("/").pop()}) > `,
            type: "prompt",
            timestamp: "",
          },
        ];

        setHistory((prev) => [...prev, ...setupLogs]);
      }
    };

    window.addEventListener("msf-target-transfer", handleTransfer);
    return () =>
      window.removeEventListener("msf-target-transfer", handleTransfer);
  }, []);

  const processCommand = useCallback(
    async (cmd: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const commandId = Date.now().toString();

      const c = cmd.toLowerCase().trim();
      if (c === "clear") {
        setHistory([]);
        return;
      }

      setHistory((prev) => {
        const updated = [
          ...prev,
          {
            id: commandId,
            user: "msf6",
            content: `${prev[prev.length - 1]?.type === "prompt" ? prev[prev.length - 1].content.trim() : "msf6 >"} ${cmd}`,
            type: "input" as const,
            timestamp,
          },
        ];
        return updated.slice(-100);
      });

      try {
        const res = await authenticatedFetch("/api/msf/command", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ command: cmd }),
        });

        if (!res.ok) {
          throw new Error("MSF_NOT_CONNECTED or execution failed.");
        }

        const data = await res.json();
        const output = data.data || "";
        const prompt = data.prompt || "msf6 >";

        setHistory((prev) => {
          const next = [...prev];
          if (output.trim()) {
            next.push({
              id: (Date.now() + 1).toString(),
              user: "",
              content: output.trim(),
              type: "output",
              timestamp: new Date().toLocaleTimeString(),
            });
          }
          next.push({
            id: (Date.now() + 2).toString(),
            user: "",
            content: prompt,
            type: "prompt",
            timestamp: "",
          });
          return next.slice(-100);
        });
      } catch (e: any) {
        setHistory((prev) =>
          [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              user: "",
              content: `[-] Backend Error: ${e.message}. Ensure msfrpcd is running and MSF bridge is configured.`,
              type: "error",
              timestamp: new Date().toLocaleTimeString(),
            },
            {
              id: (Date.now() + 2).toString(),
              user: "",
              content: "msf6 > ",
              type: "prompt" as const,
              timestamp: "",
            },
          ].slice(-100),
        );
      }
    },
    [authenticatedFetch],
  );

  useEffect(() => {
    const handleExecute = () => {
      processCommand("run");
    }; // processCommand is a dependency
    window.addEventListener("msf-execute-exploit", handleExecute);
    return () =>
      window.removeEventListener("msf-execute-exploit", handleExecute);
  }, [processCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col bg-[#0a0a0a] border border-red-900/50 rounded-lg overflow-hidden font-mono shadow-[0_0_30px_rgba(239,68,68,0.15)]">
      {/* Terminal Title Bar */}
      <div className="bg-[#111] px-4 py-3 border-b border-red-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Crosshair className="w-4 h-4 text-red-500" />
          <span className="text-[12px] text-red-500 uppercase tracking-[0.2em] font-bold">
            Metasploit Framework
          </span>
          {updateStatus && updateStatus.msfVersion && (
            <span className="text-[10px] text-slate-500 font-mono">
              v{updateStatus.msfVersion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-update status badge */}
          {updateStatus && (
            <div className="flex items-center gap-1.5">
              {(updateStatus.state === "checking" ||
                updateStatus.state === "updating") && (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-[9px] text-amber-400/80 font-mono uppercase tracking-wider">
                    {updateStatus.state === "checking"
                      ? "Checking…"
                      : "Updating…"}
                  </span>
                </>
              )}
              {updateStatus.state === "complete" && (
                <span className="text-[9px] text-emerald-500/80 font-mono uppercase tracking-wider">
                  DB Up-to-date
                </span>
              )}
              {updateStatus.state === "not_installed" && (
                <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">
                  MSF Not Detected
                </span>
              )}
              {updateStatus.state === "error" && (
                <span className="text-[9px] text-red-400/80 font-mono uppercase tracking-wider">
                  Update Failed
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] text-red-500/70 font-mono tracking-widest">
              ACTIVE SESSIONS: 0
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar"
      >
        <AnimatePresence>
          {history.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[12px] leading-relaxed"
            >
              <div className="flex flex-col">
                {msg.type === "input" && (
                  <div className="flex gap-2">
                    <span className="text-red-400 font-bold underline decoration-red-500/30">
                      msf6
                    </span>
                    <span className="text-white">
                      &gt; {msg.content.replace("msf6 > ", "")}
                    </span>
                  </div>
                )}
                {msg.type === "prompt" && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-red-400 font-bold underline decoration-red-500/30">
                      {msg.content.replace(" > ", "")}
                    </span>
                    <span className="text-white">&gt; </span>
                  </div>
                )}
                {msg.type === "meterpreter" && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-red-400 font-bold underline decoration-red-500/30">
                      meterpreter
                    </span>
                    <span className="text-white">&gt; </span>
                  </div>
                )}
                {msg.type === "output" && (
                  <div className="text-slate-300 py-0.5 whitespace-pre-wrap break-all">
                    {msg.content}
                  </div>
                )}
                {msg.type === "info" && (
                  <div className="text-cyan-400 py-0.5 font-bold">
                    {msg.content}
                  </div>
                )}
                {msg.type === "success" && (
                  <div className="text-emerald-500 py-0.5 font-bold whitespace-pre-wrap break-all">
                    {msg.content}
                  </div>
                )}
                {msg.type === "error" && (
                  <div className="text-red-500 py-0.5 font-bold">
                    {msg.content}
                  </div>
                )}
                {msg.type === "banner" && (
                  <pre className="text-red-500 font-bold opacity-80 leading-tight select-none">
                    {msg.content}
                  </pre>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-black/60 border-t border-red-900/30 flex items-center gap-3 shrink-0"
      >
        <span className="text-red-400 font-bold underline decoration-red-500/30 tracking-wider">
          {history
            .filter((h) => h.type === "prompt")
            .pop()
            ?.content.replace(">", "")
            .trim() || "msf6"}
        </span>
        <span className="text-white font-bold">&gt;</span>
        <input
          autoFocus
          className="bg-transparent border-none outline-none flex-1 text-white text-sm font-mono placeholder:text-slate-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="w-2 h-4 bg-red-500 animate-pulse" />
      </form>
    </div>
  );
};
