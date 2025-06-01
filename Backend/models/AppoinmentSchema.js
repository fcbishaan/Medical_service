// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorAvailability",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending","booked", "completed", "cancelled"],
    default: "pending"
  },

  needsReview: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Appointment", appointmentSchema);