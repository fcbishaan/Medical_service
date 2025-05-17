import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For errors
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Wrap in Card
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"; // Icons

const formatDate = (dateString) => {
  // ... (keep your formatting function)
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track loading state per action (optional)

  useEffect(() => {
    fetchDoctorRequests();
  }, []);

  const fetchDoctorRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- Replace with actual API call ---
      // const response = await fetch('/api/admin/doctor-requests?status=pending');
      // if (!response.ok) throw new Error('Failed to fetch doctor requests');
      // const data = await response.json();
      // setRequests(data.requests || []);

      // --- Mock Data ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequests([
        { _id: 'req1', doctorName: 'Dr. Sarah Connor', specialization: 'Neurology', submittedDate: '2023-10-26T10:00:00Z', status: 'pending', email: 'sarah.c@example.com' }, // Added email
        { _id: 'req2', doctorName: 'Dr. Kyle Reese', specialization: 'Cardiology', submittedDate: '2023-10-25T15:30:00Z', status: 'pending', email: 'kyle.r@example.com' },
        { _id: 'req3', doctorName: 'Dr. John Carter', specialization: 'Orthopedics', submittedDate: '2023-10-27T09:15:00Z', status: 'pending', email: 'john.c@example.com' },
      ]);
      // --- End Mock Data ---

    } catch (err) {
      console.error("Error fetching doctor requests:", err);
      setError(err.message || "Failed to load requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    setActionLoading(requestId); // Indicate loading for this specific row
    try {
      console.log(`${action} request:`, requestId);
      // --- Replace with actual API call ---
      // const response = await fetch(`/api/admin/doctor-requests/${requestId}/${action}`, { method: 'PATCH' });
      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({})); // Try to get error details
      //   throw new Error(`Failed to ${action} request. ${errorData.message || ''}`);
      // }
      
      // --- Mock Delay ---
       await new Promise(resolve => setTimeout(resolve, 700));
      // --- End Mock Delay ---

      // Refetch data or update state locally
      // Option 1: Refetch
      // fetchDoctorRequests(); 
      // Option 2: Update local state (remove the processed request)
       setRequests(prev => prev.filter(req => req._id !== requestId));


    } catch (err) {
      console.error(`Error ${action} request ${requestId}:`, err);
      // Display a more specific error message to the user (e.g., using a Toast component)
      alert(`Error performing action: ${err.message}`); 
    } finally {
      setActionLoading(null); // Clear loading state for the row
    }
  };


  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Doctor Verification Requests</h2>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardHeader>
             <Skeleton className="h-6 w-1/2" /> {/* Skeleton for title */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Requests</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && requests.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Pending Requests</AlertTitle>
            <AlertDescription>There are currently no doctor verification requests awaiting review.</AlertDescription>
          </Alert>
      )}

      {/* Table Display */}
      {!loading && !error && requests.length > 0 && (
        <Card>
          <CardHeader>
             <CardTitle>Pending Applications</CardTitle>
             {/* Optional: Add description or filter controls here */}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Email</TableHead> {/* Added Email */}
                  <TableHead>Specialization</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id} className={actionLoading === request._id ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{request.doctorName}</TableCell>
                    <TableCell>{request.email}</TableCell> {/* Display Email */}
                    <TableCell>{request.specialization}</TableCell>
                    <TableCell>{formatDate(request.submittedDate)}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'pending' ? 'warning' : 'secondary'}>
                          {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleRequestAction(request._id, 'approve')}
                        disabled={actionLoading === request._id || request.status !== 'pending'}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        disabled={actionLoading === request._id || request.status !== 'pending'}
                      >
                         <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      {/* Optional: View Details Button */}
                      {/* <Button variant="ghost" size="sm" disabled={actionLoading === request._id}>Details</Button> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorRequests;