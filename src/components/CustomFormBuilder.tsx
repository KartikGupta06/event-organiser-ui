import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
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
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Custom Registration Form</h3>
          <p className="text-sm text-text-secondary">Add additional fields for event registration</p>
        </div>
        <Button onClick={addField} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {value.fields.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-text-secondary">
            No custom fields added. Click "Add Field" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {value.fields.map((field, index) => (
            <Card key={field.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-text-secondary cursor-move" />
                    <CardTitle className="text-sm">{field.label}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === value.fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    >
                      {editingField === field.id ? "Done" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {editingField === field.id && (
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Enter field label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select Dropdown</SelectItem>
                          <SelectItem value="radio">Radio Buttons</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text (optional)"
                    />
                  </div>

                  {(field.type === 'select' || field.type === 'radio') && (
                    <div className="space-y-2">
                      <Label>Options (comma-separated)</Label>
                      <Textarea
                        value={(field.options || []).join(', ')}
                        onChange={(e) => updateField(field.id, { 
                          options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <Label>Required Field</Label>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Preview Section */}
      {value.fields.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <CardDescription>This is how students will see the custom form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {value.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea placeholder={field.placeholder} disabled />
                ) : field.type === 'select' ? (
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" disabled className="h-4 w-4" />
                    <span className="text-sm">{field.placeholder}</span>
                  </div>
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};