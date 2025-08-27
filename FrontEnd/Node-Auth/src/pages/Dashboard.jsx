// =============================================
// src/pages/Dashboard.jsx
// =============================================

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { LogOut, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();



  // If user not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg"
        >
          Please login to see your dashboard
        </motion.p>
      </div>
    );
  }

  // -----------------------------
  // Profile Image Fix
  // -----------------------------
  // If user.profileImage is a fileId (GridFS), we fetch from backend route
  // Example: http://localhost:3000/files/:id
  const profileImageUrl = user.profileImage
    ? `http://localhost:3000/files/${user.profileImage}`
    : "/default-profile.png"; // fallback


  console.log("📌 Dashboard user object:", user);
console.log("📌 Profile image URL:", profileImageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex flex-col items-center p-6 text-white relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold mb-6 drop-shadow-lg"
      >
        Welcome, <span className="text-yellow-300">{user.name}</span> 👋
      </motion.h1>

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/change-password")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 rounded-full shadow-lg text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(236,72,153,0.7)]"
        >
          <KeyRound size={20} />
          Change Password
        </motion.button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 w-full max-w-3xl"
      >
        {/* Profile Picture */}
        <motion.img
          whileHover={{ scale: 1.1, rotate: 2 }}
          src={profileImageUrl}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
        />

        {/* User Info */}
        <div className="flex flex-col gap-3 text-white text-lg w-full">
          {Object.entries(user).map(([key, value], idx) => {
            if (["profileImage", "password"].includes(key)) return null;

            return (
              <motion.p
                key={key}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
              >
                <span className="font-semibold text-yellow-300">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </span>{" "}
                {String(value)}
              </motion.p>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
