import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/hooks/useEvents";
import { CustomFormBuilder, type FormSchema } from "@/components/CustomFormBuilder";
import { supabase } from "@/integrations/supabase/client";

const AddEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: "",
    deadline: "",
    registrationLink: "",
  });

  const [customFormEnabled, setCustomFormEnabled] = useState(false);
  const [customFormSchema, setCustomFormSchema] = useState<FormSchema>({ fields: [] });
  const [customFormRequired, setCustomFormRequired] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Event title name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        rules: formData.rules.trim() || null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        registration_link: formData.registrationLink.trim() || null,
        status: "active" as const,
      };

      const { data: eventResult, error } = await createEvent(eventData);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      // If custom form is enabled, save it
      if (customFormEnabled && eventResult && customFormSchema.fields.length > 0) {
        const { error: formError } = await supabase
          .from('event_custom_forms')
          .insert([{
            event_id: eventResult.id,
            form_schema: customFormSchema as any,
            is_required: customFormRequired,
          }]);

        if (formError) {
          console.error('Error saving custom form:', formError);
          toast({
            title: "Warning",
            description: "Event created, but the custom form metadata failed to save.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Event Created successfully!",
        description: "Your new event is now listed live on student catalogs.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Could not publish event.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface pb-16">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header navigation back */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-sm text-text-secondary hover:text-primary transition-all mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to dashboard
          </button>
          
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Publish New Event</h1>
          <p className="text-sm text-text-secondary">Announce a new workspace event, schedule deadlines, and customize registrations.</p>
        </div>

        {/* Core details builder */}
        <Card className="glass-panel border border-white/50 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden mb-10">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center space-x-2.5">
              <Calendar className="h-5 w-5 text-primary animate-float" />
              <div>
                <CardTitle className="text-base font-bold text-text-primary">Event Specifications</CardTitle>
                <CardDescription className="text-xs text-text-secondary mt-0.5">Define core attributes, regulations, and ticket parameters.</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Event Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Event Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Annual Tech Hackathon"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80"
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <Label htmlFor="deadline" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Registration Deadline <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Detailed Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about schedules, venues, and registration incentives..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="rounded-xl min-h-[100px] bg-white/50 dark:bg-black/10 border-border/80 resize-none"
                  required
                />
              </div>

              {/* Rules */}
              <div className="space-y-1.5">
                <Label htmlFor="rules" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Event Regulations & Code of Conduct
                </Label>
                <Textarea
                  id="rules"
                  placeholder="Detail eligibility parameters, team size regulations, etc... (optional)"
                  value={formData.rules}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  className="rounded-xl min-h-[100px] bg-white/50 dark:bg-black/10 border-border/80 resize-none"
                />
              </div>

              {/* Registration Link */}
              <div className="space-y-1.5">
                <Label htmlFor="registrationLink" className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  External Registration Link (Optional)
                </Label>
                <Input
                  id="registrationLink"
                  type="url"
                  placeholder="e.g. https://forms.gle/tech-hackathon"
                  value={formData.registrationLink}
                  onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                  className="h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80"
                />
              </div>

              {/* Custom Form Toggle */}
              <div className="border-t border-border/50 pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/35 dark:bg-card/45 border border-border/80 rounded-2xl">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-text-primary">Enable Custom Questionnaires</Label>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-md">
                      Add custom fields (T-shirt sizes, experience levels, etc.) that student participants must complete.
                    </p>
                  </div>
                  <Switch
                    checked={customFormEnabled}
                    onCheckedChange={setCustomFormEnabled}
                  />
                </div>

                {customFormEnabled && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-3 p-3 bg-secondary/30 dark:bg-card/30 rounded-xl border border-border/50">
                      <Switch
                        checked={customFormRequired}
                        onCheckedChange={setCustomFormRequired}
                        id="custom-req"
                      />
                      <Label htmlFor="custom-req" className="text-xs font-semibold text-text-primary cursor-pointer">
                        Mark the questionnaire as mandatory for enrollment completion.
                      </Label>
                    </div>

                    <CustomFormBuilder
                      value={customFormSchema}
                      onChange={setCustomFormSchema}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl h-11 px-5 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:shadow-glow text-white rounded-xl h-11 px-6 text-xs font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing event...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Publish Event live
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live dynamic preview card displaying real dashboard styling */}
        {(formData.name || formData.description) && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary tracking-tight">Dashboard Card Preview</h3>
            <Card className="glass-card p-6 relative overflow-hidden border border-white/50 dark:border-white/10 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">{formData.name || "Event Title"}</h3>
                    <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed pr-6 line-clamp-2">
                    {formData.description || "Publish event descriptions to welcome student registrations."}
                  </p>
                </div>
              </div>
              
              <div className="h-px bg-border/50 my-5" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2.5 text-xs text-text-secondary">
                  <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span className="font-medium">
                    Deadline: <strong className="text-text-primary">{formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "No deadline specified"}</strong>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddEvent;