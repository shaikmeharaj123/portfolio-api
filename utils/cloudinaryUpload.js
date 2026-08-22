const cloudinary = require("cloudinary").v2;

let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  isConfigured = true;
};

const sanitizeBaseName = (originalName = "download") => {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return baseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "download";
};

const cloudinaryUpload = async (
  fileBuffer,
  folder = "portfolio",
  mimeType = "image/jpeg",
  originalName = ""
) => {
  ensureCloudinaryConfigured();

  const isPdf = mimeType === "application/pdf";
  const safeName = sanitizeBaseName(originalName);

  const uploadOptions = isPdf
    ? {
        folder,
        resource_type: "raw",
        // Raw Cloudinary assets need the extension in public_id.
        public_id: `${safeName}.pdf`,
        unique_filename: false,
        overwrite: true,
      }
    : {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: originalName || undefined,
      };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("[cloudinaryUpload] failed:", error);
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

module.exports = cloudinaryUpload;
