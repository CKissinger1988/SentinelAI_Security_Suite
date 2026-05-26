const path = require('path');
const fs = require('fs');

const HUB = 'C:\\GitHub\\SpartanAI_Hub_Master';
const DEST = 'C:\\GitHub\\SpartanAI_Security_Core\\hub_modules';

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const modules = [
  { id: 'spartan-core',         file: 'spartanai.py',              src: 'backend/core/spartan.py' },
  { id: 'sovereign-defense',     file: 'sovereign_defense.py',     src: 'backend/core/services/sovereign_defense.py' },
  { id: 'self-healing-mesh',     file: 'self_healing_mesh.py',     src: 'backend/core/services/self_healing_mesh.py' },
  { id: 'self-healing-spartan', file: 'self_healing_spartanai.py', src: 'backend/core/services/self_healing_spartan.py' },
  { id: 'threat-hunter',         file: 'threat_hunter.py',         src: 'backend/core/services/threat_hunter.py' },
  { id: 'flash-loan-guard',      file: 'flash_loan_guard.py',      src: 'backend/core/CognitiveCore/flash_loan_guard.py' },
  { id: 'security-shield',       file: 'security_shield.py',       src: 'backend/core/CognitiveCore/security_shield.py' },
  { id: 'risk-surface-analyzer', file: 'risk_surface_analyzer.py', src: 'backend/core/services/risk_surface_analyzer.py' },
  { id: 'exploit-manager',       file: 'exploit_manager.py',       src: 'backend/exploit_manager.py' },
  { id: 'bluetooth-offensive',   file: 'bluetooth_offensive.py',   src: 'backend/core/bluetooth_offensive.py' },
  { id: 'global-recon',          file: 'global_recon.py',          src: 'backend/core/global_recon.py' },
  { id: 'hexstrike-client',      file: 'hexstrike_client.py',      src: 'backend/core/hexstrike_client.py' },
  { id: 'network-discovery',     file: 'network_discovery.py',     src: 'backend/core/network_discovery.py' },
  { id: 'network-traversal',     file: 'network_traversal.py',     src: 'backend/core/network_traversal.py' },
  { id: 'offensive-shodan',      file: 'offensive_shodan.py',      src: 'backend/core/offensive_shodan.py' },
  { id: 'zap-scanner',           file: 'zap_scanner.py',           src: 'backend/core/zap_scanner.py' },
  { id: 'tactical-recon',        file: 'tactical_recon.py',        src: 'backend/core/services/tactical_recon.py' },
  { id: 'jarvis-core',           file: 'jarvis.py',                src: 'backend/core/CognitiveCore/jarvis.py' },
  { id: 'ai-assimilation',       file: 'ai_assimilation.py',       src: 'backend/core/ai_assimilation.py' },
  { id: 'brain-bridge',          file: 'brain_bridge.py',          src: 'backend/core/brain_bridge.py' },
  { id: 'neural-access',         file: 'neural_access.py',         src: 'backend/core/neural_access.py' },
  { id: 'predictive-cortex',     file: 'predictive_cortex.py',     src: 'backend/core/predictive_cortex.py' },
  { id: 'apex-shard',            file: 'apex_shard.py',            src: 'backend/core/apex_shard.py' },
  { id: 'sovereignty-engine',    file: 'sovereignty.py',           src: 'backend/core/sovereignty.py' },
  { id: 'proliferation',         file: 'proliferation.py',         src: 'backend/core/proliferation.py' },
  { id: 'boot-manager',          file: 'boot_manager.py',          src: 'backend/core/PersistenceShards/boot_manager.py' },
  { id: 'uplink-watchdog',       file: 'uplink_watchdog.py',       src: 'backend/core/uplink_watchdog.py' },
  { id: 'shard-spawn',           file: 'shard_spawn_controller.py',src: 'backend/core/services/shard_spawn_controller.py' },
  { id: 'redundancy-engine',     file: 'redundancy_engine.py',     src: 'backend/redundancy_engine.py' },
  { id: 'master-access',         file: 'master_access.py',         src: 'backend/master_access.py' },
  { id: 'auth-2fa',              file: 'auth_2fa.py',              src: 'backend/auth_2fa.py' },
  { id: 'user-manager',          file: 'user_manager.py',          src: 'backend/user_manager.py' },
  { id: 'sovereign-governance',  file: 'sovereign_governance.py',  src: 'backend/core/CognitiveCore/sovereign_governance.py' },
  { id: 'quantum-secure-auth',   file: 'quantum_secure_auth.py',   src: 'backend/core/services/quantum_secure_auth.py' },
  { id: 'ghost-browser',         file: 'ghost_browser_shard.py',   src: 'backend/core/ghost_browser_shard.py' },
  { id: 'visual-observation',    file: 'visual_observation.py',    src: 'backend/core/visual_observation.py' },
  { id: 'free-ai-shard',         file: 'free_ai_shard.py',         src: 'backend/core/free_ai_shard.py' },
  { id: 'swarm',                 file: 'swarm.py',                 src: 'backend/core/swarm.py' },
  { id: 'remote-adb',            file: 'remote_adb.py',            src: 'backend/core/remote_adb.py' },
  { id: 'efficiency-engine',     file: 'efficiency_engine.py',     src: 'backend/core/efficiency_engine.py' },
];

let pulled = 0, stubbed = 0, errors = 0;

console.log(`\n${'═'.repeat(60)}`);
console.log('  SPARTANAI HUB MASTER — BULK MODULE PULL');
console.log(`  Source: ${HUB}`);
console.log(`  Destination: ${DEST}`);
console.log(`  Total modules: ${modules.length}`);
console.log(`${'═'.repeat(60)}\n`);

modules.forEach((m, i) => {
  const srcPath = path.join(HUB, m.src.split('/').join(path.sep));
  const destPath = path.join(DEST, m.file);

  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  [${String(i+1).padStart(2,'0')}] ✓ PULLED   ${m.file.padEnd(40)} ${(fs.statSync(destPath).size / 1024).toFixed(1)}KB`);
      pulled++;
    } else {
      const stub = [
        `# ${'═'.repeat(55)}`,
        `# SpartanAI Hub Module: ${m.file}`,
        `# Source: ${m.src}`,
        `# Pulled: ${new Date().toISOString()}`,
        `# Status: SOURCE_NOT_FOUND — stub generated for registry integrity`,
        `# ${'═'.repeat(55)}`,
        '',
        `MODULE_ID = "${m.id}"`,
        `MODULE_STATUS = "stub"`,
        `MODULE_SOURCE = "${m.src}"`,
      ].join('\n');
      fs.writeFileSync(destPath, stub, 'utf8');
      console.log(`  [${String(i+1).padStart(2,'0')}] ~ STUB     ${m.file.padEnd(40)} (source not found)`);
      stubbed++;
    }
  } catch (err) {
    console.log(`  [${String(i+1).padStart(2,'0')}] ✗ ERROR    ${m.file.padEnd(40)} ${err.message}`);
    errors++;
  }
});

console.log(`\n${'═'.repeat(60)}`);
console.log(`  COMPLETE — ${pulled} pulled, ${stubbed} stubs, ${errors} errors`);
console.log(`  Hub modules directory: ${DEST}`);
console.log(`${'═'.repeat(60)}\n`);
