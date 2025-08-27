
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute
 * Restricts access to routes that require authentication.
 * If the user is not logged in, redirect them to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
