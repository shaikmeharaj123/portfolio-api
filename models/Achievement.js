const mongoose = require("mongoose");
const slugify = require("slugify");

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    icon: {
      type: String,
      default: "🏆",
    },

    year: {
      type: Number,
      min: 2000,
      max: 2100,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
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

achievementSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }
});


module.exports = mongoose.model("Achievement", achievementSchema);
