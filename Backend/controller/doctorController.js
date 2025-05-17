import doctorModel from "../models/doctorModel.js";
import DoctorRequest from "../models/DoctorRequest.js";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        return res.status(500).json({ success: false, message: "Error submitting request." });
    }
};

const completeDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // Assume auth middleware adds user ID to req.user
        const { speciality, degree, experience, about, fees, address, slots } = req.body;

        // Validate required fields for profile completion
        if (!speciality || !degree || !experience || !fees || !address || !slots) {
            return res.status(400).json({ success: false, message: "Missing required profile fields." });
        }

        // Update the doctor's document in the doctorModel collection
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            {
                speciality,
                degree,
                experience,
                about,
                fees,
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


const loginDoctor = async (req, res) => {
    const { email, password } = req.body;
    try {
        const doctor = await doctorModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        if (doctor.status !== "approved") {
            let message = "Account access restricted.";
            if (doctor.status === 'pending') message = "Your doctor application is still pending review.";
            if (doctor.status === 'rejected') message = "Your doctor application was not approved.";
            const error = new Error(message);
            error.statusCode = 403; 
            throw error; 
        }

        if (!doctor.password) {
            const error = new Error("Password not set for this account. Please contact support.");
            error.statusCode = 400;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: doctor._id, role: 'doctor'  }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const doctorResponse = {
            _id: doctor._id,
            role: 'doctor', // Explicitly set role
            // Combine Fname/Lname if needed, or adjust based on doctorModel
            name: `${doctor.Fname || ''} ${doctor.Lname || ''}`.trim() || doctor.email, 
            email: doctor.email,
            isProfileComplete: doctor.isProfileComplete // Crucial for frontend flow
            // Add other fields needed by frontend on login
        };
        return res.status(200).json({ success: true, message: "Login successful.", token, doctorResponse });
    } catch (error) {
        console.error("Error in loginDoctor:", error.message);
        return res.status(500).json({ success: false, message: "Error logging in." });
    }
};

export { requestToJoin, completeDoctorProfile, loginDoctor, changeDoctorPassword };

