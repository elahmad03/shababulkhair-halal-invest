// // components/wallet/WalletDetails.tsx
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchFullWalletInfo } from "@/store/slice/walletSlice";
// import { useEffect } from "react";

// export const WalletDetails = () => {
//   const dispatch = useAppDispatch();
//   const { wallet, loading, error } = useAppSelector((state) => state.wallet);

//   useEffect(() => {
//     dispatch(fetchFullWalletInfo());
//   }, [dispatch]);

//   const formatBalance = (balance: number | undefined) => {
//     if (balance === undefined) return "---";
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "NGN",
//     }).format(balance);
//   };

//   const getTierBadge = (tier: number | undefined) => {
//     if (!tier) return null;
    
//     const tiers = {
//       1: { label: "Basic", color: "bg-gray-500" },
//       2: { label: "Silver", color: "bg-slate-500" },
//       3: { label: "Gold", color: "bg-yellow-500" },
//       4: { label: "Platinum", color: "bg-purple-500" },
//     };

//     const tierInfo = tiers[tier as keyof typeof tiers] || tiers[1];
//     return <Badge className={`${tierInfo.color} ml-2`}>{tierInfo.label}</Badge>;
//   };

//   if (error) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Wallet Details Error</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-red-500">{error}</p>
//           <Button onClick={() => dispatch(fetchFullWalletInfo())} className="mt-4">
//             Retry
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Wallet Details</CardTitle>
//         <CardDescription>Complete information about your wallet</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="space-y-4">
//             <Skeleton className="h-8 w-full" />
//             <Skeleton className="h-8 w-full" />
//             <Skeleton className="h-8 w-full" />
//           </div>
//         ) : wallet ? (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[200px]">Property</TableHead>
//                 <TableHead>Value</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 <TableCell className="font-medium">Wallet ID</TableCell>
//                 <TableCell>{wallet.internalWalletId}</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium">Balance</TableCell>
//                 <TableCell>{formatBalance(wallet.balance)}</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium">Tier</TableCell>
//                 <TableCell className="flex items-center">
//                   {wallet.tier}
//                   {getTierBadge(wallet.tier)}
//                 </TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium">Bank Name</TableCell>
//                 <TableCell>{wallet.bankName || "Not set"}</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium">Account Number</TableCell>
//                 <TableCell>{wallet.bankAccountNumber || "Not set"}</TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         ) : (
//           <p>No wallet information available</p>
//         )}
//       </CardContent>
//     </Card>
//   );
// };