// import { ethers } from 'ethers';
// import erc20Abi from '../abi/ERC20.json';
// import prisma from '../prisma/client';

// const provider = new ethers.JsonRpcProvider(process.env.SIDRA_RPC_URL);
// const contract = new ethers.ProviderContract(
//   process.env.TOKEN_CONTRACT!,
//   erc20Abi,
//   provider
// );

// export function startTokenListener() {
//   contract.on('Transfer', async (from, to, amount) => {
//     const cw = await prisma.cryptoWallet.findUnique({ where: { address: to } });
//     if (!cw) return;
//     const inc = Number(amount) / 1e18;
//     await prisma.wallet.update({
//       where: { userId: cw.userId },
//       data: { balance: { increment: inc } },
//     });
//   });
// }
