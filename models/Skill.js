const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"],
      default: "Other",
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },

    icon: {
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

skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model("Skill", skillSchema);
