// app/landing/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-800 text-center py-4 text-sm text-zinc-500">
      &copy; {new Date().getFullYear()} Shababul Khair. All rights reserved.
    </footer>
  );
}
