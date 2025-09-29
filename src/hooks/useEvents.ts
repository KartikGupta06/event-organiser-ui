import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  name: string;
  description?: string;
  rules?: string;
  registration_link?: string;
  deadline?: string;
  status: 'active' | 'inactive' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data as Event[] || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            ...eventData,
            created_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send new event notification to all students
      try {
        await supabase.functions.invoke('send-event-notification', {
          body: {
            type: 'new_event',
            eventId: data.id,
            eventName: data.name,
            eventDescription: data.description,
            eventDeadline: data.deadline,
            registrationLink: data.registration_link,
          },
        });
        console.log('New event notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send event notification:', emailError);
        // Don't fail the event creation if email fails
      }

      await fetchEvents(); // Refresh the events list
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
  };
};