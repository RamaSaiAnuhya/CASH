import { createContext, useContext, useState } from "react";

import { loginUser, registerUser } from "../services/authServices";

const AuthContext = createContext(null);

function extractAuthData(data) {
  // Supports either { token, user } or { message, token, user }.
  // If your API nests these fields differently, adapt this function.
  const token = data.token ?? data.accessToken ?? data.access_token;

  const user = data.user;

  if (!token || !user) {
    throw new Error(
      "Authentication succeeded, but the response must contain a token and user.",
    );
  }

  return { token, user };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cash_token"));

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cash_user"));
    } catch {
      return null;
    }
  });

  function saveSession(authData) {
    const { token: newToken, user: newUser } = extractAuthData(authData);

    localStorage.setItem("cash_token", newToken);
    localStorage.setItem("cash_user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }

  async function login(username, password) {
    const data = await loginUser(username, password);
    saveSession(data);
  }

  async function register(username, email, password) {
    const data = await registerUser(username, email, password);

    const newToken = data.token ?? data.accessToken ?? data.access_token;

    if (newToken && data.user) {
      saveSession(data);
      return { requiresLogin: false };
    }

    return { requiresLogin: true };
  }

  function logout() {
    localStorage.removeItem("cash_token");
    localStorage.removeItem("cash_user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
