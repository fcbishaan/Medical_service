import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from 'react-toastify';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const message = location.state?.message;

  useEffect(() => {
    // Check for token in URL
    const token = new URLSearchParams(location.search).get('token');
    const email = new URLSearchParams(location.search).get('email');
    
    if (token && email) {
      // Redirect to create password page with token and email
      navigate(`/create-password?token=${token}&email=${email}`);
      return;
    }

    if (message) {
      toast.info(message);
    }
  }, [location.search, message, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.message?.includes('pending')) {
          throw new Error("Your doctor application is still pending review.");
        }
        if (response.status === 401 && data.message?.includes('rejected')) {
          throw new Error("Your doctor application was not approved.");
        }
        if (response.status === 400 && data.message?.includes('Password not set')) {
          throw new Error("Please set your password first using the link sent to your email.");
        }
        throw new Error(data.message || `Login failed. Status: ${response.status}`);
      }

      if (data.token && data.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.role);

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        const userRole = data.user.role;
        const isProfileComplete = data.user.isProfileComplete;

        // Special handling for doctors
        if (userRole === 'doctor') {
          if (!isProfileComplete) {
            navigate('/doctor/complete-profile', { replace: true });
          } else {
            navigate('/doctor/dashboard', { replace: true });
          }
        } else {
          // Keep original logic for other users
          if (userRole === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else if (userRole === 'patient') {
            navigate(from, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }

        toast.success('Login successful!');
      } else {
        throw new Error("Login failed: Invalid response structure from server.");
      }
    } catch (err) {
      console.error("Login process failed:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your MediNearBy account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center block">
          Don't have an account?{' '}
          <Link to="/register" className="underline">
            Register here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
