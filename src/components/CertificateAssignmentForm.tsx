import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Check, Award, Eye, FileText, Sparkles, Calendar as CalIcon, Loader2 } from 'lucide-react';
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
  const [certificateTemplate, setCertificateTemplate] = useState<'gold' | 'teal' | 'violet'>('gold');
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
        title: 'Error Loading Students',
        description: 'Could not fetch active student accounts.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a standard PDF certificate.',
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
        title: 'Form Incomplete',
        description: 'Please ensure all required fields are filled out.',
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

          // Update certificate with download URL & selected template metadata (stored inside metadata or query)
          const fileName = `${studentId}/${certificate.id}.pdf`;
          const { data: { publicUrl } } = supabase.storage
            .from('certificates')
            .getPublicUrl(fileName);

          // Append our custom template parameter so the UI will know which template to render in browser!
          const premiumUrl = `${publicUrl}?template=${certificateTemplate}`;

          await supabase
            .from('certificates')
            .update({ download_url: premiumUrl })
            .eq('id', certificate.id);
        }
      }

      toast({
        title: 'Certificates Dispatched!',
        description: `Successfully generated and sent ${selectedStudents.length} verified credentials.`,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Dispatch Failed',
        description: err.message || 'An error occurred during certificate generation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateBorder = (tmpl: string) => {
    switch (tmpl) {
      case 'gold': return 'border-amber-400 bg-amber-500/5';
      case 'teal': return 'border-emerald-400 bg-emerald-500/5';
      case 'violet': return 'border-purple-400 bg-purple-500/5';
      default: return 'border-border';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="p-0 pb-6 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-text-primary">Assign Verified Credentials</CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Configure beautiful digital badges and assign PDF claims to active event participants.
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-secondary">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Event Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="event" className="text-xs font-bold uppercase tracking-wider text-text-secondary">Associated Event *</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select completed event" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id} className="rounded-lg">
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type *</Label>
              <Select value={certificateType} onValueChange={(value: 'participation' | 'completion' | 'achievement') => setCertificateType(value)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="participation" className="rounded-lg">Participation Recognition</SelectItem>
                  <SelectItem value="completion" className="rounded-lg">Course Completion</SelectItem>
                  <SelectItem value="achievement" className="rounded-lg">Outstanding Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-text-secondary">
              <Label>Select Student Recipients *</Label>
              <span className="text-[10px] text-primary">{selectedStudents.length} student(s) selected</span>
            </div>
            <div className="border border-border/80 rounded-2xl p-4 max-h-48 overflow-y-auto bg-white/50 dark:bg-black/10 space-y-2">
              {students.map((student) => (
                <div key={student.user_id} className="flex items-center space-x-3 py-1 cursor-pointer">
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
                    className="rounded border-border/80 h-4.5 w-4.5 text-primary focus:ring-primary/20"
                  />
                  <Label htmlFor={student.user_id} className="text-xs font-semibold text-text-primary cursor-pointer leading-none">
                    {student.full_name || student.email}
                  </Label>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-4">No active student profiles registered.</p>
              )}
            </div>
          </div>

          {/* Premium Template Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Choose Plaque Style Template</Label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'gold', name: 'Classic Gold Foil', color: 'border-amber-400 text-amber-500' },
                { id: 'teal', name: 'Modern Mint Teal', color: 'border-emerald-400 text-emerald-500' },
                { id: 'violet', name: 'Royal Violet Star', color: 'border-purple-400 text-purple-500' }
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setCertificateTemplate(tmpl.id as any)}
                  className={`border-2 rounded-2xl p-3 text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 ${
                    certificateTemplate === tmpl.id 
                      ? `${getTemplateBorder(tmpl.id)} ring-2 ring-primary/20 scale-[1.02]` 
                      : 'border-border/60 hover:bg-secondary/40'
                  }`}
                >
                  <Award className={`h-6 w-6 ${tmpl.color}`} />
                  <span className="text-[10px] font-bold text-text-primary">{tmpl.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-text-secondary">Issue Date *</Label>
              <div className="relative">
                <CalIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="file" className="text-xs font-bold uppercase tracking-wider text-text-secondary">Certificate PDF Ticket *</Label>
              <div className="relative border-2 border-dashed border-border/80 rounded-2xl p-6 text-center bg-white/50 dark:bg-black/10 hover:border-primary/40 transition-colors">
                {certificateFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600 truncate max-w-[150px]">{certificateFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => setCertificateFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-6 w-6 text-text-tertiary mx-auto mb-1 animate-float" />
                    <p className="text-xs font-bold text-text-primary">Click to select PDF document</p>
                    <p className="text-[9px] text-text-secondary mt-0.5">Maximum size: 10MB</p>
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-5 text-xs font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:shadow-glow text-white rounded-xl h-11 px-6 text-xs font-bold">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dispatching...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Generate Credentials
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CertificateAssignmentForm;