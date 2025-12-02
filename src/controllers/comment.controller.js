import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import CommentLike from "../models/commentLike.model.js";
import logger from "../utils/logger.js";

// ===============================================
// 1. USER THÊM BÌNH LUẬN
// ===============================================
export const addComment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { song_id, playlist_id, parent_id, content } = req.body;
    logger.info("User adding comment", { user_id, song_id, playlist_id });

    if (!content) {
      logger.warn("Add comment failed: Content is empty", { user_id });
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

    logger.info("Comment added successfully", { commentId: comment.id, user_id });
    res.json({ message: "Bình luận thành công", comment });
  } catch (error) {
    logger.error("Error adding comment", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// 2. LẤY COMMENT THEO SONG / PLAYLIST
// ===============================================
export const getComments = async (req, res) => {
  try {
    const { songId, playlistId } = req.query;
    logger.info("Fetching comments", { songId, playlistId });

    if (!songId && !playlistId) {
      logger.warn("Get comments failed: Missing songId or playlistId");
      return res.status(400).json({ message: "Thiếu songId hoặc playlistId" });
    }

    const condition = songId ? { song_id: songId } : { playlist_id: playlistId };

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
    const offset = (page - 1) * limit;

    const { rows, count } = await Comment.findAndCountAll({
      where: condition,
      include: [{ model: User, as: "user", attributes: ["id", "username"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    logger.debug("Found comments", { count, page, limit });
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
    logger.error("Error fetching comments", error);
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
    logger.info("User liking comment", { userId, commentId });

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      logger.warn("Like comment failed: Comment not found", { commentId });
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    const [, created] = await CommentLike.findOrCreate({
      where: { userId, commentId },
      defaults: { userId, commentId },
    });

    if (!created) {
      logger.warn("Like comment failed: User already liked this comment", { userId, commentId });
      return res.status(400).json({ message: "Bạn đã thích bình luận này rồi" });
    }

    const total = await CommentLike.count({ where: { commentId } });

    if (typeof comment.likes === 'number') {
      comment.likes = total;
      await comment.save();
    }

    logger.info("Comment liked successfully", { userId, commentId, newLikeCount: total });
    return res.json({ message: "Đã thích bình luận", likes: total });
  } catch (error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      logger.warn("Like comment failed due to race condition", { userId: req.user.id, commentId: req.params.commentId });
      return res.status(400).json({ message: "Bạn đã thích bình luận này rồi" });
    }
    logger.error("Error liking comment", error);
    return res.status(500).json({ message: error.message });
  }
};

// ===============================================
// 4. ADMIN XOÁ COMMENT
// ===============================================
export const adminDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    logger.info("Admin deleting comment", { commentId, adminId: req.user.id });

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      logger.warn("Admin delete comment failed: Comment not found", { commentId });
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    await comment.destroy();
    logger.info("Comment deleted by admin successfully", { commentId });
    res.json({ message: "Admin đã xoá bình luận" });
  } catch (error) {
    logger.error("Error deleting comment", error);
    res.status(500).json({ message: error.message });
  }
};
