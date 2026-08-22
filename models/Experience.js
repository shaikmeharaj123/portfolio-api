const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    period: {
      type: String,
      required: true,
    },

    current: {
      type: Boolean,
      default: false,
    },

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

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

experienceSchema.index({
  company: 1,
  current: 1,
});

module.exports = mongoose.model("Experience", experienceSchema);
