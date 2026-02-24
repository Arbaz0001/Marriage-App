import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { notifyError } from "../services/notify";

export default function ProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    API.get(`/profile/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error(err);
        notifyError(err.response?.data?.message || "Unable to load profile");
        navigate("/matches");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return null;

  const img = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;
  const base = API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000";
  const imgSrc = img ? (img.startsWith("http") ? img : `${base}/${img}`) : null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="bg-white rounded shadow overflow-hidden md:flex">
        <div className="md:w-1/3 bg-gray-100 h-80 flex items-center justify-center">
          {imgSrc ? (
            <img src={imgSrc} alt={profile.name || profile.user?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">No photo</div>
          )}
        </div>

        <div className="p-6 md:w-2/3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile.name || profile.user?.name}</h1>
              <p className="text-sm text-gray-600">{profile.gender} • {profile.age || '—'} yrs</p>
              <p className="text-sm text-gray-600">{profile.city || '—'}</p>
            </div>

            <div className="text-right">
              {profile.isApproved ? (
                <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Approved</div>
              ) : (
                <div className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</div>
              )}
            </div>
          </div>

          <div className="mt-4 text-gray-800">
            <p className="whitespace-pre-line">{profile.about}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div><strong>Education:</strong> {profile.education || '—'}</div>
            <div><strong>Occupation:</strong> {profile.occupation || '—'}</div>
            <div><strong>Mobile:</strong> {profile.mobile || '—'}</div>
            <div><strong>WhatsApp:</strong> {profile.whatsapp || '—'}</div>
            <div><strong>Height:</strong> {profile.height || '—'}</div>
            <div><strong>Complexion:</strong> {profile.complexion || '—'}</div>
            <div><strong>Caste:</strong> {profile.caste || '—'}</div>
            <div><strong>Family Type:</strong> {profile.familyType || '—'}</div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
