const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Web", "Mobile", "Desktop", "Cloud"],
      required: true,
    },

    icon: {
      type: String,
      default: "",
    },

    website: {
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

deploymentSchema.index({ platform: 1 });

module.exports = mongoose.model("Deployment", deploymentSchema);
