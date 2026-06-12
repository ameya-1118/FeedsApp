import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/authService.js";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      const res = await forgotPassword(email);

      toast.success(res.msg);

      navigate(`/reset-password?email=${email}`);

    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg auth-shell">
      <div className="auth-card">
        <div className="brand-chip">Recover Access</div>
        <h1 className="brand-title">Feedsss</h1>
        <p className="brand-subtitle">
          Enter your email and we&apos;ll send the verification code to reset
          your password.
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          className="input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSendOTP} className="btn">
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </main>
  );
}
