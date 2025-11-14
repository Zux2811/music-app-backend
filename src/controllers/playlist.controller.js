import Playlist from "../models/playlist.model.js";
import Song from "../models/song.model.js";
import PlaylistSong from "../models/playlistSong.model.js";
import User from "../models/user.model.js";

// 🆕 Tạo playlist mới
export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.create({ name, UserId: userId });
    res.status(201).json({ message: "Playlist created", playlist });
  } catch (error) {
    res.status(500).json({ message: "Error creating playlist", error });
  }
};

// 🔍 Lấy playlist của user
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await Playlist.findAll({
      where: { UserId: userId },
      include: [{ model: Song }],
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching playlists", error });
  }
};

// ✏️ Cập nhật playlist
export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const playlist = await Playlist.findByPk(id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.name = name || playlist.name;
    await playlist.save();

    res.json({ message: "Playlist updated", playlist });
  } catch (error) {
    res.status(500).json({ message: "Error updating playlist", error });
  }
};

// ❌ Xóa playlist
export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findByPk(id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    await playlist.destroy();
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting playlist", error });
  }
};

// ➕ Thêm bài hát vào playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findByPk(playlistId);
    const song = await Song.findByPk(songId);

    if (!playlist || !song)
      return res.status(404).json({ message: "Playlist hoặc bài hát không tồn tại" });

    await playlist.addSong(song);
    res.json({ message: "Thêm bài hát vào playlist thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm bài hát vào playlist", error });
  }
};

// 🎵 Lấy danh sách bài hát trong playlist
export const getSongsInPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findByPk(id, { include: [Song] });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    res.json(playlist.Songs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs in playlist", error });
  }
};

// ➖ Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    // Kiểm tra tồn tại trước khi xóa
    const existing = await PlaylistSong.findOne({
      where: {
        playlistId: Number(playlistId),
        songId: Number(songId),
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Bài hát không tồn tại trong playlist" });
    }

    await existing.destroy();

    return res.status(200).json({ message: "Xóa bài hát khỏi playlist thành công" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};