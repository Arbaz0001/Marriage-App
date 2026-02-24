import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { notifyError, notifySuccess } from "../../services/notify";

export default function AdminCreate() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState({
    // Account
    name: "",
    email: "",
    password: "",
    mobile: "",

    // Basic
    gender: "male",
    dob: "",
    maritalStatus: "",
    profileCreatedBy: "admin",

    // Religion
    sect: "",
    motherTongue: "",

    // Location
    country: "India",
    state: "",
    city: "",

    // Education & Work
    education: "",
    occupation: "",
    income: "",

    // Family
    fatherOccupation: "",
    motherOccupation: "",
    familyType: "",
    fatherName: "",
    motherName: "",
    siblings: "",

    // Lifestyle
    height: "",
    diet: "Halal",
    complexion: "",
    caste: "",

    // Contact
    whatsapp: "",

    // About
    about: "",
    age: "",
  });

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        if (form[k] !== undefined && form[k] !== null && form[k] !== "") {
          fd.append(k, form[k]);
        }
      });
      if (photo) fd.append("profilePic", photo);

      // Note: Don't set Content-Type header; browser will set it with boundary
      await API.post("/admin/users", fd, { headers });
      notifySuccess("User and profile created successfully!");
      navigate("/admin/profiles");
    } catch (err) {
      console.error("Submit error:", err);
      notifyError(err.response?.data?.message || err.message || "Failed to create profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] flex justify-center items-start py-8">
      <form onSubmit={submit} className="bg-white w-full max-w-4xl p-4 md:p-6 rounded shadow space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-900">Create User & Profile (Admin)</h2>

        {/* ACCOUNT INFO */}
        <section>
          <h3 className="font-semibold mb-2">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input type="password" className="input" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <input className="input" placeholder="Mobile Number" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} />
          </div>
        </section>

        {/* BASIC DETAILS */}
        <section>
          <h3 className="font-semibold mb-2">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="input" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input type="date" className="input" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} />
            <select className="input" value={form.maritalStatus} onChange={e=>setForm({...form,maritalStatus:e.target.value})}>
              <option value="">Marital Status</option>
              <option>Never Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>
            <select className="input" value={form.profileCreatedBy} onChange={e=>setForm({...form,profileCreatedBy:e.target.value})}>
              <option value="admin">Profile Created By</option>
              <option value="admin">Admin</option>
              <option value="Self">Self</option>
            </select>
          </div>
        </section>

        {/* RELIGION */}
        <section>
          <h3 className="font-semibold mb-2">Religious Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="input" value={form.sect} onChange={e=>setForm({...form,sect:e.target.value})}>
              <option value="">Sect</option>
              <option>Sunni</option>
              <option>Shia</option>
            </select>
            <input className="input" placeholder="Mother Tongue" value={form.motherTongue} onChange={e=>setForm({...form,motherTongue:e.target.value})} />
          </div>
        </section>

        {/* LOCATION */}
        <section>
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="State / Village" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} />
            <input className="input" placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} />
          </div>
        </section>

        {/* EDUCATION & WORK */}
        <section>
          <h3 className="font-semibold mb-2">Education & Occupation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Highest Education" value={form.education} onChange={e=>setForm({...form,education:e.target.value})} />
            <input className="input" placeholder="Occupation" value={form.occupation} onChange={e=>setForm({...form,occupation:e.target.value})} />
            <input className="input" placeholder="Annual Income" value={form.income} onChange={e=>setForm({...form,income:e.target.value})} />
          </div>
        </section>

        {/* FAMILY */}
        <section>
          <h3 className="font-semibold mb-2">Family Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Father's Name" value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})} />
            <input className="input" placeholder="Mother's Name" value={form.motherName} onChange={e=>setForm({...form,motherName:e.target.value})} />
            <input className="input" placeholder="Father's Occupation" value={form.fatherOccupation} onChange={e=>setForm({...form,fatherOccupation:e.target.value})} />
            <input className="input" placeholder="Mother's Occupation" value={form.motherOccupation} onChange={e=>setForm({...form,motherOccupation:e.target.value})} />
            <select className="input" value={form.familyType} onChange={e=>setForm({...form,familyType:e.target.value})}>
              <option value="">Family Type</option>
              <option>Joint</option>
              <option>Nuclear</option>
            </select>
          </div>
          <textarea className="input h-24 mt-3" placeholder="Siblings details" value={form.siblings} onChange={e=>setForm({...form,siblings:e.target.value})} />
        </section>

        {/* LIFESTYLE */}
        <section>
          <h3 className="font-semibold mb-2">Lifestyle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Height e.g. 6 ft 2 in" value={form.height} onChange={e=>setForm({...form,height:e.target.value})} />
            <input className="input" placeholder="Complexion e.g. Fair" value={form.complexion} onChange={e=>setForm({...form,complexion:e.target.value})} />
            <input className="input" placeholder="Caste / Path" value={form.caste} onChange={e=>setForm({...form,caste:e.target.value})} />
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h3 className="font-semibold mb-2">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="WhatsApp number (optional)" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h3 className="font-semibold mb-2">About Yourself</h3>
          <textarea className="input h-24" placeholder="Brief introduction" value={form.about} onChange={e=>setForm({...form,about:e.target.value})} />
        </section>

        {/* PHOTO UPLOAD */}
        <section>
          <h3 className="font-semibold mb-2">Profile Photo</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="input"
          />
          {photo && <p className="text-green-600 text-sm mt-2">✓ {photo.name}</p>}
        </section>

        <button className="btn-primary w-full justify-center py-3 rounded font-semibold">Create User & Profile</button>
      </form>
    </div>
  );
}
