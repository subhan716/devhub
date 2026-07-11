const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Images (Avatars, Covers, Project Images)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devhub_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

// Storage for Documents (Resumes)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devhub_documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
    resource_type: 'raw',
  },
});

// Storage for Chat Attachments (Auto detects image or raw)
const chatAttachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devhub_chat',
    resource_type: 'auto',
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadDocument = multer({ storage: documentStorage });
const uploadChatAttachment = multer({ storage: chatAttachmentStorage });

module.exports = {
  cloudinary,
  uploadImage,
  uploadDocument,
  uploadChatAttachment
};
