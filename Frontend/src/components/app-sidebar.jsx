import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { cn } from "@/lib/utils"; // Utility for conditional classes
import { LayoutDashboard, FileText, UserCheck, List, User, LogOut } from "lucide-react"; // Example Icons

// Sidebar navigation items
const sidebarNavItems = [
  { title: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { title: "Review Section", href: "/admin/review", icon: FileText }, // Assuming this route exists
  { title: "Doctor Requests", href: "/admin/doctor-requests", icon: UserCheck },
  { title: "Doctor List", href: "/admin/doctor-list", icon: List },
  { title: "Profile", href: "/profile", icon: User }, // Assuming '/profile' works for admin too
];

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Navigation might be handled in onLogout or App.jsx now
  };

  return (
    // Use div instead of nav, style it as the sidebar container
    <div className="bg-background border-r fixed top-0 left-0 h-full w-64 flex flex-col z-40"> {/* Use theme background */}
        {/* Logo/Header Area */}
        <div className="p-4 border-b h-16 flex items-center justify-center shrink-0">
            <Link to="/admin-dashboard" className="flex items-center space-x-2">
               {/* Optional: Add an icon/logo */}
               <span className="text-lg font-semibold text-foreground">Admin Panel</span>
            </Link>
        </div>

        {/* Navigation Area with Scroll */}
        <ScrollArea className="flex-grow">
          <nav className="flex flex-col space-y-1 p-4">
            {sidebarNavItems.map((item) => {
               const isActive = location.pathname === item.href;
               return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }), // Use button variants
                    isActive ? "" : "text-muted-foreground", // Dim inactive links slightly
                    "justify-start w-full" // Align text left
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
               )
             })}
          </nav>
        </ScrollArea>

        {/* Footer Area (Logout Button) */}
        <div className="p-4 border-t mt-auto shrink-0">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
               <LogOut className="mr-2 h-4 w-4" />
               Logout
            </Button>
        </div>
    </div>
  );
};

export default AdminSidebar;