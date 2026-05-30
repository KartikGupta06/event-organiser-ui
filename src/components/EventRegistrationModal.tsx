import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, User, Mail, Phone, BookOpen, Fingerprint, Award, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import type { FormSchema } from "./CustomFormBuilder";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  onSuccess: () => void;
}

export const EventRegistrationModal = ({
  open,
  onOpenChange,
  eventId,
  eventName,
  onSuccess,
}: EventRegistrationModalProps) => {
  const { profile, user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [customForm, setCustomForm] = useState<{ schema: FormSchema; required: boolean } | null>(null);
  
  // Profile data (editable)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone_number: profile?.phone_number || "",
    branch: profile?.branch || "",
    roll_number: profile?.roll_number || "",
    academic_year: profile?.academic_year || "",
  });

  // Custom form data
  const [customFormData, setCustomFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Load custom form if exists
  useEffect(() => {
    if (open) {
      loadCustomForm();
      // Reset profile data when modal opens
      setProfileData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone_number: profile?.phone_number || "",
        branch: profile?.branch || "",
        roll_number: profile?.roll_number || "",
        academic_year: profile?.academic_year || "",
      });
      setStep(1);
    }
  }, [open, eventId, profile]);

  const loadCustomForm = async () => {
    try {
      const { data, error } = await supabase
        .from('event_custom_forms')
        .select('form_schema, is_required')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.form_schema) {
        setCustomForm({
          schema: data.form_schema as unknown as FormSchema,
          required: data.is_required,
        });
      } else {
        setCustomForm(null);
      }
    } catch (error) {
      console.error('Error loading custom form:', error);
      setCustomForm(null);
    }
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    
    if (!profileData.full_name.trim()) errors.full_name = "Full name is required";
    if (!profileData.email.trim()) errors.email = "Email is required";
    if (!profileData.phone_number.trim()) errors.phone_number = "Phone number is required";
    if (!profileData.branch.trim()) errors.branch = "Branch is required";
    if (!profileData.roll_number.trim()) errors.roll_number = "Roll number is required";
    if (!profileData.academic_year.trim()) errors.academic_year = "Academic year is required";

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCustomForm = () => {
    if (!customForm) return true;

    const errors: Record<string, string> = {};
    
    customForm.schema.fields.forEach(field => {
      if (field.required && !customFormData[field.id]) {
        errors[field.id] = `${field.label} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateProfile()) return;
      
      // If there's a custom form, go to step 2, otherwise go to confirmation
      if (customForm) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 2) {
      if (!validateCustomForm()) return;
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          student_id: user?.id,
          status: 'registered',
          student_full_name: profileData.full_name,
          student_email: profileData.email,
          student_phone: profileData.phone_number,
          student_branch: profileData.branch,
          student_roll_number: profileData.roll_number,
          student_academic_year: profileData.academic_year,
          additional_data: customForm ? customFormData : null,
        });

      if (error) throw error;

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = customForm ? 3 : 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-white/50 dark:border-white/10 shadow-2xl glass-panel">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Enrollment Wizard</span>
          </div>
          <DialogTitle className="text-2xl font-black text-text-primary tracking-tight">
            Register for {eventName}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Provide the required details to secure your verified student ticket.
          </DialogDescription>

          {/* Premium Progress Bar Indicator */}
          <div className="pt-4 pb-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary mb-2 tracking-wider">
              <span>Progress</span>
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-secondary dark:bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-500 rounded-full" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Profile Verification */}
        {step === 1 && (
          <div className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <AlertDescription className="text-xs text-text-secondary leading-relaxed font-medium">
                Verify your official registration details. You can update any fields directly before completing submission.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Full Student Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.full_name ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.full_name && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Contact Number <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    value={profileData.phone_number}
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.phone_number ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.phone_number && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.phone_number}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Academic Branch <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    value={profileData.branch}
                    placeholder="e.g. Computer Science"
                    onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.branch ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.branch && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.branch}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Roll Registration ID <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    value={profileData.roll_number}
                    placeholder="e.g. CSE-2024-001"
                    onChange={(e) => setProfileData({ ...profileData, roll_number: e.target.value })}
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.roll_number ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.roll_number && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.roll_number}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Academic Year <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
                  <Input
                    value={profileData.academic_year}
                    placeholder="e.g. 3rd Year"
                    onChange={(e) => setProfileData({ ...profileData, academic_year: e.target.value })}
                    className={`pl-11 h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 ${profileErrors.academic_year ? "border-destructive focus:ring-destructive/20" : ""}`}
                  />
                </div>
                {profileErrors.academic_year && (
                  <p className="text-[10px] text-destructive font-medium mt-1">{profileErrors.academic_year}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-5 text-xs font-bold">
                Cancel
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/95 text-white rounded-xl h-11 px-6 text-xs font-bold">
                Continue to Questions
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Custom Questionnaire Form */}
        {step === 2 && customForm && (
          <div className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <AlertDescription className="text-xs text-text-secondary leading-relaxed font-medium">
                This event requires additional registration questionnaires. Please respond to the inquiries below.
              </AlertDescription>
            </Alert>

            <DynamicFormRenderer
              schema={customForm.schema}
              values={customFormData}
              onChange={setCustomFormData}
              errors={formErrors}
            />

            <div className="flex justify-between gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl h-11 px-5 text-xs font-bold">
                Back to Profile
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/95 text-white rounded-xl h-11 px-6 text-xs font-bold">
                Review Registration
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <Alert className="bg-emerald-500/10 border-emerald-500/20 rounded-2xl p-4 flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <AlertDescription className="text-xs text-text-secondary leading-relaxed font-medium">
                Double-check your credentials below. Confirming will secure your entrance ticket to the event.
              </AlertDescription>
            </Alert>

            {/* Premium details plaque card */}
            <div className="p-6 rounded-2xl bg-secondary/30 dark:bg-card/30 border border-border/80 space-y-4">
              <div className="pb-3 border-b border-border/30">
                <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-0.5">Verified Profile Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2.5 text-xs">
                  <div><span className="text-text-secondary font-medium mr-1.5">Name:</span> <strong className="text-text-primary">{profileData.full_name}</strong></div>
                  <div><span className="text-text-secondary font-medium mr-1.5">Email:</span> <strong className="text-text-primary">{profileData.email}</strong></div>
                  <div><span className="text-text-secondary font-medium mr-1.5">Phone:</span> <strong className="text-text-primary">{profileData.phone_number}</strong></div>
                  <div><span className="text-text-secondary font-medium mr-1.5">Branch:</span> <strong className="text-text-primary">{profileData.branch}</strong></div>
                  <div><span className="text-text-secondary font-medium mr-1.5">Roll ID:</span> <strong className="text-text-primary">{profileData.roll_number}</strong></div>
                  <div><span className="text-text-secondary font-medium mr-1.5">Year:</span> <strong className="text-text-primary">{profileData.academic_year}</strong></div>
                </div>
              </div>

              {customForm && Object.keys(customFormData).length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-0.5">Custom Form Inquiries</h4>
                  <div className="space-y-2 mt-2.5 text-xs">
                    {customForm.schema.fields.map(field => (
                      <div key={field.id} className="flex flex-col gap-0.5">
                        <span className="text-text-secondary font-medium">{field.label}:</span>
                        <strong className="text-text-primary">{customFormData[field.id]?.toString() || '—'}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setStep(customForm ? 2 : 1)} className="rounded-xl h-11 px-5 text-xs font-bold">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-primary hover:shadow-glow text-white rounded-xl h-11 px-6 text-xs font-bold">
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Issuing Ticket...
                  </span>
                ) : (
                  "Confirm & Secure Ticket"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};