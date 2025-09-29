// src/lib/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import apiRequest from '@/src/lib/apiRequest';
import { z } from 'zod';
import { ServerActionFormState } from '@/src/lib/types/auth'; // Import the new type

// Define schema for server-side validation (matching client-side is good)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// IMPORTANT: The first argument `prevState` is provided by useFormState
export async function loginAction(
  prevState: ServerActionFormState, // Type the previous state
  formData: FormData
): Promise<ServerActionFormState> { // Type the return value
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Server-side validation with Zod
  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed. Please check your inputs.', // General message for client-side errors
      errors: validationResult.error.flatten().fieldErrors, // Provide detailed errors
      user: null, // Ensure user is null on error
    };
  }

  try {
    const res = await apiRequest.post('/auth/login', validationResult.data);
    const { accessToken, refreshToken, user } = res.data;

    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour for access token
      path: '/',
    });

    if (refreshToken) {
      cookies().set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week for refresh token
        path: '/',
      });
    }

    return { success: true, user: user, message: 'Login successful!' };
  } catch (error: any) {
    console.error('Login Server Action Error:', error.response?.data || error.message);
    // Be careful not to expose too much detail in production
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      user: null, // Ensure user is null on error
      errors: {}, // Ensure errors is an empty object on general API error
    };
  }
}

// ... your logoutAction (should be fine as is, but ensure its return type is also ServerActionFormState or similar if you use useFormState with it)
export async function logoutAction(): Promise<ServerActionFormState> {
  try {
    await apiRequest.post('/auth/logout');
    cookies().delete('accessToken'); // Clear the access token cookie
    cookies().delete('refreshToken'); // Clear refresh token if used
    return { success: true, message: 'Logged out successfully.' };
  } catch (error: any) {
    console.error('Logout Server Action Error:', error);
    return { success: false, message: error.response?.data?.message || 'Logout failed.' };
  }
}