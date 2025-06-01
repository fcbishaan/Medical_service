import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Edit, X, User, Phone, Mail, Calendar, MapPin, GraduationCap, Stethoscope, DollarSign, Clock, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SpecialtySelect from '@/components/doctor/SpecialtySelect';

// Auth utilities
const getAuthToken = () => localStorage.getItem('token');
const getCurrentRole = () => localStorage.getItem('userType'); 

// Role configuration
const roleConfig = {
  doctor: {
    apiPath: '/api/doctor/profile/me',
    editableFields: ['Fname', 'Lname', 'speciality', 'degree', 'experience', 'about', 'fees'],
    displayFields: [
      { name: 'Fname', type: 'text', label: 'First Name', icon: User, editable: true },
      { name: 'Lname', type: 'text', label: 'Last Name', icon: User, editable: true },
      { name: 'email', type: 'email', editable: false, icon: Mail },
      { name: 'speciality', type: 'specialty', icon: Stethoscope, label: 'Specialty', editable: true },
      { name: 'degree', type: 'text', icon: GraduationCap, editable: true },
      { name: 'experience', type: 'number', label: 'Years of Experience', icon: Calendar, editable: true },
      { name: 'fees', type: 'number', label: 'Consultation Fee', icon: DollarSign, editable: true },
      { name: 'about', type: 'textarea', label: 'About Me', icon: User, editable: true }
    ]
  },
  patient: {
    apiPath: '/api/user/patient/profile/me',
    editableFields: ['name', 'phone', 'address', 'dob'],
    displayFields: [
      { name: 'name', type: 'text', icon: User },
      { name: 'phone', type: 'tel', icon: Phone },
      { name: 'email', type: 'email', editable: false, icon: Mail },
      { name: 'dob', type: 'date', label: 'Date of Birth', icon: Calendar },
      { name: 'gender', type: 'select', options: ['male', 'female', 'other'], editable: false, icon: User },
      { name: 'address', type: 'object', icon: MapPin }
    ]
  }
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [role, setRole] = useState(null);

// Helper function to get API endpoint based on role
  const getApiEndpoint = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': 
        return '/api/doctor/profile/me';
      case 'patient':
        return '/api/user/patient/profile/me';  
      default:
        throw new Error('Invalid user role');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      const userRole = getCurrentRole();
      
      if (!token || !userRole) {
        setError("Please login to access this page");
        setLoading(false);
        return;
      }

      setRole(userRole);
      await fetchProfile();
    };

    fetchData();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('Please login to view your profile');
        return;
      }

      const response = await fetch(`http://localhost:4000${roleConfig.doctor.apiPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setIsProfileComplete(data.data.isProfileComplete || false);
        setFormData(prev => ({
          ...prev,
          speciality: Array.isArray(data.data.speciality) ? data.data.speciality : [data.data.speciality]
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = getAuthToken();
      if (!token) {
        setError('Please login to update your profile');
        return;
      }

      // Get only the fields that have changed
      const changedFields = {};
      roleConfig.doctor.editableFields.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== profile[field]) {
          if (field === 'speciality') {
            changedFields[field] = Array.isArray(formData[field]) ? formData[field] : [formData[field]];
          } else {
            changedFields[field] = formData[field];
          }
        }
      });

      // If no fields have changed, show a message and return
      if (Object.keys(changedFields).length === 0) {
        setError('No changes made to the profile');
        return;
      }

      // Determine which endpoint to use based on profile completion status
      const endpoint = isProfileComplete ? 
        roleConfig.doctor.apiPath : 
        '/api/doctor/complete-profile';

      const method = isProfileComplete ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedFields)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        setError(null);
        if (!isProfileComplete) {
          setIsProfileComplete(true);
          // Optionally redirect to dashboard after first-time completion
          window.location.href = '/doctor/dashboard';
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const createPayload = () => {
    const editableFields = roleConfig.doctor.editableFields || [];
    const payload = {};

    // Only include fields that have been changed
    editableFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== profile[field]) {
        if (field === 'address' && typeof formData[field] === 'object') {
          // Handle address object specially
          payload[field] = {
            ...profile[field], // Keep existing address fields
            ...formData[field] // Override with changed fields
          };
        } else {
          payload[field] = formData[field];
        }
      }
    });

    return payload;
  };

  const renderField = ({ name, type, label, editable = true, options, icon: Icon }) => {
    const displayValue = () => {
      const value = formData[name] || profile?.[name];
      if (!value) return null;
      
      if (type === 'object' && name === 'address') {
        // Handle address object
        const address = value;
        return `${address.street || ''} ${address.city || ''}`.trim() || null;
      }
      
      if (type === 'date' && value) {
        return new Date(value).toLocaleDateString();
      }
      
      return value;
    };

    return (
      <div key={name} className="space-y-2">
        <Label htmlFor={name} className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {label || name.charAt(0).toUpperCase() + name.slice(1)}
        </Label>

        {isEditing && editable ? (
          type === 'textarea' ? (
            <Textarea
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              disabled={loading}
              className="bg-gray-50"
            />
          ) : type === 'specialty' ? (
            <SpecialtySelect
              value={formData[name] || ''}
              onValueChange={(value) => setFormData({ ...formData, [name]: value })}
            />
          ) : type === 'select' ? (
            <select
              id={name}
              name={name}
              value={formData[name] || ''}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              disabled={loading}
              className="w-full p-2 border rounded-md bg-gray-50"
            >
              {options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <Input
              id={name}
              name={name}
              type={type}
              value={formData[name] || ''}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              disabled={loading}
              className="bg-gray-50"
            />
          )
        ) : (
          <div className="mt-1 text-sm text-gray-900">
            {displayValue() || <span className="text-gray-500">Not specified</span>}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = '/login'} className="mt-4">
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {!isProfileComplete && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Completion Required</AlertTitle>
          <AlertDescription>
            To list in our system, please complete your profile by providing all required information.
          </AlertDescription>
        </Alert>
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.image} />
              <AvatarFallback>{profile?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {profile?.name || 'My Profile'}
              </h1>
              <p className="text-muted-foreground">
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roleConfig[role]?.displayFields.map(renderField)}
              </div>
            </CardContent>
            
            {isEditing && (
              <>
                <Separator />
                <CardFooter className="flex justify-end gap-2 p-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={updating}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;