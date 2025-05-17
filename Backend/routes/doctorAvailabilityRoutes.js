// routes/doctorAvailabilityRoutes.js
import express from "express";
import { createAvailability, getDoctorAvailability } from "../controller/doctorAvailabilityController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Protect routes if needed

const doctorAvailabilityRoutes = express.Router();


doctorAvailabilityRoutes.post("/", authMiddleware, createAvailability);

doctorAvailabilityRoutes.get("/:doctorId", getDoctorAvailability);

export default doctorAvailabilityRoutes;
