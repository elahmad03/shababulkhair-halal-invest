"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/auth/countrySelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/index1";
import {
  registerStart,
  registerSuccess,
  registerFailure,
  clearAuthError,
} from "@/store/features/auth/authSlice";
import axios from 'axios';
import { api } from "@/lib/api";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().min(1, "Country code is required"),
  dialCode: z.string().min(1, "Dial code is required"),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
  phone: z.string().regex(/^[0-9]{7,11}$/, "Phone must be 7-11 digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
  confirmPassword: z.string(),
  gender: z.enum(["MALE", "FEMALE"], { required_error: "Gender is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  state: z.string().min(2, "State is required"),
  city: z.string().min(2, "City is required"),
  street: z.string().min(2, "Street is required"),
  postalCode: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const methods = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      countryCode: "",
      dialCode: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: undefined,
      dateOfBirth: undefined,
      state: "",
      city: "",
      street: "",
      postalCode: "",
      termsAccepted: false,
    },
  });

  const { handleSubmit, register, watch, control, formState: { errors, isSubmitting } } = methods;

  const dateOfBirth = watch("dateOfBirth");
  const dialCode = watch("dialCode");

  useEffect(() => {
    if (error) {
      toast.error("Registration failed", { description: error });
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);


const onSubmit = async (data: RegistrationFormValues) => {
  const userData = {
    email: data.email,
    phone: `${data.dialCode}${data.phone}`,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth?.toISOString(),
    currency: data.currency || "NGN",
    occupation: "N/A",
    profilePicture: null,
    address: {
      country: data.country,
      countryCode: data.countryCode,
      state: data.state,
      city: data.city,
      street: data.street,
      postalCode: data.postalCode || "",
    },
    identity: {
      nin: "N/A",
      idCardUrl: "N/A",
      selfieUrl: "N/A",
      verified: false,
    },
    nextOfKin: {
      name: "N/A",
      relationship: "N/A",
      phone: "N/A",
    },
  };

  try {
    const res = await api.post("/auth/register", userData);
    toast.success("Registration successful!", { description: "Redirecting to login..." });
    router.push("/login");
  } catch (err: any) {
    const message = err?.response?.data?.message || err.message || "Registration failed";
    toast.error("Registration failed", { description: message });
  }
};
  return (
    <>
      <div className="space-y-1 text-center mb-6">
        <h2 className="text-3xl font-bold text-primary">
          Create Your Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Join our ethical  platform today.
        </p>
      </div>


      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary-foreground border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className={cn(errors.firstName && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.firstName && (<p className="text-sm text-destructive">{errors.firstName.message}</p>)}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={cn(errors.lastName && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.lastName && (<p className="text-sm text-destructive">{errors.lastName.message}</p>)}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.email && (<p className="text-sm text-destructive">{errors.email.message}</p>)}
            </div>

            <CountrySelect />

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2 items-start">
                <Input
                  type="text"
                  value={dialCode}
                  readOnly
                  className="w-16 text-center bg-muted flex-shrink-0"
                  style={{ minWidth: '4rem' }}
                />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 8012345678"
                  {...register("phone")}
                  maxLength={11}
                  className={cn(
                    "flex-1",
                    errors.phone && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.phone && (<p className="text-sm text-destructive">{errors.phone.message}</p>)}
            </div>

            {/* Gender Selection - NO ROLE SELECTION */}
            <div className="grid gap-1.5">
              <Label>Gender</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                      <RadioGroupItem 
                        value="MALE" 
                        id="male" 
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor="male" 
                        className="flex-1 cursor-pointer font-medium"
                      >
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                      <RadioGroupItem 
                        value="FEMALE" 
                        id="female"
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor="female" 
                        className="flex-1 cursor-pointer font-medium"
                      >
                        Female
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.gender && (<p className="text-sm text-destructive">{errors.gender.message}</p>)}
            </div>

            {/* Date Picker */}
            <div className="grid gap-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.dateOfBirth && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 calendar-custom" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                       
                        captionLayout="dropdown"
                        
                       
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.dateOfBirth && (<p className="text-sm text-destructive">{errors.dateOfBirth.message as string}</p>)}
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold text-secondary-foreground border-b pb-2">Address Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Your State"
                  {...register("state")}
                  className={cn(errors.state && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.state && (<p className="text-sm text-destructive">{errors.state.message}</p>)}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Your City"
                  {...register("city")}
                  className={cn(errors.city && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.city && (<p className="text-sm text-destructive">{errors.city.message}</p>)}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                type="text"
                placeholder="123 Main St"
                {...register("street")}
                className={cn(errors.street && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.street && (<p className="text-sm text-destructive">{errors.street.message}</p>)}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input
                id="postalCode"
                type="text"
                placeholder="12345"
                {...register("postalCode")}
                className={cn(errors.postalCode && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.postalCode && (<p className="text-sm text-destructive">{errors.postalCode.message}</p>)}
            </div>
          </div>

          {/* Security Information Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold text-secondary-foreground border-b pb-2">Account Security</h3>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={cn(errors.password && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.password && (<p className="text-sm text-destructive">{errors.password.message}</p>)}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={cn(errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword.message}</p>)}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-input hover:bg-accent/50 transition-colors">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={cn(
                      "mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                      errors.termsAccepted && "border-destructive"
                    )}
                  />
                )}
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="cursor-pointer font-medium leading-5">
                  I agree to the{" "}
                  <a href="#" className="underline text-primary hover:text-primary/80">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline text-primary hover:text-primary/80">
                    Privacy Policy
                  </a>
                </Label>
                {errors.termsAccepted && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg mt-6 h-12"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </FormProvider>
    </>
  );
}