import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { createJwt } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user" // mặc định user
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = createJwt(user);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ message: "Missing idToken" });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Server missing GOOGLE_CLIENT_ID" });
    }

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || email?.split("@")[0];
    if (!email)
      return res.status(400).json({ message: "Cannot extract email from Google token" });

    // Find or create user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        username: name,
        email,
        password: "", // no local password for social accounts
        role: "user",
      });
    }

    // Issue our JWT
    const token = createJwt(user);

    res.json({
      message: "Google login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};
