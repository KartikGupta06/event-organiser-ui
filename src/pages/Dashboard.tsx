import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, ExternalLink, Loader2, Sparkles, TrendingUp, Users, Award, BarChart3, HelpCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { EventRegistrationButton } from "@/components/EventRegistrationButton";
import { EmailNotificationsDashboard } from "@/components/EmailNotificationsDashboard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

const Dashboard = () => {
  const { events, loading, error } = useEvents();
  const { isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs text-text-secondary font-medium tracking-wide">Syncing Workspace Event Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Card className="border-destructive/30 bg-destructive/5 rounded-3xl p-8 text-center max-w-md mx-auto">
            <CardContent className="p-0">
              <p className="text-destructive font-bold mb-2">Error Syncing Workspace Events</p>
              <p className="text-xs text-text-secondary">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalEvents = events.length;
  const activeEvents = events.filter(event => event.status === 'active').length;
  
  const upcomingDeadlines = events.filter(event => {
    if (!event.deadline) return false;
    const deadline = new Date(event.deadline);
    const now = new Date();
    const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7 && diffDays > 0;
  }).length;

  const completedEvents = events.filter(event => event.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/30';
      case 'completed':
        return 'bg-secondary text-text-secondary hover:bg-secondary border-border';
      case 'inactive':
        return 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline specified';
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Mock analytics data for presentation
  const registrationTrendData = [
    { name: "Week 1", count: 120 },
    { name: "Week 2", count: 280 },
    { name: "Week 3", count: 410 },
    { name: "Week 4", count: 680 },
    { name: "Week 5", count: 950 },
    { name: "Week 6", count: 1482 },
  ];

  const branchDistributionData = [
    { name: "CSE", count: 480, color: "#6366f1" },
    { name: "ECE", count: 320, color: "#a855f7" },
    { name: "ME", count: 180, color: "#3b82f6" },
    { name: "EE", count: 210, color: "#10b981" },
    { name: "Civil", count: 90, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface pb-16">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Block with Glass Ambient and Call-To-Action */}
        <div className="glass-panel p-8 rounded-3xl border border-white/50 dark:border-white/5 shadow-xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Active Workspace Session</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {isAdmin ? "Organizer Control Panel" : "Browse & Enroll Events"}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              {isAdmin 
                ? 'Oversee dynamic field forms, broadcast system announcements, verify student achievements, and audit dispatch metrics.' 
                : 'Browse live events, register using custom dynamic surveys, and claim gold-bordered credentials.'}
            </p>
          </div>
          {isAdmin && (
            <Link to="/add-event" className="shrink-0 relative z-10">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow rounded-xl font-semibold text-white transition-all duration-300">
                <Plus className="h-4.5 w-4.5 mr-2" />
                Add New Event
              </Button>
            </Link>
          )}
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Hosted</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">{totalEvents}</h3>
            </div>
          </Card>

          <Card className="glass-card p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Active Status</p>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">{activeEvents}</h3>
            </div>
          </Card>

          <Card className="glass-card p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Closing Soon</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">{upcomingDeadlines}</h3>
            </div>
          </Card>

          <Card className="glass-card p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{completedEvents}</h3>
            </div>
          </Card>
        </div>

        {/* Interactive Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Chart 1: Registration Velocity AreaChart */}
          <Card className="glass-card lg:col-span-8 p-6">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base font-bold text-text-primary">Enrollment Growth Velocity</CardTitle>
              </div>
              <CardDescription className="text-xs text-text-secondary mt-1">
                Visualizing student registrations and claim completions over chronological cycles.
              </CardDescription>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegistration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRegistration)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Branch distribution BarChart */}
          <Card className="glass-card lg:col-span-4 p-6">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center space-x-2.5">
                <Users className="h-4.5 w-4.5 text-purple-500" />
                <CardTitle className="text-base font-bold text-text-primary">Branch Participation</CardTitle>
              </div>
              <CardDescription className="text-xs text-text-secondary mt-1">
                Demographic statistics displaying enrollment rates branch-wise.
              </CardDescription>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchDistributionData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={24}>
                    {branchDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Events Grid list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                {events.length > 0 ? 'Live Events Catalog' : 'No Events Hosted'}
              </h2>
            </div>
            
            {events.length === 0 ? (
              <Card className="glass-card py-16 text-center">
                <Calendar className="h-14 w-14 text-text-tertiary mx-auto mb-4 animate-float" />
                <h3 className="text-lg font-bold text-text-primary mb-2">No hosted events found</h3>
                <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
                  {isAdmin 
                    ? "Generate your first interactive visual catalog to welcome student registrations." 
                    : "No college events are currently scheduled. Check back later."
                  }
                </p>
                {isAdmin && (
                  <Link to="/add-event">
                    <Button className="bg-gradient-primary hover:shadow-glow rounded-xl font-semibold text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Event
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="glass-card-interactive p-6 relative overflow-hidden border border-white/50 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-text-primary tracking-tight">{event.name}</h3>
                          <Badge className={`${getStatusColor(event.status)} capitalize px-2.5 py-0.5 rounded-lg border text-[10px] font-bold`}>
                            {event.status}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-text-secondary leading-relaxed pr-6 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-border/50 my-5" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Deadline Indicators */}
                      <div className="flex items-center space-x-2.5 text-xs text-text-secondary">
                        <Clock className="h-4.5 w-4.5 text-primary shrink-0" />
                        <span className="font-medium">
                          Deadline: <strong className="text-text-primary">{formatDeadline(event.deadline)}</strong>
                        </span>
                      </div>
                      
                      {/* Register Button and Ext links */}
                      <div className="flex items-center space-x-3">
                        <EventRegistrationButton 
                          eventId={event.id}
                          eventName={event.name}
                          eventDescription={event.description}
                          eventDeadline={event.deadline}
                        />
                        {event.registration_link && (
                          <Button variant="outline" size="sm" asChild className="rounded-xl h-10 px-4 text-xs font-semibold hover:bg-primary/5 hover:text-primary">
                            <a 
                              href={event.registration_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-2 text-primary" />
                              External Link
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar: Admin audit logs or quick info panel */}
          <div className="lg:col-span-4 space-y-6">
            {isAdmin ? (
              <div className="col-span-full">
                <EmailNotificationsDashboard />
              </div>
            ) : (
              <Card className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">Verified Credentials Vault</h3>
                    <p className="text-[10px] text-text-secondary">Official digital claims delivery system.</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Upon finishing active college workshops, exams, or hackathons, organizers will issue secure gold-stamped PDF certificates.
                </p>
                <Link to="/certificates">
                  <Button variant="secondary" className="w-full text-xs font-bold rounded-xl h-10 border border-border/80 hover:bg-secondary/60">
                    Inspect Personal Vault
                  </Button>
                </Link>
              </Card>
            )}

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Need Assistance?</h3>
                  <p className="text-[10px] text-text-secondary">Instant student coordinator helpline.</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Encountering trouble during custom form responses or claims downloads? Get in touch with structural administrators.
              </p>
              <a href="mailto:support@college.edu">
                <Button variant="outline" className="w-full text-xs font-bold rounded-xl h-10 hover:bg-primary/5 hover:text-primary">
                  Mail Administrator
                </Button>
              </a>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;