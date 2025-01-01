import express from 'express'
import {  loginAdmin } from '../controller/adminController.js'
import { getPendingRequests,reviewDoctorRequest } from '../controller/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'

const adminRouter = express.Router();
//adminRouter.post('/add-doctor',authAdmin, upload.single('image'),addDoctor)
adminRouter.post('/Login', loginAdmin);
adminRouter.get('/getPendingRequests',authAdmin, getPendingRequests);
adminRouter.post('/reviewDoctorRequest',authAdmin, reviewDoctorRequest);
export default adminRouter;