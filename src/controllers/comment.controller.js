import Comment from "../models/comment.model.js";

export const addComment = async (req, res) => {
  try {
    const { user_id, song_id, playlist_id, parent_id, content } = req.body;
    const comment = await Comment.create({ user_id, song_id, playlist_id, parent_id, content });
    res.json({ message: "Bình luận thành công", comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { songId, playlistId } = req.query;
    const condition = songId ? { song_id: songId } : { playlist_id: playlistId };
    const comments = await Comment.findAll({
      where: condition,
      order: [["likes", "DESC"]],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy bình luận" });

    comment.likes += 1;
    await comment.save();
    res.json({ message: "Đã thích bình luận", likes: comment.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
