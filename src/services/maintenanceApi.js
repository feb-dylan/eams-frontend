import api from "./api";

const getAllMaintenance = async () => {
  const response = await api.get(
    "/api/maintenance"
  );

  return response.data;
};

const getMaintenanceById = async (id) => {
  const response = await api.get(
    `/api/maintenance/${id}`
  );

  return response.data;
};

const getMaintenanceByAsset = async (assetId) => {
  const response = await api.get(
    `/api/maintenance/asset/${assetId}`
  );

  return response.data;
};

const createMaintenance = async (
  maintenanceData
) => {
  const response = await api.post(
    "/api/maintenance",
    maintenanceData
  );

  return response.data;
};

const updateMaintenance = async (
  id,
  maintenanceData
) => {
  const response = await api.put(
    `/api/maintenance/${id}`,
    maintenanceData
  );

  return response.data;
};

export default {
  getAllMaintenance,
  getMaintenanceById,
  getMaintenanceByAsset,
  createMaintenance,
  updateMaintenance,
};