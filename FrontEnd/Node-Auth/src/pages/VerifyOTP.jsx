// src/pages/VerifyOTP.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utils/axios"; 
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => location?.state?.email || "");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef([]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Focus first OTP box on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setActiveIndex(index - 1);
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    const clip = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(clip)) return;
    const digits = clip.slice(0, OTP_LENGTH).split("");
    const next = Array(OTP_LENGTH).fill("");
    digits.forEach((d, i) => (next[i] = d));
    setOtp(next);
    const targetIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputsRef.current[targetIndex]?.focus();
    setActiveIndex(targetIndex);
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifying(true);
      const res = await api.post("/users/verify-otp", { email, otp: code });

      if (res.data?.status === "success") {
        toast.success("Email verified successfully! 🎉 Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(res.data?.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first to resend OTP.");
      return;
    }
    if (cooldown > 0) return;

    try {
      setResending(true);
      const res = await api.post("/users/resend-otp", { email });

      if (res.data?.status === "success") {
        toast.success("OTP resent! Check your email 📩");
        setCooldown(RESEND_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        setActiveIndex(0);
      } else {
        toast.error(res.data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Background blobs */}
      <div className="absolute -top-32 -left-24 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ x: -5, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 inline-flex items-center gap-2 text-white/70 hover:text-fuchsia-300 transition"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <motion.div
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="p-3 rounded-2xl bg-white/10 border border-white/20 shadow"
          >
            <ShieldCheck className="w-8 h-8 text-fuchsia-300" />
          </motion.div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            Verify your email
          </h1>
          <p className="text-white/70 text-sm mt-1 text-center">
            Enter the 6-digit code we sent to your email.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-fuchsia-400/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 placeholder-white/50"
              required
            />
          </div>

          {/* OTP Inputs */}
          <div className="space-y-3">
            <label className="text-sm text-white/80">One-Time Password</label>
            <div
              className="grid grid-cols-6 gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`h-12 sm:h-14 text-center text-lg sm:text-2xl rounded-xl bg-white/10 border transition-all focus:outline-none focus:ring-2 ${
                    i === activeIndex
                      ? "border-fuchsia-400/80 focus:ring-fuchsia-400"
                      : "border-white/20 focus:ring-fuchsia-300/60"
                  }`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                />
              ))}
            </div>
            <p className="text-xs text-white/60">
              Tip: You can paste the full code directly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {/* Resend button */}
            <motion.button
              type="button"
              disabled={resending || cooldown > 0}
              whileHover={{ scale: resending || cooldown > 0 ? 1 : 1.05 }}
              whileTap={{ scale: resending || cooldown > 0 ? 1 : 0.98 }}
              onClick={handleResend}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition ${
                resending || cooldown > 0 ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title="Resend OTP"
            >
              <RefreshCw size={16} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </motion.button>

            {/* Verify button */}
            <motion.button
              type="submit"
              disabled={verifying}
              whileHover={{
                scale: verifying ? 1 : 1.05,
                boxShadow: "0 0 22px rgba(232,121,249,0.35)",
              }}
              whileTap={{ scale: verifying ? 1 : 0.98 }}
              className={`inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold bg-fuchsia-600/90 hover:bg-fuchsia-600 text-white shadow-lg ${
                verifying ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {verifying ? "Verifying..." : "Verify"}
            </motion.button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-xs text-white/60 mt-6 text-center">
          Didn’t get the email? Check your spam folder.
        </p>
      </motion.div>
    </div>
  );
}
