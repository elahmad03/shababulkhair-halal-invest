// src/lib/types/auth.ts (New file, or a shared types file)

type FieldErrors = {
  email?: string[];
  password?: string[];
  // Add other form fields if they can have errors
};

export interface ServerActionFormState {
  success: boolean;
  message: string | null;
  user?: { // User profile data if login is successful
    id: string;
    email: string;
    name?: string;
  } | null;
  errors?: FieldErrors; // Optional field errors for validation issues
}