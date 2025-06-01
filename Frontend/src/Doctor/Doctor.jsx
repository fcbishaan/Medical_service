import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For linking to detailed profiles
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(' ');
  if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
  return (names[0][0]?.toUpperCase() || "") + (names[names.length - 1][0]?.toUpperCase() || "");
}

const Doctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState(""); // "asc" or "desc"

  useEffect(() => {
    fetchAllPublicDoctors();
  }, []);

  const fetchAllPublicDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the public endpoint
      const response = await fetch('/api/doctor/public'); 
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch doctors.');
      
       // Construct full name if needed
       const formattedDoctors = (data.data || []).map(doc => ({
           ...doc,
           fullName: doc.Fname ? `${doc.Fname || ''} ${doc.Lname || ''}`.trim() : doc.name 
       }));
      setDoctors(formattedDoctors);

    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {[...Array(8)].map((_, index) => ( // Show skeleton cards
             <Card key={index}>
               <CardHeader className="flex flex-row items-center space-x-4 pb-2"> <Skeleton className="h-12 w-12 rounded-full" /> <div className="space-y-2"> <Skeleton className="h-4 w-[150px]" /> <Skeleton className="h-4 w-[100px]" /> </div> </CardHeader>
               <CardContent> <Skeleton className="h-4 w-full mb-2" /> <Skeleton className="h-4 w-3/4" /> </CardContent>
               <CardFooter> <Skeleton className="h-10 w-full" /> </CardFooter>
             </Card>
           ))}
         </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
       <div className="container mx-auto px-4 py-8">
         <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
         <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Doctors</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert>
         <Button onClick={fetchAllPublicDoctors} variant="outline" className="mt-4">Retry</Button>
      </div>
    );
  }
  // Apply filtering and sorting
const filteredAndSortedDoctors = doctors
.filter((doc) => {
  const matchesSpecialty =
    specialtyFilter === "" || specialtyFilter === "default" || doc.speciality === specialtyFilter;
  const matchesLocation =
    locationFilter === "" ||
    (doc.location && doc.location.toLowerCase().includes(locationFilter.toLowerCase()));
  return matchesSpecialty && matchesLocation;
})
.sort((a, b) => {
  if (sortBy === "asc") return (a.fees || 0) - (b.fees || 0);
  if (sortBy === "desc") return (b.fees || 0) - (a.fees || 0);
  return 0; // default
});


  // Main Content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Specialists</h1>

      {doctors.length === 0 && !loading && (
         <div className="text-center text-gray-500 mt-10">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No doctors are currently available.</p>
            <p className="text-sm">Please check back later.</p>
         </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Specialty Filter */}
  <Select onValueChange={setSpecialtyFilter}>
    <SelectTrigger>
      <SelectValue placeholder="Filter by Specialty" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="default">All Specialties</SelectItem>
      {Array.from(new Set(doctors.map(doc => doc.speciality).filter(Boolean))).map((spec, index) => (
        <SelectItem key={index} value={spec}>{spec}</SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Location Filter */}
  <Input
    placeholder="Filter by Location"
    value={locationFilter}
    onChange={(e) => setLocationFilter(e.target.value)}
  />

  {/* Sort by Fee */}
  <Select onValueChange={setSortBy}>
    <SelectTrigger>
      <SelectValue placeholder="Sort by Fees" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="default">Default</SelectItem>
      <SelectItem value="asc">Low to High</SelectItem>
      <SelectItem value="desc">High to Low</SelectItem>
    </SelectContent>
  </Select>
</div>

      {doctors.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredAndSortedDoctors.map((doctor) => (
             <Card key={doctor._id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
               <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <Avatar className="h-12 w-12 border">
                   <AvatarImage src={doctor.profilePicture || ''} alt={doctor.fullName} />
                   <AvatarFallback>{getInitials(doctor.fullName)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                    {doctor.speciality && (
                       <CardDescription>
                         <Badge variant="secondary">{doctor.speciality}</Badge>
                       </CardDescription>
                     )}
                 </div>
               </CardHeader>
               <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground line-clamp-3">{doctor.about || "No biography available."}</p>
               </CardContent>
               <CardFooter>
                 <Link to={`/doctors/${doctor._id}`} className="w-full">
                   <Button className="w-full">View Profile & Book</Button>
                 </Link>
               </CardFooter>
             </Card>
           ))}
         </div>
      )}
    </div>
  );
};

export default Doctor;