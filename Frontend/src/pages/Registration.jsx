import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // For navigation (if using React Router)

const RegistrationPage = () => {
  const [role, setRole] = useState('');
  const history = useHistory();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = () => {
    if (role === 'doctor') {
      history.push('/register-doctor'); // Redirect to doctor registration page
    } else if (role === 'patient') {
      history.push('/register-patient'); // Redirect to patient registration page
    } else {
      alert('Please select a role!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleRoleSelection('doctor')}
            className={`px-4 py-2 w-1/3 text-white rounded-md focus:outline-none ${
              role === 'doctor' ? 'bg-blue-600' : 'bg-gray-500'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => handleRoleSelection('patient')}
            className={`px-4 py-2 w-1/3 text-white rounded-md focus:outline-none ${
              role === 'patient' ? 'bg-blue-600' : 'bg-gray-500'
            }`}
          >
            Patient
          </button>
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 w-full text-white bg-green-500 rounded-md focus:outline-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
