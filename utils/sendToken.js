const ApiResponse = require("./ApiResponse.js");
const generateAccessToken = require("./generateAccessToken.js");
const generateRefreshToken = require("./generateRefreshToken.js");

const sendToken = async (
  res,
  admin,
  statusCode = 200,
  message = "Success",
  ip = "",
  tokenOverrides = {}
) => {
  const accessToken = tokenOverrides.accessToken || generateAccessToken(admin);

  const refreshToken = tokenOverrides.refreshToken || await generateRefreshToken(admin, ip);

  const accessOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  };

  const refreshOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(statusCode)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(statusCode, message, {
        admin,
        accessToken,
        refreshToken,
      })
    );
};

module.exports = sendToken;
