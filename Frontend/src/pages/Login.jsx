import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Make sure Link is imported
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    
    const loginUrl = '/api/auth/login'; 
    console.log(`Attempting login via: ${loginUrl} for email: ${email}`); 

    try {
      const response = await fetch(loginUrl, { // Always fetch from the same URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Expect { success, token, user: { role, ... } }

      if (!response.ok) {
         // Backend should handle returning specific errors like pending/rejected
         if (response.status === 401 && data.message?.includes('pending')) {
             throw new Error("Your doctor application is still pending review.");
         }
         if (response.status === 401 && data.message?.includes('rejected')) {
             throw new Error("Your doctor application was not approved.");
         }
         // General error
         throw new Error(data.message || `Login failed. Status: ${response.status}`);
      }

      // --- Process successful response ---
      // Backend determines the role and sends it back
      if (data.token && data.user?.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user.role);
        console.log('Login successful:', { role: data.user.role, profileComplete: data.user.isProfileComplete });

        if (onLoginSuccess) {
           onLoginSuccess(); // Update App state
        }

        // --- Navigation Logic (remains the same) ---
        const userRole = data.user.role;
        const isProfileComplete = data.user.isProfileComplete;

        if (userRole === 'doctor' && !isProfileComplete) {
           navigate('/doctor/complete-profile', { replace: true });
        } else if (userRole === 'admin') {
           navigate('/admin-dashboard', { replace: true });
        } else if (userRole === 'doctor') { 
            navigate('/doctor/dashboard', { replace: true });
        } else if (userRole === 'patient') {
           navigate(from, { replace: true }); 
        } else {
           console.error("Unknown user role received:", userRole);
           navigate('/', { replace: true }); 
        }

      } else {
         console.error("Server response missing token or user role:", data);
         throw new Error("Login failed: Invalid response structure from server.");
      }

    } catch (err) {
      console.error("Login process failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- JSX for the Login Form (no changes needed here) ---
  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
       {/* Card, Form, Inputs, Button, Link etc. */}
       <Card className="w-full max-w-md">
           <CardHeader>
             <CardTitle>Login</CardTitle>
             <CardDescription>Access your MediNearBy account.</CardDescription>
           </CardHeader>
           <CardContent>
             {error && (
               <Alert variant="destructive" className="mb-4">
                 <AlertCircle className="h-4 w-4" /> <AlertTitle>Login Error</AlertTitle> <AlertDescription>{error}</AlertDescription>
               </Alert>
             )}
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
               </div>
               <Button type="submit" className="w-full" disabled={loading}> {loading ? 'Logging in...' : 'Login'} </Button>
             </form>
           </CardContent>
           <CardFooter className="text-sm text-center block">
              Don't have an account?{' '} <Link to="/register" className="underline">Register here</Link>
           </CardFooter>
         </Card>
     </div>
  );
};

export default Login;
