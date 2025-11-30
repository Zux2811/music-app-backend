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
app.use("/api/folders", folderRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/favorites", favoriteRoutes);

// connect + sync (non-blocking for port binding/health)
(async () => {
  try {
    if (process.env.SKIP_DB === "true") {
      console.log("SKIP_DB=true -> Bỏ qua kết nối/đồng bộ DB lúc khởi động");
    } else {
      await sequelize.authenticate();
      console.log("Sequelize connected.");
      const alter = process.env.SEQUELIZE_ALTER === "true";
      await sequelize.sync(alter ? { alter: true } : undefined);
      console.log(`DB synced${alter ? " (alter:true)" : ""}.`);
      // Legacy migration: populate audioUrl from legacy url column if present
      try {
        await sequelize.query(
          "UPDATE songs SET audioUrl = url WHERE (audioUrl IS NULL OR audioUrl = '') AND url IS NOT NULL"
        );
        console.log("Migrated legacy url -> audioUrl where needed.");
      } catch (e) {
        console.warn("Legacy url->audioUrl migration skipped:", e.message);
      }

      // Optional: drop legacy 'url' column if explicitly enabled
      if (process.env.DROP_LEGACY_URL === "true") {
        try {
          await sequelize.query("ALTER TABLE songs DROP COLUMN url");
          console.log("Dropped legacy 'url' column from songs.");
        } catch (e) {
          console.warn("Drop legacy 'url' column skipped:", e.message);
        }
      // Migrate comment likes from legacy JSON column to join table (if legacy existed)
      try {
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
        console.log("Recomputed comments.likes from comment_likes join table.");
      } catch (e) {
        console.warn("Recompute comments.likes skipped:", e.message);
      }

      // Optionally drop legacy liked_by column if present and enabled
      if (process.env.DROP_LEGACY_LIKED_BY === "true") {
        try {
          await sequelize.query("ALTER TABLE comments DROP COLUMN liked_by");
          console.log("Dropped legacy 'liked_by' column from comments.");
        } catch (e) {
          console.warn("Drop legacy 'liked_by' column skipped:", e.message);
        }
      }

      }

    }
  } catch (err) {
    console.error("DB connection/sync error:", err);
  }
})();

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
