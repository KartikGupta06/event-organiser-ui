-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_email TEXT NOT NULL,
  student_full_name TEXT,
  student_branch TEXT,
  student_roll_number TEXT,
  student_academic_year TEXT,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  marked_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, student_id)
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their own attendance"
ON public.attendance_records
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all attendance"
ON public.attendance_records
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can insert attendance"
ON public.attendance_records
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update attendance"
ON public.attendance_records
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete attendance"
ON public.attendance_records
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();