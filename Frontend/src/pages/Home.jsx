import React, { useEffect, useRef, useState } from "react";
import doctorImage from "../Assets/doctor_image.jpg";
import SpecialityMenu from "../componment/SpecialityMenu";

import { FaCalendarCheck, FaUserMd, FaRegThumbsUp } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const Home = () => {
  const sectionsRef = useRef([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const handleSpecialitySelect = (speciality) => {
    setSelectedSpeciality(speciality);
    // Scroll to doctors section
    const doctorsSection = document.getElementById('doctors-section');
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container space-y-20">
      {/* 🌟 Hero Section */}
      <section
        className="relative h-[80vh] flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${doctorImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Trusted Doctor
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Get expert healthcare from top professionals in just a few clicks.
          </p>
          <Button size="lg" className="text-lg">
            Book an Appointment
          </Button>
        </div>
      </section>

      {/* 🌿 Speciality Section */}
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="opacity-0 translate-y-10 transition-all duration-1000 ease-in-out"
      >
        <SpecialityMenu onSpecialitySelect={handleSpecialitySelect} />
      </section>

      {/* Doctors Section */}
      {selectedSpeciality && (
        <section
          id="doctors-section"
          ref={(el) => (sectionsRef.current[1] = el)}
          className="opacity-0 translate-y-10 transition-all duration-1000 ease-in-out py-12"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              {selectedSpeciality} Specialists
            </h2>
            <DoctorsList speciality={selectedSpeciality} />
          </div>
        </section>
      )}

      {/* 🔥 How It Works Section */}
      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="opacity-0 translate-y-10 transition-all duration-1000 ease-in-out"
      >
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FaCalendarCheck className="text-blue-600 text-5xl mx-auto mb-4" />
                <CardTitle>Book an Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose your doctor and schedule your visit online.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FaUserMd className="text-blue-600 text-5xl mx-auto mb-4" />
                <CardTitle>Consult a Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get expert advice from certified medical professionals.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FaRegThumbsUp className="text-blue-600 text-5xl mx-auto mb-4" />
                <CardTitle>Get Well Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive prescriptions and expert guidance for recovery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 💬 Testimonials Section */}
      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="opacity-0 translate-y-10 transition-all duration-1000 ease-in-out"
      >
        <div className="bg-gray-100 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">What Our Patients Say</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <p className="text-lg italic">
                  "MediNearBy made it so easy to find and book a doctor!"
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-6">
                <p className="text-lg italic">
                  "Fast, reliable service with the best doctors in town."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 🚀 Call-to-Action (CTA) */}
      <section
        ref={(el) => (sectionsRef.current[4] = el)}
        className="opacity-0 translate-y-10 transition-all duration-1000 ease-in-out"
      >
        <div className="bg-blue-600 text-white py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-6">
            Join thousands of satisfied patients and book your appointment now.
          </p>
          <Button variant="secondary" size="lg" className="text-lg">
            Book an Appointment
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;

