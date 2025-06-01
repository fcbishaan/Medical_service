import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CreatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL query parameters
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    // Log the URL parameters for debugging
    console.log('Token:', token);

    if (!token) {
      setError('Invalid or missing token');
      toast.error('Invalid or missing token');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [token, navigate]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!validatePassword(password)) {
        setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
        toast.error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      console.log('Sending request to:', `${apiUrl}/api/doctor/create-password`);
      console.log('With data:', { token, password });

      // First, set the password
      const response = await axios.post(
        `${apiUrl}/api/doctor/create-password`,
        { token, password }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'doctor');
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        // Redirect based on profile completion
        if (response.data.data.isProfileComplete) {
          navigate('/doctor/dashboard');
        } else {
          navigate('/doctor/complete-profile');
        }
        
        toast.success('Password created successfully! Welcome to your dashboard.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Error creating password');
      toast.error(error.response?.data?.message || 'Error creating password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Your Password</CardTitle>
          <CardDescription className="text-center">
            Please create a strong password to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePassword;
