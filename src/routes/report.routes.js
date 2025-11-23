import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import {
  reportComment,
  getAllReports,
  getReportedComments,
  deleteReport,
  deleteCommentByAdmin,
} from "../controllers/report.controller.js";

const router = express.Router();

// User báo cáo comment
router.post("/:commentId", authMiddleware, reportComment);

// Admin xem tất cả report
router.get("/", authMiddleware, isAdmin, getAllReports);

// Admin xem comment bị báo cáo + số report
router.get("/group", authMiddleware, isAdmin, getReportedComments);

// Admin xoá 1 report
router.delete("/:id", authMiddleware, isAdmin, deleteReport);

// Admin xoá comment + report liên quan
router.delete("/comment/:commentId", authMiddleware, isAdmin, deleteCommentByAdmin);

export default router;
