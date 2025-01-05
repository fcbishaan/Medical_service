import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("/api/admin/getPendingRequests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch pending requests.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching pending requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (doctorId, action) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "/api/admin/reviewDoctorRequest",
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
        alert(response.data.message || "Failed to perform action.");
      }
    } catch (err) {
      alert(err.message || "An error occurred while performing the action.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-center text-lg font-semibold border-b border-gray-700">
          Admin Dashboard
        </div>
        <nav className="mt-4">
          <ul>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Pending Requests</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Doctor Management</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">System Activities</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Pending Doctor Requests</h1>
          {loading ? (
            <p>Loading pending requests...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No pending requests available.</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">License/Certificate</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="border-t border-gray-200">
                    <td className="py-3 px-6">{request.name}</td>
                    <td className="py-3 px-6">{request.email}</td>
                    <td className="py-3 px-6">{request.license || "N/A"}</td>
                    <td className="py-3 px-6 text-center space-x-2">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        onClick={() => handleAction(request._id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={() => handleAction(request._id, "reject")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
