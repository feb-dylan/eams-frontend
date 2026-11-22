import api from "./api";

const damageApi = {
  /** { assetId, description } - the reporter is the logged-in employee. */
  createDamageReport: async (data) => (await api.post("/api/damage", data)).data,

  /** Up to 5 images. Starts AI triage on the server when AI is configured. */
  uploadPhotos: async (id, files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return (await api.post(`/api/damage/${id}/photos`, formData, {
      onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    })).data;
  },

  runAiTriage: async (id) => (await api.post(`/api/damage/${id}/ai-triage`)).data,

  getMyDamageReports: async () => (await api.get("/api/damage/my")).data,

  getAllDamageReports: async () => (await api.get("/api/damage")).data,

  getDamageReportById: async (id) => (await api.get(`/api/damage/${id}`)).data,

  getDamageReportsByAsset: async (assetId) => (await api.get(`/api/damage/asset/${assetId}`)).data,

  updateDamageReport: async (id, data) => (await api.put(`/api/damage/${id}`, data)).data,
};

export default damageApi;
