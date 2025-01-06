import React, { useState } from "react";
import axios from "axios";

const RegisterDoctor = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        license: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, license: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("license", formData.license);

        try {
            const response = await axios.post(
                "http://localhost:4000/api/doctors/requestToJoin",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            alert(response.data.message);
        } catch (error) {
            console.error(error.response.data.message);
            alert("An error occurred while submitting your request.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="block w-full p-2 border rounded"
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="block w-full p-2 border rounded"
                />
            </div>
            <div>
                <label>Upload License/Certificate:</label>
                <input
                    type="file"
                    name="license"
                    onChange={handleFileChange}
                    required
                    className="block w-full p-2 border rounded"
                />
            </div>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Submit Request
            </button>
        </form>
    );
};

export default RegisterDoctor;
