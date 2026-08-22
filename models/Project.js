const mongoose = require("mongoose");
const slugify = require("slugify");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    tagline: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    stack: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      default: "#000000",
    },

    icon: {
      type: String,
      default: "🚀",
    },

    panels: [
      {
        type: String,
      },
    ],

    github: {
      type: String,
      default: "",
    },

    live: {
      type: String,
      default: "",
    },

    playStore: {
      type: String,
      default: "",
    },

    figma: {
      type: String,
      default: "",
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

    images: [
      {
        type: String,
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Completed", "In Progress"],
      default: "Completed",
    },

    year: Number,

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

projectSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

});


projectSchema.index({
  category: 1,
});

module.exports = mongoose.model("Project", projectSchema);
