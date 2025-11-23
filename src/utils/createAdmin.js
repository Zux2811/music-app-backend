import bcrypt from "bcrypt";
import db from "../config/db.js";

async function createAdmin() {
  try {
    const username = "admin";
    const email = "admin@gmail.com";
    const password = "123456";

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, "admin"]
    );

    console.log("✅ Admin created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
