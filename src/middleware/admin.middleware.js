// src/middleware/admin.middleware.js
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query("SELECT role FROM users WHERE id = ?", [
      decoded.id,
    ]);

    if (!rows[0]) return res.status(404).json({ message: "User not found" });

    if (rows[0].role !== "admin") {
      return res.status(403).json({ message: "You are not admin" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err });
  }
};
