import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import { json } from 'express'
import nodemailer from 'nodemailer';
import DoctorRequest from '../models/DoctorRequest.js'
import dotenv from 'dotenv';
import Review from '../models/Review.js'
dotenv.config();

const getPendingRequests = async(req, res) => {
    try {
        const pendingRequests = await DoctorRequest.find({status:"pending"});
        res.json({success:true, data: pendingRequests});
    } catch (error) {
        console.error(error);
        res.json({success: false,message: "Error fetching peding requests. "});
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find()
            .select('-password')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const reviewDoctorRequest = async (req, res) => {
    try {
        const { doctorId, action } = req.body;

        if (!doctorId || !action) {
            return res.status(400).json({ success: false, message: "Missing doctorId or action." });
        }
        const doctorRequest = await DoctorRequest.findById(doctorId);
        if (!doctorRequest) {
            return res.status(404).json({ success: false, message: "Doctor request not found." });
        }

        if (action === "approve") {
            const newDoctor = new doctorModel({
                Fname: doctorRequest.Fname,
                Lname: doctorRequest.Lname,
                email: doctorRequest.email,
                license: doctorRequest.license,
                password: "",
                status: "approved",
                isProfileComplete: false,
            });

            await newDoctor.save(); 
            await doctorRequest.deleteOne();

           const token = jwt.sign(
            { doctorId:newDoctor._id},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )

        const link = `${process.env.CLIENT_URL}/create-password?token=${token}&email=${newDoctor.email}`;
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL,
                to: newDoctor.email,
                subject: "Your Doctor Account Has Been Approved",
                html: `
            <p>Dear Dr. ${newDoctor.Fname} ${newDoctor.Lname},</p>
            <p>Your request to join our medical platform has been approved.</p>
            <p>Please set your password by clicking the link below:</p>
            <p><a href="${link}">Set Your Password</a></p>
            <p>This link will expire in 1 hour for security.</p>
            <p>Regards,<br/>Medical Service Team</p>
            `,
            });

            return res.status(200).json({ success: true, message: "Doctor approved and email sent.", data: newDoctor });
        }

        if (action === "reject") {
            // For rejection, update status in the request (or delete if preferred)
            doctorRequest.status = "rejected";
            await doctorRequest.save();

            // Optionally, send an email notifying the doctor of rejection
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
            
            transporter.verify((error, success) => {
                if (error) {
                    console.error("SMTP Error:", error);
                } else {
                    console.log("Server is ready to send emails!");
                }
            });
            
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: doctorRequest.email,
                subject: "Doctor Request Rejected",
                text: `Dear Dr. ${doctorRequest.Fname} ${doctorRequest.Lname},\n\nWe regret to inform you that your request to join our platform has been rejected.\n\nIf you have any questions, please contact support.\n\nBest regards,\nMedical Service Team`,
            });

            return res.status(200).json({ success: true, message: "Doctor request rejected and email sent.", data: doctorRequest });
        }

        return res.status(400).json({ success: false, message: "Invalid action." });
    } catch (error) {
        console.error("Error reviewing doctor request:", error.stack || error);
        return res.status(500).json({ success: false, message: `Error reviewing request: ${error.message}` });
    }
};

const getPendingReviews = async(req, res) => {
    try {
        const reviews = await Review.find({ status:'pending' })
        .populate('patient doctor appoinment')
        .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Update review status endpoint
const updateReviewStatus = async (req, res) => {
    try {
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate('patient', 'name')
       .populate('doctor', 'name');
  
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      res.json({ 
        success: true, 
        message: 'Review status updated',
        data: review
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };
// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Import models inside the function to avoid circular dependencies
        const userModel = (await import('../models/userModel.js')).default;
        const doctorModel = (await import('../models/doctorModel.js')).default;
        const DoctorRequest = (await import('../models/DoctorRequest.js')).default;
        const Review = (await import('../models/Review.js')).default;
        const Appoinment = (await import('../models/AppoinmentSchema.js')).default;

        // Get counts in parallel for better performance
        const [
            totalUsers,
            pendingRequests,
            approvedDoctors,
            pendingReviews,
            totalAppointments
        ] = await Promise.all([
            userModel.countDocuments(),
            DoctorRequest.countDocuments({ status: 'pending' }),
            doctorModel.countDocuments({ status: 'approved' }),
            Review.countDocuments({ status: 'pending' }),
            Appoinment.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                pendingRequests,
                approvedDoctors,
                pendingReviews,
                totalAppointments
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Get doctor categories statistics
const getDoctorCategoriesStats = async (req, res) => {
    try {
        const doctorModel = (await import('../models/doctorModel.js')).default;
        
        // Get all approved doctors
        const doctors = await doctorModel.find({ status: 'approved' });
        
        // Count doctors by speciality
        const categories = {};
        const validSpecialties = [
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
            "Physiotherapist"
        ];
        
        // Initialize all categories with 0 count
        validSpecialties.forEach(specialty => {
            categories[specialty] = 0;
        });
        
        // Count doctors in each category
        doctors.forEach(doctor => {
            if (doctor.speciality && Array.isArray(doctor.speciality)) {
                doctor.speciality.forEach(specialty => {
                    if (categories.hasOwnProperty(specialty)) {
                        categories[specialty]++;
                    }
                });
            }
        });
        
        // Convert to array format for the chart
        const data = Object.entries(categories).map(([name, value]) => ({
            name,
            value,
            fill: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color for each category
        }));
        
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching doctor categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor categories',
            error: error.message
        });
    }
};

// Delete a doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the doctor
    const doctor = await doctorModel.findByIdAndDelete(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Here you might want to add additional cleanup:
    // - Delete related appointments
    // - Notify the doctor via email
    // - Clean up any related data
    
    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
      data: { doctorId: id }
    });
    
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
};

export { 
    getPendingRequests, 
    getAllDoctors, 
    reviewDoctorRequest,
    getPendingReviews, 
    updateReviewStatus,
    getDashboardStats,
    getDoctorCategoriesStats,
    deleteDoctor
}