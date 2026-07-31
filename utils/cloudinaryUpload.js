const cloudinary = require("cloudinary").v2;

const cloudinaryUpload = async (
  fileBuffer,
  folder = "portfolio"
) => {
  try {
    const base64 = `data:image/jpeg;base64,${fileBuffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = cloudinaryUpload;
