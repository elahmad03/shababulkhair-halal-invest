import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  className?: string;
}

export function TextInput({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  required = false,
  error,
  maxLength,
  className
}: TextInputProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`${error ? "border-red-500 focus:border-red-500" : ""} ${className || ""}`}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}