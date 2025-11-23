// src/controllers/admin.controller.js
import db from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email, role FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT r.id, r.message, r.status, u.username AS reported_by FROM reports r JOIN users u ON u.id = r.user_id"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports", error: err });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const id = req.params.id;

    await db.query("UPDATE reports SET status = 'resolved' WHERE id = ?", [id]);

    res.json({ message: "Report resolved" });
  } catch (err) {
    res.status(500).json({ message: "Error resolving report", error: err });
  }
};
