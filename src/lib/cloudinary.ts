const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  url: string;
  thumbnailUrl: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(
  file: File,
  galleryId: string,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `aperture/galleries/${galleryId}`);

  console.log('galleryId:', galleryId);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Generate optimised URLs via Cloudinary transformations
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const publicId = data.public_id;

  return {
    url: `${baseUrl}/q_auto,f_auto,w_1600/${publicId}`,
    thumbnailUrl: `${baseUrl}/q_auto,f_auto,w_400,c_fill/${publicId}`,
    publicId,
    width: data.width,
    height: data.height,
  };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
