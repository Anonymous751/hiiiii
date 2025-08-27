// ==========================================
// src/pages/ResetPassword.jsx
// ==========================================

// React hooks
import { useState } from "react";

// HTTP requests (to talk with backend API)
import axios from "axios";

// Animation library (for smooth transitions)
import { motion } from "framer-motion";

// Icons (eye toggle + key icon)
import { Eye, EyeOff, Key } from "lucide-react";

// Toast notifications (nice popup messages for success/error)
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // required CSS for Toastify
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


// ==========================================
// ResetPassword Component
// ==========================================
const ResetPassword = () => {
  const navigate = useNavigate();
  // ------------------------------
  // State variables (track user input + UI states)
  // ------------------------------
  const [email, setEmail] = useState(""); // user email
  const [password, setPassword] = useState(""); // new password
  const [confirmPassword, setConfirmPassword] = useState(""); // confirm new password
  const [loading, setLoading] = useState(false); // loading state during API call
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // toggle confirm password visibility

  // ------------------------------
  // Handle form submission
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh on form submit

    console.log("🔹 Submitting reset request:", {
      email,
      password,
      confirmPassword,
    });

    // Validate: make sure passwords match
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    try {
      setLoading(true); // show loading state
      // Make POST request to backend API
      const response = await axios.post(
        "http://localhost:3000/users/reset-password-direct",
        {
          email, // user's email
          password, // new password
          confirm_password: confirmPassword, // backend expects this key
        },
        { withCredentials: true } // include cookies/session if any
      );

      console.log("✅ Server response:", response.data);

      // Show success notification
      toast.success("✅ Password reset successful!");

      // Clear form fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("❌ Error during reset:", error.response || error.message);

      // Show error notification
      toast.error("❌ Password reset failed. Please try again.");
    } finally {
      setLoading(false); // reset loading state
    }
  };

  // ------------------------------
  // UI (JSX part)
  // ------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-pink-800 to-indigo-900 relative overflow-hidden">
      {/* Background blurred circles for aesthetic effect */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>
      <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-pink-500 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>

      {/* Card container with motion animation */}
      <motion.div
        initial={{ opacity: 0, y: 60 }} // starts hidden + below
        animate={{ opacity: 1, y: 0 }} // animates into view
        transition={{ duration: 0.8 }} // smooth transition
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} // go back to previous page
          className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-purple-400 transition-all"
        >
          <ArrowLeft size={22} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Key icon (with bounce effect) */}
          <Key size={48} className="text-purple-400 mb-2 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-center text-white">
            Reset Password
          </h2>
          <p className="text-sm text-white/70 mt-1 text-center">
            Enter your email and new password
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // update email state
              className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-transparent text-white peer hover:shadow-lg focus:shadow-lg"
              required
            />
            {/* Floating label */}
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-[-8px] peer-focus:text-sm peer-focus:text-white/80 transition-all">
              Email
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // toggle show/hide password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // update password state
              className="w-full px-4 py-3 pr-12 border border-white/20 rounded-xl bg-white/10 placeholder-transparent text-white peer hover:shadow-lg focus:shadow-lg"
              required
            />
            {/* Floating label */}
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-[-8px] peer-focus:text-sm peer-focus:text-white/80 transition-all">
              Password
            </label>
            {/* Show/Hide password button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // toggle state
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-purple-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"} // toggle show/hide confirm password
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // update confirm password state
              className="w-full px-4 py-3 pr-12 border border-white/20 rounded-xl bg-white/10 placeholder-transparent text-white peer hover:shadow-lg focus:shadow-lg"
              required
            />
            {/* Floating label */}
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-[-8px] peer-focus:text-sm peer-focus:text-white/80 transition-all">
              Confirm Password
            </label>
            {/* Show/Hide confirm password button */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // toggle state
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-purple-400"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #9f7aea" }} // hover effect
            whileTap={{ scale: 0.97 }} // tap effect
            type="submit"
            disabled={loading} // disable while loading
            className={`w-full bg-purple-600/90 text-white font-semibold py-3 rounded-2xl shadow-lg hover:bg-purple-700/90 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>

        {/* Small note */}
        <div className="mt-6 text-center text-xs text-yellow-300 font-medium">
          ⚠️ Make sure you are a{" "}
          <span className="underline">registered user</span> before resetting
          your password.
        </div>
      </motion.div>

      {/* Toast Notification Container (bottom-right corner) */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
      />
    </div>
  );
};

// Export component so it can be used in App.jsx
export default ResetPassword;
