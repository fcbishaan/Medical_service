import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainNavbar from './componment/Navbar';
import AdminSidebar from './components/app-sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './Admin/AdminDashboard';
import AdminReview from './Admin/AdminReview';
import DoctorRequests from './Admin/PendingRequest';
import DoctorList from './Admin/DoctorList';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import PatientDashboard from './pages/PatientDashboard';
import MyAppoinment from './pages/MyAppoinment';
import Doctor from './Doctor/Doctor';
import DoctorProfileInfo from './Doctor/DoctorProfileInfo';
import FeedPage from './pages/FeedPage';
import DoctorAvailabilityPage from './Doctor/DoctorAvailabilityPage';
import CreatePassword from './pages/CreatePassword';

// Authentication Logic
const checkUserAuth = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  return { isLoggedIn: !!token, userType: token ? userType : null };
};

const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
};

const App = () => {
  // Protected Route Component
  const ProtectedRoute = ({ allowedRoles, children }) => {
    const location = useLocation();
    const { isLoggedIn, userType } = checkUserAuth();

    if (!isLoggedIn) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userType)) {
      if (userType === 'admin') return <Navigate to="/admin-dashboard" replace />;
      if (userType === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    return children;
  };
  const location = useLocation();
  const [auth, setAuth] = React.useState(checkUserAuth());

  const updateAuth = () => {
    setAuth(checkUserAuth());
  };

  const handleLogout = () => {
    logoutUser();
    updateAuth();
  };

  const isAdmin = auth.isLoggedIn && auth.userType === 'admin';
  const hideNavPaths = ['/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNav && isAdmin && <AdminSidebar onLogout={handleLogout} />}
      {!shouldHideNav && !isAdmin && (
        <MainNavbar
          isLoggedIn={auth.isLoggedIn}
          userType={auth.userType}
          onLogout={handleLogout}
        />
      )}
      {shouldHideNav && (
        <div className="p-4 border-b h-16 flex items-center">
          <span className="text-xl font-bold text-primary">MediNearBy</span>
        </div>
      )}

      <main className={`flex-grow ${isAdmin && !shouldHideNav ? 'pl-64' : ''} ${!isAdmin && !shouldHideNav ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={updateAuth} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/doctors/:doctorId" element={<DoctorProfileInfo />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/create-password" element={<CreatePassword />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/my-appointments" element={
            <ProtectedRoute allowedRoles={['patient']}><MyAppoinment /></ProtectedRoute>
          } />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <ProtectedRoute allowedRoles={['doctor']}><DoctorAvailabilityPage /></ProtectedRoute>
          } />

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

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;