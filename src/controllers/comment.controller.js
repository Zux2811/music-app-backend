import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import CommentLike from "../models/commentLike.model.js";

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

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
    const offset = (page - 1) * limit;

    const { rows, count } = await Comment.findAndCountAll({
      where: condition,
      include: [
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit) || 1;
    res.json({
      items: rows,
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
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
    const commentId = Number(req.params.commentId);

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    // Atomically ensure single like per user via findOrCreate
    const [likeRow, created] = await CommentLike.findOrCreate({
      where: { userId, commentId },
      defaults: { userId, commentId },
    });
    if (!created) {
      return res.status(400).json({ message: "Bạn đã thích bình luận này rồi" });
    }

    // Compute current total likes from join table
    const total = await CommentLike.count({ where: { commentId } });

    // Optionally maintain denormalized counter
    if (typeof comment.likes === 'number') {
      comment.likes = total;
      await comment.save();
    }

    return res.json({ message: "Đã thích bình luận", likes: total });
  } catch (error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      // Handle rare race condition
      return res.status(400).json({ message: "Bạn đã thích bình luận này rồi" });
    }
    return res.status(500).json({ message: error.message });
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
