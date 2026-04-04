const { Post, User, PostLike, Comment } = require('../models');

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { privacy: 'public' },
          { UserId: req.user.id }, // Private posts visible to author
        ],
      },
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        { model: PostLike, attributes: ['UserId'] }, // To show who liked
        {
          model: Comment,
          where: { parentId: null }, // Only top-level comments
          include: [{ model: Comment, as: 'replies' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
