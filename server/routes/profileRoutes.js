import express from "express";
import { createProfile, getProfiles, getProfileById, getMyProfile } from "../controllers/profileController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create profile (authenticated users)
router.post("/", protect, upload.single("profilePic"), createProfile);

// List profiles (returns admin/all or only owner's profile depending on token)
router.get("/", getProfiles);

// Get current user's profile
router.get("/me", protect, getMyProfile);

// Get profile by id (admin or owner)
router.get("/:id", getProfileById);

export default router;
