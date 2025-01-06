import React, { useState } from "react";
import axios from "axios";

const RegistrationPatient = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
    address: "",
    gender: "",
    dob: "",
    phone: "",
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
      const response = await axios.post("/api/patient/register", formData);
      setSuccessMessage("You have successfully registered as a patient!");
      setFormData({
        name: "",
        email: "",
        password: "",
        image: "",
        address: "",
        gender: "",
        dob: "",
        phone: "",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Patient Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Add input fields for each required field */}
        {Object.keys(formData).map((field) => (
          <div key={field}>
            <label className="block text-gray-700 font-medium">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleInputChange}
              required
              placeholder={`Enter your ${field}`}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Register
        </button>
      </form>
      {successMessage && <p className="text-green-600 text-center mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-600 text-center mt-4">{errorMessage}</p>}
    </div>
  );
};

export default RegistrationPatient;
