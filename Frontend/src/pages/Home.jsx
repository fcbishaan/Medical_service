import React from 'react';
import SpecialityMenu from '../componment/SpecialityMenu';


const Home = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-500 text-white text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Nearest Doctor</h1>
        <p className="text-lg md:text-xl mb-6">
          MediNearBy connects you to the best doctors in your area.
        </p>
        <button className="bg-white text-blue-500 px-6 py-3 rounded hover:bg-gray-100 transition">
          Book an Appointment
        </button>
      </section>
      <SpecialityMenu/>
      {/* Services Section */}
      <section className="py-16 container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-4 shadow rounded bg-white">
            <h3 className="text-xl font-bold mb-2">General Check-Ups</h3>
            <p>Book appointments for your regular health check-ups.</p>
          </div>
          <div className="p-4 shadow rounded bg-white">
            <h3 className="text-xl font-bold mb-2">Specialist Consultations</h3>
            <p>Find specialists in various medical fields near you.</p>
          </div>
          <div className="p-4 shadow rounded bg-white">
            <h3 className="text-xl font-bold mb-2">Health Packages</h3>
            <p>Avail health packages for your family's wellness.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Patients Say</h2>
          <p className="text-lg italic">"MediNearBy made it so easy to find and book a doctor!"</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
