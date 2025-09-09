import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Plus, Calendar, Users, ExternalLink, Clock } from "lucide-react";

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: 1,
    name: "Tech Conference 2024",
    description: "Annual technology conference featuring the latest innovations in AI, cloud computing, and software development.",
    registrationLink: "https://techconf2024.com/register",
    deadline: "2024-03-15",
    status: "active",
  },
  {
    id: 2,
    name: "Design Workshop Series",
    description: "Interactive workshop series covering UI/UX design principles, prototyping, and design thinking methodologies.",
    registrationLink: "https://designworkshop.com/signup",
    deadline: "2024-02-28",
    status: "active",
  },
  {
    id: 3,
    name: "Startup Pitch Competition",
    description: "Competitive event for early-stage startups to pitch their ideas to investors and industry experts.",
    registrationLink: "https://startuppitch.com/apply",
    deadline: "2024-02-20",
    status: "closing_soon",
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Event Dashboard</h1>
            <p className="text-text-secondary">Manage your events and track registrations</p>
          </div>
          
          <Link to="/add-event">
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border shadow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-text-primary">{events.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold text-text-primary">
                  {events.filter(e => e.status === "active").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Closing Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold text-text-primary">
                  {events.filter(e => e.status === "closing_soon").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Your Events</h2>
          
          {events.length === 0 ? (
            <Card className="border-border shadow">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No events yet</h3>
                <p className="text-text-secondary mb-4">Get started by creating your first event</p>
                <Link to="/add-event">
                  <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {events.map((event) => (
                <Card key={event.id} className="border-border shadow hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-text-primary mb-2">{event.name}</CardTitle>
                        <CardDescription className="text-text-secondary">
                          {event.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={event.status === "active" ? "default" : "secondary"}
                        className={event.status === "closing_soon" ? "bg-warning text-warning-foreground" : ""}
                      >
                        {event.status === "active" ? "Active" : "Closing Soon"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text-secondary">
                        <p>Deadline: {new Date(event.deadline).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(event.registrationLink, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Registration Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;