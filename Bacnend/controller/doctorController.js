import doctorModel from "../models/doctorModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transport for nodemailer
const requestToJoin = async (req, res) => {
    const { name, email, license } = req.body;

    if (!name || !email || !license) {
        return res.status(400).json({ success: false, message: "Missing required details." });
    }

    try {
        const newRequest = new doctorModel({
            name,
            email,
            license,
            status: "pending",
            isProfileComplete: false,
            completionRequested: false,
        });

        await newRequest.save({ validateBeforeSave: false });

        // Send email notification (use try-catch to prevent unhandled errors)
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Doctor Joining Request Received",
                text: `Dear ${name},\n\nYour request to join has been received. We will review it and get back to you soon.\n\nRegards,\nAdmin Team`,
            });
        } catch (emailError) {
            console.error("Email error:", emailError.message);
            return res.status(500).json({
                success: false,
                message: "Request saved but failed to send email notification.",
            });
        }

        // If everything succeeds
        return res.status(200).json({ success: true, message: "Request submitted successfully." });
    } catch (error) {
        console.error("Error saving doctor request:", error);
        return res.status(500).json({ success: false, message: "Error submitting request." });
    }
};


const completeDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // Assume auth middleware adds user ID to req.user
        const { speciality, degree, experience, about, fees, address, slots } = req.body;

        // Validate input
        if (!speciality || !degree || !experience || !fees || !address || !slots) {
            return res.status(400).json({ success: false, message: "Missing required profile fields." });
        }

        // Update doctor profile
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
