import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', ()=> console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URI}/MEDICAL_SERVICE`, {
        serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
    });

}

export default connectDB