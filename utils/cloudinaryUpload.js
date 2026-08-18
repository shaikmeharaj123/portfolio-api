const cloudinary = require("cloudinary").v2;

let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
};

const cloudinaryUpload = async (
  fileBuffer,
  folder = "portfolio",
  mimeType = "image/jpeg",
  originalName = ""
) => {
  try {
    ensureCloudinaryConfigured();

    console.log("[cloudinaryUpload] starting upload:", {
      folder,
      mimeType,
      originalName,
      size: fileBuffer?.length,
      resourceType: mimeType === "application/pdf" ? "raw" : "auto",
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: mimeType === "application/pdf" ? "raw" : "auto",
          use_filename: true,
          unique_filename: mimeType === "application/pdf" ? false : true,
          filename_override: originalName || undefined,
        },
        (error, uploadedResult) => {
          if (error) {
            console.error("[cloudinaryUpload] cloudinary error:", {
              message: error.message,
              name: error.name,
              http_code: error.http_code,
              stack: error.stack,
            });
            reject(error);
            return;
          }

          console.log("[cloudinaryUpload] upload success:", {
            publicId: uploadedResult?.public_id,
            format: uploadedResult?.format,
            bytes: uploadedResult?.bytes,
            secureUrl: uploadedResult?.secure_url,
          });
          resolve(uploadedResult);
        }
      );

      stream.end(fileBuffer);
    });

    return result;
  } catch (error) {
    console.error("[cloudinaryUpload] failed:", {
      message: error.message,
      stack: error.stack,
      mimeType,
      originalName,
    });
    throw new Error(error.message);
  }
};

module.exports = cloudinaryUpload;
