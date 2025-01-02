import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAdmin }) => {
  if (isAdmin) {
    // Admin Navigation Bar
    return (
      <nav className="bg-gray-800 text-white w-64 h-full fixed">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <ul className="space-y-4">
            <li>
              <Link
                to="/admin-dashboard"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/review"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Review Section
              </Link>
            </li>
            <li>
              <Link
                to="/admin/doctor-requests"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Doctor Requests
              </Link>
            </li>
            <li>
              <Link
                to="/admin/doctor-list"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Doctor List
              </Link>
            </li>
            <li>
              <Link
                to="/myprofile"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="block hover:bg-gray-700 p-2 rounded transition"
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  // Default User Navigation Bar
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          MediNearBy
        </Link>
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link to="/" className="text-white hover:text-gray-200 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/doctors" className="text-white hover:text-gray-200 transition">
              All Doctors
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-white hover:text-gray-200 transition">
              About Us
            </Link>
          </li>
        </ul>
        <div className="hidden md:flex space-x-4">
          <Link
            to="/login"
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
