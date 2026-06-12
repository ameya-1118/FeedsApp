import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOTP } from "../services/authService.js";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await verifyOTP(email, otp);

      toast.success(res.msg);

      navigate("/login");

    } catch (error) {
      toast.error(
        error.response?.data?.msg || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gradient-bg auth-shell">
      <div className="auth-card">
        <div className="brand-chip">Email Check</div>
        <h1 className="brand-title">Feedsss</h1>

        <p className="brand-subtitle" style={{ marginBottom: "0.5rem" }}>
          Verify your email with the code sent to:
        </p>

        <p className="muted-copy mb-6 text-sm">
          {email}
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="input mb-4 text-center tracking-[8px]"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          className="btn"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </main>
  );
}
