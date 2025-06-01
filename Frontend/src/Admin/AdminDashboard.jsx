import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, 
  CalendarCheck, 
  Activity, 
  UserCheck, 
  AlertCircle, 
  MessageSquareWarning,
  Stethoscope,
  PieChart as PieChartIcon
} from "lucide-react";
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    approvedDoctors: 0,
    pendingReviews: 0,
    totalAppointments: 0
  });
  
  const [doctorCategories, setDoctorCategories] = useState([]);
  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchDoctorCategories();
    fetchAppointmentsByDay();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Show toast notification
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorCategories = async () => {
    setLoadingCharts(true);
    
    try {
      // Sample data to be replaced with API call later
      const sampleData = {
        success: true,
        data: [
          { name: "Cardiologist", value: 5 },
          { name: "Dermatologist", value: 3 },
          { name: "General Physician", value: 8 },
          { name: "Neurologist", value: 2 },
          { name: "Pediatrician", value: 4 },
          { name: "Orthopedic", value: 3 }
        ]
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (sampleData.success) {
        // Add colors to the data
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
        const dataWithColors = sampleData.data.map((item, index) => ({
          ...item,
          fill: colors[index % colors.length]
        }));
        setDoctorCategories(dataWithColors);
      } else {
        throw new Error('Failed to load sample data');
      }
    } catch (err) {
      console.error("Error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doctor categories",
      });
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchAppointmentsByDay = async () => {
    try {
      // Sample data for appointments by day
      const sampleAppointments = {
        success: true,
        data: [
          { day: 'Monday', appointments: 12 },
          { day: 'Tuesday', appointments: 19 },
          { day: 'Wednesday', appointments: 15 },
          { day: 'Thursday', appointments: 18 },
          { day: 'Friday', appointments: 22 },
          { day: 'Saturday', appointments: 8 },
          { day: 'Sunday', appointments: 3 }
        ]
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      if (sampleAppointments.success) {
        setAppointmentsByDay(sampleAppointments.data);
      } else {
        throw new Error('Failed to load appointment data');
      }
    } catch (err) {
      console.error("Error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointment data",
      });
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
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Doctor applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedDoctors}</div>
              <p className="text-xs text-muted-foreground">Active doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">Awaiting moderation</p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">All-time appointments</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">Statistics Overview</h3>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Doctor Categories Pie Chart */}
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Doctor Specialties</CardTitle>
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4">
              {loadingCharts ? (
                <div className="h-64 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : doctorCategories.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={doctorCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {doctorCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          value, 
                          `${name}: ${((props.payload.percent || 0) * 100).toFixed(1)}%`
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No doctor categories data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments by Day Bar Chart */}
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Appointments by Day</CardTitle>
              <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4">
              {loadingCharts ? (
                <div className="h-64 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : appointmentsByDay.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={appointmentsByDay}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} Appointments`, 'Count']}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="appointments" 
                        name="Appointments"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        {appointmentsByDay.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`rgba(136, 132, 216, ${0.6 + (entry.appointments / 30)})`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No appointment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;