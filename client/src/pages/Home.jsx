import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef4ff] py-12">
      <div className="max-w-2xl w-full text-center px-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl px-8 py-10 shadow-xl backdrop-blur">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
            Find Your Perfect Match 💍
          </h1>
          <p className="text-black mb-8">
            Trusted Matrimony Platform — responsive on all devices
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-primary px-8 py-3 text-base">
              Login
            </Link>
            <Link to="/register" className="btn-outline px-8 py-3 text-base">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
