// scripts/cleanupCloudinary.ts
import prisma from '../prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export const cleanupOrphanedImages = async () => {
  try {
    console.log('🧹 Starting Cloudinary cleanup...');

    // Get all users with image URLs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        identity: true
      },
      where: {
        OR: [
          { identity: { path: ['idCardUrl'], not: null } },
          { identity: { path: ['selfieUrl'], not: null } }
        ]
      }
    });

    // Collect all image URLs currently in use
    const activeImageUrls = new Set<string>();
    users.forEach(user => {
      if (user.identity?.idCardUrl) activeImageUrls.add(user.identity.idCardUrl);
      if (user.identity?.selfieUrl) activeImageUrls.add(user.identity.selfieUrl);
    });

    console.log(`📊 Found ${activeImageUrls.size} active images in database`);

    // Get all images from Cloudinary folder
    const cloudinaryImages = await getAllCloudinaryImages('shababulkhair/user');
    
    console.log(`☁️ Found ${cloudinaryImages.length} images in Cloudinary`);

    // Find orphaned images (in Cloudinary but not in database)
    const orphanedImages = cloudinaryImages.filter(img => 
      !activeImageUrls.has(img.secure_url)
    );

    console.log(`🗑️ Found ${orphanedImages.length} orphaned images to delete`);

    // Delete orphaned images
    let deletedCount = 0;
    for (const image of orphanedImages) {
      try {
        const result = await cloudinary.uploader.destroy(image.public_id);
        if (result.result === 'ok') {
          deletedCount++;
          console.log(`✅ Deleted: ${image.public_id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete ${image.public_id}:`, error);
      }
    }

    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} orphaned images`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

const getAllCloudinaryImages = async (folder: string): Promise<CloudinaryResource[]> => {
  let allImages: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by([['created_at', 'desc']])
      .max_results(500)
      .next_cursor(nextCursor)
      .execute();

    allImages = [...allImages, ...result.resources];
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return allImages;
};

// Run the cleanup (uncomment to use)
// cleanupOrphanedImages();