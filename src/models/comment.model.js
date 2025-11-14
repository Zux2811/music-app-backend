import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";
import Song from "./song.model.js";
import Playlist from "./playlist.model.js";

const Comment = sequelize.define("Comment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  song_id: { type: DataTypes.INTEGER, allowNull: true },
  playlist_id: { type: DataTypes.INTEGER, allowNull: true },
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: "comments",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

export default Comment;
