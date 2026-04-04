const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', auth, postController.getFeed);
router.post('/', auth, upload.single('image'), postController.createPost);
router.post('/:postId/like', auth, postController.toggleLike);
router.post('/comments', auth, postController.createComment);
router.post(
  '/comments/:commentId/like',
  auth,
  postController.toggleCommentLike,
);

module.exports = router;
