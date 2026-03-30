import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config";


// Define a custom interface for our application's JWT payload.
// Extending JwtPayload ensures we include standard claims like 'exp' and 'iat' automatically.
export interface ITokenPayload extends JwtPayload {
  userId: string;
  role: string;
  jti?: string; // JTI (JWT ID) is optional but critical for token rotation and invalidation.
}

/**
 * Signs a new access token.
 * Access tokens are short-lived and should contain only the essential information
 * required to authorize a request.
 *
 * @param payload - The data to include in the token. Must conform to ITokenPayload.
 * @returns The signed JWT string.
 */
export const signAccessToken = (payload: ITokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_ACCESS_TOKEN_SECRET, options);
};

/**
 * Signs a new refresh token.
 * Refresh tokens are long-lived and are used to obtain new access tokens.
 * They should include a unique identifier (JTI) for tracking and invalidation.
 *
 * @param payload - The data to include in the token. Must conform to ITokenPayload.
 * @returns The signed JWT string.
 */
export const signRefreshToken = (payload: ITokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, options);
};

/**
 * Verifies an access token and returns its decoded payload.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded payload, typed as ITokenPayload.
 * @throws {Error} if the token is invalid or expired.
 */
export function verifyAccessToken(token: string): ITokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET!);
  return payload as ITokenPayload;
}

/**
 * Verifies a refresh token and returns its decoded payload.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded payload, typed as ITokenPayload.
 * @throws {Error} if the token is invalid or expired.
 */
export function verifyRefreshToken(token: string): ITokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET!);
  return payload as ITokenPayload;
}