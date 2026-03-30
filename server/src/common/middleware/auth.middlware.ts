import { Request, Response, NextFunction } from "express";
import { ITokenPayload, verifyAccessToken } from "../../utils/jwt";
import RedisService from "../../services/redis.service";

export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}

import type { RequestHandler } from "express";

export const authMiddleware: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (decoded.jti) {
      const isRevoked = await RedisService.isTokenJtiBlacklisted(decoded.jti);
      if (isRevoked) {
        res.status(403).json({ message: "Token revoked" });
        return;
      }
    }

    req.user = decoded;

    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export function authorizeRoles(...roles: string[]): RequestHandler {
  return (req: AuthenticatedRequest, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}