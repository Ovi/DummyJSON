const router = require('express').Router();
const {
  getAllComments,
  getCommentById,
  getAllCommentsByPostId,
  addNewComment,
  updateCommentById,
  deleteCommentById,
} = require('../controllers/comment');

// get all comments
router.get('/', (req, res) => {
  res.send(getAllComments({ ...req._options }));
});

// get comment by id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  res.send(getCommentById({ id }));
});

// get comments by postId
router.get('/post/:postId', (req, res) => {
  const { postId } = req.params;

  res.send(getAllCommentsByPostId({ postId, ...req._options }));
});

// add new comment
router.post('/add', (req, res) => {
  res.status(201).send(addNewComment({ ...req.body }));
});

// update comment by id (PUT)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCommentById({ id, ...req.body }));
});

// update comment by id (PATCH)
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCommentById({ id, ...req.body }));
});

// delete comment by id
router.delete('/:id', (req, res) => {
  res.send(deleteCommentById({ ...req.params }));
});

module.exports = router;
