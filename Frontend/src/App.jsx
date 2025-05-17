import React, { useState, useEffect } from 'react';
import { Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'; // Import Navigate

// ... other imports ...
import MainNavbar from './componment/Navbar';
import AdminSidebar from './components/app-sidebar';
import Login from './pages/Login';
import Register from './pages/Register'; // You'll modify this significantly
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
 // Example
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './Admin/AdminDashboard';
import AdminReview from './Admin/AdminReview';
import DoctorRequests from './Admin/PendingRequest';
import DoctorList from './Admin/DoctorList';

// Doctor Pages (Example)
import DoctorDashboard from './pages/DoctorDashboard'; 
import DoctorAppointments from './pages/DoctorAppointments';

// Patient Pages (Example)
import PatientDashboard from './pages/PatientDashboard'; // Or just use '/' or '/profile'
import MyAppoinment from './pages/MyAppoinment';

// --- Authentication Logic ---
const checkUserAuth = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType'); // STORE THE ROLE
  console.log("Auth Check:", { token, userType }); // Debug log
  return { isLoggedIn: !!token, userType: token ? userType : null }; // Only set type if logged in
};

const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType'); // REMOVE ROLE ON LOGOUT
};

// --- Helper Component for Protected Routes ---
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isLoggedIn, userType } = checkUserAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login, saving the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userType)) {
     // Redirect to an unauthorized page or home page
     console.warn(`Unauthorized access attempt to ${location.pathname} by role: ${userType}`);
     // Redirect based on role?
     if (userType === 'admin') return <Navigate to="/admin-dashboard" replace />;
     if (userType === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
     // Default redirect for unauthorized patients or unexpected roles
     return <Navigate to="/" replace />; 
  }

  return children; // Render the component if authorized
};


function AppContent() {
  const location = useLocation();
  // Initialize state once from localStorage
  const [auth, setAuth] = useState(checkUserAuth); 

  // Function to update auth state, typically called from Login/Logout
  const updateAuth = () => {
    setAuth(checkUserAuth());
  };

  const handleLogout = () => {
    logoutUser();
    updateAuth(); // Update state
    // Navigation handled by component or redirect might be needed
  };

  const isAdmin = auth.isLoggedIn && auth.userType === 'admin';
  const isDoctor = auth.isLoggedIn && auth.userType === 'doctor';
  const isPatient = auth.isLoggedIn && auth.userType === 'patient';

  const hideNavPaths = ['/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

  console.log("AppContent Render - Auth:", auth); // Debug Log

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- Navigation Rendering --- */}
      {!shouldHideNav && isAdmin && <AdminSidebar onLogout={handleLogout} />}
      {!shouldHideNav && !isAdmin && ( // Show MainNavbar for Doctors, Patients, and logged-out users
           <MainNavbar
              isLoggedIn={auth.isLoggedIn}
              userType={auth.userType}
              onLogout={handleLogout}
           />
      )}
      {shouldHideNav && ( /* Optional simple header for auth pages */
         <div className="p-4 border-b h-16 flex items-center">
            <span className="text-xl font-bold text-primary">MediNearBy</span>
         </div>
      )}

      {/* --- Main Content Area --- */}
      {/* Adjust padding based on which nav is showing */}
      <main className={`flex-grow ${isAdmin && !shouldHideNav ? 'pl-64' : ''} ${!isAdmin && !shouldHideNav ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={updateAuth} />} /> {/* Pass updateAuth */}
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
         

          {/* === Protected Routes === */}

          {/* Routes accessible by ANY logged-in user */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

           {/* Patient Routes */}
           <Route path="/my-appointments" element={
               <ProtectedRoute allowedRoles={['patient']}><MyAppoinment /></ProtectedRoute>
           } />
            <Route path="/patient/dashboard" element={ // Example patient dashboard
               <ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>
           } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>
          } />
           <Route path="/doctor/appointments" element={ // Example
              <ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>
          } />
          {/* Doctors might also access /profile */}
          { isDoctor && <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> }


          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={
             <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/review" element={
             <ProtectedRoute allowedRoles={['admin']}><AdminReview /></ProtectedRoute>
          } />
          <Route path="/admin/doctor-requests" element={
             <ProtectedRoute allowedRoles={['admin']}><DoctorRequests /></ProtectedRoute>
          } />
           <Route path="/admin/doctor-list" element={
             <ProtectedRoute allowedRoles={['admin']}><DoctorList /></ProtectedRoute>
          } />
           {/* Admins might also access /profile */}
           { isAdmin && <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> }

          {/* Catch-all or Not Found Route */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
          {/* Or a dedicated <NotFound /> page */}

        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
      <AppContent />
    
  );
}

export default App;