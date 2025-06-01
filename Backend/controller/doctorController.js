import doctorModel from "../models/doctorModel.js";
import DoctorRequest from "../models/DoctorRequest.js";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const requestToJoin = async (req, res) => {
    const { Fname,Lname, email } = req.body;
    const file = req.file; 

    if (!Fname || !Lname|| !email || !file) {
        return res.status(400).json({ success: false, message: "Missing required details." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email." });
    }

    try {
        // Upload file to Cloudinary
        const cloudinaryResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "licenses" },
                (error, result) => {
                    if (error) reject(new Error("Cloudinary upload failed."));
                    else resolve(result);
                }
            );
            uploadStream.end(file.buffer);
        });

        const licenseUrl = cloudinaryResponse.secure_url;

        // Save doctor request in the database
        const newRequest = new DoctorRequest({
            Fname,
            Lname,
            email,
            license: licenseUrl,
            status: "pending",
            isProfileComplete: false,
            completionRequested: false,
        });

        await newRequest.save();

        return res.status(200).json({ success: true, message: "Request submitted successfully." });
    } catch (error) {
        console.error("Request error:", error);
        return res.status(500).json({ success: false, message: "Error submitting request." });
    }
    
};

const completeDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // Assume auth middleware adds user ID to req.user
        const { speciality, degree, experience, about, fees, address, slots } = req.body;
        const file = req.file;
        // Validate required fields for profile completion
        if (!speciality || !degree || !experience || !fees) {
            return res.status(400).json({ success: false, message: "Missing required profile fields." });
        }
        if (!Array.isArray(speciality) || speciality.length === 0) {
            return res.status(400).json({ success: false, message: "Speciality is required and must be an array." });
          }
        // Update the doctor's document in the doctorModel collection
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                speciality,
                degree,
                experience: Number(experience) || 0,
                about,
                fees: Number(fees) || 0,
                address,
                slots,
                isProfileComplete: true,
                completionRequested: false,
            },
            { new: true, select: "-password" } // Return updated document, excluding password
        );
        
        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Profile completed successfully.",
            data: updatedDoctor,
        });
    } catch (error) {
        console.error("Error completing profile:", error.message);
        return res.status(500).json({ success: false, message: "Error completing profile." });
    }
};

const changeDoctorPassword = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new passwords are required." });
        }
        
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }
        
        // Add your password strength validation here if needed
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        doctor.password = hashedNewPassword;
        await doctor.save();
        
        return res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error.message);
        return res.status(500).json({ success: false, message: "Error changing password." });
    }
};

const getMyProfile = async(req,res) => { 
    try {
        
        const doctorId = req.user.id;
        const doctorProfile = await doctorModel.findById(doctorId).select("-password");

        if(!doctorProfile){
            return res.status(404).json({success:false, message:"Doctor profile not found"});
        }
        return res.status(200).json({
            success:true,
            message:"Profile Fetched Successfully",
            data: doctorProfile,
        });
    } catch (error) {
        console.error("error fetching doctor profile: ", error.message);
        return res.status(500).json({success: false, message: "Error fetching profile." });
    }
};

const getAllPublicDoctors = async (req, res) => {
    try {
      const doctors = await doctorModel.find({
        status: 'approved',
        isProfileComplete: true
      }).select("-password -status  -completionRequested");
  
      res.status(200).json({
        success: true,
        message: "Doctor List fetched successfully.",
        data: doctors
      });
    } catch (error) {
      console.error("Error fetching doctor list", error);
      res.status(500).json({ success: false, message: "Error fetching doctors." });
    }
  };
  


const getPublicDoctorById = async (req, res) => {
    try {
        const doctorId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(doctorId)){
            return res.status(400).json({success:false, message:"Invalid doctor ID format."});
        }
        const doctor = await doctorModel.findOne({
            _id: doctorId,
            status:"approved",
            isProfileComplete:true
        }).select("-password -status -completionRequested");
        if(!doctor){
            return res.status(404).json({success:false, message:"Doctor profile not found or not available"});
        }
        res.status(200).json({
            success:true,
            message:"Doctor Profile Fetched Successfully.",
            data: doctor
        });
    } catch (error) {
        console.error("Error fetching dcotor profile",error);
        res.status(500).json({success:false, message: "Error fetching doctor profile." });
    }
}

const updateDoctorProfile = async (req, res) => {
    try {
      console.log('Received update request:', req.body); // Log incoming request
      const doctorId = req.user.id;
      const updateData = req.body;

      // Validate speciality if provided
      if (updateData.speciality && (!Array.isArray(updateData.speciality) || updateData.speciality.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "Speciality must be an array and cannot be empty"
        });
      }

      // Update only the provided fields
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        doctorId,
        updateData,
        { new: true, runValidators: true, select: "-password" }
      );

      if (!updatedDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found"
        });
      }

      console.log('Updated doctor:', updatedDoctor); // Log successful update
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedDoctor
      });
    } catch (error) {
      console.error("Update error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message.includes('validation failed') 
          ? "Validation error: Check input values"
          : "Internal server error"
      });
    }
  };

const findDoctors = async (req, res) => {
    try {
        const {
            speciality,
            city,
            minFees,
            maxFees,
            sortBy,
            latitude,
            longitude,
            radius // in kilometers
        } = req.query;

        let query = { status: "approved" };
        let sort = {};

        // Speciality filter
        if (speciality) {
            query.speciality = speciality;
        }

        // City filter
        if (city) {
            query["address.city"] = new RegExp(city, 'i');
        }

        // Fees range filter
        if (minFees || maxFees) {
            query.fees = {};
            if (minFees) query.fees.$gte = Number(minFees);
            if (maxFees) query.fees.$lte = Number(maxFees);
        }

        // Location-based filter
        if (latitude && longitude && radius) {
            query["address.location"] = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: Number(radius) * 1000 // Convert km to meters
                }
            };
        }

        // Sorting
        if (sortBy) {
            switch (sortBy) {
                case "fees_low":
                    sort.fees = 1;
                    break;
                case "fees_high":
                    sort.fees = -1;
                    break;
                case "experience":
                    sort.experience = -1;
                    break;
                default:
                    break;
            }
        }

        const doctors = await doctorModel
            .find(query)
            .sort(sort)
            .select("-password -slots");

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Find doctors error:', error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch doctors"
        });
    }
};

const setDoctorPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Token and password are required." 
            });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const doctor = await doctorModel.findById(decoded.doctorId);
            
            if (!doctor) {
                return res.status(404).json({ 
                    success: false,
                    message: "Doctor not found." 
                });
            }

            // Hash and save the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Update doctor with new password
            const updatedDoctor = await doctorModel.findByIdAndUpdate(
                doctor._id,
                {
                    password: hashedPassword,
                    passwordSet: true,
                    isProfileComplete: false,
                    completionRequested: false
                },
                { new: true, select: "-password" }
            );

            // Generate a new token for immediate login
            const newToken = jwt.sign(
                { 
                    id: doctor._id,
                    userType: 'doctor'
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                success: true,
                message: "Password set successfully. Please complete your profile.",
                data: updatedDoctor,
                token: newToken
            });
        } catch (jwtError) {
            console.error('JWT Error:', jwtError);
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired token." 
            });
        }
    } catch (error) {
        console.error("Error in setDoctorPassword:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error." 
        });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        
        // Delete doctor from doctor collection
        await doctorModel.findByIdAndDelete(doctorId);
        
        // Delete any pending requests from DoctorRequest collection
        await DoctorRequest.findOneAndDelete({ email: req.body.email });
        
        return res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        return res.status(200).json({ success: true, doctors });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { requestToJoin, completeDoctorProfile, changeDoctorPassword, getMyProfile, getAllPublicDoctors, getPublicDoctorById, updateDoctorProfile, findDoctors, setDoctorPassword, deleteDoctor, getAllDoctors };
