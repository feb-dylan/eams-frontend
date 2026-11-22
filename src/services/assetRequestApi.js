import api from "./api";

// The backend takes "who am I" from the login token, so no user ids are sent.

const assetRequestApi = {
  /** { assetId } OR { categoryId }, plus { reason, priority?, neededBy? } */
  createRequest: async (data) => (await api.post("/api/requests", data)).data,

  getMyRequests: async () => (await api.get("/api/requests/my")).data,

  getMyAssignedAssets: async () => (await api.get("/api/requests/assignments/my")).data,

  requestAssetReturn: async (assignmentId, returnNote) =>
    (await api.put(`/api/requests/assignments/${assignmentId}/return-request`, { returnNote })).data,

  getAllRequests: async () => (await api.get("/api/requests")).data,

  getPendingRequests: async () => (await api.get("/api/requests/pending")).data,

  approveRequest: async (requestId) => (await api.put(`/api/requests/${requestId}/approve`)).data,

  rejectRequest: async (requestId, rejectionReason) =>
    (await api.put(`/api/requests/${requestId}/reject`, { rejectionReason })).data,

  getApprovedRequests: async () => (await api.get("/api/requests/approved")).data,

  getRequestById: async (id) => (await api.get(`/api/requests/${id}`)).data,

  /** For category requests pass the chosen assetId. */
  assignAsset: async (requestId, assetId) =>
    (await api.put(`/api/requests/${requestId}/assign`, null, {
      params: assetId ? { assetId } : undefined,
    })).data,
};

export default assetRequestApi;
