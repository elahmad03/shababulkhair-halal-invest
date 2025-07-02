import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken'; // Import Secret type
import { JWT_SECRET } from '../config/config';

// Define a custom interface to extend Express's Request object
// This allows you to add custom properties like 'user' to the request.
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Check for missing or malformed Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Corrected: Use 'res.status().json(); return;' pattern
    res.status(401).json({ message: 'No token provided or malformed header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // 2. Ensure JWT_SECRET is defined
  // You already have JWT_SECRET in config, but a runtime check is good practice
  if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment or config.");
      res.status(500).json({ message: 'Server configuration error' });
      return;
  }

  try {
    // Cast JWT_SECRET to Secret for better type safety with jsonwebtoken
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as { userId: string; role: string };
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (error: any) { // Catch the error to provide specific messages
    if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' });
    } else {
        // Generic error for unexpected issues
        console.error("Authentication error:", error);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
    return; // Stop execution after sending response
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  // Check if user is authenticated at all first
  if (!user) {
    // This case ideally shouldn't happen if authMiddleware runs before isAdmin,
    // but it's good for robustness or if isAdmin is used independently.
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // Check if the user's role is "admin"
  if (user.role !== "admin") {
    res.status(403).json({ message: "Access denied: Insufficient privileges" });
    return;
  }

  next(); // User is an admin, proceed
};