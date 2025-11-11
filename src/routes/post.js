/**
 * @openapi
 * tags:
 *   name: Posts
 *   description: API endpoints for managing posts
 */

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

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of posts to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllPosts({ ...req._options }));
});

/**
 * @openapi
 * /posts/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of posts to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 */
router.get('/search', (req, res) => {
  res.send(searchPosts({ ...req._options }));
});

/**
 * @openapi
 * /posts/tag-list:
 *   get:
 *     summary: Get all available post tags (flat list)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all available tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/tag-list', (req, res) => {
  res.send(getPostTagList());
});

/**
 * @openapi
 * /posts/tags:
 *   get:
 *     summary: Get all available post tags (grouped)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all available tags grouped
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/tags', (req, res) => {
  res.send(getPostTags());
});

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *     responses:
 *       200:
 *         description: The post object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getPostById({ id, select }));
});

/**
 * @openapi
 * /posts/tag/{tag}:
 *   get:
 *     summary: Get posts by tag
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag to filter posts by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of posts to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts with the given tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 */
router.get('/tag/:tag', (req, res) => {
  const { tag } = req.params;

  res.send(getPostsByTag({ tag, ...req._options }));
});

/**
 * @openapi
 * /posts/user/{userId}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to filter posts by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of posts to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts by the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  res.send(getPostsByUserId({ userId, ...req._options }));
});

/**
 * @openapi
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentsResponse'
 */
router.get('/:postId/comments', (req, res) => {
  const { postId } = req.params;

  res.send(getAllCommentsByPostId({ postId, ...req._options }));
});

/**
 * @openapi
 * /posts/add:
 *   post:
 *     summary: Add a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPostRequest'
 *     responses:
 *       201:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewPost({ ...req.body }));
});

/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID (replace)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updatePost({ id, ...req.body }));
});

/**
 * @openapi
 * /posts/{id}:
 *   patch:
 *     summary: Update a post by ID (partial)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updatePost({ id, ...req.body }));
});

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The deleted post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedPostResponse'
 *       404:
 *         description: Post not found
 */
router.delete('/:id', (req, res) => {
  res.send(deletePostById({ ...req.params }));
});

module.exports = router;
