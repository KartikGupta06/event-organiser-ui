import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Clock, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface EmailNotification {
  id: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  sent_at: string;
  status: string;
  error_message?: string;
}

export const EmailNotificationsDashboard = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10); // Show top 10 most recent

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching email notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'new_event':
        return 'New Event Broadcast';
      case 'registration_confirmation':
        return 'Registration Ticket';
      case 'event_reminder':
        return 'Event Reminder';
      case 'deadline_reminder':
        return 'Deadline Notice';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/30 gap-1 rounded-lg">
            <CheckCircle2 className="h-3 w-3" />
            <span>Dispatched</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30 gap-1 rounded-lg">
            <AlertTriangle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/30 gap-1 rounded-lg">
            <Clock className="h-3 w-3 animate-spin" />
            <span>Queued</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 rounded-lg">
            <HelpCircle className="h-3 w-3" />
            <span>{status}</span>
          </Badge>
        );
    }
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-text-primary">System Notification Logs</CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Real-time audit trailing of automated dispatch emails sent to active student branches.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-12 text-sm text-text-secondary">
            <Clock className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
            Scanning logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/45 dark:bg-card/45">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-6">Recipient student</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-4">Broadcast Type</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-4">Subject</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-4">Status</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-4">Timestamp</TableHead>
                  <TableHead className="font-semibold text-xs tracking-wider text-text-secondary py-3 px-4">Diagnostics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} className="border-b border-border/40 hover:bg-secondary/20 dark:hover:bg-card/20">
                    <TableCell className="font-medium text-xs text-text-primary py-4 px-6">{notification.recipient_email}</TableCell>
                    <TableCell className="text-xs text-text-primary py-4 px-4 font-semibold">{getEmailTypeLabel(notification.email_type)}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-text-secondary py-4 px-4">{notification.subject}</TableCell>
                    <TableCell className="py-4 px-4">{getStatusBadge(notification.status)}</TableCell>
                    <TableCell className="text-xs text-text-secondary py-4 px-4">
                      {new Date(notification.sent_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-destructive text-xs py-4 px-4 font-mono">
                      {notification.error_message || <span className="text-text-tertiary font-sans">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
                {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-text-tertiary">
                      No automated system emails have been logged.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};