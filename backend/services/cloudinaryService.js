const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary if environment variables exist
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const cloudinaryService = {
  isConfigured: () => {
    return Boolean(
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    );
  },

  /**
   * Uploads file buffer (PDF, DOCX, TXT) to Cloudinary
   */
  uploadBuffer: (fileBuffer, originalName, folder = 'intellify_resumes') => {
    return new Promise((resolve, reject) => {
      const sanitizedName = originalName ? originalName.replace(/[^a-zA-Z0-9._-]/g, '_') : 'resume';
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // Auto-detect PDF/DOCX/Media
          use_filename: true,
          unique_filename: true,
          public_id: `${Date.now()}_${sanitizedName}`
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            return reject(error);
          }
          resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },

  /**
   * Uploads local file from path to Cloudinary
   */
  uploadFilePath: async (filePath, folder = 'intellify_resumes') => {
    return cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });
  }
};

module.exports = cloudinaryService;
