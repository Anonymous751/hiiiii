// src/pages/Register.jsx
import { useState, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, UploadCloud, UserPlus, ArrowLeft } from "lucide-react";
import { registerApi } from "../services/services";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Handle input change
  // -------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("confirm_password", form.confirmPassword);
    if (form.profileImage) fd.append("profileImage", form.profileImage);

    try {
      // setLoading(true);

      // const res = await register(fd);
      console.log("fd", fd);

      const res = await registerApi(fd);

      console.log("res >>>>", res);

      if (res?.status == 200) {
        setLoading(false);

        toast.success(res.message || "Registration successful!");
        navigate("/verify-otp", { state: { email: form.email } });
        
      } else {
        toast.error(res?.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error(err.response?.data?.message || "Server error, try again");
    } finally {
      setLoading(false);
    }
  };

  console.log("loading", loading);

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-900 via-pink-800 to-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 w-full max-w-md rounded-3xl shadow-xl p-8 text-white relative"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-purple-400"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <UserPlus size={46} className="text-purple-400 mb-2" />
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-white/70">Join us today!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-400 focus:ring-2 focus:ring-purple-500"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-purple-400 focus:ring-2 focus:ring-purple-500"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 border border-purple-400 focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white/60"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 rounded-lg bg-white/10 border border-purple-400 focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-white/60"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Profile Image */}
          <label
            htmlFor="profileImage"
            className="flex flex-col items-center justify-center border-2 border-dashed border-purple-400 rounded-xl py-4 cursor-pointer bg-white/10"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UploadCloud size={28} className="text-purple-400" />
            )}
            <span className="text-sm mt-2">
              {preview ? "Change Image" : "Upload Image"}
            </span>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded-lg text-white font-semibold shadow-md hover:bg-purple-700"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-sm text-white/70 mt-6 text-center">
          Already have an account?{" "}
          <NavLink to="/login" className="text-purple-400 font-bold">
            Login
          </NavLink>
        </p>
      </motion.div>
    </div>
  );
}
