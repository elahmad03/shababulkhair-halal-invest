export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <main className="max-w-xl mx-auto">{children}</main>
    </div>
  );
}
