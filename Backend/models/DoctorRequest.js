// models/DoctorRequest.js
import mongoose from "mongoose";

const doctorRequestSchema = new mongoose.Schema({
  Fname: { type: String, required: true },
  Lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  license: { type: String, required: true },
  status: { type: String, default: "pending", enum: ["pending", "approved", "rejected"] },
}, { timestamps: true });

const DoctorRequest = mongoose.model("DoctorRequest", doctorRequestSchema);
export default DoctorRequest;
