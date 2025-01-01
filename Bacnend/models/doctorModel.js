import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  license: { type: String, required: true },
  status: { type: String, default: "pending" },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  available: { type: Boolean, default: true },
  fees: { type: Number, required: true },
  address: { type: Object, required: true },
  date: { type: Number, required: true },
  slots: { type: Object, default: {} },
  isProfileComplete: { type: Boolean, default: false },
  completionRequested: { type: Boolean, default: false }, // Tracks if admin has requested profile completion

}, { minimize: false });

const doctorModel =  mongoose.model('doctor', doctorSchema );

export default doctorModel;
