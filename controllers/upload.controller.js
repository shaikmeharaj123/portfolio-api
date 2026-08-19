const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const cloudinaryUpload = require("../utils/cloudinaryUpload.js");

const buildDownloadUrl = (url, originalName) => {
  if (!url) return url;
  
  // For PDFs, create a forced download URL
  const isPdf = originalName?.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    // Extract the public ID from the URL
    const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)\./);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      const encodedName = encodeURIComponent(originalName);
      // Create download URL with proper flags
      return url.replace(
        '/upload/',
        `/upload/fl_attachment:${encodedName}/`
      );
    }
  }
  
  return url;
};

exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a file");
  }

  const folder = req.body.folder || "portfolio";
  const originalName = req.file.originalname || "download";
  console.log("[uploadSingle] incoming file:", {
    originalName,
    mimetype: req.file.mimetype,
    size: req.file.size,
    folder,
  });

  const result = await cloudinaryUpload(
    req.file.buffer,
    folder,
    req.file.mimetype,
    originalName
  );
  const downloadUrl =
    req.file.mimetype === "application/pdf"
      ? buildDownloadUrl(result.secure_url, originalName)
      : result.secure_url;

  res.status(200).json(
    new ApiResponse(200, "File uploaded successfully", {
      url: result.secure_url,
      downloadUrl,
      originalName,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    })
  );
});

exports.uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one file");
  }

  const folder = req.body.folder || "portfolio";
  console.log("[uploadMultiple] incoming files:", req.files.map((file) => ({
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  })));
  
  const uploadPromises = req.files.map((file) =>
    cloudinaryUpload(file.buffer, folder, file.mimetype, file.originalname)
  );

  const results = await Promise.all(uploadPromises);

  const uploadedFiles = results.map((result, index) => {
    const file = req.files[index];
    const originalName = file.originalname || "download";
    return {
      url: result.secure_url,
      downloadUrl:
        file.mimetype === "application/pdf"
          ? buildDownloadUrl(result.secure_url, originalName)
          : result.secure_url,
      originalName,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  });

  res.status(200).json(
    new ApiResponse(200, "Files uploaded successfully", uploadedFiles)
  );
});
