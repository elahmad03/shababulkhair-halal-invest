import { ethers } from "ethers";
import crypto from "crypto";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config(); // load .env

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET!;
if (!ENCRYPTION_SECRET || ENCRYPTION_SECRET.length < 32) {
  throw new Error("ENCRYPTION_SECRET must be set and at least 32 chars long");
}

const IV_LENGTH = 16;

// Encrypt private key
export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_SECRET),
    iv
  );
  let encrypted = cipher.update(privateKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decrypt private key
export function decryptPrivateKey(encryptedKey: string): string {
  const [ivHex, encryptedHex] = encryptedKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_SECRET),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Create Sidra wallet and encrypt private key
export function createAndEncryptWallet() {
  const wallet = ethers.Wallet.createRandom();
  const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

  return {
    address: wallet.address,
    encryptedPrivateKey,
  };
}

// Load ERC20 ABI
const ERC20_ABI_PATH = path.join(__dirname, "erc20Abi.json");
const erc20Abi = JSON.parse(fs.readFileSync(ERC20_ABI_PATH, "utf-8"));

// Send ERC20 Token (e.g., SIDRA token)
export async function sendERC20Token({
  rpcUrl,
  contractAddress,
  to,
  amount,
  encryptedPrivateKey,
}: {
  rpcUrl: string;
  contractAddress: string;
  to: string;
  amount: string; // in decimal (e.g. "1.5")
  encryptedPrivateKey: string;
}) {
  const privateKey = decryptPrivateKey(encryptedPrivateKey);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(contractAddress, erc20Abi, wallet);

  const decimals = await contract.decimals();
  const amountInWei = ethers.parseUnits(amount, decimals);

  const tx = await contract.transfer(to, amountInWei);
  const receipt = await tx.wait();

  return receipt;
}
