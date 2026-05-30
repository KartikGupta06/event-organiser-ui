import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setEmailNotifications(profile.email_notifications ?? true);
      setEventReminders(profile.event_reminders ?? true);
    }
  }, [profile]);

  const updateSetting = async (field: string, value: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', profile?.user_id);

      if (error) throw error;

      await refreshProfile(); // Refresh context state

      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      // Revert the change on error
      if (field === 'email_notifications') {
        setEmailNotifications(!value);
      } else if (field === 'event_reminders') {
        setEventReminders(!value);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your email notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for new events and updates
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => {
              setEmailNotifications(checked);
              updateSetting('email_notifications', checked);
            }}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="event-reminders">Event Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminders about upcoming events and deadlines
            </p>
          </div>
          <Switch
            id="event-reminders"
            checked={eventReminders}
            onCheckedChange={(checked) => {
              setEventReminders(checked);
              updateSetting('event_reminders', checked);
            }}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
