import prisma from "../prisma/client";

export async function generateUniqueWalletId(): Promise<string> {
  const lastWallet = await prisma.wallet.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { internalWalletId: true }
  });

  const lastNumber = lastWallet?.internalWalletId?.replace('SHABA', '') || '10000';
  const nextNumber = parseInt(lastNumber) + 1;

  return `SHABA${nextNumber}`;
}

export async function generateVirtualAccount(user: { firstName: string; lastName: string }) {
  // Normally, you'd call Moniepoint/Opay API here using Axios/fetch
  // and use your secure API key from environment variables.

  const internalWalletId = await generateUniqueWalletId();

  return {
    accountNumber: `62136${Math.floor(1000 + Math.random() * 9000)}`, // Mocked random acct number
    bankName: 'Moniepoint Microfinance',
    accountName: `${user.firstName} ${user.lastName}`,
    internalWalletId,
    balance: 0,
    tier: 1
  };
}
