import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import db from "../config/db.js";

const router = express.Router();
const upload = multer(); // memory storage

const uploadBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.post(
  "/upload",
  upload.fields([{ name: "audio" }, { name: "image" }]),
  async (req, res) => {
    try {
      const { title, artist, album } = req.body;

      let audioUrl = null;
      let imageUrl = null;

      if (req.files.audio) {
        const result = await uploadBuffer(req.files.audio[0].buffer, {
          resource_type: "video",
          folder: "music_app/audio",
        });
        audioUrl = result.secure_url;
      }

      if (req.files.image) {
        const result = await uploadBuffer(req.files.image[0].buffer, {
          resource_type: "image",
          folder: "music_app/images",
        });
        imageUrl = result.secure_url;
      }

      await db.query(
        `INSERT INTO songs (title, artist, album, imageUrl, audioUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [title, artist, album, imageUrl, audioUrl]
      );

      res.json({
        message: "Uploaded successfully",
        audioUrl,
        imageUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
