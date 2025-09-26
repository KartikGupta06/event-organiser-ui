-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Create RLS policies for certificates bucket
CREATE POLICY "Admins can upload certificates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certificates' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view all certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates' AND 
  auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can update certificates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'certificates' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete certificates" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'certificates' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));