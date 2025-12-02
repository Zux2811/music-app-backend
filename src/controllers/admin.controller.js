import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createJwt } from "../utils/jwt.js";

// =======================
// 1. LOGIN ADMIN
// =======================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // DEBUG: Log user object found in DB
    console.log("[LOGIN_ADMIN_DEBUG] User found in DB:", JSON.stringify(admin, null, 2));

    // Kiểm tra mật khẩu
    console.log("[LOGIN_ADMIN_DEBUG] Comparing passwords...");
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("[LOGIN_ADMIN_DEBUG] Password match result:", isMatch);

    if (!isMatch) {
      console.warn("[LOGIN_ADMIN_DEBUG] Password comparison failed.");
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
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// =======================
// 2. LẤY TẤT CẢ USER
// =======================
export const getAllUsers = async (req, res) => {
  try {
    // Sửa: Dùng Sequelize findAll thay vì MongoDB find
    const users = await User.findAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// =======================
// 3. XÓA USER
// =======================
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Sửa: Dùng Sequelize destroy thay vì MongoDB findByIdAndDelete
    await User.destroy({ where: { id } });

    res.json({ message: "Xóa người dùng thành công" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};


