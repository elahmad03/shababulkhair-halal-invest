// // components/wallet/FundWallet.tsx
// import { useState } from 'react';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { initializeFunding, verifyFunding } from '@/store/slice/walletSlice';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
// import { useSearchParams } from 'next/navigation';
// import { useEffect } from 'react';

// export const FundWallet = () => {
//   const dispatch = useAppDispatch();
//   const searchParams = useSearchParams();
//   const { funding } = useAppSelector((state) => state.wallet);
//   const [amount, setAmount] = useState('');
//   const [paymentInitialized, setPaymentInitialized] = useState(false);

//   // Check for payment reference in URL (callback from Monnify)
//   useEffect(() => {
//     const reference = searchParams.get('paymentReference');
//     if (reference && !funding.verifiedTransaction) {
//       dispatch(verifyFunding(reference));
//     }
//   }, [searchParams, dispatch, funding.verifiedTransaction]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const numericAmount = parseFloat(amount);
//     if (numericAmount > 0) {
//       dispatch(initializeFunding(numericAmount));
//       setPaymentInitialized(true);
//     }
//   };

//   const handleOpenPayment = () => {
//     if (funding.checkoutUrl) {
//       window.location.href = funding.checkoutUrl;
//     }
//   };

//   if (funding.verifiedTransaction) {
//     return (
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Payment Successful</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Alert>
//             <CheckCircle2 className="h-4 w-4" />
//             <AlertTitle>Transaction Completed</AlertTitle>
//             <AlertDescription>
//               Your wallet has been credited with {funding.verifiedTransaction.amount}
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (paymentInitialized && funding.checkoutUrl) {
//     return (
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Complete Your Payment</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Alert>
//             <Terminal className="h-4 w-4" />
//             <AlertTitle>Redirecting to Payment</AlertTitle>
//             <AlertDescription>
//               You will be redirected to Monnify to complete your payment of {amount}
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//         <CardFooter className="flex justify-between">
//           <Button variant="outline" onClick={() => setPaymentInitialized(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleOpenPayment} disabled={funding.loading}>
//             {funding.loading ? 'Processing...' : 'Proceed to Payment'}
//           </Button>
//         </CardFooter>
//       </Card>
//     );
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>Fund Your Wallet</CardTitle>
//       </CardHeader>
//       <form onSubmit={handleSubmit}>
//         <CardContent className="space-y-4">
//           {funding.error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{funding.error}</AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="amount">Amount (NGN)</Label>
//             <Input
//               id="amount"
//               type="number"
//               min="100"
//               step="100"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="Enter amount to fund"
//               required
//             />
//           </div>
//         </CardContent>
//         <CardFooter>
//           <Button type="submit" className="w-full" disabled={funding.loading}>
//             {funding.loading ? 'Processing...' : 'Continue to Payment'}
//           </Button>
//         </CardFooter>
//       </form>
//     </Card>
//   );
// };