import winston from "winston";
import "winston-daily-rotate-file";
import  {env}  from "../config"; 

// Fields that should NEVER be printed in plain text in our logs
const SENSITIVE_KEYS = ["password", "token", "passwordHash", "idCardFrontUrl", "idCardBackUrl", "accountNumber"];

// Custom format to mask sensitive data
const redactLogFormat = winston.format((info) => {
  const traverseAndRedact = (obj: any) => {
    Object.keys(obj).forEach((key) => {
      if (SENSITIVE_KEYS.includes(key)) {
        obj[key] = "***REDACTED***";
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        traverseAndRedact(obj[key]);
      }
    });
  };

  if (info.message && typeof info.message === "object") {
    traverseAndRedact(info.message);
  }
  if (info.meta) {
    traverseAndRedact(info.meta);
  }
  return info;
});

// Configure the transport for daily rotated files
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true, // Compress old logs to save space
  maxSize: "20m",      // Rotate if file exceeds 20MB
  maxFiles: "14d",     // Keep logs for 14 days
  level: "info",
});

// Create the actual logger instance
export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    redactLogFormat(),
    winston.format.errors({ stack: true }), // Always capture stack traces
    winston.format.json() // Output as JSON
  ),
  defaultMeta: { service: "shababulkhair-api" },
  transports: [
    fileRotateTransport,
    // Separate file just for critical errors
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
    }),
  ],
});

// If we are in development, print beautifully formatted logs to the console as well
if (env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message} ${info.stack || ""}`
        )
      ),
    })
  );
}