import api from "./api";

// 1. Employee creates a request
const createRequest = async (requestData) => {
  const response = await api.post("/api/requests", requestData);
  return response.data;
};

// 2. Employee views own requests
const getMyRequests = async (employeeId) => {
  const response = await api.get(
    `/api/requests/my/${employeeId}`
  );

  return response.data;
};

// 3. Employee views own assigned assets
const getMyAssignedAssets = async (employeeId) => {
  const response = await api.get(
    `/api/requests/assignments/my/${employeeId}`
  );

  return response.data;
};

// 4. Employee requests asset return
const requestAssetReturn = async (
  assignmentId,
  employeeId,
  returnNote
) => {
  const response = await api.put(
    `/api/requests/assignments/${assignmentId}/return-request/${employeeId}`,
    { returnNote }
  );

  return response.data;
};

// 5. Manager views pending requests
const getPendingRequests = async () => {
  const response = await api.get(
    "/api/requests/pending"
  );

  return response.data;
};

// 6. Manager approves request
const approveRequest = async (
  requestId,
  managerId
) => {
  const response = await api.put(
    `/api/requests/${requestId}/approve/${managerId}`
  );

  return response.data;
};

// 7. Manager rejects request
const rejectRequest = async (
  requestId,
  managerId,
  rejectionReason
) => {
  const response = await api.put(
    `/api/requests/${requestId}/reject/${managerId}`,
    { rejectionReason }
  );

  return response.data;
};

// 8. Admin views approved requests
const getApprovedRequests = async () => {
  const response = await api.get(
    "/api/requests/approved"
  );

  return response.data;
};

// 9. Get one request by ID
const getRequestById = async (id) => {
  const response = await api.get(
    `/api/requests/${id}`
  );

  return response.data;
};

// 10. Admin assigns asset to approved request
const assignAsset = async (
  requestId,
  adminId
) => {
  const response = await api.put(
    `/api/requests/${requestId}/assign/${adminId}`
  );

  return response.data;
};

export default {
  createRequest,
  getMyRequests,
  getMyAssignedAssets,
  requestAssetReturn,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getApprovedRequests,
  assignAsset,
  getRequestById,
};
