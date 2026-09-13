import api from "./api";

const getEmployees = async (page = 0, size = 10) => {
  const response = await api.get("/api/employees", {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

const searchEmployees = async (
  keyword,
  page = 0,
  size = 10
) => {
  const response = await api.get("/api/employees/search", {
    params: {
      keyword,
      page,
      size,
    },
  });

  return response.data;
};

const getEmployeeById = async (id) => {
  const response = await api.get(`/api/employees/${id}`);

  return response.data;
};

const createEmployee = async (employeeData) => {
  const response = await api.post(
    "/api/employees",
    employeeData
  );

  return response.data;
};

const updateEmployee = async (id, employeeData) => {
  const response = await api.put(
    `/api/employees/${id}`,
    employeeData
  );

  return response.data;
};

const deleteEmployee = async (id) => {
  await api.delete(`/api/employees/${id}`);
};

const getCurrentEmployee = async () => {
  const response = await api.get("/api/employees/me");

  return response.data;
};

const createCurrentEmployee = async (employeeData) => {
  const response = await api.post(
    "/api/employees/me",
    employeeData
  );

  return response.data;
};

const updateCurrentEmployee = async (data) => {
  const response = await api.put(
    "/api/employees/me/profile",
    data
  );

  return response.data;
};

// =========================================================
// CURRENT EMPLOYEE — ASSIGNED ASSETS
// =========================================================

const getMyAssignedAssets = async (employeeId) => {
  const response = await api.get(
    `/api/requests/assignments/my/${employeeId}`
  );

  return response.data;
};

// =========================================================
// CURRENT EMPLOYEE — REQUEST ASSET RETURN
// =========================================================

const requestAssetReturn = async (
  assignmentId,
  employeeId,
  returnNote
) => {
  const response = await api.put(
    `/api/requests/assignments/${assignmentId}/return-request/${employeeId}`,
    {
      returnNote,
    }
  );

  return response.data;
};

export default {
  getEmployees,
  searchEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getCurrentEmployee,
  createCurrentEmployee,
  updateCurrentEmployee,
  getMyAssignedAssets,
  requestAssetReturn,
};