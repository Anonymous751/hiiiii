import { createContext, useState, useEffect } from "react";
import api from "../utils/axios.js"


// ==============================
// Context creation
// ==============================
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ------------------------------
  // State: user (initial from localStorage)
  // ------------------------------
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // ------------------------------
  // Sync user with localStorage
  // ------------------------------
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ------------------------------
  // Login
  // ------------------------------
  const login = async (credentials) => {
    try {
      const response = await api.post("/users/login", credentials);
      const data = response.data;

      if (data.status === "success") {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return {
        status: "error",
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ------------------------------
  // Register
  // ------------------------------
  const register = async (formData) => {
    try {
      const response = await api.post("/users/register", formData);
      const data = response.data;

      if (data.status === "success") {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return {
        status: "error",
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // ------------------------------
  // Logout
  // ------------------------------
  const logout = async () => {
    try {
      await api.post("/users/logout"); // optional
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    setUser(null);
    localStorage.removeItem("user");
  };

  // ------------------------------
  // Context value
  // ------------------------------
  const authContextValue = { user, login, register, logout };

  // ------------------------------
  // Provider
  // ------------------------------
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};