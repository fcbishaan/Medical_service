import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoutes.js'
import doctorAvailabilityRoutes from './routes/doctorAvailabilityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { configDotenv } from 'dotenv';


//app config
configDotenv;
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()
//middlewares
app.use(express.json())
app.use(cors())

//api endpoint
app.use('/api/admin',adminRouter); //localhost:4000/api/admin
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use("/api/doctor-availability", doctorAvailabilityRoutes);
app.use('/api/auth', authRoutes );
app.get('/',(req,res)=>{
    res.send('API working ')
})

app.listen(port, ()=> console.log("Server Started", port))