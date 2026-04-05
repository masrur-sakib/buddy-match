const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  password: { type: DataTypes.STRING, allowNull: false },
  profileImage: { type: DataTypes.STRING },
});

const Post = sequelize.define(
  'Post',
  {
    content: { type: DataTypes.TEXT, allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    privacy: {
      type: DataTypes.ENUM('public', 'private'),
      defaultValue: 'public',
    },
  },
  {
    indexes: [{ fields: ['createdAt'] }], // For fast "newest first" sorting
  },
);

const Comment = sequelize.define('Comment', {
  content: { type: DataTypes.TEXT, allowNull: false },
  parentId: { type: DataTypes.INTEGER, allowNull: true }, // For replies
});

const PostLike = sequelize.define('PostLike', {});
const CommentLike = sequelize.define('CommentLike', {});

// --- Relations ---

// User & Posts
User.hasMany(Post);
Post.belongsTo(User);

// User & Comments
User.hasMany(Comment);
Comment.belongsTo(User);

// Post & Comments
Post.hasMany(Comment);
Comment.belongsTo(Post);

// Post Likes
Post.hasMany(PostLike);
PostLike.belongsTo(Post);
User.hasMany(PostLike);
PostLike.belongsTo(User);

// Comment Likes
Comment.hasMany(CommentLike);
CommentLike.belongsTo(Comment);
User.hasMany(CommentLike);
CommentLike.belongsTo(User);

// Self-relation for Replies
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

module.exports = { sequelize, User, Post, Comment, PostLike, CommentLike };
