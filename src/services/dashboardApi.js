import api from "./api";

const getAdminDashboard = async () => {
  const response = await api.get("/api/dashboard/admin");
  return response.data;
};

const getManagerDashboard = async () => {
  const response = await api.get("/api/dashboard/manager");
  return response.data;
};

const getTechnicianDashboard = async () => {
  const response = await api.get("/api/dashboard/technician");
  return response.data;
};

const getEmployeeDashboard = async (employeeId) => {
  const response = await api.get(
    `/api/dashboard/employee/${employeeId}`
  );

  return response.data;
};

export default {
  getAdminDashboard,
  getManagerDashboard,
  getTechnicianDashboard,
  getEmployeeDashboard,
};