import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/doctorModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-service';

const sampleDoctors = [
  {
    Fname: 'John',
    Lname: 'Doe',
    email: 'doctor@example.com',
    license: 'DOC123456',
    password: 'doctor123',
    passwordSet: true,
    status: 'approved',
    speciality: ['General Physician'],
    degree: 'MD, General Medicine',
    experience: 8,
    about: 'Experienced General Physician with 8 years of practice in primary care and preventive medicine.',
    fees: 800,
    address: '123 Medical Center, Health Street, City',
    isProfileComplete: true
  },
  {
    Fname: 'Priya',
    Lname: 'Sharma',
    email: 'dermatologist@example.com',
    license: 'DOC123457',
    password: 'doctor123',
    passwordSet: true,
    status: 'approved',
    speciality: ['Dermatologist'],
    degree: 'MD, Dermatology',
    experience: 6,
    about: 'Specialized in treating skin conditions and providing cosmetic procedures.',
    fees: 1200,
    address: '456 Skin Care Center, Beauty Avenue, City',
    isProfileComplete: true
  },
  {
    Fname: 'Raj',
    Lname: 'Patel',
    email: 'cardiologist@example.com',
    license: 'DOC123458',
    password: 'doctor123',
    passwordSet: true,
    status: 'approved',
    speciality: ['Cardiologist'],
    degree: 'DM, Cardiology',
    experience: 12,
    about: 'Senior Cardiologist with expertise in interventional cardiology and heart failure management.',
    fees: 2000,
    address: '789 Heart Care, Medical Complex, City',
    isProfileComplete: true
  },
  {
    Fname: 'Ananya',
    Lname: 'Gupta',
    email: 'pediatrician@example.com',
    license: 'DOC123459',
    password: 'doctor123',
    passwordSet: true,
    status: 'approved',
    speciality: ['Pediatrician'],
    degree: 'MD, Pediatrics',
    experience: 7,
    about: 'Caring and experienced pediatrician specialized in child healthcare and development.',
    fees: 1000,
    address: '101 Child Care, Happy Street, City',
    isProfileComplete: true
  },
  {
    Fname: 'Amit',
    Lname: 'Kumar',
    email: 'ortho@example.com',
    license: 'DOC123460',
    password: 'doctor123',
    passwordSet: true,
    status: 'approved',
    speciality: ['Orthopedic'],
    degree: 'MS, Orthopedics',
    experience: 10,
    about: 'Orthopedic surgeon specialized in joint replacements and sports injuries.',
    fees: 1500,
    address: '202 Bone & Joint Center, Health Complex, City',
    isProfileComplete: true
  }
];

async function seedDoctor() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    let createdCount = 0;
    
    for (const doctorData of sampleDoctors) {
      // Check if doctor already exists
      const existingDoctor = await Doctor.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        console.log(`Doctor ${doctorData.email} already exists in the database`);
        continue;
      }

      try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        doctorData.password = await bcrypt.hash(doctorData.password, salt);

        // Create doctor
        const doctor = new Doctor(doctorData);
        await doctor.save();
        createdCount++;

        console.log('Doctor created successfully:');
        console.log({
          name: `${doctorData.Fname} ${doctorData.Lname}`,
          email: doctorData.email,
          password: 'doctor123', // This is the plain password before hashing
          speciality: doctorData.speciality[0],
          fees: `₹${doctorData.fees}`,
          _id: doctor._id
        });
      } catch (error) {
        console.error(`Error creating doctor ${doctorData.email}:`, error.message);
      }
    }
    
    if (createdCount === 0) {
      console.log('All doctors already exist in the database');
    } else {
      console.log(`\nSuccessfully created ${createdCount} doctor(s)`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding doctor:', error);
    process.exit(1);
  }
}

seedDoctor();
