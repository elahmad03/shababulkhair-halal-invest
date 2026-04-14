// Base AppError for all custom errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// Common HTTP errors
export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}
export class ValidationError extends AppError {
  constructor(message = "Validation Error") {
    super(message, 422);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class WalletErrors {
  static keyMismatch(): ConflictError {
    return new ConflictError(
      "Idempotency key was previously used for a different endpoint. Generate a new UUID v4 for each unique operation.",
    );
  }

  static requestInFlight(): ConflictError {
    return new ConflictError(
      "A request with this idempotency key is already being processed. Retry after 1–3 seconds.",
    );
  }
}