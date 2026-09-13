import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

const getMe = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};
const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put("/api/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
export default {
  login,
  getMe,
  changePassword,
};