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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, Info, ExternalLink } from "lucide-react";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Assuming backend saves standard date format
    return new Date(dateString).toLocaleDateString('en-CA'); // Example: YYYY-MM-DD
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to get token (adjust if stored differently)
const getAuthToken = () => localStorage.getItem('token');

const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track loading state per action

  // Fetch pending requests on component mount
  useEffect(() => {
    fetchDoctorRequests();
  }, []);

  // --- Fetch Pending Doctor Requests ---
  const fetchDoctorRequests = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken(); // Get the admin token

    if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
    }

    try {
      // Call the backend endpoint defined in adminRoute.js
      const response = await fetch('/api/admin/getPendingRequests', { 
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Send auth token
        }
      }); 

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch pending requests.');
      }

      setRequests(data.data || []); // Expecting data structure { success: true, data: [...] }

    } catch (err) {
      console.error("Error fetching doctor requests:", err);
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Approve/Reject Action ---
  const handleReviewAction = async (requestId, action) => {
    setActionLoading(requestId); // Indicate loading for this specific row
    setError(null); // Clear previous errors
    const token = getAuthToken();

    if (!token) {
        setError("Authentication required. Please log in.");
        setActionLoading(null);
        return;
    }

    try {
      // Call the backend endpoint defined in adminRoute.js
      const response = await fetch('/api/admin/reviewDoctorRequest', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send auth token
        },
        // Send doctorId (which is requestId here) and action
        body: JSON.stringify({ doctorId: requestId, action: action }), 
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} request.`);
      }

      console.log(`Request ${requestId} ${action} successful.`);
      
      // --- Update UI ---
      // Remove the processed request from the list
      setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));

    } catch (err) {
      console.error(`Error ${action} request ${requestId}:`, err);
      // Display error to the user
      setError(`Failed to ${action} request: ${err.message}`); 
    } finally {
      setActionLoading(null); // Clear loading state for the row
    }
  };


  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Doctor Verification Requests</h2>

      {/* Display general errors */}
      {error && !actionLoading && ( // Don't show general error if an action error occurred
         <Alert variant="destructive" className="mb-4">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardHeader> <Skeleton className="h-6 w-1/2" /> </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading && requests.length === 0 && !error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Pending Requests</AlertTitle>
            <AlertDescription>There are currently no doctor verification requests awaiting review.</AlertDescription>
          </Alert>
      )}

      {/* Table Display */}
      {!loading && requests.length > 0 && (
        <Card>
          <CardHeader>
             <CardTitle>Pending Applications</CardTitle>
             {/* Optional: Add description or filter controls here */}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>License</TableHead> {/* Added License Link */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  // Dim row if its action is loading
                  <TableRow key={request._id} className={actionLoading === request._id ? 'opacity-50 pointer-events-none' : ''}> 
                    <TableCell className="font-medium">{`${request.Fname || ''} ${request.Lname || ''}`.trim()}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    {/* Assuming backend sends createdAt or similar */}
                    <TableCell>{formatDate(request.createdAt)}</TableCell> 
                     <TableCell>
                        {/* Link to view the uploaded license */}
                        <a href={request.license} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center text-sm">
                          View <ExternalLink className="ml-1 h-3 w-3"/>
                        </a>
                     </TableCell>
                    <TableCell>
                      {/* Badge should always be 'pending' here */}
                      <Badge variant={request.status === 'pending' ? 'warning' : 'secondary'}>
                          {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Approve Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleReviewAction(request._id, 'approve')}
                        disabled={actionLoading === request._id} // Disable only if this row is loading
                      >
                        {actionLoading === request._id ? 'Processing...' : <><CheckCircle className="mr-1 h-4 w-4" /> Approve</>}
                      </Button>
                      {/* Reject Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleReviewAction(request._id, 'reject')}
                        disabled={actionLoading === request._id} // Disable only if this row is loading
                      >
                         {actionLoading === request._id ? 'Processing...' : <><XCircle className="mr-1 h-4 w-4" /> Reject </>}
                      </Button>
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