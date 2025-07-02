import { Request, Response } from 'express';
import prisma from "../prisma/client";
import { AuthRequest } from '../middleware/auth';

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file || !('path' in req.file)) {
      res.status(400).json({ message: 'No image uploaded' });
        return;
    }

    const userId = (req as any).user.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: (req.file as any).path,
      },
    });

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      imageUrl: (req.file as any).path,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
