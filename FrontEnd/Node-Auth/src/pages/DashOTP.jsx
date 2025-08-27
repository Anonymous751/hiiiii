// ================================
// src/pages/DashOTP.jsx
// ================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function DashOTP() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Will fetch from localStorage
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);

  // -------------------------------
  // On mount: fetch email from localStorage
  // -------------------------------
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      toast.error("⚠️ Email not found! Redirecting...");
      setTimeout(() => navigate("/change-password"), 1200);
    } else {
      setEmail(storedEmail);
      inputsRef.current[0]?.focus();
    }
  }, [navigate]);

  // -------------------------------
  // Cooldown timer for resending OTP
  // -------------------------------
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // -------------------------------
  // OTP input handlers
  // -------------------------------
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const nextOtp = [...otp];
        nextOtp[index] = "";
        setOtp(nextOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const nextOtp = [...otp];
        nextOtp[index - 1] = "";
        setOtp(nextOtp);
      }
    }
  };

  const handlePaste = (e) => {
    const clip = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(clip)) return;
    const digits = clip.slice(0, OTP_LENGTH).split("");
    const nextOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((d, i) => (nextOtp[i] = d));
    setOtp(nextOtp);
    inputsRef.current[digits.length - 1]?.focus();
  };

  // -------------------------------
  // Verify OTP
  // -------------------------------
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (!email) return toast.error("Email missing!");
    if (code.length !== OTP_LENGTH) return toast.error("Enter 6-digit OTP!");

    try {
      setVerifying(true);
      const res = await axios.post("http://localhost:3000/users/verify-otp", { email, otp: code });
      if (res.data.status === "success") {
        toast.success("✅ OTP verified! Redirecting...");
        // Optionally remove from localStorage
        // localStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/change-password-reset"), 1200);
      } else {
        setError(true);
        toast.error(res.data.message || "Invalid OTP");
        setTimeout(() => setError(false), 600);
      }
    } catch (err) {
      setError(true);
      toast.error(err.response?.data?.message || "Verification failed");
      setTimeout(() => setError(false), 600);
    } finally {
      setVerifying(false);
    }
  };

  // -------------------------------
  // Resend OTP
  // -------------------------------
  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    try {
      setResending(true);
      const res = await axios.post("http://localhost:3000/users/resend-otp", { email });
      if (res.data.status === "success") {
        toast.success("OTP resent!");
        setCooldown(RESEND_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      } else toast.error(res.data.message || "Failed to resend OTP");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-[#1f1c2c] via-[#928dab] to-[#1f1c2c] text-white">
      <ToastContainer position="top-right" autoClose={2500} />
      <motion.div className="bg-[#1e1b2b]/80 backdrop-blur-lg p-10 rounded-3xl w-full max-w-lg relative">
        <motion.button onClick={() => navigate(-1)} className="absolute top-5 left-5 flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </motion.button>

        <h1 className="text-3xl font-bold mb-4 text-center">OTP Verification</h1>
        <p className="text-white/70 mb-6 text-center">Enter the 6-digit code sent to your email</p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                maxLength={1}
                className={`w-12 h-14 text-center rounded-xl border ${
                  error ? "border-red-400 animate-shake" : "border-purple-500/40"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={handleResend} disabled={resending || cooldown > 0}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
            <button type="submit" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
