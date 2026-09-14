import api from "./api";

const authApi = {
  // =========================================================
  // REGISTER
  // =========================================================
  register: async (email, password) => {
    const response = await api.post("/api/auth/register", {
      email,
      password,
    });

    return response.data;
  },

  // =========================================================
  // LOGIN
  // =========================================================
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  // =========================================================
  // CURRENT LOGGED-IN USER
  // =========================================================
  getMe: async () => {
    const response = await api.get("/api/auth/me");

    return response.data;
  },

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });

    return response.data;
  },
};

export default authApi;