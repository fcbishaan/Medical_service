import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Stethoscope, MapPin, Info } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const statusStyles = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
};

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to view appointments');
      }
      
      const response = await fetch('http://localhost:4000/api/appointments/patient', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const submitReview = async (appointmentId) => {
    setReviewing(true);
    try {
      const response = await fetch(`http://localhost:4000/api/reviews/submit/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: parseInt(rating),
          comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully');
      setReviewModalOpen(false);
      setSelectedAppointment(null);
      setRating('5');
      setComment('');
      fetchAppointments(); // Refresh appointments list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have any appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map(appointment => {
            const appointmentDate = new Date(appointment.date);
            const isPastAppointment = appointmentDate < new Date();
            
            return (
              <Card key={appointment._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="md:flex">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">
                              {(() => {
                                const doctor = appointment.doctor;
                                if (!doctor) return 'Doctor Information';
                                
                                if (doctor.name && doctor.name !== 'undefined undefined') {
                                  return `Dr. ${doctor.name}`;
                                }
                                
                                if (doctor.email) {
                                  const nameFromEmail = doctor.email.split('@')[0];
                                  return `Dr. ${nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)}`;
                                }
                                
                                if (doctor.speciality?.length > 0) {
                                  return `Dr. ${doctor.speciality[0]} Specialist`;
                                }
                                
                                return 'Doctor';
                              })()}
                            </h3>
                            <p className="text-muted-foreground">
                              {appointment.doctor?.speciality || 'Specialty not specified'}
                            </p>
                          </div>
                        </div>
                        
                        {appointment.slot?.location && (
                          <div className="mt-3 flex items-center bg-blue-50 p-2 rounded-md">
                            <MapPin className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Appointment Location</p>
                              <p className="text-sm text-muted-foreground">{appointment.slot.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[appointment.status]?.bg || 'bg-gray-100'} ${statusStyles[appointment.status]?.text || 'text-gray-800'}`}>
                        {statusStyles[appointment.status]?.label || appointment.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{appointment.time || 'Time not specified'}</span>
                        </div>
                        {appointment.type && (
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{appointment.type}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {appointment.doctor?.clinicAddress && appointment.doctor.clinicAddress !== appointment.slot?.location && (
                          <div className="flex items-start space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div>
                              <p className="text-xs text-muted-foreground">Doctor's Clinic</p>
                              <p className="text-sm">{appointment.doctor.clinicAddress}</p>
                            </div>
                          </div>
                        )}
                        {appointment.doctor?.phone && (
                          <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${appointment.doctor.phone}`} className="text-sm hover:underline">
                              {appointment.doctor.phone}
                            </a>
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l p-4 md:w-48 flex-shrink-0 flex flex-col justify-center">
                    {appointment.status === 'completed' && !appointment.reviewId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setReviewModalOpen(true);
                        }}
                        className="w-full mb-2"
                      >
                        Rate & Review
                      </Button>
                    )}
                    {isPastAppointment && appointment.status !== 'cancelled' && (
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    )}
                    {appointment.status === 'pending' && (
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Select onValueChange={setRating} defaultValue="5">
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center space-x-2">
                        {[...Array(num)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => submitReview(selectedAppointment._id)} disabled={reviewing}>
              {reviewing ? <div className="animate-spin h-4 w-4 border-2 border-t-2 border-gray-500 rounded-full" /> : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointment;