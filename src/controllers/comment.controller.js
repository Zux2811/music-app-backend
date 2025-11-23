import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

// ===============================================
// 1. USER THÊM BÌNH LUẬN
// ===============================================
export const addComment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { song_id, playlist_id, parent_id, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const comment = await Comment.create({
      user_id,
      song_id: song_id || null,
      playlist_id: playlist_id || null,
      parent_id: parent_id || null,
      content,
      likes: 0,
    });

    res.json({ message: "Bình luận thành công", comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================================
// 2. LẤY COMMENT THEO SONG / PLAYLIST
// ===============================================
export const getComments = async (req, res) => {
  try {
    const { songId, playlistId } = req.query;

    if (!songId && !playlistId) {
      return res.status(400).json({ message: "Thiếu songId hoặc playlistId" });
    }

    const condition = songId
      ? { song_id: songId }
      : { playlist_id: playlistId };

    const comments = await Comment.findAll({
      where: condition,
      include: [
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================================
// 3. LIKE COMMENT (không cho spam)
// ===============================================
export const likeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    // lưu danh sách user đã like trong 1 bảng khác (tối ưu)
    // hoặc lưu tạm JSON (đơn giản)
    let likedList = comment.liked_by || "[]";
    likedList = JSON.parse(likedList);

    if (likedList.includes(userId)) {
      return res.status(400).json({ message: "Bạn đã thích bình luận này rồi" });
    }

    likedList.push(userId);

    comment.likes += 1;
    comment.liked_by = JSON.stringify(likedList);

    await comment.save();

    res.json({ message: "Đã thích bình luận", likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================================
// 4. ADMIN XOÁ COMMENT
// ===============================================
export const adminDeleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    await comment.destroy();
    res.json({ message: "Admin đã xoá bình luận" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
