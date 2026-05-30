import { spawn, execSync } from "child_process";
import * as path from "path";
import * as os from "os";

// --- MSF Auto-Updater ---
// Detects the local Metasploit Framework installation and runs
// `msfupdate` silently on application start. Exposes real-time
// status so the UI can reflect progress without blocking.

export interface MsfUpdateStatus {
  state:
    | "idle"
    | "checking"
    | "updating"
    | "complete"
    | "error"
    | "not_installed";
  message: string;
  log: string[];
  lastUpdated: string | null;
  msfVersion: string | null;
  msfPath: string | null;
  moduleCount: number | null;
}

const status: MsfUpdateStatus = {
  state: "idle",
  message: "Waiting for startup…",
  log: [],
  lastUpdated: null,
  msfVersion: null,
  msfPath: null,
  moduleCount: null,
};

function appendLog(line: string) {
  status.log.push(`[${new Date().toISOString()}] ${line}`);
  // Keep the log buffer bounded
  if (status.log.length > 200) status.log.shift();
}

/**
 * Try to locate the msfconsole binary on the host.
 * Returns the absolute path or null.
 */
function locateMsf(): string | null {
  const isWin = os.platform() === "win32";
  const whichCmd = isWin ? "where" : "which";

  try {
    const result = execSync(`${whichCmd} msfconsole`, {
      timeout: 5000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    // `where` on Windows may return multiple lines; take the first
    const firstLine = result.split(/\r?\n/)[0].trim();
    if (firstLine) return firstLine;
  } catch {
    // Not found via PATH – try common install locations
  }

  const candidates = isWin
    ? [
        "C:\\metasploit-framework\\bin\\msfconsole.bat",
        "C:\\metasploit\\msfconsole.bat",
        path.join(
          process.env.LOCALAPPDATA || "",
          "metasploit-framework",
          "bin",
          "msfconsole.bat",
        ),
      ]
    : [
        "/usr/bin/msfconsole",
        "/opt/metasploit-framework/bin/msfconsole",
        "/usr/share/metasploit-framework/msfconsole",
        path.join(
          os.homedir(),
          ".msf4",
          "..",
          "metasploit-framework",
          "msfconsole",
        ),
      ];

  for (const candidate of candidates) {
    try {
      execSync(`"${candidate}" --version`, {
        timeout: 10000,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return candidate;
    } catch {
      // candidate not found – continue
    }
  }

  return null;
}

/**
 * Detect the msfupdate binary relative to a known msfconsole path.
 */
function locateMsfUpdate(msfConsolePath: string): string | null {
  const dir = path.dirname(msfConsolePath);
  const isWin = os.platform() === "win32";

  const candidates = [
    path.join(dir, isWin ? "msfupdate.bat" : "msfupdate"),
    path.join(dir, "..", "bin", isWin ? "msfupdate.bat" : "msfupdate"),
    // Kali ships it as a standalone command
    isWin ? "" : "/usr/bin/msfupdate",
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      execSync(`"${c}" --help`, {
        timeout: 5000,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return c;
    } catch {
      // not found – continue
    }
  }

  return null;
}

/**
 * Grab the current MSF version string.
 */
function getMsfVersion(msfConsolePath: string): string | null {
  try {
    const raw = execSync(`"${msfConsolePath}" --version`, {
      timeout: 15000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    // e.g. "Framework Version: 6.3.25-dev"
    const match = raw.match(/(\d+\.\d+\.\d+[\w.-]*)/);
    return match ? match[1] : raw.split("\n")[0];
  } catch {
    return null;
  }
}

/**
 * Run `msfupdate` as a background child process.
 * Streams stdout/stderr into the status log in real time.
 */
function runUpdate(msfUpdatePath: string): Promise<void> {
  return new Promise((resolve) => {
    status.state = "updating";
    status.message = "Running msfupdate…";
    appendLog(`Spawning: ${msfUpdatePath}`);

    const child = spawn(msfUpdatePath, [], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      detached: false,
    });

    child.stdout.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
      lines.forEach((l) => {
        appendLog(`[stdout] ${l}`);
        status.message = l;
      });
    });

    child.stderr.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
      lines.forEach((l) => appendLog(`[stderr] ${l}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        status.state = "complete";
        status.message = "MSF update completed successfully.";
        status.lastUpdated = new Date().toISOString();
        appendLog("msfupdate exited with code 0 – success.");
      } else {
        status.state = "error";
        status.message = `msfupdate exited with code ${code}.`;
        appendLog(`msfupdate exited with code ${code}.`);
      }
      resolve();
    });

    child.on("error", (err) => {
      status.state = "error";
      status.message = `Failed to spawn msfupdate: ${err.message}`;
      appendLog(`Spawn error: ${err.message}`);
      resolve();
    });
  });
}

/**
 * Entry point – call once from server startup.
 * Runs entirely in the background; never blocks the Express listener.
 */
export async function startMsfAutoUpdate(): Promise<void> {
  appendLog("MSF auto-update sequence initiated.");

  // 1. Locate msfconsole
  status.state = "checking";
  status.message = "Locating Metasploit Framework…";
  appendLog("Searching for msfconsole on this host…");

  const msfPath = locateMsf();

  if (!msfPath) {
    status.state = "not_installed";
    status.message =
      "Metasploit Framework not found on this host. Skipping update.";
    status.msfPath = null;
    appendLog("msfconsole not found – auto-update skipped.");
    return;
  }

  status.msfPath = msfPath;
  appendLog(`Found msfconsole at: ${msfPath}`);

  // 2. Grab version info
  const version = getMsfVersion(msfPath);
  if (version) {
    status.msfVersion = version;
    appendLog(`Current MSF version: ${version}`);
  }

  // 3. Locate msfupdate
  const msfUpdatePath = locateMsfUpdate(msfPath);

  if (!msfUpdatePath) {
    status.state = "error";
    status.message = "msfupdate binary not found. Manual update required.";
    appendLog("Could not locate msfupdate – aborting auto-update.");
    return;
  }

  appendLog(`Found msfupdate at: ${msfUpdatePath}`);

  // 4. Run the update
  await runUpdate(msfUpdatePath);

  // 5. Refresh version after update
  const newVersion = getMsfVersion(msfPath);
  if (newVersion) {
    status.msfVersion = newVersion;
    appendLog(`Post-update MSF version: ${newVersion}`);
  }
}

/**
 * Returns a snapshot of the current update status (for the API).
 */
export function getMsfUpdateStatus(): MsfUpdateStatus {
  return { ...status, log: [...status.log] };
}
