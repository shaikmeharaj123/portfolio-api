const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");
const Admin = require("../models/Admin.js");

const authenticateRefreshToken = async (req, res, next) => {
  try {
    let token =
      req.body.refreshToken ||
      req.cookies?.refreshToken ||
      req.headers["x-refresh-token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET
    );

    const refreshToken = await RefreshToken.findOne({
      token,
      revoked: false,
    });

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid.",
      });
    }

    if (refreshToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled.",
      });
    }

    req.admin = admin;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token.",
    });
  }
};

module.exports = authenticateRefreshToken;
