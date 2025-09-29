// src/components/auth/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/src/components/ui/button';

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

// FIX: Ensure this is a named export, matching the import in LoginForm.tsx
export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full bg-green-500" disabled={pending || props.disabled} {...props}>
      {pending ? 'Submitting...' : children}
    </Button>
  );
}