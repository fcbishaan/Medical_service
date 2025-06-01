import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  sessionDuration: {
    type: Number,
    required: true,
    default: 30, // minutes
    min: 15,
    max: 120
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null
  }
}, { 
  timestamps: true,
  // Add index for better query performance
  indexes: [
    { 
      fields: { doctorId: 1, date: 1, time: 1 }, 
      unique: true 
    },
    { fields: { doctorId: 1, isBooked: 1 } }
  ]
});
appointments: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Appointment"
}]

const DoctorAvailability = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
export default DoctorAvailability;