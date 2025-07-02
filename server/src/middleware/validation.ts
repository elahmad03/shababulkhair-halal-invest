// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, gender, currency, address, nextOfKin } = req.body;

  // Validate firstName
  if (firstName && (typeof firstName !== 'string' || firstName.trim().length < 2)) {
    res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters long'
    });
    return;
  }

  // Validate lastName
  if (lastName && (typeof lastName !== 'string' || lastName.trim().length < 2)) {
    res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters long'
    });
    return;
  }

  // Validate gender
  if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
    res.status(400).json({
      success: false,
      message: 'Gender must be MALE, FEMALE, or OTHER'
    });
    return;
  }

  // Validate address if provided
  if (address) {
    const requiredAddressFields = ['country', 'countryCode', 'state', 'city', 'street'];
    for (const field of requiredAddressFields) {
      if (!address[field] || typeof address[field] !== 'string' || address[field].trim().length === 0) {
        res.status(400).json({
          success: false,
          message: `Address ${field} is required`
        });
        return;
      }
    }
  }

  // Validate nextOfKin if provided
  if (nextOfKin) {
    const requiredKinFields = ['name', 'relationship', 'phone'];
    for (const field of requiredKinFields) {
      if (!nextOfKin[field] || typeof nextOfKin[field] !== 'string' || nextOfKin[field].trim().length === 0) {
        res.status(400).json({
          success: false,
          message: `Next of kin ${field} is required`
        });
        return;
      }
    }
  }

  next();
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Current password is required'
    });
    return;
  }

  if (!newPassword || typeof newPassword !== 'string') {
    res.status(400).json({
      success: false,
      message: 'New password is required'
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

  // Check password complexity
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    res.status(400).json({
      success: false,
      message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
    return;
  }

  next();
};