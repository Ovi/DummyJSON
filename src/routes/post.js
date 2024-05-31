const router = require('express').Router();
const { getAllCommentsByPostId } = require('../controllers/comment');
const {
  getAllPosts,
  searchPosts,
  getPostById,
  getPostsByUserId,
  addNewPost,
  updatePost,
  deletePostById,
  getPostTagList,
  getPostTags,
  getPostsByTag,
} = require('../controllers/post');

// get all posts
router.get('/', (req, res) => {
  res.send(getAllPosts({ ...req._options }));
});

// search post
router.get('/search', (req, res) => {
  res.send(searchPosts({ ...req._options }));
});

// get post tag list
router.get('/tag-list', (req, res) => {
  res.send(getPostTagList());
});

// get post tags
router.get('/tags', (req, res) => {
  res.send(getPostTags());
});

// get post by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getPostById({ id, select }));
});

// get posts by tag
router.get('/tag/:tag', (req, res) => {
  const { tag } = req.params;

  res.send(getPostsByTag({ tag, ...req._options }));
});

// get posts by userId
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  res.send(getPostsByUserId({ userId, ...req._options }));
});

// get comments by postId
router.get('/:postId/comments', (req, res) => {
  const { postId } = req.params;

  res.send(getAllCommentsByPostId({ postId, ...req._options }));
});

// add new post
router.post('/add', (req, res) => {
  res.status(201).send(addNewPost({ ...req.body }));
});

// update post by id (PUT)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updatePost({ id, ...req.body }));
});

// update post by id (PATCH)
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updatePost({ id, ...req.body }));
});

// delete post by id
router.delete('/:id', (req, res) => {
  res.send(deletePostById({ ...req.params }));
});

module.exports = router;
