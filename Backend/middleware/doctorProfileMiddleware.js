import doctorModel from "../models/doctorModel.js";

export const requireProfileCompletion = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const doctor = await doctorModel.findById(req.user.id).select("isProfileComplete");
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (!doctor.isProfileComplete) {
            // Redirect to profile completion page
            return res.status(302).json({
                success: false,
                message: "Please complete your profile first",
                redirect: "/profile"
            });
        }

        next();
    } catch (error) {
        console.error("Error checking profile completion:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
