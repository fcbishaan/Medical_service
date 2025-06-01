import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
    const { name, email, password, image, address, gender, dob, phone } = req.body;
    
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            image,
            address,
            gender,
            dob,
            phone
        });
        
        await newUser.save();

        // Generate a token
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a token
        const token = jwt.sign(
            { id: user._id, role: 'patient' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Format the response to match what frontend expects
        const userResponse = {
            _id: user._id,
            role: 'patient',
            name: user.name,
            email: user.email,
            isProfileComplete: !!user.phone // Consider profile complete if phone exists
        };

        res.status(200).json({ 
            message: "Login successful", 
            token,
            userResponse
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getPatientProfile = async (req, res) => {
    try {
      console.log("Request user object:", req.user); // Debug log
      
      // Use req.user.id instead of req.user.userId
      const patient = await userModel.findById(req.user.id).select('-password -__v');
      
      if (!patient) {
        console.log(`No patient found with ID: ${req.user.id}`);
        return res.status(404).json({
          success: false,
          message: "Patient profile not found"
        });
      }
  
      res.status(200).json({
        success: true,
        data: {
          ...patient._doc,
          role: 'patient'
        }
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };

// Update patient profile
const editPatientProfile = async (req, res) => {
  try {
    const { name, phone, address, dob } = req.body;
    const userId = req.user.id; // From auth middleware

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        address,
        dob: dob ? new Date(dob) : undefined
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

export {registerUser, userLogin, getPatientProfile, editPatientProfile}