import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Added for address
import { AlertCircle, CheckCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('patient');

  // --- Patient State ---
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientConfirmPassword, setPatientConfirmPassword] = useState('');
  const [patientImage, setPatientImage] = useState(''); // URL for now
  const [patientAddress, setPatientAddress] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // --- Doctor State ---
  const [doctorFname, setDoctorFname] = useState('');
  const [doctorLname, setDoctorLname] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorLicenseFile, setDoctorLicenseFile] = useState(null); // For the file object

  // --- Common State ---
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Patient Submit Handler ---
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (patientPassword !== patientConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    // Align payload with userController.registerUser
    const payload = {
      name: patientName,
      email: patientEmail,
      password: patientPassword,
      image: patientImage, // Sending URL string
      address: patientAddress,
      gender: patientGender,
      dob: patientDob,
      phone: patientPhone,
    };

    try {
      const response = await fetch('/api/auth/register/patient', { // Your patient registration endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Patient registration failed.');

      setSuccessMessage("Registration successful! Please proceed to login.");
      // Clear form, navigate etc.
       setPatientName(''); setPatientEmail(''); setPatientPassword(''); setPatientConfirmPassword('');
       setPatientImage(''); setPatientAddress(''); setPatientGender(''); setPatientDob(''); setPatientPhone('');
       setTimeout(() => navigate('/login'), 2500);

    } catch (err) {
      console.error("Patient registration failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Doctor Submit Handler (Uses FormData for file upload) ---
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!doctorLicenseFile) {
        setError("Please upload your medical license file.");
        return;
    }
    setLoading(true);

    // Use FormData to send file and text data
    const formData = new FormData();
    formData.append('Fname', doctorFname);
    formData.append('Lname', doctorLname);
    formData.append('email', doctorEmail);
    formData.append('file', doctorLicenseFile); // Append the file object

    try {
        // Endpoint should match doctorController.requestToJoin route
        const response = await fetch('/api/auth/register/doctor', { 
            method: 'POST',
            // DO NOT set Content-Type header when using FormData; browser sets it correctly with boundary
            body: formData, 
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Doctor application failed.');

        setSuccessMessage("Application submitted! Please check your email for approval confirmation and login credentials once reviewed.");
        // Clear form
        setDoctorFname(''); setDoctorLname(''); setDoctorEmail(''); setDoctorLicenseFile(null);
        // Reset file input visually if possible (can be tricky)
        if (e.target.licenseFile) e.target.licenseFile.value = null; 


    } catch (err) {
        console.error("Doctor registration failed:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- Handle File Change for Doctor License ---
  const handleFileChange = (event) => {
      if (event.target.files && event.target.files[0]) {
          setDoctorLicenseFile(event.target.files[0]);
      } else {
          setDoctorLicenseFile(null);
      }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4">
      <Card className="w-full max-w-2xl"> {/* Wider card */}
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Join MediNearBy. Choose your role below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={setUserType} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Register as Patient</TabsTrigger>
              <TabsTrigger value="doctor">Apply as Doctor</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Display Error/Success Messages */}
          {error && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
          {successMessage && ( <Alert variant="success" className="mb-4 bg-green-50 border-green-300 text-green-800"> <CheckCircle className="h-4 w-4" /> <AlertTitle>Success</AlertTitle> <AlertDescription>{successMessage}</AlertDescription> </Alert>)}

          {/* ===== PATIENT REGISTRATION FORM ===== */}
          {userType === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Patient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"> <Label htmlFor="p-name">Full Name</Label> <Input id="p-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2"> <Label htmlFor="p-email">Email Address</Label> <Input id="p-email" type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2"> <Label htmlFor="p-password">Password</Label> <Input id="p-password" type="password" value={patientPassword} onChange={(e) => setPatientPassword(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2"> <Label htmlFor="p-confirmPassword">Confirm Password</Label> <Input id="p-confirmPassword" type="password" value={patientConfirmPassword} onChange={(e) => setPatientConfirmPassword(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2"> <Label htmlFor="p-phone">Phone Number</Label> <Input id="p-phone" type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2"> <Label htmlFor="p-dob">Date of Birth</Label> <Input id="p-dob" type="date" value={patientDob} onChange={(e) => setPatientDob(e.target.value)} disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2">
                   <Label htmlFor="p-gender">Gender</Label>
                   <Select value={patientGender} onValueChange={setPatientGender} disabled={loading || !!successMessage}>
                       <SelectTrigger id="p-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                       <SelectContent>
                           <SelectItem value="male">Male</SelectItem>
                           <SelectItem value="female">Female</SelectItem>
                           <SelectItem value="other">Other</SelectItem>
                           <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                       </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2"> <Label htmlFor="p-image">Profile Image URL (Optional)</Label> <Input id="p-image" placeholder="https://..." value={patientImage} onChange={(e) => setPatientImage(e.target.value)} disabled={loading || !!successMessage} /> </div>
                <div className="space-y-2 md:col-span-2"> <Label htmlFor="p-address">Address (Optional)</Label> <Textarea id="p-address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} disabled={loading || !!successMessage} /> </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !!successMessage}> {loading ? 'Registering...' : 'Register as Patient'} </Button>
            </form>
          )}

          {/* ===== DOCTOR REGISTRATION FORM ===== */}
          {userType === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
               <h3 className="text-lg font-medium mb-3">Doctor Application</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Fields matching doctorController.requestToJoin */}
                 <div className="space-y-2"> <Label htmlFor="d-fname">First Name</Label> <Input id="d-fname" value={doctorFname} onChange={(e) => setDoctorFname(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                 <div className="space-y-2"> <Label htmlFor="d-lname">Last Name</Label> <Input id="d-lname" value={doctorLname} onChange={(e) => setDoctorLname(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                 <div className="space-y-2 md:col-span-2"> <Label htmlFor="d-email">Email Address</Label> <Input id="d-email" type="email" value={doctorEmail} onChange={(e) => setDoctorEmail(e.target.value)} required disabled={loading || !!successMessage} /> </div>
                 <div className="space-y-2 md:col-span-2"> 
                     <Label htmlFor="d-licenseFile">Medical License (PDF/Image)</Label> 
                     <Input id="d-licenseFile" name="licenseFile" type="file" onChange={handleFileChange} required accept=".pdf,.jpg,.jpeg,.png" disabled={loading || !!successMessage} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                     {doctorLicenseFile && <p className="text-xs text-muted-foreground mt-1">Selected: {doctorLicenseFile.name}</p>}
                 </div>
               </div>
               <Button type="submit" className="w-full" disabled={loading || !!successMessage}> {loading ? 'Submitting...' : 'Submit Application'} </Button>
            </form>
          )}

        </CardContent>
        <CardFooter className="text-sm text-center block">
             Already have an account?{' '} <Link to="/login" className="underline">Login here</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;