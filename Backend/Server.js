import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import swaggerDocs from './config/swagger.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoutes.js'
import doctorAvailabilityRoutes from './routes/doctorAvailabilityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import postRouter from './routes/postRoutes.js'
import appoinmentRoutes from './routes/appointmentRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'


//app config
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
app.use('/api/posts', postRouter);
app.use('/api/appointments', appoinmentRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/',(req,res)=>{
    res.send('API working ')
})
// Initialize Swagger documentation
swaggerDocs(app);

app.listen(port, ()=> console.log("Server Started", port))