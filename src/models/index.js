import User from "./user.model.js";
import Song from "./song.model.js";
import Playlist from "./playlist.model.js";
import PlaylistSong from "./playlistSong.model.js";
import Comment from "./comment.model.js";
import UserProfile from "./userProfile.model.js";

// ASSOCIATIONS

// User <-> UserProfile (1-1)
User.hasOne(UserProfile, { foreignKey: "user_id" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

// Playlist <-> Song (N-N)
Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: "playlistId",
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: "songId",
});

// User <-> Comment (1-N)
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

// Song <-> Comment
Song.hasMany(Comment, { foreignKey: "song_id" });
Comment.belongsTo(Song, { foreignKey: "song_id" });

// Playlist <-> Comment
Playlist.hasMany(Comment, { foreignKey: "playlist_id" });
Comment.belongsTo(Playlist, { foreignKey: "playlist_id" });

export default {
  User,
  Song,
  Playlist,
  PlaylistSong,
  Comment,
  UserProfile,
};
