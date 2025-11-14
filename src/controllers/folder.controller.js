import Folder from "../models/folder.model.js";
import Playlist from "../models/playlist.model.js";

// 🟢 Tạo folder mới
export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const folder = await Folder.create({ name, UserId: userId });
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Lỗi khi tạo folder", error: error.message });
  }
};

// 🟡 Lấy tất cả folder của user (kèm danh sách playlist)
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.findAll({
      where: { UserId: userId },
      include: [{ model: Playlist }],
    });

    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách folder", error: error.message });
  }
};

// 🟠 Cập nhật tên folder
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await Folder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: "Không tìm thấy folder" });
    }

    folder.name = name || folder.name;
    await folder.save();
    res.status(200).json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật folder", error: error.message });
  }
};

// 🔴 Xóa folder
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findByPk(id);
    if (!folder) {
      return res.status(404).json({ message: "Không tìm thấy folder" });
    }

    await folder.destroy();
    res.status(200).json({ message: "Đã xóa folder thành công" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Lỗi khi xóa folder", error: error.message });
  }
};
