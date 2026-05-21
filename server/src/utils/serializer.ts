/**
 * Serializer utility to handle BigInt values in JSON responses.
 * Prisma returns BigInt for large integer fields, which cannot be serialized to JSON by default.
 * This utility recursively converts BigInt values to strings.
 */

/**
 * Recursively converts BigInt values to strings for JSON serialization.
 * All monetary values (Kobo) and other BigInt fields will be stringified.
 *
 * @param obj - The object to serialize
 * @returns A new object with BigInt values converted to strings
 */
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item));
  }

  const serialized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      serialized[key] = serializeBigInt(obj[key]);
    }
  }

  return serialized;
}
