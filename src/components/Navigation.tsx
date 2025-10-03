import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Plus, Award, LogOut, Home, User as UserIcon, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    ...(isAdmin ? [{ path: "/add-event", label: "Add Event", icon: Plus }] : []),
    { path: "/attendance", label: "Attendance", icon: Users },
    { path: "/certificates", label: "Certificates", icon: Award },
    { path: "/profile", label: "Profile", icon: UserIcon },
  ];

  const getInitials = () => {
    const name = profile?.full_name || profile?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

        <div className="flex items-center space-x-3">
          {profile && (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.profile_picture_url || undefined} alt="Profile" />
                  <AvatarFallback className="text-xs">
                    {getInitials() || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-sm">{profile.full_name || 'User'}</span>
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;