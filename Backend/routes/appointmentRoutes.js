import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { bookAppointment, cancelAppointment, getDoctorAppointments, getPatientAppointments, updateAppointmentStatus } from '../controller/appointmentController.js';

const appoinmentRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The appointment ID
 *         patient:
 *           type: string
 *           description: Reference to the patient user ID
 *         doctor:
 *           type: string
 *           description: Reference to the doctor user ID
 *         slot:
 *           type: string
 *           description: Reference to the availability slot ID
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *           description: Current status of the appointment
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the appointment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the appointment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the appointment was last updated
 */

/**
 * @swagger
 * /api/appointments/book/{slotId}:
 *   post:
 *     summary: Book a new appointment
 *     description: Books an appointment for a patient with a doctor in a specific time slot
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the availability slot to book
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid input or slot already booked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 *       500:
 *         description: Server error
 */
appoinmentRoutes.post('/book/:slotId', authMiddleware, bookAppointment);

/**
 * @swagger
 * /api/appointments/patient:
 *   get:
 *     summary: Get patient appointments
 *     description: Retrieves all appointments for the authenticated patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patient appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
appoinmentRoutes.get('/patient', authMiddleware, getPatientAppointments);

/**
 * @swagger
 * /api/appointments/doctor:
 *   get:
 *     summary: Get doctor appointments
 *     description: Retrieves all appointments for the authenticated doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctor appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
appoinmentRoutes.get('/doctor', authMiddleware, getDoctorAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     description: Updates the status of an appointment (e.g., scheduled, completed, cancelled)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID
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
 *                 enum: [scheduled, completed, cancelled]
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
appoinmentRoutes.put('/:id/status', authMiddleware, updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   delete:
 *     summary: Cancel an appointment
 *     description: Cancels an existing appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID to cancel
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
appoinmentRoutes.delete('/:id/cancel', authMiddleware, cancelAppointment);

export default appoinmentRoutes;