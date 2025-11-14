import Song from "../models/song.model.js";
import User from "../models/user.model.js";
import Playlist from "../models/playlist.model.js";
import PlaylistSong from "../models/playlistSong.model.js";

// 🎵 Lấy tất cả bài hát
export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.findAll();
    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ message: "Error fetching songs", error: error.message });
  }
};

// ➕ Thêm bài hát (có upload)
export const addSong = async (req, res) => {
  try {
    const { title, artist, album } = req.body;
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const song = await Song.create({
      title,
      artist,
      album,
      audioUrl: `/uploads/audio/${audioFile.filename}`,
      imageUrl: imageFile ? `/uploads/images/${imageFile.filename}` : null,
    });

    res.status(201).json({ message: "Song added successfully", song });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ message: "Error adding song", error: error.message });
  }
};

// ✏️ Cập nhật bài hát
export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, album, audioUrl, imageUrl } = req.body;
    const song = await Song.findByPk(id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    Object.assign(song, { title, artist, album, audioUrl, imageUrl });
    await song.save();

    res.json({ message: "Song updated successfully", song });
  } catch (error) {
    console.error("Error updating song:", error);
    res.status(500).json({ message: "Error updating song", error: error.message });
  }
};

// ❌ Xóa bài hát
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByPk(id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    await song.destroy();
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ message: "Error deleting song", error: error.message });
  }
};

// 🎵 Lấy danh sách bài hát theo playlist
export const getSongsByPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findByPk(playlistId, {
      include: {
        model: Song,
        through: { attributes: [] }, // bỏ dữ liệu bảng trung gian
      },
    });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist.Songs || []);
  } catch (error) {
    console.error("Error getting songs by playlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👤 Lấy tất cả bài hát của 1 user (qua tất cả playlist)
export const getSongsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Playlist,
          include: [
            {
              model: Song,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gom tất cả bài hát từ các playlist của user
    const allSongs =
      user.Playlists?.flatMap((playlist) => playlist.Songs || []) || [];

    return res.json(allSongs);
  } catch (error) {
    console.error("Error in getSongsByUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
