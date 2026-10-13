import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/authContext.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Welcome, {user?.username}!</h1>
      <p>Your CASH dashboard will go here.</p>
      <button onClick={logout}>Log out</button>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {" "}
      <BrowserRouter>
        {" "}
        <AppRoutes />{" "}
      </BrowserRouter>{" "}
    </AuthProvider>
  );
}
