// File: middleware/multer.js
import multer from "multer";

// Configure Multer for memory storage
const upload = multer({ storage:multer.memoryStorage(),
    limits:{
        fileSize: 10*1024*1024,
    },

}).single('license');

export default upload;
