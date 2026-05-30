import React, { useState, useEffect, useCallback } from "react";
import {
  Terminal,
  X,
  MonitorOff,
  ShieldCheck,
  Wifi,
  Battery,
  Clock,
  Search,
  Folder,
  Globe,
  Chrome,
  Key,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Crosshair,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Activity,
  Server,
  Command,
  UploadCloud,
  DownloadCloud,
  Maximize2,
  Minimize2,
  Monitor,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { saveAs } from "file-saver"; // For file download functionality
import { useAuth } from "../contexts/AuthContext";
import { SSHKey } from "../types";

// --- APPLICATION WINDOWS ---

const TerminalApp: React.FC<{
  logs: any[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isPoppedOut: boolean;
  setIsPoppedOut: (v: boolean) => void;
}> = ({
  logs,
  input,
  setInput,
  onSubmit,
  onClose,
  isPoppedOut,
  setIsPoppedOut,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="w-full h-full bg-[#0c0c0c] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden"
  >
    <div className="h-9 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-3 shrink-0 rounded-t-lg">
      <div className="flex items-center gap-3">
        <Terminal className="w-3.5 h-3.5 text-cyan-500" />
        <span className="text-[10px] text-white/50 font-mono tracking-tight uppercase">
          Sovereign Shell Proxy
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPoppedOut(!isPoppedOut)}
          className="text-white/30 hover:text-white/70 focus:outline-none"
        >
          {isPoppedOut ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
        <X
          onClick={onClose}
          className="w-3.5 h-3.5 text-white/30 cursor-pointer hover:text-red-500"
        />
      </div>
    </div>
    <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto space-y-1 custom-scrollbar bg-black/40">
      {logs.map((log, i) => (
        <div key={i} className="flex flex-col">
          {log.type === "command" && (
            <div className="flex gap-2">
              <span className="text-emerald-500">ΓöîΓöÇΓöÇ(</span>
              <span className="text-cyan-400 font-bold">
                operatorπë┐sov-node
              </span>
              <span className="text-emerald-500">)-[</span>
              <span className="text-white">~</span>
              <span className="text-emerald-500">]</span>
              <div className="flex gap-2">
                <span className="text-emerald-500">ΓööΓöÇ#</span>
                <span className="text-white">{log.text}</span>
              </div>
            </div>
          )}
          {log.type === "output" && (
            <div className="text-slate-400 pl-4 py-0.5 opacity-80 break-all">
              {log.text}
            </div>
          )}
          {log.type === "error" && (
            <div className="text-red-500 pl-4 py-0.5 font-bold animate-pulse uppercase tracking-tighter">
              {log.text}
            </div>
          )}
          {log.type === "security" && (
            <div className="text-cyan-500/60 pl-4 py-0.5 italic border-l border-cyan-500/20 ml-2">
              [SEC_KERNEL] {log.text}
            </div>
          )}
        </div>
      ))}
      <form onSubmit={onSubmit} className="flex flex-col gap-1 pt-2">
        <div className="flex gap-2">
          <span className="text-emerald-500">ΓöîΓöÇΓöÇ(</span>
          <span className="text-cyan-400 font-bold">operatorπë┐sov-node</span>
          <span className="text-emerald-500">)-[</span>
          <span className="text-white">~</span>
          <span className="text-emerald-500">]</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-emerald-500">ΓööΓöÇ#</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono"
            autoFocus
          />
          <div className="w-1.5 h-3 bg-cyan-500 animate-pulse" />
        </div>
      </form>
    </div>
  </motion.div>
);

const FileExplorer: React.FC<{
  isDecrypted: boolean;
  isDecrypting: boolean;
  onMount: () => void;
  onClose: () => void;
  currentPath: string[];
  setCurrentPath: (p: string[]) => void;
  selectedFile: any;
  setSelectedFile: (f: any) => void;
  credentialsDecrypted: boolean;
  uploadedFiles: any[]; // New prop for uploaded files
  isUploading: boolean;
  uploadProgress: number;
  onUploadFile: (file: File) => void;
  onDeleteUploadedFile: (fileId: string) => void;
  onDownloadUploadedFile: (fileId: string, filename: string) => void;
  decryptedFileContent: {
    id: string;
    filename: string;
    content: string;
  } | null;
  onDecryptUploadedFile: (fileId: string) => void;
  isDecryptingUploadedFile: boolean;
  isDecryptingCredentials: boolean;
  onDecryptCredentials: () => void;
}> = ({
  isDecrypted,
  isDecrypting,
  onMount,
  onClose,
  currentPath,
  setCurrentPath,
  selectedFile,
  setSelectedFile,
  credentialsDecrypted,
  isDecryptingCredentials,
  onDecryptCredentials,
  uploadedFiles,
  isUploading,
  uploadProgress,
  onUploadFile,
  onDeleteUploadedFile,
  onDownloadUploadedFile,
  decryptedFileContent,
  onDecryptUploadedFile,
  isDecryptingUploadedFile,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="w-full h-full bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden"
  >
    <div className="h-9 bg-[#2d2d2d] border-b border-white/5 flex items-center justify-between px-3 shrink-0 rounded-t-lg">
      <div className="flex items-center gap-3">
        <Folder className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] text-white/70 font-sans tracking-tight font-bold uppercase tracking-wider">
          Encrypted Node Storage
        </span>
      </div>
      <X
        onClick={onClose}
        className="w-3.5 h-3.5 text-white/30 cursor-pointer hover:text-red-500"
      />
    </div>
    {!isDecrypted ? (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#151515] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.05)_0%,_transparent_70%)]" />
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-4 text-red-500">
          <Folder className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 bg-red-500 text-[8px] px-1 rounded font-bold text-white animate-pulse">
            LOCKED
          </div>
        </div>
        <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-1">
          Partition Encrypted
        </h3>
        <p className="text-[10px] text-slate-500 font-mono mb-4">
          AES-XTS-512 // SECURE_STORAGE_RING_0
        </p>
        <button
          onClick={onMount}
          disabled={isDecrypting}
          className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center gap-2.5 transition-all text-[10px] uppercase font-mono"
        >
          {isDecrypting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Negotiating HSM Keys...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mount & Decrypt Partition via HSM</span>
            </>
          )}
        </button>
      </div>
    ) : (
      <div className="flex-1 flex bg-[#161616] overflow-hidden text-xs text-slate-300">
        <div className="w-40 border-r border-white/5 bg-[#1b1b1b] p-3 flex flex-col gap-2 shrink-0">
          <div className="text-[9px] font-mono text-slate-500 uppercase mb-2">
            Partitions
          </div>
          <div
            onClick={() => {
              setCurrentPath([]);
              setSelectedFile(null);
            }}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${currentPath.length === 0 ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400"}`}
          >
            <Folder className="w-3.5 h-3.5 text-cyan-500" />
            <span>/mnt/secure</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-7 bg-[#1c1c1c] border-b border-white/5 flex items-center px-3 gap-2 text-[10px] font-mono text-slate-500">
            operator@sov-node:{" "}
            <span className="text-white/80">
              /mnt/secure
              {currentPath.length > 0 ? "/" + currentPath.join("/") : ""}
            </span>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-3 overflow-y-auto space-y-1 custom-scrollbar">
              {currentPath.length > 0 && (
                <div
                  onClick={() => {
                    setCurrentPath([]);
                    setSelectedFile(null);
                  }}
                  className="p-2 cursor-pointer hover:bg-white/5 text-slate-500 font-mono text-[10px]"
                >
                  .. [UP]
                </div>
              )}
              {currentPath.length === 0 ? (
                <>
                  <div
                    onDoubleClick={() => setCurrentPath(["recon_data"])}
                    onClick={() =>
                      setSelectedFile({ name: "recon_data", type: "dir" })
                    }
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedFile?.name === "recon_data" ? "bg-white/5" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span>recon_data</span>
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      setSelectedFile({
                        name: "README.txt",
                        type: "file",
                        size: "1.2 KB",
                        content: "SPARTANAI_SECURITY_CORE SYSTEM...",
                      })
                    }
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedFile?.name === "README.txt" ? "bg-white/5" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        T
                      </div>
                      <span>README.txt</span>
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      setSelectedFile({
                        name: "credentials.db.enc",
                        type: "file",
                        isEncrypted: true,
                        content: "[ENCRYPTED]",
                      })
                    }
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${selectedFile?.name === "credentials.db.enc" ? "bg-white/5" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                        E
                      </div>
                      <span>credentials.db.enc</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="w-64 border-l border-white/5 bg-[#171717] p-3 flex flex-col overflow-hidden">
              {selectedFile ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="text-[9px] font-mono text-slate-500 uppercase mb-2">
                    Properties
                  </div>
                  <div className="flex items-center gap-2 mb-3 bg-black/20 p-2 rounded-lg">
                    {selectedFile.type === "dir" ? (
                      <Folder className="w-5 h-5 text-amber-400" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        T
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-bold text-white truncate text-[11px]">
                        {selectedFile.name}
                      </div>
                    </div>
                  </div>
                  {selectedFile.isEncrypted && !credentialsDecrypted ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-black/40 border border-red-500/10 rounded-xl space-y-3">
                      <Key className="w-4 h-4 text-red-400 animate-pulse" />
                      <div className="text-[10px] font-bold text-red-400 uppercase">
                        HSM Protection Active
                      </div>
                      <button
                        onClick={onDecryptCredentials}
                        disabled={isDecryptingCredentials}
                        className="px-4 py-2 bg-red-600/90 text-white rounded-lg font-bold text-[9px] uppercase font-mono"
                      >
                        {isDecryptingCredentials
                          ? "Decrypting..."
                          : "Decrypt with HSM"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 p-2 bg-black/40 rounded-xl font-mono text-[9px] text-emerald-400 overflow-y-auto">
                      {selectedFile.content}
                    </div>
                  )}

                  {/* Display decrypted content for uploaded files */}
                  {selectedFile.id &&
                    selectedFile.isEncrypted &&
                    !decryptedFileContent && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-black/40 border border-red-500/10 rounded-xl space-y-3">
                        <Key className="w-4 h-4 text-red-400 animate-pulse" />
                        <div className="text-[10px] font-bold text-red-400 uppercase">
                          HSM Encrypted File
                        </div>
                        <button
                          onClick={() => onDecryptUploadedFile(selectedFile.id)}
                          disabled={isDecryptingUploadedFile}
                          className="px-4 py-2 bg-red-600/90 text-white rounded-lg font-bold text-[9px] uppercase font-mono"
                        >
                          {isDecryptingUploadedFile
                            ? "Decrypting..."
                            : "Decrypt File"}
                        </button>
                      </div>
                    )}
                  {selectedFile.id &&
                    decryptedFileContent &&
                    decryptedFileContent.id === selectedFile.id && (
                      <div className="flex-1 p-2 bg-black/40 rounded-xl font-mono text-[9px] text-emerald-400 overflow-y-auto">
                        {atob(decryptedFileContent.content)}
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 italic text-[10px]">
                  Select a file
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </motion.div>
);

const BrowserWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="absolute inset-x-2 top-10 md:left-60 md:w-1/2 h-[60%] bg-white border border-white/10 rounded-lg shadow-2xl flex flex-col backdrop-blur-md z-[55] resize overflow-hidden"
  >
    <div className="h-9 bg-[#f0f0f0] border-b border-black/10 flex items-center justify-between px-3 shrink-0 rounded-t-lg text-black">
      <div className="flex items-center gap-3">
        <Chrome className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[10px]">Google Chrome</span>
      </div>
      <X
        onClick={onClose}
        className="w-3.5 h-3.5 text-black/50 cursor-pointer hover:text-red-500"
      />
    </div>
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
      <div className="bg-[#e0e0e0] h-9 flex items-center px-2 gap-2 shrink-0 border-b border-black/10">
        <div className="flex-1 bg-white rounded-md h-6 flex items-center px-2 border border-slate-300 text-[11px] text-slate-700">
          https://example.com
        </div>
      </div>
      <iframe
        src="https://example.com"
        className="w-full h-full border-none bg-white"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  </motion.div>
);

const BurpSuite: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="absolute top-24 left-24 w-1/2 h-1/2 bg-[#2d2d2d] border border-orange-500/30 rounded-lg shadow-2xl flex flex-col backdrop-blur-md"
  >
    <div className="h-9 bg-[#ff6633] border-b border-black/20 flex items-center justify-between px-3 shrink-0 rounded-t-lg">
      <div className="flex items-center gap-3">
        <Search className="w-3.5 h-3.5 text-white" />
        <span className="text-[10px] text-white font-bold">
          Burp Suite Professional
        </span>
      </div>
      <X
        onClick={onClose}
        className="w-3.5 h-3.5 text-white/70 hover:text-red-900"
      />
    </div>
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden text-[10px]">
      <div className="h-8 bg-[#333] border-b border-black/20 flex items-center px-2 gap-4 text-slate-300">
        <span className="text-orange-400 border-b-2 border-orange-400 pb-1">
          Proxy
        </span>
        <span>Target</span>
        <span>Intruder</span>
        <span>Repeater</span>
      </div>
      <div className="flex-1 p-2 font-mono text-[9px] text-emerald-400 bg-black/50">
        GET /api/v1/auth/session HTTP/1.1
        <br />
        Host: target-system.local
        <br />
        <span className="text-slate-500 italic">
          // Awaiting modification...
        </span>
      </div>
    </div>
  </motion.div>
);

const MetasploitWindow: React.FC<{
  history: any[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ history, input, setInput, onSubmit, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="w-full h-full bg-[#0a0a0a] border border-red-500/30 rounded-lg shadow-2xl flex flex-col overflow-hidden"
  >
    <div className="h-9 bg-[#111] border-b border-red-500/20 flex items-center justify-between px-3 shrink-0 rounded-t-lg">
      <div className="flex items-center gap-3">
        <Crosshair className="w-3.5 h-3.5 text-red-500" />
        <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest font-bold">
          Metasploit Operational Bridge
        </span>
      </div>
      <X
        onClick={onClose}
        className="w-3.5 h-3.5 text-white/30 hover:text-red-500"
      />
    </div>
    <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto space-y-1 custom-scrollbar bg-black/60">
      {history.map((log, i) => (
        <div key={i} className="flex flex-col">
          {log.type === "input" && (
            <div className="flex gap-2">
              <span className="text-red-400 font-bold underline">msf6</span>
              <span className="text-white">
                &gt; {log.text.replace("msf6 > ", "")}
              </span>
            </div>
          )}
          {log.type === "banner" && (
            <pre className="text-red-500 font-bold opacity-80">{log.text}</pre>
          )}
          {log.type === "output" && (
            <div className="text-slate-300 py-0.5">{log.text}</div>
          )}
        </div>
      ))}
      <form onSubmit={onSubmit} className="flex gap-2 pt-2 items-center">
        <span className="text-red-400 font-bold underline">msf6</span>
        <span className="text-white">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono"
          autoFocus
        />
        <div className="w-1.5 h-3 bg-red-500 animate-pulse" />
      </form>
    </div>
  </motion.div>
);

const DriverManager: React.FC<{
  onClose: () => void;
  authenticatedFetch: any;
}> = ({ onClose, authenticatedFetch }) => {
  const [status, setStatus] = useState<"idle" | "installing" | "success">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const runReinstall = async () => {
    setStatus("installing");
    setLogs([
      "[*] Initiating kernel driver sweep...",
      "[*] Identifying hardware IDs...",
    ]);
    const steps = [
      { p: 20, l: "[+] Found Wireless: Realtek RTL8821CE" },
      { p: 40, l: "[*] Purging legacy drivers..." },
      { p: 60, l: "[*] Rebuilding dkms modules for 6.6.0-kali1-amd64" },
      { p: 80, l: "[+] Injecting hardened SpartanAI_Security_Core drivers..." },
      { p: 100, l: "[+] Synchronization complete." },
    ];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 600));
      setProgress(step.p);
      setLogs((prev) => [...prev, step.l]);
    }
    try {
      await authenticatedFetch("/api/system/hardware/reinstall", {
        method: "POST",
      });
    } catch (e) {
      /* Fallback for simulated env */
    }
    setStatus("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[380px] bg-[#1a1a1a] border border-cyan-500/30 rounded-lg shadow-2xl flex flex-col backdrop-blur-md z-[55]"
    >
      <div className="h-9 bg-[#222] border-b border-white/5 flex items-center justify-between px-3 shrink-0 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
            Driver Manager
          </span>
        </div>
        <X
          onClick={onClose}
          className="w-3.5 h-3.5 text-white/30 cursor-pointer hover:text-red-500"
        />
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px]">
          <div className="text-slate-500 mb-2 uppercase tracking-widest text-[8px]">
            System Log
          </div>
          <div className="h-32 overflow-y-auto space-y-1 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">
                Ready for maintenance.
              </div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="text-cyan-400/80">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
        {status === "installing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-mono text-cyan-500/50 uppercase">
              <span>Reinstalling Drivers...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {status === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
              Drivers updated and synchronized.
            </span>
          </div>
        ) : (
          <button
            onClick={runReinstall}
            disabled={status === "installing"}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {status === "installing" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Initiate Driver Reinstall
          </button>
        )}
      </div>
    </motion.div>
  );
};

const KeyVault: React.FC<{
  open: boolean;
  onClose: () => void;
  keys: SSHKey[];
  isLoading: boolean;
  onAdd: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onTranslate: (key: SSHKey) => void;
  newLabel: string;
  setNewLabel: (v: string) => void;
  newPublic: string;
  setNewPublic: (v: string) => void;
  isAdding: boolean;
  decryptedKey: any;
}> = ({
  open,
  onClose,
  keys,
  isLoading,
  onAdd,
  onDelete,
  onTranslate,
  newLabel,
  setNewLabel,
  newPublic,
  setNewPublic,
  isAdding,
  decryptedKey,
}) => (
  <AnimatePresence>
    {open && (
      <div className="absolute inset-0 z-[100] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-cyan-500" />
              <div>
                <h3 className="text-white font-bold">SECURE_SSH_VAULT</h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  HSM-Backed Key Management
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <form onSubmit={onAdd} className="space-y-3">
              <input
                type="text"
                placeholder="Identifer"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none"
              />
              <textarea
                placeholder="Paste public key"
                value={newPublic}
                onChange={(e) => setNewPublic(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white/70 font-mono h-24 outline-none resize-none"
              />
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                ENCRYPT_AND_STORE_IN_VAULT
              </button>
            </form>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase">
                Active Keys ({keys.length})
              </h4>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="group p-4 bg-black/40 border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {key.label}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          ID: {key.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onTranslate(key)}
                          className={`p-2 rounded-lg ${decryptedKey?.id === key.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-cyan-400"}`}
                        >
                          {decryptedKey?.id === key.id ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(key.id)}
                          className="p-2 text-slate-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- MAIN GATEWAY SCREEN ---

const GatewayScreen: React.FC<{
  remoteAddress: string;
  setRemoteAddress: (v: string) => void;
  selectedKeyId: string | null;
  setSelectedKeyId: (v: string | null) => void;
  securityToken: string;
  setSecurityToken: (v: string) => void;
  isConnecting: boolean;
  securityStatus: string;
  hsmStatus: any;
  sshKeys: SSHKey[];
  validationError: string | null;
  onConnect: () => void;
  onOpenVault: () => void;
}> = ({
  remoteAddress,
  setRemoteAddress,
  selectedKeyId,
  setSelectedKeyId,
  securityToken,
  setSecurityToken,
  isConnecting,
  securityStatus,
  hsmStatus,
  sshKeys,
  validationError,
  onConnect,
  onOpenVault,
}) => (
  <div className="h-[calc(100vh-160px)] bg-slate-950 flex items-center justify-center rounded-lg border border-slate-800 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1)_0%,_transparent_70%)]" />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl text-center space-y-6 w-full max-w-md relative z-10"
    >
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-700">
        <Monitor
          className={`w-8 h-8 ${isConnecting ? "text-cyan-500 animate-pulse" : "text-slate-500"}`}
        />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">
          SECURE_RDP_GATEWAY
        </h2>
        <div className="flex items-center justify-center gap-2">
          <p className="text-[9px] text-slate-500 font-mono uppercase">
            Encryption: AES-256-GCM
          </p>
          {hsmStatus?.status === "OPERATIONAL" && (
            <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-500 font-bold">
                HSM_FIPS_L3
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase">
            Remote Target Address
          </label>
          <input
            type="text"
            value={remoteAddress}
            onChange={(e) => setRemoteAddress(e.target.value)}
            disabled={isConnecting}
            className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-500 font-mono outline-none"
            placeholder="0.0.0.0"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase">
            SSH Identity Key
          </label>
          <div className="relative">
            <select
              value={selectedKeyId || ""}
              onChange={(e) => setSelectedKeyId(e.target.value || null)}
              disabled={isConnecting}
              className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-500 font-mono outline-none appearance-none cursor-pointer pr-10"
            >
              <option value="">-- USE_GENERIC_IDENTITY --</option>
              {sshKeys.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.label.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Key className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase">
            Access Token
          </label>
          <div className="relative">
            <input
              type="password"
              value={securityToken}
              onChange={(e) => setSecurityToken(e.target.value)}
              disabled={isConnecting}
              className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none"
              placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <ShieldCheck
                className={`w-4 h-4 ${securityToken.length >= 8 ? "text-emerald-500" : "text-slate-700"}`}
              />
            </div>
          </div>
        </div>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] font-bold uppercase bg-red-500/10 p-2 rounded-lg border border-red-500/20"
          >
            {validationError}
          </motion.div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onOpenVault}
          className="flex-1 bg-slate-800 text-slate-300 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Key className="w-4 h-4" />
          <span>KEY_VAULT</span>
        </button>
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={`flex-[2] py-4 rounded-xl font-bold text-white transition-all ${securityStatus === "verified" ? "bg-emerald-600" : "bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]"}`}
        >
          {isConnecting ? (
            <>
              {" "}
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {securityStatus === "handshaking" ? "M-TLS..." : "DH_KEY..."}
              </span>
            </>
          ) : (
            <>
              <MonitorOff className="w-4 h-4" />
              <span>ESTABLISH_LINK</span>
            </>
          )}
        </button>
      </div>
      {securityStatus === "handshaking" && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          className="h-0.5 bg-cyan-500/50 w-32 rounded-full overflow-hidden mx-auto"
        >
          <motion.div
            animate={{ x: [-100, 100] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="h-full w-20 bg-cyan-400"
          />
        </motion.div>
      )}
    </motion.div>
  </div>
);

const DesktopShell: React.FC<{
  currentTime: string;
  onDisconnect: () => void;
  apps: {
    terminal: boolean;
    files: boolean;
    browser: boolean;
    burp: boolean;
    metasploit: boolean;
    drivers: boolean;
  };
  toggleApp: (app: string) => void;
  children: React.ReactNode;
}> = ({ currentTime, onDisconnect, apps, toggleApp, children }) => (
  <div className="h-[calc(100vh-160px)] bg-slate-900 rounded-lg border border-slate-800 flex flex-col relative overflow-hidden shadow-2xl">
    <div className="h-7 bg-black border-b border-white/5 flex items-center justify-between px-3 text-white/70 text-[10px] select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
          <Command className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-bold">Applications</span>
        </div>
        <div className="flex gap-4 text-white/40">
          <span className="hover:text-white cursor-pointer capitalize">
            Places
          </span>
          <span className="hover:text-white cursor-pointer capitalize">
            System
          </span>
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 font-mono flex items-center gap-2">
        <Clock className="w-3 h-3 text-cyan-500/50" />
        {currentTime}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="flex items-center gap-3 border-l border-white/10 pl-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <span className="font-bold uppercase tracking-tighter">root</span>
          </div>
        </div>
        <button onClick={onDisconnect} className="hover:text-red-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="flex-1 bg-[#1a222c] relative overflow-hidden desktop-canvas">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img
          src="https://www.kali.org/images/kali-logo.svg"
          alt="Kali Logo"
          className="w-1/2 grayscale invert"
        />
      </div>
      <div className="p-4 grid grid-cols-1 w-24 gap-4">
        <DesktopIcon
          icon={Folder}
          label="Home"
          color="text-amber-400"
          onClick={() => toggleApp("files")}
          status="connected"
        />
        <DesktopIcon
          icon={Search}
          label="Burp Suite"
          color="text-orange-500"
          onClick={() => toggleApp("burp")}
          status="disconnected"
        />
        <DesktopIcon
          icon={Terminal}
          label="Terminal"
          color="text-slate-300"
          onClick={() => toggleApp("terminal")}
          status="connected"
        />
        <DesktopIcon
          icon={Chrome}
          label="Browser"
          color="text-cyan-400"
          onClick={() => toggleApp("browser")}
          status="connected"
        />
        <DesktopIcon
          icon={Crosshair}
          label="Metasploit"
          color="text-red-500"
          onClick={() => toggleApp("metasploit")}
          status="connected"
        />
        <DesktopIcon
          icon={Settings}
          label="Drivers"
          color="text-slate-400"
          onClick={() => toggleApp("drivers")}
        />
      </div>
      {children}
    </div>
    <div className="h-12 absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl z-50">
      <DockIcon
        icon={Terminal}
        onClick={() => toggleApp("terminal")}
        hasIndicator={apps.terminal}
      />
      <DockIcon
        icon={Folder}
        onClick={() => toggleApp("files")}
        hasIndicator={apps.files}
      />
      <DockIcon
        icon={Chrome}
        onClick={() => toggleApp("browser")}
        hasIndicator={apps.browser}
      />
      <DockIcon
        icon={Search}
        onClick={() => toggleApp("burp")}
        hasIndicator={apps.burp}
      />
      <DockIcon
        icon={Crosshair}
        onClick={() => toggleApp("metasploit")}
        hasIndicator={apps.metasploit}
      />
      <DockIcon
        icon={Settings}
        onClick={() => toggleApp("drivers")}
        hasIndicator={apps.drivers}
      />
    </div>
  </div>
);

// --- MAIN ORCHESTRATOR COMPONENT ---

export const RemoteDesktop: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<
    "none" | "handshaking" | "verified"
  >("none");
  const [remoteAddress, setRemoteAddress] = useState("192.168.12.55");
  const [securityToken, setSecurityToken] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<
    { text: string; type: "command" | "output" | "error" | "security" }[]
  >([
    { text: "Sovereign Operational Gateway initialized.", type: "security" },
    {
      text: "Zero-Trust Protocol: Hardened. Fingerprint: Ghost",
      type: "security",
    },
  ]);
  const appendTerminalLog = useCallback(
    (log: {
      text: string;
      type: "command" | "output" | "error" | "security";
    }) => {
      setTerminalLogs((prev) => [...prev, log].slice(-100));
    },
    [],
  );

  const [terminalInput, setTerminalInput] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showMetasploit, setShowMetasploit] = useState(false);
  const [showBurp, setShowBurp] = useState(false);
  const [isFilesDecrypted, setIsFilesDecrypted] = useState(false);
  const [isDecryptingFiles, setIsDecryptingFiles] = useState(false);
  const [currentDirPath, setCurrentDirPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [credentialsFileDecrypted, setCredentialsFileDecrypted] =
    useState(false);
  const [isDecryptingCredentialsFile, setIsDecryptingCredentialsFile] =
    useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [decryptedFileContent, setDecryptedFileContent] = useState<{
    id: string;
    filename: string;
    content: string;
  } | null>(null);
  const [isDecryptingUploadedFile, setIsDecryptingUploadedFile] =
    useState(false);
  const { user, authenticatedFetch, canWrite, isCreator } = useAuth();

  const handleMountDirectory = async () => {
    setIsDecryptingFiles(true);
    appendTerminalLog({
      text: `[SEC_KERNEL] Mount request received for sector /home/root/`,
      type: "security",
    });
    appendTerminalLog({
      text: `Contacting HSM serial ${hsmStatus?.serial || "FIPS-L3-SPARTANAI_SECURITY_CORE-08A"} for authorization...`,
      type: "security",
    });

    const userId = user?.uid; // Get userId from auth context
    try {
      const mountPayload = JSON.stringify({
        action: "mount_home_partition",
        timestamp: Date.now(),
      });
      const hsmRes = await authenticatedFetch("/api/security/hsm/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: mountPayload, alias: "RDP_SIGN_V1" }),
      });
      const { signature } = await hsmRes.json();

      setTimeout(() => {
        setIsFilesDecrypted(true);
        setIsDecryptingFiles(false);
        appendTerminalLog({
          text: `HSM_MOUNT_SIG: ${signature.slice(0, 16)}...`,
          type: "security",
        });
        appendTerminalLog({
          text: "[SEC_KERNEL] HSM_DECRYPT_EVENT: Sector decrypted successfully (AES-XTS-512).",
          type: "security",
        });
        fetchUploadedFiles(); // Fetch uploaded files after decryption
        appendTerminalLog({
          text: "[SEC_KERNEL] MOUNT_SUCCESS: 4 directory nodes mounted under /home/root/.",
          type: "security",
        });
      }, 1200);
    } catch (err) {
      setTimeout(() => {
        setIsFilesDecrypted(true);
        setIsDecryptingFiles(false);
        appendTerminalLog({
          text: "[SEC_KERNEL] HSM_DECRYPT_EVENT: Sector decrypted successfully (AES-XTS-512) via fallback key.",
          type: "security",
        });
        appendTerminalLog({
          text: "[SEC_KERNEL] MOUNT_SUCCESS: 4 directory nodes mounted under /home/root/.",
          type: "security",
        });
        fetchUploadedFiles(); // Fetch uploaded files even if fallback
      }, 1200);
    }
  };
  const [showBrowser, setShowBrowser] = useState(false);
  const [showDriverManager, setShowDriverManager] = useState(false);
  const [isTerminalPoppedOut, setIsTerminalPoppedOut] = useState(false);
  const [focusedApp, setFocusedApp] = useState<string>("terminal");

  const getZIndex = (app: string) => {
    if (app === "terminal" && isTerminalPoppedOut) {
      return "fixed inset-2 md:inset-4 z-[70]";
    }
    return focusedApp === app ? "z-[60] relative" : "z-[50] relative";
  };

  const [activeApp, setActiveApp] = useState<string>("terminal");

  const handleSetActiveApp = (app: string) => {
    setActiveApp(app);
    if (app === "terminal") setShowTerminal(true);
    if (app === "files") setShowFiles(true);
    if (app === "msf" || app === "metasploit") setShowMetasploit(true);
    if (app === "burp") setShowBurp(true);
    if (app === "browser") setShowBrowser(true);
    if (app === "drivers") setShowDriverManager(true);
  };

  const [metasploitInput, setMetasploitInput] = useState("");
  const [metasploitHistory, setMetasploitHistory] = useState([
    {
      text: "       =[ SpartanAI_Security_Core Metasploit operational bridge v1.0.4  ]",
      type: "banner",
    },
    {
      text: "+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]",
      type: "banner",
    },
    {
      text: "+ -- --=[ 968 payloads - 45 encoders - 11 nops            ]",
      type: "banner",
    },
    {
      text: "+ -- --=[ 9 evasion                                       ]",
      type: "banner",
    },
    { text: "", type: "banner" },
  ]);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  const [hsmStatus, setHsmStatus] = useState<{
    status: string;
    serial: string;
  } | null>(null);

  // SSH Key Management State
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [isKeysLoading, setIsKeysLoading] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newPublicKey, setNewPublicKey] = useState("");
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [viewingDecryptedKey, setViewingDecryptedKey] = useState<{
    id: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchHSM = async () => {
      try {
        const res = await authenticatedFetch("/api/security/hsm/status");
        const data = await res.json();
        setHsmStatus(data);
      } catch (e) {
        console.error("HSM offline");
      }
    };

    fetchHSM();
    fetchKeys(); // Fetch keys once on mount for the connection screen

    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUploadedFiles = async () => {
    if (!user) return;
    try {
      const res = await authenticatedFetch("/api/enclave/files", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch uploaded files");
      const data = await res.json();
      setUploadedFiles(data.files);
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
      appendTerminalLog({
        text: `Error fetching uploaded files: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, [user]);

  const fetchKeys = async () => {
    setIsKeysLoading(true);
    try {
      const res = await authenticatedFetch(`/api/ssh-keys?userId=${user?.uid}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch SSH keys");
      }
      const data = await res.json();
      setSSHKeys(data);
    } catch (e) {
      console.error("Failed to fetch keys");
    } finally {
      setIsKeysLoading(false);
    }
  };

  useEffect(() => {
    if (showKeyManager) {
      fetchKeys();
    }
  }, [showKeyManager]);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel || !newPublicKey) return;
    // ── RBAC: SecOps-Admin or above required for SSH key provisioning ──
    if (!canWrite()) {
      setValidationError(
        "INSUFFICIENT_TIER: SSH key management requires SecOps-Admin or above.",
      );
      return;
    }
    setIsAddingKey(true);
    try {
      // Update to use new API endpoint
      const res = await authenticatedFetch("/api/ssh-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newKeyLabel, publicKey: newPublicKey }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add SSH key");
      }
      setNewKeyLabel("");
      setNewPublicKey("");
      await fetchKeys();
    } catch (e) {
      setValidationError("SSH_KEY_STORAGE_ENCRYPTION_FAILED");
    } finally {
      setIsAddingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    // ── RBAC: Creator (root) only for key deletion ──
    if (!isCreator()) {
      appendTerminalLog({
        text: "RBAC_DENY: Key deletion requires Sovereign Creator tier.",
        type: "error",
      });
      return;
    }
    try {
      const res = await authenticatedFetch(
        `/api/ssh-keys/${id}?userId=${user?.uid}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        throw new Error("Failed to delete SSH key");
      }
      await fetchKeys();
    } catch (e) {
      console.error("Delete failed");
    }
  };

  const handleTranslateKey = async (key: SSHKey) => {
    if (viewingDecryptedKey?.id === key.id) {
      setViewingDecryptedKey(null);
      return;
    }
    try {
      // Update to use new API endpoint
      const res = await authenticatedFetch("/api/ssh-keys/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedKey: key.encryptedKey }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to decrypt SSH key");
      }
      const { decryptedKey: decrypted } = await res.json();
      setViewingDecryptedKey({ id: key.id, text: decrypted });
      appendTerminalLog({
        text: `HSM_DECRYPT_EVENT: User accessed plain-text for identity ${key.label}`,
        type: "security",
      });
    } catch (e) {
      console.error("HSM decryption failed");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      appendTerminalLog({
        text: "Authentication required to upload files.",
        type: "error",
      });
      return;
    }
    // ── RBAC: SecOps-Admin or above required for file uploads to enclave ──
    if (!canWrite()) {
      appendTerminalLog({
        text: "RBAC_DENY: Enclave file upload requires SecOps-Admin or above.",
        type: "error",
      });
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Content = (reader.result as string).split(",")[1];
        const payload = {
          filename: file.name,
          fileContentBase64: base64Content,
          fileSize: file.size,
        };

        const res = await authenticatedFetch("/api/enclave/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "File upload failed");
        }

        appendTerminalLog({
          text: `File '${file.name}' uploaded and encrypted successfully.`,
          type: "security",
        });
        fetchUploadedFiles();
      };
    } catch (err) {
      console.error("File upload error:", err);
      appendTerminalLog({
        text: `File upload failed: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteUploadedFile = async (fileId: string) => {
    if (!user) return;
    // ── RBAC: SecOps-Admin or above required for file deletion ──
    if (!canWrite()) {
      appendTerminalLog({
        text: "RBAC_DENY: Enclave file deletion requires SecOps-Admin or above.",
        type: "error",
      });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this encrypted file?"))
      return;

    try {
      const res = await authenticatedFetch(`/api/enclave/files/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      appendTerminalLog({
        text: `File (ID: ${fileId}) deleted successfully.`,
        type: "security",
      });
      fetchUploadedFiles();
      if (selectedFile?.id === fileId) setSelectedFile(null);
      if (decryptedFileContent?.id === fileId) setDecryptedFileContent(null);
    } catch (err) {
      console.error("File delete error:", err);
      appendTerminalLog({
        text: `File deletion failed: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    }
  };

  const handleDownloadUploadedFile = async (
    fileId: string,
    filename: string,
  ) => {
    if (!user) return;
    try {
      const res = await authenticatedFetch("/api/enclave/files/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error("Failed to decrypt and download file");
      const data = await res.json();
      const byteCharacters = atob(data.fileContentBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/octet-stream" });
      saveAs(blob, filename);
      appendTerminalLog({
        text: `File '${filename}' decrypted and downloaded.`,
        type: "security",
      });
    } catch (err) {
      console.error("File download error:", err);
      appendTerminalLog({
        text: `File download failed: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    }
  };

  // Security Helper: Output Encoding / Sanitization
  const encodeOutput = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const validateInputs = () => {
    // Regex for IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(remoteAddress)) {
      setValidationError("INVALID_REMOTE_IP_FORMAT");
      return false;
    }

    // Security Token validation (simulated 8+ chars)
    if (securityToken.length < 8) {
      setValidationError("SECURITY_TOKEN_INSUFFICIENT_ENTROPY");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleConnect = async () => {
    if (!validateInputs()) return;

    setIsConnecting(true);
    setSecurityStatus("handshaking");

    // 1. Request HSM-backed Session Token (M-TLS Simulation)
    try {
      appendTerminalLog({
        text: `Contacting HSM (Serial: ${hsmStatus?.serial || "..."})...`,
        type: "security",
      });

      const selectedKey = sshKeys.find((k) => k.id === selectedKeyId);
      const sessionData = {
        target: remoteAddress,
        userId: user?.uid, // Include userId in session data
        client: "HEX-CMD-01",
        identity: selectedKey ? selectedKey.label : "GENERIC_ANONYMOUS",
        identityId: selectedKeyId || "NULL",
        timestamp: Date.now(),
      };

      const hsmRes = await authenticatedFetch("/api/security/hsm/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: JSON.stringify(sessionData),
          alias: "RDP_SIGN_V1",
        }),
      });
      const { signature } = await hsmRes.json();

      appendTerminalLog({
        text: `HSM_VALID_SIG: ${signature.slice(0, 16)}...`,
        type: "security",
      });

      // 2. Proof of Possession (PoP) Handshake
      setTimeout(() => {
        setSecurityStatus("verified");
        appendTerminalLog({
          text: `Handshake established with ${remoteAddress}`,
          type: "security",
        });
        setTimeout(() => {
          setIsConnecting(false);
          setIsConnected(true);
        }, 1000);
      }, 1500);
    } catch (err) {
      setValidationError("HSM_COMM_FAILURE_CRYPTO_REQUIRED");
      setIsConnecting(false);
      setSecurityStatus("none");
    }
  };

  const handleDecryptUploadedFile = async (fileId: string) => {
    if (!user) return;
    setIsDecryptingUploadedFile(true);
    setDecryptedFileContent(null);

    try {
      const res = await authenticatedFetch("/api/enclave/files/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error("Failed to decrypt file");
      const data = await res.json();
      setDecryptedFileContent({
        id: fileId,
        filename: data.filename,
        content: data.fileContentBase64,
      });
      appendTerminalLog({
        text: `File '${data.filename}' decrypted successfully.`,
        type: "security",
      });
    } catch (err) {
      console.error("File decryption error:", err);
      appendTerminalLog({
        text: `File decryption failed: ${err instanceof Error ? err.message : String(err)}`,
        type: "error",
      });
    } finally {
      setIsDecryptingUploadedFile(false);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const sanitizedInput = terminalInput.trim();
    appendTerminalLog({ text: sanitizedInput, type: "command" });

    const lowerInput = sanitizedInput.toLowerCase();
    const args = sanitizedInput.split(" ");
    const cmd = args[0].toLowerCase();

    if (
      sanitizedInput.includes("<script>") ||
      sanitizedInput.includes("eval(")
    ) {
      appendTerminalLog({
        text: "SECURITY_ALERT: Malicious payload intercepted and encoded.",
        type: "error",
      });
      appendTerminalLog({
        text: `Encoded Result: ${encodeOutput(sanitizedInput)}`,
        type: "security",
      });
    } else if (cmd === "help" || cmd === "?") {
      setTerminalLogs((prev) => [
        ...prev,
        {
          text: "SpartanAI_Security_Core Secure Shell Terminal v2.5.0\nSupported Commands:\n  help / ?               Display this menu\n  ls                     List files and directories\n  cat <file>             Print the contents of a file\n  decrypt <file>         Decrypt an encrypted file via System HSM\n  mount-hsm              Mount encrypted directory structure via HSM alias\n  clear                  Clear terminal history\n  sysinfo                Print remote system information",
          type: "output",
        },
      ]);
    } else if (cmd === "clear") {
      setTerminalLogs([]);
    } else if (cmd === "sysinfo") {
      appendTerminalLog({
        text: `Computer: TARGET-KALI-X-99\nOS: Kali GNU/Linux Rolling 2026.1\nKernel: 6.6.0-kali1-amd64\nHSM Bound: Yes (Serial: ${hsmStatus?.serial || "FIPS-L3-SPARTANAI_SECURITY_CORE-08A"})\nOperational State: ENCRYPTED_STORAGE_BOUND`,
        type: "output",
      });
    } else if (cmd === "mount-hsm") {
      if (isFilesDecrypted) {
        appendTerminalLog({
          text: "Directory structure already mounted.",
          type: "output",
        });
      } else {
        setIsDecryptingFiles(true);
        appendTerminalLog({
          text:
            "[*] Negotiating session key with HSM serial " +
            (hsmStatus?.serial || "FIPS-L3-SPARTANAI_SECURITY_CORE-08A") +
            "...",
          type: "security",
        });
        setTimeout(() => {
          setIsFilesDecrypted(true);
          setIsDecryptingFiles(false);
          appendTerminalLog({
            text: "[SEC_KERNEL] HSM_DECRYPT_EVENT: Sector decrypted successfully (AES-XTS-512).",
            type: "security",
          });
          appendTerminalLog({
            text: "[SEC_KERNEL] MOUNT_SUCCESS: 4 directory nodes mounted under /home/root/.",
            type: "security",
          });
          appendTerminalLog({
            text: "File system mounted successfully.",
            type: "output",
          });
        }, 1200);
      }
    } else if (cmd === "ls") {
      if (!isFilesDecrypted) {
        appendTerminalLog({
          text: "ls: cannot open directory '.': Directory contents encrypted. Access denied.",
          type: "error",
        });
      } else {
        const fileList = uploadedFiles
          .map(
            (f) =>
              `-rw-r--r--  1 root root  ${f.fileSize} ${new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${new Date(f.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}  ${f.filename}`,
          )
          .join("\n");
        const staticFiles =
          "drwxr-xr-x  2 root root  4096 May 18 19:05  recon_data/\ndrwxr-xr-x  2 root root  4096 May 18 19:05  exploit_payloads/\n-rw-r--r--  1 root root  1228 May 18 19:05  README.txt\n-rw-r--r--  1 root root   512 May 18 19:05  credentials.db.enc";
        appendTerminalLog({
          text: `${fileList}\n${staticFiles}`,
          type: "output",
        });
      }
    } else if (cmd === "cat") {
      if (!isFilesDecrypted) {
        appendTerminalLog({
          text: "cat: directory contents encrypted. Access denied.",
          type: "error",
        });
      } else if (
        uploadedFiles.some(
          (f) => f.filename.toLowerCase() === args[1].toLowerCase(),
        )
      ) {
        const fileToCat = uploadedFiles.find(
          (f) => f.filename.toLowerCase() === args[1].toLowerCase(),
        );
        if (fileToCat) {
          appendTerminalLog({
            text: `File '${fileToCat.filename}' is encrypted. Use 'decrypt ${fileToCat.filename}' to view content.`,
            type: "output",
          });
        } else {
          appendTerminalLog({
            text: `cat: ${args[1]}: No such file or directory.`,
            type: "error",
          });
        }
      } else if (args.length < 2) {
        appendTerminalLog({ text: "usage: cat <filename>", type: "error" });
      } else {
        const targetFileName = args[1].trim();
        if (targetFileName === "README.txt") {
          appendTerminalLog({
            text: "=========================================\nSPARTANAI_SECURITY_CORE SYSTEM - TARGET DESKTOP\n=========================================\n\nIP Target Address: 192.168.12.55\nAuthorized Operator: SPARTANAI_SECURITY_CORE_OPERATOR\n\nActive Nodes detected in subnet:\n- 192.168.12.1   (Gateway Router)\n- 192.168.12.55  (Kali Pentest Node - Local)\n- 192.168.12.102 (Database Master Node)\n\nNOTICE:\nAll operations are recorded to MATRIX_CORE. Log files under recon_data/ are active.",
            type: "output",
          });
        } else if (targetFileName === "credentials.db.enc") {
          if (credentialsFileDecrypted) {
            appendTerminalLog({
              text: '{\n  "db_user": "spartanai_security_core_admin",\n  "db_pass": "SuperSecureSpartanAI2026!",\n  "ssh_root_key_alias": "SPARTANAI_SECURITY_CORE_MAIN_GATEWAY_KEY",\n  "neural_model_salt": "0xDEADBEEF42"\n}',
              type: "output",
            });
          } else {
            appendTerminalLog({
              text: '[ENCRYPTED PAYLOAD - AES-256-GCM]\nRaw: U2FsdGVkX1+Tz1Q5V2K9G6H7m8X8W9A0Q1B2C3D4E5F6==\nUse command "decrypt credentials.db.enc" to decrypt.',
              type: "output",
            });
          }
        } else {
          appendTerminalLog({
            text: `cat: ${targetFileName}: No such file in root directory.`,
            type: "error",
          });
        }
      }
    } else if (cmd === "decrypt") {
      if (
        uploadedFiles.some(
          (f) => f.filename.toLowerCase() === args[1].toLowerCase(),
        )
      ) {
        const fileToDecrypt = uploadedFiles.find(
          (f) => f.filename.toLowerCase() === args[1].toLowerCase(),
        );
        if (fileToDecrypt) {
          appendTerminalLog({
            text: `[*] Sending cryptovariable '${fileToDecrypt.filename}' to HSM for decryption...`,
            type: "security",
          });
          authenticatedFetch("/api/enclave/files/decrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: fileToDecrypt.id }),
          })
            .then((res) => res.json())
            .then((data) => {
              appendTerminalLog({
                text: `Decrypted content of '${fileToDecrypt.filename}':\n${atob(data.fileContentBase64)}`,
                type: "output",
              });
              appendTerminalLog({
                text: `[SEC_KERNEL] HSM_DECRYPT_EVENT: Decryption of '${fileToDecrypt.filename}' successful.`,
                type: "security",
              });
            })
            .catch((err) => {
              appendTerminalLog({
                text: `Decryption failed for '${fileToDecrypt.filename}': ${err.message}`,
                type: "error",
              });
            });
        } else {
          appendTerminalLog({
            text: `decrypt: ${args[1]}: No such file.`,
            type: "error",
          });
        }
      }
      if (!isFilesDecrypted) {
        appendTerminalLog({
          text: "decrypt: directory contents encrypted. Access denied.",
          type: "error",
        });
      } else if (args.length < 2) {
        appendTerminalLog({ text: "usage: decrypt <filename>", type: "error" });
      } else {
        const targetFileName = args[1].trim();
        if (targetFileName === "credentials.db.enc") {
          if (credentialsFileDecrypted) {
            appendTerminalLog({
              text: "File credentials.db.enc is already decrypted.",
              type: "output",
            });
          } else {
            appendTerminalLog({
              text: `[*] Sending cryptovariable credentials.db.enc to HSM [RDP_SIGN_V1]...`,
              type: "security",
            });
            setTimeout(() => {
              setCredentialsFileDecrypted(true);
              appendTerminalLog({
                text: "[SEC_KERNEL] HSM_DECRYPT_EVENT: Decryption of credentials.db.enc successful.",
                type: "security",
              });
              appendTerminalLog({
                text: 'Decrypted content:\n{\n  "db_user": "spartanai_security_core_admin",\n  "db_pass": "SuperSecureSpartanAI2026!",\n  "ssh_root_key_alias": "SPARTANAI_SECURITY_CORE_MAIN_GATEWAY_KEY",\n  "neural_model_salt": "0xDEADBEEF42"\n}',
                type: "output",
              });
            }, 1000);
          }
        } else {
          appendTerminalLog({
            text: `decrypt: ${targetFileName}: No cryptographic context found or file is plain text.`,
            type: "error",
          });
        }
      }
    } else {
      appendTerminalLog({
        text: `bash: ${cmd}: command not found. Type 'help' for available commands.`,
        type: "error",
      });
    }

    setTerminalInput("");
  };

  const handleMetasploitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metasploitInput.trim()) return;

    const cmd = metasploitInput.trim();
    setMetasploitHistory((prev) =>
      [...prev, { text: `msf6 > ${cmd}`, type: "input" }].slice(-100),
    );

    let output = "";
    const lowerCmd = cmd.toLowerCase();
    const updateHist = (log: { text: string; type: string }) => {
      setMetasploitHistory((prev) => [...prev, log].slice(-100));
    };

    if (lowerCmd === "help") {
      output = `Core Commands\n=============\n\n    Command       Description\n    -------       -----------\n    ?             Help menu\n    banner        Display an awesome metasploit banner\n    cd            Change the current working directory\n    color         Toggle color\n    connect       Communicate with a host\n    exit          Exit the console\n    help          Help menu\n    info          Displays information about one or more modules\n    irb           Open an interactive Ruby shell in the current context\n    jobs          Displays and manages jobs\n    kill          Kill a job\n    load          Load a framework plugin\n    quit          Exit the console\n    route         Route traffic through a session\n    save          Saves the active datastores\n    search        Searches module names and descriptions\n    sessions      Dump session listings and display information about sessions\n    set           Sets a context-specific variable to a value\n    show          Displays modules of a given type, or all modules\n    sleep         Do nothing for the specified number of seconds\n    spool         Write console output into a file as well the screen\n    threads       View and manipulate background threads\n    unload        Unload a framework plugin\n    use           Interact with a module by name or search term/index\n    version       Show the framework and console library version numbers`;
    } else if (lowerCmd.startsWith("use ")) {
      const module = lowerCmd.split(" ")[1];
      if (!module) {
        output = `[-] Usage: use <module_path>`;
      } else {
        output = `[*] Using configured payload windows/x64/meterpreter/reverse_tcp`;
        updateHist({ text: output, type: "info" });
        updateHist({
          text: `msf6 exploit(${module.split("/").pop()}) > `,
          type: "prompt",
        });
        setMetasploitInput("");
        return;
      }
    } else if (lowerCmd.startsWith("set ")) {
      const parts = lowerCmd.split(" ");
      if (parts.length >= 3) {
        output = `${parts[1].toUpperCase()} => ${parts[2]}`;
      } else {
        output = `[-] Usage: set <variable> <value>`;
      }
    } else if (lowerCmd === "run" || lowerCmd === "exploit") {
      output = `[*] Started reverse TCP handler on 192.168.1.105:4444 \n[*] 192.168.12.55:445 - Connecting to target for exploitation.\n[+] 192.168.12.55:445 - Connection established for exploitation.\n[+] 192.168.12.55:445 - Target OS selected valid for OS indicated by SMB reply\n[*] 192.168.12.55:445 - CORE raw buffer dump (42 bytes)\n[*] 192.168.12.55:445 - Target arch selected valid for arch indicated by DCE/RPC reply\n[*] 192.168.12.55:445 - Trying exploit with 12 Groom Allocations.\n[*] 192.168.12.55:445 - Sending all but last fragment of exploit packet\n[*] 192.168.12.55:445 - Starting non-paged pool grooming\n[+] 192.168.12.55:445 - Sending SMBv2 buffers\n[+] 192.168.12.55:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.\n[*] 192.168.12.55:445 - Sending final SMBv2 buffers.\n[*] 192.168.12.55:445 - Sending last fragment of exploit packet!\n[*] 192.168.12.55:445 - Receiving response from exploit packet\n[+] 192.168.12.55:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!\n[*] 192.168.12.55:445 - Sending egg to corrupted connection.\n[*] 192.168.12.55:445 - Triggering free of corrupted buffer.\n[*] Sending stage (200262 bytes) to 192.168.12.55\n[*] Meterpreter session 1 opened (192.168.1.105:4444 -> 192.168.12.55:49156)`;
      updateHist({ text: output, type: "success" });
      updateHist({ text: `meterpreter > `, type: "meterpreter" });
      setMetasploitInput("");
      return;
    } else if (lowerCmd === "sysinfo") {
      output = `Computer        : TARGET-WIN-01\nOS              : Windows 10 (10.0 Build 19041).\nArchitecture    : x64\nSystem Language : en_US\nDomain          : WORKGROUP\nLogged On Users : 2\nMeterpreter     : x64/windows`;
    } else if (lowerCmd === "getuid") {
      output = `Server username: NT AUTHORITY\\SYSTEM`;
    } else {
      output = `[-] Unknown command: ${cmd}.`;
    }

    setMetasploitInput("");
  };

  const toggleApp = (app: string) => {
    if (app === "terminal") setShowTerminal((prev) => !prev);
    if (app === "files") setShowFiles((prev) => !prev);
    if (app === "browser") setShowBrowser((prev) => !prev);
    if (app === "burp") setShowBurp((prev) => !prev);
    if (app === "metasploit") setShowMetasploit((prev) => !prev);
    if (app === "drivers") setShowDriverManager((prev) => !prev);
    setFocusedApp(app);
  };

  return (
    <>
      {!isConnected ? (
        <GatewayScreen
          remoteAddress={remoteAddress}
          setRemoteAddress={setRemoteAddress}
          selectedKeyId={selectedKeyId}
          setSelectedKeyId={setSelectedKeyId}
          securityToken={securityToken}
          setSecurityToken={setSecurityToken}
          isConnecting={isConnecting}
          securityStatus={securityStatus}
          hsmStatus={hsmStatus}
          sshKeys={sshKeys}
          validationError={validationError}
          onConnect={handleConnect}
          onOpenVault={() => setShowKeyManager(true)}
        />
      ) : (
        <DesktopShell
          currentTime={currentTime}
          onDisconnect={() => setIsConnected(false)}
          apps={{
            terminal: showTerminal,
            files: showFiles,
            browser: showBrowser,
            burp: showBurp,
            metasploit: showMetasploit,
            drivers: showDriverManager,
          }}
          toggleApp={toggleApp}
        >
          <AnimatePresence>
            {showTerminal && (
              <div
                className={getZIndex("terminal")}
                onClick={() => setFocusedApp("terminal")}
              >
                <TerminalApp
                  logs={terminalLogs}
                  input={terminalInput}
                  setInput={setTerminalInput}
                  onSubmit={handleTerminalSubmit}
                  onClose={() => setShowTerminal(false)}
                  isPoppedOut={isTerminalPoppedOut}
                  setIsPoppedOut={setIsTerminalPoppedOut}
                />
              </div>
            )}
            {showFiles && (
              <div
                className={getZIndex("files")}
                onClick={() => setFocusedApp("files")}
              >
                <FileExplorer
                  isDecrypted={isFilesDecrypted}
                  isDecrypting={isDecryptingFiles}
                  onMount={handleMountDirectory}
                  onClose={() => setShowFiles(false)}
                  currentPath={currentDirPath}
                  setCurrentPath={setCurrentDirPath}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  credentialsDecrypted={credentialsFileDecrypted}
                  isDecryptingCredentials={isDecryptingCredentialsFile}
                  onDecryptCredentials={() => {
                    setIsDecryptingCredentialsFile(true);
                    setTimeout(() => setCredentialsFileDecrypted(true), 1000);
                  }}
                  uploadedFiles={uploadedFiles}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  onUploadFile={handleFileUpload}
                  onDeleteUploadedFile={handleDeleteUploadedFile}
                  onDownloadUploadedFile={handleDownloadUploadedFile}
                  decryptedFileContent={decryptedFileContent}
                  onDecryptUploadedFile={handleDecryptUploadedFile}
                  isDecryptingUploadedFile={isDecryptingUploadedFile}
                />
              </div>
            )}
            {showBrowser && (
              <div
                className={getZIndex("browser")}
                onClick={() => setFocusedApp("browser")}
              >
                <BrowserWindow onClose={() => setShowBrowser(false)} />
              </div>
            )}
            {showBurp && (
              <div
                className={getZIndex("burp")}
                onClick={() => setFocusedApp("burp")}
              >
                <BurpSuite onClose={() => setShowBurp(false)} />
              </div>
            )}
            {showMetasploit && (
              <div
                className={getZIndex("metasploit")}
                onClick={() => setFocusedApp("metasploit")}
              >
                <MetasploitWindow
                  history={metasploitHistory}
                  input={metasploitInput}
                  setInput={setMetasploitInput}
                  onSubmit={handleMetasploitSubmit}
                  onClose={() => setShowMetasploit(false)}
                />
              </div>
            )}
            {showDriverManager && (
              <div
                className={getZIndex("drivers")}
                onClick={() => setFocusedApp("drivers")}
              >
                <DriverManager
                  onClose={() => setShowDriverManager(false)}
                  authenticatedFetch={authenticatedFetch}
                />
              </div>
            )}
          </AnimatePresence>
        </DesktopShell>
      )}

      <KeyVault
        open={showKeyManager}
        onClose={() => setShowKeyManager(false)}
        keys={sshKeys}
        isLoading={isKeysLoading}
        onAdd={handleAddKey}
        onDelete={handleDeleteKey}
        onTranslate={handleTranslateKey}
        newLabel={newKeyLabel}
        setNewLabel={setNewKeyLabel}
        newPublic={newPublicKey}
        setNewPublic={setNewPublicKey}
        isAdding={isAddingKey}
        decryptedKey={viewingDecryptedKey}
      />
    </>
  );
};

const DesktopIcon: React.FC<{
  icon: any;
  label: string;
  color: string;
  onClick?: () => void;
  status?: "connected" | "disconnected";
}> = ({ icon: Icon, label, color, onClick, status }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer active:scale-95 transition-all group relative"
  >
    <div
      className={`p-2 rounded-lg bg-black/20 border border-white/5 shadow-lg group-hover:border-white/20 ${color}`}
    >
      <Icon className="w-6 h-6" />
    </div>
    {status && (
      <div
        className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-black ${status === "connected" ? "bg-emerald-500" : "bg-red-500"}`}
      />
    )}
    <span className="text-[10px] text-white/60 font-medium tracking-tight drop-shadow-md">
      {label}
    </span>
  </div>
);

const DockIcon: React.FC<{
  icon: any;
  onClick?: () => void;
  hasIndicator?: boolean;
}> = ({ icon: Icon, onClick, hasIndicator }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-1 group cursor-pointer relative pt-1"
  >
    <div className="p-2 rounded-xl bg-slate-800/20 hover:bg-slate-700/40 border border-white/5 hover:border-white/20 transition-all">
      <Icon className="w-5 h-5 text-white/50 group-hover:text-white" />
    </div>
    {hasIndicator && (
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
    )}
  </div>
);
