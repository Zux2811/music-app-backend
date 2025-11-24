// src/middleware/admin.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "You are not admin" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", err });
  }
};
