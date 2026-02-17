
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken";

export const createProfile = async (req, res) => {
  // Accept any profile fields sent in body and attach user id
  const data = { ...req.body };
  data.user = req.user?.id || req.user;

  // handle uploaded photo(s)
  if (req.file) {
    // ensure photos is an array
    data.photos = [req.file.path];
  }

  const profile = await Profile.create(data);
  res.json(profile);
};


export const getProfiles = async (req, res) => {
  // Allow admins to fetch all profiles, normal users only their own profile.
  let user = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) {
    try {
      const token = auth.split(" ")[1];
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      user = null;
    }
  }
  let profiles = [];
  if (user && user.role === "admin") {
    // Admin: return all profiles
    profiles = await Profile.find().populate("user", "name gender");
  } else if (user) {
    // Authenticated normal user: return only approved profiles
    profiles = await Profile.find({ isApproved: true }).populate("user", "name gender");
  } else {
    // No token: return only approved profiles as well
    profiles = await Profile.find({ isApproved: true }).populate("user", "name gender");
  }

  res.json(profiles);
};

export const getProfileById = async (req, res) => {
  let user = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) {
    try {
      const token = auth.split(" ")[1];
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      user = null;
    }
  }

  const profile = await Profile.findById(req.params.id).populate("user", "name email gender");
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  // Admin can view any profile
  if (user && user.role === "admin") return res.json(profile);

  // Owner can view their own profile
  if (user && String(profile.user?._id) === String(user.id)) return res.json(profile);

  // Other authenticated or unauthenticated users can view only approved profiles
  if (profile.isApproved) return res.json(profile);

  return res.status(403).json({ message: "Forbidden" });
};

export const getMyProfile = async (req, res) => {
  // Requires authentication (protect middleware should be used by route)
  const user = req.user;
  if (!user || !user.id) return res.status(401).json({ message: "Unauthorized" });

  const profile = await Profile.findOne({ user: user.id }).populate("user", "name email gender");
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  res.json(profile);
};

 

