import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      <div className="text-white text-lg font-bold">
        MediNearBy
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-gray-200">Home</Link>
        </li>
        <li>
          <Link to="/doctors" className="text-white hover:text-gray-200">All Doctors</Link>
        </li>
        <li>
          <Link to="/about" className="text-white hover:text-gray-200">About Us</Link>
        </li>
      </ul>
      <div className="flex space-x-2">
        <Link to="/login" className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100">Login</Link>
        <Link to="/register" className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;