// components/NavBar.tsx
'use client'; // Client Component

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/features/auth/authSlice';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav style={{ background: '#333', padding: '10px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        {isAuthenticated && (
          <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        )}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '10px' }}>Hello, {user?.firstName || user?.email}!</span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}