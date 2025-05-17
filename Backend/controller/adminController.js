import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import { json } from 'express'
import nodemailer from 'nodemailer';
import DoctorRequest from '../models/DoctorRequest.js'
import dotenv from 'dotenv';
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

const reviewDoctorRequest = async (req, res) => {
    try {
        const { doctorId, action } = req.body;

        if (!doctorId || !action) {
            return res.status(400).json({ success: false, message: "Missing doctorId or action." });
        }

        // Retrieve the join request from DoctorRequest collection
        const doctorRequest = await DoctorRequest.findById(doctorId);
        if (!doctorRequest) {
            return res.status(404).json({ success: false, message: "Doctor request not found." });
        }

        if (action === "approve") {
            // Generate random password (only on approval)
            const password = Math.random().toString(36).slice(-8).trim();
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new Doctor document with data from the request
            const newDoctor = new doctorModel({
                Fname: doctorRequest.Fname,
                Lname: doctorRequest.Lname,
                email: doctorRequest.email,
                license: doctorRequest.license,
                password: hashedPassword,
                status: "approved",
                isProfileComplete: false,
            });

            await newDoctor.save();

            // Remove the join request (or mark it as processed)
            await doctorRequest.deleteOne();

            // Configure Nodemailer to send email with credentials
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
                subject: "Doctor Account Approved",
                text: `Dear Dr. ${newDoctor.Fname} ${newDoctor.Lname},\n\nYour request to join our platform has been approved!\n\nYou can now log in using the following credentials:\nEmail: ${newDoctor.email}\nPassword: ${password}\n\nPlease log in and change your password after your first login.\n\nBest regards,\nMedical Service Team`,
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





export { getPendingRequests, reviewDoctorRequest}