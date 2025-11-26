import User from "../models/user.model.js";
import Report from "../models/report.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Bạn không phải admin" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Sửa: Dùng admin.id thay vì admin._id (Sequelize)
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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

// =======================
// 4. LẤY DANH SÁCH REPORT
// =======================
export const getAllReports = async (req, res) => {
  try {
    // Sửa: Dùng Sequelize findAll với include thay vì MongoDB find().populate()
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          attributes: ["username", "email"]
        }
      ]
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// =======================
// 5. GIẢI QUYẾT REPORT
// =======================
export const resolveReport = async (req, res) => {
  try {
    const id = req.params.id;

    // Sửa: Dùng Sequelize update thay vì MongoDB findByIdAndUpdate
    await Report.update(
      { status: "resolved" },
      { where: { id } }
    );

    res.json({ message: "Đã xử lý report" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};
