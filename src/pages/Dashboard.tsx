import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { EventRegistrationButton } from "@/components/EventRegistrationButton";
import { EmailNotificationsDashboard } from "@/components/EmailNotificationsDashboard";

const Dashboard = () => {
  const { events, loading } = useEvents();
  const { isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'inactive':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Event Dashboard</h1>
            <p className="text-text-secondary">
              {isAdmin ? 'Manage your events and track participation' : 'Browse available events and register'}
            </p>
          </div>
          {isAdmin && (
            <Link to="/add-event">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                <Plus className="h-5 w-5 mr-2" />
                Add New Event
              </Button>
            </Link>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{totalEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{activeEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary">Closing Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{upcomingDeadlines}</div>
            </CardContent>
          </Card>
        </div>

        {/* Email Notifications Dashboard for Admins */}
        {isAdmin && (
          <div className="mb-8">
            <EmailNotificationsDashboard />
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            {events.length > 0 ? 'Events' : 'No Events Available'}
          </h2>
          
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No events found</h3>
                <p className="text-text-secondary mb-4">
                  {isAdmin 
                    ? "Get started by creating your first event." 
                    : "No events are currently available. Check back later."
                  }
                </p>
                {isAdmin && (
                  <Link to="/add-event">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-text-primary">{event.name}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-text-secondary">{event.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Deadline: {formatDeadline(event.deadline)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <EventRegistrationButton 
                        eventId={event.id}
                        eventName={event.name}
                        eventDescription={event.description}
                        eventDeadline={event.deadline}
                      />
                      {event.registration_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={event.registration_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            External Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;