// =============================================
// src/pages/Login.jsx
// =============================================

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { NavLink, useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion"; 
import { Eye, EyeOff, User, ArrowLeft } from "lucide-react"; // ⬅ Added ArrowLeft icon

export default function Login() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 🔄 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔑 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);
      if (res.status === "success") {
        toast.success(res.message || "Login successful! 🎉");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast.error(res.message || "Login failed ❌");
      }
    } catch (error) {
      toast.error("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-pink-800 to-indigo-900 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 🔮 Background Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>
      <div className="absolute -bottom-40 -right-32 w-96 h-96 bg-pink-500 rounded-full opacity-30 animate-pulse-slow blur-3xl"></div>

      {/* 🔐 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white"
      >
        {/* ⬅ Back Button */}
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)} // Go back
          className="absolute top-4 left-4 flex items-center gap-1 text-white/70 hover:text-purple-400 transition-all"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* 🧑 User Icon + Title */}
        <div className="flex flex-col items-center mb-6 mt-6">
          <User size={48} className="text-purple-400 mb-2 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-center">Login</h2>
          <p className="text-sm text-white/70 mt-1 text-center">
            Enter your credentials to access your account
          </p>
        </div>

        {/* 📝 Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 📧 Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 placeholder-transparent text-white transition-all peer hover:shadow-lg focus:shadow-lg"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-[-8px] peer-focus:text-white/80 peer-focus:text-sm transition-all">
              Email
            </label>
          </div>

          {/* 🔑 Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border border-white/20 rounded-xl bg-white/10 placeholder-transparent text-white transition-all peer hover:shadow-lg focus:shadow-lg"
              required
            />
            <label className="absolute left-4 top-3 text-white/60 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-white/80 peer-focus:text-sm transition-all">
              Password
            </label>

            {/* 👁 Show/Hide */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* 🔄 Reset Password */}
          <div className="flex justify-between items-center">
            <NavLink
              to="/reset-password"
              className="text-sm text-purple-400 hover:underline font-medium"
            >
              Forgot Password?
            </NavLink>
          </div>

          {/* 🚀 Login Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #9f7aea" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-purple-600/90 text-white font-semibold py-3 rounded-2xl shadow-lg hover:bg-purple-700/90 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* 📌 Link to Register */}
        <p className="text-sm text-white/70 mt-6 text-center">
          Not registered?{" "}
          <NavLink
            to="/register"
            className="text-purple-400 font-semibold hover:underline"
          >
            Create Account
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
}
