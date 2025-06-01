import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addComment, createPost, deleteMyPost, getAllFeedPosts, getMyPosts, likePost, replyToComment } from '../controller/PostController.js';
import upload from '../middleware/multer.js';

const postRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The post ID
 *         author:
 *           type: string
 *           description: Reference to the doctor who created the post
 *         title:
 *           type: string
 *           description: Title of the post
 *         content:
 *           type: string
 *           description: Content of the post
 *         image:
 *           type: string
 *           description: URL to the post image
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who liked the post
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               content:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               replies:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the post was last updated
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new educational post (doctor only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               content:
 *                 type: string
 *                 description: Post content
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image for the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only doctors can create posts
 *       500:
 *         description: Server error
 */
postRouter.post('/', authMiddleware, upload.single('image'), createPost); 

/**
 * @swagger
 * /api/posts/my-posts:
 *   get:
 *     summary: Get my posts
 *     description: Retrieves all posts created by the authenticated doctor
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctor's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
postRouter.get('/my-posts', authMiddleware, getMyPosts); 

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a post created by the authenticated doctor
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the post author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.delete('/:id', authMiddleware, deleteMyPost); 

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get all posts
 *     description: Retrieves all published posts for the public feed
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
postRouter.get('/feed', getAllFeedPosts);             

/**
 * @swagger
 * /api/posts/like/{id}:
 *   post:
 *     summary: Like a post
 *     description: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID to like/unlike
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.post('/like/:id', authMiddleware, likePost); 

/**
 * @swagger
 * /api/posts/comment/{id}:
 *   post:
 *     summary: Comment on a post
 *     description: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.post('/comment/:id', authMiddleware, addComment);   

/**
 * @swagger
 * /api/posts/comment/reply/{postId}/{commentId}:
 *   put:
 *     summary: Reply to a comment
 *     description: Add a reply to an existing comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Reply content
 *     responses:
 *       200:
 *         description: Reply added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
postRouter.put('/comment/reply/:postId/:commentId', authMiddleware, replyToComment); 

export default postRouter;