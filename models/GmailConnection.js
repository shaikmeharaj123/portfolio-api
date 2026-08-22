const mongoose = require("mongoose");

const gmailConnectionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, unique: true },
  gmailAddress: { type: String, trim: true, lowercase: true, required: true },
  encryptedAccessToken: { type: String, required: true, select: false },
  encryptedRefreshToken: { type: String, required: true, select: false },
  tokenExpiryDate: { type: Date },
  scope: { type: String, default: "" },
  lastSyncAt: { type: Date },
  historyId: { type: String, default: "" },
  autoSync: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

gmailConnectionSchema.index({ admin: 1 });
module.exports = mongoose.model("GmailConnection", gmailConnectionSchema);
