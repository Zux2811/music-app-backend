// // src/server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import sequelize from "./config/db.js";
// import "./models/index.js"; // load models & associations
// import authRoutes from "./routes/auth.routes.js";
// import songRoutes from "./routes/song.routes.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => res.json({ status: "ok", time: new Date() }));

// app.use("/api/auth", authRoutes);
// app.use("/api/songs", songRoutes);

// // connect + sync
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Sequelize connected.");
//     await sequelize.sync({ alter: true }); // alter:true để cập nhật schema nhẹ — dùng { force: false } hoặc remove trên prod
//     console.log("DB synced.");
//   } catch (err) {
//     console.error("DB connection/sync error:", err);
//   }
// })();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server listening on ${PORT}`));


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import "./models/index.js";

import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";
import commentRoutes from "./routes/comment.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/comments", commentRoutes);

// connect + sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected.");
    await sequelize.sync({ alter: true });
    console.log("DB synced.");
  } catch (err) {
    console.error("DB connection/sync error:", err);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
