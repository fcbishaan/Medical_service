import express from 'express';
import { registerUser, userLogin } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', userLogin);

export default userRouter;