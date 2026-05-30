import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Settings, Eye, ChevronUp, ChevronDown, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'email' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormSchema {
  fields: FormField[];
}

interface CustomFormBuilderProps {
  value: FormSchema;
  onChange: (schema: FormSchema) => void;
}

export const CustomFormBuilder = ({ value, onChange }: CustomFormBuilderProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Form Field",
      type: "text",
      required: false,
      placeholder: "Enter value...",
    };
    
    onChange({
      fields: [...value.fields, newField],
    });
    setEditingField(newField.id);
  };

  const removeField = (fieldId: string) => {
    onChange({
      fields: value.fields.filter(f => f.id !== fieldId),
    });
    if (editingField === fieldId) {
      setEditingField(null);
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange({
      fields: value.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = value.fields.findIndex(f => f.id === fieldId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === value.fields.length - 1)
    ) {
      return;
    }

    const newFields = [...value.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    onChange({ fields: newFields });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Editor Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between p-1 bg-white/40 dark:bg-card/25 backdrop-blur-md rounded-2xl border border-border/50 px-4 py-3">
          <div>
            <h3 className="text-base font-bold text-text-primary">Dynamic Field Builder</h3>
            <p className="text-xs text-text-secondary">Add and customize registration questionnaire forms.</p>
          </div>
          <Button 
            onClick={addField} 
            size="sm" 
            className="bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-semibold h-9 px-4 shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {value.fields.length === 0 ? (
          <Card className="glass-card py-16 text-center border-dashed border-border/80">
            <CardContent className="p-0">
              <Settings className="h-10 w-10 text-text-tertiary mx-auto mb-4 animate-spin-slow" />
              <h4 className="font-bold text-text-primary text-sm mb-1">No custom questions added yet</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Add fields like custom queries, dropdown menus, or checkboxes to request specific participant details.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {value.fields.map((field, index) => (
              <Card key={field.id} className="glass-card overflow-hidden border border-white/60 dark:border-white/5 transition-all">
                <div className="flex items-center justify-between p-4 bg-secondary/20 dark:bg-card/20 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-text-tertiary cursor-move" />
                    <div>
                      <span className="text-xs font-bold text-text-primary">{field.label || "Untitled Field"}</span>
                      <span className="ml-2 text-[9px] uppercase font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                        {field.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === value.fields.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editingField === field.id ? "default" : "secondary"}
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-semibold"
                      onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    >
                      {editingField === field.id ? (
                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Save</span>
                      ) : "Configure"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-text-tertiary"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {editingField === field.id && (
                  <CardContent className="p-5 space-y-4 bg-background/30 border-t border-border/30">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-text-secondary">Field Label Title</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="e.g. T-Shirt Size"
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-text-secondary">Input Controls Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                        >
                          <SelectTrigger className="h-10 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="text">Single Line Text</SelectItem>
                            <SelectItem value="textarea">Multi-Line Textbox</SelectItem>
                            <SelectItem value="email">Email input</SelectItem>
                            <SelectItem value="number">Number value</SelectItem>
                            <SelectItem value="date">Date picker</SelectItem>
                            <SelectItem value="select">Dropdown Options</SelectItem>
                            <SelectItem value="radio">Radio Options</SelectItem>
                            <SelectItem value="checkbox">Single Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-text-secondary">Placeholder Helptext</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="e.g. Choose from options..."
                        className="h-10 rounded-xl"
                      />
                    </div>

                    {(field.type === 'select' || field.type === 'radio') && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-text-secondary">Options (Separated by comma)</Label>
                        <Textarea
                          value={(field.options || []).join(', ')}
                          onChange={(e) => updateField(field.id, { 
                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="e.g. Small, Medium, Large"
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-3 pt-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        id={`req-${field.id}`}
                      />
                      <Label htmlFor={`req-${field.id}`} className="text-xs font-semibold text-text-primary cursor-pointer">
                        Mark this field as mandatory
                      </Label>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Realtime Live Preview Panel */}
      <div className="lg:col-span-5 sticky top-24">
        <Card className="glass-card border border-white/60 dark:border-white/5 shadow-xl">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center space-x-2.5">
              <Eye className="h-4.5 w-4.5 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold text-text-primary">Interactive Live Preview</CardTitle>
                <CardDescription className="text-[10px] text-text-secondary mt-0.5">
                  Visualizing student questionnaire renders in real-time.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {value.fields.length === 0 ? (
              <p className="text-xs text-center text-text-tertiary py-8">
                Visual preview loads automatically once fields are added.
              </p>
            ) : (
              value.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-xs font-semibold text-text-primary">
                    {field.label || "Untitled Field"}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea placeholder={field.placeholder} disabled className="rounded-xl min-h-[60px]" />
                  ) : field.type === 'select' ? (
                    <Select disabled>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder={field.placeholder || "Select option..."} />
                      </SelectTrigger>
                    </Select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-2.5 pt-1">
                      <input type="checkbox" disabled className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 cursor-not-allowed" />
                      <span className="text-xs text-text-secondary">{field.placeholder || "Confirm selection"}</span>
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || ["Option 1", "Option 2"]).map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="radio" disabled className="h-4 w-4 text-primary focus:ring-primary/20 cursor-not-allowed" />
                          <span className="text-xs text-text-secondary">{opt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      disabled
                      className="h-10 rounded-xl bg-background/50"
                    />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};