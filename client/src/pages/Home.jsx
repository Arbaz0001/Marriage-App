import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-2xl w-full text-center px-4">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-3">Find Your Perfect Match 💍</h1>
        <p className="text-gray-600 mb-6">Trusted Matrimony Platform — responsive on all devices</p>

        <div className="flex justify-center gap-4">
          <Link to="/login" className="px-6 py-3 rounded bg-pink-600 text-white font-semibold">Login</Link>
          <Link to="/register" className="px-6 py-3 rounded bg-white border border-pink-600 text-pink-600 font-semibold">Register</Link>
        </div>
      </div>
    </div>
  );
}
