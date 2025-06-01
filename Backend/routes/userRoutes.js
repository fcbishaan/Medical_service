import express from 'express';
import { getPatientProfile, registerUser, userLogin, editPatientProfile } from '../controller/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The user ID
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [patient, doctor, admin]
 *           description: User's role in the system
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user account was created
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new patient account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or email already in use
 *       500:
 *         description: Server error
 */
userRouter.post('/register', registerUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
userRouter.post('/login', userLogin);

/**
 * @swagger
 * /api/user/patient/profile/me:
 *   get:
 *     summary: Get patient profile
 *     description: Retrieves the authenticated patient's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
userRouter.get('/patient/profile/me', authMiddleware, getPatientProfile);

/**
 * @swagger
 * /api/user/patient/profile/me:
 *   put:
 *     summary: Update patient profile
 *     description: Updates the authenticated patient's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.put('/patient/profile/me', authMiddleware, editPatientProfile);

export default userRouter;