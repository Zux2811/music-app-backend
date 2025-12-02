import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { createJwt } from "../utils/jwt.js";
import logger from "../utils/logger.js";

export const register = async (req, res) => {
  try {
    logger.debug("Received registration request", { username: req.body.username, email: req.body.email });
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      logger.warn("Registration failed: Missing required fields");
      return res.status(400).json({ message: "Missing required fields: username, email, password" });
    }

    logger.debug("Checking for existing email", { email });
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn("Registration failed: Email already exists", { email });
      return res.status(400).json({ message: "Email already exists" });
    }

    logger.debug("Hashing password", { email });
    const hashedPassword = await bcrypt.hash(password, 10);

    logger.debug("Creating new user", { username, email });
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    logger.info("User registered successfully", { id: newUser.id, email: newUser.email });
    const token = createJwt(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error("Registration error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    logger.info("Login attempt", { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Login failed: Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    logger.debug("Finding user", { email });
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn("Login failed: User not found", { email });
      return res.status(404).json({ message: "User not found" });
    }

    // For social-login accounts (no local password), block local login
    if (!user.password) {
      logger.warn("Login failed: Local login attempted for social account", { email });
      return res.status(400).json({ message: "This account uses social login. Please sign in with Google." });
    }

    logger.debug("Comparing password", { email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed: Invalid password", { email });
      return res.status(401).json({ message: "Invalid password" });
    }

    logger.debug("Creating JWT", { id: user.id, email: user.email, role: user.role });
    const token = createJwt(user);

    logger.info("Login successful", { email });
    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    logger.info("Received Google sign-in request");
    const { idToken } = req.body;

    if (!idToken) {
      logger.warn("Google sign-in failed: Missing idToken");
      return res.status(400).json({ message: "Missing idToken" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.error("Google sign-in failed: GOOGLE_CLIENT_ID not configured");
      return res.status(500).json({ message: "Server missing GOOGLE_CLIENT_ID" });
    }

    logger.debug("Verifying Google ID token");
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
      logger.warn("Google sign-in failed: Cannot extract email from Google token");
      return res.status(400).json({ message: "Cannot extract email from Google token" });
    }

    logger.info("Google token verified", { email });

    // Find or create user
    logger.debug("Looking for existing user", { email });
    let user = await User.findOne({ where: { email } });
    if (!user) {
      logger.debug("Creating new user from Google", { name, email });
      user = await User.create({
        username: name,
        email,
        password: null, // no local password for social accounts
        role: "user",
      });
      logger.info("New user created from Google sign-in", { id: user.id, email: user.email });
    } else {
      logger.debug("Existing user found", { id: user.id, email: user.email });
    }

    // Issue our JWT
    logger.debug("Creating JWT for Google user", { id: user.id, email: user.email, role: user.role });
    const token = createJwt(user);

    logger.info("Google sign-in successful", { email });
    res.json({
      message: "Google login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    logger.error("Google sign-in error", error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};
