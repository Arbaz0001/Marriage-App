import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

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
      alert(msg);
    }
  };

  return (
    <form className="max-w-sm mx-auto mt-10 space-y-3" onSubmit={submitHandler}>
      <h2 className="text-xl font-bold">Login</h2>
      <input
        className="border p-2 w-full"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="bg-pink-600 text-white px-4 py-2 w-full">Login</button>
    </form>
  );
}
