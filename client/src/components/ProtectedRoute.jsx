import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { state } = useAuthContext();

  // Wait for Asgardeo to finish initialising before making a decision
  if (state.isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
