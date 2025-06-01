// Import necessary models and libraries
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function for JWT generation
const generateAuthToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 
};

// --- Combined login function handling ALL roles ---
export const userOrDoctorLoginCombined = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    try {
        // === CHECK 1: ADMIN LOGIN ===
        if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
             console.log(`Combined Login: Attempting Admin login for ${email}`);
             if (password === process.env.ADMIN_PASSWORD) {
                 console.log("Combined Login: Admin credentials correct.");
                 const adminUser = { _id: 'admin_static_id', role: 'admin', name: 'Administrator' };
                 const token = generateAuthToken({ userId: adminUser._id, role: adminUser.role });
                 return res.status(200).json({ success: true, token, user: adminUser });
             } else {
                 console.log(`Combined Login: Admin password incorrect for ${email}`);
                 return res.status(401).json({ success: false, message: "Invalid credentials." });
             }
        }

        // === CHECK 2: PATIENT LOGIN ===
        console.log(`Combined Login: Attempting Patient login for ${email}`);
        const patient = await userModel.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (patient) {
            const isPatientPasswordCorrect = await bcrypt.compare(password, patient.password);
            if (isPatientPasswordCorrect) {
                console.log(`Combined Login: Patient login successful for ${email}`);
                const token = generateAuthToken({ userId: patient._id, role: 'patient' });
                const patientResponse = {
                    _id: patient._id, role: 'patient', name: patient.name, email: patient.email,
                    // Add other needed fields from userModel
                };
                return res.status(200).json({ success: true, token, user: patientResponse });
            }
             // If patient found but password wrong, fall through to check doctor ONLY IF email could be shared.
             // Assuming emails are unique across roles, we return error here.
             console.log(`Combined Login: Patient found, but password incorrect for ${email}`);
             return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // === CHECK 3: DOCTOR LOGIN ===
        console.log(`Combined Login: Patient not found. Attempting Doctor login for ${email}`);
        const doctor = await doctorModel.findOne({ email: email.toLowerCase() }).select('+password');
        
        if (!doctor) {
            console.log(`Combined Login: Neither Admin, Patient, nor Doctor found for ${email}`);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check doctor status FIRST
        if (doctor.status !== "approved") {
            let message = "Account access restricted.";
            if (doctor.status === 'pending') message = "Your doctor application is still pending review.";
            if (doctor.status === 'rejected') message = "Your doctor application was not approved.";
             console.log(`Combined Login: Doctor login failed for ${email}. Status: ${doctor.status}`);
            return res.status(403).json({ success: false, message: message });
        }

        // Check doctor password exists
        if (!doctor.password) {
             console.log(`Combined Login: Doctor login failed for ${email}. Password not set.`);
            return res.status(400).json({ success: false, message: "Password not set for this account. Please contact support." });
        }

        // Verify doctor password
        const isDoctorPasswordCorrect = await bcrypt.compare(password, doctor.password);
        if (!isDoctorPasswordCorrect) {
             console.log(`Combined Login: Doctor found, but password incorrect for ${email}`);
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // --- Doctor Login Successful ---
        console.log(`Combined Login: Doctor login successful for ${email}`);
        const token = generateAuthToken({ userId: doctor._id, role: 'doctor' });
        const doctorResponse = {
            _id: doctor._id, role: 'doctor', 
            name: `${doctor.Fname || ''} ${doctor.Lname || ''}`.trim() || doctor.email, 
            email: doctor.email, isProfileComplete: doctor.isProfileComplete,
        };
        return res.status(200).json({ success: true, token, user: doctorResponse });

    } catch (error) {
        console.error("Combined User/Doctor/Admin login error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login." });
    }
};
// Get profile for any authenticated user (admin, patient, doctor)
export const getProfile = async (req, res) => {
    const { userId, userType } = req.user; // From JWT
    
    try {
        let profile;
        
        switch(userType) {
            case 'admin':
                profile = {
                    _id: userId,
                    role: 'admin',
                    name: 'Administrator',
                    email: process.env.ADMIN_EMAIL
                };
                break;
                
            case 'patient':
                profile = await userModel.findById(userId).select('-password');
                if (!profile) throw new Error('Patient profile not found');
                profile = profile.toObject();
                profile.role = 'patient';
                break;
                
            case 'doctor':
                profile = await doctorModel.findById(userId).select('-password');
                if (!profile) throw new Error('Doctor profile not found');
                profile = profile.toObject();
                profile.role = 'doctor';
                profile.fullName = profile.Fname ? `${profile.Fname} ${profile.Lname}`.trim() : profile.name;
                break;
                
            default:
                throw new Error('Unknown user role');
        }
        
        res.status(200).json({ 
            success: true, 
            data: profile 
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch profile' 
        });
    }
};
