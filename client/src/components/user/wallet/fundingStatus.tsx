// // components/Wallet/FundingStatus.tsx
// import { useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';

// import { Alert } from '@/components/ui/alert';
// import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
// import { clearFundingError, clearFundingSuccess } from '@/store/slice/walletSlice';

// export const FundingStatus = () => {
//   const { funding } = useAppSelector((state) => state.wallet);
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     return () => {
//       // Clean up when component unmounts
//       dispatch(clearFundingError());
//       dispatch(clearFundingSuccess());
//     };
//   }, [dispatch]);

//   if (funding.verificationLoading) {
//     return (
//       <Alert>
//         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//         Verifying your payment...
//       </Alert>
//     );
//   }

//   if (funding.verifiedTransaction) {
//     return (
//       <Alert variant="success">
//         <CheckCircle2 className="mr-2 h-4 w-4" />
//         Payment successful! Your wallet has been credited.
//       </Alert>
//     );
//   }

//   if (funding.verificationError) {
//     return (
//       <Alert variant="destructive">
//         <XCircle className="mr-2 h-4 w-4" />
//         {funding.verificationError}
//       </Alert>
//     );
//   }

//   return null;
// };