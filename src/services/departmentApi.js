import api from "./api";

const getDepartments = async () => {
  const response = await api.get("/api/departments");

  return response.data;
};

const getDepartmentById = async (id) => {
  const response = await api.get(
    `/api/departments/${id}`
  );

  return response.data;
};

const getEmployeesByDepartment = async (
  departmentId,
  page = 0,
  size = 10
) => {
  const response = await api.get(
    `/api/departments/${departmentId}/employees`,
    {
      params: {
        page,
        size,
      },
    }
  );

  return response.data;
};

const createDepartment = async (departmentData) => {
  const response = await api.post(
    "/api/departments",
    departmentData
  );

  return response.data;
};

const updateDepartment = async (
  id,
  departmentData
) => {
  const response = await api.put(
    `/api/departments/${id}`,
    departmentData
  );

  return response.data;
};

const deleteDepartment = async (id) => {
  await api.delete(`/api/departments/${id}`);
};

export default {
  getDepartments,
  getDepartmentById,
  getEmployeesByDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
