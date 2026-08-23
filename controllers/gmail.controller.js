const crypto = require("crypto");
const GmailConnection = require("../models/GmailConnection.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const gmailService = require("../services/gmail.service.js");
const jobApplicationController = require("./jobApplication.controller.js");

const isProduction = process.env.NODE_ENV === "production";
const makeState = (adminId, accountLabel = "") => { const payload = Buffer.from(JSON.stringify({ adminId: String(adminId), accountLabel: String(accountLabel || ""), nonce: crypto.randomBytes(18).toString("hex") })).toString("base64url"); const signature = crypto.createHmac("sha256", process.env.JWT_SECRET || "gmail-state-secret").update(payload).digest("base64url"); return `${payload}.${signature}`; };
const readState = (state) => { const [payload, signature] = String(state || '').split('.'); if (!payload || !signature) throw new ApiError(400, "Invalid Gmail OAuth state"); const expected = crypto.createHmac("sha256", process.env.JWT_SECRET || "gmail-state-secret").update(payload).digest("base64url"); if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new ApiError(400, "Invalid Gmail OAuth state"); return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); };
exports.connect = asyncHandler(async (req, res) => {
  console.log("[GMAIL] connect start", {
    adminId: String(req.admin._id),
    accountLabel: String(req.query.accountLabel || ""),
    url: req.originalUrl,
  });

  const state = makeState(req.admin._id, req.query.accountLabel);
  res.cookie("gmailOAuthState", state, { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", maxAge: 10 * 60 * 1000 });
  console.log("[GMAIL] redirecting to Google OAuth");
  res.redirect(gmailService.getAuthUrl(state));
});

exports.callback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  console.log("[GMAIL] callback hit", {
    hasCode: Boolean(code),
    hasState: Boolean(state),
    hasCookie: Boolean(req.cookies?.gmailOAuthState),
    stateMatchesCookie: Boolean(state && req.cookies?.gmailOAuthState && state === req.cookies.gmailOAuthState),
    url: req.originalUrl,
  });

  if (!code || !state || state !== req.cookies.gmailOAuthState) throw new ApiError(400, "Invalid Gmail OAuth state");
  const { adminId, accountLabel } = readState(state);
  res.clearCookie("gmailOAuthState");
  const tokens = await gmailService.exchangeCode(code);
  console.log("[GMAIL] token exchange complete", {
    adminId: String(adminId),
    hasAccessToken: Boolean(tokens.access_token),
    hasRefreshToken: Boolean(tokens.refresh_token),
    scope: String(tokens.scope || ""),
  });
  if (!tokens.refresh_token) throw new ApiError(400, "Google did not return a refresh token; reconnect with consent");
  const temporary = await gmailService.saveConnection(adminId, tokens);
  const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!profileResponse.ok) throw new ApiError(502, "Unable to read Gmail profile");
  const profile = await profileResponse.json();
  const connection = await GmailConnection.findOneAndUpdate({ admin: adminId, gmailAddress: profile.emailAddress.toLowerCase() }, { admin: adminId, gmailAddress: profile.emailAddress.toLowerCase(), accountLabel, ...temporary, scope: tokens.scope || "" }, { upsert: true, new: true });
  const hasPrimary = await GmailConnection.exists({ admin: adminId, isPrimary: true });
  if (!hasPrimary) { connection.isPrimary = true; await connection.save(); }
  console.log("[GMAIL] connection saved", {
    adminId: String(adminId),
    gmailAddress: profile.emailAddress.toLowerCase(),
    isPrimary: Boolean(connection.isPrimary),
  });
  res.redirect(`${process.env.ADMIN_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/settings/gmail?connected=true`);
});
exports.status = asyncHandler(async (req, res) => { const connections = await GmailConnection.find({ admin: req.admin._id }).select("gmailAddress accountLabel isPrimary lastSyncAt autoSync createdAt updatedAt").sort({ isPrimary: -1, createdAt: 1 }); res.json(new ApiResponse(200, "Gmail connection status fetched successfully", { connected: connections.length > 0, connections })); });
exports.setPrimary = asyncHandler(async (req, res) => { const connection = await GmailConnection.findOne({ _id: req.params.id, admin: req.admin._id }); if (!connection) throw new ApiError(404, "Gmail connection not found"); await GmailConnection.updateMany({ admin: req.admin._id }, { $set: { isPrimary: false } }); connection.isPrimary = true; await connection.save(); res.json(new ApiResponse(200, "Primary Gmail account updated", connection)); });
exports.disconnect = asyncHandler(async (req, res) => { const filter = { admin: req.admin._id }; if (req.body.connectionId) filter._id = req.body.connectionId; await GmailConnection.deleteOne(filter); res.json(new ApiResponse(200, "Gmail account disconnected successfully", null)); });
exports.sync = (req, res, next) => jobApplicationController.syncGmail(req, res, next);
