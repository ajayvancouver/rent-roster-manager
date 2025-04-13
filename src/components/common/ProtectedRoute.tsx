import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  requiredUserType?: "manager" | "tenant" | null;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  requiredUserType = null, 
  redirectTo = "/auth" 
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
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/" />;
  }

  // Otherwise, render the protected component
  return <Outlet />;
};

export default ProtectedRoute;
