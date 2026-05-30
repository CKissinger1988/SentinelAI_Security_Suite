import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
  Shield,
  RefreshCw,
  Loader2,
  Zap,
  Lock,
  Settings,
  Download,
  MousePointerClick,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const RemoteADB: React.FC = () => {
  const { authenticatedFetch } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pullInputs, setPullInputs] = useState<Record<string, string>>({});
  const [tapInputs, setTapInputs] = useState<
    Record<string, { x: string; y: string }>
  >({});

  const fetchDevices = async () => {
    try {
      const res = await authenticatedFetch("/api/adb/status");
      const data = await res.json();
      setDevices(data.devices || []);
    } catch (err) {
      console.error("Failed to fetch ADB status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [authenticatedFetch]); // Added authenticatedFetch to dependencies

  const toggleWireless = async (deviceId: string) => {
    setActionLoading(deviceId);
    try {
      const res = await authenticatedFetch("/api/adb/enable-wireless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (err) {
      console.error("Wireless transition failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const provisionVPN = async (deviceId: string) => {
    setActionLoading(deviceId + "_vpn");
    const stealthMode =
      localStorage.getItem("spartanai_security_core_stealth_mode") === "true";
    const secondaryKey =
      localStorage.getItem("spartanai_security_core_secondary_key") ||
      "SPARTANAI-SECURITY-CORE-7742-X";

    try {
      const res = await authenticatedFetch("/api/adb/setup-vpn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          secondaryKey: stealthMode ? secondaryKey : undefined,
        }),
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (err) {
      console.error("VPN provisioning failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const pullPackage = async (deviceId: string) => {
    const pkg = pullInputs[deviceId];
    if (!pkg) return;
    setActionLoading(deviceId + "_pull");
    try {
      const res = await authenticatedFetch("/api/adb/pull-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, packageName: pkg }),
      });
      if (res.ok) fetchDevices();
    } catch (err) {
      console.error("Pull package failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const tapCoordinate = async (deviceId: string) => {
    const coords = tapInputs[deviceId];
    if (!coords || !coords.x || !coords.y) return;
    setActionLoading(deviceId + "_tap");
    try {
      const res = await authenticatedFetch("/api/adb/touch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          x: parseInt(coords.x, 10),
          y: parseInt(coords.y, 10),
        }),
      });
      if (res.ok) fetchDevices();
    } catch (err) {
      console.error("Touch failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-cyan-500" />
          <h2 className="text-sm font-mono text-cyan-400 tracking-widest font-bold">
            ADB_NODE_ENCLAVE
          </h2>
        </div>
        <button
          onClick={() => fetchDevices()}
          className="p-2 hover:bg-slate-900 rounded-lg transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white font-mono">
                  {device.model}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-tighter">
                  {device.id}
                </p>
              </div>
              <div
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                  device.authorized
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {device.status}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Package (com.app.name)"
                  className="bg-slate-900 border border-slate-700 rounded text-[10px] px-2 py-1 flex-1 text-slate-300 outline-none focus:border-cyan-500/50"
                  value={pullInputs[device.id] || ""}
                  onChange={(e) =>
                    setPullInputs((prev) => ({
                      ...prev,
                      [device.id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => pullPackage(device.id)}
                  disabled={
                    actionLoading === device.id + "_pull" ||
                    !device.authorized ||
                    !pullInputs[device.id]
                  }
                  className="p-1.5 rounded border bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-400 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="X"
                  className="bg-slate-900 border border-slate-700 rounded text-[10px] px-2 py-1 w-12 text-slate-300 outline-none focus:border-cyan-500/50"
                  value={tapInputs[device.id]?.x || ""}
                  onChange={(e) =>
                    setTapInputs((prev) => ({
                      ...prev,
                      [device.id]: { ...prev[device.id], x: e.target.value },
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Y"
                  className="bg-slate-900 border border-slate-700 rounded text-[10px] px-2 py-1 w-12 text-slate-300 outline-none focus:border-cyan-500/50"
                  value={tapInputs[device.id]?.y || ""}
                  onChange={(e) =>
                    setTapInputs((prev) => ({
                      ...prev,
                      [device.id]: { ...prev[device.id], y: e.target.value },
                    }))
                  }
                />
                <button
                  onClick={() => tapCoordinate(device.id)}
                  disabled={
                    actionLoading === device.id + "_tap" ||
                    !device.authorized ||
                    !tapInputs[device.id]?.x ||
                    !tapInputs[device.id]?.y
                  }
                  className="p-1.5 rounded border bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400 disabled:opacity-50"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-600 font-mono uppercase">
                    Signal Integrity
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-mono text-slate-300">
                      {Math.floor(device.signal)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => provisionVPN(device.id)}
                  disabled={
                    actionLoading === device.id + "_vpn" ||
                    !device.authorized ||
                    device.id.includes(".")
                  }
                  className={`p-1.5 rounded-lg border transition-all ${
                    actionLoading === device.id + "_vpn"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/50"
                  } disabled:opacity-50`}
                  title="Provision Sovereign VPN"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-slate-600 font-mono uppercase mb-1">
                    Wireless_ADB
                  </span>
                  <button
                    onClick={() => toggleWireless(device.id)}
                    disabled={actionLoading === device.id || !device.authorized}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
                      device.id.includes(".")
                        ? "bg-cyan-600"
                        : "bg-slate-800 hover:bg-slate-700"
                    } disabled:opacity-50`}
                  >
                    <motion.div
                      animate={{ x: device.id.includes(".") ? 18 : 2 }}
                      className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
