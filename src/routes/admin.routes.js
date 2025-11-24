import express from "express";
import adminAuth from "../middleware/admin.middleware.js";
import {
  getAllUsers,
  deleteUser,
  getAllReports,
  resolveReport
} from "../controllers/admin.controller.js";
import { adminLogin } from "../controllers/adminAuth.controller.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);
router.get("/reports", adminAuth, getAllReports);
router.put("/reports/:id/resolve", adminAuth, resolveReport);

export default router;
