import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import db from "../config/db.js";

// Upload buffer lên Cloudinary bằng stream
const uploadBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadSong = async (req, res) => {
  try {
    const { title, artist, album } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ error: "title và artist là bắt buộc" });
    }

    let audioUrl = null;
    let imageUrl = null;

    // Upload audio
    if (req.files && req.files.audio && req.files.audio[0]) {
      const result = await uploadBuffer(req.files.audio[0].buffer, {
        resource_type: "video", // Bắt buộc cho audio/mp3
        folder: "music_app/audio",
      });
      audioUrl = result.secure_url;
    }

    // Upload image
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await uploadBuffer(req.files.image[0].buffer, {
        resource_type: "image",
        folder: "music_app/images",
      });
      imageUrl = result.secure_url;
    }

    // Lưu vào MySQL
    await db.query(
      `INSERT INTO songs (title, artist, album, imageUrl, audioUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, artist, album, imageUrl, audioUrl]
    );

    return res.json({
      message: "Uploaded successfully",
      audioUrl,
      imageUrl,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message });
  }
};
