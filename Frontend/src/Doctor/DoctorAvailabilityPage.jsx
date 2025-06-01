import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DoctorAvailabilityPage = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [timeInput, setTimeInput] = useState('');
  const [location, setLocation] = useState('');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState('');

  const getToken = () => localStorage.getItem('token');

  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch('/api/doctor/profile/me', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data?.data?._id) {
        setDoctorId(data.data._id);
      } else {
        throw new Error('Invalid profile data');
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      toast({ title: 'Error', description: 'Failed to load doctor profile', variant: 'destructive' });
    }
  };

  const fetchAvailability = useCallback(async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/doctor-availability/${doctorId}`);
      const flattened = res.data.data.flatMap(group => {
        const groupDate = new Date(group.date);
        return group.slots.map(slot => ({
          _id: slot.id,
          date: groupDate,
          time: slot.time,
          location: slot.location,
          sessionDuration: slot.sessionDuration,
          isBooked: slot.isBooked || false
        }));
      });

      setAvailability(flattened);
    } catch (error) {
      console.error('Availability fetch error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load availability',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [doctorId, toast]);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId, fetchAvailability]);

  const handleDateSelect = (dates) => {
    setSelectedDates(dates.map(date => new Date(date)));
  };

  const addTimeSlot = () => {
    if (timeInput && !availableTimes.includes(timeInput)) {
      setAvailableTimes([...availableTimes, timeInput]);
      setTimeInput('');
    }
  };

  const removeTimeSlot = (time) => {
    setAvailableTimes(availableTimes.filter(t => t !== time));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDates.length || !availableTimes.length || !location) {
      return toast({
        title: 'Error',
        description: 'Please select dates, times, and location',
        variant: 'destructive'
      });
    }

    setLoading(true);
    try {
      const postData = {
        availableDates: selectedDates.map(date => date.toISOString()),
        availableTimes,
        location: location.trim(),
        sessionDuration: Number(sessionDuration)
      };

      await axios.post('http://localhost:4000/api/doctor-availability', postData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setSelectedDates([]);
      setAvailableTimes([]);
      setLocation('');
      toast({ title: 'Success', description: 'Availability slots created' });
      fetchAvailability();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create slots',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/doctor-availability/${slotId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast({ title: 'Success', description: 'Slot deleted' });
      fetchAvailability();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete slot',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Add New Availability</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Select Dates</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={handleDateSelect}
                  className="mt-2 rounded-md border"
                />
                {selectedDates.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedDates.map(d => format(d, 'PPP')).join(', ')}
                  </p>
                )}
              </div>

              <div>
                <Label>Available Times</Label>
                <div className="mt-2 flex gap-2">
                  <Input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="w-32" />
                  <Button type="button" onClick={addTimeSlot}>Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTimes.map(time => (
                    <div key={time} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                      <span>{time}</span>
                      <button type="button" onClick={() => removeTimeSlot(time)} className="hover:text-destructive">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Clinic/Hospital" />
              </div>

              <div>
                <Label>Session Duration</Label>
                <Select value={String(sessionDuration)} onValueChange={(value) => setSessionDuration(Number(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60].map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>{minutes} mins</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading || !getToken()}>
                {loading ? 'Creating...' : 'Create Availability'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Current Availability</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading availability...</p>
            ) : availability.length === 0 ? (
              <p>No availability slots found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Date', 'Time', 'Location', 'Duration', 'Status', 'Actions'].map(header => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availability.map(slot => (
                    <TableRow key={slot._id}>
                      <TableCell>{format(new Date(slot.date), 'PPP')}</TableCell>
                      <TableCell>{slot.time}</TableCell>
                      <TableCell>{slot.location}</TableCell>
                      <TableCell>{slot.sessionDuration} mins</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          slot.isBooked ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => deleteSlot(slot._id)} disabled={slot.isBooked || loading}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;
