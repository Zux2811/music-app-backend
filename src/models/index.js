// src/models/index.js
import User from "./user.model.js";
import Song from "./song.model.js";
import Playlist from "./playlist.model.js";
import PlaylistSong from "./playlistSong.model.js";
import Comment from "./comment.model.js";
import UserProfile from "./userProfile.model.js";
import Folder from "./folder.model.js";

// Associations (giữ giống cấu trúc bạn có)
User.hasOne(UserProfile, { foreignKey: "user_id" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Playlist, { onDelete: "CASCADE" });
Playlist.belongsTo(User);

User.hasMany(Folder, { onDelete: "CASCADE" });
Folder.belongsTo(User);

Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: "playlistId",
  otherKey: "songId",
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: "songId",
  otherKey: "playlistId",
});

User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Song.hasMany(Comment, { foreignKey: "song_id" });
Comment.belongsTo(Song, { foreignKey: "song_id" });

Playlist.hasMany(Comment, { foreignKey: "playlist_id" });
Comment.belongsTo(Playlist, { foreignKey: "playlist_id" });

export {
  User,
  Song,
  Playlist,
  PlaylistSong,
  Comment,
  UserProfile,
  Folder,
};
