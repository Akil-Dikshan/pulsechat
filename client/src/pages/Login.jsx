import { Navigate } from "react-router-dom";

// /login is no longer used — auth is triggered directly from the landing page.
export default function Login() {
  return <Navigate to="/" replace />;
}
