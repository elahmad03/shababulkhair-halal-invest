import Image from "next/image";

import { cn } from "@/lib/utils";

// Put your logo in /public and set its path here (the only line you must edit)
const LOGO_SRC = "/logo.png";

const sizes = {
  sm: { box: "size-10", logo: 20 },
  md: { box: "size-16", logo: 32 },
  lg: { box: "size-24", logo: 48 },
} as const;

const variants = {
  // Covers the whole screen: auth checks, redirects
  page: "flex min-h-svh w-full items-center justify-center bg-background",
  // Fills the content area: a page or card waiting for data
  section: "flex w-full items-center justify-center py-16",
  // Just the mark, so you can place it yourself
  inline: "inline-flex",
} as const;

interface BrandLoaderProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Screen reader text, also shown under the logo when showLabel is true */
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function BrandLoader({
  variant = "section",
  size = "md",
  label = "Loading",
  showLabel = false,
  className,
}: BrandLoaderProps) {
  const { box, logo } = sizes[size];

  return (
    <div role="status" aria-live="polite" className={cn(variants[variant], className)}>
      <div className="flex flex-col items-center gap-3">
        <div className={cn("relative flex items-center justify-center", box)}>
          {/* Spinning ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin motion-reduce:animate-none"
          />
          {/* Logo in the center */}
          <Image
            src={LOGO_SRC}
            alt=""
            width={logo}
            height={logo}
            priority
            className="object-contain motion-safe:animate-pulse"
          />
        </div>

        {showLabel && (
          <p className="text-sm text-muted-foreground">{label}</p>
        )}
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}