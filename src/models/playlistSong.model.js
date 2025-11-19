const PlaylistSong = sequelize.define("PlaylistSong", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  playlistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  songId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "playlist_songs",
  timestamps: true,
});

export default PlaylistSong;
