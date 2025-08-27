import { ShieldCheck, Lock, Key, Database, User, LogOut, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function HomePageJWT() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center md:text-left text-yellow-300 mb-4 md:mb-0 drop-shadow-lg">
          🔐 JWT Auth & Backend Overview
        </h1>

        {/* Create Account Button */}
        <NavLink
          to="/register"
          className="flex items-center gap-2 bg-yellow-400 text-indigo-900 font-semibold px-5 py-3 rounded-lg shadow-lg hover:scale-105 hover:shadow-yellow-500/50 transition transform"
        >
          <PlusCircle size={20} /> Create Account
        </NavLink>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* JWT & Auth Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-pink-500/30 
          transition-all duration-300 hover:scale-105 hover:shadow-pink-500/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-pink-400 flex items-center gap-2">
            <ShieldCheck size={24} /> JWT & Auth
          </h2>
          <p className="text-gray-200 mb-2">
            JSON Web Tokens (JWT) are used to securely authenticate users without storing session info on the server.
          </p>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li>Register → User details saved in MongoDB (password hashed).</li>
            <li>Login → Backend validates credentials → JWT issued.</li>
            <li>Protected routes → JWT verified before access.</li>
            <li>Logout → JWT invalidated (cookie cleared).</li>
          </ul>
        </div>

        {/* MongoDB Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-yellow-400/30 
          transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">
            <Database size={24} /> MongoDB & Mongoose
          </h2>
          <p className="text-gray-200 mb-2">
            MongoDB stores data in flexible, JSON-like documents. Mongoose is an ODM for Node.js to work with MongoDB easily.
          </p>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li>Schema defines structure of documents.</li>
            <li>Models provide methods to create, read, update, and delete data.</li>
            <li>Integration with Express makes backend structured and maintainable.</li>
          </ul>
        </div>

        {/* Bcrypt Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-purple-500/30 
          transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
            <Lock size={24} /> Password Security (Bcrypt)
          </h2>
          <p className="text-gray-200 mb-2">
            Bcrypt hashes passwords before storing them in the database for security.
          </p>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li>Passwords are hashed → Original password cannot be retrieved.</li>
            <li>Compare hashed password during login.</li>
            <li>Enhances security for stored credentials.</li>
          </ul>
        </div>

        {/* User Flow Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-green-500/30 
          transition-all duration-300 hover:scale-105 hover:shadow-green-500/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-green-400 flex items-center gap-2">
            <User size={24} /> User Flow Overview
          </h2>
          <ol className="list-decimal list-inside text-gray-200 space-y-2">
            <li>User registers → Info stored in MongoDB, password hashed.</li>
            <li>User logs in → JWT issued → Stored in HTTP-only cookie.</li>
            <li>User accesses protected routes → Backend verifies JWT.</li>
            <li>User changes password → Old password verified → New password hashed & updated.</li>
            <li>Password reset → Token-based secure update without old password.</li>
            <li>User logs out → JWT removed → Access revoked.</li>
          </ol>
        </div>

        {/* Example JWT Token */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-red-500/30 col-span-1 md:col-span-2 
          transition-all duration-300 hover:scale-105 hover:shadow-red-500/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-red-400 flex items-center gap-2">
            <Key size={24} /> Example JWT Token
          </h2>
          <p className="text-gray-200 mb-2">This token represents an authenticated user:</p>
          <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto text-gray-300 shadow-inner shadow-red-500/40">
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFjMmU1YTdiM2EyZjFkMmUwYjFjOCIsImlhdCI6MTY5MzAwMzYwMCwiZXhwIjoxNjkzMDA3MjAwfQ.VkLx8uZk9eU7jK-EXAMPLE-TOKEN
          </pre>
        </div>

        {/* Logout Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-pink-500/30 col-span-1 md:col-span-2 
          transition-all duration-300 hover:scale-105 hover:shadow-pink-500/70 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-pink-500 flex items-center gap-2">
            <LogOut size={24} /> Logout & Security
          </h2>
          <p className="text-gray-200">
            Logging out clears the JWT from the cookie. Users cannot access protected routes without a valid token.
          </p>
        </div>
      </div>

      <footer className="mt-10 text-center text-gray-400 text-sm">
        © 2025 JWT Auth Demo • React + Tailwind + Node.js + Mongoose + MongoDB + Bcrypt
      </footer>
    </div>
  );
}
