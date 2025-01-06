import React, { useState } from "react";
import RegisterDoctor from "../pages/RegisterDoctor";
import RegistrationPatient from "../pages/RegistrationPatient";

const RoleSelection = () => {
  const [role, setRole] = useState("");

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      {!role && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Register as:</h2>
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => handleRoleSelection("doctor")}
            >
              Doctor
            </button>
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={() => handleRoleSelection("patient")}
            >
              Patient
            </button>
          </div>
        </div>
      )}

      {role === "doctor" && <RegisterDoctor />}
      {role === "patient" && <RegistrationPatient/>}
    </div>
  );
};

export default RoleSelection;
