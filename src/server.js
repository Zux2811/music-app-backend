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
import logger from "./utils/logger.js";

import authRoutes from "./routes/auth.routes.js";
import songRoutes from "./routes/song.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";

dotenv.config();

// Validate JWT secret early to avoid running with weak/undefined signing key
const jwtSecret = (process.env.JWT_SECRET || "").trim();
if (!jwtSecret || jwtSecret.length < 16) {
  logger.error("[SECURITY] Invalid or missing JWT_SECRET. Set a strong secret (>=16 chars) in environment variables.");
  process.exit(1);
}

logger.info("Starting application...");
logger.debug("Initial environment:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  SKIP_DB: process.env.SKIP_DB,
  SEQUELIZE_ALTER: process.env.SEQUELIZE_ALTER
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logger.info("Middleware configured");

app.get("/", (req, res) => {
  logger.debug("Root health check endpoint called");
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
    logger.info("Starting database initialization...");
    if (process.env.SKIP_DB === "true") {
      logger.warn("SKIP_DB=true -> Skipping database connection/sync on startup");
    } else {
      logger.info("Authenticating with database...");
      await sequelize.authenticate();
      logger.info("✓ Sequelize connected successfully");
      // Use { alter: true } in development to apply non-destructive changes.
      // Use { force: false } or remove sync in production for safety.
      logger.info("Syncing database models with { alter: true }...");
      await sequelize.sync({ alter: true });
      logger.info(`✓ DB synced with { alter: true }`);

      // ---- Safety migrations for missing columns/constraints (idempotent) ----
      logger.info("Running safety migrations...");
      try {
        const ensureColumn = async (table, column, ddl) => {
          try {
            const [rows] = await sequelize.query(
              `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c`,
              { replacements: { t: table, c: column }, type: sequelize.QueryTypes.SELECT }
            );
            const cnt = rows?.cnt ?? 0;
            if (!Number(cnt)) {
              logger.info(`Adding missing column ${table}.${column} ...`);
              await sequelize.query(`ALTER TABLE ${table} ${ddl}`);
              logger.info(`✓ Added column ${table}.${column}`);
            }
          } catch (e) {
            // Gracefully handle case where table doesn't exist yet, as sync will create it.
            if (e.message.includes("doesn't exist")) {
              logger.warn(`Table ${table} not found for safety check, assuming sync will create it.`);
            } else {
              throw e;
            }
          }
        };

        // Ensure folders.parentId for nesting exists
        await ensureColumn('folders', 'parentId', 'ADD COLUMN parentId INT NULL DEFAULT NULL');

        // You can add other ensureColumn calls here if needed

      } catch (e) {
        logger.error('Error during safety migrations:', e.message);
      }


      // Legacy migration: populate audioUrl from legacy url column if present
      try {
        logger.info("Checking for legacy url->audioUrl migration...");
        await sequelize.query(
          "UPDATE songs SET audioUrl = url WHERE (audioUrl IS NULL OR audioUrl = '') AND url IS NOT NULL"
        );
        logger.info("✓ Migrated legacy url -> audioUrl where needed");
      } catch (e) {
        logger.warn("Legacy url->audioUrl migration skipped:", e.message);
      }

      // Optional: drop legacy 'url' column if explicitly enabled
      if (process.env.DROP_LEGACY_URL === "true") {
        try {
          logger.info("Dropping legacy 'url' column...");
          await sequelize.query("ALTER TABLE songs DROP COLUMN url");
          logger.info("✓ Dropped legacy 'url' column from songs");
        } catch (e) {
          logger.warn("Drop legacy 'url' column skipped:", e.message);
        }
      }

      // Migrate comment likes from legacy JSON column to join table (if legacy existed)
      try {
        logger.info("Recomputing comment likes from join table...");
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
        logger.info("✓ Recomputed comments.likes from comment_likes join table");
      } catch (e) {
        logger.warn("Recompute comments.likes skipped:", e.message);
      }

      // Optionally drop legacy liked_by column if present and enabled
      if (process.env.DROP_LEGACY_LIKED_BY === "true") {
        try {
          logger.info("Dropping legacy 'liked_by' column...");
          await sequelize.query("ALTER TABLE comments DROP COLUMN liked_by");
          logger.info("✓ Dropped legacy 'liked_by' column from comments");
        } catch (e) {
          logger.warn("Drop legacy 'liked_by' column skipped:", e.message);
        }
      }

      logger.info("✓ Database initialization completed successfully");
    }
  } catch (err) {
    logger.error("DB connection/sync error:", err);
  }
})();

// Health check
app.get("/health", (req, res) => {
  logger.debug("Health check called");
  return res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✓ Server listening on port ${PORT}`);
  logger.info("✓ Application started successfully");
  logger.debug("Available routes:", {
    "/": "health check",
    "/health": "health check",
    "/api/auth": "register, login, google-signin",
    "/api/songs": "GET, POST",
    "...": "And more..."
  });
});
