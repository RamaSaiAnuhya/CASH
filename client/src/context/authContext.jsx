import { createContext, useContext, useEffect, useState } from "react";

import { registerUser, loginUser } from "../services/authServices.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved UI session after a page refresh.
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("cash_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem("cash_user");
    } finally {
      setLoading(false);
    }
  }, []);

  async function register(username, password) {
    const data = await registerUser(username, password);

    // Registration does not automatically log the user in.
    return data;
  }

  async function login(username, password) {
    const data = await loginUser(username, password);

    // The starter backend returns { user: { id, username } }.
    const loggedInUser = data.user;

    if (!loggedInUser) {
      throw new Error("Unexpected login response from server");
    }

    localStorage.setItem("cash_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem("cash_user");
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
