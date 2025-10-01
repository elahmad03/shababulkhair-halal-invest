'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInput } from '@/components/inputs/TextInput'; // Your component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// --- Zod Schema for Form Validation ---
// Use a refined schema for validation, not the full Drizzle/Mock schema
const RegisterFormSchema = z.object({
  fullName: z.string().min(3, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
  phoneNumber: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone number format.').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

const defaultValues: RegisterFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
};

export function RegistrationForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues,
  });

  function onSubmit(data: RegisterFormValues) {
    console.log('Registration Data:', data);
    // Here you would typically call your mock API endpoint
    alert(`User ${data.fullName} is registered (mock).`);
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
            Create New Account 🌙
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Email"
                      placeholder="you@example.com"
                      type="email"
                      required
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Password"
                      placeholder="Strong password"
                      type="password"
                      required
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      type="password"
                      required
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Phone Number (Optional) */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Phone Number (Optional)"
                      placeholder="+23480..."
                      type="number"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700">
                Register
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}