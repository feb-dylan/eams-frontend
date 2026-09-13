import { createContext, useContext, useState } from "react";
import authApi from "../services/authApi";
import employeeApi from "../services/employeeApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const [userId, setUserId] = useState(
    localStorage.getItem("userId")
      ? Number(localStorage.getItem("userId"))
      : null
  );

  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employeeId")
      ? Number(localStorage.getItem("employeeId"))
      : null
  );

  const login = async (email, password) => {
    const data = await authApi.login(email, password);

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);

    setToken(data.token);
    setEmail(data.email);
    setRole(data.role);

    // 1. Get user id (works for ALL roles)
    try {
      const me = await authApi.getMe();
      localStorage.setItem("userId", String(me.id));
      setUserId(me.id);
    } catch (error) {
      console.error("Failed to fetch /api/auth/me", error);
    }

    // 2. Get employee id (only meaningful for EMPLOYEE role)
    if (data.role === "EMPLOYEE") {
      try {
        const employee = await employeeApi.getCurrentEmployee();
        localStorage.setItem("employeeId", String(employee.id));
        setEmployeeId(employee.id);
      } catch (error) {
        console.error("Failed to fetch /api/employees/me", error);
      }
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("employeeId");

    setToken(null);
    setEmail(null);
    setRole(null);
    setUserId(null);
    setEmployeeId(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,
        userId,        // users.id       → for managerId / adminId
        employeeId,    // employees.id   → for employeeId in requests
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};