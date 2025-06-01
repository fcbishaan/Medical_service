import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const services = [
  // ... keep your existing services array ...
];

interface SpecialityMenuProps {
  onSpecialitySelect: (speciality: string) => void;
}

const SpecialityMenu: React.FC<SpecialityMenuProps> = ({ onSpecialitySelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSpecialitySelect(searchQuery.trim());
    }
  };

  return (
    <section className="py-10 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-foreground mb-8">
          Find Doctors and Services Nearby
        </h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
          <Input
            type="text"
            placeholder="Specialty or doctor name"
            className="w-full md:w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Location or postcode"
            className="w-full md:w-1/3"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
        </form>

        {/* Popular Services Grid */}
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