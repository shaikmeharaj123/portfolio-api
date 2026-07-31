const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    issuer: {
      type: String,
      required: true,
    },

    issueDate: Date,

    expiryDate: Date,

    credentialId: {
      type: String,
      default: "",
    },

    credentialUrl: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    skills: [
      {
        type: String,
      },
    ],

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

module.exports = mongoose.model("Certification", certificationSchema);
