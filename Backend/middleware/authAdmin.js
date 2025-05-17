   // Bacnend/middleware/authAdmin.js
   import jwt from 'jsonwebtoken';

   const authAdmin = async (req, res, next) => {
     try {
       const authHeader = req.headers.authorization;
       if (!authHeader) {
         return res.json({ success: false, message: "Not Authorized Login Again" });
       }

       const token = authHeader.split(' ')[1]; // Extract the token from "Bearer <token>"
       const token_decode = jwt.verify(token, process.env.JWT_SECRET);

       if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
         return res.json({ success: false, message: "Not Authorized Login Again" });
       }
       next();
     } catch (error) {
       console.log(error);
       res.json({ success: false, message: error.message });
     }
   };

   export default authAdmin;