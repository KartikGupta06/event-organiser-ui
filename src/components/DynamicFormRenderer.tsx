import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormField, FormSchema } from "./CustomFormBuilder";
import { AlertCircle } from "lucide-react";

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
            className={`rounded-xl min-h-[80px] bg-white/50 dark:bg-black/10 border-border/80 focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive focus:ring-destructive/20" : ""}`}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger className={`h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive focus:ring-destructive/20" : ""}`}>
              <SelectValue placeholder={field.placeholder || "Select option..."} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {field.options?.map(option => (
                <SelectItem key={option} value={option} className="rounded-lg">
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
            className={`space-y-2 p-3 bg-secondary/30 dark:bg-card/30 rounded-xl border border-border/50 ${error ? "border-destructive" : ""}`}
          >
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-3 cursor-pointer">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} className="text-primary border-border/80" />
                <Label htmlFor={`${field.id}-${option}`} className="font-medium text-xs text-text-primary cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 p-3 bg-secondary/30 dark:bg-card/30 rounded-xl border border-border/50">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              id={field.id}
              className="rounded-md border-border/85"
            />
            <Label htmlFor={field.id} className="font-semibold text-xs text-text-primary cursor-pointer leading-none">
              {field.placeholder || "Please confirm"}
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
            className={`h-11 rounded-xl bg-white/50 dark:bg-black/10 border-border/80 focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive focus:ring-destructive/20" : ""}`}
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      {schema.fields.map(field => (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors[field.id]}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};