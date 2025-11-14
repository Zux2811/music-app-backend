import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Playlist from "./playlist.model.js";
import Song from "./song.model.js";

const PlaylistSong = sequelize.define(
  "PlaylistSong",
  {
    playlistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Playlist,
        key: "id",
      },
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Song,
        key: "id",
      },
    },
  },
  {
    tableName: "playlist_songs",
    timestamps: true,
  }
);

Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: "playlistId",
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: "songId",
});

export default PlaylistSong;
