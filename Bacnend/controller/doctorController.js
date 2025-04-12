import doctorModel from "../models/doctorModel.js";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import nodemailer from "nodemailer";


const requestToJoin = async (req, res) => {
    const { name, email } = req.body;
    const file = req.file; // Multer attaches this to the request

    // Validate inputs
    if (!name || !email || !file) {
        console.error("Request Body:", req.body);
        console.error("Uploaded File:", req.file);
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
                    if (error) {
                        console.error("Cloudinary upload failed:", error.message);
                        reject(new Error("Cloudinary upload failed."));
                    } else {
                        console.log("Cloudinary upload success:", result);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(file.buffer);
        });

        const licenseUrl = cloudinaryResponse.secure_url;

        // Save doctor details in the database
        const newRequest = new doctorModel({
            name,
            email,
            license: licenseUrl,
            status: "pending",
            isProfileComplete: false,
            completionRequested: false,
        });

        await newRequest.save();

        return res.status(200).json({ success: true, message: "Request submitted successfully." });
    } catch (error) {
        console.error("Error in requestToJoin:", error.message);
        return res.status(500).json({ success: false, message: "Error submitting request." });
    }
};

const completeDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // Assume auth middleware adds user ID to req.user
        const { speciality, degree, experience, about, fees, address, slots } = req.body;

        if (!speciality || !degree || !experience || !fees || !address || !slots) {
            return res.status(400).json({ success: false, message: "Missing required profile fields." });
        }

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
            { new: true }
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
        res.status(500).json({ success: false, message: "Error completing profile." });
    }
};

export { requestToJoin, completeDoctorProfile };
