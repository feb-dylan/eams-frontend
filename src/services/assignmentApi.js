import api from "./api";

const assignmentApi = {
  getAssignmentHistory: async () => (await api.get("/api/requests/assignments/history")).data,

  getAssignmentById: async (assignmentId) =>
    (await api.get(`/api/requests/assignments/${assignmentId}`)).data,

  /** Admin receives the returned asset (works for ACTIVE or RETURN_REQUESTED). */
  returnAssignment: async (assignmentId, returnNote) =>
    (await api.put(`/api/requests/assignments/${assignmentId}/return`, { returnNote })).data,
};

export default assignmentApi;
