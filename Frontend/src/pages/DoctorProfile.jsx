import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const DoctorProfile = () => {
    const { doctorId } = useParams();
    const [formData, setFormData] = useState({
        speciality: "",
        degree: "",
        experience: "",
        about: "",
        fees: "",
        address: "",
        slots: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`http://localhost:4000/api/doctor/complete-profile`, {
                doctorId,
                ...formData,
            });
            alert(response.data.message);
        } catch (error) {
            console.error("Error completing profile:", error);
            alert("Failed to complete profile.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Complete Your Profile</h1>
            <input
                type="text"
                name="speciality"
                placeholder="Speciality"
                value={formData.speciality}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="degree"
                placeholder="Degree"
                value={formData.degree}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="experience"
                placeholder="Experience"
                value={formData.experience}
                onChange={handleChange}
                required
            />
            <textarea
                name="about"
                placeholder="About You"
                value={formData.about}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="fees"
                placeholder="Consultation Fees"
                value={formData.fees}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="slots"
                placeholder="Available Slots"
                value={formData.slots}
                onChange={handleChange}
                required
            />
            <button type="submit">Complete Profile</button>
        </form>
    );
};

export default DoctorProfile;
