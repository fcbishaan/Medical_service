import express from "express";
import {  createAvailability, deleteAvailability, getDoctorAvailability, updateAvailability } from "../controller/doctorAvailabilityController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const doctorAvailabilityRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DoctorAvailability:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The availability slot ID
 *         doctor:
 *           type: string
 *           description: Reference to the doctor
 *         date:
 *           type: string
 *           format: date
 *           description: Date of availability
 *         startTime:
 *           type: string
 *           format: time
 *           description: Start time of the slot
 *         endTime:
 *           type: string
 *           format: time
 *           description: End time of the slot
 *         isBooked:
 *           type: boolean
 *           description: Whether the slot has been booked
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the slot was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the slot was last updated
 */

/**
 * @swagger
 * /api/doctor-availability:
 *   post:
 *     summary: Create availability slot
 *     description: Creates a new availability time slot for a doctor
 *     tags: [Doctor Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2025-06-01'
 *                 description: Date of availability
 *               startTime:
 *                 type: string
 *                 example: '09:00'
 *                 description: Start time of availability
 *               endTime:
 *                 type: string
 *                 example: '10:00'
 *                 description: End time of availability
 *     responses:
 *       201:
 *         description: Availability slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorAvailability'
 *       400:
 *         description: Invalid input or time slot conflict
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Must be a doctor
 *       500:
 *         description: Server error
 */
doctorAvailabilityRoutes.post("/", authMiddleware, createAvailability);

/**
 * @swagger
 * /api/doctor-availability/{slotId}:
 *   patch:
 *     summary: Update availability slot
 *     description: Updates an existing availability time slot
 *     tags: [Doctor Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The availability slot ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2025-06-01'
 *               startTime:
 *                 type: string
 *                 example: '10:00'
 *               endTime:
 *                 type: string
 *                 example: '11:00'
 *               isBooked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability slot updated successfully
 *       400:
 *         description: Invalid input or slot already booked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your availability slot
 *       404:
 *         description: Availability slot not found
 *       500:
 *         description: Server error
 */
doctorAvailabilityRoutes.patch("/:slotId", authMiddleware, updateAvailability);

/**
 * @swagger
 * /api/doctor-availability/{doctorId}:
 *   get:
 *     summary: Get doctor availability
 *     description: Get all availability slots for a specific doctor
 *     tags: [Doctor Availability]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID to get availability for
 *     responses:
 *       200:
 *         description: List of availability slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DoctorAvailability'
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
doctorAvailabilityRoutes.get("/:doctorId", getDoctorAvailability);

/**
 * @swagger
 * /api/doctor-availability/{slotId}:
 *   delete:
 *     summary: Delete availability slot
 *     description: Deletes an existing availability time slot
 *     tags: [Doctor Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The availability slot ID to delete
 *     responses:
 *       200:
 *         description: Availability slot deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your availability slot or slot already booked
 *       404:
 *         description: Availability slot not found
 *       500:
 *         description: Server error
 */
doctorAvailabilityRoutes.delete('/:slotId', authMiddleware, deleteAvailability);

export default doctorAvailabilityRoutes;
