const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false, // Changed from true to false
    },

    // Add a user field for regular users
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    replacedByToken: {
      type: String,
      default: "",
    },

    createdByIp: {
      type: String,
      default: "",
    },

    revokedByIp: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ admin: 1 });
refreshTokenSchema.index({ user: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);