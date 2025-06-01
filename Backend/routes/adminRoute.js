import express from 'express'
import { 
    getPendingRequests, 
    reviewDoctorRequest, 
    getAllDoctors, 
    updateReviewStatus,
    getDashboardStats,
    getDoctorCategoriesStats,
    deleteDoctor
} from '../controller/adminController.js'
import authAdmin from '../middleware/authAdmin.js'

const adminRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DoctorRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The doctor request ID
 *         name:
 *           type: string
 *           description: Doctor's name
 *         email:
 *           type: string
 *           format: email
 *           description: Doctor's email
 *         specialization:
 *           type: string
 *           description: Medical specialization
 *         document:
 *           type: string
 *           description: URL to doctor's credential documents
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Current status of the request
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the request was created
 */

/**
 * @swagger
 * /api/admin/getPendingRequests:
 *   get:
 *     summary: Get pending doctor requests
 *     description: Retrieves all pending doctor registration requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending doctor requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DoctorRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
adminRouter.get('/getPendingRequests', authAdmin, getPendingRequests);

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Retrieves a list of all doctors for admin management
 *     tags: [Admin]
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
adminRouter.get('/doctors', authAdmin, getAllDoctors);

/**
 * @swagger
 * /api/admin/reviewDoctorRequest:
 *   post:
 *     summary: Review doctor request
 *     description: Approve or reject a doctor registration request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - status
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the doctor request
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Decision on the doctor request
 *               message:
 *                 type: string
 *                 description: Optional message for the doctor
 *     responses:
 *       200:
 *         description: Request reviewed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
adminRouter.post('/reviewDoctorRequest', authAdmin, reviewDoctorRequest);

/**
 * @swagger
 * /api/admin/reviews/pending:
 *   get:
 *     summary: Get pending reviews
 *     description: Retrieves all pending reviews for admin approval
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending reviews
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
adminRouter.get('/reviews/pending', authAdmin, getPendingRequests);

/**
 * @swagger
 * /api/admin/reviews/{id}/status:
 *   patch:
 *     summary: Update review status
 *     description: Approve or reject a pending review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: New status for the review
 *     responses:
 *       200:
 *         description: Review status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
adminRouter.patch('/reviews/:id/status', authAdmin, updateReviewStatus);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves key metrics for the admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalDoctors:
 *                   type: number
 *                 totalAppointments:
 *                   type: number
 *                 pendingRequests:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
adminRouter.get('/dashboard/stats', authAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/doctor-categories:
 *   get:
 *     summary: Get doctor categories statistics
 *     description: Retrieves statistics about doctor specializations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor categories statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   count:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
adminRouter.get('/dashboard/doctor-categories', authAdmin, getDoctorCategoriesStats);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor
 *     description: Permanently removes a doctor from the system
 *     tags: [Admin]
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
adminRouter.delete('/doctors/:id', authAdmin, deleteDoctor);

export default adminRouter;