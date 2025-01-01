// doctorRoutes.js
import express from 'express';
import { completeDoctorProfile, requestToJoin } from '../controller/doctorController.js';

const doctorRouter = express.Router();

// Route for doctors to submit joining request
doctorRouter.post('/requestToJoin', requestToJoin);
doctorRouter.put('/complete-profile', completeDoctorProfile);


export default doctorRouter;
