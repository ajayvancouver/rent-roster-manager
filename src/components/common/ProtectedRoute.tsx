
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserType } from "@/types/auth";

interface ProtectedRouteProps {
  allowedUserTypes?: UserType[];
  redirectTo?: string;
  element?: React.ReactElement;
}

const ProtectedRoute = ({ 
  allowedUserTypes = null, 
  redirectTo = "/auth",
  element
}: ProtectedRouteProps) => {
  const { user, userType, isLoading } = useAuth();

  // While checking authentication status, show loading
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // If a specific user type is required and doesn't match, redirect to appropriate dashboard
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    // If user is tenant but trying to access manager routes, redirect to tenant dashboard
    if (userType === "tenant") {
      return <Navigate to="/tenant/dashboard" />;
    }
    // If user is manager but trying to access tenant routes, redirect to manager dashboard
    if (userType === "manager") {
      return <Navigate to="/dashboard" />;
    }
    // Default fallback
    return <Navigate to="/" />;
  }

  // If a custom element is provided, return it
  if (element) {
    return element;
  }

  // Otherwise, render the outlet for nested routes
  return <Outlet />;
};

export default ProtectedRoute;
