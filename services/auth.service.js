const Admin = require("../models/Admin.js");
const ApiError = require("../utils/ApiError.js");
const generateAccessToken = require("../utils/generateAccessToken.js");
const generateRefreshToken = require("../utils/generateRefreshToken.js");
const RefreshToken = require("../models/RefreshToken.js");

class AuthService {
  async register(adminData) {
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new ApiError(400, "Admin with this email already exists");
    }

    const admin = await Admin.create(adminData);
    return admin;
  }

  async login(email, password, ipAddress) {
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Your account is deactivated");
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = await generateRefreshToken(admin, ipAddress);

    return { admin, accessToken, refreshToken: refreshToken.token };
  }

  async logout(refreshToken) {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (tokenDoc) {
      tokenDoc.revoked = true;
      tokenDoc.revokedAt = Date.now();
      await tokenDoc.save();
    }
  }

  async refreshAccessToken(refreshToken, ipAddress) {
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
    });

    if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const admin = await Admin.findById(tokenDoc.admin);
    if (!admin || !admin.isActive) {
      throw new ApiError(401, "Admin not found or inactive");
    }

    const accessToken = generateAccessToken(admin);
    
    // Optionally rotate refresh token
    tokenDoc.revoked = true;
    tokenDoc.revokedAt = Date.now();
    await tokenDoc.save();

    const newRefreshToken = await generateRefreshToken(admin, ipAddress);

    return { admin, accessToken, refreshToken: newRefreshToken.token };
  }
}

module.exports = new AuthService();
