import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// NSA PRODUCTION-GRADE TIER SYSTEM — mirrors server.ts and Hub Master exactly
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = 'root' | 'SecOps-Admin' | 'Compliance-Auditor' | 'Helpdesk-Operator';

export interface SovereignUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
}

export const ROLE_DISPLAY: Record<UserRole, string> = {
  'root': '👑 SOVEREIGN CREATOR',
  'SecOps-Admin': '🛡️ SecOps Admin',
  'Compliance-Auditor': '👁️ Compliance Auditor',
  'Helpdesk-Operator': '🛠️ Helpdesk Operator',
};

export const ROLE_COLOR: Record<UserRole, string> = {
  'root': '#ff3366',
  'SecOps-Admin': '#f59e0b',
  'Compliance-Auditor': '#22d3ee',
  'Helpdesk-Operator': '#4ade80',
};

/** Ordered tier list — lower index = higher authority */
const ORDERED_ROLES: UserRole[] = ['root', 'SecOps-Admin', 'Compliance-Auditor', 'Helpdesk-Operator'];

function roleAtLeast(userRole: UserRole, minRequired: UserRole): boolean {
  return ORDERED_ROLES.indexOf(userRole) <= ORDERED_ROLES.indexOf(minRequired);
}

interface AuthContextType {
  user: SovereignUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  // Role-check helpers
  isCreator: () => boolean;
  isSecOpsAdmin: () => boolean;
  isAuditor: () => boolean;
  isHelpdesk: () => boolean;
  canWrite: () => boolean;   // root or SecOps-Admin
  canAudit: () => boolean;   // root, SecOps-Admin, or Compliance-Auditor
  canScan: () => boolean;    // any authenticated user
  roleAtLeast: (min: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SovereignUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('spartanai_security_core_jwt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('spartanai_security_core_user');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser) as SovereignUser;
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('spartanai_security_core_user');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) {
      const sovereignUser = data.user as SovereignUser;
      setToken(data.token);
      setUser(sovereignUser);
      localStorage.setItem('spartanai_security_core_jwt_token', data.token);
      localStorage.setItem('spartanai_security_core_user', JSON.stringify(sovereignUser));
    } else {
      throw new Error(data.message || data.error || 'Authentication failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spartanai_security_core_jwt_token');
    localStorage.removeItem('spartanai_security_core_user');
  };

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    } as Record<string, string>;

    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        logout();
      }
      return res;
    } catch (err) {
      console.error("Network fetch failed:", err);
      return new Response(JSON.stringify({
        success: false,
        error: "OFFLINE",
        message: "Failed to communicate with host server."
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }, [token]);

  // Role helpers
  const isCreator = () => user?.role === 'root';
  const isSecOpsAdmin = () => user?.role === 'SecOps-Admin' || user?.role === 'root';
  const isAuditor = () => ['root', 'SecOps-Admin', 'Compliance-Auditor'].includes(user?.role || '');
  const isHelpdesk = () => !!user;
  const canWrite = () => ['root', 'SecOps-Admin'].includes(user?.role || '');
  const canAudit = () => ['root', 'SecOps-Admin', 'Compliance-Auditor'].includes(user?.role || '');
  const canScan = () => !!user;
  const roleAtLeastFn = (min: UserRole) => !!user && roleAtLeast(user.role, min);

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout, authenticatedFetch,
      isCreator, isSecOpsAdmin, isAuditor, isHelpdesk,
      canWrite, canAudit, canScan,
      roleAtLeast: roleAtLeastFn,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};