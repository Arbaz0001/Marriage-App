import { useEffect, useState } from "react";
import API from "../services/api";

function computeAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function Matches() {
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    API.get("/profile/me", { headers })
      .then((res) => setMyProfile(res.data))
      .catch((err) => {
        console.error(err);
        setMyProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  if (!myProfile) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          You don't have a profile yet. Please create one from the Register page.
        </div>
      </div>
    );
  }

  const img = myProfile.photos && myProfile.photos.length > 0 ? myProfile.photos[0] : null;
  const base = API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000";
  const imgSrc = img ? (img.startsWith("http") ? img : `${base}/${img}`) : null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

      <div className="max-w-2xl bg-white rounded shadow overflow-hidden md:flex">
        <div className="md:w-1/3 bg-gray-100 h-64 flex items-center justify-center">
          {imgSrc ? (
            <img src={imgSrc} alt={myProfile.name || myProfile.user?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">No photo</div>
          )}
        </div>

        <div className="p-6 md:w-2/3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{myProfile.name || myProfile.user?.name}</h1>
              <p className="text-sm text-gray-600">{myProfile.gender} • {computeAge(myProfile.dob) || '—'} yrs</p>
              <p className="text-sm text-gray-600">{myProfile.city || '—'}</p>
            </div>

            <div className="text-right">
              {myProfile.isApproved ? (
                <div className="text-sm bg-green-100 text-green-800 px-3 py-2 rounded font-semibold">✓ Approved</div>
              ) : myProfile.isRejected ? (
                <div className="text-sm bg-red-100 text-red-800 px-3 py-2 rounded font-semibold">✗ Rejected</div>
              ) : (
                <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded font-semibold">⏳ Pending</div>
              )}
            </div>
          </div>

          <div className="mt-4 text-gray-800">
            <p className="whitespace-pre-line">{myProfile.about}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div><strong>Education:</strong> {myProfile.education || '—'}</div>
            <div><strong>Occupation:</strong> {myProfile.occupation || '—'}</div>
            <div><strong>Mobile:</strong> {myProfile.mobile || '—'}</div>
            <div><strong>WhatsApp:</strong> {myProfile.whatsapp || '—'}</div>
            <div><strong>Height:</strong> {myProfile.height || '—'}</div>
            <div><strong>Complexion:</strong> {myProfile.complexion || '—'}</div>
            <div><strong>City:</strong> {myProfile.city || '—'}</div>
            <div><strong>State:</strong> {myProfile.state || '—'}</div>
          </div>

          {myProfile.isRejected && (
            <div className="mt-6 p-4 rounded bg-red-50 border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>⚠️ Your profile was rejected by the admin.</strong><br />
                Please contact support for more information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
