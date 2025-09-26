import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCertificates } from '@/hooks/useCertificates';
import { useEvents } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface CertificateAssignmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CertificateAssignmentForm: React.FC<CertificateAssignmentFormProps> = ({ onClose, onSuccess }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [certificateType, setCertificateType] = useState<'participation' | 'completion' | 'achievement'>('participation');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { createCertificate, uploadCertificateFile } = useCertificates();
  const { events } = useEvents();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_id')
        .eq('role', 'student');

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || selectedStudents.length === 0 || !certificateFile) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const selectedEventData = events.find(e => e.id === selectedEvent);
      
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.user_id === studentId);
        if (!student) continue;

        // Create certificate record
        const certificateData = {
          name: `${selectedEventData?.name} - ${certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} Certificate`,
          event_name: selectedEventData?.name || '',
          recipient_user_id: studentId,
          recipient_name: student.full_name || student.email,
          certificate_type: certificateType,
          issue_date: issueDate,
        };

        const { data: certificate, error: createError } = await createCertificate(certificateData);
        
        if (createError) throw new Error(createError);

        if (certificate) {
          // Upload certificate file
          const { error: uploadError } = await uploadCertificateFile(
            certificateFile,
            studentId,
            certificate.id
          );

          if (uploadError) throw new Error(uploadError);

          // Update certificate with download URL
          const fileName = `${studentId}/${certificate.id}.pdf`;
          const { data: { publicUrl } } = supabase.storage
            .from('certificates')
            .getPublicUrl(fileName);

          await supabase
            .from('certificates')
            .update({ download_url: publicUrl })
            .eq('id', certificate.id);
        }
      }

      toast({
        title: 'Success',
        description: `Certificate(s) assigned to ${selectedStudents.length} student(s)`,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign certificates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assign Certificate</CardTitle>
            <CardDescription>Assign certificates to students for completed events</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event">Event *</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Students *</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
              {students.map((student) => (
                <div key={student.user_id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={student.user_id}
                    checked={selectedStudents.includes(student.user_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.user_id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.user_id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={student.user_id} className="text-sm">
                    {student.full_name || student.email}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedStudents.length} student(s) selected
            </p>
          </div>

          {/* Certificate Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Certificate Type *</Label>
            <Select value={certificateType} onValueChange={(value: 'participation' | 'completion' | 'achievement') => setCertificateType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Issue Date *</Label>
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Certificate File (PDF) *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {certificateFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-green-600">✓ {certificateFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCertificateFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload certificate PDF</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Certificate'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CertificateAssignmentForm;