import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import "./models/index.js"; // load all models + associations automatically
import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test server
app.get("/", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/upload", uploadRoutes);

// connect DB + sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected with Sequelize.");

    await sequelize.sync(); // tự tạo bảng nếu chưa có
    console.log("Database synced.");
  } catch (err) {
    console.error("DB error:", err.message);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // src/server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import authRoutes from "./routes/auth.routes.js";
// import songRoutes from "./routes/song.routes.js";
// import uploadRoutes from "./routes/upload.routes.js"; // optional (nếu có)
// import db from "./config/db.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // health check
// app.get("/", (req, res) => res.json({ status: "ok", time: new Date() }));

// // routes
// app.use("/api/auth", authRoutes);
// app.use("/api/songs", songRoutes);
// app.use("/api/upload", uploadRoutes); // nếu bạn không dùng upload.routes.js hãy xoá dòng này

// // quick DB check on startup (non-blocking)
// (async () => {
//   try {
//     await db.query("SELECT 1");
//     console.log("MySQL (Railway) reachable.");
//   } catch (err) {
//     console.error("MySQL connection error:", err.message || err);
//   }
// })();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
