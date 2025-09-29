import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting reminder email check...');

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    const oneDayFromNow = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000));

    // Find events with upcoming deadlines (1 day before registration deadline)
    const { data: eventsWithDeadlines, error: deadlineError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .not('deadline', 'is', null)
      .gte('deadline', now.toISOString())
      .lt('deadline', oneDayFromNow.toISOString());

    if (deadlineError) {
      console.error('Error fetching events with deadlines:', deadlineError);
    } else if (eventsWithDeadlines && eventsWithDeadlines.length > 0) {
      console.log(`Found ${eventsWithDeadlines.length} events with upcoming deadlines`);
      
      // Send deadline reminders to all students
      for (const event of eventsWithDeadlines) {
        const { data: students } = await supabase
          .from('profiles')
          .select('email, user_id')
          .eq('role', 'student')
          .eq('event_reminders', true);

        if (students) {
          for (const student of students) {
            // Check if we already sent this reminder
            const { data: existingReminder } = await supabase
              .from('email_notifications')
              .select('id')
              .eq('email_type', 'deadline_reminder')
              .eq('event_id', event.id)
              .eq('recipient_user_id', student.user_id);

            if (!existingReminder || existingReminder.length === 0) {
              // Send deadline reminder
              await supabase.functions.invoke('send-event-notification', {
                body: {
                  type: 'deadline_reminder',
                  eventId: event.id,
                  eventName: event.name,
                  eventDescription: event.description,
                  eventDeadline: event.deadline,
                  registrationLink: event.registration_link,
                  recipientEmail: student.email,
                  recipientUserId: student.user_id,
                },
              });
            }
          }
        }
      }
    }

    // Find registered students for events happening in 7 days
    const { data: upcomingEvents, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .not('deadline', 'is', null)
      .gte('deadline', sevenDaysFromNow.toISOString())
      .lt('deadline', new Date(sevenDaysFromNow.getTime() + (24 * 60 * 60 * 1000)).toISOString());

    if (eventError) {
      console.error('Error fetching upcoming events:', eventError);
    } else if (upcomingEvents && upcomingEvents.length > 0) {
      console.log(`Found ${upcomingEvents.length} events happening in 7 days`);
      
      for (const event of upcomingEvents) {
        // Get registered students for this event
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select(`
            student_id,
            profiles!inner(email, event_reminders)
          `)
          .eq('event_id', event.id)
          .eq('status', 'registered');

        if (registrations) {
          for (const registration of registrations) {
            const profile = registration.profiles as any;
            
            if (profile.event_reminders) {
              // Check if we already sent this reminder
              const { data: existingReminder } = await supabase
                .from('email_notifications')
                .select('id')
                .eq('email_type', 'event_reminder')
                .eq('event_id', event.id)
                .eq('recipient_user_id', registration.student_id);

              if (!existingReminder || existingReminder.length === 0) {
                // Send event reminder
                await supabase.functions.invoke('send-event-notification', {
                  body: {
                    type: 'event_reminder',
                    eventId: event.id,
                    eventName: event.name,
                    eventDescription: event.description,
                    eventDeadline: event.deadline,
                    recipientEmail: profile.email,
                    recipientUserId: registration.student_id,
                    daysUntilEvent: 7,
                  },
                });
              }
            }
          }
        }
      }
    }

    // Find registered students for events happening tomorrow
    const { data: tomorrowEvents, error: tomorrowError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .not('deadline', 'is', null)
      .gte('deadline', oneDayFromNow.toISOString())
      .lt('deadline', new Date(oneDayFromNow.getTime() + (24 * 60 * 60 * 1000)).toISOString());

    if (tomorrowError) {
      console.error('Error fetching tomorrow events:', tomorrowError);
    } else if (tomorrowEvents && tomorrowEvents.length > 0) {
      console.log(`Found ${tomorrowEvents.length} events happening tomorrow`);
      
      for (const event of tomorrowEvents) {
        // Get registered students for this event
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select(`
            student_id,
            profiles!inner(email, event_reminders)
          `)
          .eq('event_id', event.id)
          .eq('status', 'registered');

        if (registrations) {
          for (const registration of registrations) {
            const profile = registration.profiles as any;
            
            if (profile.event_reminders) {
              // Check if we already sent this reminder today
              const { data: existingReminder } = await supabase
                .from('email_notifications')
                .select('id')
                .eq('email_type', 'event_reminder')
                .eq('event_id', event.id)
                .eq('recipient_user_id', registration.student_id)
                .gte('sent_at', now.toDateString());

              if (!existingReminder || existingReminder.length === 0) {
                // Send tomorrow reminder
                await supabase.functions.invoke('send-event-notification', {
                  body: {
                    type: 'event_reminder',
                    eventId: event.id,
                    eventName: event.name,
                    eventDescription: event.description,
                    eventDeadline: event.deadline,
                    recipientEmail: profile.email,
                    recipientUserId: registration.student_id,
                    daysUntilEvent: 1,
                  },
                });
              }
            }
          }
        }
      }
    }

    console.log('Reminder email check completed successfully');

    return new Response(JSON.stringify({ 
      message: 'Reminder emails processed successfully',
      deadlineReminders: eventsWithDeadlines?.length || 0,
      sevenDayReminders: upcomingEvents?.length || 0,
      tomorrowReminders: tomorrowEvents?.length || 0,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);