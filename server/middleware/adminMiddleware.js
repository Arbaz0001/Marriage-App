import User from "../models/User.js";

const adminOnly = async (req, res, next) => {
  try {
    // Check if req.user has role set from the JWT token
    if (req.user) {
      console.log("adminMiddleware req.user:", req.user);
      if (req.user.role === "admin") {
        return next();
      }
    }

    // Handle admin-env special case (environment variable admin)
    if (req.user && req.user.id === "admin-env") {
      return next();
    }

    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    return next();
  } catch (err) {
    console.error("adminMiddleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default adminOnly;
