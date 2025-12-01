// // src/models/index.js
// import User from "./user.model.js";
// import Song from "./song.model.js";
// import Playlist from "./playlist.model.js";
// import PlaylistSong from "./playlistSong.model.js";
// import Comment from "./comment.model.js";
// import UserProfile from "./userProfile.model.js";
// import Folder from "./folder.model.js";

// // Associations (giữ giống cấu trúc bạn có)
// User.hasOne(UserProfile, { foreignKey: "user_id" });
// UserProfile.belongsTo(User, { foreignKey: "user_id" });

// User.hasMany(Playlist, { onDelete: "CASCADE" });
// Playlist.belongsTo(User);

// User.hasMany(Folder, { onDelete: "CASCADE" });
// Folder.belongsTo(User);

// Playlist.belongsToMany(Song, {
//   through: PlaylistSong,
//   foreignKey: "playlistId",
//   otherKey: "songId",
// });
// Song.belongsToMany(Playlist, {
//   through: PlaylistSong,
//   foreignKey: "songId",
//   otherKey: "playlistId",
// });

// User.hasMany(Comment, { foreignKey: "user_id" });
// Comment.belongsTo(User, { foreignKey: "user_id" });

// Song.hasMany(Comment, { foreignKey: "song_id" });
// Comment.belongsTo(Song, { foreignKey: "song_id" });

// Playlist.hasMany(Comment, { foreignKey: "playlist_id" });
// Comment.belongsTo(Playlist, { foreignKey: "playlist_id" });

// export {
//   User,
//   Song,
//   Playlist,
//   PlaylistSong,
//   Comment,
//   UserProfile,
//   Folder,
// };

// src/models/index.js

// src/models/index.js
import User from "./user.model.js";
import Song from "./song.model.js";
import Playlist from "./playlist.model.js";
import PlaylistSong from "./playlistSong.model.js";
import Comment from "./comment.model.js";
import UserProfile from "./userProfile.model.js";
import Folder from "./folder.model.js";
import Report from "./report.model.js";
import Favorite from "./favorite.model.js";
import CommentLike from "./commentLike.model.js";

// Associations

User.hasOne(UserProfile, { foreignKey: "user_id" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

// Explicit foreign keys to avoid duplicate/ambiguous names
User.hasMany(Playlist, { foreignKey: "UserId", onDelete: "CASCADE" });
Playlist.belongsTo(User, { foreignKey: "UserId" });

User.hasMany(Folder, { foreignKey: "UserId", onDelete: "CASCADE" });
Folder.belongsTo(User, { foreignKey: "UserId" });

// Folder-Playlist relation
Folder.hasMany(Playlist, { foreignKey: "folderId", onDelete: "CASCADE" });
Playlist.belongsTo(Folder, { foreignKey: "folderId" });

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

// REPORT RELATIONS
User.hasMany(Report, { foreignKey: "userId" });
Report.belongsTo(User, { foreignKey: "userId" });

Comment.hasMany(Report, { foreignKey: "commentId" });
Report.belongsTo(Comment, { foreignKey: "commentId" });

// FAVORITES RELATIONS
User.hasMany(Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId" });
Song.hasMany(Favorite, { foreignKey: "songId", onDelete: "CASCADE" });
Favorite.belongsTo(Song, { foreignKey: "songId" });

// COMMENT LIKES (through table)
User.belongsToMany(Comment, {
  through: CommentLike,
  foreignKey: "userId",
  otherKey: "commentId",
});
Comment.belongsToMany(User, {
  through: CommentLike,
  foreignKey: "commentId",
  otherKey: "userId",
});

export {
  User,
  Song,
  Playlist,
  PlaylistSong,
  Comment,
  UserProfile,
  Folder,
  Report,
  Favorite,
  CommentLike,
};
