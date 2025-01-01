import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './componment/Navbar';
import Doctor from './pages/Doctor';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAppoinment from './pages/MyAppoinment';
import MyProfile from './pages/MyProfile';

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/doctors/:speciality" element={<Doctor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-appoinments" element={<MyAppoinment />} />
        <Route path="/myprofile" element={<MyProfile />} />
      </Routes>
    </div>
  );
};

export default App;
