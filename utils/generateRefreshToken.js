const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");

const generateRefreshToken = async (admin, ip = "") => {
  // Check if admin already has a valid, non-revoked refresh token
  const existingToken = await RefreshToken.findOne({
    admin: admin._id,
    revoked: false,
    expiresAt: { $gt: new Date() } // Only if not expired
  });

  // If exists and not expired, return the existing token
  if (existingToken) {
    // Update IP if changed
    if (existingToken.createdByIp !== ip && ip) {
      await RefreshToken.findByIdAndUpdate(existingToken._id, {
        createdByIp: ip
      });
    }
    return existingToken.token;
  }

  // Revoke any old tokens for this admin
  await RefreshToken.updateMany(
    { admin: admin._id, revoked: false },
    { revoked: true }
  );

  // Generate new JWT refresh token
  const token = jwt.sign(
    {
      id: admin._id,
    },
    process.env.REFRESH_SECRET || 'your-refresh-secret',
    {
      expiresIn: process.env.REFRESH_EXPIRE || "7d",
    }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create new refresh token
  await RefreshToken.create({
    admin: admin._id,
    token,
    expiresAt,
    createdByIp: ip || "",
  });

  return token;
};

module.exports = generateRefreshToken;