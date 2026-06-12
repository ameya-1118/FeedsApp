import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login } from "../services/authService.js";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await login(form.email, form.password);

      localStorage.setItem("user", JSON.stringify({
        id: res.userId,
        username: res.username,
        email: form.email,
        role: res.role,
        avatar: res.avatar
      }));
      localStorage.setItem("token", res.token);

      toast.success(res.msg);

      if (res.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/feed");
      }

    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg auth-shell">
      <div className="auth-card">
        <div className="brand-chip">Welcome Back</div>
        <h1 className="brand-title">Feedsss</h1>

        <p className="brand-subtitle">
          Jump back into your feed and catch up on the latest moments.
        </p>

        <input
          name="email"
          type="email"
          placeholder="Enter Email"
          className="input mb-4"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Enter Password"
          className="input mb-4"
          onChange={handleChange}
        />

        <button
          onClick={handleLogin}
          className="btn"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <div className="auth-links space-y-2">
          <Link
            to="/forgot-password"
            className="auth-link block"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="auth-link block"
          >
            Don&apos;t have account? Register
          </Link>
        </div>
      </div>
    </main>
  );
}
