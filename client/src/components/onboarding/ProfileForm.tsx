
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextInput } from '@/components/inputs/TextInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// --- Zod Schema (based on UserProfileSchema) ---
const ProfileSetupSchema = z.object({
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  country: z.string().min(1, 'Country is required.'),
  streetAddress: z.string().min(5, 'Address is required.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State/Region is required.'),
  governmentIdType: z.enum(['national_id', 'passport', 'drivers_license'], { required_error: 'ID type is required.' }),
  governmentIdNumber: z.string().min(5, 'ID number is required.'),
  nextOfKinName: z.string().optional().or(z.literal('')),
  nextOfKinPhoneNumber: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Invalid phone format.').optional().or(z.literal('')),
});

type ProfileSetupValues = z.infer<typeof ProfileSetupSchema>;

// Mock data for Select inputs
const idTypes = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
];
const mockCountries = ['Nigeria', 'Ghana', 'UAE', 'UK'];

export function ProfileSetupForm({ userId }: { userId: number }) { // Pass userId from auth context/query
  const form = useForm<ProfileSetupValues>({
    resolver: zodResolver(ProfileSetupSchema),
    // Default values will likely come from a server call if user is editing
    defaultValues: { country: '', streetAddress: '', city: '', state: '' },
  });

  // ********* API CONNECTION POINT *********
  async function onSubmit(data: ProfileSetupValues) {
    try {
      const payload = { userId, ...data };
      console.log('Submitting profile setup payload:', payload);

      // 2. Mock API call - Replace this with your actual fetch/axios call
      // const response = await fetch(`/api/users/${userId}/profile`, { method: 'POST', body: JSON.stringify(payload) });

      alert('Profile setup complete! Welcome aboard.');
      // router.push('/dashboard');
    } catch (error) {
      console.error('Profile setup failed:', error);
      form.setError('root', { message: 'Profile update failed. Check your inputs.' });
    }
  }
  // ********* END API CONNECTION POINT *********

  return (
    <Card className="w-full max-w-4xl shadow-2xl">
      <CardHeader className="p-6">
        <CardTitle className="text-3xl font-extrabold text-ember-green-700 dark:text-ember-green-500">
          Complete Your Profile (KYC) 🔐
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h3 className="text-xl font-semibold border-b pb-2 text-gray-700 dark:text-gray-300">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Date of Birth *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={`w-full justify-start text-left font-normal ${!field.value && 'text-muted-foreground'} ${fieldState.error ? 'border-red-500' : ''}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              
              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              
              {/* Government ID Type */}
              <FormField
                control={form.control}
                name="governmentIdType"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Government ID Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {idTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Gov ID Number (Full Width) */}
            <FormField
              control={form.control}
              name="governmentIdNumber"
              render={({ field, fieldState }) => (
                <TextInput label="Government ID Number *" placeholder="Enter your ID/Passport number" required {...field} error={fieldState.error?.message} />
              )}
            />

            <h3 className="text-xl font-semibold border-b pb-2 pt-4 text-gray-700 dark:text-gray-300">
              Residential Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field, fieldState }) => (
                  <TextInput label="Street Address *" placeholder="House/Apt No., Street Name" required {...field} error={fieldState.error?.message} />
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <TextInput label="City *" placeholder="City" required {...field} error={fieldState.error?.message} />
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field, fieldState }) => (
                  <TextInput label="State / Region *" placeholder="State or Province" required {...field} error={fieldState.error?.message} />
                )}
              />
            </div>

            <h3 className="text-xl font-semibold border-b pb-2 pt-4 text-gray-700 dark:text-gray-300">
              Next of Kin (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nextOfKinName"
                render={({ field, fieldState }) => (
                  <TextInput label="Next of Kin Name" placeholder="Full name of next of kin" {...field} error={fieldState.error?.message} />
                )}
              />
              <FormField
                control={form.control}
                name="nextOfKinPhoneNumber"
                render={({ field, fieldState }) => (
                  <TextInput label="Next of Kin Phone" placeholder="+234 801..." type="tel" {...field} error={fieldState.error?.message} />
                )}
              />
            </div>

            {form.formState.errors.root && (
                <p className="text-sm text-center text-red-500">{form.formState.errors.root.message}</p>
            )}

            <Button 
              type="submit" 
              className="w-full text-lg py-6 bg-ember-green-700 hover:bg-ember-green-900 dark:bg-ember-green-500 dark:hover:bg-ember-green-700 transition-colors"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving Profile...' : 'Save Profile and Enter App'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}