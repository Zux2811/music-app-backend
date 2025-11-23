// src/routes/admin.routes.js
import express from "express";
import { adminAuth } from "../middleware/admin.middleware.js";
import {
  getAllUsers,
  deleteUser,
  getAllReports,
  resolveReport,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Lấy danh sách tài khoản người dùng
router.get("/users", adminAuth, getAllUsers);

// Xóa người dùng
router.delete("/users/:id", adminAuth, deleteUser);

// Lấy danh sách report người dùng
router.get("/reports", adminAuth, getAllReports);

// Xử lý báo cáo (VD: đánh dấu đã xử lý)
router.put("/reports/:id/resolve", adminAuth, resolveReport);

export default router;
