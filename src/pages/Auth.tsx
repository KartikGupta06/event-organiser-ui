import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowLeft, Loader2, ShieldCheck, Mail, Lock, User, Eye, EyeOff, Sparkles, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Organize Events Seamlessly",
      description: "Manage everything from dynamic participant registrations to automated event check-ins from a single premium dashboard.",
      icon: Calendar,
      color: "text-indigo-400"
    },
    {
      title: "Interactive Form Builder",
      description: "Design custom registration questionnaires with simple controls and view realistic mockups instantly in the live builder.",
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      title: "High-Fidelity Certificates",
      description: "Assign and issue gorgeous premium certificates in multiple style templates, complete with live, in-browser previews.",
      icon: Award,
      color: "text-amber-400"
    },
    {
      title: "Real-Time Visual Analytics",
      description: "Gain dynamic branch breakdowns, register metrics, and chronological sign-up schedules formatted with sleek interactive charts.",
      icon: BarChart3,
      color: "text-emerald-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to sign in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "Signed in successfully. Heading to your dashboard.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        title: "Missing fields",
        description: "All registration fields are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Check your email inbox to verify your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return { score: 0, text: "", color: "bg-muted" };
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    switch (score) {
      case 1: return { score: 25, text: "Weak", color: "bg-destructive" };
      case 2: return { score: 50, text: "Fair", color: "bg-warning" };
      case 3: return { score: 75, text: "Good", color: "bg-indigo-400" };
      case 4: return { score: 100, text: "Strong", color: "bg-success" };
      default: return { score: 10, text: "Too short", color: "bg-destructive" };
    }
  };

  const strength = getPasswordStrength();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left panel: Showcase Sidebar */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-gradient-primary relative p-12 flex-col justify-between overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-white/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-black/20 blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center space-x-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">EventHub</span>
        </div>

        {/* Cinematic Slider */}
        <div className="relative z-10 my-auto text-white pr-4">
          <div className="min-h-[250px] flex flex-col justify-center">
            {slides.map((slide, idx) => {
              const SlideIcon = slide.icon;
              const isActive = idx === activeSlide;

              return (
                <div
                  key={idx}
                  className={`transition-all duration-700 absolute inset-0 flex flex-col justify-center ${
                    isActive ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95 pointer-events-none"
                  }`}
                >
                  <SlideIcon className={`h-12 w-12 ${slide.color} mb-6`} />
                  <h2 className="text-3xl font-extrabold tracking-tight mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed font-light">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Showslide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="relative z-10 text-white/60 text-sm font-light">
          © {new Date().getFullYear()} EventHub System. Crafted with pure focus.
        </div>
      </div>

      {/* Right panel: Modern Glassmorphic Forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-gradient-surface">
        {/* Mobile Header only */}
        <div className="w-full max-w-md flex items-center justify-between mb-8 md:hidden">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-text-primary">EventHub</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-text-secondary hover:text-primary transition-all mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Core Panel Card */}
          <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/50 dark:border-white/10">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mb-2">Get Started</h1>
              <p className="text-sm text-text-secondary">
                Join our premium network to host, manage, and download verified credentials.
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/50 rounded-xl mb-6">
                <TabsTrigger value="signin" className="rounded-lg py-2">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg py-2">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Sign In View */}
              <TabsContent value="signin" className="space-y-4 outline-none">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="pl-11 h-12 bg-white/50 dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="pl-11 pr-10 h-12 bg-white/50 dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-text-tertiary hover:text-text-primary"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-primary hover:shadow-glow font-semibold rounded-xl text-white mt-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying details...
                      </span>
                    ) : (
                      'Sign In to Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Sign Up View */}
              <TabsContent value="signup" className="space-y-4 outline-none">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="pl-11 h-12 bg-white/50 dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="pl-11 h-12 bg-white/50 dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Minimum 6 characters"
                        className="pl-11 pr-10 h-12 bg-white/50 dark:bg-black/20 border-border focus:ring-2 focus:ring-primary/20 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-text-tertiary hover:text-text-primary"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Interactive password complexity bar */}
                    {formData.password && (
                      <div className="space-y-1.5 mt-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-text-secondary">Complexity:</span>
                          <span className="font-semibold text-text-primary">{strength.text}</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strength.color} transition-all duration-500`}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-primary hover:shadow-glow font-semibold rounded-xl text-white mt-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating access credentials...
                      </span>
                    ) : (
                      'Create Your Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Sandbox Notice Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15 flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary block">Test Environment Ready</span>
                For development and demo purposes, sign up with any test email and password to instantly access client roles.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;