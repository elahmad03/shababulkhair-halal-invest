// // services/paystackReservedAccount.service.ts

// import axios from 'axios';
// import prisma from '../prisma/client';
// import config from '../config/config';
// import {
//   PaystackReservedAccountResponse,
//   PaystackWebhookEvent,
//   PaystackChargeSuccessData,
//   PaystackDedicatedAccountWebhookData,
// } from '../types/paystackVirtual.types'; // Import the new types

// const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// export class PaystackReservedAccountService {
//   private static get headers() {
//     return {
//       Authorization: `Bearer ${config.paystack.secretKey}`,
//       'Content-Type': 'application/json',
//     };
//   }

//   /**
//    * Creates a Paystack Reserved Account (Dedicated Virtual Account) for a user.
//    * This account can receive transfers which will then be credited to the user's wallet.
//    * @param userId The ID of the user for whom to create the reserved account.
//    * @param email The user's email.
//    * @param firstName The user's first name.
//    * @param lastName The user's last name.
//    * @param phone The user's phone number.
//    * @returns The Paystack reserved account details.
//    */
//   static async createReservedAccount(
//     userId: string,
//     email: string,
//     firstName: string,
//     lastName: string,
//     phone: string,
//     nin: string 
//   ): Promise<PaystackReservedAccountResponse['data']> {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { wallet: true, firstName: true, lastName: true, phone: true, email: true , nin: true },
//       });

//       if (!user) {
//         throw new Error('User not found.');
//       }

//       if (user.wallet?.internalWalletId) {
//         throw new Error('User already has a reserved account linked to this wallet.');
//       }

//       // Paystack requires names to be capitalized and phone in international format
//       const customerName = `${firstName} ${lastName}`;

//       const response = await axios.post<PaystackReservedAccountResponse>(
//         `${PAYSTACK_BASE_URL}/dedicated_account`,
//         {
//           customer: {
//             email: email,
//             first_name: firstName,
//             last_name: lastName,
//             phone: phone,
//           },
//           split_code: null, // If you have a split payment setup, specify here
//           preferred_bank: 'providus-bank', // You can specify a preferred bank, e.g., 'wema-bank', 'providus-bank'
//           // Add userId to metadata so you can link incoming transfers back to your user
//           metadata: { userId },
//         },
//         { headers: this.headers },
//       );

//       const { data } = response.data;

//       // Update the user's wallet with the new internalWalletId (Paystack's account number)
//       // If no wallet exists, create one.
//       await prisma.wallet.upsert({
//         where: { userId },
//         update: {
//           internalWalletId: data.account_number,
//           bankName: data.bank_name,
//           bankAccountNumber: data.account_number,
//           type: 'VIRTUAL', // Mark it as a virtual wallet type
//         },
//         create: {
//           userId,
//           internalWalletId: data.account_number,
//           bankName: data.bank_name,
//           bankAccountNumber: data.account_number,
//           type: 'VIRTUAL',
//           balance: 0, // Initial balance
//         },
//       });

//       return data;
//     } catch (error: any) {
//       console.error('Error creating Paystack Reserved Account:', error.response?.data || error.message);
//       throw new Error(`Failed to create reserved account: ${error.response?.data?.message || error.message}`);
//     }
//   }

//   /**
//    * Handles incoming Paystack webhook events, specifically for successful transfers
//    * into reserved accounts (dedicated virtual accounts).
//    * This method should be called by your webhook endpoint.
//    * @param event The Paystack webhook event payload.
//    */
//   static async handleIncomingTransferWebhook(event: PaystackWebhookEvent): Promise<void> {
//     console.log('Received Paystack Webhook Event:', event.event);

//     // Verify the webhook signature for production environments!
//     // (This example omits signature verification for brevity, but it's crucial for security.)
//     // const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(JSON.stringify(event)).digest('hex');
//     // if (hash !== req.headers['x-paystack-signature']) {
//     //   throw new Error('Invalid Paystack webhook signature');
//     // }

//     if (event.event === 'charge.success' || event.event === 'transfer.success') {
//       const data = event.data as PaystackChargeSuccessData; // Assuming it's a charge.success event for incoming funds

//       // Paystack's `charge.success` event covers bank transfers to dedicated accounts.
//       // We look for metadata that confirms it's a transfer to our reserved account.
//       const userId = data.metadata?.userId;
//       const amountInKobo = data.amount;
//       const amountInNaira = amountInKobo / 100;
//       const reference = data.reference;
//       const status = data.status;
//       const channel = data.channel; // Should be 'bank_transfer' for reserved accounts

//       if (!userId) {
//         console.warn(`Paystack Webhook: Missing userId in metadata for reference ${reference}. Cannot process.`);
//         return; // Important: Log and exit if userId is missing
//       }

//       if (status !== 'success') {
//         console.warn(`Paystack Webhook: Transaction ${reference} not successful (status: ${status}).`);
//         return;
//       }

//       // Check if a transaction with this reference already exists to prevent double-crediting
//       const existingTransaction = await prisma.walletTransaction.findUnique({
//         where: { reference },
//       });

//       if (existingTransaction) {
//         console.warn(`Paystack Webhook: Transaction ${reference} already processed.`);
//         return;
//       }

//       // Find the user's wallet using the userId from metadata
//       const wallet = await prisma.wallet.findUnique({
//         where: { userId },
//       });

//       if (!wallet) {
//         console.error(`Paystack Webhook: Wallet not found for userId ${userId}.`);
//         return; // Cannot credit if wallet doesn't exist
//       }

//       // Create a wallet transaction and update the user's wallet balance
//       await prisma.$transaction(async (prisma) => {
//         await prisma.walletTransaction.create({
//           data: {
//             walletId: wallet.id,
//             userId: userId,
//             amount: amountInNaira,
//             type: 'DEPOSIT', // Or FUNDING
//             reference: reference,
//             status: 'SUCCESS',
//             provider: 'PAYSTACK_RESERVED_ACCOUNT',
//             narration: `Funds received via Paystack Reserved Account (${data.dedicated_account || ''} - ${data.customer || ''})`,
//             metadata: JSON.stringify(data),
//           },
//         });

//         await prisma.wallet.update({
//           where: { id: wallet.id },
//           data: { balance: { increment: amountInNaira } },
//         });
//       });

//       console.log(`Successfully credited wallet ${wallet.id} for user ${userId} with ${amountInNaira} NGN (Ref: ${reference})`);
//     } else if (event.event === 'dedicated_account.assign') {
//       // This event is triggered when a dedicated account is successfully assigned to a customer.
//       const data = event.data as PaystackDedicatedAccountWebhookData['data'];
//       const userId = data.metadata?.userId;
//       const accountNumber = data.dedicated_account.account_number;
//       const bankName = data.dedicated_account.bank.name;

//       if (userId) {
//         await prisma.wallet.upsert({
//           where: { userId },
//           update: {
//             internalWalletId: accountNumber,
//             bankName: bankName,
//             bankAccountNumber: accountNumber,
//             type: 'VIRTUAL',
//           },
//           create: {
//             userId,
//             internalWalletId: accountNumber,
//             bankName: bankName,
//             bankAccountNumber: accountNumber,
//             type: 'VIRTUAL',
//             balance: 0,
//           },
//         });
//         console.log(`Dedicated account ${accountNumber} assigned to user ${userId}. Wallet updated.`);
//       } else {
//         console.warn('Dedicated account assigned webhook received without userId in metadata.');
//       }
//     } else {
//       console.log(`Unhandled Paystack webhook event type: ${event.event}`);
//     }
//   }
// }