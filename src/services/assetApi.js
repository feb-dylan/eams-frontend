import api from "./api";

const getAssets = async () => {
  const response = await api.get("/api/assets");
  return response.data;
};

const getAssetById = async (id) => {
  const response = await api.get(`/api/assets/${id}`);
  return response.data;
};

const searchAssets = async (query) => {
  const response = await api.get("/api/assets/search", {
    params: {
      query,
    },
  });

  return response.data;
};

const getAssetsByCategory = async (categoryId) => {
  const response = await api.get(
    `/api/assets/category/${categoryId}`
  );

  return response.data;
};

const getAssetsByStatus = async (status) => {
  const response = await api.get(
    `/api/assets/status/${status}`
  );

  return response.data;
};

const createAsset = async (assetData) => {
  const response = await api.post(
    "/api/assets",
    assetData
  );

  return response.data;
};

const updateAsset = async (id, assetData) => {
  const response = await api.put(
    `/api/assets/${id}`,
    assetData
  );

  return response.data;
};

const deleteAsset = async (id) => {
  const response = await api.delete(
    `/api/assets/${id}`
  );

  return response.data;
};

const uploadAssetImage = async (id, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    `/api/assets/${id}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const getAssetQrCode = async (id) => {
  const response = await api.get(
    `/api/assets/${id}/qr-code`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export default {
  getAssets,
  getAssetById,
  searchAssets,
  getAssetsByCategory,
  getAssetsByStatus,
  createAsset,
  updateAsset,
  deleteAsset,
  uploadAssetImage,
  getAssetQrCode,
};