import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormField, FormSchema } from "./CustomFormBuilder";

interface DynamicFormRendererProps {
  schema: FormSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export const DynamicFormRenderer = ({ 
  schema, 
  values, 
  onChange,
  errors = {}
}: DynamicFormRendererProps) => {
  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({
      ...values,
      [fieldId]: value,
    });
  };

  const renderField = (field: FormField) => {
    const value = values[field.id] || "";
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-destructive" : ""}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            className={error ? "border-destructive" : ""}
          >
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              id={field.id}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.placeholder}
            </Label>
          </div>
        );

      case 'date':
      case 'email':
      case 'number':
      case 'text':
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-destructive" : ""}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {schema.fields.map(field => (
        <div key={field.id} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-sm text-destructive">{errors[field.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
};