// File: routes/doctorRoutes.js
import express from "express";
import { completeDoctorProfile, requestToJoin } from "../controller/doctorController.js";
import upload from "../middleware/multer.js"; // Ensure this path is correct

const doctorRouter = express.Router();

// Route for doctors to submit joining request
doctorRouter.post("/requestToJoin", upload.single("license"), requestToJoin);

// Route for doctors to complete their profile
doctorRouter.put("/complete-profile", completeDoctorProfile);

export default doctorRouter;
