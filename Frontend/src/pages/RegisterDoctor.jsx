import React, { useState } from "react";
import axios from "axios";

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    license: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post("/api/doctor/requestToJoin", formData);
      setSuccessMessage(
        "We have accepted your request. We will notify you soon."
      );
      setFormData({ name: "", email: "", license: "" });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Doctor Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">License</label>
          <input
            type="text"
            name="license"
            value={formData.license}
            onChange={handleInputChange}
            required
            placeholder="Enter your license number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
      {successMessage && <p className="text-green-600 text-center mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-600 text-center mt-4">{errorMessage}</p>}
    </div>
  );
};

export default RegisterDoctor;
