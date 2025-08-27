// ================================
// src/pages/ChangePassword.jsx
// ================================

import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

const ChangePassword = () => {
  const [email, setEmail] = useState(""); // Store the entered email
  const [loading, setLoading] = useState(false); // Track if request is in progress
  const navigate = useNavigate(); // For redirecting to OTP page

  // -------------------------------
  // Handle form submit
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure email is not empty
    if (!email) {
      toast.error("⚠️ Please enter your email!", { position: "top-right" });
      return;
    }

    try {
      setLoading(true);

      // Send request to backend to check if email exists
      const res = await axios.post("http://localhost:3000/users/check-email", {
        email,
      });

      if (res.data.status === "success") {
        toast.success("✅ Email verified! Redirecting...", { position: "top-right" });

        // Save email in localStorage for next pages (OTP and password reset)
        localStorage.setItem("resetEmail", email);

        // Redirect to OTP page after short delay
        setTimeout(() => {
          navigate("/dash-otp");
        }, 1200);
      } else {
        toast.error("❌ Email not registered!", { position: "top-right" });
      }
    } catch (err) {
      console.error("Error checking email:", err);
      toast.error(err.response?.data?.message || "⚠️ Something went wrong. Try again!", {
        position: "top-right",
      });
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
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-purple-400 transition-all"
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <h2 className="text-2xl font-bold text-center text-yellow-300 mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold shadow-lg transition duration-300 hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-300 text-center">
          ⚠️ Only registered users can reset their password.
        </p>
      </motion.div>

      <ToastContainer />
    </div>
  );
};

export default ChangePassword;
