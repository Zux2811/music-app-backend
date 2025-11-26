import express from "express";
import adminAuth from "../middleware/admin.middleware.js";

import {
  loginAdmin,
  getAllUsers,
  deleteUser,
  getAllReports,
  resolveReport
} from "../controllers/admin.controller.js";

const router = express.Router();

// login admin
router.post("/login", loginAdmin);

// protected routes
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);
router.get("/reports", adminAuth, getAllReports);
router.put("/reports/:id/resolve", adminAuth, resolveReport);

export default router;
