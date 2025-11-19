import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Playlist = sequelize.define("Playlist", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "playlists",
  timestamps: true,
});

export default Playlist;
