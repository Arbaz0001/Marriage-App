import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token || isAdmin) return;
    const headers = { Authorization: `Bearer ${token}` };
    API.get("/profile/me", { headers })
      .then((res) => {
        const p = res.data;
        if (p.isApproved) setProfileStatus("approved");
        else if (p.isRejected) setProfileStatus("rejected");
        else setProfileStatus("pending");
      })
      .catch(() => setProfileStatus(null));
  }, [token, isAdmin]);

  return (
    <nav className="bg-pink-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">💍 Marriage App</h1>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-4">
          {isAdmin && <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>}
          {!token && <Link to="/" className="hover:underline">Home</Link>}
          {!token && <Link to="/register" className="hover:underline">Register</Link>}
          {!token && <Link to="/login" className="hover:underline">Login</Link>}
          {token && profileStatus === "rejected" && (
            <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Your profile was rejected. Contact support.</div>
          )}
          {token && profileStatus === "pending" && (
            <div className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Profile Pending Approval</div>
          )}
          {token && profileStatus === "approved" && (
            <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Profile Approved</div>
          )}
          {token && <button onClick={logout} className="hover:underline">Logout</button>}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="p-2 rounded bg-pink-700/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-pink-600/95 border-t border-pink-700">
          <div className="flex flex-col px-4 py-3 space-y-2">
            {isAdmin && <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="block">Dashboard</Link>}
            {!token && <Link to="/" onClick={() => setOpen(false)} className="block">Home</Link>}
            {!token && <Link to="/register" onClick={() => setOpen(false)} className="block">Register</Link>}
            {!token && <Link to="/login" onClick={() => setOpen(false)} className="block">Login</Link>}
            {token && <button onClick={() => { setOpen(false); logout(); }} className="text-left">Logout</button>}
          </div>
        </div>
      )}
    </nav>
  );
}
