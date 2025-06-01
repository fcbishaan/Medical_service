import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MainNavbar = ({ isLoggedIn, userType, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePasswordPage = location.pathname === '/create-password';

  // Only hide nav items if it's create-password page AND user is a doctor
  const hideNavItems = isCreatePasswordPage && userType === 'doctor';

  return (
    <nav className="bg-background shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">MediNearBy</span>
            </Link>

            {/* Show navigation items for non-doctors and when not on create-password page */}
            {!hideNavItems && userType !== 'doctor' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/Doctors"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  Find Doctors
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  Explorer
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </div>
            )}
          </div>

          {/* Auth Buttons & User Specific Links */}
          {!hideNavItems && (
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Patient Specific */}
                  {userType === 'patient' && (
                    <Button variant="ghost" onClick={() => navigate('/my-appointments')}>
                      My Appointments
                    </Button>
                  )}
                  {/* Doctor Specific */}
                  {userType === 'doctor' && (
                    <>
                      <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')}>
                        Feed
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/doctor/appointments')}>
                        Check Appointments
                      </Button>
                      <Button variant="ghost" onClick={() => navigate('/doctor/schedule')}>
                        Create Schedule
                      </Button>
                    </>
                  )}

                  {/* Common for logged in users */}
                  <Button variant="ghost" onClick={() => navigate('/profile')}>
                    Profile
                  </Button>
                  <Button variant="outline" onClick={onLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                // Logged out users
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="default" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;