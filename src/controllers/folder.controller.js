import Folder from "../models/folder.model.js";
import Playlist from "../models/playlist.model.js";

// Helper function for recursive folder inclusion
const includeNestedFolders = (level = 4) => {
  if (level <= 0) {
    return [{ model: Playlist }];
  }
  return [
    { model: Playlist },
    {
      model: Folder,
      as: "SubFolders",
      include: includeNestedFolders(level - 1),
    },
  ];
};

// 🟢 Create a new folder (supports nesting)
export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user.id;

    const folderData = { name, UserId: userId };
    if (parentId) {
      folderData.parentId = parentId;
    }

    const folder = await Folder.create(folderData);
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Lỗi khi tạo folder", error: error.message });
  }
};

// 🟡 Get all folders for a user (nested structure)
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await Folder.findAll({
      where: { UserId: userId, parentId: null }, // Fetch only top-level folders
      include: includeNestedFolders(),
      order: [["name", "ASC"]], // Optional: sort folders
    });

    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách folder", error: error.message });
  }
};

// 🟠 Update a folder (rename or move)
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const folder = await Folder.findOne({ where: { id, UserId: req.user.id } });
    if (!folder) {
      return res.status(404).json({ message: "Không tìm thấy folder" });
    }

    if (name) {
      folder.name = name;
    }

    // Handle moving folder
    if (parentId !== undefined) {
      // Allow moving to root by setting parentId to null
      folder.parentId = parentId === "" || parentId === 0 ? null : parentId;
    }

    await folder.save();
    res.status(200).json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật folder", error: error.message });
  }
};

// 🔴 Delete a folder (cascade will handle sub-folders and playlists)
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findOne({ where: { id, UserId: req.user.id } });
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
