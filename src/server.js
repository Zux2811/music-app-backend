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
import folderRoutes from "./routes/folder.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";

dotenv.config();

console.log("[SERVER] Starting application...");
console.log("[SERVER] Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  SKIP_DB: process.env.SKIP_DB,
  SEQUELIZE_ALTER: process.env.SEQUELIZE_ALTER
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("[SERVER] Middleware configured");

app.get("/", (req, res) => {
  console.log("[SERVER] Health check endpoint called");
  return res.json({ status: "ok", time: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/favorites", favoriteRoutes);

// connect + sync (non-blocking for port binding/health)
(async () => {
  try {
    console.log("[DB] Starting database initialization...");
    if (process.env.SKIP_DB === "true") {
      console.log("[DB] SKIP_DB=true -> Bỏ qua kết nối/đồng bộ DB lúc khởi động");
    } else {
      console.log("[DB] Authenticating with database...");
      await sequelize.authenticate();
      console.log("[DB] ✓ Sequelize connected successfully");
      const alter = process.env.SEQUELIZE_ALTER === "true";
      console.log("[DB] Syncing database models...");
      await sequelize.sync(alter ? { alter: true } : undefined);
      console.log(`[DB] ✓ DB synced${alter ? " (alter:true)" : ""}.`);
      // Legacy migration: populate audioUrl from legacy url column if present
      try {
        console.log("[DB] Checking for legacy url->audioUrl migration...");
        await sequelize.query(
          "UPDATE songs SET audioUrl = url WHERE (audioUrl IS NULL OR audioUrl = '') AND url IS NOT NULL"
        );
        console.log("[DB] ✓ Migrated legacy url -> audioUrl where needed");
      } catch (e) {
        console.warn("[DB] Legacy url->audioUrl migration skipped:", e.message);
      }

      // Optional: drop legacy 'url' column if explicitly enabled
      if (process.env.DROP_LEGACY_URL === "true") {
        try {
          console.log("[DB] Dropping legacy 'url' column...");
          await sequelize.query("ALTER TABLE songs DROP COLUMN url");
          console.log("[DB] ✓ Dropped legacy 'url' column from songs");
        } catch (e) {
          console.warn("[DB] Drop legacy 'url' column skipped:", e.message);
        }
      }

      // Migrate comment likes from legacy JSON column to join table (if legacy existed)
      try {
        console.log("[DB] Recomputing comment likes from join table...");
        // Recompute denormalized likes counter from join table for all comments
        await sequelize.query(
          `UPDATE comments c
           LEFT JOIN (
             SELECT commentId, COUNT(*) AS cnt
             FROM comment_likes
             GROUP BY commentId
           ) cl ON cl.commentId = c.id
           SET c.likes = COALESCE(cl.cnt, 0)`
        );
        console.log("[DB] ✓ Recomputed comments.likes from comment_likes join table");
      } catch (e) {
        console.warn("[DB] Recompute comments.likes skipped:", e.message);
      }

      // Optionally drop legacy liked_by column if present and enabled
      if (process.env.DROP_LEGACY_LIKED_BY === "true") {
        try {
          console.log("[DB] Dropping legacy 'liked_by' column...");
          await sequelize.query("ALTER TABLE comments DROP COLUMN liked_by");
          console.log("[DB] ✓ Dropped legacy 'liked_by' column from comments");
        } catch (e) {
          console.warn("[DB] Drop legacy 'liked_by' column skipped:", e.message);
        }
      }

      console.log("[DB] ✓ Database initialization completed successfully");
    }
  } catch (err) {
    console.error("[DB] ✗ DB connection/sync error:", err.message, err.stack);
  }
})();

// Health check
app.get("/health", (req, res) => {
  console.log("[SERVER] Health check called");
  return res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("[SERVER] ✓ Server listening on port", PORT);
  console.log("[SERVER] ✓ Application started successfully");
  console.log("[SERVER] Available routes:");
  console.log("  - GET  /                 (health check)");
  console.log("  - GET  /health           (health check)");
  console.log("  - POST /api/auth/register");
  console.log("  - POST /api/auth/login");
  console.log("  - POST /api/auth/google-signin");
  console.log("  - GET  /api/songs");
  console.log("  - POST /api/songs");
  console.log("  - And more...");
});
