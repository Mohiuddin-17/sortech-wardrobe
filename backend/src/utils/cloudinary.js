const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Every image is stored under wardrobe/<userId>/ so it's easy to see
// (and if ever needed, wipe) one user's uploads without touching others.
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `sortech-wardrobe/${req.user.id}`,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto" }],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per photo keeps the free tier healthy
});

module.exports = { cloudinary, upload };
