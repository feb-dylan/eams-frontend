import api from "./api";

const dashboardApi = {
  getAdminDashboard: async () => (await api.get("/api/dashboard/admin")).data,
  getManagerDashboard: async () => (await api.get("/api/dashboard/manager")).data,
  getTechnicianDashboard: async () => (await api.get("/api/dashboard/technician")).data,
  /** The logged-in employee's own dashboard. */
  getEmployeeDashboard: async () => (await api.get("/api/dashboard/employee")).data,
};

export default dashboardApi;
