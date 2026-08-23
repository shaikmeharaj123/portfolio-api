const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const cloudinaryUpload = require("../utils/cloudinaryUpload.js");

const isPdfFile = (file) =>
  file?.mimetype === "application/pdf" ||
  file?.originalname?.toLowerCase().endsWith(".pdf");

const buildDownloadUrl = (url) => url;

const formatUploadResult = (result, file) => {
  const originalName = file.originalname || "download";
  const isPdf = isPdfFile(file);

  return {
    // The Cloudinary helper must include .pdf in the raw public_id.
    url: result.secure_url,
    downloadUrl: isPdf
      ? buildDownloadUrl(result.secure_url, originalName)
      : result.secure_url,
    originalName,
    publicId: result.public_id,
    format: result.format,
    resourceType: result.resource_type,
    bytes: result.bytes,
  };
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
    originalName,
  );

  res.status(200).json(
    new ApiResponse(200, "File uploaded successfully", {
      ...formatUploadResult(result, req.file),
    }),
  );
});

exports.uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one file");
  }

  const folder = req.body.folder || "portfolio";

  console.log(
    "[uploadMultiple] incoming files:",
    req.files.map((file) => ({
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })),
  );

  const results = await Promise.all(
    req.files.map((file) =>
      cloudinaryUpload(file.buffer, folder, file.mimetype, file.originalname),
    ),
  );

  const uploadedFiles = results.map((result, index) =>
    formatUploadResult(result, req.files[index]),
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Files uploaded successfully", uploadedFiles));
});
