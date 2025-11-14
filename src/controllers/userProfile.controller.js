import UserProfile from "../models/userProfile.model.js";
import User from "../models/user.model.js";

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { user_id, avatar_url, bio } = req.body;
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const [profile, created] = await UserProfile.upsert({ user_id, avatar_url, bio });
    res.json({ message: created ? "Tạo hồ sơ thành công" : "Cập nhật hồ sơ thành công", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ where: { user_id: userId } });
    if (!profile) return res.status(404).json({ message: "Chưa có hồ sơ" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
