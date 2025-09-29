import { Wallet } from 'ethers';
import { encrypt } from './encryption';

export function createAndEncryptWallet() {
  const w = Wallet.createRandom();
  return { address: w.address, encryptedPrivateKey: encrypt(w.privateKey) };
}
