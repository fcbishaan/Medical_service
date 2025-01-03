import React from "react";

// List of services and their Flaticon URLs
const services = [
  { id: 1, name: "General Practitioner", icon: "https://img.icons8.com/ios/452/stethoscope.png" },
  { id: 2, name: "ophthalmologist", icon: "https://cdn-icons-png.flaticon.com/512/7023/7023258.png" },
  { id: 3, name: "Dentist", icon: "https://cdn-icons-png.flaticon.com/512/6401/6401317.png" },
  { id: 4, name: "trichologist", icon: "" },
  { id: 5, name: "Psychologist", icon: "https://img.icons8.com/ios/452/psychologist.png" },
  { id: 6, name: "dermatology", icon: "https://cdn-icons-png.flaticon.com/512/10605/10605737.png" },
  { id: 7, name: "Physiotherapist", icon: "https://img.icons8.com/ios/452/physiotherapist.png" },
  { id: 8, name: "General Check-Up", icon: "https://img.icons8.com/ios/452/health-check.png" },
];

const SpecialityMenu = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">
          Find Doctors and Services Nearby
        </h2>
        
        {/* Search Box */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Service, practice or practitioner"
            className="w-full md:w-1/2 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Suburb or postcode"
            className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all">
            Search
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg text-center transition-transform transform hover:scale-105"
            >
              <img
                src={service.icon}
                alt={service.name}
                className="w-12 h-12 mx-auto mb-4"
              />
              <h3 className="text-gray-700 text-lg font-semibold">
                {service.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialityMenu;
