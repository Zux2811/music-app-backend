import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

const Playlist = sequelize.define(
  "Playlist",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "playlists",
    timestamps: true,
  }
);

User.hasMany(Playlist, { foreignKey: "UserId", onDelete: "CASCADE" });
Playlist.belongsTo(User, { foreignKey: "UserId" });

export default Playlist;
