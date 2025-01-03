import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './componment/Navbar';
import Doctor from './pages/Doctor';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAppoinment from './pages/MyAppoinment';
import MyProfile from './pages/MyProfile';
import AdminDashboard from './Admin/AdminDashboard';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Track admin login state
  

  // Check admin token on page load
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken); // Set to true if token exists, otherwise false
  }, []);

  const handleAdminLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAdmin(true); // Update state on successful admin login
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false); // Revert to default user state on logout
  };

  return (
    <div>
      {/* Pass isAdmin prop to Navbar */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/doctors/:speciality" element={<Doctor />} />
        <Route path="/login" element={<Login onAdminLogin={handleAdminLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-appoinments" element={<MyAppoinment />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route
          path="/admin-dashboard"
          element={
            isAdmin ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
