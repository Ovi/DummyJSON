/**
 * @openapi
 * tags:
 *   - name: Comment
 *     description: Comment management and user feedback operations
 */

const router = require('express').Router();
const {
  getAllComments,
  getCommentById,
  getAllCommentsByPostId,
  addNewComment,
  updateCommentById,
  deleteCommentById,
} = require('../controllers/comment');

/**
 * @openapi
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comment]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of comments to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of comments to skip
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentsResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllComments({ ...req._options }));
});

/**
 * @openapi
 * /comments/{id}:
 *   get:
 *     summary: Get a single comment by ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCommentResponse'
 *       404:
 *         description: Comment not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  res.send(getCommentById({ id }));
});

/**
 * @openapi
 * /comments/post/{postId}:
 *   get:
 *     summary: Get all comments by post ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of comments to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of comments to skip
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentsResponse'
 */
router.get('/post/:postId', (req, res) => {
  const { postId } = req.params;

  res.send(getAllCommentsByPostId({ postId, ...req._options }));
});

/**
 * @openapi
 * /comments/add:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       201:
 *         description: New comment created (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCommentResponse'
 *       400:
 *         description: Invalid input
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewComment({ ...req.body }));
});

/**
 * @openapi
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID (replace)
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Updated comment (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCommentResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Comment not found
 *   patch:
 *     summary: Update a comment by ID (partial)
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Updated comment (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCommentResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Comment not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCommentById({ id, ...req.body }));
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCommentById({ id, ...req.body }));
});

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Deleted comment (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedCommentResponse'
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', (req, res) => {
  res.send(deleteCommentById({ ...req.params }));
});

module.exports = router;
