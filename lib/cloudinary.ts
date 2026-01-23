import { v2 as cloudinary } from 'cloudinary'

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables are not set. File uploads will fail.')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export async function uploadToCloudinary(file: File, folder: string = 'baseball-social'): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Determine resource type based on file type
  const isVideo = file.type.startsWith('video/')
  const resourceType = isVideo ? 'video' : 'image'

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        // For videos, add transformation options
        ...(isVideo && {
          eager: [{ format: 'mp4' }],
          eager_async: false,
        }),
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`))
        } else if (!result?.secure_url) {
          reject(new Error('Upload succeeded but no URL returned'))
        } else {
          resolve(result.secure_url)
        }
      }
    ).end(buffer)
  })
}

export { cloudinary }