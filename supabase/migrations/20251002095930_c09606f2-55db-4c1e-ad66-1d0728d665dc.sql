-- Extend event_registrations table with student profile snapshot
ALTER TABLE public.event_registrations
ADD COLUMN student_full_name text,
ADD COLUMN student_email text,
ADD COLUMN student_phone text,
ADD COLUMN student_branch text,
ADD COLUMN student_roll_number text,
ADD COLUMN student_academic_year text,
ADD COLUMN additional_data jsonb;

-- Create event_custom_forms table
CREATE TABLE public.event_custom_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  form_schema jsonb NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on event_custom_forms
ALTER TABLE public.event_custom_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_custom_forms
CREATE POLICY "Everyone can view custom forms"
  ON public.event_custom_forms
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert custom forms"
  ON public.event_custom_forms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update custom forms"
  ON public.event_custom_forms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete custom forms"
  ON public.event_custom_forms
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_event_custom_forms_updated_at
  BEFORE UPDATE ON public.event_custom_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();