// doctorRoutes.js
import express from 'express';
import { requestToJoin } from '../controller/doctorController.js';

const doctorRouter = express.Router();

// Route for doctors to submit joining request
doctorRouter.post('/requestToJoin', requestToJoin);

export default doctorRouter;
