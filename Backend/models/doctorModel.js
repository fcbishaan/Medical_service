// models/doctorModel.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  Fname: { type: String, required: true },
  Lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  license: { type: String, required: true }, // will be auto-fetched from doctorRequest
  password: { type: String, required: false },
  passwordSet: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  speciality: {
    type: [String],
    enum: [
      "Cardiologist",
      "Dermatologist",
      "General Physician",
      "Neurologist",
      "Orthopedic",
      "Pediatrician",
      "ENT Specialist",
      "Psychiatrist",
      "Gynecologist",
      "Urologist",
      "`Physiotherapist"
    ],
    required: true
  },
  degree: { type: String, default: null },
  experience: { type: Number, default: null },
  about: { type: String, default: null },
  fees: { type: Number, default: null },
  address: { type: String, default: null },
  slots: { type: [String], default: [] },
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
