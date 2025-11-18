import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Song = sequelize.define(
  "Song",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    album: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "songs",
    timestamps: true,
  }
);

export default Song;
