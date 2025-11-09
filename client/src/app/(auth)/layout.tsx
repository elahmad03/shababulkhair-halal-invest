// components/layouts/AuthLayout.tsx (or wherever you keep it)
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden"
      // Apply background image and styling
      style={{
        backgroundImage: 'url("/images/auth-background.jpg")', // Path to your background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps background fixed during scroll
      }}
    >
      {/* Overlay for dark/light mode background and gradient */}
      <div className="absolute inset-0 bg-gray-950/70 dark:bg-black/80"></div> {/* Adjust opacity for dark/light mode overlay */}

      {/* Gradient overlay at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2" // Adjust height as needed
        style={{
          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.6) 0%, rgba(16, 185, 129, 0) 100%)', // Ember-like green gradient
          // Using RGBA allows the background image to show through
          // For dark mode, you might want a slightly darker gradient or adjust opacities
        }}
        // You can use conditional classes for dark mode gradient if needed
      //  className="dark:bg-gradient-to-t dark:from-emerald-900/60 dark:to-transparent"
      ></div>

      {/* Content Container - z-index ensures it's above overlays */}
      <div className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-xl p-6 bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow-2xl backdrop-blur-sm align">
        {children}
      </div>
    </div>
  );
}