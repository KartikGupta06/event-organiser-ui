import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EventRegistrationModal } from './EventRegistrationModal';
import { Check, Loader2, Sparkles, XCircle } from 'lucide-react';

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
  const [showModal, setShowModal] = useState(false);
  const { unregisterFromEvent, isRegistered, fetchRegistrations } = useEventRegistrations();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const registered = isRegistered(eventId);

  const handleRegistrationClick = () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please register or log in to enroll for this event.",
        variant: "destructive",
      });
      return;
    }

    if (profile.role !== 'student') {
      toast({
        title: "Administrative Account Access",
        description: "Only students are authorized to enroll for live events.",
        variant: "destructive",
      });
      return;
    }

    if (registered) {
      handleUnregister();
    } else {
      setShowModal(true);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);
    try {
      const { error } = await unregisterFromEvent(eventId);
      if (error) throw new Error(error);
      
      toast({
        title: "Enrollment Cancelled",
        description: `Successfully cancelled your registration ticket for ${eventName}.`,
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to process unregistration request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = async () => {
    await fetchRegistrations();
    
    // Send registration confirmation email
    try {
      await supabase.functions.invoke('send-event-notification', {
        body: {
          type: 'registration_confirmation',
          eventId,
          eventName,
          eventDescription,
          eventDeadline,
          recipientEmail: user?.email,
          recipientUserId: user?.id,
        },
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    toast({
      title: "Enrollment Verified!",
      description: `Your ticket for ${eventName} has been issued. Check your mailbox for ticket details.`,
    });
  };

  // Don't show registration button for non-students
  if (!profile || profile.role !== 'student') {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleRegistrationClick}
        disabled={loading}
        variant={registered ? "outline" : "default"}
        className={`w-full sm:w-auto h-10 px-5 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 ${
          registered 
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 group" 
            : "bg-gradient-primary text-white hover:shadow-glow"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Processing...</span>
          </span>
        ) : registered ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check className="h-3.5 w-3.5 group-hover:hidden" />
            <XCircle className="h-3.5 w-3.5 hidden group-hover:block" />
            <span className="group-hover:hidden">Registered</span>
            <span className="hidden group-hover:block">Cancel Ticket</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Claim Registration Ticket</span>
          </span>
        )}
      </Button>

      <EventRegistrationModal
        open={showModal}
        onOpenChange={setShowModal}
        eventId={eventId}
        eventName={eventName}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
};