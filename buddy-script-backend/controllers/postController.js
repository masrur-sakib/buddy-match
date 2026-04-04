const { Post, User, PostLike, Comment, CommentLike } = require('../models');
const { uploadToSupabase } = require('../middleware/upload');
const { Op } = require('sequelize');

exports.createPost = async (req, res) => {
  try {
    const { content, privacy } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const post = await Post.create({
      content,
      imageUrl,
      privacy,
      UserId: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        [Op.or]: [{ privacy: 'public' }, { UserId: req.user.id }],
      },
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        {
          model: PostLike,
          include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        },
        {
          model: Comment,
          where: { parentId: null }, // Fetch only top-level comments
          required: false,
          include: [
            { model: User, attributes: ['firstName'] },
            { model: CommentLike },
            {
              model: Comment,
              as: 'replies',
              include: [{ model: User, attributes: ['firstName'] }],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const existingLike = await PostLike.findOne({
    where: { PostId: postId, UserId: userId },
  });
  if (existingLike) {
    await existingLike.destroy();
    return res.json({ message: 'Unliked' });
  }
  await PostLike.create({ PostId: postId, UserId: userId });
  res.json({ message: 'Liked' });
};

// Handles both top-level comments and replies
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body; // parentId is used for replies
    const comment = await Comment.create({
      content,
      PostId: postId,
      UserId: req.user.id,
      parentId: parentId || null,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle like for comments/replies
exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const existingLike = await CommentLike.findOne({
      where: { CommentId: commentId, UserId: userId },
    });
    if (existingLike) {
      await existingLike.destroy();
      return res.json({ message: 'Comment unliked' });
    }
    await CommentLike.create({ CommentId: commentId, UserId: userId });
    res.json({ message: 'Comment liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
