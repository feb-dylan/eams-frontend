import api from "./api";

// Admin views assignment history
const getAssignmentHistory = async () => {
  const response = await api.get(
    "/api/requests/assignments/history"
  );

  return response.data;
};

// Get one assignment
const getAssignmentById = async (assignmentId) => {
  const response = await api.get(
    `/api/requests/assignments/${assignmentId}`
  );

  return response.data;
};

// Admin returns an asset
const returnAssignment = async (
  assignmentId,
  adminId,
  returnNote
) => {
  const response = await api.put(
    `/api/requests/assignments/${assignmentId}/return/${adminId}`,
    { returnNote }
  );

  return response.data;
};

export default {
  getAssignmentHistory,
  getAssignmentById,
  returnAssignment,
};