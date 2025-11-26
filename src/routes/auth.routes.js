// // src/routes/auth.routes.js
// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import db from "../config/db.js";

// const router = express.Router();

// router.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   if (!username || !email || !password)
//     return res.status(400).json({ message: "Missing fields" });

//   try {
//     // check email exists
//     const [exists] = await db.query(
//       "SELECT id FROM users WHERE email = ?",
//       [email]
//     );

//     if (exists.length > 0)
//       return res.status(400).json({ message: "Email already registered" });

//     const hash = await bcrypt.hash(password, 10);

//     // INSERT INTO users
//     await db.query(
//       `INSERT INTO users (username, email, password, createdAt, updatedAt)
//        VALUES (?, ?, ?, NOW(), NOW())`,
//       [username, email, hash]
//     );

//     return res.json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error("Register error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     return res.status(400).json({ message: "Missing email or password" });

//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0)
//       return res.status(400).json({ message: "User not found" });

//     const user = rows[0];

//     const match = await bcrypt.compare(password, user.password);
//     if (!match)
//       return res.status(400).json({ message: "Wrong password" });

//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hash,
    });

    return res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Google Sign-In: verify ID token and issue app JWT
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Server missing GOOGLE_CLIENT_ID" });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || email?.split("@")[0];
    if (!email) return res.status(400).json({ message: "Cannot extract email from Google token" });

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
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({ message: "Google login failed", error: err.message });
  }
});

export default router;

