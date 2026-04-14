// "use client";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Image from "next/image";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { fetchKYCStatus } from "@/store/features/user/kycSlice";
// import { RootState, AppDispatch } from "@/store";
// import { FileImage, User } from "lucide-react";

// export default function KYCStatus() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { data, loading, error } = useSelector((state: RootState) => state.kyc);

//   useEffect(() => {
//     dispatch(fetchKYCStatus());
//   }, [dispatch]);

//   // // Debug logging
//   // useEffect(() => {
//   //   if (data) {
//   //     console.log('📋 Full KYC Data:', JSON.stringify(data, null, 2));
//   //     console.log('🖼️ ID Card URL:', data.identity.idCardUrl);
//   //     console.log('🤳 Selfie URL:', data.identity.selfieUrl);
//   //   }
//   // }, [data]);

//   if (loading)
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
//         <span className="ml-2 text-muted-foreground">
//           Loading KYC status...
//         </span>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="text-center p-8">
//         <p className="text-red-500">Error: {error}</p>
//       </div>
//     );

//   if (!data)
//     return (
//       <div className="text-center p-8">
//         <p className="text-muted-foreground">No KYC data found</p>
//       </div>
//     );

//   const getStatusBadge = () => {
//     if (data.identity.verified) return "APPROVED";
//     if (data.identity.hasDocuments) return "PENDING";
//     return "UNVERIFIED";
//   };

//   const status = getStatusBadge();

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold">
//             KYC Verification Status
//           </CardTitle>
//           <Badge
//             variant={
//               status === "APPROVED"
//                 ? "default"
//                 : status === "REJECTED"
//                 ? "destructive"
//                 : "secondary"
//             }
//             className="text-sm mt-2"
//           >
//             {status === "UNVERIFIED" ? "Not Submitted" : status}
//           </Badge>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* NIN Display */}
//           <div className="space-y-2">
//             <p className="font-medium text-sm text-muted-foreground">
//               National Identification Number
//             </p>
//             <p className="text-lg font-mono">
//               {data.identity.nin || "Not provided"}
//             </p>
//           </div>

//           {/* Images Grid */}
//           <div className="grid md:grid-cols-2 gap-6">
//             {/* ID Card */}
//             <div className="space-y-2">
//               <p className="font-medium text-sm text-muted-foreground flex items-center gap-2">
//                 <FileImage size={16} />
//                 ID Card
//               </p>
//               <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-gray-50">
//                 {data.identity.idCardUrl ? (
//                   <Image
//                     src={data.identity.idCardUrl}
//                     alt="ID Card"
//                     fill
//                     className="object-cover"
//                     onError={(e) => {
//                       console.error(
//                         "❌ ID Card image failed to load:",
//                         data.identity.idCardUrl
//                       );
//                     }}
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
//                     <FileImage size={32} className="mb-2" />
//                     <span>No ID Card</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Selfie */}
//             <div className="space-y-2">
//               <p className="font-medium text-sm text-muted-foreground flex items-center gap-2">
//                 <User size={16} />
//                 Selfie
//               </p>
//               <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-gray-50">
//                 {data.identity.selfieUrl ? (
//                   <Image
//                     src={data.identity.selfieUrl}
//                     alt="Selfie"
//                     fill
//                     className="object-cover"
//                     onError={(e) => {
//                       console.error(
//                         "❌ Selfie image failed to load:",
//                         data.identity.selfieUrl
//                       );
//                     }}
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
//                     <User size={32} className="mb-2" />
//                     <span>No Selfie</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Status Information */}
//           <div className="space-y-2">
//             <p className="font-medium text-sm text-muted-foreground">
//               Verification Status
//             </p>
//             <p className="text-lg font-medium">{data.kycStatus}</p>
//           </div>

//           {/* Debug Info - Remove in production */}
//           <details className="text-xs text-gray-500">
//             <summary>Debug Info (Remove in production)</summary>
//             <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
//               {JSON.stringify(data, null, 2)}
//             </pre>
//           </details>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
