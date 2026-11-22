import api from "./api";

const assetApi = {
  getAssets: async () => (await api.get("/api/assets")).data,

  /** Combined, optional filters: { status, categoryId, q } */
  filterAssets: async ({ status, categoryId, q } = {}, { signal } = {}) =>
    (await api.get("/api/assets", {
      params: { status: status || undefined, categoryId: categoryId || undefined, q: q || undefined },
      signal,
    })).data,

  getAssetById: async (id) => (await api.get(`/api/assets/${id}`)).data,

  searchAssets: async (query) => (await api.get("/api/assets/search", { params: { query } })).data,

  getAssetsByCategory: async (categoryId) => (await api.get(`/api/assets/category/${categoryId}`)).data,

  getAssetsByStatus: async (status) => (await api.get(`/api/assets/status/${status}`)).data,

  createAsset: async (data) => (await api.post("/api/assets", data)).data,

  updateAsset: async (id, data) => (await api.put(`/api/assets/${id}`, data)).data,

  /** Returns a message: deleted, or retired instead (when the asset has history). */
  deleteAsset: async (id) => (await api.delete(`/api/assets/${id}`)).data,

  retireAsset: async (id, disposalMethod, note) =>
    (await api.put(`/api/assets/${id}/retire`, { disposalMethod, note })).data,

  uploadAssetImage: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post(`/api/assets/${id}/image`, formData)).data;
  },

  getAssetQrCode: async (id) => (await api.get(`/api/assets/${id}/qr-code`, { responseType: "blob" })).data,

  /** A4 PDF sheet of QR labels for the given asset ids. */
  getLabelsPdf: async (ids) =>
    (await api.get("/api/assets/labels/pdf", {
      params: { ids: ids.join(",") },
      responseType: "blob",
    })).data,

  /** Scan page: asset + the actions this user may take. */
  scanByCode: async (assetCode) =>
    (await api.get(`/api/assets/code/${encodeURIComponent(assetCode)}`)).data,

  getTimeline: async (id) => (await api.get(`/api/assets/${id}/timeline`)).data,

  getHealth: async (id) => (await api.get(`/api/assets/${id}/health`)).data,

  getWarrantyExpiring: async (days = 30) =>
    (await api.get("/api/assets/warranty-expiring", { params: { days } })).data,
};

export default assetApi;
