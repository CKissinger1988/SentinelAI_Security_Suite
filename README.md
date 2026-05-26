# SpartanAI AI Sovereign Security Suite (ASOC) v2.5.0 (Server Build)

**The SpartanAI AI Sovereign Security Suite** is a high-performance, autonomous security operations center (ASOC) engineered for professional-grade offensive and defensive missions. This build is hardened for full server deployments with systemd support, zero-trust API boundaries, and a virtualized Hardware Security Module (HSM).

---

## 📖 About the Sovereign Project

SpartanAI represents a paradigm shift in security orchestration. Conventional security platforms treat artificial intelligence as a static assistant or side-panel chatbot. SpartanAI instead positions the AI (**Jarvis**) as the **Root Operator** of the security enclave. Equipped with system interfaces, a virtual Hardware Security Module (HSM), direct Metasploit RPC integration, and a mobile cellular C2 bridge via Android Debug Bridge (ADB), Jarvis is capable of responding to real-time security events in milliseconds—bypassing traditional human-in-the-loop bottlenecks during critical containment phases.

### The Sovereign Philosophy
- **Absolute Privacy**: No telemetry leaves the system unless cryptographically signed by the Master HSM.
- **Clandestine Operation**: Every terminal command and network packet is subject to application-layer encryption and ghost-routing.
- **Autonomous Defense**: The system is designed to identify, stage, and fire countermeasures (via Metasploit) in milliseconds, faster than a human operator could react.

### Architectural Pillars
1. **Neural Core**: Powered by Google Gemini, Jarvis maintains a persistent "Neural Link" via WebSockets, allowing for sub-second latency in voice and data processing.
2. **The Vault**: A persistent, encrypted database layer (`spartanai_security_core_vault.sqlite`) that stores user records, remote node configs, audit logs, and SSH identities.
3. **Mobile Bridge**: A dedicated ADB orchestration layer that allows the AI to manage, extract data from, and provision VPNs onto Android hardware over USB or cellular C2.
4. **Master Admin Entry**: A "Sovereign Mode" login that utilizes WebAuthn (FIDO2) for hardware-key based root authentication, bypassing the standard database.

---

## 📊 The Interactive Holographic Dashboard

The suite features an immersive, cyber-tactical interface styled with glassmorphic aesthetics, neon highlights, and real-time state visualization.

### A. Dynamic Threat-Level Styling
The primary theme color, edge glows, and pulsing animations dynamically react to the system threat level:

| Threat Level | Primary Color | Pulse Speed | Glow Effect | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Low** | `#06b6d4` (Cyan) | `8s` cycle | Subtle, steady | normal operation state |
| **Medium** | `#f59e0b` (Amber) | `4s` cycle | Moderate | warning state, active scans in progress |
| **High / Critical** | `#ef4444` (Red) | `1.5s` cycle | Intense, pulsing | critical breach, active countermeasures |

*Border glow and pulsing animations automatically sync with the selected threat level using keyframe animations on CSS variables.*

### B. Circular SVG Gauges
Three real-time status gauges monitor the system's operational parameters using animated SVG stroke-dasharray properties:
- **Shield Integrity**: Monitors the health and encryption state of the security enclave.
- **Threat Index**: Tracks the aggregate risk score compiled by the IDS scanner.
- **Network Entropy**: Evaluates noise and potential exfiltration anomalies on the network interface.

### C. Holographic Control Hub
Real-time toggle controls allow operator overrides for crucial security protocols:
- **Decoy Matrix (Honeypot)**: Spins up decoy SSH and HTTP services to trap automated network scanners.
- **Intrusion IDS**: Toggles signature-based deep packet inspection.
- **Auto-Countermeasures**: Authorizes Jarvis to autonomously execute exploit payloads against confirmed attackers.
- **Enclave Hardening**: Restricts local file accesses and mandates dual-authorization signatures for key downloads.

### D. Interactive Command Terminal
- **SpartanAI_Security_Core Shell**: An interactive terminal console mapping directly to backend security execution scripts.
- **Supported Shell Commands**:
  - `status`: Runs full system-wide diagnostic checkups.
  - `probe network`: Initiates network discovery and port scans on local segments.
  - `sync hsm`: Synchronizes the virtual HSM key store.
  - `purge vault`: Instantly erases all session tokens and local decrypted caches.

---

## 🛠️ Core Capabilities & Functions

### 1. Jarvis Neural Orchestration
Powered by Google Gemini, **Jarvis** is the central nervous system of the suite.
- **Autonomous Response**: Automatically analyzes IDS telemetry. When threat severity reaches "Critical," Jarvis bypasses authorization to stage counter-exploit proposals and execute defensive protocols.
- **Voice Command Matrix**: Full system control via natural language, from initiating Nmap scans to configuring Metasploit modules.
- **Neural Integrity**: Continuously monitors hardware health, API latency, and neural model drift.

### 2. Sovereign Operational Enclave
A zero-trust management gateway that replaces traditional remote desktop simulations with a hardened node interface.
- **Encrypted Terminal Proxy**: A secure bridge for executing commands on remote assets with optional **Stealth Mode** (secondary-key encryption).
- **AES-256-GCM File System**: Management of encrypted node storage requiring HSM-backed signatures to mount or decrypt data sectors.
- **Multi-Node Provisioning**: Seamlessly switch between production gateways, secure vaults, and threat-lab enclaves.

### 3. Offensive Operations Bridge
- **Metasploit Operational Bridge**: A high-fidelity console integration for staging and firing exploits through an existing MSF infrastructure.
- **Exploit Proposal Engine**: Autonomous identification of vulnerabilities with real-time success probability calculation and one-click deployment.
- **Burp Proxy Interceptor**: Secure web-traffic interception for real-world API auditing and session manipulation.

### 4. Hardware Security Module (HSM)
A virtualized FIPS-140-2 Level 3 module that manages the suite's cryptographic identity.
- **Session Signing**: All operational sessions must be signed by the HSM master key.
- **Vaulted SSH Identities**: Encrypted storage and on-the-fly translation of high-value SSH keys.

---

## 🚀 Installation & Running Local

### Prerequisites
- **Node.js v18+**
- **Playwright** (for E2E verification)
- **Metasploit Framework** (optional, for operational bridge functionality)

### 1. Clone & Initialize
```bash
git clone https://github.com/supreme_operatoringer1988/SpartanAIAI-Security-Suite.git
cd SpartanAIAI-Security-Suite
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root (ensure JWT_SECRET and HSM_MASTER_KEY are strong random values):
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_secret_here
HSM_MASTER_KEY=64_character_hex_string
PORT=3001
```

### 3. Start Development Server
```bash
npm run dev
```
The server runs on **port 3001** (configured to avoid conflict with agent/daemon processes).

### 4. Running Verification E2E Tests
```bash
npx playwright test
```
This runs 4 E2E validation tests:
- Login page validation and authentication token persistence.
- Master Mode WebAuthn authorization simulation.
- Holographic Dashboard gauges, controls, and active elements.
- SpartanAI_Security_Core shell execution logic.

---

## 📸 Interface Screenshots & Preview

A static preview page highlighting all interface screens is included in the project root:
- **Preview Webpage**: [dashboard_preview.html](file:///c:/GitHub/SpartanAI_Security_Core/dashboard_preview.html)
- **Captured Screens**: Located inside the `/screenshots` directory.
  - `1_login_page.png` - Hardened Sovereign Operator login interface.
  - `2_dashboard_low.png` - Dashboard in Low Threat state (Cyan theme).
  - `3_dashboard_medium.png` - Dashboard in Medium Threat state (Amber warning theme).
  - `4_dashboard_critical.png` - Dashboard in Critical Threat state (Red pulsing alarm theme).
  - `5_operational_enclave.png` - Secure file vault and SSH management console.
  - `6_metasploit_framework.png` - Interactive Metasploit RPC Bridge interface.
  - `7_jarvis_models.png` - Model repository and live instance pull manager.

---

## 📂 Engineering Architecture
- `/src/components`: Hardened UI modules (Operational Enclave, Jarvis, SOC Dashboard).
- `/server.ts`: Secure Express gateway, WebSocket authentication logic, HSM orchestration, and persistent SQLite database interaction.
- `/msf-updater.ts`: Autonomous Metasploit synchronization engine for real-time updates.
- `/scripts/capture-screenshots.ts`: Playwright automation script to generate preview materials.
- `/dashboard_preview.html`: Main visual showcase document.
