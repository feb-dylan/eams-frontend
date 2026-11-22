import api from "./api";

const authApi = {
  register: async (email, password) => (await api.post("/api/auth/register", { email, password })).data,

  login: async (email, password) => (await api.post("/api/auth/login", { email, password })).data,

  /** { id, email, role, employeeId } */
  getMe: async () => (await api.get("/api/auth/me")).data,

  /** Returns { message, token } - the NEW token must be stored (old tokens stop working). */
  changePassword: async (currentPassword, newPassword) =>
    (await api.put("/api/auth/change-password", { currentPassword, newPassword })).data,

  forgotPassword: async (email) => (await api.post("/api/auth/forgot-password", { email })).data,

  /** Used for both "forgot password" and invitation links. */
  resetPassword: async (token, newPassword) =>
    (await api.post("/api/auth/reset-password", { token, newPassword })).data,
};

export default authApi;
