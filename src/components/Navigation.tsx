import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Plus, Award, LogOut, Home, User as UserIcon, ShieldAlert, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    ...(isAdmin ? [{ path: "/add-event", label: "Add Event", icon: Plus }] : []),
    { path: "/certificates", label: "Certificates", icon: Award },
    { path: "/profile", label: "Profile", icon: UserIcon },
  ];

  const getInitials = () => {
    const name = profile?.full_name || profile?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 bg-background/50 dark:bg-background/20 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo with Glow hover */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:scale-105">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-text-primary group-hover:text-primary transition-colors duration-300">
              EventHub
            </span>
            {profile && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <ShieldAlert className="h-3 w-3 text-primary animate-pulse" />
                    Admin Access
                  </>
                ) : (
                  "Student Member"
                )}
              </span>
            )}
          </div>
        </Link>
        
        {/* Sleek Dock Navigation Menu */}
        <div className="hidden md:flex items-center p-1.5 bg-secondary/40 dark:bg-card/40 border border-white/20 dark:border-white/5 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 px-4 py-2 h-9 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-white shadow-md hover:bg-primary/95" 
                      : "text-text-secondary hover:text-text-primary hover:bg-secondary/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "scale-110" : ""}`} />
                  <span className="font-medium text-xs tracking-wide">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Options Drawer & Log Out button */}
        <div className="flex items-center space-x-3">
          {/* Light/Dark Mode Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl h-10 w-10 text-text-secondary hover:text-text-primary hover:bg-secondary/60 transition-all duration-300"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px] text-amber-400 animate-float" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-indigo-500" />
            )}
          </Button>

          {profile && (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 rounded-2xl h-10 px-3 hover:bg-secondary/60">
                <Avatar className="h-7 w-7 border-2 border-primary/20">
                  <AvatarImage src={profile.profile_picture_url || undefined} alt="Profile" />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {getInitials() || <UserIcon className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-xs font-semibold text-text-primary">
                  {profile.full_name?.split(' ')[0] || 'Member'}
                </span>
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="rounded-xl h-10 px-4 text-xs font-semibold border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all duration-300 group"
          >
            <LogOut className="h-3.5 w-3.5 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;