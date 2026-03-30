// src/config/multer.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import crypto from "crypto";

    // Helper to sanitize filenames for Cloudinary public_id
const sanitizeFilename = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

const storage = new CloudinaryStorage({
    cloudinary,
  params: (req, file) => ({
    folder: "bookings",           // folder in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx"],
    resource_type: "auto",        // handles images and raw files
    public_id: `${crypto.randomUUID()}-${sanitizeFilename(file.originalname)}`,
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});