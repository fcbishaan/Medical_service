// models/doctorModel.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  Fname: { type: String, required: true },
  Lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  license: { type: String, required: true },
  password: { type: String, required: true }, // Hashed password set on approval
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  speciality: { type: String, default: null },
  degree: { type: String, default: null },
  experience: { type: String, default: null },
  about: { type: String, default: null },
  fees: { type: Number, default: null },
  address: { type: String, default: null },
  slots: { type: [String], default: [] },
  isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
