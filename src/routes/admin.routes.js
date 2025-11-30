import express from "express";
import adminAuth from "../middleware/admin.middleware.js";

import {
  loginAdmin,
  getAllUsers,
  deleteUser
} from "../controllers/admin.controller.js";

const router = express.Router();

// login admin
router.post("/login", loginAdmin);

// protected routes
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);
// Reports endpoints have been migrated to /api/reports (report.controller.js)

export default router;
