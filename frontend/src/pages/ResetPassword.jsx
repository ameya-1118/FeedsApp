import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyResetOTP, resetPassword } from "../services/authService.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);

      await verifyResetOTP(email, otp);

      const res = await resetPassword(email, password);

      toast.success(res.msg);

      navigate("/login");

    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg auth-shell">
      <div className="auth-card">
        <div className="brand-chip">Secure Reset</div>
        <h1 className="brand-title">Feedsss</h1>

        <p className="brand-subtitle">
          Confirm the reset code and choose a fresh password for your account.
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="input mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleReset} className="btn">
          {loading ? "Please wait..." : "Reset Password"}
        </button>
      </div>
    </main>
  );
}
