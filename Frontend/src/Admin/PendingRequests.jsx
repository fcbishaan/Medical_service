import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // Assuming the admin token is stored in localStorage
      const response = await axios.get('/api/admin/getPendingRequests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch pending requests.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  if (loading) {
    return <p>Loading pending requests...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Pending Doctor Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{request.name}</td>
                <td>{request.email}</td>
                <td>{request.speciality || 'N/A'}</td>
                <td>
                  <button onClick={() => handleAction(request._id, 'approve')}>Approve</button>
                  <button onClick={() => handleAction(request._id, 'reject')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  async function handleAction(doctorId, action) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        '/api/admin/reviewDoctorRequest',
        { doctorId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        fetchPendingRequests(); // Refresh the list after an action
      } else {
        alert(response.data.message || 'Failed to perform action.');
      }
    } catch (err) {
      alert(err.message || 'An error occurred while performing the action.');
    }
  }
};

export default PendingRequests;
