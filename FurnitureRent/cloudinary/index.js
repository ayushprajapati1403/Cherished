const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Chairished',  // Destination folder in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp']  // Use 'allowed_formats' (snake_case)
    }
});

// Export Cloudinary and Storage
module.exports = {
    cloudinary,
    storage
};