import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import defaultImage from "../../assets/53897.jpg";
import { notifyError, notifySuccess } from "../../services/notify";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "male",
    dob: "",
    maritalStatus: "",
    sect: "",
    motherTongue: "",
    country: "India",
    state: "",
    city: "",
    education: "",
    occupation: "",
    income: "",
    fatherOccupation: "",
    motherOccupation: "",
    familyType: "",
    fatherName: "",
    motherName: "",
    siblings: "",
    height: "",
    diet: "Halal",
    complexion: "",
    caste: "",
    whatsapp: "",
    about: "",
  });

  useEffect(() => {
    API.get(`/profile/${id}`).then(res => {
      const p = res.data;
      // Format DOB from ISO to yyyy-MM-dd
      const dobFormatted = p.dob ? new Date(p.dob).toISOString().split('T')[0] : '';
      setForm({...p, dob: dobFormatted});
    }).catch(() => {
      API.get("/profile").then(res => {
        const profile = res.data.find(p => p._id === id);
        if (profile) {
          const dobFormatted = profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '';
          setForm({...profile, dob: dobFormatted});
        }
      });
    });
  }, [id]);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // Only include profile-specific fields (not user fields like email)
      const profileFields = [
        "name", "gender", "dob", "mobile", "sect", "motherTongue", 
        "country", "state", "city", "education", "occupation", "income",
        "height", "complexion", "caste", "fatherOccupation", "motherOccupation",
        "familyType", "fatherName", "motherName", "siblings", "whatsapp",
        "diet", "about", "maritalStatus", "age"
      ];
      
      const fd = new FormData();
      profileFields.forEach((k) => {
        if (form[k] !== undefined && form[k] !== null && form[k] !== "") {
          fd.append(k, form[k]);
        }
      });
      if (photo) fd.append("profilePic", photo);
      
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      await API.put(`/admin/profiles/${id}`, fd, { headers });
      notifySuccess("Profile updated successfully!");
      navigate("/admin/profiles");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      notifyError(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  const base = API.defaults.baseURL?.replace(/\/api\/?$/i, "") || "http://localhost:5000";
  const photoUrl = form.photos?.length > 0 ? (form.photos[0].startsWith("http") ? form.photos[0] : `${base}/${form.photos[0]}`) : defaultImage;

  return (
    <div className="min-h-screen bg-[#eef4ff] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="bg-blue-900 text-white p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>
        <form onSubmit={submitHandler} className="p-6 space-y-6">

        {/* ACCOUNT */}
        <section>
          <h3 className="font-semibold mb-2">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Name" value={form.name || ''} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="input" placeholder="Email" type="email" value={form.email || ''} onChange={e=>setForm({...form,email:e.target.value})} />
            <input className="input" placeholder="Mobile" value={form.mobile || ''} onChange={e=>setForm({...form,mobile:e.target.value})} />
          </div>
        </section>

        {/* BASIC */}
        <section>
          <h3 className="font-semibold mb-2">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="input" value={form.gender || 'male'} onChange={e=>setForm({...form,gender:e.target.value})}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input className="input" placeholder="Date of Birth (YYYY-MM-DD)" type="date" value={form.dob || ''} onChange={e=>setForm({...form,dob:e.target.value})} />
            <select className="input" value={form.maritalStatus || ''} onChange={e=>setForm({...form,maritalStatus:e.target.value})}>
              <option value="">Marital Status</option>
              <option>Never Married</option>
              <option>Widowed</option>
              <option>Divorced</option>
            </select>
          </div>
        </section>

        {/* RELIGION */}
        <section>
          <h3 className="font-semibold mb-2">Religion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Sect" value={form.sect || ''} onChange={e=>setForm({...form,sect:e.target.value})} />
            <input className="input" placeholder="Mother Tongue" value={form.motherTongue || ''} onChange={e=>setForm({...form,motherTongue:e.target.value})} />
          </div>
        </section>

        {/* LOCATION */}
        <section>
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Country" value={form.country || 'India'} onChange={e=>setForm({...form,country:e.target.value})} />
            <input className="input" placeholder="State" value={form.state || ''} onChange={e=>setForm({...form,state:e.target.value})} />
            <input className="input" placeholder="City" value={form.city || ''} onChange={e=>setForm({...form,city:e.target.value})} />
          </div>
        </section>

        {/* EDUCATION & WORK */}
        <section>
          <h3 className="font-semibold mb-2">Education & Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Education" value={form.education || ''} onChange={e=>setForm({...form,education:e.target.value})} />
            <input className="input" placeholder="Occupation" value={form.occupation || ''} onChange={e=>setForm({...form,occupation:e.target.value})} />
            <input className="input" placeholder="Annual Income" value={form.income || ''} onChange={e=>setForm({...form,income:e.target.value})} />
          </div>
        </section>

        {/* FAMILY */}
        <section>
          <h3 className="font-semibold mb-2">Family Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Father's Name" value={form.fatherName || ''} onChange={e=>setForm({...form,fatherName:e.target.value})} />
            <input className="input" placeholder="Mother's Name" value={form.motherName || ''} onChange={e=>setForm({...form,motherName:e.target.value})} />
            <input className="input" placeholder="Father's Occupation" value={form.fatherOccupation || ''} onChange={e=>setForm({...form,fatherOccupation:e.target.value})} />
            <input className="input" placeholder="Mother's Occupation" value={form.motherOccupation || ''} onChange={e=>setForm({...form,motherOccupation:e.target.value})} />
            <select className="input" value={form.familyType || ''} onChange={e=>setForm({...form,familyType:e.target.value})}>
              <option value="">Family Type</option>
              <option>Joint</option>
              <option>Nuclear</option>
            </select>
          </div>
          <textarea className="input h-24 mt-3" placeholder="Siblings details" value={form.siblings || ''} onChange={e=>setForm({...form,siblings:e.target.value})} />
        </section>

        {/* LIFESTYLE */}
        <section>
          <h3 className="font-semibold mb-2">Lifestyle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Height e.g. 6 ft 2 in" value={form.height || ''} onChange={e=>setForm({...form,height:e.target.value})} />
            <input className="input" placeholder="Complexion e.g. Fair" value={form.complexion || ''} onChange={e=>setForm({...form,complexion:e.target.value})} />
            <input className="input" placeholder="Caste / Path" value={form.caste || ''} onChange={e=>setForm({...form,caste:e.target.value})} />
            <select className="input" value={form.diet || 'Halal'} onChange={e=>setForm({...form,diet:e.target.value})}>
              <option>Halal</option>
              <option>Vegetarian</option>
              <option>Non Vegetarian</option>
              <option>Jain</option>
            </select>
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h3 className="font-semibold mb-2">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="WhatsApp number (optional)" value={form.whatsapp || ''} onChange={e=>setForm({...form,whatsapp:e.target.value})} />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h3 className="font-semibold mb-2">About Yourself</h3>
          <textarea className="input h-24" placeholder="Brief introduction" value={form.about || ''} onChange={e=>setForm({...form,about:e.target.value})} />
        </section>

        {/* PHOTO UPLOAD */}
        <section>
          <h3 className="font-semibold mb-4 text-lg">Profile Photo</h3>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Current Photo Preview */}
            <div className="flex-shrink-0">
              <img
                src={photo ? URL.createObjectURL(photo) : photoUrl}
                alt="Profile"
                className="w-40 h-48 rounded-lg object-cover border-2 border-gray-300"
              />
              <p className="text-xs text-gray-600 mt-2 text-center">Current Photo</p>
            </div>

            {/* Upload Section */}
            <div className="flex-1">
              <label className="block mb-2 font-semibold text-gray-700">Upload New Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none cursor-pointer hover:border-blue-800 transition"
              />
              {photo && (
                <p className="text-green-600 text-sm mt-2 font-semibold">✓ New image selected: {photo.name}</p>
              )}
              <p className="text-gray-600 text-xs mt-3">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
            </div>
          </div>
        </section>

        <div className="flex gap-2 flex-wrap justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/profiles")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-900 to-slate-900 hover:shadow-lg text-white px-6 py-2 rounded font-bold transition"
          >
            Save Changes
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
