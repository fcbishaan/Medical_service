import express from 'express'

import { getPendingRequests,reviewDoctorRequest } from '../controller/adminController.js'
//import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'


const adminRouter = express.Router();
adminRouter.get('/getPendingRequests', authAdmin, getPendingRequests);
adminRouter.post('/reviewDoctorRequest', authAdmin, reviewDoctorRequest);


export default adminRouter;