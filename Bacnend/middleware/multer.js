// File: middleware/multer.js
import multer from "multer";

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
