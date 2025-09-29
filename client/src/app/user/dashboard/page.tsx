// app/dashboard/page.tsx
'use client'; // This page needs Redux state and potentially redirects, so Client Component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { logout } from '@/src/store/features/auth/authSlice';
import AuthWrapper from '@/src/components/authWrapper'; // For protecting the route
import NavBar from '@/src/components/Navbar'; // A simple navigation bar
import ProfilePictureUpload from '@/src/components/user/profileUpload'; // Your upload component

export default function DashboardPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state
    localStorage.removeItem('token'); // Remove token from localStorage
    router.push('/login'); // Redirect to login
  };

  if (!isAuthenticated) {
    // This case should ideally be handled by AuthWrapper, but good for immediate feedback
    return null; // Or a loading spinner
  }

  return (
    <AuthWrapper> {/* Wrap with AuthWrapper to protect */}
      <NavBar />
      <div style={{ padding: '20px' }}>
        <h1>Welcome to Your Dashboard, {user?.firstName || user?.email}!</h1>
        <p>User Role: {user?.role}</p>
        {user?.profilePicture && (
          <div>
            <p>Your Profile Picture:</p>
            <img src={user.profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        )}
        <button onClick={handleLogout} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
          Logout
        </button>

        <hr style={{ margin: '30px 0' }} />

      </div>
    </AuthWrapper>
  );
}