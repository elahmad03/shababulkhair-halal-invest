import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl: string): string | null => {
  if (!cloudinaryUrl) return null;
  
  try {
    // Extract public ID from URL like: https://res.cloudinary.com/dwagxevds/image/upload/v1750810902/shababulkhair/user/1750810882226-IMG_20210313_074816_996.jpg
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after /upload/v{version}/
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Delete image from Cloudinary
export const deleteCloudinaryImage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    const publicId = extractPublicId(imageUrl);
    
    if (!publicId) {
      console.warn('Could not extract public ID from URL:', imageUrl);
      return false;
    }
    
    console.log('🗑️ Deleting Cloudinary image with public ID:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Successfully deleted image:', publicId);
      return true;
    } else {
      console.warn('⚠️ Image deletion result:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting Cloudinary image:', error);
    return false;
  }
};

// Delete multiple images
export const deleteMultipleCloudinaryImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls
    .filter(url => url) // Remove empty/null URLs
    .map(url => deleteCloudinaryImage(url));
  
  await Promise.all(deletePromises);
};