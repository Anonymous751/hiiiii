// ================================
// src/pages/ChangePasswordReset.jsx
// ================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function ChangePasswordReset() {
  const navigate = useNavigate();

  // -------------------------------
  // Get email from localStorage
  // -------------------------------
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      toast.error("⚠️ Email not found! Redirecting...", { position: "top-right" });
      setTimeout(() => navigate("/change-password"), 1200);
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  // -------------------------------
  // Local state
  // -------------------------------
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // Handle change password
  // -------------------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!email) return; // Safety check

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/users/change-password-email", {
        email,
        oldPassword,
        newPassword,
      });

      toast.success(res.data.message || "Password updated successfully!", { position: "top-right" });

      // Clear fields
      setOldPassword("");
      setNewPassword("");

      // Remove email from localStorage after success
      localStorage.removeItem("resetEmail");

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md relative"
      >
        <h2 className="text-2xl font-bold text-center text-yellow-300 mb-6">
          🔑 Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Old Password */}
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="Enter your old password"
              className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-300"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-300"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold shadow-lg transition duration-300 hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-300 text-center">
          ⚠️ You must enter your old password to update.
        </p>
      </motion.div>

      <ToastContainer />
    </div>
  );
}
