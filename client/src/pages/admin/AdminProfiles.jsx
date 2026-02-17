import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import defaultImage from "../../assets/53897.jpg";

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [tableView, setTableView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ city: "", sect: "", minAge: "", maxAge: "" });

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  useEffect(() => {
    API.get("/admin/profiles", { headers }).then((res) => setProfiles(res.data));
  }, []);

  const applyFilter = async () => {
    const { data } = await API.get("/admin/profiles/filter", { headers, params: filters });
    setProfiles(data);
  };

  const updateStatus = async (id, status) => {
    await API.patch(`/admin/profiles/${id}/approve`, { status }, { headers });
    setProfiles(profiles.map((p) => (p._id === id ? { ...p, isApproved: status } : p)));
  };

  const deleteProfile = async (id) => {
    if (!confirm("Delete this profile?")) return;
    await API.delete(`/admin/profiles/${id}`, { headers });
    setProfiles(profiles.filter((p) => p._id !== id));
  };

  const exportCSV = async () => {
    const res = await API.get("/admin/profiles/export", { headers, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "profiles.csv";
    a.click();
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">All Matrimony Profiles</h1>

      {/* FILTER BAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <input placeholder="City" className="input" onChange={(e) => setFilters({ ...filters, city: e.target.value })} />

        <select className="input" onChange={(e) => setFilters({ ...filters, sect: e.target.value })}>
          <option value="">Sect</option>
          <option>Sunni</option>
          <option>Shia</option>
        </select>

        <input placeholder="Min Age" className="input" onChange={(e) => setFilters({ ...filters, minAge: e.target.value })} />

        <input placeholder="Max Age" className="input" onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })} />

        <button onClick={applyFilter} className="bg-pink-600 text-white rounded px-3 py-2 col-span-2 md:col-span-1">Apply</button>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setTableView(!tableView)} className="bg-gray-200 px-3 py-1 rounded">{tableView ? 'Show Cards' : 'Show Table'}</button>
        <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-1 rounded">Export CSV</button>
        <Link to="/admin/profiles/create" className="bg-green-600 text-white px-3 py-1 rounded">Create Profile</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tableView ? (
          <div className="col-span-1 md:col-span-2 overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Name</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>Education</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.name}</td>
                    <td>{p.gender}</td>
                    <td>{p.city}</td>
                    <td>{p.education}</td>
                    <td>{p.isApproved ? "Approved" : "Pending"}</td>
                    <td className="p-2">
                      <button onClick={() => setSelected(p)} className="mr-2 text-blue-600">View</button>
                      <Link to={`/admin/profiles/edit/${p._id}`} className="mr-2 text-green-600">Edit</Link>
                      <button onClick={() => deleteProfile(p._id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          profiles.map((p) => (
            <div key={p._id} className="border rounded p-4 shadow-sm bg-white">
              <h2 className="font-semibold text-lg">{p.name}</h2>

              <p className="text-sm text-gray-600">{p.gender} | {p.maritalStatus}</p>

              <p className="text-sm">📍 {p.city}, {p.state}</p>
              <p className="text-sm">🕌 Sect: {p.sect}</p>
              <p className="text-sm">🎓 {p.education}</p>
              <p className="text-sm">💼 {p.occupation}</p>
              <p className="text-sm">📞 {p.mobile}</p>

              <p className="text-sm mt-2 text-gray-700">{p.about}</p>

              {p.photos?.length > 0 ? (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {p.photos.map((img, i) => {
                    const base = API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000";
                    const src = img.startsWith("http") ? img : `${base}/${img}`;
                    return <img key={i} src={src} className="w-16 h-16 rounded object-cover border" />;
                  })}
                </div>
              ) : (
                <img src={defaultImage} alt="Default Profile" className="w-16 h-16 rounded object-cover border mt-2" />
              )}

              <div className="mt-3 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>Age: {p.age || '—'}</div>
                <div>Complexion: {p.complexion || '—'}</div>
                <div>Caste: {p.caste || '—'}</div>
                <div>Father: {p.fatherName || p.fatherOccupation || '—'}</div>
                <div>Mother: {p.motherName || p.motherOccupation || '—'}</div>
                <div>Siblings: {p.siblings || '—'}</div>
              </div>

              <p className="mt-2 text-sm">Status: {p.isApproved ? (<span className="text-green-600 font-semibold">Approved</span>) : (<span className="text-yellow-600 font-semibold">Pending</span>)}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => updateStatus(p._id, true)} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => updateStatus(p._id, false)} className="bg-yellow-500 text-white px-3 py-1 rounded">Reject</button>
                <Link to={`/admin/profiles/edit/${p._id}`} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</Link>
                <button onClick={() => deleteProfile(p._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / View */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 max-w-2xl w-full rounded">
            <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
            <p>{selected.gender} | {selected.city}, {selected.state}</p>
            <p className="mt-2">{selected.about}</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => { updateStatus(selected._id, true); setSelected(null); }} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
              <button onClick={() => { updateStatus(selected._id, false); setSelected(null); }} className="bg-yellow-500 text-white px-3 py-1 rounded">Reject</button>
              <Link to={`/admin/profiles/edit/${selected._id}`} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</Link>
              <button onClick={() => { deleteProfile(selected._id); setSelected(null); }} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              <button onClick={() => setSelected(null)} className="ml-auto">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
