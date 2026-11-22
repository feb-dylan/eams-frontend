import axios from "axios";
import { API_BASE_URL } from "../config";

/**
 * The ONE http client for the whole app.
 * - Base URL comes from configuration (VITE_API_URL), never hard-coded in pages.
 * - Adds the login token to every request.
 * - When the server says 401 (session expired / revoked), the app logs out once,
 *   in one place, instead of every page showing "Failed to load".
 */
const api = axios.create({ baseURL: API_BASE_URL });

let onUnauthorized = null;

/** AuthContext registers what to do when the session is no longer valid. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const hadToken = Boolean(error?.config?.headers?.Authorization);
    const isAuthCall = url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (status === 401 && hadToken && !isAuthCall && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
