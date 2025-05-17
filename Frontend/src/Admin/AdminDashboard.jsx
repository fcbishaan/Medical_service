import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, CalendarCheck, Activity, UserCheck, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setStats(null); // Reset stats on fetch
    try {
      // --- Replace with your actual API call ---
      // const response = await fetch('/api/admin/stats');
      // if (!response.ok) throw new Error('Failed to fetch stats');
      // const data = await response.json();
      // setStats(data);

      // --- Mock Data ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalUsers: 150,
        pendingRequests: 7,
        totalAppointments: 210,
        approvedDoctors: 38,
      });
      // --- End Mock Data ---

    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h2>

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" /> {/* Skeleton for title */}
                <Skeleton className="h-4 w-4" /> {/* Skeleton for icon */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" /> {/* Skeleton for number */}
                <Skeleton className="h-3 w-[100px]" /> {/* Skeleton for description */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content Display */}
      {!loading && !error && stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Stat Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              {/* <p className="text-xs text-muted-foreground">+20% from last month</p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Doctor Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedDoctors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for no data state if needed */}
      {/* {!loading && !error && !stats && (
        <Alert>
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>Could not load dashboard statistics.</AlertDescription>
        </Alert>
      )} */}

    </div>
  );
};

export default AdminDashboard;