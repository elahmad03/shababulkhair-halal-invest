// 'use client';
// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { uploadKYC, clearKYCError, clearKYCSuccess } from '@/store/features/user/kycSlice';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Loader2, Upload, CheckCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import Image from 'next/image';

// const schema = z.object({
//   nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be exactly 11 digits'),
//   idCard: z.any().refine((files) => files?.length > 0, 'ID Card is required'),
//   selfie: z.any().refine((files) => files?.length > 0, 'Selfie is required'),
// });

// type KYCFormType = z.infer<typeof schema>;

// export default function KYCForm() {
//   const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<KYCFormType>({
//     resolver: zodResolver(schema),
//     mode: 'onChange', // Validate on change for better UX
//   });
  
//   const dispatch = useAppDispatch();
//   const { uploadLoading, error, success } = useAppSelector((state) => state.kyc);
  
//   const [preview, setPreview] = useState({
//     idCard: '',
//     selfie: '',
//   });

//   // Watch form values for button state
//   const watchedFields = watch();
//   const hasAllFields = watchedFields.nin && watchedFields.idCard?.length > 0 && watchedFields.selfie?.length > 0;

//   // Handle success/error notifications
//   useEffect(() => {
//     if (success) {
//       toast.success('KYC Uploaded Successfully!', {
//         description: 'Your documents have been submitted for verification.',
//         duration: 5000,
//       });
//       dispatch(clearKYCSuccess());
//     }
//   }, [success, dispatch]);

//   useEffect(() => {
//     if (error) {
//       toast.error('Upload Failed', {
//         description: error,
//         duration: 5000,
//       });
//       dispatch(clearKYCError());
//     }
//   }, [error, dispatch]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idCard' | 'selfie') => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Validate file size (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error('File too large', {
//           description: 'Please select an image smaller than 5MB',
//         });
//         return;
//       }

//       // Validate file type
//       if (!file.type.startsWith('image/')) {
//         toast.error('Invalid file type', {
//           description: 'Please select an image file',
//         });
//         return;
//       }

//       const url = URL.createObjectURL(file);
//       setPreview((prev) => ({ ...prev, [type]: url }));
//     }
//   };

//   const onSubmit = async (data: KYCFormType) => {
//     if (!hasAllFields) {
//       toast.error('Missing Information', {
//         description: 'Please fill in all required fields',
//       });
//       return;
//     }

//     const kycData = {
//       nin: data.nin,
//       idCard: data.idCard[0],
//       selfie: data.selfie[0]
//     };
    
//     try {
//       await dispatch(uploadKYC(kycData)).unwrap();
//     } catch (error) {
//       // Error is handled by useEffect above
//     }
//   };

//   // Clean up preview URLs on unmount
//   useEffect(() => {
//     return () => {
//       if (preview.idCard) URL.revokeObjectURL(preview.idCard);
//       if (preview.selfie) URL.revokeObjectURL(preview.selfie);
//     };
//   }, []);

//   return (
//     <div className="space-y-6 max-w-md mx-auto px-4">
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
//         <p className="text-gray-600 mt-2">Upload your documents to verify your identity</p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* NIN Input */}
//         <div className="space-y-2">
//           <Label htmlFor="nin">National Identification Number (NIN)</Label>
//           <Input 
//             id="nin" 
//             {...register('nin')} 
//             placeholder="Enter your 11-digit NIN"
//             maxLength={11}
//             className={errors.nin ? 'border-red-500' : ''}
//           />
//           {errors.nin && (
//             <p className="text-red-500 text-sm flex items-center gap-1">
//               {errors.nin.message}
//             </p>
//           )}
//         </div>

//         {/* ID Card Upload */}
//         <div className="space-y-2">
//           <Label htmlFor="idCard">Government Issued ID Card</Label>
//           <Input
//             type="file"
//             id="idCard"
//             accept="image/*"
//             {...register('idCard')}
//             onChange={(e) => {
//               register('idCard').onChange(e);
//               handleFileChange(e, 'idCard');
//             }}
//             className={errors.idCard ? 'border-red-500' : ''}
//           />
//           {preview.idCard && (
//             <div className="relative">
//               <Image
//                 src={preview.idCard}
//                 alt="ID Card Preview"
//                 className="rounded-md border shadow-md w-full h-48 object-cover"
//                 width={300}
//                 height={200}
//               />
//               <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
//                 <CheckCircle size={16} />
//               </div>
//             </div>
//           )}
//           {errors.idCard && (
//             <p className="text-red-500 text-sm">{errors.idCard.message}</p>
//           )}
//         </div>

//         {/* Selfie Upload */}
//         <div className="space-y-2">
//           <Label htmlFor="selfie">Selfie with ID Card</Label>
//           <p className="text-sm text-gray-500">Take a clear selfie holding your ID card</p>
//           <Input
//             type="file"
//             id="selfie"
//             accept="image/*"
//             {...register('selfie')}
//             onChange={(e) => {
//               register('selfie').onChange(e);
//               handleFileChange(e, 'selfie');
//             }}
//             className={errors.selfie ? 'border-red-500' : ''}
//           />
//           {preview.selfie && (
//             <div className="relative">
//               <Image
//                 src={preview.selfie}
//                 alt="Selfie Preview"
//                 className="rounded-md border shadow-md w-full h-48 object-cover"
//                 width={300}
//                 height={200}
//               />
//               <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
//                 <CheckCircle size={16} />
//               </div>
//             </div>
//           )}
//           {errors.selfie && (
//             <p className="text-red-500 text-sm">{errors.selfie.message}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <Button 
//           type="submit" 
//           className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3"
//           disabled={uploadLoading || !hasAllFields || !isValid}
//         >
//           {uploadLoading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Uploading Documents...
//             </>
//           ) : (
//             <>
//               <Upload className="mr-2 h-4 w-4" />
//               Submit KYC Documents
//             </>
//           )}
//         </Button>

//         {/* Form Status */}
//         <div className="text-center text-sm text-gray-500">
//           {!hasAllFields && (
//             <p>Please complete all fields to submit</p>
//           )}
//           {hasAllFields && !isValid && (
//             <p>Please fix the errors above</p>
//           )}
//           {hasAllFields && isValid && !uploadLoading && (
//             <p className="text-green-600">Ready to submit</p>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }