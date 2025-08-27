// Import core modules from React Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import AuthProvider (provides authentication context to the app)
import { AuthProvider } from "./context/AuthContext";

// Import global styles
import "./App.css";

// Import all pages (screens/components)
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePasswordReset from "./pages/ChangePasswordReset";
import HomePageStatic from "./pages/HomePage";

// Import ProtectedRoute (used to protect certain routes from unauthorized users)
import ProtectedRoute from "./context/ProtectedRoute";
import VerifyOTP from "./pages/VerifyOTP";
import DashOTP from "./pages/DashOTP";

/**
 * Main App Component
 * - Wraps everything inside `AuthProvider` (so all children can access authentication state)
 * - Uses React Router to define navigation (routes) in the app
 */
function App() {
  return (
    // ✅ AuthProvider makes authentication state available everywhere
    <AuthProvider>
      {/* ✅ BrowserRouter enables client-side routing (single-page app navigation) */}
      <BrowserRouter>
        {/* ✅ Routes is like a "switch" that renders the matching Route */}
        <Routes>
          {/* Public Routes (accessible to everyone) */}
          <Route path="/" element={<HomePageStatic />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/dash-otp" element={<DashOTP />} />
          <Route
            path="/verify-otp"
            element={
              // <ProtectedRoute>
                <VerifyOTP />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/change-password-reset"
            element={<ChangePasswordReset />}
          />

          {/* Protected Route (only logged-in users can access) */}
          <Route
            path="/dashboard"
            element={
              // Wrap the component inside ProtectedRoute
              // 🔒 If user is not logged in -> Redirects to /login
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ✅ Always export App so it can be rendered in main.jsx or index.jsx
export default App;
