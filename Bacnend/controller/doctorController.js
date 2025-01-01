import doctorModel from "../models/doctorModel.js";
import nodemailer from 'nodemailer';

const requestToJoin = async (req, res) => {
    const { name, email, license } = req.body;
    if (!name || !email || !license) {
        return res.json({ success: false, message: "Missing Details" });
    }
    try {
        const newRequest = new doctorModel({
            name,
            email,
            license,
            status: "pending"
        });

       
        await newRequest.save({ validateBeforeSave: false });

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'colin.kilback@ethereal.email',
                pass: 'SMDPXdfJHTPH1m5eSF'
            }
        });
           // Email Details
           const mailOptions = {
            from: `"Medical Service Admin" <${process.env.EMAIL}>`,
            to: email,
            subject: "Profile Completion Request",
            html: `
                <h3>Dear ${name},</h3>
                <p>Your request to join our medical service system has been approved.</p>
                <p>Please complete your profile to start using our platform.</p>
                <p><a href="http://yourdomain.com/complete-profile/${newRequest._id}">Complete Your Profile</a></p>
                <p>Thank you for joining us!</p>
            `,
        };

        // Send Email
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Request submitted and email sent successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error submitting request or sending email." });
    }
};



const completeDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // Assume auth middleware adds user ID to req.user
        const { speciality, degree, experience, about, fees, address, slots } = req.body;

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
                isProfileComplete: true, // Mark profile as complete
                completionRequested: false, // Clear the request flag
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
        console.error(error);
        res.status(500).json({ success: false, message: "Error completing profile." });
    }
};
export { requestToJoin, completeDoctorProfile};