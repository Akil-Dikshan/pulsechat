import { useAuthContext } from "@asgardeo/auth-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const { state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until Asgardeo has fully resolved before navigating
    if (!state.isLoading && state.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
    if (!state.isLoading && !state.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [state.isLoading, state.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground text-lg">Signing you in…</p>
    </div>
  );
}

export default Callback;
