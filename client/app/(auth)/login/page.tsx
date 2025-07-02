// app/login/page.tsx
'use client'; // This page is interactive, so it must be a Client Component

// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/loginForm'; // Adjust path if needed
import SimpleLoginForm from '@/components/auth/simpleLoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn Card

export default function LoginPage() {
  return (
    <div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLoginForm/>
        </CardContent>
      </Card>
    </div>
  );
}