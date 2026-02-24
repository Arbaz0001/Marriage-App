import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import defaultImage from "../../assets/53897.jpg";
import { notifyError, notifyInfo, notifySuccess } from "../../services/notify";

export default function AdminProfiles() {
  const defaultFilters = {
    city: "",
    sect: "",
    gender: "",
    occupation: "",
    caste: "",
    income: "",
    minAge: "",
    maxAge: "",
  };

  const [profiles, setProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [tableView, setTableView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const ageOptions = Array.from({ length: 33 }, (_, index) => String(index + 18));

  const getUniqueValues = (list, field) => {
    const unique = new Set(
      list
        .map((item) => (item?.[field] || "").toString().trim())
        .filter(Boolean)
    );
    return [...unique].sort((a, b) => a.localeCompare(b));
  };

  const cityOptions = getUniqueValues(allProfiles, "city");
  const occupationOptions = getUniqueValues(allProfiles, "occupation");
  const casteOptions = getUniqueValues(allProfiles, "caste");
  const incomeOptions = getUniqueValues(allProfiles, "income");

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    API.get("/admin/profiles", { headers }).then((res) => {
      setProfiles(res.data);
      setAllProfiles(res.data);
    });
  }, []);

  const applyFilter = async () => {
    try {
      const minAge = filters.minAge ? Number(filters.minAge) : null;
      const maxAge = filters.maxAge ? Number(filters.maxAge) : null;

      const params = { ...filters };

      if (minAge !== null && maxAge !== null) {
        params.minAge = String(Math.min(minAge, maxAge));
        params.maxAge = String(Math.max(minAge, maxAge));
      }

      const { data } = await API.get("/admin/profiles/filter", { headers, params });
      setProfiles(data);
      notifyInfo(`Found ${data.length} profile(s)`);
    } catch (error) {
      console.error("Filter error:", error);
      notifyError("Failed to apply filters");
    }
  };

  const clearFilter = () => {
    setFilters(defaultFilters);
    setProfiles(allProfiles);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/admin/profiles/${id}/approve`, { status }, { headers });
      setProfiles(profiles.map((p) => (p._id === id ? { ...p, isApproved: status } : p)));
      notifySuccess(status ? "Profile approved" : "Profile rejected");
    } catch (error) {
      console.error("Status update error:", error);
      notifyError("Failed to update status");
    }
  };

  const deleteProfile = async (id) => {
    try {
      await API.delete(`/admin/profiles/${id}`, { headers });
      setProfiles(profiles.filter((p) => p._id !== id));
      notifySuccess("Profile deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      notifyError("Failed to delete profile");
    }
  };

  const exportCSV = async () => {
    try {
      const res = await API.get("/admin/profiles/export", { headers, responseType: "blob" });
      const url = globalThis.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "profiles.csv";
      a.click();
      globalThis.URL.revokeObjectURL(url);
      notifySuccess("Profiles exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      notifyError("Failed to export profiles");
    }
  };

  return (
    <div className="p-4 md:p-6 text-slate-800">
      <h1 className="text-2xl font-bold mb-4">All Matrimony Profiles</h1>

      {/* FILTER BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
        <select className="input" value={filters.city} onChange={(e) => handleFilterChange("city", e.target.value)}>
          <option value="">City</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select className="input" value={filters.sect} onChange={(e) => handleFilterChange("sect", e.target.value)}>
          <option value="">Sect</option>
          <option>Sunni</option>
          <option>Shia</option>
        </select>

        <select className="input" value={filters.gender} onChange={(e) => handleFilterChange("gender", e.target.value)}>
          <option value="">Gender</option>
          <option value="male">Ladka</option>
          <option value="female">Ladki</option>
        </select>

        <select className="input" value={filters.minAge} onChange={(e) => handleFilterChange("minAge", e.target.value)}>
          <option value="">Min Age</option>
          {ageOptions.map((age) => (
            <option key={`min-${age}`} value={age}>{age}</option>
          ))}
        </select>

        <select className="input" value={filters.maxAge} onChange={(e) => handleFilterChange("maxAge", e.target.value)}>
          <option value="">Max Age</option>
          {ageOptions.map((age) => (
            <option key={`max-${age}`} value={age}>{age}</option>
          ))}
        </select>

        <select className="input" value={filters.occupation} onChange={(e) => handleFilterChange("occupation", e.target.value)}>
          <option value="">Occupation</option>
          {occupationOptions.map((occupation) => (
            <option key={occupation} value={occupation}>{occupation}</option>
          ))}
        </select>

        <select className="input" value={filters.caste} onChange={(e) => handleFilterChange("caste", e.target.value)}>
          <option value="">Caste</option>
          {casteOptions.map((caste) => (
            <option key={caste} value={caste}>{caste}</option>
          ))}
        </select>

        <select className="input" value={filters.income} onChange={(e) => handleFilterChange("income", e.target.value)}>
          <option value="">Income</option>
          {incomeOptions.map((income) => (
            <option key={income} value={income}>{income}</option>
          ))}
        </select>

        <button
          onClick={applyFilter}
          className="btn-primary col-span-1 justify-center py-2"
        >
          Apply
        </button>

        <button
          onClick={clearFilter}
          className="btn-outline col-span-1 justify-center py-2"
        >
          Clear
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTableView(!tableView)}
          className="bg-slate-200 px-3 py-1 rounded"
        >
          {tableView ? 'Show Cards' : 'Show Table'}
        </button>
        <button
          onClick={exportCSV}
          className="btn-outline px-3 py-1"
        >
          Export CSV
        </button>
        <Link
          to="/admin/profiles/create"
          className="btn-primary px-3 py-1"
        >
          Create Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tableView ? (
          <div className="col-span-1 md:col-span-2 overflow-auto rounded bg-white text-slate-800">
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
            <div key={p._id} className="border rounded p-4 shadow-sm bg-white text-slate-800">
              <h2 className="font-semibold text-lg">{p.name}</h2>

              <p className="text-sm text-gray-600">{p.gender} | {p.maritalStatus}</p>

              <p className="text-sm text-slate-700">📍 {p.city}, {p.state}</p>
              <p className="text-sm text-slate-700">🕌 Sect: {p.sect}</p>
              <p className="text-sm text-slate-700">🎓 {p.education}</p>
              <p className="text-sm text-slate-700">💼 {p.occupation}</p>
              <p className="text-sm text-slate-700">📞 {p.mobile}</p>

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

              <p className="mt-2 text-sm text-slate-700">Status: {p.isApproved ? (<span className="text-green-600 font-semibold">Approved</span>) : (<span className="text-yellow-600 font-semibold">Pending</span>)}</p>

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
          <div className="bg-white text-slate-800 p-6 max-w-2xl w-full rounded">
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
