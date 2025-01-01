import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import { json } from 'express'

const getPendingRequests = async(req, res) => {
    try {
        const pendingRequests = await doctorModel.find({status:"pending"});
        res.json({success:true, data: pendingRequests});
    } catch (error) {
        console.error(error);
        res.json({success: false,message: "Error fetching peding requests. "});
    }
};
const reviewDoctorRequest = async (req, res) => {
    try {
        const { doctorId, action } = req.body;

        if (action === "approve") {
            // Approve and ask to complete the profile
            const updatedDoctor = await doctorModel.findByIdAndUpdate(
                doctorId,
                { status: "approved", completionRequested: true },
                { new: true }
            );

            if (!updatedDoctor) {
                return res.status(404).json({ success: false, message: "Doctor not found." });
            }

            // Notify the doctor (example: log a message, send an email, or push notification)
            console.log(`Doctor ${updatedDoctor.name} has been approved. Please complete your profile.`);

            return res.status(200).json({
                success: true,
                message: "Doctor approved. Request to complete profile sent.",
                data: updatedDoctor,
            });
        } else if (action === "reject") {
            const updatedDoctor = await doctorModel.findByIdAndUpdate(
                doctorId,
                { status: "rejected" },
                { new: true }
            );

            if (!updatedDoctor) {
                return res.status(404).json({ success: false, message: "Doctor not found." });
            }

            return res.status(200).json({
                success: true,
                message: "Doctor rejected.",
                data: updatedDoctor,
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid action." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error reviewing request." });
    }
};



//API for Adding Doctor
/*const addDoctor = async (req,res) => {
    try {

        const{name, email, password, speciality, degree, experience, about, fees, address}=req.body
        const imageFile = req.file
        //checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address)
            return res.json({success:false,message:"Missing Details"})
        
        //validating email format
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email "})
        }

        //validating strong password
        if(password.length < 8){
            return res.json({success:false, message:"Please enter a strong password"})
        }
        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
      
        //upload image to cloudinary 
        const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
        const imageUrl = imageUpload.secure_url
        
        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
        }
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true, message:"Doctor Added"})
   
    }  catch (error) {
          console.log(error)
          res.json({success:false, message:error.message})
    }
}
*/
//Api for admin login
const loginAdmin = async (req, res) => {
    try {
        const{email, password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
        {
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json ({success:true,token})
        }else{
            res.json({success:false, message:"Invalid Credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}



export {loginAdmin, getPendingRequests, reviewDoctorRequest}