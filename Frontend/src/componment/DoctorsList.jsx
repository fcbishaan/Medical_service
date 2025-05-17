import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const DoctorsList = ({ speciality }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`/api/doctors?speciality=${speciality}`);
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [speciality]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No doctors found in this specialty.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <Card key={doctor._id} className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profileImage} alt={doctor.name} />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{doctor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{doctor.speciality}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm">{doctor.rating || "New"}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {doctor.experience} years of experience
              </p>
              <p className="text-sm text-muted-foreground">
                {doctor.about?.slice(0, 100)}...
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold">₹{doctor.fees}/consultation</span>
                <Button size="sm">Book Appointment</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DoctorsList; 