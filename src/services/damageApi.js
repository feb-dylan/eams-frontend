import api from "./api";

const createDamageReport = async (damageData) => {
  const response = await api.post(
    "/api/damage",
    damageData
  );

  return response.data;
};

const getMyDamageReports = async (employeeId) => {
  const response = await api.get(
    `/api/damage/my/${employeeId}`
  );

  return response.data;
};

const getAllDamageReports = async () => {
  const response = await api.get("/api/damage");

  return response.data;
};

const getDamageReportById = async (id) => {
  const response = await api.get(
    `/api/damage/${id}`
  );

  return response.data;
};

const getDamageReportsByAsset = async (assetId) => {
  const response = await api.get(
    `/api/damage/asset/${assetId}`
  );

  return response.data;
};

const updateDamageReport = async (
  id,
  damageData
) => {
  const response = await api.put(
    `/api/damage/${id}`,
    damageData
  );

  return response.data;
};

export default {
  createDamageReport,
  getMyDamageReports,
  getAllDamageReports,
  getDamageReportById,
  getDamageReportsByAsset,
  updateDamageReport,
};