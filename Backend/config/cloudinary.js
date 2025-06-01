import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    try {
        console.log('Connecting to Cloudinary...');
        
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
            secure: true
        });

        // Test the connection
        const test = await cloudinary.api.root_folders();
        console.log('Cloudinary connected successfully:', test);

    } catch (error) {
        console.error('Error connecting to Cloudinary:', error);
        throw error;
    }
};

export default connectCloudinary;