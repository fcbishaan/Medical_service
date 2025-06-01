import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getAppointmentReview, getDoctorReviews, submitReview, getAllReviews, deleteReview, getApprovedReviews } from '../controller/reviewController.js';
import Review from '../models/Review.js';

const reviewRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The review ID
 *         appointment:
 *           type: string
 *           description: Reference to the appointment
 *         doctor:
 *           type: string
 *           description: Reference to the doctor being reviewed
 *         patient:
 *           type: string
 *           description: Reference to the patient who wrote the review
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1-5 stars
 *         comment:
 *           type: string
 *           description: Review text
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the review was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the review was last updated
 */

/**
 * @swagger
 * /api/reviews/submit/{id}:
 *   post:
 *     summary: Submit a review
 *     description: Submit a review for a completed appointment
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1-5 stars
 *               comment:
 *                 type: string
 *                 description: Review text
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input or already reviewed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your appointment or appointment not completed
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
reviewRouter.post('/submit/:id', authMiddleware, submitReview);

/**
 * @swagger
 * /api/reviews/doctor/{id}:
 *   get:
 *     summary: Get doctor reviews
 *     description: Get all reviews for a specific doctor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID to get reviews for
 *     responses:
 *       200:
 *         description: List of doctor reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
reviewRouter.get('/doctor/:id', getDoctorReviews);

/**
 * @swagger
 * /api/reviews/appointment/{id}:
 *   get:
 *     summary: Get appointment review
 *     description: Get the review for a specific appointment
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID to get the review for
 *     responses:
 *       200:
 *         description: Appointment review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your appointment
 *       404:
 *         description: Appointment or review not found
 *       500:
 *         description: Server error
 */
reviewRouter.get('/appointment/:id', authMiddleware, getAppointmentReview);

/**
 * @swagger
 * /api/reviews/all:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     description: Retrieves all reviews in the system
 *     tags: [Reviews - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
reviewRouter.get('/all', authMiddleware, getAllReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (Admin only)
 *     description: Permanently removes a review from the system
 *     tags: [Reviews - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
reviewRouter.delete('/:id', authMiddleware, deleteReview);

// Get all approved reviews
reviewRouter.get('/approved', getApprovedReviews);

export default reviewRouter;
