import express from "express";
import { changeDoctorPassword, completeDoctorProfile, deleteDoctor, getAllDoctors, getAllPublicDoctors, getMyProfile, getPublicDoctorById, setDoctorPassword, updateDoctorProfile } from "../controller/doctorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireProfileCompletion } from "../middleware/doctorProfileMiddleware.js";
import authAdmin from "../middleware/authAdmin.js";

const doctorRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The doctor ID
 *         name:
 *           type: string
 *           description: The doctor's full name
 *         email:
 *           type: string
 *           format: email
 *           description: The doctor's email address
 *         specialization:
 *           type: string
 *           description: Medical specialization
 *         experience:
 *           type: number
 *           description: Years of experience
 *         rating:
 *           type: number
 *           description: Average rating
 *         bio:
 *           type: string
 *           description: Professional biography
 *         image:
 *           type: string
 *           description: URL to the doctor's profile picture
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Account approval status
 *         profileCompleted:
 *           type: boolean
 *           description: Whether the doctor has completed their profile
 */

// Admin routes
/**
 * @swagger
 * /api/doctor/all:
 *   get:
 *     summary: Get all doctors (Admin only)
 *     description: Retrieves a list of all doctors in the system, including those with pending approval
 *     tags: [Doctors - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
doctorRouter.get("/all", authAdmin, getAllDoctors);

/**
 * @swagger
 * /api/doctor/delete/{id}:
 *   delete:
 *     summary: Delete a doctor (Admin only)
 *     description: Deletes a doctor account from the system
 *     tags: [Doctors - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID to delete
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
doctorRouter.delete("/delete/:id", authAdmin, deleteDoctor);

// Public routes
/**
 * @swagger
 * /api/doctor/public:
 *   get:
 *     summary: Get all approved doctors
 *     description: Retrieves a list of all approved doctors
 *     tags: [Doctors - Public]
 *     responses:
 *       200:
 *         description: List of approved doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       500:
 *         description: Server error
 */
doctorRouter.get("/public", getAllPublicDoctors);

/**
 * @swagger
 * /api/doctor/public/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     description: Retrieves a specific doctor's public profile
 *     tags: [Doctors - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID to retrieve
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
doctorRouter.get("/public/:id", getPublicDoctorById);

// Password setup route
/**
 * @swagger
 * /api/doctor/create-password:
 *   post:
 *     summary: Set doctor password
 *     description: Allow a doctor to set their password after admin approval
 *     tags: [Doctors - Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password set successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Doctor not found or invalid token
 *       500:
 *         description: Server error
 */
doctorRouter.post('/create-password', setDoctorPassword);

// Protected routes (require authentication)
/**
 * @swagger
 * /api/doctor/profile/me:
 *   get:
 *     summary: Get doctor profile
 *     description: Retrieves the authenticated doctor's profile
 *     tags: [Doctors - Private]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
doctorRouter.get("/profile/me", authMiddleware, getMyProfile); 

/**
 * @swagger
 * /api/doctor/profile/me:
 *   put:
 *     summary: Update doctor profile
 *     description: Updates the authenticated doctor's profile information
 *     tags: [Doctors - Private]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: number
 *               bio:
 *                 type: string
 *               education:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Profile completion required
 *       500:
 *         description: Server error
 */
doctorRouter.put("/profile/me", authMiddleware, requireProfileCompletion, updateDoctorProfile);

/**
 * @swagger
 * /api/doctor/complete-profile:
 *   post:
 *     summary: Complete doctor profile
 *     description: Complete initial profile setup for a doctor
 *     tags: [Doctors - Private]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialization
 *               - experience
 *             properties:
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: number
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
doctorRouter.post("/complete-profile", authMiddleware, completeDoctorProfile);

/**
 * @swagger
 * /api/doctor/changepassword:
 *   post:
 *     summary: Change doctor password
 *     description: Allows a doctor to change their password
 *     tags: [Doctors - Private]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized or incorrect current password
 *       403:
 *         description: Profile completion required
 *       500:
 *         description: Server error
 */
doctorRouter.post("/changepassword", authMiddleware, requireProfileCompletion, changeDoctorPassword);

export default doctorRouter;
