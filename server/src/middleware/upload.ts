// src/middleware/upload.ts

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "shababulkhair/user", // ✅ Pass inside a function return, not directly
    format: "jpg", // or use file.mimetype split logic
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

export const upload = multer({ storage });
