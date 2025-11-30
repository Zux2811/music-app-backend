import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { createJwt } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    console.log("[REGISTER] Received request:", { username: req.body.username, email: req.body.email });
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.warn("[REGISTER] Missing required fields");
      return res.status(400).json({ message: "Missing required fields: username, email, password" });
    }

    console.log("[REGISTER] Checking if email already exists:", email);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.warn("[REGISTER] Email already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log("[REGISTER] Hashing password for:", email);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("[REGISTER] Creating new user:", { username, email });
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user" // mặc định user
    });

    console.log("[REGISTER] User created successfully:", { id: newUser.id, email: newUser.email });
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("[LOGIN] Received login request for email:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("[LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("[LOGIN] Finding user with email:", email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn("[LOGIN] User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[LOGIN] Comparing password for user:", email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("[LOGIN] Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("[LOGIN] Creating JWT token for user:", { id: user.id, email: user.email, role: user.role });
    const token = createJwt(user);

    console.log("[LOGIN] Login successful for user:", email);
    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    console.log("[GOOGLE_SIGNIN] Received Google sign-in request");
    const { idToken } = req.body;

    if (!idToken) {
      console.warn("[GOOGLE_SIGNIN] Missing idToken");
      return res.status(400).json({ message: "Missing idToken" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("[GOOGLE_SIGNIN] GOOGLE_CLIENT_ID not configured");
      return res.status(500).json({ message: "Server missing GOOGLE_CLIENT_ID" });
    }

    console.log("[GOOGLE_SIGNIN] Verifying Google ID token");
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || email?.split("@")[0];

    if (!email) {
      console.warn("[GOOGLE_SIGNIN] Cannot extract email from Google token");
      return res.status(400).json({ message: "Cannot extract email from Google token" });
    }

    console.log("[GOOGLE_SIGNIN] Google token verified for email:", email);

    // Find or create user
    console.log("[GOOGLE_SIGNIN] Looking for existing user:", email);
    let user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("[GOOGLE_SIGNIN] Creating new user from Google:", { name, email });
      user = await User.create({
        username: name,
        email,
        password: "", // no local password for social accounts
        role: "user",
      });
      console.log("[GOOGLE_SIGNIN] New user created:", { id: user.id, email: user.email });
    } else {
      console.log("[GOOGLE_SIGNIN] Existing user found:", { id: user.id, email: user.email });
    }

    // Issue our JWT
    console.log("[GOOGLE_SIGNIN] Creating JWT token for user:", { id: user.id, email: user.email, role: user.role });
    const token = createJwt(user);

    console.log("[GOOGLE_SIGNIN] Google sign-in successful for:", email);
    res.json({
      message: "Google login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("[GOOGLE_SIGNIN] Error:", error.message, error.stack);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};
