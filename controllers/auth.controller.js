const authService = require("../services/auth.service.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const sendToken = require("../utils/sendToken.js");

exports.register = asyncHandler(async (req, res) => {
  const admin = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, "Admin registered successfully", admin));
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const { admin, accessToken, refreshToken } = await authService.login(email, password, ipAddress);

  sendToken(res, admin, 200, "Login successful", ipAddress);
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(refreshToken);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const ipAddress = req.ip;
  const { admin, accessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken, ipAddress);
  sendToken(admin, accessToken, newRefreshToken || refreshToken, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "Admin profile fetched successfully", req.admin));
});
