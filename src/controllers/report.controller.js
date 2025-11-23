import Report from "../models/report.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

// ===============================
// 1. USER GỬI BÁO CÁO COMMENT
// ===============================
export const reportComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Lý do báo cáo không được để trống" });
    }

    const commentExists = await Comment.findByPk(commentId);
    if (!commentExists) {
      return res.status(404).json({ message: "Không tìm thấy bình luận để báo cáo" });
    }

    // Prevent duplicated reports by same user
    const existing = await Report.findOne({
      where: { userId, commentId }
    });

    if (existing) {
      return res.status(400).json({ message: "Bạn đã báo cáo bình luận này rồi" });
    }

    await Report.create({
      userId,
      commentId,
      message
    });

    res.json({ message: "Báo cáo đã được gửi" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi báo cáo", error: error.message });
  }
};


// ===============================
// 2. ADMIN LẤY DANH SÁCH BÁO CÁO
// ===============================
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        { model: Comment, as: "comment", attributes: ["id", "content", "user_id"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách báo cáo", error: error.message });
  }
};


// =====================================================
// 3. ADMIN XEM COMMENT KÈM SỐ LƯỢNG BÁO CÁO
// =====================================================
export const getReportedComments = async (req, res) => {
  try {
    const results = await Report.findAll({
      attributes: [
        "commentId",
        [Report.sequelize.fn("COUNT", Report.sequelize.col("commentId")), "reportCount"],
      ],
      include: [
        {
          model: Comment,
          as: "comment",
          attributes: ["id", "content", "user_id", "song_id", "playlist_id"]
        },
      ],
      group: ["commentId"],
      order: [["reportCount", "DESC"]],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách báo cáo theo nhóm", error: error.message });
  }
};


// ===============================
// 4. ADMIN XOÁ 1 BÁO CÁO
// ===============================
export const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    await report.destroy();
    res.json({ message: "Đã xoá báo cáo" });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá báo cáo", error: error.message });
  }
};


// ===============================
// 5. ADMIN XOÁ BÌNH LUẬN BỊ VI PHẠM
// ===============================
export const deleteCommentByAdmin = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    // cascade delete: xoá luôn các report liên quan
    await Report.destroy({ where: { commentId } });

    await comment.destroy();

    res.json({ message: "Đã xoá bình luận vi phạm và toàn bộ báo cáo liên quan" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá bình luận", error: error.message });
  }
};
