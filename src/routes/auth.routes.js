import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();

// ---------------- REGISTER ----------------
router.post("/register", (req, res) => {
  const { email, password } = req.body;

  try {
    const hash = bcrypt.hashSync(password, 10);

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hash],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "User registered" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];

      // Compare password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Wrong password" });

      // Create token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token });
    }
  );
});

export default router;
