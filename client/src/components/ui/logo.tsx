// src/components/ui/Logo.tsx
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const height = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;
  const width = size === 'sm' ? 100 : size === 'lg' ? 200 : 150;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Replace '/shababul-khair-logo.svg' with the path to your actual logo */}
      <Image
        src="/client/public/logo.png" 
        alt="Shababul Khair Logo" 
        width={width}
        height={height}
        className="dark:filter dark:invert transition-all duration-300" // Example for dark mode compatibility
      />
      {/* Optional: Text label, if the logo doesn't contain it */}
      <span className="text-xl font-extrabold tracking-wide text-ember-green-700 dark:text-ember-green-500 hidden md:inline">
        Shababul Khair
      </span>
    </div>
  );
}