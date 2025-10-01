import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventWithRegistration {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  status: string;
  registered_at: string;
  registration_status: string;
}

const EventParticipationHistory = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipatedEvents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select(`
            registered_at,
            status,
            events (
              id,
              name,
              description,
              deadline,
              status
            )
          `)
          .eq('student_id', user.id)
          .order('registered_at', { ascending: false });

        if (error) throw error;

        const formattedEvents = data.map((reg: any) => ({
          id: reg.events.id,
          name: reg.events.name,
          description: reg.events.description,
          deadline: reg.events.deadline,
          status: reg.events.status,
          registered_at: reg.registered_at,
          registration_status: reg.status,
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipatedEvents();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Participation History</CardTitle>
          <CardDescription>Your registered events will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            You haven't registered for any events yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Participation History</CardTitle>
        <CardDescription>All events you've registered for</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                    <Badge variant={event.registration_status === 'registered' ? 'default' : 'outline'}>
                      {event.registration_status}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Registered: {format(new Date(event.registered_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {event.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Deadline: {format(new Date(event.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventParticipationHistory;
