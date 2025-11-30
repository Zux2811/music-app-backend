import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Playlist = sequelize.define("Playlist", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  // Associations will create UserId and folderId foreign keys; explicitly include folderId here
  folderId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "playlists",
  timestamps: true,
});

export default Playlist;
