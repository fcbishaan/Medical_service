import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";

const authMiddleware = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided." });
        }

       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const doctor = await doctorModel.findById(decoded.id);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        
        req.user = { id: doctor._id };
        next();
    } catch (error) {
        console.error("Error in authMiddleware:", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }
        return res.status(500).json({ success: false, message: "Authentication failed." });
    }
};

export default authMiddleware;