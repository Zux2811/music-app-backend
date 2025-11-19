import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "music-player-images",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "music-player-audio",
    allowed_formats: ["mp3", "wav", "m4a"],
    resource_type: "video", // BẮT BUỘC CHO AUDIO
  },
});

const uploadImage = multer({ storage: imageStorage }).single("image");
const uploadAudio = multer({ storage: audioStorage }).single("audio");

export const uploadFiles = (req, res, next) => {
  uploadImage(req, res, (imageErr) => {
    if (imageErr) {
      return res.status(400).json({ message: "Image upload error", error: imageErr });
    }

    const imageUrl = req.file?.path || null;

    uploadAudio(req, res, (audioErr) => {
      if (audioErr) {
        return res.status(400).json({ message: "Audio upload error", error: audioErr });
      }

      const audioUrl = req.file?.path || null;

      // Ghi đúng URL vào req
      req.uploadedFiles = {
        imageUrl,
        audioUrl,
      };

      next();
    });
  });
};
