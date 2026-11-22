import api from "./api";
import { API_BASE_URL } from "../config";

// APIs for the newer features: notifications, insights, AI, users, stock-take audits.

export const notificationApi = {
  list: async (limit = 20) => (await api.get("/api/notifications", { params: { limit } })).data,
  unreadCount: async () => (await api.get("/api/notifications/unread-count")).data.count,
  markRead: async (id) => (await api.put(`/api/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.put("/api/notifications/read-all")).data,
  streamUrl: `${API_BASE_URL}/api/notifications/stream`,
};

export const insightsApi = {
  summary: async () => (await api.get("/api/insights/summary")).data,
  replacementCandidates: async (limit = 10) =>
    (await api.get("/api/insights/replacement-candidates", { params: { limit } })).data,
  assetHealth: async () => (await api.get("/api/insights/asset-health")).data,
  idleAssets: async (days = 90) => (await api.get("/api/insights/idle-assets", { params: { days } })).data,
};

export const assistantApi = {
  /** { assistantEnabled, damageTriageEnabled } */
  status: async () => (await api.get("/api/assistant/status")).data,
  /** { answer, toolsUsed, aiEnabled } */
  ask: async (question) => (await api.post("/api/assistant/ask", { question })).data,
};

export const userApi = {
  list: async () => (await api.get("/api/users")).data,
  technicians: async () => (await api.get("/api/users/technicians")).data,
  /** Returns { user, inviteLink } */
  invite: async (email, role) => (await api.post("/api/users/invite", { email, role })).data,
  update: async (id, changes) => (await api.patch(`/api/users/${id}`, changes)).data,
};

export const auditApi = {
  list: async () => (await api.get("/api/audits")).data,
  create: async (name, location) => (await api.post("/api/audits", { name, location })).data,
  /** Reconciliation: found / misplaced / damaged / missing */
  get: async (id) => (await api.get(`/api/audits/${id}`)).data,
  scan: async (id, scan) => (await api.post(`/api/audits/${id}/scans`, scan)).data,
  close: async (id) => (await api.post(`/api/audits/${id}/close`)).data,
  log: async (limit = 100) => (await api.get("/api/audit-log", { params: { limit } })).data,
};
