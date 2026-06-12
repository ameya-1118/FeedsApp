import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      const res = await register({
        ...form,
        role: "user",
      });

      toast.success(res.msg);

      navigate(`/verify-otp?email=${form.email}`);

    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg auth-shell">
      <div className="auth-card">
        <div className="brand-chip">New Account</div>
        <h1 className="brand-title">Feedsss</h1>

        <p className="brand-subtitle">
          Create your profile and start posting with a fresh new vibe.
        </p>

        <input
          name="username"
          placeholder="Username"
          className="input mb-4"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input mb-4"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          className="input mb-4"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input mb-4"
          onChange={handleChange}
        />

        <button
          onClick={handleRegister}
          className="btn"
        >
          {loading ? "Please wait..." : "Register"}
        </button>

        <div className="auth-links">
          <Link
            to="/login"
            className="auth-link"
          >
            Already have account? Login
          </Link>
        </div>
      </div>
    </main>
  );
}
