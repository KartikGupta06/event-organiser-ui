import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Award, LogOut, Home } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, handle logout logic here
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/add-event", label: "Add Event", icon: Plus },
    { path: "/certificates", label: "Certificates", icon: Award },
  ];

  return (
    <nav className="bg-surface border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-text-primary">EventHub</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;