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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

  const getProgress = () => {
    const totalSteps = customForm ? 3 : 2;
    return `Step ${step} of ${totalSteps}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {eventName}</DialogTitle>
          <DialogDescription>{getProgress()}</DialogDescription>
        </DialogHeader>

        {/* Step 1: Profile Verification */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please verify your details. You can edit them if needed.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className={profileErrors.full_name ? "border-destructive" : ""}
                />
                {profileErrors.full_name && (
                  <p className="text-sm text-destructive">{profileErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={profileErrors.email ? "border-destructive" : ""}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  className={profileErrors.phone_number ? "border-destructive" : ""}
                />
                {profileErrors.phone_number && (
                  <p className="text-sm text-destructive">{profileErrors.phone_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Branch <span className="text-destructive">*</span></Label>
                <Input
                  value={profileData.branch}
                  onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                  className={profileErrors.branch ? "border-destructive" : ""}
                />
                {profileErrors.branch && (
                  <p className="text-sm text-destructive">{profileErrors.branch}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Roll Number <span className="text-destructive">*</span></Label>
                <Input
                  value={profileData.roll_number}
                  onChange={(e) => setProfileData({ ...profileData, roll_number: e.target.value })}
                  className={profileErrors.roll_number ? "border-destructive" : ""}
                />
                {profileErrors.roll_number && (
                  <p className="text-sm text-destructive">{profileErrors.roll_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Academic Year <span className="text-destructive">*</span></Label>
                <Input
                  value={profileData.academic_year}
                  onChange={(e) => setProfileData({ ...profileData, academic_year: e.target.value })}
                  className={profileErrors.academic_year ? "border-destructive" : ""}
                />
                {profileErrors.academic_year && (
                  <p className="text-sm text-destructive">{profileErrors.academic_year}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Custom Form */}
        {step === 2 && customForm && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This event requires additional information. Please fill out the form below.
              </AlertDescription>
            </Alert>

            <DynamicFormRenderer
              schema={customForm.schema}
              values={customFormData}
              onChange={setCustomFormData}
              errors={formErrors}
            />

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                Please review your registration details before submitting.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-text-secondary">Name:</span> {profileData.full_name}</div>
                <div><span className="text-text-secondary">Email:</span> {profileData.email}</div>
                <div><span className="text-text-secondary">Phone:</span> {profileData.phone_number}</div>
                <div><span className="text-text-secondary">Branch:</span> {profileData.branch}</div>
                <div><span className="text-text-secondary">Roll Number:</span> {profileData.roll_number}</div>
                <div><span className="text-text-secondary">Year:</span> {profileData.academic_year}</div>
              </div>
            </div>

            {customForm && Object.keys(customFormData).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  {customForm.schema.fields.map(field => (
                    <div key={field.id}>
                      <span className="text-text-secondary">{field.label}:</span>{' '}
                      {customFormData[field.id]?.toString() || 'N/A'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(customForm ? 2 : 1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};