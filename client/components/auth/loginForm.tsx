'use client'; // This directive must be the very first line

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useActionState } from 'react'; // Correct import for React 19

import { useAppDispatch } from '@/store/hooks'; // Ensure 'export' is in hooks.ts
import { loginSuccess } from '@/store/features/user/userSlice';
import { loginAction } from '@/lib/actions/auth'; // Ensure 'export' is in auth.ts
import { ServerActionFormState } from '@/lib/types/auth'; // Ensure this type is correct

// Shadcn UI components (Adjust paths if different)
import { Input } from '@/components/ui/input';
// No direct import of Button here, as SubmitButton uses it
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// The SubmitButton component (Ensure 'export' is in SubmitButton.tsx)
import { SubmitButton } from './submitButton';

// Define the Zod schema for validation
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }).min(1, 'Email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').min(1, 'Password is required.'),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Define the initial state for useActionState explicitly
  const initialFormState: ServerActionFormState = {
    success: false,
    message: null,
    user: null,
    errors: {},
  };

  // useActionState for handling form state and errors from server actions.
  // The 'loginAction' will be called when the form is submitted via its 'action' prop.
  const [state, formAction] = useActionState(loginAction, initialFormState);

  // Initialize useForm with zodResolver for client-side validation
  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    // Important for managing errors from both client and server
    shouldUnregister: false,
    shouldFocusError: true, // Focus on the first invalid field
  });

  // Use a ref to access the form's DOM element if needed (e.g., for direct submission)
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * This is the wrapper function called by the native <form action={...}> prop.
   * It performs client-side validation with react-hook-form first.
   * If client-side validation passes, it then triggers the useActionState-managed server action.
   */
  const handleFormAction = async (formData: FormData) => {
    // Manually trigger react-hook-form validation
    // This is asynchronous, so we await it.
    const isValid = await form.trigger();

    if (!isValid) {
      // If client-side validation fails, do NOT proceed with the server action.
      // react-hook-form will display the errors automatically via FormMessage.
      return; // Stop here.
    }

    // If client-side validation passes, then explicitly call the formAction.
    // Because handleFormAction is directly assigned to the form's 'action' prop,
    // this call to 'formAction(formData)' is correctly wrapped in a React transition.
    // THIS IS THE LINE THAT WAS CAUSING THE ERROR WHEN CALLED OUTSIDE THE TRANSITION.
    // Here, it IS inside the transition triggered by the native form submission.
    formAction(formData);
  };

  // useEffect to react to the state changes from the server action
  useEffect(() => {
    // Handle successful login
    if (state.success && state.user) {
      dispatch(loginSuccess({ profile: state.user }));
      router.push('/dashboard');
      form.reset(); // Optionally reset the form on success
    }

    // Handle general server errors (e.g., "Login failed. Check credentials.")
    // This message is for errors not tied to a specific field, and is shown if no specific field errors exist.
    if (!state.success && state.message && !state.errors) {
      console.error('Server general error:', state.message); // For debugging
      // You might want to display this in a toast or dedicated general error area in the UI
    }

    // Apply server-side field-specific errors to React Hook Form
    // This makes FormMessage component display them automatically.
    if (!state.success && state.errors && Object.keys(state.errors).length > 0) {
      // Clear all existing RHF errors first to avoid stale errors from previous attempts
      form.clearErrors();
      for (const field in state.errors) {
        if (Object.prototype.hasOwnProperty.call(state.errors, field)) {
          const messages = state.errors[field as keyof typeof state.errors];
          if (messages && messages.length > 0) {
            form.setError(field as keyof LoginFormInputs, {
              type: 'server',
              message: messages[0], // Display the first message for that field
            });
          }
        }
      }
    }
  }, [state, dispatch, router, form]); // Ensure 'form' is in dependency array

  return (
    <Form {...form}>
      {/*
        THIS IS THE MOST CRUCIAL PART:
        The `action` prop on the native <form> element is now set to `handleFormAction`.
        This is how useActionState is designed to work directly with native forms.
        There MUST NOT be an `onSubmit` prop here if you want `useActionState` to function correctly.
      */}
      <form ref={formRef} action={handleFormAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email" // This name is used by RHF AND by the native FormData
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                {/* Ensure the `name` prop is explicitly passed to the <Input> for FormData */}
                <Input placeholder="name@example.com" {...field} name={field.name} />
              </FormControl>
              {/* FormMessage displays client-side errors and server-side errors set by form.setError */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password" // This name is used by RHF AND by the native FormData
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                {/* Ensure the `name` prop is explicitly passed to the <Input> for FormData */}
                <Input type="password" placeholder="********" {...field} name={field.name} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display general (non-field-specific) API error message from the server action */}
        {/* Only show if there's a message, it's not a success, and there are no specific field errors */}
        {state.message && !state.success && !state.errors && (
          <p className="text-destructive text-sm text-center">{state.message}</p>
        )}

        {/* SubmitButton internally uses useFormStatus, which now works correctly
            because the form's `action` prop directly triggers the useActionState flow. */}
        <SubmitButton>Login</SubmitButton>
      </form>
    </Form>
  );
}