import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../services/authApi";
import { setUnauthorizedHandler } from "../services/api";
import { decodeToken, isTokenExpired } from "../utils/jwt";

const AuthContext = createContext(null);

const STORAGE_KEYS = ["token", "email", "role", "userId", "employeeId"];

function readStoredToken() {
  const token = localStorage.getItem("token");
  if (token && isTokenExpired(token)) {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    return null;
  }
  return token;
}

const toNumber = (value) => (value ? Number(value) : null);

/**
 * Login state for the whole app.
 *
 * Only the token is the source of truth. The role is read from the token itself,
 * and userId / employeeId come from GET /api/auth/me - they are used for UI
 * decisions only. The server never trusts ids sent by the client.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(readStoredToken);
  const [email, setEmail] = useState(() => (token ? localStorage.getItem("email") : null));
  const [userId, setUserId] = useState(() => (token ? toNumber(localStorage.getItem("userId")) : null));
  const [employeeId, setEmployeeId] = useState(() =>
    token ? toNumber(localStorage.getItem("employeeId")) : null
  );

  const role = useMemo(() => decodeToken(token)?.role || localStorage.getItem("role") || null, [token]);

  // ---------------------------------------------------------
  const clearSession = useCallback(() => {
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    setToken(null);
    setEmail(null);
    setUserId(null);
    setEmployeeId(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  /** Re-reads who I am (userId + employeeId) from the server. */
  const refreshMe = useCallback(async () => {
    const me = await authApi.getMe();
    setUserId(me.id);
    setEmployeeId(me.employeeId ?? null);
    localStorage.setItem("userId", String(me.id));
    if (me.employeeId) {
      localStorage.setItem("employeeId", String(me.employeeId));
    } else {
      localStorage.removeItem("employeeId");
    }
    return me;
  }, []);

  /** Kept for existing pages: refreshes the employee profile id. */
  const refreshEmployee = useCallback(async () => {
    const me = await refreshMe();
    if (!me.employeeId) {
      const err = new Error("Employee profile not found");
      err.response = { status: 404 };
      throw err;
    }
    return { id: me.employeeId };
  }, [refreshMe]);

  const storeToken = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    const payload = decodeToken(newToken);
    if (payload?.role) localStorage.setItem("role", payload.role);
    setToken(newToken);
  }, []);

  const login = useCallback(
    async (loginEmail, password) => {
      const data = await authApi.login(loginEmail, password);
      storeToken(data.token);
      localStorage.setItem("email", data.email);
      setEmail(data.email);
      try {
        await refreshMe();
      } catch (error) {
        console.warn("Could not load /api/auth/me", error);
      }
      return data;
    },
    [refreshMe, storeToken]
  );

  // Server says the session is no longer valid -> log out once and explain why.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      navigate("/login?expired=1", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, navigate]);

  // Log out automatically when the token's expiry time is reached.
  useEffect(() => {
    if (!token) return undefined;
    const exp = decodeToken(token)?.exp;
    if (!exp) return undefined;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) {
      clearSession();
      return undefined;
    }
    const timer = setTimeout(() => {
      clearSession();
      navigate("/login?expired=1", { replace: true });
    }, Math.min(ms, 2147483000));
    return () => clearTimeout(timer);
  }, [token, clearSession, navigate]);

  // After a page reload, refresh userId / employeeId once.
  useEffect(() => {
    if (token) {
      refreshMe().catch(() => {});
    }
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      role,
      userId,
      employeeId,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshMe,
      refreshEmployee,
      storeToken,
    }),
    [token, email, role, userId, employeeId, login, logout, refreshMe, refreshEmployee, storeToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
