# 4K Holographic Futuristic Dashboard Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SOC Dashboard to a 4K-ready, futuristic holographic experience with real-time sync across two interchangeable modes (Orbital 3D HUD & Tactical Bento Grid) and integrate a live Ghost Operations Widget.

**Architecture:** Create sub-components `<OrbitalHUD />` and `<TacticalGrid />` within `Dashboard.tsx` that share the central real-time state. Modulate the Three.js canvas in `Background3D.tsx` to shift scale, opacity, and particle density depending on active mode, threat level, and screen size.

**Tech Stack:** React 19, Tailwind CSS 4, Three.js, React Three Fiber, Framer Motion, Playwright.

---

## Proposed Changes

### Theme & Styling

#### [MODIFY] [index.css](file:///c:/GitHub/SpartanAI_Security_Core/src/index.css)

- Add styling for cyber-neon threat color variables.
- Implement class styles for `.glass-hologram` (`backdrop-filter: blur(12px)`), glow animations, scanlines, and scale-based media queries.

### Components

#### [MODIFY] [Background3D.tsx](file:///c:/GitHub/SpartanAI_Security_Core/src/components/Background3D.tsx)

- Accept props for `threatLevel`, `activeMode`, and `resolution`.
- Shift node opacity to `0.1` and scale down when in `tactical` mode.
- Reduce particle count to 150 on `1080p` and disable 3D animation/particles on `720p` to support legacy hardware.

#### [NEW] [GhostWidget.tsx](file:///c:/GitHub/SpartanAI_Security_Core/src/components/GhostWidget.tsx)

- Displays real-time stealth routing tracker (hop list), AES signature, and an animating canvas noise wave.
- Synchronizes instantly to the "Stealth Evasion" toggle from the dashboard's Control Hub.

#### [NEW] [OrbitalHUD.tsx](file:///c:/GitHub/SpartanAI_Security_Core/src/components/OrbitalHUD.tsx)

- Renders the 3D-centered layout. Overlay status gauges as floating SVG rings over the 3D canvas.
- Place the command shell floating underneath, with compact panels flanking the sides.

#### [NEW] [TacticalGrid.tsx](file:///c:/GitHub/SpartanAI_Security_Core/src/components/TacticalGrid.tsx)

- Renders the high-density Bento Grid layout. Houses all SOC controls, ADB terminals, firewall telemetry, and scrolling alerts.

#### [MODIFY] [Dashboard.tsx](file:///c:/GitHub/SpartanAI_Security_Core/src/components/Dashboard.tsx)

- Add a sub-tab navigation toggle to switch between Orbital HUD and Tactical Grid.
- Share the central real-time state with both sub-components.
- Integrate the new `GhostWidget` into both HUDs.

---

## Tasks

### Task 1: Styling System Expansion

**Files:**

- Modify: `src/index.css`

* [ ] **Step 1: Expand neon themes and responsive breakpoints**
      Add class styles for `.glass-hologram`, `.scanlines`, and custom scaling utilities.

* [ ] **Step 2: Commit**
      `git add src/index.css`
      `git commit -m "style: add glass-hologram and media queries for 4K scaling"`

### Task 2: Background3D Scale & Opacity Modulation

**Files:**

- Modify: `src/components/Background3D.tsx`

* [ ] **Step 1: Add props and scale settings**
      Update `Background3D.tsx` to handle screen resolution and active dashboard mode. Modulate canvas opacity and particle size dynamically.

* [ ] **Step 2: Commit**
      `git add src/components/Background3D.tsx`
      `git commit -m "feat: make 3D background adaptive to mode and threat level"`

### Task 3: Real-Time Ghost Widget

**Files:**

- Create: `src/components/GhostWidget.tsx`

* [ ] **Step 1: Write GhostWidget component**
      Implement the operations tracker with animating node hops and dynamic canvas noise.

* [ ] **Step 2: Commit**
      `git add src/components/GhostWidget.tsx`
      `git commit -m "feat: add real-time Ghost Operations widget"`

### Task 4: Sub-Dashboard Viewports

**Files:**

- Create: `src/components/OrbitalHUD.tsx`
- Create: `src/components/TacticalGrid.tsx`

* [ ] **Step 1: Build TacticalGrid component**
      Consolidate the bento-grid widgets (Gauges, Cloud Desk, Toggles, Shell Terminal, Firewall, ADB, alerts, and Ghost widget) in a responsive grid.

* [ ] **Step 2: Build OrbitalHUD component**
      Establish the circular/orbital HUD. Position the status dials in concentric rings layering above the 3D backdrop, and float the command console underneath.

* [ ] **Step 3: Commit**
      `git add src/components/OrbitalHUD.tsx src/components/TacticalGrid.tsx`
      `git commit -m "feat: create separate viewports for Orbital HUD and Tactical Grid"`

### Task 5: Dashboard Controller Integration

**Files:**

- Modify: `src/components/Dashboard.tsx`

* [ ] **Step 1: Integrate sub-dashboards and toggle**
      Modify `src/components/Dashboard.tsx` to handle the layout swap toggle, rendering either `<OrbitalHUD />` or `<TacticalGrid />` with shared states.

* [ ] **Step 2: Commit**
      `git add src/components/Dashboard.tsx`
      `git commit -m "feat: integrate sub-dashboard switching and shared states"`

### Task 6: Verification & Testing

- [ ] **Step 1: Run compilation check**
      Run: `npx tsc --noEmit`
      Expected: Success, no compilation or TypeScript errors.

- [ ] **Step 2: Run Playwright tests**
      Run: `npx playwright test`
      Expected: All E2E tests pass.

- [ ] **Step 3: Commit**
      `git commit -am "chore: resolve layout adjustments and verify tests pass"`
