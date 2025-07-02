// controllers/user.controller.ts
import { Request, Response } from 'express';
import prisma from "../prisma/client";
import bcrypt from 'bcrypt';

// Types for request validation
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  currency?: string;
  occupation?: string;
  address?: {
    country: string;
    countryCode: string;
    state: string;
    city: string;
    street: string;
    postalCode?: string;
  };
  nextOfKin?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        currency: true,
        occupation: true,
        profilePicture: true,
        address: true,
        nextOfKin: true,
        role: true,
        status: true,
        tier: true,
        createdAt: true,
        updatedAt: true,
        identity: {
          select: {
            verified: true,
            nin: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const updateData: UpdateProfileBody = req.body;

    // Validate date format if provided
    if (updateData.dateOfBirth) {
      const date = new Date(updateData.dateOfBirth);
      if (isNaN(date.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format for dateOfBirth'
        });
        return;
      }
    }

    // Build update object
    const dataToUpdate: any = {};
    
    if (updateData.firstName) dataToUpdate.firstName = updateData.firstName.trim();
    if (updateData.lastName) dataToUpdate.lastName = updateData.lastName.trim();
    if (updateData.gender) dataToUpdate.gender = updateData.gender;
    if (updateData.dateOfBirth) dataToUpdate.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.currency) dataToUpdate.currency = updateData.currency;
    if (updateData.occupation) dataToUpdate.occupation = updateData.occupation.trim();
    if (updateData.address) dataToUpdate.address = updateData.address;
    if (updateData.nextOfKin) dataToUpdate.nextOfKin = updateData.nextOfKin;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        currency: true,
        occupation: true,
        profilePicture: true,
        address: true,
        nextOfKin: true,
        updatedAt: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error.message);
    
    if (error.code === 'P2025') {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file || !('path' in req.file)) {
      res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: (req.file as any).path,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        updatedAt: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        imageUrl: (req.file as any).path,
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const { currentPassword, newPassword }: ChangePasswordBody = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
      return;
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Error changing password:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

export const getUserWalletInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;

    const walletInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tier: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            tier: true,
            type: true,
            bankName: true,
            bankAccountNumber: true,
          }
        },
        cryptoWallet: {
          select: {
            id: true,
            address: true,
            network: true,
          }
        },
        userShares: {
          select: {
            shares: true,
            remainingShares: true,
            lockedUntil: true,
            cycle: {
              select: {
                name: true,
                isOpen: true,
              }
            }
          }
        }
      }
    });

    if (!walletInfo) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: walletInfo
    });
  } catch (error: any) {
    console.error('Error fetching wallet info:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet information',
      error: error.message
    });
  }
};

export const deleteUserAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
      return;
    }

    // Verify user and password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        password: true,
        wallet: { select: { balance: true } }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
      return;
    }

    // Check if user has balance
    if (user.wallet && user.wallet.balance > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete account with remaining balance. Please withdraw all funds first.'
      });
      return;
    }

    // Soft delete by updating status
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'BANNED', // or create a DELETED status
        email: `deleted_${userId}@deleted.com`, // Ensure unique constraint
        phone: `deleted_${userId}`,
      }
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting account:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};