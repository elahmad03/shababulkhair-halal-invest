// controllers/kycUpload.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';

export const uploadKYCFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { nin } = req.body; // Get NIN from form data
    
    console.log('🔐 User ID from token:', userId);
    console.log('📋 NIN from body:', nin);

    if (!userId) {
      console.warn('❌ Unauthorized: No userId');
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    if (!nin || nin.trim().length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'NIN is required' 
      });
      return;
    }

    const files = req.files as {
      idCard?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    };

    console.log('📂 Received files:', {
      idCard: files?.idCard?.[0]?.originalname,
      selfie: files?.selfie?.[0]?.originalname,
    });

    if (!files?.idCard || !files?.selfie) {
      console.warn('❌ Missing files:', {
        hasIdCard: !!files?.idCard,
        hasSelfie: !!files?.selfie,
      });
      res.status(400).json({ 
        success: false, 
        message: 'Both ID Card and Selfie are required.' 
      });
      return;
    }

    const idCardUrl = files.idCard[0]?.path;
    const selfieUrl = files.selfie[0]?.path;

    console.log('✅ File paths extracted:', { idCardUrl, selfieUrl });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        identity: {
          nin: nin.trim(),
          idCardUrl,
          selfieUrl,
          verified: false,
        },
      },
      select: {
        id: true,
        identity: true,
        updatedAt: true,
      }
    });

    console.log('✅ User KYC updated in DB');

    res.status(200).json({ 
      success: true,
      message: 'KYC uploaded successfully', 
      data: {
        identity: updatedUser.identity,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err: any) {
    console.error('❌ KYC Upload Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: err.message 
    });
  }
};

export const getKYCStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        identity: true,
        status: true,
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
      message: 'KYC status retrieved successfully',
      data: {
        kycStatus: user.identity.verified ? 'VERIFIED' : 'PENDING',
        identity: {
          verified: user.identity.verified,
          hasDocuments: !!(user.identity.idCardUrl && user.identity.selfieUrl),
          nin: user.identity.nin ? 
            user.identity.nin.substring(0, 3) + '****' + user.identity.nin.substring(user.identity.nin.length - 3) : 
            null,
          // Add the full image URLs
          idCardUrl: user.identity.idCardUrl,
          selfieUrl: user.identity.selfieUrl
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching KYC status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC status',
      error: error.message
    });
  }
};
