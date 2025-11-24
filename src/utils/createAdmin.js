import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import sequelize from "../config/db.js";

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log("DB connected!");

    const username = "admin";
    const email = "admin@gmail.com";
    const password = "123456";

    const hashed = await bcrypt.hash(password, 10);

    // check admin tồn tại chưa
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    await User.create({
      username,
      email,
      password: hashed,
      role: "admin",
    });

    console.log("✅ Admin created successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
