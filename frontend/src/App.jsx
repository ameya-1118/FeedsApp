import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Feed from "./pages/Feed";
import Admin from "./pages/Admin";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";

function getStoredUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

function ProtectedRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

function Home() {
  return (
    <div className="gradient-bg auth-shell">
      <div className="auth-card home-card">
        <div className="brand-chip">Share. Scroll. Spark.</div>
        <h1 className="brand-title">Feedsss</h1>
        <p className="brand-subtitle">
          A brighter social feed with bold color, smooth motion, and a cleaner
          first impression.
        </p>
        <div className="home-actions">
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="btn btn-secondary">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/feed"
          element={(
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/create-post"
          element={(
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <Admin />
            </AdminRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}
