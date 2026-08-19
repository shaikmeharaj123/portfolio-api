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

    const isPdf = mimeType === "application/pdf";
    
    console.log("[cloudinaryUpload] starting upload:", {
      folder,
      mimeType,
      originalName,
      size: fileBuffer?.length,
      resourceType: isPdf ? "raw" : "auto",
    });

    // For PDFs, we need to use a different approach
    let uploadOptions = {
      folder,
      resource_type: isPdf ? "raw" : "auto",
      use_filename: true,
    };

    if (isPdf) {
      // For PDFs, use public_id to control the name
      const baseName = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
      const sanitizedName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
      uploadOptions.public_id = `${folder}/${sanitizedName}`;
      uploadOptions.unique_filename = false;
    } else {
      // For images, allow unique filenames
      uploadOptions.unique_filename = true;
      uploadOptions.filename_override = originalName || undefined;
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
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