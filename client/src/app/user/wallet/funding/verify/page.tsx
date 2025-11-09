// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import {
//   verifyMonnifyFunding,
//   verifyPaystackFunding,
//   fetchWalletBalance,
// } from '@/store/slice/walletSlice';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { Button } from '@/components/ui/button';
// import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

// export default function FundingVerificationPage() {
//   const searchParams = useSearchParams();
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   // 🌐 Handle all types of Paystack/Monnify redirects
//   const paymentReference =
//     searchParams.get('paymentReference') ||
//     searchParams.get('reference') ||
//     searchParams.get('trxref');

//   const provider = (searchParams.get('provider') as 'monnify' | 'paystack') || 'monnify';

//   const [verifying, setVerifying] = useState(true);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [amountFunded, setAmountFunded] = useState<number | null>(null);

//   useEffect(() => {
//     const verify = async () => {
//       if (!paymentReference) return;

//       setVerifying(true);
//       try {
//         const res =
//           provider === 'monnify'
//             ? await dispatch(verifyMonnifyFunding(paymentReference)).unwrap()
//             : await dispatch(verifyPaystackFunding(paymentReference)).unwrap();

//         if (res?.transaction?.amount) {
//           setAmountFunded(res.transaction.amount);
//         }

//         dispatch(fetchWalletBalance());
//       } catch (err: any) {
//         setErrorMessage(err?.message || 'Verification failed');
//       } finally {
//         setVerifying(false);
//       }
//     };

//     verify();
//   }, [dispatch, paymentReference, provider]);

//   const handleGoBack = () => {
//     router.push('/user/wallet');
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
//       <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-6 border border-zinc-200 dark:border-zinc-800">
//         {verifying ? (
//           <>
//             <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
//             <p className="text-lg font-semibold text-muted-foreground">
//               Verifying your {provider} payment...
//             </p>
//           </>
//         ) : errorMessage ? (
//           <>
//             <XCircle className="mx-auto h-10 w-10 text-destructive" />
//             <h2 className="text-xl font-bold text-destructive">Verification Failed</h2>
//             <p className="text-sm text-muted-foreground">{errorMessage}</p>
//             <Button onClick={handleGoBack} variant="outline" className="w-full">
//               Back to Wallet
//             </Button>
//           </>
//         ) : (
//           <>
//             <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
//             <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
//               Payment Verified
//             </h2>
//             <p className="text-sm text-muted-foreground">
//               Your wallet has been funded with ₦{amountFunded?.toLocaleString()}
//             </p>
//             {paymentReference && (
//               <p className="text-xs text-muted-foreground">
//                 Ref: <code>{paymentReference}</code>
//               </p>
//             )}
//             <Button
//               onClick={handleGoBack}
//               className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:brightness-110 transition"
//             >
//               Go to Wallet
//             </Button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page