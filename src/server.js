// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import "./models/index.js"; // load models & associations
import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// connect + sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected.");
    await sequelize.sync({ alter: true }); // alter:true để cập nhật schema nhẹ — dùng { force: false } hoặc remove trên prod
    console.log("DB synced.");
  } catch (err) {
    console.error("DB connection/sync error:", err);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));


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
