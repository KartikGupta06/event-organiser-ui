import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEvents } from '@/hooks/useEvents';
import { useAttendance } from '@/hooks/useAttendance';
import { useEventRegistrations } from '@/hooks/useEventRegistrations';
import { Calendar, Users, CheckCircle, XCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Attendance = () => {
  const { isAdmin, isStudent, profile } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [notes, setNotes] = useState('');

  const { events } = useEvents();
  const { attendanceRecords, isLoading, markAttendance, updateAttendance, deleteAttendance } = useAttendance(selectedEventId || undefined);
  const { registrations } = useEventRegistrations(selectedEventId || undefined);

  const handleMarkAttendance = () => {
    if (!selectedStudent || !selectedEventId) return;

    markAttendance.mutate({
      event_id: selectedEventId,
      student_id: selectedStudent.student_id,
      student_email: selectedStudent.student_email,
      student_full_name: selectedStudent.student_full_name,
      student_branch: selectedStudent.student_branch,
      student_roll_number: selectedStudent.student_roll_number,
      student_academic_year: selectedStudent.student_academic_year,
      status: attendanceStatus,
      notes: notes || undefined,
    });

    setIsMarkDialogOpen(false);
    setSelectedStudent(null);
    setNotes('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      present: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      absent: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      late: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
    };

    const config = variants[status] || variants.present;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  if (isStudent) {
    const myAttendance = attendanceRecords?.filter(record => record.student_id === profile?.user_id);

    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                My Attendance
              </CardTitle>
              <CardDescription>View your attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {!myAttendance || myAttendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {events?.find(e => e.id === record.event_id)?.name || 'Unknown Event'}
                        </TableCell>
                        <TableCell>{format(new Date(record.marked_at), 'PPP')}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to view this page</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const unregisteredStudents = registrations?.filter(
    reg => !attendanceRecords?.find(att => att.student_id === reg.student_id)
  );

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Attendance Management
              </CardTitle>
              <CardDescription>Mark and manage student attendance for events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Select Event</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedEventId && unregisteredStudents && unregisteredStudents.length > 0 && (
                <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Attendance</DialogTitle>
                      <DialogDescription>Select a student and mark their attendance</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Student</Label>
                        <Select onValueChange={(value) => setSelectedStudent(unregisteredStudents.find(s => s.id === value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {unregisteredStudents.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.student_full_name || student.student_email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsMarkDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleMarkAttendance} disabled={!selectedStudent}>
                        Mark Attendance
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {selectedEventId && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  {attendanceRecords?.length || 0} students marked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-8">Loading...</p>
                ) : !attendanceRecords || attendanceRecords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attendance records yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked At</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.student_full_name || '-'}</TableCell>
                          <TableCell>{record.student_email}</TableCell>
                          <TableCell>{record.student_branch || '-'}</TableCell>
                          <TableCell>{record.student_roll_number || '-'}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{format(new Date(record.marked_at), 'PPp')}</TableCell>
                          <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAttendance.mutate(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Attendance;
