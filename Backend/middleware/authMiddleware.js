    // Example: Backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    console.log("--- authMiddleware Triggered ---"); // Log entry
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); // Log header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Auth Middleware: No token or bad format");
        return res.status(401).json({ success: false, message: "Not Authorized: Token missing or invalid format" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth Middleware: Decoded Payload:", decoded); 
        
        // Ensure payload has expected ID field (adjust 'userId' if needed)
        if (!decoded.userId && !decoded.id) { 
             console.log("Auth Middleware: Token missing user identifier (userId or id)");
             return res.status(401).json({ success: false, message: "Not Authorized: Invalid token payload" });
        }

        // Attach user info to the request object
        req.user = { 
            _id: decoded.userId || decoded.id, // Use _id to match MongoDB convention
            id: decoded.userId || decoded.id,  // Maintain backward compatibility
            role: decoded.role 
        }; 
        
        // Log the user object being attached
        console.log("Auth Middleware: User object being attached:", req.user);
        console.log("Auth Middleware: User _id:", req.user._id);
        console.log("Auth Middleware: User id:", req.user.id); 

        console.log("Auth Middleware: Attached req.user:", req.user); // Log attached user

        console.log("Auth Middleware: Authorization Successful. Calling next().");
        next(); // Proceed to the next middleware or controller

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ success: false, message: "Not Authorized: Token expired" });
        }
         return res.status(401).json({ success: false, message: "Not Authorized: Invalid token" });
    }
};

export default authMiddleware;