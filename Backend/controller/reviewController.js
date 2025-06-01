import mongoose from 'mongoose';
import Review from "../models/Review.js";
import AppoinmentSchema from '../models/AppoinmentSchema.js';


export const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const appointment = await AppoinmentSchema.findOne({
        _id: req.params.id,
        patient: req.user.id,
        status: "completed"
    });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    const existingReview = await Review.findOne({appointment: appointment._id});
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this appointment"
      });
    }
    const review = await Review.create({
        appointment: appointment._id,
        patient: req.user.id,
        doctor: appointment.doctor,
        rating,
        comment
    });
    appointment.needsReview = false;
    await appointment.save();
    return res.status(200).json({
      success: true,
      message: "Review submitted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAppointmentReview = async (req, res) => {
    try {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
      return res.status(400).json({
        success:false,
        message: "Invalid appointment ID format" 
      });
    }
    const review = await Review.findOne({ 
      appointment: req.params.id 
    }).populate({path:'patient',
      select:'name email'
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "No review found for this appointment" 
      });
    }
    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      _id: review._id.toString(),
      doctor: {
        name: review.doctor.name,
        specialization: review.doctor.specialization
      },
      patient: {
        id: review.patient.toString(),
        name: review.patientName
      },
      rating: review.rating,
      comment: review.comment,
      status: review.status || 'pending',
      createdAt: review.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({doctor: req.params.id})
      .populate('patient', 'name')
      .sort({createdAt: -1});

    res.status(200).json({
        success:true,
        count: reviews.length,
        data: reviews
    });
} catch (error) {
    res.status(500).json({
        success:false,
        message: error.message
    });
} 
}

export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      patient: {
        name: review.patient?.name || 'Anonymous Patient'
      },
      doctor: review.doctor?.name || 'Unknown Doctor',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
