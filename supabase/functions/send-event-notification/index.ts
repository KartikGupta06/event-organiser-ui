import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'new_event' | 'registration_confirmation' | 'event_reminder' | 'deadline_reminder';
  eventId: string;
  eventName: string;
  eventDescription?: string;
  eventDeadline?: string;
  registrationLink?: string;
  recipientEmail?: string;
  recipientUserId?: string;
  daysUntilEvent?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, eventId, eventName, eventDescription, eventDeadline, registrationLink, recipientEmail, recipientUserId, daysUntilEvent }: EmailRequest = await req.json();

    console.log(`Processing email notification: ${type} for event: ${eventName}`);

    let emailData;
    let recipients: string[] = [];

    if (type === 'new_event') {
      // Get all students with email notifications enabled
      const { data: students, error } = await supabase
        .from('profiles')
        .select('email, user_id')
        .eq('role', 'student')
        .eq('email_notifications', true);

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      recipients = students?.map(s => s.email) || [];

      // Check if we already sent this notification
      const { data: existingNotifications } = await supabase
        .from('email_notifications')
        .select('id')
        .eq('email_type', 'new_event')
        .eq('event_id', eventId);

      if (existingNotifications && existingNotifications.length > 0) {
        console.log('New event notification already sent');
        return new Response(JSON.stringify({ message: 'Notification already sent' }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      emailData = {
        subject: `🎉 New Event: ${eventName}`,
        html: generateNewEventEmail(eventName, eventDescription, eventDeadline, registrationLink),
      };

      // Send emails to all students
      for (const email of recipients) {
        await sendEmail(email, emailData, type, eventId);
      }

    } else if (type === 'registration_confirmation' && recipientEmail) {
      emailData = {
        subject: `✅ Registration Confirmed: ${eventName}`,
        html: generateRegistrationConfirmationEmail(eventName, eventDescription, eventDeadline),
      };

      await sendEmail(recipientEmail, emailData, type, eventId, recipientUserId);

    } else if (type === 'event_reminder' && recipientEmail) {
      const daysText = daysUntilEvent === 1 ? 'tomorrow' : `in ${daysUntilEvent} days`;
      emailData = {
        subject: `⏰ Event Reminder: ${eventName} is ${daysText}`,
        html: generateEventReminderEmail(eventName, eventDescription, daysUntilEvent),
      };

      await sendEmail(recipientEmail, emailData, type, eventId, recipientUserId);

    } else if (type === 'deadline_reminder' && recipientEmail) {
      emailData = {
        subject: `⚠️ Last Chance: Registration for ${eventName} closes soon`,
        html: generateDeadlineReminderEmail(eventName, eventDescription, eventDeadline, registrationLink),
      };

      await sendEmail(recipientEmail, emailData, type, eventId, recipientUserId);
    }

    async function sendEmail(email: string, emailData: any, emailType: string, eventId: string, userId?: string) {
      try {
        // Use Resend API directly with fetch
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Events Team <onboarding@resend.dev>',
            to: [email],
            subject: emailData.subject,
            html: emailData.html,
          }),
        });

        if (!response.ok) {
          throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Email sent to ${email}:`, result);

        // Log the email notification
        await supabase
          .from('email_notifications')
          .insert({
            recipient_email: email,
            recipient_user_id: userId,
            email_type: emailType,
            event_id: eventId,
            subject: emailData.subject,
            status: 'sent'
          });

      } catch (error: any) {
        console.error(`Error sending email to ${email}:`, error);
        
        // Log the failed email
        await supabase
          .from('email_notifications')
          .insert({
            recipient_email: email,
            recipient_user_id: userId,
            email_type: emailType,
            event_id: eventId,
            subject: emailData.subject,
            status: 'failed',
            error_message: error.message || String(error)
          });
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Email notifications processed successfully',
      recipientCount: recipients.length || 1
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-event-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function generateNewEventEmail(eventName: string, description?: string, deadline?: string, registrationLink?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb; text-align: center;">🎉 New Event Announcement</h1>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1e40af; margin-top: 0;">${eventName}</h2>
        ${description ? `<p style="color: #64748b; line-height: 1.6;">${description}</p>` : ''}
        
        ${deadline ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #92400e;">Registration Deadline:</strong>
            <span style="color: #b45309;">${new Date(deadline).toLocaleDateString()}</span>
          </div>
        ` : ''}
        
        ${registrationLink ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${registrationLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Register Now
            </a>
          </div>
        ` : ''}
      </div>
      
      <p style="color: #64748b; text-align: center; margin-top: 30px;">
        Don't miss out on this exciting opportunity! 🚀
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        You received this email because you're registered for event notifications.
      </p>
    </div>
  `;
}

function generateRegistrationConfirmationEmail(eventName: string, description?: string, deadline?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #059669; text-align: center;">✅ Registration Confirmed!</h1>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
        <h2 style="color: #065f46; margin-top: 0;">You're registered for: ${eventName}</h2>
        ${description ? `<p style="color: #64748b; line-height: 1.6;">${description}</p>` : ''}
        
        <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong style="color: #166534;">What's next?</strong>
          <ul style="color: #16803d; margin: 10px 0;">
            <li>Save the date in your calendar</li>
            <li>Watch for event reminders</li>
            <li>Prepare any required materials</li>
          </ul>
        </div>
      </div>
      
      <p style="color: #64748b; text-align: center; margin-top: 30px;">
        We're excited to see you there! 🎯
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        You received this email because you registered for this event.
      </p>
    </div>
  `;
}

function generateEventReminderEmail(eventName: string, description?: string, daysUntilEvent?: number): string {
  const timeText = daysUntilEvent === 1 ? 'tomorrow!' : `in ${daysUntilEvent} days!`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; text-align: center;">⏰ Event Reminder</h1>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h2 style="color: #991b1b; margin-top: 0;">${eventName} is ${timeText}</h2>
        ${description ? `<p style="color: #64748b; line-height: 1.6;">${description}</p>` : ''}
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong style="color: #991b1b;">Don't forget to:</strong>
          <ul style="color: #b91c1c; margin: 10px 0;">
            <li>Set a reminder on your phone</li>
            <li>Prepare any materials needed</li>
            <li>Plan your route/connection details</li>
          </ul>
        </div>
      </div>
      
      <p style="color: #64748b; text-align: center; margin-top: 30px;">
        Looking forward to seeing you soon! 🌟
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        You received this email because you're registered for this event.
      </p>
    </div>
  `;
}

function generateDeadlineReminderEmail(eventName: string, description?: string, deadline?: string, registrationLink?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #ea580c; text-align: center;">⚠️ Last Chance!</h1>
      
      <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
        <h2 style="color: #c2410c; margin-top: 0;">Registration for ${eventName} closes soon!</h2>
        ${description ? `<p style="color: #64748b; line-height: 1.6;">${description}</p>` : ''}
        
        ${deadline ? `
          <div style="background-color: #fed7aa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #c2410c;">Deadline:</strong>
            <span style="color: #ea580c; font-size: 18px; font-weight: bold;">${new Date(deadline).toLocaleDateString()}</span>
          </div>
        ` : ''}
        
        ${registrationLink ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${registrationLink}" 
               style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Register Now - Don't Miss Out!
            </a>
          </div>
        ` : ''}
      </div>
      
      <p style="color: #64748b; text-align: center; margin-top: 30px;">
        This is your last chance to join us! ⏰
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        You received this email because you have event notifications enabled.
      </p>
    </div>
  `;
}

serve(handler);