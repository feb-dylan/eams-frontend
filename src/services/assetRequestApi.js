import api from "./api";

// 1. Employee creates a request
const createRequest = async (requestData) => {
  const response = await api.post("/api/requests", requestData);
  return response.data;
};

// 2. Employee views own requests
const getMyRequests = async (employeeId) => {
  const response = await api.get(`/api/requests/my/${employeeId}`);
  return response.data;
};

// 3. Manager views pending requests
const getPendingRequests = async () => {
  const response = await api.get("/api/requests/pending");
  return response.data;
};

// 4. Manager approves request
const approveRequest = async (requestId, managerId) => {
  const response = await api.put(
    `/api/requests/${requestId}/approve/${managerId}`
  );
  return response.data;
};

// 5. Manager rejects request
const rejectRequest = async (requestId, managerId, rejectionReason) => {
  const response = await api.put(
    `/api/requests/${requestId}/reject/${managerId}`,
    { rejectionReason }
  );
  return response.data;
};

// 6. Admin views approved requests
const getApprovedRequests = async () => {
  const response = await api.get("/api/requests/approved");
  return response.data;
};
// Get one request by ID
const getRequestById = async (id) => {
  const response = await api.get(`/api/requests/${id}`);
  return response.data;
};

// 7. Admin assigns asset to approved request
const assignAsset = async (requestId, adminId) => {
  const response = await api.put(
    `/api/requests/${requestId}/assign/${adminId}`
  );
  return response.data;
};

export default {
  createRequest,
  getMyRequests,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getApprovedRequests,
  assignAsset,
  getRequestById, 
};