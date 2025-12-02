import Report from "../models/report.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

// ===============================
// 1. USER GỬI BÁO CÁO COMMENT
// ===============================
export const reportComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;
    const { message } = req.body;
    logger.info("User reporting comment", { userId, commentId });

    if (!message) {
      logger.warn("Report comment failed: Message is empty", { userId, commentId });
      return res.status(400).json({ message: "Lý do báo cáo không được để trống" });
    }

    const commentExists = await Comment.findByPk(commentId);
    if (!commentExists) {
      logger.warn("Report comment failed: Comment not found", { commentId });
      return res.status(404).json({ message: "Không tìm thấy bình luận để báo cáo" });
    }

    const existing = await Report.findOne({ where: { userId, commentId } });
    if (existing) {
      logger.warn("Report comment failed: User already reported this comment", { userId, commentId });
      return res.status(400).json({ message: "Bạn đã báo cáo bình luận này rồi" });
    }

    await Report.create({ userId, commentId, message });

    logger.info("Comment reported successfully", { userId, commentId });
    res.json({ message: "Báo cáo đã được gửi" });
  } catch (error) {
    logger.error("Error reporting comment", error);
    res.status(500).json({ message: "Lỗi khi gửi báo cáo", error: error.message });
  }
};

// ===============================
// 2. ADMIN LẤY DANH SÁCH BÁO CÁO
// ===============================
export const getAllReports = async (req, res) => {
  try {
    logger.info("Admin fetching all reports");
    const reports = await Report.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        { model: Comment, as: "comment", attributes: ["id", "content", "user_id"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    logger.debug("Found reports", { count: reports.length });
    res.json(reports);
  } catch (error) {
    logger.error("Error fetching all reports", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách báo cáo", error: error.message });
  }
};

// =====================================================
// 3. ADMIN XEM COMMENT KÈM SỐ LƯỢNG BÁO CÁO
// =====================================================
export const getReportedComments = async (req, res) => {
  try {
    logger.info("Admin fetching reported comments summary");
    const results = await Report.findAll({
      attributes: [
        "commentId",
        [Report.sequelize.fn("COUNT", Report.sequelize.col("commentId")), "reportCount"],
      ],
      include: [
        {
          model: Comment,
          as: "comment",
          attributes: ["id", "content", "user_id", "song_id", "playlist_id"],
        },
      ],
      group: ["commentId"],
      order: [["reportCount", "DESC"]],
    });
    logger.debug("Found reported comments groups", { count: results.length });
    res.json(results);
  } catch (error) {
    logger.error("Error fetching reported comments summary", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách báo cáo theo nhóm", error: error.message });
  }
};

// ===============================
// 4. ADMIN XOÁ 1 BÁO CÁO
// ===============================
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info("Admin deleting report", { reportId: id, adminId: req.user.id });

    const report = await Report.findByPk(id);
    if (!report) {
      logger.warn("Delete report failed: Report not found", { reportId: id });
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    await report.destroy();
    logger.info("Report deleted successfully", { reportId: id });
    res.json({ message: "Đã xoá báo cáo" });
  } catch (error) {
    logger.error("Error deleting report", error);
    res.status(500).json({ message: "Lỗi khi xoá báo cáo", error: error.message });
  }
};

// ===============================
// 5. ADMIN XOÁ BÌNH LUẬN BỊ VI PHẠM
// ===============================
export const deleteCommentByAdmin = async (req, res) => {
  try {
    const { commentId } = req.params;
    logger.info("Admin deleting reported comment and its reports", { commentId, adminId: req.user.id });

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      logger.warn("Admin delete comment failed: Comment not found", { commentId });
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    await Report.destroy({ where: { commentId } });
    await comment.destroy();

    logger.info("Reported comment and associated reports deleted successfully", { commentId });
    res.json({ message: "Đã xoá bình luận vi phạm và toàn bộ báo cáo liên quan" });
  } catch (error) {
    logger.error("Error deleting reported comment", error);
    res.status(500).json({ message: "Lỗi xoá bình luận", error: error.message });
  }
};
