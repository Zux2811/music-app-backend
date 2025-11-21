import express from "express";
import multer from "multer";
import { uploadSong } from "../controllers/upload.controller.js";

const router = express.Router();
const upload = multer(); // dùng memory storage

router.post(
  "/upload",
  upload.fields([{ name: "audio" }, { name: "image" }]),
  uploadSong
);

export default router;
