import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  student_email: string | null;
  student_full_name: string | null;
  student_branch: string | null;
  student_roll_number: string | null;
  student_academic_year: string | null;
  student_phone: string | null;
  additional_data: any;
  registered_at: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const useEventRegistrations = (eventId?: string) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('event_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRegistrations(data as EventRegistration[] || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: eventId,
            student_id: session.user.id,
            status: 'registered'
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchRegistrations();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('student_id', session.user.id);

      if (error) throw error;

      await fetchRegistrations();
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(
      reg => reg.event_id === eventId && 
             reg.student_id === session?.user?.id && 
             reg.status === 'registered'
    );
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  return {
    registrations,
    loading,
    error,
    fetchRegistrations,
    registerForEvent,
    unregisterFromEvent,
    isRegistered,
  };
};