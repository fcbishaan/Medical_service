    // Example: Backend/middleware/authAdmin.js
    import jwt from 'jsonwebtoken';

    const authAdmin = async (req, res, next) => {
        console.log("--- authAdmin Middleware Triggered ---");
        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("Auth Error: No token or incorrect format");
           
            return res.status(401).json({ success: false, message: "Not Authorized: Token missing or invalid format" }); 
        }

        const token = authHeader.split(' ')[1];
        console.log("Extracted Token:", token);

        try {
          
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            console.log("Decoded Payload:", decoded);

            // --- CRITICAL CHECK: Verify the role ---
            if (decoded.role !== 'admin') { 
                console.log(`Auth Error: Role mismatch. Expected 'admin', got '${decoded.role}'`);
                return res.status(403).json({ success: false, message: "Forbidden: Insufficient privileges" }); 
            }
            
            // Optional: Attach user info to request if needed by subsequent controllers
            // req.user = decoded; // Or fetch user from DB based on decoded.userId if needed

            console.log("Admin Authorization Successful. Calling next().");
            next(); // User is authenticated and is an admin

        } catch (error) {
            console.error("Auth Error (Token Verification Failed):", error.message);
            // Handle specific errors like TokenExpiredError if needed
            if (error.name === 'TokenExpiredError') {
                 return res.status(401).json({ success: false, message: "Not Authorized: Token expired" });
            }
             return res.status(401).json({ success: false, message: "Not Authorized: Invalid token" }); // Send specific error
        }
    };

    export default authAdmin;