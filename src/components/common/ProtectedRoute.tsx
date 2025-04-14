import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedUserTypes?: string[];
  redirectTo?: string;
  element?: React.ReactElement;
}

const ProtectedRoute = ({ 
  allowedUserTypes = null, 
  redirectTo = "/auth",
  element
}: ProtectedRouteProps) => {
  const { user, userType, isLoading } = useAuth();

  // While checking authentication status, show nothing
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // If a specific user type is required and doesn't match, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
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
