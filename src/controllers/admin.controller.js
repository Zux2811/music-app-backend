import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createJwt } from "../utils/jwt.js";
import logger from "../utils/logger.js";

// =======================
// 1. LOGIN ADMIN
// =======================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info("Admin login attempt", { email });

    // Sửa: Dùng { where: { email } } cho Sequelize
    const admin = await User.findOne({ where: { email } });
    if (!admin) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Kiểm tra role
    // Trim and convert to lowercase for robust role checking
    if (admin.role?.trim().toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Tài khoản này không có quyền admin" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Issue JWT with id, email, role
    const token = createJwt(admin);

    res.json({
      message: "Đăng nhập admin thành công",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    logger.error("Admin login error", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// =======================
// 2. LẤY TẤT CẢ USER
// =======================
export const getAllUsers = async (req, res) => {
  try {
    logger.info("Fetching all users for admin");
    const users = await User.findAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] },
    });
    logger.debug("Found users", { count: users.length });
    res.json(users);
  } catch (err) {
    logger.error("Error fetching all users", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// =======================
// 3. XÓA USER
// =======================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info("Admin deleting user", { id });

    const result = await User.destroy({ where: { id } });

    if (result === 0) {
      logger.warn("Delete user failed: User not found", { id });
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User deleted successfully", { id });
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    logger.error("Error deleting user", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


