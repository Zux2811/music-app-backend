import express from "express";
import { addComment, getComments, likeComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/", addComment);
router.get("/", getComments);
router.post("/:commentId/like", likeComment);

export default router;
