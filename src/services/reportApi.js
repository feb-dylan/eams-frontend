import api from "./api";

const getAssetReport = async () => {
  const response = await api.get("/api/reports/assets");
  return response.data;
};

const getRequestReport = async () => {
  const response = await api.get("/api/reports/requests");
  return response.data;
};

const getMaintenanceReport = async () => {
  const response = await api.get("/api/reports/maintenance");
  return response.data;
};

const getDamageReport = async () => {
  const response = await api.get("/api/reports/damage");
  return response.data;
};

const getAssignmentReport = async () => {
  const response = await api.get("/api/reports/assignments");
  return response.data;
};

export default {
  getAssetReport,
  getRequestReport,
  getMaintenanceReport,
  getDamageReport,
  getAssignmentReport,
};