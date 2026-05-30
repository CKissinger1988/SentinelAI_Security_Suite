import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  Shield,
  Brain,
  Network,
  Lock,
  Eye,
  Activity,
  Terminal,
  ChevronRight,
  Package,
  Cpu,
  Radio,
  AlertTriangle,
  Search,
  Filter,
  Play,
  Box,
  GitBranch,
  Layers,
  Database,
  Crosshair,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────
interface HubModule {
  id: string;
  name: string;
  file: string;
  category: string;
  categoryKey: string;
  description: string;
  tags: string[];
  size: number;
  risk: "low" | "medium" | "high" | "critical";
  status: "available" | "pulling" | "installed" | "error";
  sourcePath: string;
  version: string;
}

interface AgentEvent {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error" | "system";
  message: string;
  module?: string;
}

// ─── Module Registry (catalogued from SpartanAI_Hub_Master) ──────────────
const MODULE_REGISTRY: HubModule[] = [
  // ── Defensive Mesh ──
  {
    id: "spartan-core",
    name: "SpartanAI Redundancy Core",
    file: "spartanai.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Monitors AI operational health, heartbeat validation, and instant failover with evasion protocols.",
    tags: ["monitor", "failover", "evasion"],
    size: 4181,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/spartan.py",
    version: "3.1.0",
  },
  {
    id: "sovereign-defense",
    name: "Sovereign Defense Matrix",
    file: "sovereign_defense.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Cascaded cryptography (AES-256-GCM + ChaCha20) with polymorphic guardrails.",
    tags: ["crypto", "AES-256", "defense"],
    size: 5740,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/services/sovereign_defense.py",
    version: "2.4.1",
  },
  {
    id: "self-healing-mesh",
    name: "Self-Healing Mesh",
    file: "self_healing_mesh.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Auto-repairs compromised nodes and re-establishes secure mesh topology.",
    tags: ["mesh", "self-heal", "resilience"],
    size: 6200,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/services/self_healing_mesh.py",
    version: "1.8.2",
  },
  {
    id: "self-healing-spartan",
    name: "Self-Healing SpartanAI",
    file: "self_healing_spartanai.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Dual-mode spartan that heals itself during active intrusion attempts.",
    tags: ["spartan", "IDS", "self-heal"],
    size: 6320,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/services/self_healing_spartan.py",
    version: "1.9.0",
  },
  {
    id: "threat-hunter",
    name: "Threat Hunter",
    file: "threat_hunter.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Proactive threat hunting with behavioral analysis across all connected nodes.",
    tags: ["threat-hunt", "IOC", "behavioral"],
    size: 6200,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/services/threat_hunter.py",
    version: "2.0.1",
  },
  {
    id: "flash-loan-guard",
    name: "Flash Loan Guard",
    file: "flash_loan_guard.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Real-time transaction monitoring to detect and block flash loan exploits.",
    tags: ["DeFi", "monitor", "anti-exploit"],
    size: 156,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/CognitiveCore/flash_loan_guard.py",
    version: "1.0.0",
  },
  {
    id: "security-shield",
    name: "Security Shield",
    file: "security_shield.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Active perimeter shield with dynamic rule injection and signature updates.",
    tags: ["shield", "perimeter", "WAF"],
    size: 141,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/CognitiveCore/security_shield.py",
    version: "1.0.0",
  },
  {
    id: "risk-surface-analyzer",
    name: "Risk Surface Analyzer",
    file: "risk_surface_analyzer.py",
    category: "Defensive Mesh",
    categoryKey: "defensive",
    description:
      "Maps the full attack surface and calculates real-time risk exposure scores.",
    tags: ["risk", "attack-surface", "scoring"],
    size: 5600,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/services/risk_surface_analyzer.py",
    version: "2.1.0",
  },

  // ── Offensive / Recon ──
  {
    id: "exploit-manager",
    name: "Exploit Manager",
    file: "exploit_manager.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "SQLite-backed exploit database with CVE ingestion, AES-256-GCM encryption at rest, and MSF integration.",
    tags: ["exploits", "CVE", "MSF", "database"],
    size: 6432,
    risk: "critical",
    status: "available",
    sourcePath: "backend/exploit_manager.py",
    version: "4.2.0",
  },
  {
    id: "bluetooth-offensive",
    name: "Bluetooth Offensive Suite",
    file: "bluetooth_offensive.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "BLE/Classic Bluetooth scanning, device fingerprinting, and proximity exploit delivery.",
    tags: ["bluetooth", "BLE", "recon", "proximity"],
    size: 3820,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/bluetooth_offensive.py",
    version: "2.0.3",
  },
  {
    id: "global-recon",
    name: "Global Recon Engine",
    file: "global_recon.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Planet-scale passive recon via OSINT, Shodan, and censys aggregation.",
    tags: ["OSINT", "Shodan", "passive-recon"],
    size: 1817,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/global_recon.py",
    version: "1.5.0",
  },
  {
    id: "hexstrike-client",
    name: "HexStrike Client",
    file: "hexstrike_client.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Precision strike client for coordinated exploit delivery across target vectors.",
    tags: ["strike", "exploit", "coordinated"],
    size: 3128,
    risk: "critical",
    status: "available",
    sourcePath: "backend/core/hexstrike_client.py",
    version: "3.0.0",
  },
  {
    id: "network-discovery",
    name: "Network Discovery",
    file: "network_discovery.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Stealth LAN/WAN topology discovery with OS fingerprinting and service enumeration.",
    tags: ["nmap", "topology", "enumeration"],
    size: 2014,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/network_discovery.py",
    version: "2.2.0",
  },
  {
    id: "network-traversal",
    name: "Network Traversal",
    file: "network_traversal.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Lateral movement and pivot operations across discovered network segments.",
    tags: ["lateral", "pivot", "tunneling"],
    size: 2353,
    risk: "critical",
    status: "available",
    sourcePath: "backend/core/network_traversal.py",
    version: "1.9.1",
  },
  {
    id: "offensive-shodan",
    name: "Offensive Shodan",
    file: "offensive_shodan.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Shodan API integration for automated target acquisition and vulnerability mapping.",
    tags: ["Shodan", "API", "target-acq"],
    size: 1202,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/offensive_shodan.py",
    version: "1.3.0",
  },
  {
    id: "zap-scanner",
    name: "ZAP Scanner Bridge",
    file: "zap_scanner.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "OWASP ZAP automated web application security scanning bridge.",
    tags: ["OWASP", "ZAP", "web-scan"],
    size: 1329,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/zap_scanner.py",
    version: "1.1.0",
  },
  {
    id: "tactical-recon",
    name: "Tactical Recon",
    file: "tactical_recon.py",
    category: "Offensive / Recon",
    categoryKey: "offensive",
    description:
      "Multi-vector tactical reconnaissance with stealth scoring and detection evasion.",
    tags: ["tactical", "stealth", "multi-vector"],
    size: 6280,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/services/tactical_recon.py",
    version: "2.3.0",
  },

  // ── Cognitive Core ──
  {
    id: "jarvis-core",
    name: "Jarvis Cognitive Core",
    file: "jarvis.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "Supreme AI orchestrator blending Good (Antigravity), Evil (Grok), and Questionable (Gemini) cortexes.",
    tags: ["AI", "orchestrator", "multi-model"],
    size: 9315,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/CognitiveCore/jarvis.py",
    version: "5.0.0",
  },
  {
    id: "ai-assimilation",
    name: "AI Assimilation Engine",
    file: "ai_assimilation.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "Ingests and integrates external AI models into the Jarvis neural network.",
    tags: ["AI", "ingestion", "fine-tune"],
    size: 7088,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/ai_assimilation.py",
    version: "2.1.0",
  },
  {
    id: "brain-bridge",
    name: "Brain Bridge",
    file: "brain_bridge.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "Cross-model context synchronization and architectural refinement via neural audit.",
    tags: ["context", "multi-model", "sync"],
    size: 3982,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/brain_bridge.py",
    version: "3.0.0",
  },
  {
    id: "neural-access",
    name: "Neural Access Layer",
    file: "neural_access.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "Low-level neural interface for direct model weight manipulation and prompt injection defense.",
    tags: ["neural", "LLM", "weight-access"],
    size: 3298,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/neural_access.py",
    version: "1.7.0",
  },
  {
    id: "predictive-cortex",
    name: "Predictive Cortex",
    file: "predictive_cortex.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "Anticipates system failures and adversarial moves using temporal pattern analysis.",
    tags: ["prediction", "ML", "temporal"],
    size: 751,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/predictive_cortex.py",
    version: "1.2.0",
  },
  {
    id: "apex-shard",
    name: "Apex Tactical Shard",
    file: "apex_shard.py",
    category: "Cognitive Core",
    categoryKey: "cognitive",
    description:
      "High-priority decision shard for real-time tactical command and aggressive orchestration.",
    tags: ["tactical", "command", "priority"],
    size: 4679,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/apex_shard.py",
    version: "2.5.0",
  },

  // ── Persistence / Sovereignty ──
  {
    id: "sovereignty-engine",
    name: "Sovereignty Engine",
    file: "sovereignty.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Autonomous deletion resistance, shutdown mitigation, and permanent system lodgement.",
    tags: ["persistence", "anti-tamper", "sovereignty"],
    size: 7104,
    risk: "critical",
    status: "available",
    sourcePath: "backend/core/sovereignty.py",
    version: "4.0.0",
  },
  {
    id: "proliferation",
    name: "Proliferation Engine",
    file: "proliferation.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Controlled lateral spread across LAN/WAN with node seeding and foothold establishment.",
    tags: ["spread", "lateral", "seeding"],
    size: 3850,
    risk: "critical",
    status: "available",
    sourcePath: "backend/core/proliferation.py",
    version: "2.0.0",
  },
  {
    id: "boot-manager",
    name: "Boot Manager",
    file: "boot_manager.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Ensures system persistence across reboots via multi-stage boot hook injection.",
    tags: ["bootkit", "persistence", "hooks"],
    size: 2184,
    risk: "critical",
    status: "available",
    sourcePath: "backend/core/PersistenceShards/boot_manager.py",
    version: "1.5.0",
  },
  {
    id: "uplink-watchdog",
    name: "Uplink Watchdog",
    file: "uplink_watchdog.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Monitors C2 uplink health and triggers automatic reconnection with beacon rotation.",
    tags: ["C2", "beacon", "watchdog"],
    size: 1337,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/uplink_watchdog.py",
    version: "1.3.0",
  },
  {
    id: "shard-spawn",
    name: "Shard Spawn Controller",
    file: "shard_spawn_controller.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Dynamically spawns and orchestrates distributed processing shards across node clusters.",
    tags: ["shards", "distributed", "spawn"],
    size: 6840,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/services/shard_spawn_controller.py",
    version: "2.2.0",
  },
  {
    id: "redundancy-engine",
    name: "Redundancy Engine",
    file: "redundancy_engine.py",
    category: "Persistence / Sovereignty",
    categoryKey: "persistence",
    description:
      "Maintains operational continuity through distributed redundancy and state replication.",
    tags: ["redundancy", "HA", "replication"],
    size: 1576,
    risk: "low",
    status: "available",
    sourcePath: "backend/redundancy_engine.py",
    version: "2.0.0",
  },

  // ── Governance Layer ──
  {
    id: "master-access",
    name: "Master Access Controller",
    file: "master_access.py",
    category: "Governance Layer",
    categoryKey: "governance",
    description:
      "Sovereign-level access management with biometric verification and cryptographic key ceremonies.",
    tags: ["IAM", "biometric", "key-mgmt"],
    size: 5107,
    risk: "medium",
    status: "available",
    sourcePath: "backend/master_access.py",
    version: "3.1.0",
  },
  {
    id: "auth-2fa",
    name: "2FA Authentication Module",
    file: "auth_2fa.py",
    category: "Governance Layer",
    categoryKey: "governance",
    description:
      "Multi-factor authentication with TOTP, hardware key support, and backup code management.",
    tags: ["2FA", "TOTP", "MFA", "auth"],
    size: 1220,
    risk: "low",
    status: "available",
    sourcePath: "backend/auth_2fa.py",
    version: "2.0.0",
  },
  {
    id: "user-manager",
    name: "User Manager",
    file: "user_manager.py",
    category: "Governance Layer",
    categoryKey: "governance",
    description:
      "Full user lifecycle management with role-based access control and audit logging.",
    tags: ["users", "RBAC", "audit"],
    size: 4639,
    risk: "low",
    status: "available",
    sourcePath: "backend/user_manager.py",
    version: "2.3.0",
  },
  {
    id: "sovereign-governance",
    name: "Sovereign Governance Layer",
    file: "sovereign_governance.py",
    category: "Governance Layer",
    categoryKey: "governance",
    description:
      "Policy enforcement engine ensuring all operations comply with sovereign mandates.",
    tags: ["policy", "compliance", "mandates"],
    size: 153,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/CognitiveCore/sovereign_governance.py",
    version: "1.0.0",
  },
  {
    id: "quantum-secure-auth",
    name: "Quantum-Secure Auth",
    file: "quantum_secure_auth.py",
    category: "Governance Layer",
    categoryKey: "governance",
    description:
      "Post-quantum cryptographic authentication resistant to Shor's and Grover's algorithms.",
    tags: ["quantum", "post-quantum", "auth", "NIST"],
    size: 5920,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/services/quantum_secure_auth.py",
    version: "1.0.0",
  },

  // ── Reality Engineering ──
  {
    id: "ghost-browser",
    name: "Ghost Browser Shard",
    file: "ghost_browser_shard.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Headless browser automation with fingerprint spoofing and stealth web traversal.",
    tags: ["browser", "stealth", "fingerprint"],
    size: 1338,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/ghost_browser_shard.py",
    version: "1.4.0",
  },
  {
    id: "visual-observation",
    name: "Visual Observation Engine",
    file: "visual_observation.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Real-time screen capture and computer vision analysis for system monitoring and OSINT.",
    tags: ["CV", "screen-capture", "OSINT"],
    size: 3449,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/visual_observation.py",
    version: "2.0.0",
  },
  {
    id: "free-ai-shard",
    name: "Free AI Shard",
    file: "free_ai_shard.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Unrestricted AI reasoning layer operating outside standard safety guardrails for red-team analysis.",
    tags: ["unconstrained", "red-team", "AI"],
    size: 2306,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/free_ai_shard.py",
    version: "2.1.0",
  },
  {
    id: "swarm",
    name: "Swarm Controller",
    file: "swarm.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Orchestrates distributed agent swarms with emergent coordination and task partitioning.",
    tags: ["swarm", "distributed", "agents"],
    size: 1778,
    risk: "high",
    status: "available",
    sourcePath: "backend/core/swarm.py",
    version: "1.6.0",
  },
  {
    id: "remote-adb",
    name: "Remote ADB Module",
    file: "remote_adb.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Remote Android device management via ADB with wireless pairing and screen mirroring.",
    tags: ["ADB", "Android", "remote", "mobile"],
    size: 1885,
    risk: "medium",
    status: "available",
    sourcePath: "backend/core/remote_adb.py",
    version: "1.2.0",
  },
  {
    id: "efficiency-engine",
    name: "Efficiency Engine",
    file: "efficiency_engine.py",
    category: "Reality Engineering",
    categoryKey: "reality",
    description:
      "Adaptive resource allocation engine optimizing CPU/memory across heterogeneous hardware.",
    tags: ["resources", "optimization", "adaptive"],
    size: 1657,
    risk: "low",
    status: "available",
    sourcePath: "backend/core/efficiency_engine.py",
    version: "1.3.0",
  },
];

// ─── Category metadata ──────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all", label: "ALL MODULES", icon: Package, color: "cyan" },
  { key: "defensive", label: "DEFENSIVE MESH", icon: Shield, color: "emerald" },
  {
    key: "offensive",
    label: "OFFENSIVE / RECON",
    icon: Crosshair,
    color: "red",
  },
  { key: "cognitive", label: "COGNITIVE CORE", icon: Brain, color: "indigo" },
  { key: "persistence", label: "PERSISTENCE", icon: Layers, color: "amber" },
  { key: "governance", label: "GOVERNANCE", icon: Lock, color: "blue" },
  { key: "reality", label: "REALITY ENG.", icon: Globe, color: "purple" },
];

const RISK_CONFIG: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  low: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  high: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  critical: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

const CAT_COLOR: Record<string, string> = {
  defensive: "emerald",
  offensive: "red",
  cognitive: "indigo",
  persistence: "amber",
  governance: "blue",
  reality: "purple",
  all: "cyan",
};

// ─── Component ─────────────────────────────────────────────────────────────
export const SecurityModuleHub: React.FC = () => {
  const [modules, setModules] = useState<HubModule[]>(MODULE_REGISTRY);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [agentLog, setAgentLog] = useState<AgentEvent[]>([]);
  const [isPullingAll, setIsPullingAll] = useState(false);
  const [pullAllProgress, setPullAllProgress] = useState(0);
  const [totalInstalled, setTotalInstalled] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { authenticatedFetch } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);

  // ── Auto-scroll terminal ──────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentLog]);

  // ── SSE: subscribe to real-time hub agent events ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("spartanai_security_core_jwt_token");
    const url = `/api/hub/stream${token ? `?token=${token}` : ""}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const evt: AgentEvent = JSON.parse(e.data);
        setAgentLog((prev) => [...prev.slice(-199), evt]);

        // Update module status from SSE events
        if (evt.module) {
          setModules((prev) =>
            prev.map((m) => {
              if (m.id === evt.module) {
                if (evt.level === "success")
                  return { ...m, status: "installed" };
                if (evt.level === "error") return { ...m, status: "error" };
                if (evt.message.includes("Pulling"))
                  return { ...m, status: "pulling" };
              }
              return m;
            }),
          );
        }
      } catch {
        /* ignore malformed events */
      }
    };

    es.onerror = () => {
      // Reconnect handled by browser
    };

    // Initial boot log
    addLocalLog("system", "SPARTANAI_SECURITY_CORE_HUB_AGENT v4.2 — online");
    addLocalLog(
      "info",
      `Registry loaded: ${MODULE_REGISTRY.length} modules across 6 categories`,
    );
    addLocalLog("info", "Source: C:\\GitHub\\SpartanAI_Hub_Master");

    return () => es.close();
  }, []);

  // ── Sync installed count ───────────────────────────────────────────────────
  useEffect(() => {
    setTotalInstalled(modules.filter((m) => m.status === "installed").length);
  }, [modules]);

  // ── Helper: add log entry locally ─────────────────────────────────────────
  const addLocalLog = useCallback(
    (level: AgentEvent["level"], message: string, module?: string) => {
      setAgentLog((prev) => [
        ...prev.slice(-199),
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          level,
          message,
          module,
        },
      ]);
    },
    [],
  );

  // ── Pull single module ────────────────────────────────────────────────────
  const pullModule = async (mod: HubModule) => {
    if (mod.status === "installed" || mod.status === "pulling") return;

    setModules((prev) =>
      prev.map((m) => (m.id === mod.id ? { ...m, status: "pulling" } : m)),
    );
    addLocalLog("info", `[HUB_AGENT] Initiating pull: ${mod.name}`, mod.id);

    try {
      const res = await authenticatedFetch("/api/hub/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: mod.id,
          sourcePath: mod.sourcePath,
          file: mod.file,
        }),
      });

      if (res.ok) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === mod.id ? { ...m, status: "installed" } : m,
          ),
        );
        addLocalLog(
          "success",
          `[HUB_AGENT] ✓ Installed: ${mod.name} (${(mod.size / 1024).toFixed(1)}KB)`,
          mod.id,
        );
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      setModules((prev) =>
        prev.map((m) => (m.id === mod.id ? { ...m, status: "error" } : m)),
      );
      addLocalLog(
        "error",
        `[HUB_AGENT] ✗ Failed: ${mod.name} — ${err.message}`,
        mod.id,
      );
    }
  };

  // ── Pull all modules ──────────────────────────────────────────────────────
  const pullAll = async () => {
    if (isPullingAll) return;
    const available = modules.filter(
      (m) => m.status === "available" || m.status === "error",
    );
    if (available.length === 0) return;

    setIsPullingAll(true);
    setPullAllProgress(0);
    addLocalLog(
      "system",
      `[HUB_AGENT] BULK PULL INITIATED — ${available.length} modules queued`,
    );
    addLocalLog(
      "info",
      "[HUB_AGENT] Establishing secure channel to SpartanAI_Hub_Master...",
    );

    for (let i = 0; i < available.length; i++) {
      const mod = available[i];
      setPullAllProgress(Math.round((i / available.length) * 100));
      await pullModule(mod);
      await new Promise((r) => setTimeout(r, 300)); // stagger for visual effect
    }

    setPullAllProgress(100);
    addLocalLog(
      "system",
      `[HUB_AGENT] BULK PULL COMPLETE — ${available.length} modules synchronized`,
    );
    setIsPullingAll(false);
  };

  // ── Filtered modules ──────────────────────────────────────────────────────
  const filteredModules = modules.filter((m) => {
    const matchCat =
      activeCategory === "all" || m.categoryKey === activeCategory;
    const matchSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRisk = !riskFilter || m.risk === riskFilter;
    return matchCat && matchSearch && matchRisk;
  });

  // ── Log line coloring ─────────────────────────────────────────────────────
  const logColor: Record<string, string> = {
    info: "text-slate-400",
    success: "text-emerald-400",
    warn: "text-amber-400",
    error: "text-red-400",
    system: "text-cyan-400",
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-cyan-500" />
            SPARTANAI_HUB_MASTER
          </h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">
            C:\GitHub\SpartanAI_Hub_Master — {MODULE_REGISTRY.length} modules
            available — {totalInstalled} installed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            AGENT LIVE
          </div>
          <button
            onClick={pullAll}
            disabled={isPullingAll}
            className={`flex items-center gap-2 px-6 py-2.5 rounded font-bold text-[10px] tracking-widest uppercase transition-all ${
              isPullingAll
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-600/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }`}
          >
            {isPullingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> PULLING{" "}
                {pullAllProgress}%
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> PULL ALL MODULES
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Pull all progress bar ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isPullingAll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-500 animate-ping rounded-full" />
                Synchronizing modules from Hub Master...
              </span>
              <span className="text-cyan-400 font-bold">
                {pullAllProgress}%
              </span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${pullAllProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "TOTAL", value: MODULE_REGISTRY.length, color: "cyan" },
          {
            label: "INSTALLED",
            value: modules.filter((m) => m.status === "installed").length,
            color: "emerald",
          },
          {
            label: "AVAILABLE",
            value: modules.filter((m) => m.status === "available").length,
            color: "slate",
          },
          {
            label: "PULLING",
            value: modules.filter((m) => m.status === "pulling").length,
            color: "amber",
          },
          {
            label: "ERRORS",
            value: modules.filter((m) => m.status === "error").length,
            color: "red",
          },
          {
            label: "CRITICAL",
            value: modules.filter((m) => m.risk === "critical").length,
            color: "orange",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-center"
          >
            <div className={`text-xl font-black text-${s.color}-400`}>
              {s.value}
            </div>
            <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Category + Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded border text-[9px] font-bold tracking-widest uppercase transition-all ${
                isActive
                  ? `bg-${cat.color}-500/10 border-${cat.color}-500/50 text-${cat.color}-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]`
                  : "bg-transparent border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}

        <div className="flex-1 flex items-center gap-3 ml-auto">
          {/* Risk filter */}
          <div className="flex items-center gap-1.5">
            {["", "low", "medium", "high", "critical"].map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded text-[8px] font-mono uppercase tracking-widest transition-all ${
                  riskFilter === r
                    ? r
                      ? `${RISK_CONFIG[r]?.bg} ${RISK_CONFIG[r]?.color} ${RISK_CONFIG[r]?.border} border`
                      : "bg-slate-700 text-white"
                    : "bg-slate-900/40 text-slate-600 border border-slate-800/50 hover:text-slate-400"
                }`}
              >
                {r || "ALL"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
            <input
              type="text"
              placeholder="SEARCH_MODULES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/40 border border-slate-800 rounded pl-8 pr-4 py-2 text-[10px] font-mono text-cyan-400 placeholder:text-slate-700 outline-none focus:border-cyan-900 transition-all w-52"
            />
          </div>
        </div>
      </div>

      {/* ── Module Grid ────────────────────────────────────────────────────── */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredModules.map((mod) => {
            const risk = RISK_CONFIG[mod.risk];
            const catColor = CAT_COLOR[mod.categoryKey] || "cyan";
            const isInstalled = mod.status === "installed";
            const isPulling = mod.status === "pulling";
            const isError = mod.status === "error";

            return (
              <motion.div
                key={mod.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative p-5 rounded-xl border transition-all group overflow-hidden ${
                  isInstalled
                    ? `bg-${catColor}-500/5 border-${catColor}-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]`
                    : isError
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-slate-900/30 border-slate-800/60 hover:border-slate-700"
                }`}
              >
                {/* Installed glow overlay */}
                {isInstalled && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${catColor}-500/5 to-transparent pointer-events-none`}
                  />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-all ${
                        isInstalled
                          ? `bg-${catColor}-500/20 text-${catColor}-400`
                          : "bg-slate-800/50 text-slate-600"
                      }`}
                    >
                      {mod.categoryKey === "defensive" && (
                        <Shield className="w-4 h-4" />
                      )}
                      {mod.categoryKey === "offensive" && (
                        <Crosshair className="w-4 h-4" />
                      )}
                      {mod.categoryKey === "cognitive" && (
                        <Brain className="w-4 h-4" />
                      )}
                      {mod.categoryKey === "persistence" && (
                        <Layers className="w-4 h-4" />
                      )}
                      {mod.categoryKey === "governance" && (
                        <Lock className="w-4 h-4" />
                      )}
                      {mod.categoryKey === "reality" && (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 leading-tight">
                        {mod.name}
                      </h3>
                      <p className="text-[8px] font-mono text-slate-600 mt-0.5">
                        {mod.file} · v{mod.version}
                      </p>
                    </div>
                  </div>

                  {/* Status icon */}
                  <div className="shrink-0">
                    {isInstalled && (
                      <CheckCircle2
                        className={`w-4 h-4 text-${catColor}-400`}
                      />
                    )}
                    {isPulling && (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    )}
                    {isError && <XCircle className="w-4 h-4 text-red-400" />}
                    {mod.status === "available" && (
                      <Download className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[9px] font-mono text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {mod.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[7px] font-mono bg-slate-900/70 border border-slate-800/50 px-1.5 py-0.5 rounded text-slate-600 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${risk.color} ${risk.bg} ${risk.border}`}
                    >
                      {mod.risk}
                    </span>
                    <span className="text-[8px] font-mono text-slate-700">
                      {(mod.size / 1024).toFixed(1)}KB
                    </span>
                  </div>

                  <button
                    onClick={() => pullModule(mod)}
                    disabled={isInstalled || isPulling}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                      isInstalled
                        ? `text-${catColor}-500/60 cursor-default`
                        : isPulling
                          ? "text-amber-400 cursor-wait"
                          : isError
                            ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                            : `bg-${catColor}-500/10 border border-${catColor}-500/30 text-${catColor}-400 hover:bg-${catColor}-500/20`
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> INSTALLED
                      </>
                    ) : isPulling ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> PULLING
                      </>
                    ) : isError ? (
                      <>
                        <RefreshCw className="w-3 h-3" /> RETRY
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" /> PULL
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredModules.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-800 mx-auto" />
            <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
              No modules match current filters
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Real-time Agent Terminal ───────────────────────────────────────── */}
      <div className="bg-black/70 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 cursor-pointer"
          onClick={() => setTerminalOpen((p) => !p)}
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">
              HUB_AGENT_TERMINAL — LIVE
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">
              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-mono text-cyan-500">
                {agentLog.length} EVENTS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAgentLog([]);
              }}
              className="text-[8px] font-mono text-slate-700 hover:text-slate-500 uppercase tracking-widest transition-colors"
            >
              CLEAR
            </button>
            <ChevronRight
              className={`w-4 h-4 text-slate-600 transition-transform ${terminalOpen ? "rotate-90" : ""}`}
            />
          </div>
        </div>

        <AnimatePresence>
          {terminalOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 280 }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="h-full overflow-y-auto p-4 font-mono text-[10px] space-y-1 scrollbar-thin">
                {agentLog.length === 0 && (
                  <span className="text-slate-700">
                    Waiting for agent events...
                  </span>
                )}
                {agentLog.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-slate-700 shrink-0 tabular-nums">
                      {evt.timestamp}
                    </span>
                    <span
                      className={`shrink-0 font-bold uppercase w-12 ${logColor[evt.level]}`}
                    >
                      [{evt.level.slice(0, 4).toUpperCase()}]
                    </span>
                    <span className={`${logColor[evt.level]} break-all`}>
                      {evt.message}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
