import { ethers } from 'ethers';
import { tokenAbi } from '@/lib/abi/Tokenabi';

export async function getTokenTransfersForWallets({
  rpcUrl,
  contractAddress,
  walletAddresses,
  fromBlock = BigInt(0),
  toBlock = 'latest',
}: {
  rpcUrl: string;
  contractAddress: string;
  walletAddresses: string[];
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
}) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, tokenAbi, provider);

  const lowercaseWallets = walletAddresses.map((addr) => addr.toLowerCase());

  // ✅ Get Transfer topic hash
  const transferEvent = contract.interface.getEvent('Transfer');
  if (!transferEvent) {
    throw new Error("Transfer event not found in contract ABI");
  }
  const transferTopic = transferEvent.topicHash;

  // ✅ Fetch logs
  const logs = await provider.getLogs({
    address: contractAddress,
    fromBlock,
    toBlock,
    topics: [transferTopic],
  });

  const parsedTransfers = logs
    .map((log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (!parsedLog || !parsedLog.args) return null;
        const [from, to, value] = parsedLog.args as unknown as [string, string, bigint];

        const direction = lowercaseWallets.includes(from.toLowerCase())
          ? 'OUT'
          : lowercaseWallets.includes(to.toLowerCase())
          ? 'IN'
          : 'OTHER';

        if (direction === 'OTHER') return null;

        return {
          from,
          to,
          value: Number(ethers.formatUnits(value, 18)).toLocaleString(), // format as readable number
          direction,
          txHash: log.transactionHash,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as {
      from: string;
      to: string;
      value: string;
      direction: 'IN' | 'OUT';
      txHash: string;
    }[];

  return parsedTransfers;
}