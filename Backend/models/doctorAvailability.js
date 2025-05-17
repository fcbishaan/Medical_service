import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  availableDates: [{ type: Date, required: true }], 
  availableTimes: [{ type: String, required: true }], 
  location: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const DoctorAvailability = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
export default DoctorAvailability;
