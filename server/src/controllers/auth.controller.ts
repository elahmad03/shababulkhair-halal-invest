// server/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/hash";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
// Ensure these imports are correct and point to the config.ts where dotenv.config() is
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config"; // JWT_EXPIRES_IN is now typed as string
import { generateUniqueWalletId } from "../utils/wallet";
import { createAndEncryptWallet } from "../utils/cryptoWallet";
// REMOVE THIS LINE: import strict from "assert/strict";

export const registerUser = async (req: Request, res: Response) => {
  const {
    email,
    phone,
    password,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    currency,
    occupation,
    profilePicture,
    identity,
    address,
    nextOfKin,
  } = req.body;

  try {
    // 1. Check for existing email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser)
      return res.status(409).json({ message: "Email or phone already exists" });

    // 2. Hash password
    const hashed = await hashPassword(password);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashed,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        currency,
        occupation: occupation || "",
        profilePicture: profilePicture || "",
        identity: {
          nin: identity?.nin || "",
          idCardUrl: identity?.idCardUrl || "",
          selfieUrl: identity?.selfieUrl || "",
          verified: identity?.verified ?? false,
        },
        address: {
          country: address?.country || "",
          countryCode: address?.countryCode || "",
          state: address?.state || "",
          city: address?.city || "",
          street: address?.street || "",
          postalCode: address?.postalCode || "",
        },
        nextOfKin: {
          name: nextOfKin?.name || "",
          relationship: nextOfKin?.relationship || "",
          phone: nextOfKin?.phone || "",
        },
      },
    });

   const internalWalletId = await generateUniqueWalletId();

const fiatWallet = await prisma.wallet.create({
  data: {
    userId: user.id,
    internalWalletId,
    type: "INTERNAL", // 👈
    balance: 0,
    tier: 0
  },
});


    // 5. Create encrypted crypto wallet (SIDRA)
    const { address: cryptoAddress, encryptedPrivateKey } = createAndEncryptWallet();
    const cryptoWallet = await prisma.cryptoWallet.create({
      data: {
        userId: user.id,
        address: cryptoAddress,
        encryptedPrivateKey,
        network: "sidra-chain",
      },
    });

    // 6. Return all
  // Generate token (same as login)
const payload = { userId: user.id, role: user.role };
const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
const token = jwt.sign(payload, JWT_SECRET as Secret, options);

// 6. Return all with token
return res.status(201).json({
  message: "Registered successfully",
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
  },
});

  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message || error,
    });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log("DEBUG BACKEND: Login attempt for email:", email); // NEW LOG

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("DEBUG BACKEND: User not found for email:", email); // NEW LOG
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("DEBUG BACKEND: User found:", user.id); // NEW LOG

    const match = await comparePassword(password, user.password);
    if (!match) {
      console.log("DEBUG BACKEND: Password mismatch for user:", email); // NEW LOG
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("DEBUG BACKEND: Password matched for user:", user.id); // NEW LOG

    // This check is already enforced in config.ts via the throw, but good as a runtime guard
    if (!JWT_SECRET) {
      console.error("DEBUG BACKEND: JWT_SECRET is not defined, cannot sign token."); // MODIFIED LOG
       res.status(500).json({ message: "Server configuration error" });
       return;
    }

    const secret: Secret = JWT_SECRET;

    // --- DEBUG LOGS (These are good, keep them!) ---
    console.log("DEBUG BACKEND: JWT_SECRET length:", JWT_SECRET.length);
    console.log("DEBUG BACKEND: JWT_EXPIRES_IN value:", JWT_EXPIRES_IN);
    // --- END DEBUG LOGS ---

    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as string,
    };

    const payload = { userId: user.id, role: user.role }; // Capture payload for logging
    console.log("DEBUG BACKEND: JWT Payload:", payload); // NEW LOG
    console.log("DEBUG BACKEND: JWT Options:", options); // NEW LOG

    const token = jwt.sign(
      payload,
      secret,
      options
    );

    console.log("DEBUG BACKEND: JWT token successfully generated for user:", user.id); // NEW LOG

    return res.status(200).json({ message: "Login successful", token, user: { id: user.id, email: user.email, role: user.role } }); // Ensure 'user' is returned here!
  } catch (error: any) {
    console.error("DEBUG BACKEND: Login error caught in try-catch:", error); // MODIFIED LOG
    // More specific error handling for JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid token operation", details: error.message });
    }
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token expired", details: error.message });
    }
    // Generic server error
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message || error,
    });
  }
};

// ... (keep your logoutUser code) ...
export const logoutUser = async (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Logged out successfully" });
};