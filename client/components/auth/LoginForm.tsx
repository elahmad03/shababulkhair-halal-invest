'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/features/auth/authSlice';
import { api } from '@/lib/api';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;

    dispatch(loginStart());

    try {
      const data = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess(data));
      localStorage.setItem('token', data.token);
      router.push('/user/dashboard');
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Login failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
    
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Forgot password */}
      <div className="text-sm text-right">
        <Link href="/forgot-password" className="text-emerald-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={agree}
          onCheckedChange={(checked) => setAgree(!!checked)}
          className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
        />
        <Label htmlFor="terms" className="text-sm leading-snug">
          I agree to the{" "}
          <Link href="/terms" className="underline text-emerald-600 hover:text-emerald-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline text-emerald-600 hover:text-emerald-700">
            Privacy Policy
          </Link>.
        </Label>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !agree}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging in...
          </div>
        ) : (
          'Login'
        )}
      </Button>

      {/* Register link */}
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/register" className="text-emerald-600 font-medium hover:underline">
          Register
        </Link>
      </div>
    </form>
  );
}
