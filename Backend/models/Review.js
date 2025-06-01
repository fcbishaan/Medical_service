import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // One review per appointment
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
