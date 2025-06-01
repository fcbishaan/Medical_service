import express from 'express';
import { getProfile, userOrDoctorLoginCombined } from '../controller/authController.js';
import { registerUser } from '../controller/userController.js';
import { requestToJoin } from '../controller/doctorController.js';
import upload from '../middleware/multer.js';
import authMiddleware from '../middleware/authMiddleware.js';

const authRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *         name:
 *           type: string
 *           description: User's full name
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for users or doctors
 *     description: Authenticates a user or doctor and returns a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
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
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
authRoutes.post('/login', userOrDoctorLoginCombined);

/**
 * @swagger
 * /api/auth/register/patient:
 *   post:
 *     summary: Register as a patient
 *     description: Create a new patient account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
authRoutes.post('/register/patient', registerUser); 

/**
 * @swagger
 * /api/auth/register/doctor:
 *   post:
 *     summary: Register as a doctor
 *     description: Submit a request to join as a doctor
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               specialization:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Doctor's profile image or credentials document
 *     responses:
 *       201:
 *         description: Doctor registration request submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
authRoutes.post('/register/doctor', upload.single('file'), requestToJoin); 

/**
 * @swagger
 * /api/auth/profile/me:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile information of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
authRoutes.get('/profile/me', authMiddleware, getProfile);

export default authRoutes;