import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500'
};

export default function DoctorAppointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.data.success) {
        // Fetch reviews only for completed appointments
        const appointmentsWithReviews = await Promise.all(
          response.data.data.map(async (appointment) => {
            try {
              if (appointment.status === 'completed') {
                const reviewResponse = await axios.get(`http://localhost:4000/api/reviews/appointment/${appointment._id}`, {
                  headers: { Authorization: `Bearer ${getToken()}` }
                });
                
                if (reviewResponse.data.success) {
                  return { ...appointment, review: reviewResponse.data.review };
                }
              }
              return appointment;
            } catch (error) {
              console.error('Error fetching review for appointment:', appointment._id);
              return appointment;
            }
          })
        );
        setAppointments(appointmentsWithReviews);
        console.log('Appointments with reviews:', appointmentsWithReviews);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to load appointments',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to load appointments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = async (appointmentId) => {
    setLoadingReviews(true);
    try {
      // Ensure we have a valid appointment ID
      if (!appointmentId || typeof appointmentId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
        throw new Error('Invalid appointment ID format');
      }

      const response = await axios.get(`http://localhost:4000/api/reviews/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.data.success) {
        setSelectedAppointment(response.data.review);
        setReviewModalOpen(true);
      } else {
        toast({
          title: 'No Review',
          description: response.data.message || 'No review found for this appointment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load review',
        variant: 'destructive'
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const closeReviewDialog = () => {
    setReviewModalOpen(false);
  };

  const updateStatus = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId ? { ...app, status: newStatus } : app
      ));
      
      toast({ title: 'Success', description: 'Status updated successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const submitReview = async (appointmentId) => {
    setReviewing(true);
    try {
      const response = await axios.post(`/api/reviews/${appointmentId}`, {
        rating: parseInt(rating),
        comment
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      toast({
        title: 'Success',
        description: 'Review submitted successfully'
      });
      setReviewModalOpen(false);
      setSelectedAppointment(null);
      setRating('5');
      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setReviewing(false);
    }
  };
  
  // Properly placed useEffect hook
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Patient</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[100px]">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Patient</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead className="w-[150px]">Status</TableHead>
            <TableHead className="w-[100px]">Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(appointment => (
            <TableRow key={appointment._id}>
              <TableCell>{appointment.patient?.name}</TableCell>
              <TableCell>{format(new Date(appointment.date), 'PPP')}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-32 justify-start ${statusColors[appointment.status]}`}
                      disabled={updatingId === appointment._id}
                    >
                      {updatingId === appointment._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(statusColors).map(([status, colorClass]) => (
                      <DropdownMenuItem
                        key={status}
                        className={colorClass}
                        onSelect={() => updateStatus(appointment._id, status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                {appointment.status === 'completed' && appointment.review && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      handleViewReview(appointment._id);
                    }}
                    disabled={updatingId === appointment._id}
                  >
                    View Review
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Patient Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loadingReviews ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : selectedAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < selectedAppointment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedAppointment.rating}/5
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Patient's Comment:</p>
                  <p className="text-sm">{selectedAppointment.comment}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Patient Details:</p>
                  <p className="text-sm">{selectedAppointment.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.patient.email}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Review submitted on {new Date(selectedAppointment.createdAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No review available</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};