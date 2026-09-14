import { createContext, useContext, useState } from "react";

import authApi from "../services/authApi";
import employeeApi from "../services/employeeApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // =========================================================
  // AUTH STATE
  // =========================================================

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState(
    localStorage.getItem("email")
  );

  const [role, setRole] = useState(
    localStorage.getItem("role")
  );

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

  // =========================================================
  // REFRESH EMPLOYEE PROFILE
  // =========================================================
  const refreshEmployee = async () => {
    try {
      const employee =
        await employeeApi.getCurrentEmployee();

      // Save employee ID
      localStorage.setItem(
        "employeeId",
        String(employee.id)
      );

      // Update React state
      setEmployeeId(employee.id);

      return employee;
    } catch (error) {
      console.error(
        "Failed to fetch employee profile:",
        error
      );

      // Employee profile may not exist yet.
      localStorage.removeItem("employeeId");
      setEmployeeId(null);

      throw error;
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (loginEmail, password) => {
    const data = await authApi.login(
      loginEmail,
      password
    );

    // -------------------------------------------------------
    // Save authentication data
    // -------------------------------------------------------

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);

    setToken(data.token);
    setEmail(data.email);
    setRole(data.role);

    // -------------------------------------------------------
    // Get user ID
    // -------------------------------------------------------

    try {
      const me = await authApi.getMe();

      localStorage.setItem(
        "userId",
        String(me.id)
      );

      setUserId(me.id);
    } catch (error) {
      console.error(
        "Failed to fetch /api/auth/me:",
        error
      );
    }

    // -------------------------------------------------------
    // Get employee ID
    // -------------------------------------------------------

    if (data.role === "EMPLOYEE") {
      try {
        await refreshEmployee();
      } catch (error) {
        /*
         * This can happen when the employee has logged in
         * but has not created an employee profile yet.
         *
         * This is not necessarily a login failure.
         */
        console.log(
          "Employee profile does not exist yet."
        );
      }
    }

    return data;
  };

  // =========================================================
  // LOGOUT
  // =========================================================
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

  // =========================================================
  // AUTHENTICATION STATUS
  // =========================================================

  const isAuthenticated = !!token;

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,

        // users.id
        userId,

        // employees.id
        employeeId,

        isAuthenticated,

        login,
        logout,

        // Used after employee profile creation
        refreshEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===========================================================
// USE AUTH
// ===========================================================

export const useAuth = () => {
  return useContext(AuthContext);
};