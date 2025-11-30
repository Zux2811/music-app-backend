// import Song from "../models/song.model.js";
// import User from "../models/user.model.js";
// import Playlist from "../models/playlist.model.js";

// // ===============================
// // 🎵 Lấy tất cả bài hát
// // ===============================
// export const getAllSongs = async (req, res) => {
//   try {
//     const songs = await Song.findAll();
//     res.json(songs);
//   } catch (error) {
//     console.error("Error fetching songs:", error);
//     res.status(500).json({ message: "Error fetching songs", error: error.message });
//   }
// };

// // ===============================
// // ➕ Upload bài hát (Cloudinary)
// // ===============================
// export const addSong = async (req, res) => {
//   try {
//     const { title, artist, album } = req.body;
//     const { imageUrl, audioUrl } = req.uploadedFiles;

//     if (!audioUrl) {
//       return res.status(400).json({ message: "Audio file is required" });
//     }

//     const newSong = await Song.create({
//       title,
//       artist,
//       album,
//       url: audioUrl,
//       imageUrl: imageUrl || null,
//     });

//     res.status(201).json({
//       message: "Song uploaded successfully",
//       song: newSong,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error adding song",
//       error: error.message,
//     });
//   }
// };

// // ===============================
// // ✏️ Cập nhật bài hát
// // ===============================
// export const updateSong = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, artist, album, audioUrl, imageUrl } = req.body;

//     const song = await Song.findByPk(id);
//     if (!song) return res.status(404).json({ message: "Song not found" });

//     Object.assign(song, { title, artist, album, audioUrl, imageUrl });
//     await song.save();

//     res.json({ message: "Song updated successfully", song });
//   } catch (error) {
//     console.error("Error updating song:", error);
//     res.status(500).json({ message: "Error updating song", error: error.message });
//   }
// };

// // ===============================
// // ❌ Xóa bài hát
// // ===============================
// export const deleteSong = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const song = await Song.findByPk(id);

//     if (!song) return res.status(404).json({ message: "Song not found" });

//     await song.destroy();
//     res.json({ message: "Song deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting song:", error);
//     res.status(500).json({ message: "Error deleting song", error: error.message });
//   }
// };

// // ===============================
// // 🎧 Lấy bài hát theo playlist
// // ===============================
// export const getSongsByPlaylist = async (req, res) => {
//   try {
//     const { playlistId } = req.params;

//     const playlist = await Playlist.findByPk(playlistId, {
//       include: { model: Song, through: { attributes: [] } },
//     });

//     if (!playlist) return res.status(404).json({ message: "Playlist not found" });

//     res.json(playlist.Songs || []);
//   } catch (error) {
//     console.error("Error getting songs by playlist:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // ===============================
// // 👤 Lấy bài hát theo user
// // ===============================
// export const getSongsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findByPk(userId, {
//       include: [
//         {
//           model: Playlist,
//           include: [{ model: Song, through: { attributes: [] } }],
//         },
//       ],
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const allSongs =
//       user.Playlists.flatMap((playlist) => playlist.Songs || []) || [];

//     res.json(allSongs);
//   } catch (error) {
//     console.error("Error in getSongsByUser:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

import Song from "../models/song.model.js";
import User from "../models/user.model.js";
import Playlist from "../models/playlist.model.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Convert buffer → stream (Cloudinary yêu cầu)
function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// ===============================
// 🎵 Lấy tất cả bài hát
// ===============================
export const getAllSongs = async (req, res) => {
  try {
    console.log("[GET_ALL_SONGS] Fetching all songs");
    const songs = await Song.findAll();
    console.log("[GET_ALL_SONGS] Found", songs.length, "songs");
    res.json(songs);
  } catch (error) {
    console.error("[GET_ALL_SONGS] Error:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching songs", error: error.message });
  }
};

// ===============================
// ➕ Upload bài hát (Cloudinary)
// ===============================
export const addSong = async (req, res) => {
  try {
    console.log("[ADD_SONG] Received song upload request");
    const { title, artist, album } = req.body;
    console.log("[ADD_SONG] Song details:", { title, artist, album });

    if (!req.files || !req.files.audio) {
      console.warn("[ADD_SONG] Audio file is required but not provided");
      return res.status(400).json({ message: "Audio file is required" });
    }

    console.log("[ADD_SONG] Files received:", {
      hasAudio: !!req.files.audio,
      hasImage: !!req.files.image,
      audioSize: req.files.audio[0]?.size,
      imageSize: req.files.image?.[0]?.size
    });

    const audioBuffer = req.files.audio[0].buffer;
    const imageBuffer = req.files.image ? req.files.image[0].buffer : null;

    // 🔼 Upload ảnh nếu có
    let imageUrl = null;
    if (imageBuffer) {
      console.log("[ADD_SONG] Uploading image to Cloudinary...");
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "music-player-images",
            resource_type: "image",
          },
          (err, result) => {
            if (err) {
              console.error("[ADD_SONG] Image upload failed:", err.message);
              reject(err);
            } else {
              console.log("[ADD_SONG] Image uploaded successfully:", result.secure_url);
              resolve(result.secure_url);
            }
          }
        );
        bufferToStream(imageBuffer).pipe(stream);
      });
    }

    // 🔼 Upload audio
    console.log("[ADD_SONG] Uploading audio to Cloudinary...");
    const audioUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "music-player-audio",
          resource_type: "video", // bắt buộc cho mp3/wav/m4a
        },
        (err, result) => {
          if (err) {
            console.error("[ADD_SONG] Audio upload failed:", err.message);
            reject(err);
          } else {
            console.log("[ADD_SONG] Audio uploaded successfully:", result.secure_url);
            resolve(result.secure_url);
          }
        }
      );
      bufferToStream(audioBuffer).pipe(stream);
    });

    // 💾 Lưu DB Sequelize
    console.log("[ADD_SONG] Saving song to database...");
    const newSong = await Song.create({
      title,
      artist,
      album,
      audioUrl: audioUrl,
      imageUrl: imageUrl || null,
    });

    console.log("[ADD_SONG] Song saved successfully:", { id: newSong.id, title: newSong.title });
    res.status(201).json({
      message: "Song uploaded successfully",
      song: newSong,
    });
  } catch (error) {
    console.error("[ADD_SONG] Error:", error.message, error.stack);
    res.status(500).json({
      message: "Error adding song",
      error: error.message,
    });
  }
};

// ===============================
// ✏️ Cập nhật bài hát
// ===============================
export const updateSong = async (req, res) => {
  try {
    console.log("[UPDATE_SONG] Received update request for song ID:", req.params.id);
    const { id } = req.params;
    const { title, artist, album, audioUrl, imageUrl } = req.body;
    console.log("[UPDATE_SONG] Update data:", { title, artist, album });

    const song = await Song.findByPk(id);
    if (!song) {
      console.warn("[UPDATE_SONG] Song not found:", id);
      return res.status(404).json({ message: "Song not found" });
    }

    console.log("[UPDATE_SONG] Updating song:", id);
    Object.assign(song, { title, artist, album, audioUrl, imageUrl });
    await song.save();

    console.log("[UPDATE_SONG] Song updated successfully:", id);
    res.json({ message: "Song updated successfully", song });
  } catch (error) {
    console.error("[UPDATE_SONG] Error:", error.message, error.stack);
    res.status(500).json({ message: "Error updating song", error: error.message });
  }
};

// ===============================
// ❌ Xóa bài hát
// ===============================
export const deleteSong = async (req, res) => {
  try {
    console.log("[DELETE_SONG] Received delete request for song ID:", req.params.id);
    const { id } = req.params;
    const song = await Song.findByPk(id);

    if (!song) {
      console.warn("[DELETE_SONG] Song not found:", id);
      return res.status(404).json({ message: "Song not found" });
    }

    console.log("[DELETE_SONG] Deleting song:", { id, title: song.title });
    await song.destroy();
    console.log("[DELETE_SONG] Song deleted successfully:", id);
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("[DELETE_SONG] Error:", error.message, error.stack);
    res.status(500).json({ message: "Error deleting song", error: error.message });
  }
};

// ===============================
// 🎧 Lấy bài hát theo playlist
// ===============================
export const getSongsByPlaylist = async (req, res) => {
  try {
    console.log("[GET_SONGS_BY_PLAYLIST] Fetching songs for playlist ID:", req.params.playlistId);
    const { playlistId } = req.params;

    const playlist = await Playlist.findByPk(playlistId, {
      include: { model: Song, through: { attributes: [] } },
    });

    if (!playlist) {
      console.warn("[GET_SONGS_BY_PLAYLIST] Playlist not found:", playlistId);
      return res.status(404).json({ message: "Playlist not found" });
    }

    const songs = playlist.Songs || [];
    console.log("[GET_SONGS_BY_PLAYLIST] Found", songs.length, 'songs for playlist:', playlistId);
    res.json(songs);
  } catch (error) {
    console.error("[GET_SONGS_BY_PLAYLIST] Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===============================
// 👤 Lấy bài hát theo user
// ===============================
export const getSongsByUser = async (req, res) => {
  try {
    console.log("[GET_SONGS_BY_USER] Fetching songs for user ID:", req.params.userId);
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Playlist,
          include: [{ model: Song, through: { attributes: [] } }],
        },
      ],
    });

    if (!user) {
      console.warn("[GET_SONGS_BY_USER] User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const allSongs =
      user.Playlists.flatMap((playlist) => playlist.Songs || []) || [];

    console.log("[GET_SONGS_BY_USER] Found', allSongs.length, 'songs for user:', userId);
    res.json(allSongs);
  } catch (error) {
    console.error("[GET_SONGS_BY_USER] Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
