import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/hooks/useEvents";

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
        description: "Event name is required.",
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

      const { error } = await createEvent(eventData);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Event</h1>
          <p className="text-text-secondary">Add a new event to your organizer dashboard</p>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-text-primary">Event Details</CardTitle>
            </div>
            <CardDescription className="text-text-secondary">
              Fill in the information for your new event
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text-primary">
                    Event Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-border focus:ring-primary"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-text-primary">
                    Registration Deadline <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="border-border focus:ring-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-text-primary">
                  Event Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="border-border focus:ring-primary min-h-[100px] resize-none"
                />
              </div>

              {/* Rules */}
              <div className="space-y-2">
                <Label htmlFor="rules" className="text-text-primary">
                  Event Rules & Guidelines
                </Label>
                <Textarea
                  id="rules"
                  placeholder="Enter event rules and guidelines (optional)"
                  value={formData.rules}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  className="border-border focus:ring-primary min-h-[100px] resize-none"
                />
              </div>

              {/* Registration Link */}
              <div className="space-y-2">
                <Label htmlFor="registrationLink" className="text-text-primary">
                  Registration Link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registrationLink"
                  type="url"
                  placeholder="https://example.com/register"
                  value={formData.registrationLink}
                  onChange={(e) => handleInputChange("registrationLink", e.target.value)}
                  className="border-border focus:ring-primary"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {(formData.name || formData.description) && (
          <Card className="mt-8 border-border shadow">
            <CardHeader>
              <CardTitle className="text-text-primary">Preview</CardTitle>
              <CardDescription className="text-text-secondary">
                This is how your event will appear on the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-text-primary">
                  {formData.name || "Event Name"}
                </h3>
                <p className="text-text-secondary">
                  {formData.description || "Event description will appear here"}
                </p>
                {formData.deadline && (
                  <p className="text-sm text-text-secondary">
                    Deadline: {new Date(formData.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AddEvent;