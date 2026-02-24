import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { notifyError } from "../services/notify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/matches");
      }
    } catch (err) {
      // show server error message and log full response for debugging
      const msg = err?.response?.data?.message || err.message || "Login failed";
      console.error("Login error:", err?.response || err);
      notifyError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef4ff] px-4">
      <form
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4"
        onSubmit={submitHandler}
      >
        <h2 className="text-2xl font-bold text-center text-blue-900">Login</h2>
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-primary w-full justify-center py-3">
          Login
        </button>
      </form>
    </div>
  );
}
