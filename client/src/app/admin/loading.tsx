import { BrandLoader } from "@/components/shared/BrandLoader";

 

export default function Loading() {
  return (
    <BrandLoader
      variant="section"
      size="lg"
      showLabel
      label="Loading your portal"
      className="min-h-[60svh]"
    />
  );
}