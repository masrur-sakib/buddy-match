const { Post, User, PostLike, Comment, CommentLike } = require('../models');
const {
  uploadToSupabase,
  getSignedImageUrl,
  getStorageFilePath,
} = require('../middleware/upload');
const { Op } = require('sequelize');

const canAccessPost = (post, userId) =>
  post.privacy === 'public' || post.UserId === userId;

exports.createPost = async (req, res) => {
  try {
    const { content, privacy = 'public' } = req.body;
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
        { model: User, attributes: ['firstName', 'lastName', 'profileImage'] },
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

    const feed = await Promise.all(
      posts.map(async (post) => {
        const jsonPost = post.toJSON();

        if (jsonPost.imageUrl) {
          const storagePath = getStorageFilePath(jsonPost.imageUrl);
          if (storagePath) {
            try {
              jsonPost.imageUrl = await getSignedImageUrl(storagePath);
            } catch (error) {
              jsonPost.imageUrl = null;
            }
          }
        }

        if (jsonPost.User?.profileImage) {
          const profileStoragePath = getStorageFilePath(
            jsonPost.User.profileImage,
          );
          if (profileStoragePath) {
            try {
              jsonPost.User.profileImage =
                await getSignedImageUrl(profileStoragePath);
            } catch (error) {
              jsonPost.User.profileImage = null;
            }
          }
        }

        return jsonPost;
      }),
    );

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!canAccessPost(post, userId)) {
      return res.status(403).json({ error: 'You cannot like this post' });
    }

    const existingLike = await PostLike.findOne({
      where: { PostId: postId, UserId: userId },
    });
    if (existingLike) {
      await existingLike.destroy();
      return res.json({ message: 'Unliked' });
    }
    await PostLike.create({ PostId: postId, UserId: userId });
    res.json({ message: 'Liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Handles both top-level comments and replies
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body; // parentId is used for replies
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!canAccessPost(post, req.user.id)) {
      return res.status(403).json({ error: 'You cannot comment on this post' });
    }

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

    const comment = await Comment.findByPk(commentId, {
      include: [{ model: Post }],
    });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!canAccessPost(comment.Post, userId)) {
      return res.status(403).json({ error: 'You cannot like this comment' });
    }

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
