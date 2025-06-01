import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// List of specialties from SpecialityMenu
const specialties = [
  { id: 1, name: "General Practitioner", icon: "https://img.icons8.com/ios/452/stethoscope.png" },
  { id: 2, name: "Ophthalmologist", icon: "https://cdn-icons-png.flaticon.com/512/7023/7023258.png" },
  { id: 3, name: "Dentist", icon: "https://cdn-icons-png.flaticon.com/512/6401/6401317.png" },
  { id: 4, name: "Trichologist", icon: "https://cdn-icons-png.flaticon.com/512/14431/14431790.png" },
  { id: 5, name: "Psychologist", icon: "https://cdn-icons-png.flaticon.com/512/17977/17977338.png" },
  { id: 6, name: "Dermatology", icon: "https://cdn-icons-png.flaticon.com/512/10605/10605737.png" },
  { id: 7, name: "Physiotherapist", icon: "https://cdn-icons-png.flaticon.com/512/6172/6172724.png" },
  { id: 8, name: "General Check-Up", icon: "https://cdn-icons-png.flaticon.com/512/15536/15536390.png" },
];

const SpecialtySelect = ({ value, onValueChange }) => {
  return (
    <Select value={value || ''} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select your specialty" />
      </SelectTrigger>
      <SelectContent>
        {specialties.map((specialty) => (
          <SelectItem
            key={specialty.id}
            value={specialty.name}
            className="flex items-center gap-2"
          >
            <img
              src={specialty.icon}
              alt={specialty.name}
              className="w-5 h-5 object-contain"
            />
            <span>{specialty.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SpecialtySelect;
