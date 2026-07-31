const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const cloudinaryUpload = require("../utils/cloudinaryUpload.js");

exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a file");
  }

  const folder = req.body.folder || "portfolio";
  const result = await cloudinaryUpload(req.file.buffer, folder);

  res.status(200).json(
    new ApiResponse(200, "File uploaded successfully", {
      url: result.secure_url,
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
  
  const uploadPromises = req.files.map(file => 
    cloudinaryUpload(file.buffer, folder)
  );

  const results = await Promise.all(uploadPromises);

  const uploadedFiles = results.map(result => ({
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
  }));

  res.status(200).json(
    new ApiResponse(200, "Files uploaded successfully", uploadedFiles)
  );
});
