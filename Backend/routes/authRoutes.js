// Example: routes/authRoutes.js (or similar)
import express from 'express';
import { userOrDoctorLoginCombined } from '../controller/authController.js'; // Import the new function
import { registerUser } from '../controller/userController.js';
import { requestToJoin } from '../controller/doctorController.js'; // Doctor registration request

const authRoutes = express.Router();

authRoutes.post('/login', userOrDoctorLoginCombined);
authRoutes.post('/register/patient', registerUser); 
authRoutes.post('/register/doctor', requestToJoin); 


export default authRoutes;