import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password, gender } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    gender,
  });

  res.status(201).json({ message: "User registered successfully" });
};



export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });
  console.log("ADMIN_EMAIL env:", process.env.ADMIN_EMAIL);
  console.log("ADMIN_PASSWORD set:", !!process.env.ADMIN_PASSWORD);

  // 🔐 ENV ADMIN LOGIN CHECK
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { id: "admin-env", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        name: "Admin",
        email,
        role: "admin",
      },
    });
  }

  // 👤 NORMAL USER LOGIN (DB)
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user,
  });
};

