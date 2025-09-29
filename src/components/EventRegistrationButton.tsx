import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventRegistrationButtonProps {
  eventId: string;
  eventName: string;
  eventDescription?: string;
  eventDeadline?: string;
}

export const EventRegistrationButton = ({ 
  eventId, 
  eventName, 
  eventDescription, 
  eventDeadline 
}: EventRegistrationButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { registerForEvent, unregisterFromEvent, isRegistered } = useEventRegistrations();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const registered = isRegistered(eventId);

  const handleRegistration = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return;
    }

    if (profile.role !== 'student') {
      toast({
        title: "Students Only",
        description: "Only students can register for events",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (registered) {
        const { error } = await unregisterFromEvent(eventId);
        if (error) throw new Error(error);
        
        toast({
          title: "Unregistered Successfully",
          description: `You have been unregistered from ${eventName}`,
        });
      } else {
        const { error } = await registerForEvent(eventId);
        if (error) throw new Error(error);

        // Send registration confirmation email
        try {
          await supabase.functions.invoke('send-event-notification', {
            body: {
              type: 'registration_confirmation',
              eventId,
              eventName,
              eventDescription,
              eventDeadline,
              recipientEmail: user.email,
              recipientUserId: user.id,
            },
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
        
        toast({
          title: "Registered Successfully",
          description: `You have been registered for ${eventName}. Check your email for confirmation.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show registration button for non-students
  if (!profile || profile.role !== 'student') {
    return null;
  }

  return (
    <Button
      onClick={handleRegistration}
      disabled={loading}
      variant={registered ? "outline" : "default"}
      className="w-full sm:w-auto"
    >
      {loading ? (
        "Processing..."
      ) : registered ? (
        "Unregister"
      ) : (
        "Register for Event"
      )}
    </Button>
  );
};