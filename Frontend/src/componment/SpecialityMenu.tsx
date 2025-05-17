import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// List of services and their Flaticon URLs
const services = [
  { id: 1, name: "General Practitioner", icon: "https://img.icons8.com/ios/452/stethoscope.png" },
  { id: 2, name: "Ophthalmologist", icon: "https://cdn-icons-png.flaticon.com/512/7023/7023258.png" },
  { id: 3, name: "Dentist", icon: "https://cdn-icons-png.flaticon.com/512/6401/6401317.png" },
  { id: 4, name: "Trichologist", icon: "https://cdn-icons-png.flaticon.com/512/14431/14431790.png" },
  { id: 5, name: "Psychologist", icon: "https://cdn-icons-png.flaticon.com/512/17977/17977338.png" },
  { id: 6, name: "Dermatology", icon: "https://cdn-icons-png.flaticon.com/512/10605/10605737.png" },
  { id: 7, name: "Physiotherapist", icon: "https://cdn-icons-png.flaticon.com/512/6172/6172724.png" },
  { id: 8, name: "General Check-Up", icon: "https://cdn-icons-png.flaticon.com/512/15536/15536390.png" },
];

interface SpecialityMenuProps {
  onSpecialitySelect: (speciality: string) => void;
}

const SpecialityMenu: React.FC<SpecialityMenuProps> = ({ onSpecialitySelect }) => {
  return (
    <section className="py-10 bg-muted">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-center text-3xl font-bold text-foreground mb-8">
          Find Doctors and Services Nearby
        </h2>
        
        {/* Search Box */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <Input
            type="text"
            placeholder="Service, practice or practitioner"
            className="w-full md:w-1/2"
          />
          <Input
            type="text"
            placeholder="Suburb or postcode"
            className="w-full md:w-1/3"
          />
          <Button className="w-full md:w-auto">
            Search
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg text-center transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => onSpecialitySelect(service.name)}
            >
              <img
                src={service.icon}
                alt={service.name}
                className="w-12 h-12 mx-auto mb-4"
              />
              <h3 className="text-foreground text-lg font-semibold">
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