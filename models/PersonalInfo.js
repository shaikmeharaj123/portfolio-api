const mongoose = require("mongoose");

const personalInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    resumeName: {
      type: String,
      default: "",
      trim: true,
    },

    seoTitle: {
      type: String,
      trim: true,
      default: "",
    },

    seoDescription: {
      type: String,
      trim: true,
      default: "",
    },

    seoKeywords: {
      type: String,
      trim: true,
      default: "",
    },

    ogImage: {
      type: String,
      trim: true,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

personalInfoSchema.index({ email: 1 });

module.exports = mongoose.model("PersonalInfo", personalInfoSchema);
