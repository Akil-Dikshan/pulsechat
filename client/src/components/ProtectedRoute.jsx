import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { state } = useAuthContext();

  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
