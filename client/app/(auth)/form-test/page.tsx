// app/form-page.tsx or your component file
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { CountrySelect } from "@/components/auth/countrySelect"; // Adjust the import path as needed
import { Button } from "@/components/ui/button";

export default function FormPage() {
  const methods = useForm();

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-10">
        <CountrySelect />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
