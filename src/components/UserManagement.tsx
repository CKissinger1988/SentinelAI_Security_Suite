/**
 * UserManagement.tsx
 * NSA Production-Grade User Management Panel — Creator (root) tier ONLY.
 * Mirrors SpartanAI_Hub_Master SUPREME_COMMAND_MANIFESTO tier structure:
 *   SecOps-Admin | Compliance-Auditor | Helpdesk-Operator
 */
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Eye,
  Wrench,
  Crown,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  useAuth,
  UserRole,
  ROLE_DISPLAY,
  ROLE_COLOR,
} from "../contexts/AuthContext";

interface ManagedUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  root: <Crown className="w-3 h-3" />,
  "SecOps-Admin": <Shield className="w-3 h-3" />,
  "Compliance-Auditor": <Eye className="w-3 h-3" />,
  "Helpdesk-Operator": <Wrench className="w-3 h-3" />,
};

const ROLE_CAPABILITIES: Record<UserRole, string> = {
  root: "APEX — Full authority. All write, admin, WebAuthn, threat override.",
  "SecOps-Admin":
    "Full tactical write — patch deploy, config changes, threat ops.",
  "Compliance-Auditor":
    "Read-only + audit report generation. Zero write access.",
  "Helpdesk-Operator": "Network scan only. No config, vault, or write access.",
};

export const UserManagement: React.FC = () => {
  const { authenticatedFetch, isCreator } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] =
    useState<Exclude<UserRole, "root">>("Helpdesk-Operator");
  const [formError, setFormError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (!isCreator()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500/50" />
        <p className="text-red-400 font-mono text-sm uppercase tracking-widest">
          SOVEREIGN ACCESS REQUIRED
        </p>
        <p className="text-slate-600 text-xs font-mono">
          This panel is restricted to the Creator (root) tier.
        </p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (newPassword.length < 12) {
      setFormError(
        "Password must be at least 12 characters (NIST SP 800-63B).",
      );
      return;
    }
    setCreating(true);
    try {
      const res = await authenticatedFetch("/api/admin/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          displayName: newDisplayName,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewEmail("");
        setNewPassword("");
        setNewDisplayName("");
        setNewRole("Helpdesk-Operator");
        setFormVisible(false);
        fetchUsers();
      } else {
        setFormError(data.message || data.error || "Creation failed.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${uid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchUsers();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
            USER_REGISTRY
          </h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
            Sovereign Authority — Tier Provisioning Console
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFormVisible((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/20 transition-colors text-xs font-mono uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            PROVISION OPERATOR
          </button>
        </div>
      </div>

      {/* Tier Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(
          [
            "SecOps-Admin",
            "Compliance-Auditor",
            "Helpdesk-Operator",
          ] as Exclude<UserRole, "root">[]
        ).map((role) => (
          <div
            key={role}
            className="p-3 rounded-xl border"
            style={{
              borderColor: `${ROLE_COLOR[role]}30`,
              backgroundColor: `${ROLE_COLOR[role]}08`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: ROLE_COLOR[role] }}>{ROLE_ICON[role]}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: ROLE_COLOR[role] }}
              >
                {ROLE_DISPLAY[role].replace(/^[^ ]+ /, "")}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              {ROLE_CAPABILITIES[role]}
            </p>
          </div>
        ))}
      </div>

      {/* New User Form */}
      <AnimatePresence>
        {formVisible && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="p-4 bg-cyan-950/10 border border-cyan-900/30 rounded-2xl space-y-4 overflow-hidden"
          >
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Provision New Operator
            </h3>
            {formError && (
              <div className="text-[10px] text-red-400 font-mono bg-red-900/10 border border-red-900/30 p-2 rounded">
                ⚠ {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-700"
                  placeholder="operator@spartan.io"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-700"
                  placeholder="OPERATOR_CALLSIGN"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">
                  Password{" "}
                  <span className="text-slate-600">(min 12 chars)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-700"
                  placeholder="••••••••••••"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">
                  Authority Tier
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as Exclude<UserRole, "root">)
                  }
                  className="w-full bg-black/40 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-700"
                  style={{ color: ROLE_COLOR[newRole] }}
                >
                  <option
                    value="SecOps-Admin"
                    className="text-amber-400 bg-black"
                  >
                    🛡️ SecOps Admin (Full Write)
                  </option>
                  <option
                    value="Compliance-Auditor"
                    className="text-cyan-400 bg-black"
                  >
                    👁️ Compliance Auditor (Read-Only)
                  </option>
                  <option
                    value="Helpdesk-Operator"
                    className="text-green-400 bg-black"
                  >
                    🛠️ Helpdesk Operator (Scan Only)
                  </option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-widest hover:bg-cyan-600/30 transition-colors disabled:opacity-50"
              >
                {creating ? "Provisioning..." : "Provision Operator"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* User List */}
      <div className="bg-black/20 border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/30 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Registered Operators ({users.length})
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 text-slate-600 text-xs font-mono uppercase tracking-widest">
            No operators provisioned. Creator is the sole active principal.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/30">
            {users.map((u) => (
              <motion.div
                key={u.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${ROLE_COLOR[u.role as UserRole]}15`,
                      color: ROLE_COLOR[u.role as UserRole],
                    }}
                  >
                    {ROLE_ICON[u.role as UserRole]}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-white">
                      {u.displayName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {u.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      color: ROLE_COLOR[u.role as UserRole],
                      backgroundColor: `${ROLE_COLOR[u.role as UserRole]}15`,
                    }}
                  >
                    {ROLE_DISPLAY[u.role as UserRole]}
                  </span>
                  {deleteConfirm === u.uid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-red-400 font-mono">
                        Confirm?
                      </span>
                      <button
                        onClick={() => handleDelete(u.uid)}
                        className="text-[9px] font-bold text-red-500 hover:text-red-400 px-2 py-1 bg-red-900/20 border border-red-800/40 rounded"
                      >
                        PURGE
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-[9px] text-slate-500 hover:text-slate-300"
                      >
                        ABORT
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(u.uid)}
                      className="p-1.5 rounded text-slate-600 hover:text-red-500 hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
