import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";
import {
  getAllUsers,
  deleteUser,
  getAllProfiles,
  deleteProfile,
  updateProfile,
    filterProfiles,
    createProfileByAdmin,
    exportProfilesCSV,
} from "../controllers/adminController.js";
import { createUserWithProfile } from "../controllers/adminController.js";
import { getStats } from "../controllers/adminController.js";
import { approveProfile } from "../controllers/adminController.js";







const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.post("/users", protect, adminOnly, upload.single("profilePic"), createUserWithProfile);
router.get("/profiles", protect, adminOnly, getAllProfiles);
router.post("/profiles", protect, adminOnly, createProfileByAdmin);
router.get("/profiles/export", protect, adminOnly, exportProfilesCSV);
router.get("/stats", protect, adminOnly, getStats);
router.get("/profiles", protect, adminOnly, getAllProfiles);
router.delete("/profiles/:id", protect, adminOnly, deleteProfile);
router.patch("/profiles/:id/approve", protect, adminOnly, approveProfile);
router.put("/profiles/:id", protect, adminOnly, upload.single("profilePic"), updateProfile);
router.get("/profiles/filter", protect, adminOnly, filterProfiles);

// Additional convenient endpoints to approve/reject via PUT
import Profile from "../models/Profile.js";

router.put("/profile/:id/approve", protect, adminOnly, async (req, res) => {
  const profile = await Profile.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json(profile);
});

router.put("/profile/:id/reject", protect, adminOnly, async (req, res) => {
  const profile = await Profile.findByIdAndUpdate(req.params.id, { isApproved: false, isRejected: true }, { new: true });
  res.json(profile);
});



export default router;
