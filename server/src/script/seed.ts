import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.cryptoWallet.deleteMany();
  await prisma.userShare.deleteMany();
  await prisma.businessInvestor.deleteMany();
  await prisma.business.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();

  // Create two cycles: one past (closed), one current (open)
 const cycle = await prisma.cycle.create({
  data: {
    name: 'Cycle June 2025',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-30'),
    isOpen: true,
  },
});

  // Seed 5 users with verified KYC and funded wallets
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      return await prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          phone: `0800000000${i + 1}`,
          password: `hashedpassword${i + 1}`,
          firstName: `User${i + 1}`,
          lastName: `Tester`,
          occupation: 'Investor',
          profilePicture: '',
          role: 'USER',
          status: 'ACTIVE',
          tier: 1,
          address: {
            country: 'Nigeria',
            countryCode: 'NG',
            state: 'Lagos',
            city: 'Ikeja',
            street: `No ${i + 1} Halal Lane`,
            postalCode: '100001',
          },
          identity: {
            nin: `234567890${i}`,
            idCardUrl: `https://cdn/id/${i}`,
            selfieUrl: `https://cdn/selfie/${i}`,
            verified: true,
          },
          nextOfKin: {
            name: `Kin ${i + 1}`,
            relationship: 'Brother',
            phone: `0908000000${i + 1}`,
          },
          wallet: {
            create: {
              bankName: 'Moniepoint',
              bankAccountNumber: `01234567${i}`,
              internalWalletId: `INTWAL${i}`,
              balance: 100000 + i * 5000,
              tier: 1,
            },
          },
        },
      });
    })
  );

  console.log(`✅ Seed complete: 5 users, 2 cycles`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
