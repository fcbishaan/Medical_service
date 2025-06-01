import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CalendarDays, MapPin, Stethoscope, User, Clock } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const DoctorProfileInfo = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 55.7558, lng: 37.6173 }); // Default to Moscow, Russia
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '8px',
    marginTop: '1rem'
  };
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  useEffect(() => {

    if (doctorId) {
      fetchDoctorData();
      console.log('hritik loda', doctorId);
    } else {
      setError("Doctor ID not found in URL.");
      setLoading(false);
    }
  }, [doctorId]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch doctor profile and availability in parallel
      const [doctorRes, availabilityRes] = await Promise.all([
        fetch(`/api/doctor/public/${doctorId}`),
        fetch(`/api/doctor-availability/${doctorId}`)
      ]);

      // Handle doctor profile response
      if (!doctorRes.ok) {
        throw new Error('Failed to fetch doctor profile.');
      }
      const doctorData = await doctorRes.json();
      
      // Handle availability response
      let availabilityData = [];
      if (availabilityRes.ok) {
        const availData = await availabilityRes.json();
        if (availData.success) {
          availabilityData = availData.data;
        }
      }

      // Process doctor data
      const fetchedDoctor = {
        ...doctorData.data,
        fullName: doctorData.data.Fname ? 
          `${doctorData.data.Fname || ''} ${doctorData.data.Lname || ''}`.trim() : 
          doctorData.data.name
      };

      // Get geolocation if address exists
      if (fetchedDoctor.address) {
        try {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${
              encodeURIComponent(fetchedDoctor.address)
            }&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const geoData = await geoRes.json();
          if (geoData.status === 'OK') {
            const { lat, lng } = geoData.results[0].geometry.location;
            fetchedDoctor.lat = lat;
            fetchedDoctor.lng = lng;
            console.log("raand chlti hai kya");
          }
        } catch (geoError) {
          console.error("Geocoding error:", geoError);
        }
      }

      setDoctor(fetchedDoctor);
      setAvailability(availabilityData);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingAvailability(false);
    }
  };

  const renderBookingModal = () => {
    let formattedDate = '';
    try {
      if (selectedSlot?.date) {
        const dateObj = new Date(selectedSlot.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = format(dateObj, 'MMMM d, yyyy');
        }
      }
    } catch (e) {
      console.error('Date formatting error:', e);
    }
  
    return (
      <Dialog open={bookingModalOpen} onOpenChange={() => {
        setBookingModalOpen(false);
        setSelectedSlot(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Booking with {doctor?.fullName} on {formattedDate} at {selectedSlot?.time}
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4">
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any specific concerns or details for the doctor..."
              />
            </div>
  
            <div className="space-y-2 mt-2">
              <p>Date: {formattedDate}</p>
              <p>Time: {selectedSlot?.time}</p>
              <p>
                <MapPin className="h-4 w-4 inline mr-1" />
                Location: {selectedSlot?.location}
              </p>
              <p>Duration: {selectedSlot?.sessionDuration || 30} minutes</p>
              <p>Fee: ₹{doctor?.fees}</p>
            </div>
  
            <Button 
              onClick={handleBooking}
              disabled={isBooking}
              className="w-full"
            >
              {isBooking ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleSlotClick = (slot) => {
    if(!slot.isBooked){
      setSelectedSlot(slot);
     setShowBookingButton(true);
    }
  }

  const handleBooking = async () => {
    if(!selectedSlot || !doctorId) return;
    try {
      setIsBooking(true);
      const response = await fetch(`/api/appointments/book/${selectedSlot.id}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body:JSON.stringify({
          notes: bookingNotes
        })
      });
      const data = await response.json();
      if(!response.ok){
        throw new Error (data.message || 'Boooking failed'); 
      }
      setAvailability(prev => prev.map(day=>({
        ...day,
        slots:day.slots.map(slot=>
          slot.id == selectedSlot.id ? {...slot, isBooked: true}: slot
        )
      })));
      toast.success('appoinment booked successfully');
      setSelectedSlot(null);
      setBookingNotes('');
      setBookingModalOpen(false);
    }
    catch (error){
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book appointment');
    }
    finally{
      setIsBooking(false);
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Card>
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full"/> 
            <Skeleton className="h-20 w-full"/> 
            <Skeleton className="h-5 w-full"/> 
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link to="/doctors">
          <Button variant="outline" className="mt-4">Back to Doctor List</Button>
        </Link>
      </div>
    );
  }

  // Doctor Not Found
  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested doctor profile could not be found.</AlertDescription>
        </Alert>
        <Link to="/doctors">
          <Button variant="outline" className="mt-4">Back to Doctor List</Button>
        </Link>
      </div>
    );
  }

  // Display Doctor Profile
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col items-center text-center bg-muted/40 p-6">
          <Avatar className="w-28 h-28 mb-4 border-4 border-background shadow-lg">
            <AvatarImage src={doctor.profilePicture || ''} alt={doctor.fullName} />
            <AvatarFallback className="text-4xl">{getInitials(doctor.fullName)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl mb-1">{doctor.fullName}</CardTitle>
          {doctor.speciality && (
            <Badge variant="outline" className="text-base py-1 px-3">
              {doctor.speciality}
            </Badge>
          )}
          {doctor.degree && (
            <CardDescription className="mt-2 text-sm">{doctor.degree}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* About Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="mr-2 h-5 w-5 text-primary"/> About
            </h3>
            <Separator />
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {doctor.about || "No details provided."}
            </p>
          </div>

          {/* Details Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Stethoscope className="mr-2 h-5 w-5 text-primary"/> Details
            </h3>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {doctor.experience !== undefined && (
                <p><span className="font-medium">Experience:</span> {doctor.experience} years</p>
              )}
              {doctor.fees !== undefined && (
                <p><span className="font-medium">Consultation Fee:</span> ₹{doctor.fees}</p>
              )}
            </div>
          </div>

          {/* Availability Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary"/> Availability
            </h3>
            <Separator />
            
            {loadingAvailability ? (
              <Skeleton className="h-20 w-full" />
            ) : availability.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No availability slots currently scheduled.
              </p>
            ) : (
              <div className="space-y-4">
                
                {availability.map((day) => (
                  <div key={day._id || day.date}>
                    <h4 className="font-medium">
                      {format(new Date(day.date), 'EEEE, MMMM d')}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {day.slots.map((slot) => (
                      <Button 
                        key={slot.id} 
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={`flex flex-col items-center py-2 h-auto ${
                          slot.isBooked ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                        disabled={slot.isBooked}
                        onClick={() => handleSlotClick(slot)}
                      >
                        <span>{slot.time}</span>
                        <span 
                          className="text-xs text-gray-500 cursor-pointer hover:text-blue-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot(slot);
                            setShowLocationMap(!showLocationMap);
                          }}
                        >
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {slot.location}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {slot.sessionDuration} mins
                        </span>
                        {slot.isBooked && (
                          <span className="text-xs text-red-500 mt-1">Booked</span>
                        )}
                      </Button>
                    ))}
                    </div>
                  </div>
                ))}

                {/* Map section */}
                {showLocationMap && selectedSlot && (
                  <div className="mt-4">
                    <div className="bg-muted p-2 rounded-lg mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      <span className="text-sm">{selectedSlot.location}</span>
                    </div>
                    
                    {loadError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Failed to load Google Maps. Please try again later.
                        </AlertDescription>
                      </Alert>
                    ) : isLoaded && (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={doctor?.lat && doctor?.lng ? { lat: doctor.lat, lng: doctor.lng } : mapCenter}
                        zoom={15}
                        options={{
                          zoomControl: true,
                          streetViewControl: true,
                          mapTypeControl: true,
                          fullscreenControl: true,
                        }}
                      >
                        {doctor?.lat && doctor?.lng && (
                          <MarkerF
                            position={{ lat: doctor.lat, lng: doctor.lng }}
                            title={selectedSlot.location}
                          />
                        )}
                      </GoogleMap>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showBookingButton && (
  <div className="pt-4 text-center">
    <Button 
      size="lg" 
      className="w-full sm:w-auto"
      onClick={() => {
        // Check auth first
        if (!localStorage.getItem('token')) {
          // setAuthModalOpen(true);
        } else {
          setBookingModalOpen(true);
        }
      }}
    >
      <CalendarDays className="mr-2 h-5 w-5" />
      Book Appointment
    </Button>
  </div>
)}
{renderBookingModal()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfileInfo;