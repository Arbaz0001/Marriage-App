import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    // Account
    name: "",
    email: "",
    password: "",
    mobile: "",

    // Basic
    gender: "",
    dob: "",
    maritalStatus: "",
    profileCreatedBy: "",

    // Religion (Muslim specific)
    sect: "", // Sunni / Shia
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

    // Lifestyle
    height: "",
    diet: "Halal",
    complexion: "",
    caste: "",

    // family names / siblings
    fatherName: "",
    motherName: "",
    siblings: "",

    // additional contact
    whatsapp: "",
    age: "",

    // About
    about: "",
  });
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const computeAgeFromDob = (dob) => {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const age = computeAgeFromDob(value);
      setForm({ ...form, [name]: value, age });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // 1) register user (creates User)
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        gender: form.gender,
      });

      // 2) login to get token
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = loginRes.data.token;
      // persist token + user for subsequent requests
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      // 3) create profile with image using multipart/form-data
      const fd = new FormData();
      // append all profile fields
      Object.keys(form).forEach((k) => {
        if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
      });
      if (photo) fd.append("profilePic", photo);

      await API.post("/profile", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Registration complete — profile created.");
      navigate("/matches");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8">
      <form
        onSubmit={submitHandler}
        className="bg-white w-full max-w-3xl p-6 rounded shadow space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-pink-600">
          Muslim Matrimony Registration
        </h2>

        {/* ACCOUNT INFO */}
        <section>
          <h3 className="font-semibold mb-2">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="name" placeholder="Full Name" onChange={handleChange} value={form.name} className="input" />
            <input name="email" placeholder="Email" onChange={handleChange} value={form.email} className="input" />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} value={form.password} className="input" />
            <input name="mobile" placeholder="Mobile Number" onChange={handleChange} value={form.mobile} className="input" />
          </div>
        </section>

        {/* BASIC DETAILS */}
        <section>
          <h3 className="font-semibold mb-2">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="gender" value={form.gender} onChange={handleChange} className="input">
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
              <div className="flex gap-2 items-center">
                <input type="date" name="dob" value={form.dob || ''} onChange={handleChange} className="input" />
                <div className="text-sm text-gray-700 px-3 py-1 bg-gray-100 rounded">{form.age ? `${form.age} yrs` : "Age"}</div>
              </div>
            </div>

            <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="input">
              <option value="">Marital Status</option>
              <option>Never Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
            </select>

            <select name="profileCreatedBy" value={form.profileCreatedBy} onChange={handleChange} className="input">
              <option value="">Profile Created By</option>
              <option>Self</option>
              <option>Parent</option>
              <option>Guardian</option>
            </select>
          </div>
        </section>

        {/* RELIGION */}
        <section>
          <h3 className="font-semibold mb-2">Religious Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="sect" value={form.sect} onChange={handleChange} className="input">
              <option value="">Sect</option>
              <option>Sunni</option>
              <option>Shia</option>
            </select>

            <input name="motherTongue" placeholder="Mother Tongue" onChange={handleChange} value={form.motherTongue || ''} className="input" />
          </div>
        </section>

        {/* LOCATION */}
        <section>
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="state" placeholder="State / Village" onChange={handleChange} value={form.state || ''} className="input" />
            <input name="city" placeholder="City" onChange={handleChange} value={form.city || ''} className="input" />
          </div>
        </section>

        {/* CONTACT - WhatsApp */}
        <section>
          <h3 className="font-semibold mb-2">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="mobile" placeholder="Mobile number" onChange={handleChange} value={form.mobile} className="input" />
            <input name="whatsapp" placeholder="WhatsApp number (optional) e.g. 8306884318" onChange={handleChange} value={form.whatsapp} className="input" />
          </div>
        </section>

        {/* EDUCATION & WORK */}
        <section>
          <h3 className="font-semibold mb-2">Education & Occupation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="education" placeholder="Highest Education" onChange={handleChange} value={form.education || ''} className="input" />
            <input name="occupation" placeholder="Occupation" onChange={handleChange} value={form.occupation || ''} className="input" />
            <input name="income" placeholder="Annual Income" onChange={handleChange} value={form.income || ''} className="input" />
          </div>
        </section>

        {/* FAMILY */}
        <section>
          <h3 className="font-semibold mb-2">Family Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="fatherName" placeholder="Father's Name e.g. Riyaz Mohammed" onChange={handleChange} value={form.fatherName || ''} className="input" />
            <input name="motherName" placeholder="Mother's Name e.g. Jahan" onChange={handleChange} value={form.motherName || ''} className="input" />
            <input name="fatherOccupation" placeholder="Father's Occupation" onChange={handleChange} value={form.fatherOccupation || ''} className="input" />
            <input name="motherOccupation" placeholder="Mother's Occupation" onChange={handleChange} value={form.motherOccupation || ''} className="input" />
            <select name="familyType" value={form.familyType} onChange={handleChange} className="input">
              <option value="">Family Type</option>
              <option>Joint</option>
              <option>Nuclear</option>
            </select>
          </div>

          <textarea name="siblings" placeholder="Siblings details (e.g. 1 brother married, 1 brother unmarried, sister married)" onChange={handleChange} value={form.siblings || ''} className="input h-24 mt-3" />
        </section>

        {/* LIFESTYLE */}
        <section>
          <h3 className="font-semibold mb-2">Lifestyle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="height" placeholder="Height e.g. 6 ft 2 in" onChange={handleChange} value={form.height || ''} className="input" />
            <input name="complexion" placeholder="Complexion e.g. Fair" onChange={handleChange} value={form.complexion || ''} className="input" />
            <input name="caste" placeholder="Caste / Path e.g. Pathan" onChange={handleChange} value={form.caste || ''} className="input" />
            <input value="Halal" disabled className="input bg-gray-100 col-span-1 md:col-span-2" />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h3 className="font-semibold mb-2">About Yourself</h3>
          <textarea
            name="about"
            placeholder="Brief introduction"
            onChange={handleChange}
            value={form.about}
            className="input h-24"
          />
        </section>

        {/* PHOTO UPLOAD */}
        <section>
          <h3 className="font-semibold mb-2">Profile Photo</h3>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="block"
            />
            <div className="text-sm text-gray-500">Upload one clear portrait photo</div>
          </div>
        </section>

        <button className="w-full bg-pink-600 text-white py-3 rounded font-semibold">
          Register Profile
        </button>
      </form>
    </div>
  );
}
