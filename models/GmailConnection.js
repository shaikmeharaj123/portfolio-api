const mongoose = require("mongoose");

const gmailConnectionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  gmailAddress: { type: String, trim: true, lowercase: true, required: true },
  accountLabel: { type: String, trim: true, default: "" },
  isPrimary: { type: Boolean, default: false },
  encryptedAccessToken: { type: String, required: true, select: false },
  encryptedRefreshToken: { type: String, required: true, select: false },
  tokenExpiryDate: { type: Date },
  scope: { type: String, default: "" },
  lastSyncAt: { type: Date },
  historyId: { type: String, default: "" },
  autoSync: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

gmailConnectionSchema.index({ admin: 1, gmailAddress: 1 }, { unique: true });
 gmailConnectionSchema.index({ admin: 1, isPrimary: 1 });
module.exports = mongoose.model("GmailConnection", gmailConnectionSchema);
