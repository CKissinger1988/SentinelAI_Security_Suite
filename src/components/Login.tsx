import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  Lock,
  ArrowRight,
  User,
  AlertCircle,
  Loader2,
  Crown,
  Fingerprint,
} from "lucide-react";
import { motion } from "motion/react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMasterMode, setIsMasterMode] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(
      "spartanai_security_core_operator_id",
    );
    const savedRemember =
      localStorage.getItem("spartanai_security_core_remember_me") === "true";
    if (savedRemember && savedEmail && !isMasterMode) {
      setEmail(savedEmail); // Only set if not in master mode
      setRememberMe(true);
    }
  }, [isMasterMode]);

  const handleWebAuthnLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const optionsRes = await fetch("/api/auth/webauthn/login-options", {
        method: "POST",
      });
      const options = await optionsRes.json();

      const { startAuthentication } = await import("@simplewebauthn/browser");
      const authResp = await startAuthentication(options);

      const verifyRes = await fetch("/api/auth/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResp),
      });

      const verification = await verifyRes.json();
      if (verification.success && verification.token) {
        localStorage.setItem(
          "spartanai_security_core_jwt_token",
          verification.token,
        );
        // Also we probably need to set user to localStorage to keep context consistent
        localStorage.setItem(
          "spartanai_security_core_user",
          JSON.stringify({
            uid: "master-admin-01",
            email: "Creator",
            role: "root",
          }),
        );
        window.location.reload();
      } else {
        throw new Error(verification.error || "Biometric verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Security Key Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleWebAuthnRegister = async () => {
    if (!password) {
      setError("Password required to register a new Security Key.");
      return;
    }
    setIsLoggingIn(true);
    setError(null);
    try {
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "Creator", password }),
      });
      const loginData = await loginRes.json();
      if (!loginData.success)
        throw new Error("Invalid password for registration.");
      const jwtToken = loginData.token;

      const optionsRes = await fetch("/api/admin/webauthn/register-options", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const options = await optionsRes.json();

      const { startRegistration } = await import("@simplewebauthn/browser");
      const authResp = await startRegistration(options);

      const verifyRes = await fetch("/api/admin/webauthn/register-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(authResp),
      });

      const verification = await verifyRes.json();
      if (verification.success) {
        localStorage.setItem("spartanai_security_core_jwt_token", jwtToken);
        localStorage.setItem(
          "spartanai_security_core_user",
          JSON.stringify(loginData.user),
        );
        window.location.reload();
      } else {
        throw new Error(verification.error || "Biometric registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Security Key Registration Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const toggleMasterMode = () => {
    const newMode = !isMasterMode;
    setIsMasterMode(newMode);
    if (newMode) {
      setEmail("Creator");
      setPassword(""); // Password is not used for WebAuthn login
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("spartanai_security_core_operator_id", email);
        // Explicitly set to 'true' or 'false'
        localStorage.setItem("spartanai_security_core_remember_me", "true");
      } else {
        localStorage.removeItem("spartanai_security_core_operator_id");
        localStorage.setItem("spartanai_security_core_remember_me", "false");
      }
    } catch (err: any) {
      const msg = err.message || "Authentication failed. Access denied.";
      if (msg === "INVALID_CREDENTIALS") {
        setError("Authentication failed. Access denied.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative"
      >
        <div
          className={`bg-slate-900/40 border ${isMasterMode ? "border-amber-500/50 shadow-amber-500/10" : "border-slate-800"} rounded-2xl backdrop-blur-xl p-10 shadow-2xl relative transition-all duration-500`}
        >
          <div
            onClick={toggleMasterMode}
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-slate-900 border ${isMasterMode ? "border-amber-500 shadow-amber-500/20" : "border-slate-800"} rounded-2xl shadow-xl cursor-pointer transition-all duration-500 group`}
          >
            {isMasterMode ? (
              <Crown className="w-10 h-10 text-amber-500 animate-pulse" />
            ) : (
              <Shield className="w-10 h-10 text-cyan-500 group-hover:scale-110 transition-transform" />
            )}
          </div>

          <div className="text-center mt-6 mb-10 space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-white italic">
              SPARTANAI<span className="text-cyan-500">_SECURITY_CORE</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Enterprise Security Intelligence Suite
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div
                  className={`h-12 w-full bg-black/40 border ${isMasterMode ? "border-amber-900/50" : "border-slate-800"} rounded-lg flex items-center px-4 gap-3 text-slate-400 group focus-within:border-cyan-500/50 transition-all`}
                >
                  {isMasterMode ? (
                    <Crown className="w-4 h-4 text-amber-500/50" />
                  ) : (
                    <User className="w-4 h-4 text-cyan-500/50" />
                  )}
                  <input
                    type="text"
                    value={email}
                    readOnly={isMasterMode}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATOR_ID (Username)"
                    className="bg-transparent border-none outline-none flex-1 text-xs font-mono text-cyan-100 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div
                  className={`h-12 w-full bg-black/40 border ${isMasterMode ? "border-amber-900/50" : "border-slate-800"} rounded-lg flex items-center px-4 gap-3 text-slate-400 group focus-within:border-cyan-500/50 transition-all`}
                >
                  <Lock
                    className={`w-4 h-4 ${isMasterMode ? "text-amber-500/50" : "text-cyan-500/50"}`}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ACCESS_TOKEN (Password)"
                    className="bg-transparent border-none outline-none flex-1 text-xs font-mono text-cyan-100 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${
                    rememberMe
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-slate-700 group-hover:border-slate-500"
                  }`}
                >
                  {rememberMe && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-black rounded-sm"
                    />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                  Remember Operator ID
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyan-500/50 uppercase cursor-pointer hover:text-cyan-500 transition-colors">
                Forgot Token?
              </span>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-500 text-[10px] font-mono uppercase"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {isMasterMode && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleWebAuthnLogin}
                  className="flex-1 py-3 px-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center gap-1 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                >
                  <Fingerprint className="w-4 h-4" />
                  Authenticate Key
                </button>
                <button
                  type="button"
                  onClick={handleWebAuthnRegister}
                  className="flex-1 py-3 px-2 bg-slate-500/10 border border-slate-500/30 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-500/20 hover:text-slate-300 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Register Key
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full h-12 ${isMasterMode ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" : "bg-cyan-600 hover:bg-cyan-500"} text-white font-bold rounded-lg transition-all flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {isMasterMode
                      ? "AUTHORIZE SOVEREIGN ENTRY"
                      : "INITIALIZE SECURE ACCESS"}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-[9px] text-center text-slate-600 font-mono uppercase leading-relaxed">
            By accessing this interface, you agree to the <br />
            <span className="text-cyan-500/50 underline cursor-pointer">
              Protocol Mastery & Data Sovereignty terms.
            </span>
          </p>
        </div>

        <div className="mt-10 pt-10 border-t border-slate-800/50 flex justify-between items-center text-[8px] font-mono text-slate-700">
          <span>VERSION: 2.5.0-STABLE</span>
          <span>BUILD: 2024.11.18</span>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-xl" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-500/20 rounded-br-xl" />
      </motion.div>
    </div>
  );
};
