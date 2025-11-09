'use client'; // Client Component

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading AND not authenticated
    // This prevents flickering during rehydration
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // If still loading (rehydrating), or not authenticated, don't render children yet
  if (loading || !isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        {loading ? 'Loading authentication...' : 'Redirecting to login...'}
      </div>
    );
  }

  return <>{children}</>;
}