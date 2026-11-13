const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary SDK Config:", {
  cloudName: !!cloudinary.config().cloud_name,
  apiKey: !!cloudinary.config().api_key,
  apiSecret: !!cloudinary.config().api_secret,
});

module.exports = cloudinary;
