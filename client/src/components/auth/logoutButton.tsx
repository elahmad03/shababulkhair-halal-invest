// // src/components/auth/LogoutButton.tsx
// 'use client';

// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch } from '@/store/hooks';
// import { logout } from '@/store/features/user/userSlice';
// import { logoutAction } from '@/lib/actions/auth'; // Your server action
// import { useState } from 'react';
// import { toast } from 'sonner';

// export default function LogoutButton() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const [loading, setLoading] = useState(false);

//   const handleLogout = async () => {
//     setLoading(true);
//     try {
//       await logoutAction(); // Call the server action to clear cookie
//       dispatch(logout()); // Clear client-side Redux state
//       router.push('/login'); // Redirect to login page
//     } catch (error) {
//       console.error('Logout failed:', error);
//       toast('Logout failed. Please try again.'); // Or use a toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button onClick={handleLogout} disabled={loading}>
//       {loading ? 'Logging out...' : 'Logout'}
//     </Button>
//   );
// }