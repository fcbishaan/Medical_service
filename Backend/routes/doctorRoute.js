// File: routes/doctorRoutes.js
import express from "express";
import { changeDoctorPassword, completeDoctorProfile, loginDoctor, requestToJoin } from "../controller/doctorController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const doctorRouter = express.Router();

// Route for doctors to submit joining request
doctorRouter.post("/requestToJoin", upload, requestToJoin);
doctorRouter.put("/complete-profile", completeDoctorProfile);
doctorRouter.post('/loginDoctor', loginDoctor);
doctorRouter.post("/complete-profile", authMiddleware, completeDoctorProfile);
doctorRouter.post("/changepassword", changeDoctorPassword);

export default doctorRouter;
