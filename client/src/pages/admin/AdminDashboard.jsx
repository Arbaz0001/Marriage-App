import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import jsPDF from "jspdf";
import defaultImage from "../../assets/53897.jpg";
import { notifyError, notifyInfo, notifySuccess } from "../../services/notify";

export default function AdminDashboard() {
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
  const [stats, setStats] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  const ageOptions = Array.from({ length: 33 }, (_, index) => String(index + 18));
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

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

  const hasActiveFilters =
    filters.city ||
    filters.sect ||
    filters.gender ||
    filters.occupation ||
    filters.caste ||
    filters.income ||
    filters.minAge ||
    filters.maxAge;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getHeaders();
        const profilesRes = await API.get("/admin/profiles", { headers });
        setAllProfiles(profilesRes.data);
        setProfiles(profilesRes.data);
        
        const statsRes = await API.get("/admin/stats", { headers });
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        notifyError("Failed to load dashboard data");
      }
    };
    fetchData();
  }, []);

  const applyFilter = async (filterData = filters) => {
    try {
      const minAge = filterData.minAge ? Number(filterData.minAge) : null;
      const maxAge = filterData.maxAge ? Number(filterData.maxAge) : null;

      const params = { ...filterData };

      if (minAge !== null && maxAge !== null) {
        params.minAge = String(Math.min(minAge, maxAge));
        params.maxAge = String(Math.max(minAge, maxAge));
      }

      const headers = getHeaders();
      const { data } = await API.get("/admin/profiles/filter", { headers, params });
      setProfiles(data);
      notifyInfo(`Found ${data.length} profile(s)`);
    } catch (error) {
      console.error("Error applying filters:", error);
      notifyError("Failed to apply filters");
    }
  };

  const handleGenderStatFilter = async (gender) => {
    const nextGender = filters.gender === gender ? "" : gender;
    const nextFilters = { ...filters, gender: nextGender };
    setFilters(nextFilters);
    await applyFilter(nextFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setProfiles(allProfiles);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPosition = 10;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const lineHeight = 8;
    const colWidth = (pageWidth - 2 * margin) / 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Marriage App - User Report', margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    doc.text(`Total Users: ${profiles.length}`, pageWidth / 2, yPosition);
    yPosition += 8;

    doc.setFillColor(220, 100, 140);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Name', margin + 2, yPosition + 5);
    doc.text('Gender', margin + colWidth + 2, yPosition + 5);
    doc.text('City', margin + 2 * colWidth + 2, yPosition + 5);
    yPosition += 10;

    doc.setTextColor(0, 0, 0);
    profiles.forEach(p => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
      }
      doc.text(p.name?.substring(0, 20) || '—', margin + 2, yPosition);
      doc.text(p.gender || '—', margin + colWidth + 2, yPosition);
      doc.text(p.city || '—', margin + 2 * colWidth + 2, yPosition);
      yPosition += lineHeight;
    });

    doc.save('marriage-app-report.pdf');
  };

  const downloadExcel = () => {
    const headers = ['Name', 'Email', 'Gender', 'City', 'Education', 'Occupation', 'Status'];
    const rows = profiles.map(p => [
      p.name || '—',
      p.user?.email || '—',
      p.gender || '—',
      p.city || '—',
      p.education || '—',
      p.occupation || '—',
      p.isApproved ? 'Approved' : 'Pending'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marriage-app-report.csv';
    a.click();
    globalThis.URL.revokeObjectURL(url);
    notifySuccess("Excel report downloaded");
  };

  const deleteProfile = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      await API.delete(`/admin/profiles/${id}`, { headers });
      setProfiles(profiles.filter((p) => p._id !== id));
      notifySuccess("Profile deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      notifyError("Failed to delete profile");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      await API.patch(`/admin/profiles/${id}/approve`, { status }, { headers });
      const updated = profiles.map((p) => (p._id === id ? { ...p, isApproved: status } : p));
      setProfiles(updated);
      if (selectedProfile?._id === id) setSelectedProfile({ ...selectedProfile, isApproved: status });
      notifySuccess(status ? "Profile approved" : "Profile rejected");
    } catch (error) {
      console.error("Status update error:", error);
      notifyError("Failed to update status");
    }
  };

  const refreshData = async () => {
    try {
      const headers = getHeaders();
      const profilesRes = await API.get("/admin/profiles", { headers });
      setAllProfiles(profilesRes.data);
      setProfiles(profilesRes.data);
      setFilters(defaultFilters);
      
      const statsRes = await API.get("/admin/stats", { headers });
      setStats(statsRes.data);
      notifySuccess("Dashboard updated");
    } catch (error) {
      console.error("Error refreshing data:", error);
      notifyError("Failed to refresh data");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Admin Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={refreshData}
            className="btn-outline px-4 py-2"
          >
            🔄 Refresh
          </button>
          <Link
            to="/admin/profiles/create"
            className="btn-primary px-4 py-2"
          >
            + New User
          </Link>
          <Link
            to="/admin/profiles"
            className="btn-primary px-4 py-2"
          >
            All Profiles
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded shadow text-center cursor-pointer hover:shadow-lg transition" onClick={() => { clearAllFilters(); }}>
          <div className="text-3xl font-bold text-blue-900">{stats.totalUsers || 0}</div>
          <div className="text-gray-600 text-sm">Total Users</div>
        </div>
        <div className={`bg-white p-4 md:p-6 rounded shadow text-center cursor-pointer hover:shadow-lg transition ${ filters.gender === 'male' ? 'ring-2 ring-blue-600' : ''}`} onClick={() => handleGenderStatFilter('male')}>
          <div className="text-3xl font-bold text-blue-600">{stats.male || 0}</div>
          <div className="text-gray-600 text-sm">Male</div>
        </div>
        <div className={`bg-white p-4 md:p-6 rounded shadow text-center cursor-pointer hover:shadow-lg transition ${ filters.gender === 'female' ? 'ring-2 ring-purple-600' : ''}`} onClick={() => handleGenderStatFilter('female')}>
          <div className="text-3xl font-bold text-purple-600">{stats.female || 0}</div>
          <div className="text-gray-600 text-sm">Female</div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* City Filter */}
          <div>
            <label htmlFor="dashboard-filter-city" className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <select id="dashboard-filter-city" value={filters.city} onChange={(e) => handleFilterChange("city", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Cities</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Sect Filter */}
          <div>
            <label htmlFor="dashboard-filter-sect" className="block text-sm font-semibold text-gray-700 mb-2">Sect</label>
            <select id="dashboard-filter-sect" value={filters.sect} onChange={(e) => handleFilterChange("sect", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Sects</option>
              <option value="Sunni">Sunni</option>
              <option value="Shia">Shia</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label htmlFor="dashboard-filter-gender" className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
            <select id="dashboard-filter-gender" value={filters.gender} onChange={(e) => handleFilterChange("gender", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="male">Ladka</option>
              <option value="female">Ladki</option>
            </select>
          </div>

          {/* Min Age Filter */}
          <div>
            <label htmlFor="dashboard-filter-min-age" className="block text-sm font-semibold text-gray-700 mb-2">Min Age</label>
            <select id="dashboard-filter-min-age" value={filters.minAge} onChange={(e) => handleFilterChange("minAge", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Min Age</option>
              {ageOptions.map((age) => (
                <option key={`min-${age}`} value={age}>{age}</option>
              ))}
            </select>
          </div>

          {/* Max Age Filter */}
          <div>
            <label htmlFor="dashboard-filter-max-age" className="block text-sm font-semibold text-gray-700 mb-2">Max Age</label>
            <select id="dashboard-filter-max-age" value={filters.maxAge} onChange={(e) => handleFilterChange("maxAge", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Max Age</option>
              {ageOptions.map((age) => (
                <option key={`max-${age}`} value={age}>{age}</option>
              ))}
            </select>
          </div>

          {/* Occupation Filter */}
          <div>
            <label htmlFor="dashboard-filter-occupation" className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
            <select id="dashboard-filter-occupation" value={filters.occupation} onChange={(e) => handleFilterChange("occupation", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Occupations</option>
              {occupationOptions.map((occupation) => (
                <option key={occupation} value={occupation}>{occupation}</option>
              ))}
            </select>
          </div>

          {/* Caste Filter */}
          <div>
            <label htmlFor="dashboard-filter-caste" className="block text-sm font-semibold text-gray-700 mb-2">Caste</label>
            <select id="dashboard-filter-caste" value={filters.caste} onChange={(e) => handleFilterChange("caste", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Castes</option>
              {casteOptions.map(caste => (
                <option key={caste} value={caste}>{caste}</option>
              ))}
            </select>
          </div>

          {/* Income Filter */}
          <div>
            <label htmlFor="dashboard-filter-income" className="block text-sm font-semibold text-gray-700 mb-2">Income</label>
            <select id="dashboard-filter-income" value={filters.income} onChange={(e) => handleFilterChange("income", e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Income</option>
              {incomeOptions.map((income) => (
                <option key={income} value={income}>{income}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end">
            <button onClick={() => applyFilter()} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm">
              Apply
            </button>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold text-sm">
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2">
          📊 Excel Export
        </button>
        <button onClick={downloadPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2">
          📄 PDF Download
        </button>
      </div>

      {/* IDENTITY CARDS */}
      <h2 className="text-xl font-bold text-white mb-4">
        Profile Cards {profiles.length < allProfiles.length && `(${profiles.length} of ${allProfiles.length})`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {profiles.map((p) => {
          const base = API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000";
          const photoUrl = p.photos?.length > 0 ? (p.photos[0].startsWith("http") ? p.photos[0] : `${base}/${p.photos[0]}`) : defaultImage;
          
          return (
            <div
              key={p._id}
              onClick={() => setSelectedProfile(p)}
              className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
            >
              {/* Card Header */}
              <div className="bg-blue-900 text-white p-3 text-center text-sm font-bold">PROFILE CARD</div>

              {/* Photo & Basic Info */}
              <div className="p-4 bg-white">
                <div className="flex gap-4">
                  {/* Photo */}
                  <div className="w-24 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src={defaultImage} alt="Default Profile" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-sm">
                    <h3 className="font-bold text-gray-800">{p.name || p.user?.name || "No Name"}</h3>
                    <p className="text-gray-600 text-xs">{p.gender?.toUpperCase()} • {p.age || "—"} yrs</p>
                    <p className="text-gray-600 text-xs mt-1">📍 {p.city}, {p.state}</p>
                    <p className="text-gray-600 text-xs">🎓 {p.education || "—"}</p>
                    <p className="text-gray-600 text-xs">💼 {p.occupation || "—"}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  {p.isApproved ? (
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-semibold">✓ Approved</span>
                  ) : (
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">⏳ Pending</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILS MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Profile Details</h2>
              <button onClick={() => setSelectedProfile(null)} className="text-2xl font-bold">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto text-slate-800">
              {/* Photo & Basic */}
              <div className="flex gap-6">
                {selectedProfile.photos?.length > 0 ? (
                  <img src={`${API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000"}/${selectedProfile.photos[0]}`} alt={selectedProfile.name} className="w-40 h-48 rounded object-cover" />
                ) : (
                  <img src={defaultImage} alt="Default Profile" className="w-40 h-48 rounded object-cover" />
                )}
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedProfile.name || selectedProfile.user?.name}</h3>
                  <p className="text-gray-600 mb-3">{selectedProfile.gender} • {selectedProfile.age || "—"} years • {selectedProfile.maritalStatus}</p>
                  
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>📧 Email:</strong> {selectedProfile.user?.email || "—"}</p>
                    <p><strong>📞 Mobile:</strong> {selectedProfile.mobile || "—"}</p>
                    <p><strong>📱 WhatsApp:</strong> {selectedProfile.whatsapp || "—"}</p>
                    <p><strong>📍 Location:</strong> {selectedProfile.city}, {selectedProfile.state}</p>
                  </div>
                </div>
              </div>

              {/* Religion & Lifestyle */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="font-semibold text-gray-700">Sect</p>
                  <p className="text-gray-600">{selectedProfile.sect || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Mother Tongue</p>
                  <p className="text-gray-600">{selectedProfile.motherTongue || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Height</p>
                  <p className="text-gray-600">{selectedProfile.height || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Complexion</p>
                  <p className="text-gray-600">{selectedProfile.complexion || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Caste</p>
                  <p className="text-gray-600">{selectedProfile.caste || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Family Type</p>
                  <p className="text-gray-600">{selectedProfile.familyType || "—"}</p>
                </div>
              </div>

              {/* Education & Work */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="font-semibold text-gray-700">Education</p>
                  <p className="text-gray-600">{selectedProfile.education || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Occupation</p>
                  <p className="text-gray-600">{selectedProfile.occupation || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Income</p>
                  <p className="text-gray-600">{selectedProfile.income || "—"}</p>
                </div>
              </div>

              {/* Family */}
              <div className="space-y-2 text-sm text-slate-700 border-t pt-4">
                <p><strong>Father:</strong> {selectedProfile.fatherName || "—"} ({selectedProfile.fatherOccupation || "—"})</p>
                <p><strong>Mother:</strong> {selectedProfile.motherName || "—"} ({selectedProfile.motherOccupation || "—"})</p>
                <p><strong>Siblings:</strong> {selectedProfile.siblings || "—"}</p>
              </div>

              {/* About */}
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700 mb-2">About</p>
                <p className="text-sm text-gray-600">{selectedProfile.about || "—"}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex gap-2 flex-wrap justify-between border-t">
              <div className="flex gap-2">
                {!selectedProfile.isApproved && (
                  <button onClick={() => updateStatus(selectedProfile._id, true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm">
                    Approve
                  </button>
                )}
                {selectedProfile.isApproved && (
                  <button onClick={() => updateStatus(selectedProfile._id, false)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold text-sm">
                    Reject
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/admin/profiles/edit/${selectedProfile._id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm">
                  Edit
                </Link>
                <button onClick={() => { deleteProfile(selectedProfile._id); setSelectedProfile(null); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm">
                  Delete
                </button>
                <button onClick={() => setSelectedProfile(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    