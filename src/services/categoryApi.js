import api from "./api";

const getCategories = async () => {
  const response = await api.get("/api/categories");
  return response.data;
};

const getCategoryById = async (id) => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

const getAssetsByCategory = async (categoryId) => {
  const response = await api.get(
    `/api/categories/${categoryId}/assets`
  );

  return response.data;
};

const createCategory = async (categoryData) => {
  const response = await api.post(
    "/api/categories",
    categoryData
  );

  return response.data;
};

const updateCategory = async (id, categoryData) => {
  const response = await api.put(
    `/api/categories/${id}`,
    categoryData
  );

  return response.data;
};

const deleteCategory = async (id) => {
  const response = await api.delete(
    `/api/categories/${id}`
  );

  return response.data;
};

export default {
  getCategories,
  getCategoryById,
  getAssetsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};