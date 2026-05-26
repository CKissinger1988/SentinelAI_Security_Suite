# Spec: 4K Holographic Futuristic Dashboard

This document details the architecture and design of the 4K holographic futuristic dashboard upgrade for the SpartanAI Sovereign Security Suite (ASOC).

## 1. Overview & Goals
* **Immersive Holographic Style:** Transition the UI to the "Cyber-Neon Arc" visual aesthetic (semi-translucent glass panels, neon glows, dynamic concentric rings).
* **Dual Dashboard Views:**
  * **Orbital 3D HUD (Primary):** Interactive 3D neural node graph centered on the screen with status dials (Shield, Threat, Entropy) overlaying it.
  * **Tactical Grid HUD (Secondary):** Responsive Bento Grid containing all current security controls, ADB consoles, firewall monitors, and terminal command lines.
* **Threat-Level Sync:** Colors dynamically switch according to threat level (Cyan for Low, Amber for Medium, Red for High/Critical).
* **Real-Time Sync:** Ensure both dashboard layouts operate on the exact same live state container, synchronizing terminal command logs, mobile network packets, alerts, and toggle overrides instantly and in real time without lag or page refreshes.
* **Multi-Resolution Adaptability:** Pixel-perfect display scaling across 4K UHD, 1080p FHD, and 720p HD (legacy support).
* **Backwards Compatibility:** Keep all existing functions, elements, text, and commands intact to ensure existing Playwright tests remain green.

## 2. Architecture & Components
1. **Dashboard Container (`Dashboard.tsx`):**
   * Acts as the state controller. Holds WebSocket connections, diagnostic steps, logs, mobile C2 data, and threat levels.
   * Renders the persistent system status header and the **HUD Sub-Nav Toggle** (`[ ORBITAL HUD ]` / `[ TACTICAL GRID ]`).
   * Renders either the `<OrbitalHUD />` or `<TacticalGrid />` layout, sharing the active state.
2. **3D Telemetry Overlay Canvas (`Background3D.tsx`):**
   * Renders the Three.js particle system.
   * Modulates particle counts, color intensities, and rotation speeds depending on the selected threat level and resolution (300+ particles on 4K, 150 on 1080p, off/static on 720p).
   * Modulates positioning and transparency: fills the center viewport in Orbital mode; scales down and dims to 10% opacity in Tactical Grid mode.
3. **Responsive Grid Layout System (`index.css`):**
   * Employs media breakpoints to adapt grid templates:
     * `@media (min-width: 2560px)` (4K/2K display scaling): Larger gaps, wide Bento layout, larger typography.
     * `@media (min-width: 1280px) and (max-width: 2559px)` (1080p FHD): Standard layout.
     * `@media (max-width: 1279px)` (720p HD / Mobile): Stacked layout, smaller headings, collapsed sidebar.

## 3. Ghost Widget (Clandestine Operations Tracker)
* **Real-time Stealth Sync:** A dedicated "Ghost Operations" widget that reacts dynamically in real-time to the "Stealth Evasion" toggle from the control hub.
* **Clandestine Hops:** Visualizes a real-time animating route tracker (e.g., node proxy hop animations) showing simulated active proxy IP nodes when Stealth Mode is active.
* **HSM Hash Signature:** Integrates with the local storage signature (`spartanai_security_core_secondary_key`) to show the active cryptographic hash signature in real-time.
* **Real-time Traffic Noise:** Displays a small visual canvas or wave showing simulated cover traffic noise ratio (in real time) to hide packet footprints.

## 4. UI State & Design Details
* **Glassmorphism Styling:** All cards will use the standard `.immersive-card` utility updated with `backdrop-filter: blur(12px)` and `background: rgba(10, 15, 24, 0.4)`.
* **Glow Variable System:** The CSS variables (`--theme-color`, `--theme-glow-color`) will be updated to output rich cyber-neon colors matching the threat level.
* **Component Retention:** The following components will remain fully functional and visible:
  * Circular SVG status gauges (Shield, Threat, Entropy)
  * Launch Cloud Desk card
  * Toggle controls (Stealth, HoneyGrid, Auto-Countermeasures, Hardening)
  * SpartanAI_Security_Core Shell (command line + autocomplete terminal)
  * Mobile C2 Sovereign Link panel
  * Neural Firewall panel
  * Remote ADB panel
  * IDS Alerts panel
  * Ghost Widget (new clandestine console)

## 5. Verification Plan
* **TypeScript Compilation:** Run `npx tsc --noEmit` to verify type safety.
* **Playwright E2E Tests:** Execute `npx playwright test` to ensure that all login, WebAuthn, gauge verification, toggle, and terminal command execution checks pass.
