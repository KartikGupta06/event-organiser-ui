import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  event_id: string;
  student_id: string;
  student_email: string;
  student_full_name: string | null;
  student_branch: string | null;
  student_roll_number: string | null;
  student_academic_year: string | null;
  marked_at: string;
  marked_by: string;
  status: 'present' | 'absent' | 'late';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAttendance = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('marked_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!eventId || eventId === undefined,
  });

  const markAttendance = useMutation({
    mutationFn: async (attendance: {
      event_id: string;
      student_id: string;
      student_email: string;
      student_full_name?: string;
      student_branch?: string;
      student_roll_number?: string;
      student_academic_year?: string;
      status: 'present' | 'absent' | 'late';
      notes?: string;
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          ...attendance,
          marked_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status?: 'present' | 'absent' | 'late';
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ status, notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Success',
        description: 'Attendance updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update attendance',
        variant: 'destructive',
      });
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Success',
        description: 'Attendance record deleted',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attendance',
        variant: 'destructive',
      });
    },
  });

  return {
    attendanceRecords,
    isLoading,
    markAttendance,
    updateAttendance,
    deleteAttendance,
  };
};

export const useStudentAttendance = () => {
  const { data: myAttendance, isLoading } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*, events(name, deadline)')
        .order('marked_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return { myAttendance, isLoading };
};
