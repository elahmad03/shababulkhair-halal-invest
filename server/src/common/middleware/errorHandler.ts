

import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../../utils/errors"; 
import { env } from "../../config";
import { errorResponse } from "../../utils/response"; 
import { ZodError } from "zod"; 
import { Prisma } from "@prisma/client";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(
      errorResponse(
        "Validation error: Check request data fields.",
        err.issues
      )
    );
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json(errorResponse("A record with this value already exists"));
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json(errorResponse("Record not found"));
      return;
    }

    res.status(400).json(errorResponse("Database request error"));
    return;
  }

  if (err.message === "Not allowed by CORS") {
    res.status(403).json(errorResponse("CORS: Origin not allowed"));
    return;
  }

  const message = "An unexpected server error occurred.";

  const stackTrace =
    env.NODE_ENV === "development" ? { stack: err.stack } : undefined;

  res.status(500).json(
    errorResponse(message, stackTrace)
  );
};