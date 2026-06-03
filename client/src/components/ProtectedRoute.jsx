import { useRef } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { state } = useAuthContext();
  // Once authenticated, remember it — don't react to transient isLoading re-fires
  const everAuthenticated = useRef(false);
  if (state.isAuthenticated) everAuthenticated.current = true;

  // Only block on the very first load before Asgardeo has resolved state
  if (state.isLoading && !everAuthenticated.current) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-lime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.isAuthenticated && !everAuthenticated.current) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
