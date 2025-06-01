import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Stethoscope, AlertCircle, X, Mail, Phone, MapPin, Calendar, BriefcaseMedical, FileText, Award, Clock, DollarSign, Globe, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
// Create an axios instance with default headers
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add the token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedDoctors();
  }, []);

  const fetchApprovedDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/doctor/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Filter only approved doctors
      const approvedDoctors = response.data.doctors.filter(doctor => doctor.status === 'approved');
      setDoctors(approvedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch doctors',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      return;
    }

    setDeletingId(doctorId);
    try {
      await axios.delete(`http://localhost:4000/api/admin/doctors/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast({
        title: "Success",
        description: "Doctor profile has been deleted successfully",
      });
      
      // Refresh the doctors list
      fetchApprovedDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete doctor',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Approved Doctors</h3>
        <p className="text-muted-foreground">
          There are currently no approved doctors in the system.
        </p>
      </div>
    );
  }

  const openDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  const closeDoctorDetails = () => {
    setIsViewModalOpen(false);
    // Small delay to allow the modal to close before clearing the doctor data
    setTimeout(() => setSelectedDoctor(null), 300);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours, 10));
    time.setMinutes(parseInt(minutes, 10));
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Registered Doctors
          </h2>
          <span className="text-sm text-muted-foreground">
            {doctors.length} doctors found
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Doctor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </TableCell>
              </TableRow>
            ) : doctors.map((doctor) => (
              <TableRow 
                key={doctor._id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => openDoctorDetails(doctor)}
              >
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={doctor.profilePicture} />
                      <AvatarFallback>
                        {doctor?.Fname?.[0]}{doctor?.Lname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doctor.Fname} {doctor.Lname}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.speciality?.join(', ') || 'No specialty specified'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>{doctor.email}</p>
                    <p className="text-muted-foreground text-sm">
                      {doctor.phone || 'No phone number'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={doctor.status === 'approved' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {doctor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoctor(doctor._id);
                      }}
                      disabled={deletingId === doctor._id}
                    >
                      {deletingId === doctor._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Doctor Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>Doctor Profile</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeDoctorDetails}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <Avatar className="h-40 w-40 mb-4">
                      <AvatarImage src={selectedDoctor.profilePicture} alt={`${selectedDoctor.Fname} ${selectedDoctor.Lname}`} />
                      <AvatarFallback>
                        {selectedDoctor.Fname?.[0]}{selectedDoctor.Lname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">
                        {selectedDoctor.Fname} {selectedDoctor.Lname}
                      </h3>
                      <p className="text-muted-foreground">{selectedDoctor.speciality?.join(', ')}</p>
                      <Badge className="mt-2" variant={selectedDoctor.status === 'approved' ? 'default' : 'secondary'}>
                        {selectedDoctor.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p>{selectedDoctor.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p>{selectedDoctor.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
                        <p className="capitalize">{selectedDoctor.gender || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Date of Birth</h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p>{formatDate(selectedDoctor.dob) || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="break-words">
                            {selectedDoctor.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Registration Date</h4>
                        <p>{formatDate(selectedDoctor.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BriefcaseMedical className="h-5 w-5" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Qualifications</h4>
                        {selectedDoctor.qualifications?.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedDoctor.qualifications.map((qual, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span>{qual}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No qualifications provided</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Specializations</h4>
                        {selectedDoctor.speciality?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedDoctor.speciality.map((spec, index) => (
                              <Badge key={index} variant="outline">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No specializations provided</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Experience</h4>
                        <p>{selectedDoctor.experience || 'Not specified'} years</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Consultation Fee</h4>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <p>{selectedDoctor.consultationFee ? `$${selectedDoctor.consultationFee}` : 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Website</h4>
                        {selectedDoctor.website ? (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={selectedDoctor.website.startsWith('http') ? selectedDoctor.website : `http://${selectedDoctor.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {selectedDoctor.website}
                            </a>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">License Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <FileCheck className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">License Number</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedDoctor.licenseNumber || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          {selectedDoctor.licenseIssuedDate && (
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Issued Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(selectedDoctor.licenseIssuedDate)}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedDoctor.licenseExpiryDate && (
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Expiry Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(selectedDoctor.licenseExpiryDate)}
                                  {new Date(selectedDoctor.licenseExpiryDate) < new Date() && (
                                    <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedDoctor.licenseDocument && (
                            <div className="pt-2">
                              <a 
                                href={selectedDoctor.licenseDocument} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View License Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDoctor.about && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        About
                      </h3>
                      <p className="whitespace-pre-line">{selectedDoctor.about}</p>
                    </div>
                  </>
                )}

                {/* Availability */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Availability
                  </h3>
                  
                  {selectedDoctor.availability?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedDoctor.availability.map((day, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{day.day}</h4>
                          {day.slots?.length > 0 ? (
                            <div className="space-y-2">
                              {day.slots.map((slot, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                  <Badge variant={slot.isAvailable ? 'default' : 'secondary'} className="text-xs">
                                    {slot.isAvailable ? 'Available' : 'Booked'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not available</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No availability information provided</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorList;
