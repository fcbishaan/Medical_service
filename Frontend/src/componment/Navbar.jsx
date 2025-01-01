import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          MediNearBy
        </Link>

        {/* Navigation Links */}
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

        {/* Action Buttons */}
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

        {/* Mobile Menu */}
        <button className="md:hidden text-white focus:outline-none">
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
