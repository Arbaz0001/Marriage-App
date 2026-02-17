import { Navigate } from "react-router-dom";

export default function ProtectedAdmin({ children }) {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const role = user?.role;

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
