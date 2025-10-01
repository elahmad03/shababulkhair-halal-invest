import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEvent } from "react";

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
}: SelectInputProps) {
  // Create a synthetic event for the onChange handler
  const handleSelectChange = (newValue: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: newValue,
      },
    } as ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger
          className={error ? "border-red-500 focus:border-red-500" : ""}
        >
          <SelectValue
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) =>
            option === "" ? null : (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}