const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

socialLinkSchema.index({
  platform: 1,
});

module.exports = mongoose.model("SocialLink", socialLinkSchema);
