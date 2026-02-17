import User from "../models/User.js";
import Profile from "../models/Profile.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Profile.deleteMany({ user: req.params.id });
  res.json({ message: "User deleted" });
};

// ➕ Create a user and its profile (admin)
export const createUserWithProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      // profile fields
      dob,
      mobile,
      sect,
      motherTongue,
      state,
      city,
      education,
      occupation,
      income,
      height,
      complexion,
      caste,
      fatherName,
      motherName,
      siblings,
      whatsapp,
      about,
      maritalStatus,
      fatherOccupation,
      motherOccupation,
      familyType,
      age,
      diet,
      country,
      profileCreatedBy,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password || "password123", 10);
    const user = await User.create({ name, email, password: hashed, gender });

    const profileData = {
      user: user._id,
      name,
      gender,
      dob,
      mobile,
      sect,
      motherTongue,
      state,
      city,
      education,
      occupation,
      income,
      height,
      complexion,
      caste,
      fatherName,
      motherName,
      siblings,
      whatsapp,
      about,
      maritalStatus,
      fatherOccupation,
      motherOccupation,
      familyType,
      age,
      diet,
      country,
      profileCreatedBy: "admin",
      isApproved: true,
    };

    // Handle uploaded photo
    if (req.file) {
      profileData.photos = [req.file.path];
    }

    const profile = await Profile.create(profileData);
    res.status(201).json({ user, profile });
  } catch (err) {
    console.error("createUserWithProfile error:", err);
    res.status(500).json({ message: err.message || "Profile creation failed" });
  }
};


// 👀 GET ALL PROFILES
export const getAllProfiles = async (req, res) => {
  const profiles = await Profile.find().populate("user", "email");
  res.json(profiles);
};

// 🗑️ DELETE PROFILE
export const deleteProfile = async (req, res) => {
  await Profile.findByIdAndDelete(req.params.id);
  res.json({ message: "Profile deleted successfully" });
};


export const getStats = async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const male = await User.countDocuments({ role: "user", gender: "male" });
  const female = await User.countDocuments({ role: "user", gender: "female" });

  res.json({
    totalUsers,
    male,
    female,
  });
};

// ✅ APPROVE / REJECT PROFILE
export const approveProfile = async (req, res) => {
  const { status } = req.body; // true / false

  const profile = await Profile.findByIdAndUpdate(
    req.params.id,
    { isApproved: status },
    { new: true }
  );

  res.json(profile);
};


export const updateProfile = async (req, res) => {
  try {
    console.log("updateProfile called with id:", req.params.id);
    console.log("updateProfile req.body:", req.body);
    console.log("updateProfile req.file:", req.file);
    
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Profile ID required" });

    // Only allow these fields to be updated
    const allowedFields = [
      "name", "gender", "dob", "mobile", "sect", "motherTongue", 
      "country", "state", "city", "education", "occupation", "income",
      "height", "complexion", "caste", "fatherOccupation", "motherOccupation",
      "familyType", "fatherName", "motherName", "siblings", "whatsapp",
      "diet", "about", "maritalStatus", "age"
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    // Handle uploaded photo
    if (req.file) {
      console.log("Setting photos from uploaded file:", req.file.path);
      updateData.photos = [req.file.path];
    }
    
    console.log("Filtered updateData:", updateData);
    
    const profile = await Profile.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    console.log("Profile updated successfully");
    res.json({ message: "Profile updated successfully", profile });
  } catch (err) {
    console.error("updateProfile error:", err.message, err.stack);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// ➕ CREATE PROFILE AS ADMIN (no user required)
export const createProfileByAdmin = async (req, res) => {
  const data = {
    ...req.body,
    user: req.user && req.user.id ? req.user.id : null,
    profileCreatedBy: req.user && req.user.role === "admin" ? "admin" : "system",
  };

  const profile = await Profile.create(data);
  res.status(201).json(profile);
};

// 📥 EXPORT PROFILES AS CSV
export const exportProfilesCSV = async (req, res) => {
  const profiles = await Profile.find().lean();

  const headers = [
    "_id",
    "name",
    "gender",
    "dob",
    "mobile",
    "city",
    "state",
    "education",
    "occupation",
    "isApproved",
    "createdAt",
  ];

  const rows = profiles.map((p) => [
    p._id,
    p.name || "",
    p.gender || "",
    p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
    p.mobile || "",
    p.city || "",
    p.state || "",
    p.education || "",
    p.occupation || "",
    p.isApproved ? "Approved" : "Pending",
    p.createdAt ? new Date(p.createdAt).toISOString() : "",
  ]);

  const csvLines = [headers.join(",")].concat(rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")));
  const csv = csvLines.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=profiles.csv");
  res.send(csv);
};

export const filterProfiles = async (req, res) => {
  const { city, sect, minAge, maxAge } = req.query;

  let query = {};

  if (city) query.city = city;
  if (sect) query.sect = sect;

  if (minAge || maxAge) {
    const minDate = minAge
      ? new Date(new Date().setFullYear(new Date().getFullYear() - minAge))
      : new Date("1900");

    const maxDate = maxAge
      ? new Date(new Date().setFullYear(new Date().getFullYear() - maxAge))
      : new Date();

    query.dob = { $gte: maxDate, $lte: minDate };
  }

  const profiles = await Profile.find(query);
  res.json(profiles);
};
