const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// const storage = multer.memoryStorage();

// const upload = multer({ storage });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).fields([
  { name: "images", maxCount: 5 }, // Accepts up to 5 files with the key "images"
  { name: "waiver", maxCount: 1 }, // Accepts 1 file with the key "waiver"
]);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, fileName) => {
  try {
    // const extension = fileName.split(".").pop().toLowerCase();
    // if (extension === "pdf") {
    //   fileName = fileName.replace(/\.pdf$/, ""); // Remove trailing .pdf if it exists
    // }
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: fileName, resource_type: "auto" }, // Automatically detect the file type
        (error, result) => {
          if (error) {
            reject(new Error("Cloudinary upload failed: " + error.message));
          } else {
            resolve(result); // Resolve with the result if the upload is successful
          }
        }
      );

      // Pipe the buffer to the upload stream
      stream.end(fileBuffer); // End the stream and send the buffer
    });

    return result.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
};
